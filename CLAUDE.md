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

## Aufgaben, die per Zeitplan laufen
- **Morgencheck (täglich 7 Uhr)**: Wal-Block für die Ampel – siehe `REVIEW.md`, Abschnitt „Täglicher Wal-Block“.
- **Wochen-Review (sonntags)**: Signal-Bilanz und Optimierung – streng nach `REVIEW.md`.

## Regeln für Änderungen
- Jede Änderung an Signalen, Schwellen oder Datenquellen: Eintrag in `CHANGELOG.md` mit Datum, Begründung und Beleg (Zahlen).
- Kleine Justierungen (Schwellenwerte, Gewichte) darf Claude selbst vornehmen und berichtet sie Mirco. Größere Schritte (neue Datenquelle, Signal abschalten, Umbau des Dashboards) als Vorschlag an Mirco, erst nach seinem OK umsetzen.
- Keine Anlageberatung formulieren; Einschätzungen sind Wahrscheinlichkeiten aus Daten, keine Empfehlungen.
- Commits: kurze deutsche Beschreibung.
