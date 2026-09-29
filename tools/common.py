"""Gemeinsame Hilfsfunktionen für Wal-Block und Wochen-Review."""
import json, os, glob
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_settings():
    with open(os.path.join(ROOT, 'config', 'settings.json'), encoding='utf-8') as f:
        return json.load(f)


def load_snapshots(since_ms=0):
    """Alle Momentaufnahmen ab since_ms, zeitlich sortiert."""
    out = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'data', 'history', '*', '*.json'))):
        day = os.path.basename(os.path.dirname(path))
        try:
            day_ms = datetime.strptime(day, '%Y-%m-%d').replace(tzinfo=timezone.utc).timestamp() * 1000
        except ValueError:
            continue
        if day_ms + 86400e3 < since_ms:
            continue
        try:
            with open(path, encoding='utf-8') as f:
                s = json.load(f)
        except Exception:
            continue
        if s.get('t', 0) >= since_ms:
            out.append(s)
    out.sort(key=lambda s: s['t'])
    return out


def side_share(k):
    """Anteil Long am Notional aus {L:[ntl,…], S:[ntl,…]} (None, wenn leer)."""
    tot = k['L'][0] + k['S'][0]
    return k['L'][0] / tot if tot else None


def price_at(snaps, t, coin='BTC', tol_ms=15 * 60e3):
    """Preis der Momentaufnahme, die t am nächsten liegt (innerhalb tol_ms)."""
    best, bd = None, None
    lo, hi = 0, len(snaps) - 1
    while lo <= hi:  # binäre Suche
        mid = (lo + hi) // 2
        if snaps[mid]['t'] < t:
            lo = mid + 1
        else:
            hi = mid - 1
    for i in (lo - 1, lo):
        if 0 <= i < len(snaps):
            d = abs(snaps[i]['t'] - t)
            if bd is None or d < bd:
                best, bd = snaps[i], d
    if best is None or bd > tol_ms:
        return None
    return best.get('px', {}).get(coin)


def magnets(snap, coin, share_of_max=0.25, max_dist=0.10, share_of_total=0.01):
    """Nächster großer Short-Liq.-Cluster über dem Kurs und Long-Liq.-Cluster darunter.
    Ein Cluster zählt nur, wenn er mindestens share_of_max des größten Clusters seiner Seite
    UND mindestens share_of_total des gesamten Wal-Notionals (ohne Market-Maker) erreicht."""
    k = snap.get('coins', {}).get(coin)
    if not k:
        return None
    px = snap['px'].get(coin)
    bw = (snap.get('bp') or 0.5) / 100
    b = k.get('liq', [])
    tot = k['all']['L'][0] + k['all']['S'][0]
    min_usd = tot * share_of_total
    max_l = max([x[1] for x in b] + [0])
    max_s = max([x[2] for x in b] + [0])
    above = [x for x in b if x[0] >= 0 and x[2] > 0 and x[2] >= max(max_s * share_of_max, min_usd) and (x[0] + 0.5) * bw <= max_dist]
    below = [x for x in b if x[0] < 0 and x[1] > 0 and x[1] >= max(max_l * share_of_max, min_usd) and abs((x[0] + 0.5) * bw) <= max_dist]
    f = lambda x, v: {'lo': px * (1 + x[0] * bw), 'hi': px * (1 + (x[0] + 1) * bw), 'dist': (x[0] + 0.5) * bw, 'usd': v}
    up = min(above, key=lambda x: x[0]) if above else None
    dn = max(below, key=lambda x: x[0]) if below else None
    return {'px': px, 'oben': f(up, up[2]) if up else None, 'unten': f(dn, dn[1]) if dn else None}


def liq_within(snap, coin, pct):
    """Summe Long-Liq. unter dem Kurs und Short-Liq. über dem Kurs innerhalb ±pct."""
    k = snap.get('coins', {}).get(coin)
    if not k:
        return 0, 0
    bw = (snap.get('bp') or 0.5) / 100
    lo = sum(x[1] for x in k.get('liq', []) if x[0] < 0 and abs((x[0] + 0.5) * bw) <= pct)
    up = sum(x[2] for x in k.get('liq', []) if x[0] >= 0 and (x[0] + 0.5) * bw <= pct)
    return lo, up


# ---------- Signale und Kompass (identisch im Dashboard: site/index.html, Funktion stationSignals) ----------
COMPASS_EXCLUDE = ('compass', 'takerFlow')


def signal_dirs(s, s4, cfg, coin):
    """Richtung je Signal: +1 long, -1 short, 0 neutral, None = keine Daten.
    s = Momentaufnahme, s4 = Momentaufnahme etwa 4 Std. davor (oder None)."""
    thr = cfg.get('thresholds', {})
    strong = thr.get('biasStrong', 0.65)
    k = s['coins'][coin]

    def bias(x):
        sh = side_share(x)
        if sh is None:
            return None
        return 1 if sh >= strong else (-1 if sh <= 1 - strong else 0)

    d = {'biasAll': bias(k['all']), 'biasWinners': bias(k['win'])}
    bl = bias(k['lose'])
    d['biasLosersFade'] = None if bl is None else -bl
    if s4 and s4.get('coins', {}).get(coin):
        k0 = s4['coins'][coin]['all']
        net = (k['all']['L'][0] - k0['L'][0]) - (k['all']['S'][0] - k0['S'][0])
        ft = thr.get('flowSignificantUsd', 5e7)
        d['flow4h'] = 1 if net >= ft else (-1 if net <= -ft else 0)
    else:
        d['flow4h'] = None
    tot = k['all']['L'][0] + k['all']['S'][0]
    st = k.get('stress', {'L': [0, 0, 0], 'S': [0, 0, 0]})
    sq = 0
    for side, dv in (('S', 1), ('L', -1)):
        ntl = k['all'][side][0]
        if tot and ntl and ntl / tot >= 0.6 and st[side][1] / ntl >= 0.5 and st[side][0] / ntl >= 0.1:
            sq = dv
    d['squeezeRisk'] = sq if tot else None
    lo, up = liq_within(s, coin, thr.get('magnetNearPct', 0.03))
    if not tot or max(lo, up) < tot * thr.get('magnetMinShareOfTotal', 0.01):
        d['liqMagnet'] = 0
    else:
        d['liqMagnet'] = 1 if up >= 1.5 * lo else (-1 if lo >= 1.5 * up else 0)
    return d


def compass(d, cfg):
    """Gewichtete Summe der aktiven Signale, Ergebnis zwischen -1 (short) und +1 (long); None ohne Daten."""
    sig = cfg.get('signals', {})
    num = den = 0.0
    for k, v in d.items():
        m = sig.get(k)
        if k in COMPASS_EXCLUDE or v is None or not isinstance(m, dict) or not m.get('active', True):
            continue
        w = m.get('weight', 1)
        num += w * v
        den += w
    return (num / den) if den else None


def compass_dir(score, cfg):
    if score is None:
        return None
    t = cfg.get('thresholds', {}).get('compassMin', 0.34)
    return 1 if score >= t else (-1 if score <= -t else 0)

def de_num(v, d=0):
    s = f'{v:,.{d}f}'
    return s.replace(',', 'X').replace('.', ',').replace('X', '.')


def de_usd(v, sign=False):
    a = abs(v)
    s = '−' if v < 0 else ('+' if sign and v > 0 else '')
    if a >= 1e9:
        t = de_num(a / 1e9, 2) + ' Mrd.'
    elif a >= 1e6:
        t = de_num(a / 1e6, 0 if a >= 1e8 else 1) + ' Mio.'
    elif a >= 1e4:
        t = de_num(a / 1e3, 0) + ' Tsd.'
    else:
        t = de_num(a, 0)
    return f'{s}${t}'


def de_pct(v, d=1, sign=True):
    s = '+' if sign and v > 0 else ('−' if v < 0 else '')
    return f'{s}{de_num(abs(v) * 100, d)} %'
