# Änderungsprotokoll

## 2026-09-29 – Intraday-Kompass, übersichtlichere Heatmap, Magnet-Mindestgröße (Wunsch von Mirco)
- Neu: **Intraday-Kompass** (Horizont 1–4 Std.) = gewichtete Summe der Signale aus den Messungen: Gewinner-Wale ×2, Bias aller Wale ×1, gegen Verlierer-Wale ×1, Fluss 4 Std. ×1, Squeeze-Risiko ×1, Magnet-Überhang ±3 % ×1. Marktorders zählen nicht (nur live). Richtung ab |Score| ≥ 0,34 (`thresholds.compassMin`).
- Die Regeln stehen einmal in `tools/common.py` (`signal_dirs`, `compass`) und identisch im Dashboard (`stationSignals`). Review und Morgencheck nutzen dieselben Funktionen; der Review bewertet den Kompass als eigenes Signal `compass`.
- Gewichte sind **Startannahmen ohne Beleg** (Gewinner doppelt, weil dort der erwartete Informationsvorsprung liegt). Prüfung ab 21 Tagen Daten.
- Liquiditätsmagnete: zusätzlich Mindestgröße 1 % des gesamten Wal-Notionals (`magnetMinShareOfTotal`). Anlass: Das Lagebild zeigte einen „Magneten“ von nur 1,4 Mio. $. Magnet-Signal im Kompass: Short-Liq. bis +3 % gegen Long-Liq. bis −3 %, Überhang ≥ 1,5×.
- Heatmap: feste Preisstufen, Zoom ±3/6/12 %, Rauschfilter (< 4 % des Maximums ausgeblendet), Profil „Jetzt“ mit den drei größten Clustern, Kurs-Etikett.
- Stand beim Start (29.09. 15:06): BTC-Kompass +57 (Long-Tendenz, mittel), ETH +57.

## 2026-09-29 – Start
- Wetterstation eingerichtet: Messung alle 10 Minuten, ~550 Wallets (Kapital 260, Wochenvolumen 240, Wochen-PnL 120, plus Watchlist).
- Klassen: Gewinner = 30-Tage-PnL > 0 und Gesamt-PnL > 0; Verlierer = beide < 0.
- Market-Maker-Erkennung: Monatsumschlag ≥ 60× Konto und ≥ 15 offene Positionen.
- Druck-Schwelle: Liquidation ≤ 5 % vom Kurs.
- Alle Signale aktiv im Beobachtungsmodus. Erste Bewertung frühestens nach 14 Tagen, Änderungen frühestens nach 21 Tagen (siehe REVIEW.md).
