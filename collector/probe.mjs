// Quellen-Test: Welche Marktdaten-Quellen erreicht der GitHub-Rechner?
// Aufruf: node collector/probe.mjs [ausgabe.json]
// Fragt jede Quelle einmal ab und hält Status, Antwortzeit und eine kurze Probe fest.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT = process.argv[2] || `data/probe/quellen-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`;
const UA = { 'User-Agent': 'whale-radar-probe/1.0 (+https://github.com/MBew96/whale-radar)', 'Accept': 'application/json' };

// [Gruppe, Name, URL, Prüfung (optional), Methode/Body (optional)]
const Q = [
  ['Kontrolle', 'Hyperliquid meta', 'https://api.hyperliquid.xyz/info', j => Array.isArray(j), { method: 'POST', body: '{"type":"metaAndAssetCtxs"}' }],
  ['Kontrolle', 'Standort Runner', 'https://ipinfo.io/json', j => j.country],

  ['Binance Futures', 'Open Interest', 'https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT', j => j.openInterest],
  ['Binance Futures', 'Funding/Mark', 'https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT', j => j.lastFundingRate],
  ['Binance Futures', 'Top-Trader Positionen L/S', 'https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=5m&limit=1', j => j[0]?.longShortRatio],
  ['Binance Futures', 'Top-Trader Konten L/S', 'https://fapi.binance.com/futures/data/topLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1', j => j[0]?.longShortRatio],
  ['Binance Futures', 'Alle Konten L/S', 'https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1', j => j[0]?.longShortRatio],
  ['Binance Futures', 'Taker Kauf/Verkauf', 'https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=5m&limit=1', j => j[0]?.buySellRatio],
  ['Binance Futures', 'OI-Verlauf', 'https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=5m&limit=1', j => j[0]?.sumOpenInterestValue],
  ['Binance Spot', 'Kurs api.binance.com', 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', j => j.price],
  ['Binance Spot', 'Kurs data-api.binance.vision', 'https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT', j => j.price],

  ['Bybit', 'Ticker (OI, Funding)', 'https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT', j => j.retCode === 0 && j.result?.list?.[0]?.openInterest],
  ['Bybit', 'Konten L/S', 'https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=5min&limit=1', j => j.retCode === 0 && j.result?.list?.[0]?.buyRatio],

  ['OKX', 'Open Interest', 'https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP', j => j.code === '0' && j.data?.[0]?.oi],
  ['OKX', 'Funding', 'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP', j => j.code === '0' && j.data?.[0]?.fundingRate],
  ['OKX', 'Konten L/S', 'https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=5m', j => j.code === '0' && j.data?.[0]],
  ['OKX', 'Top-Trader Positionen L/S', 'https://www.okx.com/api/v5/rubik/stat/contracts/long-short-position-ratio-contract-top-trader?instId=BTC-USDT-SWAP&period=5m', j => j.code === '0' && j.data?.[0]],
  ['OKX', 'Taker-Volumen', 'https://www.okx.com/api/v5/rubik/stat/taker-volume?ccy=BTC&instType=CONTRACTS&period=5m', j => j.code === '0' && j.data?.[0]],
  ['OKX', 'Liquidationen', 'https://www.okx.com/api/v5/public/liquidation-orders?instType=SWAP&uly=BTC-USDT&state=filled&limit=5', j => j.code === '0' && j.data?.[0]],

  ['Coinbase', 'Spot BTC-USD (Exchange)', 'https://api.exchange.coinbase.com/products/BTC-USD/ticker', j => j.price],
  ['Coinbase', 'Spot BTC-USD (v2)', 'https://api.coinbase.com/v2/prices/BTC-USD/spot', j => j.data?.amount],
  ['Coinbase', 'International Perp', 'https://api.international.coinbase.com/api/v1/instruments/BTC-PERP/quote', j => j.mark_price || j.index_price],

  ['Deribit', 'Futures (OI, Funding)', 'https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=future', j => j.result?.length],
  ['Deribit', 'Optionen (Put/Call-OI)', 'https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option', j => j.result?.length],

  ['Bitget', 'Open Interest', 'https://api.bitget.com/api/v2/mix/market/open-interest?symbol=BTCUSDT&productType=USDT-FUTURES', j => j.code === '00000' && j.data],
  ['Bitget', 'Funding', 'https://api.bitget.com/api/v2/mix/market/current-fund-rate?symbol=BTCUSDT&productType=USDT-FUTURES', j => j.code === '00000' && j.data],
  ['Bitget', 'Konten L/S', 'https://api.bitget.com/api/v2/mix/market/account-long-short?symbol=BTCUSDT&period=5m', j => j.code === '00000' && j.data],
  ['Bitget', 'Positionen L/S', 'https://api.bitget.com/api/v2/mix/market/position-long-short?symbol=BTCUSDT&period=5m', j => j.code === '00000' && j.data],

  ['Kraken', 'Futures Ticker', 'https://futures.kraken.com/derivatives/api/v3/tickers/PF_XBTUSD', j => j.result === 'success'],
  ['Kraken', 'Spot XBT/USD', 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD', j => j.result && !j.error?.length],

  ['Gate', 'Kontrakt-Statistik (L/S, Liq.)', 'https://api.gateio.ws/api/v4/futures/usdt/contract_stats?contract=BTC_USDT&interval=5m&limit=1', j => Array.isArray(j) && j[0]],
  ['Gate', 'Kontrakt (Funding)', 'https://api.gateio.ws/api/v4/futures/usdt/contracts/BTC_USDT', j => j.funding_rate],

  ['Weitere', 'MEXC Ticker', 'https://contract.mexc.com/api/v1/contract/ticker?symbol=BTC_USDT', j => j.success],
  ['Weitere', 'HTX Open Interest', 'https://api.hbdm.com/linear-swap-api/v1/swap_open_interest?contract_code=BTC-USDT', j => j.status === 'ok'],
  ['Weitere', 'dYdX Markt', 'https://indexer.dydx.trade/v4/perpetualMarkets?ticker=BTC-USD', j => j.markets],

  ['Aggregatoren', 'CoinGecko Derivate-Börsen (OI je Börse)', 'https://api.coingecko.com/api/v3/derivatives/exchanges?order=open_interest_btc_desc&per_page=15', j => Array.isArray(j) && j[0]?.open_interest_btc],
  ['Aggregatoren', 'Fear & Greed', 'https://api.alternative.me/fng/?limit=1', j => j.data?.[0]?.value],
  ['Aggregatoren', 'Farside ETF-Flüsse (Webseite)', 'https://farside.co.uk/btc/', null],
];

async function probe([group, name, url, check, opt = {}]) {
  const t0 = Date.now();
  const r = { group, name, url, status: 0, ms: 0, bytes: 0, ok: false };
  try {
    const res = await fetch(url, {
      method: opt.method || 'GET', body: opt.body,
      headers: { ...UA, ...(opt.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(12000)
    });
    const txt = await res.text();
    r.status = res.status; r.ms = Date.now() - t0; r.bytes = txt.length;
    let j = null;
    try { j = JSON.parse(txt); } catch { }
    if (check) {
      let v = null;
      try { v = j && check(j); } catch { }
      r.ok = res.ok && !!v;
    } else {
      r.ok = res.ok && txt.length > 1000;
    }
    r.sample = (group === 'Kontrolle' && j && name.startsWith('Standort'))
      ? JSON.stringify({ country: j.country, region: j.region, org: j.org })
      : txt.replace(/\s+/g, ' ').slice(0, 280);
  } catch (e) {
    r.ms = Date.now() - t0;
    r.error = String(e.cause?.code || e.name || e.message).slice(0, 80);
  }
  return r;
}

const results = [];
for (let i = 0; i < Q.length; i += 6) results.push(...await Promise.all(Q.slice(i, i + 6).map(probe)));

const where = results.find(r => r.name === 'Standort Runner')?.sample || '';
const out = { t: Date.now(), runner: where, ok: results.filter(r => r.ok).length, total: results.length, results };
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 1));

const lines = ['| Gruppe | Quelle | Status | ms | erreichbar |', '|---|---|---|---|---|',
  ...results.map(r => `| ${r.group} | ${r.name} | ${r.status || r.error} | ${r.ms} | ${r.ok ? '✅' : '❌'} |`)];
console.log(`Runner: ${where}\n${out.ok}/${out.total} erreichbar\n` + lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Quellen-Test\nRunner: ${where}\n\n${lines.join('\n')}\n`);
}
