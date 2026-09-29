// Whale Radar – Wetterstation
// Läuft alle 10 Minuten als GitHub Action. Holt das Hyperliquid-Leaderboard, scannt die
// größten Wallets, speichert eine kompakte Momentaufnahme in data/history/ und baut die
// Website (_site/) mit latest.json (Stand jetzt) und recent.json (Verlauf 48 Std.).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectMarkets } from './markets.mjs';

const API = process.env.HL_API || 'https://api.hyperliquid.xyz/info';
const LB_URL = process.env.HL_LB || 'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = +process.env.NOW_MS || Date.now();
const cfg = JSON.parse(await fs.readFile(path.join(ROOT, 'config/settings.json'), 'utf8'));
const C = cfg.collector;
// Marktdaten der großen Börsen (Beobachtungsmodus) laufen parallel zur Wal-Messung und bremsen sie nie
const mktP = (C.marketCoins && C.marketCoins.length ? collectMarkets(C.marketCoins, NOW) : Promise.resolve(null))
  .catch(e => ({ _: { err: [String(e.message || e).slice(0, 90)] } }));
const watch = JSON.parse(await fs.readFile(path.join(ROOT, 'config/watchlist.json'), 'utf8').catch(() => '[]')).map(a => String(a).toLowerCase());

const sleep = ms => new Promise(r => setTimeout(r, ms));
const r0 = v => Math.round(v);
const r2 = v => Math.round(v * 100) / 100;
const sig = (v, d = 5) => (v === 0 || !isFinite(v)) ? 0 : +Number(v).toPrecision(d);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/* ---------- Rate-Limit (Hyperliquid: 1200 Gewicht/Minute pro IP) ---------- */
let tokens = 150, last = Date.now();
async function take(w) {
  for (;;) {
    const n = Date.now();
    tokens = Math.min(150, tokens + (n - last) * C.weightPerMin / 60000); last = n;
    if (tokens >= w) { tokens -= w; return; }
    await sleep((w - tokens) * 60000 / C.weightPerMin + 20);
  }
}
async function info(body, w) {
  for (let i = 0; i < 5; i++) {
    await take(w);
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.status === 429) { log('429 – warte'); tokens = 0; await sleep(8000 * (i + 1)); continue; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (i === 4) throw e;
      await sleep(1500 * (i + 1));
    }
  }
}

/* ---------- 1. Leaderboard -> Kandidaten ---------- */
log('Lade Leaderboard …');
const lbRes = await fetch(LB_URL);
if (!lbRes.ok) throw new Error('Leaderboard HTTP ' + lbRes.status);
const lbJson = await lbRes.json();
const P = [];
for (const x of (lbJson.leaderboardRows || [])) {
  const w = {}; for (const [k, v] of (x.windowPerformances || [])) w[k] = v;
  if (!w.month || !w.week || !w.day || !w.allTime) continue;
  P.push({ a: String(x.ethAddress).toLowerCase(), name: x.displayName || null, av: +x.accountValue, pd: +w.day.pnl, pw: +w.week.pnl, pm: +w.month.pnl, pa: +w.allTime.pnl, vw: +w.week.vlm, vm: +w.month.vlm });
}
log('Leaderboard:', P.length, 'Trader');
const minAv = C.minAccountValueForVolumeAndPnlLists;
const A = P.filter(x => x.vm > 0).sort((a, b) => b.av - a.av).slice(0, C.candidatesByCapital);
const B = P.filter(x => x.av >= minAv).sort((a, b) => b.vw - a.vw).slice(0, C.candidatesByWeekVolume);
const Cc = P.filter(x => x.av >= minAv).sort((a, b) => Math.abs(b.pw) - Math.abs(a.pw)).slice(0, C.candidatesByWeekPnl);
const cand = new Map();
const lbIdx = new Map(P.map(x => [x.a, x]));
for (const [src, L] of [['K', A], ['V', B], ['P', Cc]]) for (const x of L) { const c = cand.get(x.a) || { lb: x, src: '' }; if (!c.src.includes(src)) c.src += src; cand.set(x.a, c); }
for (const a of watch) { const c = cand.get(a) || { lb: lbIdx.get(a) || null, src: '' }; c.src += 'W'; cand.set(a, c); }
log('Kandidaten:', cand.size);

/* ---------- 2. Marktdaten ---------- */
const [meta, ctxs] = await info({ type: 'metaAndAssetCtxs' }, 20);
const ctx = {};
meta.universe.forEach((u, i) => { const c = ctxs[i]; if (!c || u.isDelisted) return; ctx[u.name] = { mark: +c.markPx, prev: +c.prevDayPx, f: +c.funding, oi: +c.openInterest, vol: +c.dayNtlVlm }; });
const mark = c => (ctx[c] && ctx[c].mark) || 0;

/* ---------- 3. Wallets scannen ---------- */
const list = [...cand.entries()];
const wallets = [];
let idx = 0, errs = 0;
async function worker() {
  while (idx < list.length) {
    const [a, c] = list[idx++];
    try {
      const st = await info({ type: 'clearinghouseState', user: a }, 2);
      wallets.push({ a, c, st });
    } catch (e) { errs++; }
  }
}
const t0 = Date.now();
await Promise.all(Array.from({ length: C.concurrency }, worker));
log('Gescannt:', wallets.length, 'Fehler:', errs, 'Dauer:', Math.round((Date.now() - t0) / 1000), 's');

/* ---------- 4. Auswerten ---------- */
const K = cfg.classes, MM = cfg.marketMaker, nearPct = cfg.stress.nearLiqPct / 100;
function classify(lb) {
  if (!lb) return 'x';
  if (lb.pm > K.winner.pnlMonthMin && lb.pa > K.winner.pnlAllMin) return 'w';
  if (lb.pm < K.loser.pnlMonthMax && lb.pa < K.loser.pnlAllMax) return 'l';
  return 'x';
}
const W = [];
for (const { a, c, st } of wallets) {
  const pos = [];
  for (const ap of (st.assetPositions || [])) {
    const p = ap.position; const s = +p.szi; if (!s) continue;
    const m = mark(p.coin) || +p.entryPx;
    pos.push({ coin: p.coin, szi: s, entry: +p.entryPx, lev: (p.leverage && p.leverage.value) || 0, iso: (p.leverage && p.leverage.type) === 'isolated' ? 1 : 0, liq: p.liquidationPx == null ? null : +p.liquidationPx, margin: +p.marginUsed, fund: -(+((p.cumFunding && p.cumFunding.sinceOpen) || 0)), ntl: Math.abs(s) * m, m });
  }
  const lb = c.lb;
  const turnover = lb ? lb.vm / Math.max(lb.av, 1) : 0;
  const isMM = turnover >= MM.turnoverMin && pos.length >= MM.minPositions;
  const ms = st.marginSummary || {};
  W.push({ a, src: c.src, lb, cls: classify(lb), mm: isMM, eq: +ms.accountValue || 0, ntl: +ms.totalNtlPos || 0, free: +st.withdrawable || 0, pos });
}

function agg(rows) {
  const z = () => ({ ntl: 0, n: 0, sz: 0, cost: 0, up: 0, lw: 0 });
  const g = { L: z(), S: z() };
  for (const r of rows) { const x = g[r.p.szi > 0 ? 'L' : 'S']; x.ntl += r.p.ntl; x.n++; x.sz += Math.abs(r.p.szi); x.cost += Math.abs(r.p.szi) * r.p.entry; x.up += r.p.szi * (r.p.m - r.p.entry); x.lw += r.p.ntl * r.p.lev; }
  const out = {};
  for (const k of ['L', 'S']) { const x = g[k]; out[k] = [r0(x.ntl), x.n, x.sz ? sig(x.cost / x.sz, 6) : 0, r0(x.up), x.ntl ? r2(x.lw / x.ntl) : 0]; }
  return out;
}
function stress(rows) {
  const s = { L: [0, 0, 0], S: [0, 0, 0] }; // [nahe Liq. (USD), im Minus (USD), Anzahl nahe Liq.]
  for (const r of rows) {
    const k = r.p.szi > 0 ? 'L' : 'S'; const p = r.p;
    if (p.liq && Math.abs(p.liq - p.m) / p.m <= nearPct) { s[k][0] += p.ntl; s[k][2]++; }
    if (p.szi * (p.m - p.entry) < 0) s[k][1] += p.ntl;
  }
  return { L: s.L.map(r0), S: s.S.map(r0) };
}
function liqBuckets(rows, m) {
  const bw = C.liqBucketPct / 100, range = C.liqRangePct / 100, half = Math.round(range / bw);
  const b = new Map();
  for (const r of rows) {
    const p = r.p; if (!p.liq || !(p.liq > 0)) continue;
    const d = (p.liq - m) / m; if (Math.abs(d) > range) continue;
    const i = Math.max(-half, Math.min(half - 1, Math.floor(d / bw)));
    const x = b.get(i) || [i, 0, 0]; if (p.szi > 0) x[1] += p.ntl; else x[2] += p.ntl; b.set(i, x);
  }
  return [...b.values()].sort((a, c) => a[0] - c[0]).map(x => [x[0], r0(x[1]), r0(x[2])]);
}

const coins = {};
const top = {};
for (const coin of C.mainCoins) {
  const m = mark(coin); if (!m) continue;
  const rows = [];
  for (const w of W) for (const p of w.pos) if (p.coin === coin) rows.push({ w, p });
  const dir = rows.filter(r => !r.w.mm);
  coins[coin] = {
    all: agg(dir),
    win: agg(dir.filter(r => r.w.cls === 'w')),
    lose: agg(dir.filter(r => r.w.cls === 'l')),
    mm: agg(rows.filter(r => r.w.mm)),
    stress: stress(dir),
    liq: liqBuckets(dir, m)
  };
  top[coin] = dir.sort((x, y) => y.p.ntl - x.p.ntl).slice(0, C.topPositionsPerCoin)
    .map(r => [r.w.a, sig(r.p.szi, 6), sig(r.p.entry, 6), r.p.lev, r.p.liq ? sig(r.p.liq, 6) : null, r.w.cls]);
}

const px = {}, cx = {};
const topCoins = Object.keys(ctx).sort((a, b) => (ctx[b].vol || 0) - (ctx[a].vol || 0)).slice(0, 40);
for (const c of topCoins) px[c] = sig(ctx[c].mark, 6);
for (const c of C.mainCoins) if (ctx[c]) cx[c] = { f: ctx[c].f, oi: sig(ctx[c].oi, 6), vol: r0(ctx[c].vol), prev: sig(ctx[c].prev, 6) };

const mkt = await Promise.race([mktP, new Promise(r => setTimeout(r, 30000, null).unref())]);  // höchstens 30 s warten
const snap = { v: 1, t: NOW, bp: C.liqBucketPct, n: { cand: cand.size, ok: wallets.length, err: errs, withPos: W.filter(w => w.pos.length).length }, px, ctx: cx, coins, top };
if (mkt) snap.mkt = mkt;

/* ---------- 5. Speichern ---------- */
const d = new Date(NOW);
const day = d.toISOString().slice(0, 10), hhmm = d.toISOString().slice(11, 16).replace(':', '');
const histDir = path.join(ROOT, 'data/history', day);
await fs.mkdir(histDir, { recursive: true });
await fs.writeFile(path.join(histDir, hhmm + '.json'), JSON.stringify(snap));
log('Momentaufnahme gespeichert:', day + '/' + hhmm + '.json');

// Website bauen
const SITE = path.join(ROOT, '_site');
await fs.rm(SITE, { recursive: true, force: true });
await fs.mkdir(path.join(SITE, 'data'), { recursive: true });
for (const f of await fs.readdir(path.join(ROOT, 'site'))) await fs.copyFile(path.join(ROOT, 'site', f), path.join(SITE, f));
await fs.copyFile(path.join(ROOT, 'config/settings.json'), path.join(SITE, 'data/settings.json'));

// latest.json: alle gescannten Wallets mit Positionen ab Mindestgröße (Startwert fürs Dashboard)
const minPos = C.minPositionUsdInLatest;
const latest = {
  v: 1, t: NOW, n: snap.n,
  ctx: Object.fromEntries(topCoins.map(c => [c, [sig(ctx[c].mark, 6), sig(ctx[c].prev, 6), ctx[c].f, sig(ctx[c].oi, 6), r0(ctx[c].vol)]])),
  w: W.map(w => [
    w.a, w.src, w.cls, w.mm ? 1 : 0, r0(w.eq), r0(w.ntl), r0(w.free),
    w.lb ? [r0(w.lb.av), r0(w.lb.pd), r0(w.lb.pw), r0(w.lb.pm), r0(w.lb.pa), r0(w.lb.vm), w.lb.name] : null,
    w.pos.filter(p => p.ntl >= minPos).map(p => [p.coin, sig(p.szi, 6), sig(p.entry, 6), p.lev, p.iso, p.liq == null ? null : sig(p.liq, 6), r0(p.margin), r0(p.fund)])
  ])
};
await fs.writeFile(path.join(SITE, 'data/latest.json'), JSON.stringify(latest));

// recent.json: Verlauf der letzten 48 Std. (Serien) + 24 Std. Liquidations-Heatmap
const days = [];
for (let i = 2; i >= 0; i--) days.push(new Date(NOW - i * 864e5).toISOString().slice(0, 10));
const snaps = [];
for (const dd of days) {
  const dir = path.join(ROOT, 'data/history', dd);
  let files = []; try { files = (await fs.readdir(dir)).filter(f => f.endsWith('.json')).sort(); } catch (e) { continue; }
  for (const f of files) { try { const s = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); if (NOW - s.t <= 48 * 3600e3) snaps.push(s); } catch (e) {} }
}
snaps.sort((a, b) => a.t - b.t);
const series = {}, heat = {};
for (const coin of C.mainCoins) {
  series[coin] = snaps.filter(s => s.coins && s.coins[coin]).map(s => {
    const k = s.coins[coin];
    return [s.t, s.px[coin] || 0, k.all.L[0], k.all.S[0], k.win.L[0], k.win.S[0], k.lose.L[0], k.lose.S[0], k.stress.L[0], k.stress.S[0], k.stress.L[1], k.stress.S[1]];
  });
  heat[coin] = snaps.filter(s => s.coins && s.coins[coin] && NOW - s.t <= 24 * 3600e3).map(s => [s.t, s.px[coin] || 0, s.coins[coin].liq, s.bp || 0.5]);
}
const recent = { v: 1, t: NOW, cols: ['t', 'px', 'allL', 'allS', 'winL', 'winS', 'loseL', 'loseS', 'nearL', 'nearS', 'underL', 'underS'], bucketPct: C.liqBucketPct, series, heat };
await fs.writeFile(path.join(SITE, 'data/recent.json'), JSON.stringify(recent));
log('Website gebaut:', snaps.length, 'Momentaufnahmen im Verlauf');

// Kurzbericht in die Action-Zusammenfassung
const b = coins.BTC;
if (b && process.env.GITHUB_STEP_SUMMARY) {
  const tot = b.all.L[0] + b.all.S[0];
  const line = `BTC ${px.BTC} · Wale ${tot ? Math.round(b.all.L[0] / tot * 100) : 0} % long · Long $${(b.all.L[0] / 1e6).toFixed(1)} Mio. / Short $${(b.all.S[0] / 1e6).toFixed(1)} Mio. · ${snap.n.withPos} Wallets mit Positionen`;
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `### Whale Radar – Momentaufnahme\n${line}\n`);
  const m = mkt && mkt.BTC;
  if (m) {
    const oi = Object.values(m.oi || {}).reduce((a, v) => a + v, 0);
    const mline = `Börsen (Beobachtung): BTC-OI $${(oi / 1e9).toFixed(2)} Mrd. an ${Object.keys(m.oi || {}).length} Börsen · Coinbase-Premium ${m.cb != null ? (m.cb * 100).toFixed(3) + ' %' : '–'} · Ausfälle: ${(mkt._.err || []).length}`;
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, mline + '\n' + ((mkt._.err || []).length ? '\n' + mkt._.err.map(e => '- ' + e).join('\n') + '\n' : ''));
  }
}
