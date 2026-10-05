# Whale Radar – Arbeitsanweisung für Claude

Projekt von Mirco (GitHub: MBew96). Sprache: **Deutsch**. Mirco versteht Dinge am besten mit Metaphern und Bildern – Erklärungen entsprechend aufbauen. Er tradet intraday/scalping (ICT: Liquiditäts-Sweeps, Fair Value Gaps, Volumenprofil/NPOC, Elliott-Wellen auf 4h) mit Fokus Bitcoin, dazu ETH, Gold, Nasdaq.

## Was das Projekt ist
Ein Tracker für die Positionierung der größten Trader („Wale“) auf der Krypto-Börse Hyperliquid, im Stil von Crypto Rover. Alle Daten sind öffentlich (Hyperliquid-API).

- **Wetterstation** (`collector/collect.mjs`, GitHub Action `.github/workflows/wetterstation.yml`): läuft alle 10 Minuten, scannt ~550 Wallets (größte nach Kapital, Wochenvolumen, Wochen-PnL + `config/watchlist.json`), speichert eine Momentaufnahme nach `data/history/JJJJ-MM-TT/HHMM.json` (UTC) und veröffentlicht die Website.
- **Dashboard** (`site/index.html`): wird per GitHub Pages ausgeliefert: https://mbew96.github.io/whale-radar/ – lädt `data/latest.json` (letzte Messung) und `data/recent.json` (48 Std. Verlauf) und aktualisiert danach live im Browser.
- **Stellschrauben** (`config/settings.json`): Kandidatenlisten, Klassen (Gewinner/Verlierer), Market-Maker-Erkennung, Druck-Schwelle, aktive Signale, Schwellenwerte.

## Wichtig zur Umgebung
- Claude-Cloud-Sitzungen erreichen `api.hyperliquid.xyz` **nicht** (Netzwerkregel). Live-Daten kommen nur über die Messungen im Repo. Nie versuchen, die Sperre zu umgehen.
- GitHub ist erreichbar: Repo klonen, Daten lesen, Änderungen committen und pushen.

## Format einer Momentaufnahme (`data/history/…/HHMM.json`)
- `t` Zeit (ms, UTC), `bp` Stufengröße der Liq.-Buckets in % (fehlt = 0,5), `px` Markpreise, `ctx[coin]` = {f Funding/Std., oi Open Interest (Coins), vol 24h-Volumen, prev Vortagespreis}
- `coins[coin].all|win|lose|mm` = {L:[Notional USD, Anzahl, Ø Einstieg, uPnL, Ø Hebel], S:[…]} – `all` ohne Market-Maker; `win` = Gewinner-Wale, `lose` = Verlierer-Wale
- `coins[coin].stress` = {L:[USD nahe Liquidation, USD im Minus, Anzahl nahe Liq.], S:[…]}
- `coins[coin].liq` = [[Bucket-Index, Long-Liq USD, Short-Liq USD]] – Bucket i deckt den Bereich px·(1+i·b) bis px·(1+(i+1)·b) ab, b = liqBucketPct aus settings (seit 29.09.2026: 0,25 %; erste Messungen 0,5 %)
- `top[coin]` = [[Adresse, szi, Einstieg, Hebel, Liq.-Preis, Klasse w/l/x]] – größte Positionen
- `mkt` (seit 29.09.2026, Beobachtungsmodus, `collector/markets.mjs`) = Daten der großen Börsen für `collector.marketCoins` (BTC, ETH). Einzelne Felder fehlen, wenn eine Quelle ausfällt:
  - `mkt[coin].oi` = Open Interest in USD je Börse (okx, bitget, gate, htx, deribit, kraken) · `f` = Funding je 8 Std. (0,0001 = 0,01 %) je Börse
  - `ls` = Long-Anteil 0–1: `okxAcc`/`bitgetAcc`/`gateAcc` nach Konten (Köpfe), `okxTop`/`bitgetPos`/`gateTop` nach Positionsgröße (große Trader)
  - `tk.okx` = [Taker-Kauf USD, Taker-Verkauf USD] letzte Std. · `tk.gate` = Taker Long/Short-Verhältnis (5 Min.) · `tk.bnSpot` = [Taker-Kauf, Gesamtvolumen] Binance Spot letzte Std. (USDT)
  - `liq.okx`, `liq.gate` = [Long-Liq. USD, Short-Liq. USD] der letzten 10 Min. · `opt` = Deribit-Optionen {pc Put/Call-OI, pcv Put/Call-Volumen 24 Std., oi Options-OI in Coins}
  - `px` = {cb Coinbase USD, bn Binance USDT} · `cb` = Coinbase-Premium (Dezimal)
  - `mkt._` = {usdt USDT in USD, ex: {Börse: [OI in BTC, 24h-Volumen in BTC]} aller Coins laut CoinGecko (auch Binance, Bybit), fng Fear & Greed, err Liste der Ausfälle}
  - Binance Futures und Bybit sperren die US-Rechner von GitHub (Quellen-Test 29.09.2026) – nicht umgehen. Erneut prüfen: Workflow „Quellen-Test“ manuell starten (`collector/probe.mjs`, Ergebnis in `data/probe/`).

## Rechenskripte (immer diese verwenden, nicht selbst nachrechnen)
- `python3 tools/wal_block.py BTC ETH` → JSON mit Bias (alle/Gewinner/Verlierer), Fluss seit 22 Uhr/24 Std./4 Std., Druck, Liquiditätsmagneten und fertigen deutschen Kurzzeilen (`zeilen`), nur aktive Signale.
- `python3 tools/review.py --coin BTC` → Signal-Bilanz als Markdown-Tabelle (Trefferquoten 1/4/24 Std., Fallzahlen, Hälften-Vergleich, Urteil). `--json` für Maschinenformat. `--kurz` = eine Zeile Zwischenstand für den Morgencheck (nur lesen). Fälle werden je Horizont ohne Überlappung gezählt (Abstand = Horizont).

- Beobachtungs-Signale aus den Börsendaten stehen in `tools/common.py` (`market_dirs`) und in `config/settings.json` → `beobachtung`. Sie laufen nur im Review mit, nicht im Kompass und nicht im Lagebild, bis Mirco nach der Bewertung (frühestens ab 20.10.2026) zustimmt. Die Rohwerte zeigt das Dashboard seit 29.09.2026 (mit Mircos OK) in der Infokachel „Gesamtmarkt“ (`renderMarket` in `site/index.html`, Daten aus `latest.json` → `mkt` und `recent.json` → `mkt`), ausdrücklich ohne Signal-Wertung.
- Signale und Intraday-Kompass sind **einmal** in `tools/common.py` definiert (`signal_dirs`, `compass`, `compass_dir`) und im Dashboard identisch nachgebaut (`stationSignals` in `site/index.html`). Wer die Regeln ändert, ändert beide Stellen und prüft, dass Dashboard und `wal_block.py` denselben Score zeigen.

## Aufgaben, die per Zeitplan laufen
- **Morgencheck (täglich 7 Uhr)**: Wal-Block für die Ampel – siehe `REVIEW.md`, Abschnitt „Täglicher Wal-Block“.
- **Wochen-Review (sonntags)**: Signal-Bilanz und Optimierung – streng nach `REVIEW.md`.

## Regeln für Änderungen
- Jede Änderung an Signalen, Schwellen oder Datenquellen: Eintrag in `CHANGELOG.md` mit Datum, Begründung und Beleg (Zahlen).
- Kleine Justierungen (Schwellenwerte, Gewichte) darf Claude selbst vornehmen und berichtet sie Mirco. Größere Schritte (neue Datenquelle, Signal abschalten, Umbau des Dashboards) als Vorschlag an Mirco, erst nach seinem OK umsetzen.
- Keine Anlageberatung formulieren; Einschätzungen sind Wahrscheinlichkeiten aus Daten, keine Empfehlungen.
- Commits: kurze deutsche Beschreibung.
