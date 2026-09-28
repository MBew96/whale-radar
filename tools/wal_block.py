"""Täglicher Wal-Block für den Morgencheck.

Aufruf:  python3 tools/wal_block.py [BTC ETH]
Ausgabe: JSON mit Zahlen und fertigen deutschen Kurzzeilen je Coin (Feld "zeilen").
Nur Signale mit active=true aus config/settings.json werden als Zeile ausgegeben.
"""
import json, sys, time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from common import load_settings, load_snapshots, side_share, magnets, de_usd, de_pct, de_num

BER = ZoneInfo('Europe/Berlin')
cfg = load_settings()
sig = {k: v.get('active', True) for k, v in cfg.get('signals', {}).items() if isinstance(v, dict)}
thr = cfg.get('thresholds', {})
strong = thr.get('biasStrong', 0.65)
flow_thr = thr.get('flowSignificantUsd', 5e7)
coins = sys.argv[1:] or ['BTC', 'ETH']

now_ms = time.time() * 1000
snaps = load_snapshots(now_ms - 30 * 3600e3)
out = {'erstellt': datetime.now(BER).strftime('%Y-%m-%d %H:%M'), 'coins': {}}
if not snaps:
    out['fehler'] = 'Keine Messungen der letzten 30 Stunden im Repo gefunden.'
    print(json.dumps(out, ensure_ascii=False, indent=1))
    sys.exit(0)

last = snaps[-1]
day24 = [s for s in snaps if s['t'] >= now_ms - 24 * 3600e3]
gaps = sum(1 for a, b in zip(day24, day24[1:]) if b['t'] - a['t'] > 30 * 60e3)
out['datenlage'] = {
    'letzte_messung': datetime.fromtimestamp(last['t'] / 1000, BER).strftime('%d.%m. %H:%M'),
    'messungen_24h': len(day24), 'luecken_ueber_30min': gaps,
    'erste_messung_ueberhaupt': datetime.fromtimestamp(snaps[0]['t'] / 1000, BER).strftime('%d.%m. %H:%M')
}

# Referenz "gestern 22 Uhr" (deutsche Zeit)
now_b = datetime.now(BER)
ref22 = (now_b - timedelta(days=1)).replace(hour=22, minute=0, second=0, microsecond=0)
if now_b.hour >= 22:
    ref22 = now_b.replace(hour=22, minute=0, second=0, microsecond=0)


def nearest(t_ms):
    c = min(snaps, key=lambda s: abs(s['t'] - t_ms))
    return c if abs(c['t'] - t_ms) <= 40 * 60e3 else None


for coin in coins:
    k = last.get('coins', {}).get(coin)
    if not k:
        continue
    px = last['px'].get(coin)
    r = {'kurs': px}
    b_all, b_win, b_lose = side_share(k['all']), side_share(k['win']), side_share(k['lose'])
    r['bias'] = {'alle': b_all, 'gewinner': b_win, 'verlierer': b_lose}
    r['notional'] = {'long': k['all']['L'][0], 'short': k['all']['S'][0]}
    zeilen = []

    if sig.get('biasAll', True) and b_all is not None:
        sh = b_all if b_all >= 0.5 else 1 - b_all
        zeilen.append(f"Wale {de_num(sh * 100)} % {'long' if b_all >= 0.5 else 'short'} (Long {de_usd(k['all']['L'][0])} / Short {de_usd(k['all']['S'][0])})" + (', deutliche Schieflage' if sh >= strong else ''))
    if sig.get('biasWinners', True) and b_win is not None:
        diff = (b_win - b_all) if b_all is not None else 0
        zeilen.append(f"Gewinner-Wale {de_num((b_win if b_win >= 0.5 else 1 - b_win) * 100)} % {'long' if b_win >= 0.5 else 'short'}" + (' – anders als die Masse' if abs(diff) >= 0.15 else ''))
    if sig.get('biasLosersFade', True) and b_lose is not None and (b_lose >= strong or b_lose <= 1 - strong):
        zeilen.append(f"Verlierer-Wale einseitig {de_num((b_lose if b_lose >= 0.5 else 1 - b_lose) * 100)} % {'long' if b_lose >= 0.5 else 'short'} (Gegenindikator)")

    flows = {}
    for name, t_ref in (('seit_22_uhr', ref22.timestamp() * 1000), ('24h', now_ms - 24 * 3600e3), ('4h', now_ms - 4 * 3600e3)):
        s0 = nearest(t_ref)
        if s0 and s0.get('coins', {}).get(coin) and s0 is not last:
            k0 = s0['coins'][coin]['all']
            flows[name] = {'dL': k['all']['L'][0] - k0['L'][0], 'dS': k['all']['S'][0] - k0['S'][0], 'px_vorher': s0['px'].get(coin)}
    r['fluss'] = flows
    if sig.get('flow4h', True) and flows:
        key = 'seit_22_uhr' if 'seit_22_uhr' in flows else ('24h' if '24h' in flows else '4h')
        f = flows[key]
        net = f['dL'] - f['dS']
        lab = {'seit_22_uhr': 'Seit 22 Uhr', '24h': 'In 24 Std.', '4h': 'In 4 Std.'}[key]
        zeilen.append(f"{lab}: Longs {de_usd(f['dL'], True)}, Shorts {de_usd(f['dS'], True)}" + (f" – netto {'bullisch' if net > 0 else 'bärisch'}" if abs(net) >= flow_thr else ' – kein großer Umschwung'))

    st = k.get('stress', {'L': [0, 0, 0], 'S': [0, 0, 0]})
    r['druck'] = {'long_nahe_liq': st['L'][0], 'short_nahe_liq': st['S'][0], 'long_im_minus': st['L'][1], 'short_im_minus': st['S'][1]}
    if sig.get('squeezeRisk', True):
        said = False
        tot = k['all']['L'][0] + k['all']['S'][0]
        for side, name, dirw in (('S', 'Short', 'nach oben'), ('L', 'Long', 'nach unten')):
            ntl = k['all'][side][0]
            if tot and ntl / tot >= 0.6 and ntl and st[side][1] / ntl >= 0.5 and st[side][0] / ntl >= 0.1:
                zeilen.append(f"Erhöhtes {name}-Squeeze-Risiko {dirw}: {de_num(st[side][1] / ntl * 100)} % der {name}s im Minus, {de_usd(st[side][0])} nahe Liquidation")
                said = True
        if not said:
            zeilen.append(f"Kein auffälliges Squeeze-Risiko (nahe Liq.: Long {de_usd(st['L'][0])}, Short {de_usd(st['S'][0])})")

    mg = magnets(last, coin, thr.get('magnetMinShareOfMax', 0.25))
    r['magnete'] = mg
    if sig.get('liqMagnet', True) and mg and (mg['oben'] or mg['unten']):
        fm = lambda x: f"{de_num(x['lo'])}–{de_num(x['hi'])} ({de_pct(x['dist'])}, {de_usd(x['usd'])})" if x else 'keiner'
        zeilen.append(f"Liquiditätsmagnete: oben {fm(mg['oben'])} · unten {fm(mg['unten'])}")

    r['zeilen'] = zeilen
    out['coins'][coin] = r

print(json.dumps(out, ensure_ascii=False, indent=1))
