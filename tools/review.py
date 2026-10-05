"""Wochen-Review: Signal-Bilanz aus der gesamten Historie.

Aufruf:  python3 tools/review.py [--coin BTC] [--json] [--kurz]
Für jedes Signal wird zu jedem Messzeitpunkt die Richtung bestimmt (long/short/neutral) und mit dem
späteren Kurs in 1, 4 und 24 Stunden verglichen. Gezählt werden nur nicht überlappende Fälle
(Abstand je Signal = Horizont: 1h-Test 1 Std., 4h-Test 4 Std., 24h-Test 24 Std.; seit 05.10.2026).
--kurz: eine Zeile Zwischenstand für den Morgencheck (nur lesen, keine Bewertung). Regeln: REVIEW.md.
"""
import json, sys, argparse
from datetime import datetime
from zoneinfo import ZoneInfo
from common import load_settings, load_snapshots, price_at, de_num, signal_dirs, compass, compass_dir, market_dirs

BER = ZoneInfo('Europe/Berlin')
ap = argparse.ArgumentParser()
ap.add_argument('--coin', default='BTC')
ap.add_argument('--json', action='store_true')
ap.add_argument('--kurz', action='store_true')
args = ap.parse_args()
coin = args.coin

cfg = load_settings()
thr = cfg.get('thresholds', {})
strong = thr.get('biasStrong', 0.65)
flow_thr = thr.get('flowSignificantUsd', 5e7)
HORIZONS = {'1h': 3600e3, '4h': 4 * 3600e3, '24h': 24 * 3600e3}
SPACING = dict(HORIZONS)  # Abstand zweier gezählter Fälle = Horizont (keine Überlappung je Horizont)
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


def signals(i):
    """Richtungen aller Signale plus Kompass – dieselbe Definition wie Dashboard und Morgencheck (tools/common.py).
    Dazu die Beobachtungs-Signale aus den Börsendaten (nicht im Kompass)."""
    s4 = at_or_before(i, 4 * 3600e3)
    d = signal_dirs(snaps[i], s4, cfg, coin)
    d['compass'] = compass_dir(compass(d, cfg), cfg)
    d.update(market_dirs(snaps[i], s4, cfg, coin))
    return {k: (v or 0) for k, v in d.items()}


OBS = cfg.get('beobachtung', {}).get('signals', {})
names = [k for k, v in cfg.get('signals', {}).items() if isinstance(v, dict) and k != 'takerFlow'] + list(OBS)
cases = {n: [] for n in names}
last_counted = {(n, h): -1e18 for n in names for h in HORIZONS}
for i, s in enumerate(snaps):
    d = signals(i)
    p0 = s['px'][coin]
    for n in names:
        v = d.get(n, 0)
        if not v:
            continue
        res = {}
        for h, ms in HORIZONS.items():
            if s['t'] - last_counted[(n, h)] < SPACING[h]:
                continue
            p1 = price_at(snaps, s['t'] + ms, coin)
            if p1:
                res[h] = (p1 / p0 - 1) * v
                last_counted[(n, h)] = s['t']
        if res:
            cases[n].append({'t': s['t'], 'dir': v, 'res': res})

# Vergleichswert: Wie oft stieg der Kurs überhaupt (nicht überlappend, Abstand = Horizont)?
base = {h: [0, 0] for h in HORIZONS}
lt = {h: -1e18 for h in HORIZONS}
for s in snaps:
    for h, ms in HORIZONS.items():
        if s['t'] - lt[h] < SPACING[h]:
            continue
        p1 = price_at(snaps, s['t'] + ms, coin)
        if p1:
            lt[h] = s['t']
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
with_mkt = [x for x in snaps if (x.get('mkt') or {}).get(coin)]
err_count = {}
for x in with_mkt:
    for e in (x['mkt'].get('_', {}).get('err') or []):
        k = e.split(':')[0]
        err_count[k] = err_count.get(k, 0) + 1
gaps = sum(1 for a, b in zip(snaps, snaps[1:]) if b['t'] - a['t'] > 30 * 60e3)
errs = sum(s.get('n', {}).get('err', 0) for s in snaps)
report = {
    'coin': coin, 'messungen': len(snaps), 'tage': round(span_days, 1), 'luecken': gaps, 'scanfehler': errs,
    'von': datetime.fromtimestamp(snaps[0]['t'] / 1000, BER).strftime('%d.%m.%Y %H:%M'),
    'bis': datetime.fromtimestamp(snaps[-1]['t'] / 1000, BER).strftime('%d.%m.%Y %H:%M'),
    'boersendaten': {'messungen': len(with_mkt), 'seit': datetime.fromtimestamp(with_mkt[0]['t'] / 1000, BER).strftime('%d.%m.%Y %H:%M') if with_mkt else None,
                     'haeufigste_ausfaelle': sorted(err_count.items(), key=lambda kv: -kv[1])[:5]},
    'vergleich_kurs_stieg': {h: (b[1] / b[0] if b[0] else None, b[0]) for h, b in base.items()},
    'signale': {n: {h: dict(stats(cases[n], h) or {}, urteil=verdict(stats(cases[n], h))) for h in HORIZONS} for n in names}
}

if args.json:
    print(json.dumps(report, ensure_ascii=False, indent=1))
    sys.exit(0)

pc = lambda v: '–' if v is None else de_num(v * 100) + ' %'

if args.kurz:
    # Zwischenstand für den Morgencheck: nur lesen, nichts bewerten oder ändern.
    vk = report['vergleich_kurs_stieg']
    def part(n, h):
        st = report['signale'][n][h]
        if not st.get('n'):
            return f'{h} – (n=0)'
        return f"{h} {pc(st['quote'])} (n={st['n']}, {st['long']}L/{st['short']}S; Markt {pc(vk[h][0])})"
    zeile = f"{coin} Zwischenstand Tag {de_num(span_days, 0)}/14 (unbewertet): Kompass " + ' · '.join(part('compass', h) for h in ('1h', '4h'))
    # Signale mit >= 30 Fällen, sortiert nach Abstand zum Markt-Vergleichswert; nur die zwei besten zeigen
    reif = []
    for n in names:
        for h in ('1h', '4h'):
            st = report['signale'][n][h]
            if st.get('n', 0) >= MIN_CASES and vk[h][0] is not None:
                lab = cfg['signals'][n].get('label', n) if n in cfg['signals'] else OBS[n].get('label', n)
                reif.append((st['quote'] - vk[h][0], f"{lab} {h} {pc(st['quote'])} vs. Markt {pc(vk[h][0])} (n={st['n']})"))
    reif.sort(key=lambda x: -x[0])
    print(zeile + (f" · {len(reif)}× ≥ 30 Fälle, vorn: " + '; '.join(x[1] for x in reif[:2]) if reif else ' · noch kein Signal mit ≥ 30 Fällen'))
    sys.exit(0)

print(f"## Signal-Bilanz {coin} · {report['von']} bis {report['bis']}")
print(f"Messungen: {report['messungen']} über {de_num(span_days, 1)} Tage · Lücken > 30 Min.: {gaps} · Scanfehler gesamt: {errs}")
bd = report['boersendaten']
print(f"Börsendaten (Beobachtung): {bd['messungen']} Messungen" + (f" seit {bd['seit']}" if bd['seit'] else '') + (' · häufigste Ausfälle: ' + ', '.join(f'{k} ({v}×)' for k, v in bd['haeufigste_ausfaelle']) if bd['haeufigste_ausfaelle'] else ''))
print('Vergleich (Kurs stieg, Abstand = Horizont): ' + ' · '.join(f"{h}: {pc(v[0])} (n={v[1]})" for h, v in report['vergleich_kurs_stieg'].items()))
print()
print('| Signal | Horizont | Fälle (L/S) | Trefferquote | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |')
print('|---|---|---|---|---|---|---|')
for n in names:
    if n in OBS:
        lab = OBS[n].get('label', n) + ' (Beobachtung)'
    else:
        lab = cfg['signals'][n].get('label', n) + ('' if cfg['signals'][n].get('active', True) else ' (inaktiv)')
    for h in HORIZONS:
        st = report['signale'][n][h]
        if not st.get('n'):
            print(f'| {lab} | {h} | 0 | – | – | – | zu wenig Daten |')
            continue
        print(f"| {lab} | {h} | {st['n']} ({st['long']}/{st['short']}) | {pc(st['quote'])} | {de_num(st['avg_move'] * 100, 2)} % | {pc(st['haelfte1'])} / {pc(st['haelfte2'])} | {st['urteil']} |")
print()
print(f'Hinweis: belastbar erst ab {MIN_CASES} Fällen; „bewährt“ = Trefferquote ≥ 56 % und beide Hälften > 50 %. Trefferquote immer mit dem Vergleichswert oben abgleichen (steigt der Markt ohnehin, sehen Long-Signale automatisch besser aus).')
