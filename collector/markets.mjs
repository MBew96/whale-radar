// Whale Radar – Marktdaten der großen Börsen (Beobachtungsmodus, seit 29.09.2026)
// Ergänzt die Hyperliquid-Wale um den Rest des Marktes. Binance Futures und Bybit sperren die
// US-Rechner von GitHub (Quellen-Test 29.09.2026: HTTP 451/403), deshalb hier:
// OKX, Bitget, Gate, HTX, Deribit, Kraken (Derivate) · Coinbase + Binance Spot (Datenspiegel) ·
// CoinGecko (OI je Börse, auch Binance/Bybit gesamt) · Fear & Greed.
// Jede Quelle ist einzeln abgesichert: Fällt eine aus, fehlt nur ihr Wert (Liste in mkt._.err).
//
// Aufruf allein (Test):  node collector/markets.mjs [--debug] [BTC ETH]
import { fileURLToPath } from 'node:url';

const UA = { 'User-Agent': 'whale-radar/1.0 (+https://github.com/MBew96/whale-radar)', 'Accept': 'application/json' };
const DEBUG = process.argv.includes('--debug');
const RAW = {};

const num = v => { const x = typeof v === 'string' ? parseFloat(v) : v; return Number.isFinite(x) ? x : null; };
const sig = (v, d = 5) => v == null || !Number.isFinite(v) ? null : (v === 0 ? 0 : +Number(v).toPrecision(d));
const r0 = v => v == null || !Number.isFinite(v) ? null : Math.round(v);
const shareOf = ratio => ratio == null ? null : ratio / (1 + ratio);     // Verhältnis Long/Short -> Long-Anteil
const per8h = (rate, hours) => rate == null ? null : rate * 8 / (hours > 0 && hours <= 24 ? hours : 8);
const clean = o => { for (const k of Object.keys(o)) if (o[k] == null || (typeof o[k] === 'object' && !Array.isArray(o[k]) && !Object.keys(clean(o[k])).length)) delete o[k]; return o; };

async function get(url, label) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(9000) });
  const txt = await r.text();
  if (DEBUG) RAW[label] = txt.replace(/\s+/g, ' ').slice(0, 700);
  if (!r.ok) throw new Error(`${label}: HTTP ${r.status}`);
  return JSON.parse(txt);
}

export async function collectMarkets(coins = ['BTC', 'ETH'], now = Date.now()) {
  const err = [];
  const out = { _: {} };
  for (const c of coins) out[c] = { oi: {}, f: {}, ls: {}, tk: {}, liq: {}, px: {} };
  // Hilfsfunktion: eine Quelle abfragen, Fehler nur notieren
  const T = async (label, fn) => { try { await fn(); } catch (e) { err.push(String(e.message || e).slice(0, 90)); } };

  // 1) Referenzkurse: Binance Spot (Datenspiegel) und Coinbase, dazu USDT in USD
  let usdt = null;
  await Promise.all([
    T('cb USDT', async () => { const j = await get('https://api.exchange.coinbase.com/products/USDT-USD/ticker', 'cb USDT-USD'); usdt = (num(j.bid) + num(j.ask)) / 2 || null; }),
    ...coins.map(c => T('bn spot ' + c, async () => {
      const j = await get(`https://data-api.binance.vision/api/v3/ticker/bookTicker?symbol=${c}USDT`, 'bn book ' + c);
      out[c].px.bn = sig((num(j.bidPrice) + num(j.askPrice)) / 2, 7);
    })),
    ...coins.map(c => T('cb spot ' + c, async () => {
      const j = await get(`https://api.exchange.coinbase.com/products/${c}-USD/ticker`, 'cb ticker ' + c);
      out[c].px.cb = sig((num(j.bid) + num(j.ask)) / 2, 7);
    }))
  ]);
  out._.usdt = sig(usdt, 6);
  const ref = c => out[c].px.bn || out[c].px.cb || null;   // Kurs zum Umrechnen von Coins in USD

  const jobs = [];
  // 2) OKX – ein Aufruf für das OI aller Perps, dazu je Coin Funding, L/S, Taker, Liquidationen
  jobs.push(T('okx oi', async () => {
    const j = await get('https://www.okx.com/api/v5/public/open-interest?instType=SWAP', 'okx oi');
    for (const c of coins) {
      const rows = (j.data || []).filter(x => [`${c}-USDT-SWAP`, `${c}-USD-SWAP`, `${c}-USDC-SWAP`].includes(x.instId));
      if (rows.length) out[c].oi.okx = r0(rows.reduce((a, x) => a + (num(x.oiUsd) || 0), 0));
    }
  }));
  for (const c of coins) {
    const inst = `${c}-USDT-SWAP`, m = out[c];
    jobs.push(T('okx funding ' + c, async () => {
      const j = await get(`https://www.okx.com/api/v5/public/funding-rate?instId=${inst}`, 'okx funding ' + c);
      const x = j.data?.[0]; if (!x) return;
      const h = (num(x.nextFundingTime) - num(x.fundingTime)) / 3600e3;
      m.f.okx = sig(per8h(num(x.fundingRate), h), 4);
    }));
    jobs.push(T('okx acc ' + c, async () => {
      const j = await get(`https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=${c}&period=5m`, 'okx acc ' + c);
      m.ls.okxAcc = sig(shareOf(num(j.data?.[0]?.[1])), 4);
    }));
    jobs.push(T('okx top ' + c, async () => {
      const j = await get(`https://www.okx.com/api/v5/rubik/stat/contracts/long-short-position-ratio-contract-top-trader?instId=${inst}&period=5m`, 'okx top ' + c);
      m.ls.okxTop = sig(shareOf(num(j.data?.[0]?.[1])), 4);
    }));
    jobs.push(T('okx taker ' + c, async () => {
      // Antwort: [ts, sellVol, buyVol], neueste zuerst; Summe der letzten 12 × 5 Min. = 1 Std.
      const j = await get(`https://www.okx.com/api/v5/rubik/stat/taker-volume?ccy=${c}&instType=CONTRACTS&period=5m`, 'okx taker ' + c);
      const rows = (j.data || []).slice(0, 12);
      if (rows.length) m.tk.okx = [r0(rows.reduce((a, x) => a + num(x[2]), 0)), r0(rows.reduce((a, x) => a + num(x[1]), 0))];
    }));
    jobs.push(T('okx liq ' + c, async () => {
      const [ins, j] = await Promise.all([
        get(`https://www.okx.com/api/v5/public/instruments?instType=SWAP&instId=${inst}`, 'okx inst ' + c),
        get(`https://www.okx.com/api/v5/public/liquidation-orders?instType=SWAP&uly=${c}-USDT&state=filled`, 'okx liq ' + c)
      ]);
      const ct = num(ins.data?.[0]?.ctVal); if (!ct) return;
      let L = 0, S = 0;
      for (const d of j.data?.[0]?.details || []) {
        if (now - num(d.ts) > 10 * 60e3) continue;
        const usd = num(d.sz) * ct * num(d.bkPx);
        if (d.posSide === 'long') L += usd; else if (d.posSide === 'short') S += usd;
      }
      m.liq.okx = [r0(L), r0(S)];
    }));

    // 3) Bitget (USDT-Perps)
    const bg = `symbol=${c}USDT&productType=USDT-FUTURES`;
    jobs.push(T('bitget oi ' + c, async () => {
      const j = await get(`https://api.bitget.com/api/v2/mix/market/open-interest?${bg}`, 'bitget oi ' + c);
      const sz = num(j.data?.openInterestList?.[0]?.size);
      if (sz != null && ref(c)) m.oi.bitget = r0(sz * ref(c));
    }));
    jobs.push(T('bitget funding ' + c, async () => {
      const j = await get(`https://api.bitget.com/api/v2/mix/market/current-fund-rate?${bg}`, 'bitget funding ' + c);
      const x = j.data?.[0]; if (x) m.f.bitget = sig(per8h(num(x.fundingRate), num(x.fundingRateInterval)), 4);
    }));
    const newest = arr => (arr || []).reduce((a, x) => (!a || num(x.ts) > num(a.ts)) ? x : a, null);
    jobs.push(T('bitget acc ' + c, async () => {
      const j = await get(`https://api.bitget.com/api/v2/mix/market/account-long-short?symbol=${c}USDT&period=5m`, 'bitget acc ' + c);
      m.ls.bitgetAcc = sig(num(newest(j.data)?.longAccountRatio), 4);
    }));
    jobs.push(T('bitget pos ' + c, async () => {
      const j = await get(`https://api.bitget.com/api/v2/mix/market/position-long-short?symbol=${c}USDT&period=5m`, 'bitget pos ' + c);
      m.ls.bitgetPos = sig(num(newest(j.data)?.longPositionRatio), 4);
    }));

    // 4) Gate – Kontrakt-Statistik (5 Min.): OI, L/S nach Konten und Top-Tradern, Taker, Liquidationen
    jobs.push(T('gate stats ' + c, async () => {
      const j = await get(`https://api.gateio.ws/api/v4/futures/usdt/contract_stats?contract=${c}_USDT&interval=5m&limit=2`, 'gate stats ' + c);
      const rows = (Array.isArray(j) ? j : []).sort((a, b) => a.time - b.time);
      const x = rows[rows.length - 1]; if (!x) return;
      m.oi.gate = r0(num(x.open_interest_usd));
      m.ls.gateAcc = sig(shareOf(num(x.lsr_account)), 4);
      m.ls.gateTop = sig(shareOf(num(x.top_lsr_size)), 4);
      m.tk.gate = sig(num(x.lsr_taker), 4);
      m.liq.gate = [r0(rows.reduce((a, y) => a + (num(y.long_liq_usd) || 0), 0)), r0(rows.reduce((a, y) => a + (num(y.short_liq_usd) || 0), 0))];
    }));
    jobs.push(T('gate funding ' + c, async () => {
      const j = await get(`https://api.gateio.ws/api/v4/futures/usdt/contracts/${c}_USDT`, 'gate contract ' + c);
      m.f.gate = sig(per8h(num(j.funding_rate), num(j.funding_interval) / 3600), 4);
    }));

    // 5) HTX (USDT-Perps)
    jobs.push(T('htx ' + c, async () => {
      const [a, b] = await Promise.all([
        get(`https://api.hbdm.com/linear-swap-api/v1/swap_open_interest?contract_code=${c}-USDT`, 'htx oi ' + c),
        get(`https://api.hbdm.com/linear-swap-api/v1/swap_funding_rate?contract_code=${c}-USDT`, 'htx funding ' + c)
      ]);
      m.oi.htx = r0(num(a.data?.[0]?.value));
      m.f.htx = sig(num(b.data?.funding_rate), 4);
    }));

    // 6) Deribit – Futures (OI in USD, Funding 8 Std.) und Optionen (Put/Call)
    jobs.push(T('deribit fut ' + c, async () => {
      const j = await get(`https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${c}&kind=future`, 'deribit fut ' + c);
      const rows = j.result || [];
      if (rows.length) m.oi.deribit = r0(rows.reduce((a, x) => a + (num(x.open_interest) || 0), 0));
      const p = rows.find(x => x.instrument_name === `${c}-PERPETUAL`);
      if (p) m.f.deribit = sig(num(p.funding_8h), 4);
    }));
    jobs.push(T('deribit opt ' + c, async () => {
      const j = await get(`https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${c}&kind=option`, 'deribit opt ' + c);
      let pOi = 0, cOi = 0, pV = 0, cV = 0;
      for (const x of j.result || []) {
        const put = x.instrument_name.endsWith('-P');
        if (put) { pOi += num(x.open_interest) || 0; pV += num(x.volume) || 0; } else { cOi += num(x.open_interest) || 0; cV += num(x.volume) || 0; }
      }
      if (pOi + cOi) m.opt = { pc: sig(cOi ? pOi / cOi : null, 4), pcv: sig(cV ? pV / cV : null, 4), oi: r0(pOi + cOi) };
    }));

    // 7) Kraken Futures (PF_: 1 Kontrakt = 1 Coin)
    jobs.push(T('kraken ' + c, async () => {
      const j = await get(`https://futures.kraken.com/derivatives/api/v3/tickers/PF_${c === 'BTC' ? 'XBT' : c}USD`, 'kraken ' + c);
      const x = j.ticker; if (x) m.oi.kraken = r0(num(x.openInterest) * num(x.markPrice));
    }));

    // 8) Binance Spot: Taker-Käufe der letzten Stunde (12 × 5 Min.), Kline-Feld 7 = Quote-Volumen, 10 = Taker-Kauf-Quote
    jobs.push(T('bn taker ' + c, async () => {
      const j = await get(`https://data-api.binance.vision/api/v3/klines?symbol=${c}USDT&interval=5m&limit=12`, 'bn klines ' + c);
      if (Array.isArray(j) && j.length) m.tk.bnSpot = [r0(j.reduce((a, k) => a + num(k[10]), 0)), r0(j.reduce((a, k) => a + num(k[7]), 0))];
    }));
  }

  // 9) Marktweite Zahlen: OI je Börse (CoinGecko, alle Coins, in BTC) und Fear & Greed
  jobs.push(T('coingecko', async () => {
    const j = await get('https://api.coingecko.com/api/v3/derivatives/exchanges?order=open_interest_btc_desc&per_page=12', 'coingecko');
    out._.ex = Object.fromEntries((Array.isArray(j) ? j : []).map(x => [x.id, [r0(num(x.open_interest_btc)), r0(num(x.trade_volume_24h_btc))]]));
  }));
  jobs.push(T('fng', async () => {
    const j = await get('https://api.alternative.me/fng/?limit=1', 'fng');
    out._.fng = num(j.data?.[0]?.value);
  }));

  await Promise.all(jobs);

  // Coinbase-Premium: Coinbase (USD) gegen Binance (USDT, in USD umgerechnet)
  for (const c of coins) {
    const { cb, bn } = out[c].px;
    if (cb && bn) out[c].cb = sig(cb / (bn * (usdt || 1)) - 1, 4);
  }
  if (err.length) out._.err = err;
  for (const c of coins) clean(out[c]);
  return out;
}

// Direkter Aufruf zum Testen
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const coins = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const t0 = Date.now();
  const res = await collectMarkets(coins.length ? coins : ['BTC', 'ETH']);
  console.log(JSON.stringify({ ms: Date.now() - t0, mkt: res }, null, 1));
  if (DEBUG) console.log('\n--- Rohantworten ---\n' + Object.entries(RAW).map(([k, v]) => `## ${k}\n${v}`).join('\n'));
}
