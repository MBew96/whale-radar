# Whale Radar

Positionierung der größten Trader auf Hyperliquid – live, mit Verlauf und Auswertung.

**Dashboard:** https://mbew96.github.io/whale-radar/

- Alle 10 Minuten misst eine GitHub Action die Positionen von rund 550 großen Wallets (öffentliche Hyperliquid-Daten) und speichert eine Momentaufnahme in `data/history/`.
- Seit 29.09.2026 schreibt jede Messung zusätzlich Daten der großen Börsen mit (OKX, Bitget, Gate, Deribit, HTX, Kraken, Coinbase, Binance Spot): Open Interest, Funding, Long/Short, Taker-Fluss, Liquidationen, Coinbase-Premium. Das Dashboard zeigt sie als Infokachel „Gesamtmarkt“; als Signal zählen sie erst nach der Bewertung im Wochen-Review.
- Das Dashboard zeigt Bias der Wale, Gewinner gegen Verlierer, Druck/Squeeze-Risiko, Liquidations-Level und den Verlauf der letzten 48 Stunden.
- Einmal pro Woche werden die Signale gegen die tatsächliche Kursentwicklung ausgewertet (`REVIEW.md`, `CHANGELOG.md`).

Keine Anlageberatung. Wem eine Wallet gehört, ist nicht verifiziert.
