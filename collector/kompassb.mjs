// Kompass B (Beobachtung) für das Dashboard – dieselben Regeln wie tools/common.py (relative_dirs, signal_dirs: flow4h, liqMagnet)
// und dieselbe Auswahl der Vergleichs-Messung wie tools/review.py (at_or_before).
// Bild: Nicht „Steht die Nadel auf Long?“, sondern „Steht sie longiger als sonst?“ – wie Fieber messen statt Temperatur.
// Seit 20.10.2026 mit Mircos OK im Dashboard sichtbar, nur als Beobachtung, nicht im Live-Kompass.

const share = k => { const t = k.L[0] + k.S[0]; return t ? k.L[0] / t : null; };

function liqWithin(s, coin, pct) {
  const k = s.coins[coin], bw = (s.bp || 0.5) / 100;
  let lo = 0, up = 0;
  for (const x of k.liq || []) {
    if (x[0] < 0 && Math.abs((x[0] + 0.5) * bw) <= pct) lo += x[1];
    if (x[0] >= 0 && (x[0] + 0.5) * bw <= pct) up += x[2];
  }
  return [lo, up];
}

// snaps: Momentaufnahmen (beliebig, werden gefiltert und sortiert) · fromT: nur Punkte ab dieser Zeit ausgeben
// Rückgabe: [[t, score, Richtung, relWinners, relLosersFade, relAll, flow4h, liqMagnet], …]; null = keine Daten
export function kompassB(allSnaps, cfg, coin, fromT) {
  const snaps = allSnaps.filter(s => s.coins && s.coins[coin] && s.px && s.px[coin]).sort((a, b) => a.t - b.t);
  const thr = cfg.thresholds || {}, r = (cfg.beobachtung || {}).relativ || {};
  const winMs = (r.fensterStd ?? 72) * 3600e3, minMs = (r.minStd ?? 24) * 3600e3, gap = r.abstand ?? 0.05, m = r.kompassMin ?? 0.34;
  const ft = thr.flowSignificantUsd ?? 5e7, near = thr.magnetNearPct ?? 0.03, minShare = thr.magnetMinShareOfTotal ?? 0.01;
  const out = [];
  for (let i = 0; i < snaps.length; i++) {
    const s = snaps[i], t = s.t;
    if (t < fromT) continue;
    // Vorlauf: mindestens minStd seit der ersten geladenen Messung (der Collector lädt genug Tage, damit das immer erfüllt ist)
    if (t - snaps[0].t < minMs) { out.push([t, null, null, null, null, null, null, null]); continue; }
    const k = s.coins[coin];
    // relative Signale
    const hist = { win: [], lose: [], all: [] };
    for (let j = i - 1; j >= 0 && snaps[j].t >= t - winMs; j--) {
      const kj = snaps[j].coins[coin];
      for (const g of ['win', 'lose', 'all']) { const sh = kj[g] ? share(kj[g]) : null; if (sh != null) hist[g].push(sh); }
    }
    const rel = g => {
      const now = k[g] ? share(k[g]) : null, xs = hist[g].slice().sort((a, b) => a - b);
      if (now == null || xs.length < 20) return null;
      const med = xs[Math.floor(xs.length / 2)];
      return now - med >= gap ? 1 : (now - med <= -gap ? -1 : 0);
    };
    const rW = rel('win'), rl = rel('lose'), rLF = rl == null ? null : -rl, rA = rel('all');
    // Fluss 4 Std. (Vergleichs-Messung wie review.py at_or_before)
    const target = t - 4 * 3600e3; let j = i;
    while (j > 0 && snaps[j].t > target) j--;
    const s4 = Math.abs(snaps[j].t - target) <= 30 * 60e3 ? snaps[j] : null;
    let flow = null;
    if (s4) {
      const k0 = s4.coins[coin].all, net = (k.all.L[0] - k0.L[0]) - (k.all.S[0] - k0.S[0]);
      flow = net >= ft ? 1 : (net <= -ft ? -1 : 0);
    }
    // Liq.-Magnet
    const tot = k.all.L[0] + k.all.S[0], [lo, up] = liqWithin(s, coin, near);
    const mag = (!tot || Math.max(lo, up) < tot * minShare) ? 0 : (up >= 1.5 * lo ? 1 : (lo >= 1.5 * up ? -1 : 0));
    const parts = [rW, rLF, rA, flow, mag].filter(v => v != null);
    const sc = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
    const dir = sc == null ? null : (sc >= m ? 1 : (sc <= -m ? -1 : 0));
    out.push([t, sc == null ? null : Math.round(sc * 1000) / 1000, dir, rW, rLF, rA, flow, mag]);
  }
  return out;
}
