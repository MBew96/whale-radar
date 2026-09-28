"""Wochen-Review: Signal-Bilanz aus der gesamten Historie.

Aufruf:  python3 tools/review.py [--coin BTC] [--json]
Für jedes Signal wird zu jedem Messzeitpunkt die Richtung bestimmt (long/short/neutral) und mit dem
späteren Kurs in 1, 4 und 24 Stunden verglichen. Gezählt werden nur nicht überlappende Fälle
(mindestens 4 Std. Abstand je Signal). Regeln zur Bewertung: REVIEW.md.
"""
import json, sys, argparse
from datetime import datetime
from zoneinfo import ZoneInfo
from common import load_settings, load_snapshots, side_share, price_at, liq_within, de_num

BER = ZoneInfo('Europe/Berlin')
ap = argparse.ArgumentParser()
ap.add_argument('--coin', default='BTC')
ap.add_argument('--json', action='store_true')
args = ap.parse_args()
coin = args.coin

cfg = load_settings()
thr = cfg.get('thresholds', {})
strong = thr.get('biasStrong', 0.65)
flow_thr = thr.get('flowSignificantUsd', 5e7)
HORIZONS = {'1h': 3600e3, '4h': 4 * 3600e3, '24h': 24 * 3600e3}
SPACING = 4 * 3600e3
MIN_CASES = 30

snaps = [s for s in load_snapshots(0) if s.get('coins', {}).get(coin) and s.get('px', {}).get(coin)]
if len(snaps) < 2:
    print('Zu wenig Messungen für eine Auswertung.')
    sys.exit(0)


def at_or_before(i, ms):
    t = snaps[i]['t'] - ms
    j = i
    while j > 0 and snaps[j]['t'] > t:
        j -= 1
    return snaps[j] if abs(snaps[j]['t'] - t) <= 30 * 60e3 else None


def bias_dir(k):
    sh = side_share(k)
    if sh is None:
        return 0
    return 1 if sh >= strong else (-1 if sh <= 1 - strong else 0)


def signals(i):
    s = snaps[i]
    k = s['coins'][coin]
    d = {}
    d['biasAll'] = bias_dir(k['all'])
    d['biasWinners'] = bias_dir(k['win'])
    d['biasLosersFade'] = -bias_dir(k['lose'])
    s0 = at_or_before(i, 4 * 3600e3)
    if s0 and s0['coins'].get(coin):
        k0 = s0['coins'][coin]['all']
        net = (k['all']['L'][0] - k0['L'][0]) - (k['all']['S'][0] - k0['S'][0])
        d['flow4h'] = 1 if net >= flow_thr else (-1 if net <= -flow_thr else 0)
    else:
        d['flow4h'] = 0
    tot = k['all']['L'][0] + k['all']['S'][0]
    st = k.get('stress', {'L': [0, 0, 0], 'S': [0, 0, 0]})
    sq = 0
    for side, dirv in (('S', 1), ('L', -1)):
        ntl = k['all'][side][0]
        if tot and ntl and ntl / tot >= 0.6 and st[side][1] / ntl >= 0.5 and st[side][0] / ntl >= 0.1:
            sq = dirv
    d['squeezeRisk'] = sq
    lo, up = liq_within(s, coin, 0.03)
    d['liqMagnet'] = 1 if (up > 0 and up >= 1.5 * lo) else (-1 if (lo > 0 and lo >= 1.5 * up) else 0)
    return d


names = [k for k, v in cfg.get('signals', {}).items() if isinstance(v, dict) and k != 'takerFlow']
cases = {n: [] for n in names}
last_counted = {n: -1e18 for n in names}
for i, s in enumerate(snaps):
    d = signals(i)
    p0 = s['px'][coin]
    for n in names:
        v = d.get(n, 0)
        if not v or s['t'] - last_counted[n] < SPACING:
            continue
        res = {}
        for h, ms in HORIZONS.items():
            p1 = price_at(snaps, s['t'] + ms, coin)
            if p1:
                res[h] = (p1 / p0 - 1) * v
        if res:
            cases[n].append({'t': s['t'], 'dir': v, 'res': res})
            last_counted[n] = s['t']

# Vergleichswert: Wie oft stieg der Kurs überhaupt (nicht überlappend, alle 4 Std.)?
base = {h: [0, 0] for h in HORIZONS}
lt = -1e18
for s in snaps:
    if s['t'] - lt < SPACING:
        continue
    lt = s['t']
    for h, ms in HORIZONS.items():
        p1 = price_at(snaps, s['t'] + ms, coin)
        if p1:
            base[h][0] += 1
            base[h][1] += 1 if p1 > s['px'][coin] else 0


def stats(lst, h):
    xs = [c for c in lst if h in c['res']]
    n = len(xs)
    if not n:
        return None
    hits = sum(1 for c in xs if c['res'][h] > 0)
    half = n // 2
    a, b = xs[:half], xs[half:]
    rate = lambda z: (sum(1 for c in z if c['res'][h] > 0) / len(z)) if z else None
    return {'n': n, 'quote': hits / n, 'avg_move': sum(c['res'][h] for c in xs) / n,
            'long': sum(1 for c in xs if c['dir'] > 0), 'short': sum(1 for c in xs if c['dir'] < 0),
            'haelfte1': rate(a), 'haelfte2': rate(b)}


def verdict(st):
    if not st or st['n'] < MIN_CASES:
        return 'zu wenig Daten'
    h1, h2 = st['haelfte1'], st['haelfte2']
    if st['quote'] >= 0.56 and h1 and h2 and h1 > 0.5 and h2 > 0.5:
        return 'bewährt'
    if st['quote'] <= 0.44 and h1 is not None and h2 is not None and h1 < 0.5 and h2 < 0.5:
        return 'Gegenindikator?'
    return 'unklar'


span_days = (snaps[-1]['t'] - snaps[0]['t']) / 864e5
gaps = sum(1 for a, b in zip(snaps, snaps[1:]) if b['t'] - a['t'] > 30 * 60e3)
errs = sum(s.get('n', {}).get('err', 0) for s in snaps)
report = {
    'coin': coin, 'messungen': len(snaps), 'tage': round(span_days, 1), 'luecken': gaps, 'scanfehler': errs,
    'von': datetime.fromtimestamp(snaps[0]['t'] / 1000, BER).strftime('%d.%m.%Y %H:%M'),
    'bis': datetime.fromtimestamp(snaps[-1]['t'] / 1000, BER).strftime('%d.%m.%Y %H:%M'),
    'vergleich_kurs_stieg': {h: (b[1] / b[0] if b[0] else None, b[0]) for h, b in base.items()},
    'signale': {n: {h: dict(stats(cases[n], h) or {}, urteil=verdict(stats(cases[n], h))) for h in HORIZONS} for n in names}
}

if args.json:
    print(json.dumps(report, ensure_ascii=False, indent=1))
    sys.exit(0)

pc = lambda v: '–' if v is None else de_num(v * 100) + ' %'
print(f"## Signal-Bilanz {coin} · {report['von']} bis {report['bis']}")
print(f"Messungen: {report['messungen']} über {de_num(span_days, 1)} Tage · Lücken > 30 Min.: {gaps} · Scanfehler gesamt: {errs}")
print('Vergleich (Kurs stieg, alle 4 Std. gezählt): ' + ' · '.join(f"{h}: {pc(v[0])} (n={v[1]})" for h, v in report['vergleich_kurs_stieg'].items()))
print()
print('| Signal | Horizont | Fälle (L/S) | Trefferquote | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |')
print('|---|---|---|---|---|---|---|')
for n in names:
    lab = cfg['signals'][n].get('label', n) + ('' if cfg['signals'][n].get('active', True) else ' (inaktiv)')
    for h in HORIZONS:
        st = report['signale'][n][h]
        if not st.get('n'):
            print(f'| {lab} | {h} | 0 | – | – | – | zu wenig Daten |')
            continue
        print(f"| {lab} | {h} | {st['n']} ({st['long']}/{st['short']}) | {pc(st['quote'])} | {de_num(st['avg_move'] * 100, 2)} % | {pc(st['haelfte1'])} / {pc(st['haelfte2'])} | {st['urteil']} |")
print()
print(f'Hinweis: belastbar erst ab {MIN_CASES} Fällen; „bewährt“ = Trefferquote ≥ 56 % und beide Hälften > 50 %. Trefferquote immer mit dem Vergleichswert oben abgleichen (steigt der Markt ohnehin, sehen Long-Signale automatisch besser aus).')
