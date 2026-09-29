# Änderungsprotokoll

## 2026-09-29 – Wochen-Review (erster Lauf): nichts geändert
- **Datenlage** (laut `review.py`): 76 Messungen über 0,7 Tage (29.09. 00:50 bis 17:53), 0 Lücken > 30 Min., 0 Scanfehler – BTC und ETH gleich.
- **Kernzahlen** (alle „zu wenig Daten“, max. 4 Fälle je Signal statt der nötigen 30): BTC Gewinner-Wale 1h 75 % (n=4), 4h 50 % (n=4); Kompass BTC 1h 75 % (n=4), 4h 50 % (n=4); ETH Gewinner-Wale 1h 100 % (n=4), 4h 50 % (n=4). Vergleichswert (Kurs stieg) BTC 1h 75 %, ETH 1h 100 % (je n=4) – die Long-Signale liegen also nicht über dem Zufall. Bias aller Wale und Squeeze-Risiko haben bisher 0 Fälle ausgelöst; 24h-Horizont noch ohne Fälle.
- **Entscheidung**: Keine Bewertung (< 14 Tage Daten), keine Änderung an Signalen, Gewichten oder Schwellen (< 21 Tage). Nächste Bewertung frühestens ab 12.10., Änderungen frühestens ab 19.10.
- Vollständige Bilanz: `data/review/2026-09-29.md`.

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
