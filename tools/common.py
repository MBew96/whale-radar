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


def magnets(snap, coin, share_of_max=0.25, max_dist=0.10):
    """Nächster großer Short-Liq.-Cluster über dem Kurs und Long-Liq.-Cluster darunter."""
    k = snap.get('coins', {}).get(coin)
    if not k:
        return None
    px = snap['px'].get(coin)
    bw = (snap.get('bp') or 0.5) / 100
    b = k.get('liq', [])
    max_l = max([x[1] for x in b] + [0])
    max_s = max([x[2] for x in b] + [0])
    above = [x for x in b if x[0] >= 0 and x[2] > 0 and x[2] >= max_s * share_of_max and (x[0] + 0.5) * bw <= max_dist]
    below = [x for x in b if x[0] < 0 and x[1] > 0 and x[1] >= max_l * share_of_max and abs((x[0] + 0.5) * bw) <= max_dist]
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
