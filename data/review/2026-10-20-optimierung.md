# Optimierung 20.10.2026 – Beleg

Vorab freigegebene Optimierung (REVIEW.md, OK Mirco 13.10., Vorrang Regel 1 laut Entscheidung 19.10.). Ausgabe von `tools/review.py` unverändert.

# Vorher (alte Gewichte)

## Signal-Bilanz BTC · 29.09.2026 00:50 bis 20.10.2026 09:50
Messungen: 2091 über 21,4 Tage · Lücken > 30 Min.: 14 · Scanfehler gesamt: 0
Börsendaten (Beobachtung): 1999 Messungen seit 29.09.2026 21:19 · häufigste Ausfälle: The operation was aborted due to timeout (21×), coingecko (3×), kraken BTC (2×), kraken ETH (2×)
Vergleich (Kurs stieg, Abstand = Horizont): 1h: 49 % (n=350) · 4h: 55 % (n=95) · 24h: 62 % (n=16)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Bias aller Wale | 1h | 3 (0/3) | 33 % | 51 % | -0,09 % | 0 % / 50 % | zu wenig Daten |
| Bias aller Wale | 4h | 2 (0/2) | 0 % | 45 % | -0,61 % | 0 % / 0 % | zu wenig Daten |
| Bias aller Wale | 24h | 1 (0/1) | 0 % | 38 % | -1,92 % | – / 0 % | zu wenig Daten |
| Bias der Gewinner-Wale | 1h | 222 (166/56) | 47 % | 50 % | -0,01 % | 49 % / 45 % | unklar |
| Bias der Gewinner-Wale | 4h | 63 (48/15) | 48 % | 52 % | -0,06 % | 55 % / 41 % | unklar |
| Bias der Gewinner-Wale | 24h | 12 (10/2) | 50 % | 58 % | -0,17 % | 83 % / 17 % | zu wenig Daten |
| Gegen die Verlierer-Wale | 1h | 276 (234/42) | 47 % | 50 % | -0,01 % | 49 % / 46 % | unklar |
| Gegen die Verlierer-Wale | 4h | 81 (69/12) | 47 % | 53 % | -0,06 % | 50 % / 44 % | Gegenindikator? |
| Gegen die Verlierer-Wale | 24h | 16 (16/0) | 56 % | 62 % | 0,04 % | 62 % / 50 % | zu wenig Daten |
| Aufbau/Abbau der letzten 4 Std. | 1h | 135 (70/65) | 44 % | 50 % | -0,02 % | 48 % / 41 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 4h | 57 (32/25) | 51 % | 51 % | -0,09 % | 43 % / 59 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 24h | 13 (9/4) | 15 % | 55 % | -0,47 % | 17 % / 14 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 1h | 7 (7/0) | 14 % | 49 % | -0,06 % | 0 % / 25 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 4h | 3 (3/0) | 33 % | 55 % | -0,31 % | 0 % / 50 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 24h | 1 (1/0) | 0 % | 62 % | -1,32 % | – / 0 % | zu wenig Daten |
| Nächster großer Liquidations-Cluster | 1h | 282 (140/142) | 50 % | 50 % | 0,01 % | 49 % / 51 % | unklar |
| Nächster großer Liquidations-Cluster | 4h | 86 (44/42) | 51 % | 50 % | -0,00 % | 53 % / 49 % | unklar |
| Nächster großer Liquidations-Cluster | 24h | 15 (7/8) | 60 % | 49 % | 0,02 % | 43 % / 75 % | zu wenig Daten |
| Intraday-Kompass (gewichtete Summe) | 1h | 163 (121/42) | 47 % | 50 % | -0,02 % | 47 % / 46 % | unklar |
| Intraday-Kompass (gewichtete Summe) | 4h | 53 (40/13) | 47 % | 52 % | -0,06 % | 54 % / 41 % | unklar |
| Intraday-Kompass (gewichtete Summe) | 24h | 12 (9/3) | 42 % | 56 % | -0,33 % | 67 % / 17 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 1h | 12 (3/9) | 42 % | 50 % | -0,23 % | 50 % / 33 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 4h | 12 (3/9) | 25 % | 48 % | -0,40 % | 33 % / 17 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 24h | 6 (1/5) | 50 % | 42 % | -0,12 % | 67 % / 33 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 1h | 45 (45/0) | 51 % | 49 % | 0,05 % | 55 % / 48 % | unklar |
| Gegen teures Funding der Börsen (Beobachtung) | 4h | 18 (18/0) | 67 % | 55 % | 0,17 % | 56 % / 78 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 24h | 9 (9/0) | 67 % | 62 % | 0,15 % | 50 % / 80 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 1h | 21 (21/0) | 29 % | 49 % | -0,19 % | 30 % / 27 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 4h | 12 (12/0) | 25 % | 55 % | -0,37 % | 33 % / 17 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 24h | 6 (6/0) | 17 % | 62 % | -0,82 % | 0 % / 33 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 1h | 45 (17/28) | 47 % | 50 % | -0,03 % | 36 % / 57 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 4h | 15 (6/9) | 47 % | 49 % | -0,06 % | 43 % / 50 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 24h | 5 (3/2) | 20 % | 52 % | -1,18 % | 0 % / 33 % | zu wenig Daten |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 1h | 267 (140/127) | 51 % | 50 % | -0,01 % | 52 % / 49 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 4h | 85 (49/36) | 48 % | 51 % | 0,01 % | 43 % / 53 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 24h | 15 (7/8) | 40 % | 49 % | -0,74 % | 29 % / 50 % | zu wenig Daten |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 207 (71/136) | 48 % | 50 % | -0,02 % | 45 % / 51 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (22/39) | 46 % | 49 % | -0,07 % | 33 % / 58 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 13 (3/10) | 46 % | 43 % | -0,25 % | 17 % / 71 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 204 (54/150) | 46 % | 50 % | 0,02 % | 45 % / 47 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (18/43) | 52 % | 48 % | -0,02 % | 57 % / 48 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 13 (3/10) | 54 % | 43 % | -0,10 % | 17 % / 86 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 49 (15/34) | 49 % | 50 % | -0,00 % | 46 % / 52 % | unklar |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 18 (5/13) | 50 % | 48 % | -0,06 % | 44 % / 56 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 5 (1/4) | 40 % | 42 % | -0,02 % | 0 % / 67 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 1h | 201 (69/132) | 47 % | 50 % | -0,00 % | 49 % / 46 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 4h | 65 (21/44) | 57 % | 48 % | -0,02 % | 59 % / 55 % | bewährt |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 24h | 14 (4/10) | 36 % | 45 % | -0,23 % | 14 % / 57 % | zu wenig Daten |

### Relative Wal-Signale – nur ungesehene Fälle ab 08.10.2026
Die Hypothese wurde am 07.10.2026 vorab festgelegt; nur diese Fälle zählen für die Bewertung (REVIEW.md). Markt-Vergleich aus demselben Zeitraum.
Vergleich (Kurs stieg, ab 08.10.2026): 1h: 53 % (n=190) · 4h: 57 % (n=51) · 24h: 71 % (n=7)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 1h | 143 (44/99) | 48 % | 49 % | -0,01 % | 42 % / 53 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 4h | 40 (13/27) | 52 % | 48 % | -0,00 % | 55 % / 50 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 24h | 7 (2/5) | 71 % | 41 % | 0,25 % | 67 % / 75 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 1h | 129 (32/97) | 47 % | 48 % | 0,03 % | 53 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 4h | 37 (10/27) | 51 % | 47 % | 0,03 % | 61 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 24h | 6 (1/5) | 83 % | 36 % | 0,42 % | 100 % / 67 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 1h | 0 | – | – | – | – | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 4h | 0 | – | – | – | – | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 1h | 125 (40/85) | 45 % | 49 % | -0,01 % | 47 % / 43 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 4h | 37 (12/25) | 59 % | 48 % | 0,03 % | 72 % / 47 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 24h | 7 (1/6) | 57 % | 35 % | 0,09 % | 33 % / 75 % | zu wenig Daten |

Hinweis: belastbar erst ab 30 Fällen. Markt-Vergleich = Trefferquote, die ein Signal mit derselben Long/Short-Mischung ohne jedes Wissen erreicht hätte. „bewährt“ = Trefferquote mindestens 6 Prozentpunkte über dem Markt-Vergleich, über 50 % und in beiden Hälften über dem Markt-Vergleich; „Gegenindikator?“ spiegelbildlich.

## Signal-Bilanz ETH · 29.09.2026 00:50 bis 20.10.2026 09:50
Messungen: 2091 über 21,4 Tage · Lücken > 30 Min.: 14 · Scanfehler gesamt: 0
Börsendaten (Beobachtung): 1999 Messungen seit 29.09.2026 21:19 · häufigste Ausfälle: The operation was aborted due to timeout (21×), coingecko (3×), kraken BTC (2×), kraken ETH (2×)
Vergleich (Kurs stieg, Abstand = Horizont): 1h: 53 % (n=350) · 4h: 54 % (n=95) · 24h: 50 % (n=16)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Bias aller Wale | 1h | 0 | – | – | – | – | zu wenig Daten |
| Bias aller Wale | 4h | 0 | – | – | – | – | zu wenig Daten |
| Bias aller Wale | 24h | 0 | – | – | – | – | zu wenig Daten |
| Bias der Gewinner-Wale | 1h | 267 (170/97) | 48 % | 51 % | -0,02 % | 53 % / 42 % | unklar |
| Bias der Gewinner-Wale | 4h | 74 (48/26) | 49 % | 51 % | -0,10 % | 54 % / 43 % | unklar |
| Bias der Gewinner-Wale | 24h | 14 (10/4) | 43 % | 50 % | -0,51 % | 57 % / 29 % | zu wenig Daten |
| Gegen die Verlierer-Wale | 1h | 257 (119/138) | 46 % | 50 % | -0,00 % | 48 % / 43 % | unklar |
| Gegen die Verlierer-Wale | 4h | 74 (35/39) | 51 % | 50 % | -0,00 % | 59 % / 43 % | unklar |
| Gegen die Verlierer-Wale | 24h | 14 (8/6) | 57 % | 50 % | -0,24 % | 71 % / 43 % | zu wenig Daten |
| Aufbau/Abbau der letzten 4 Std. | 1h | 124 (56/68) | 48 % | 50 % | 0,01 % | 42 % / 53 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 4h | 51 (22/29) | 49 % | 49 % | 0,04 % | 48 % / 50 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 24h | 12 (4/8) | 42 % | 50 % | 0,36 % | 33 % / 50 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 1h | 0 | – | – | – | – | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 4h | 0 | – | – | – | – | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Nächster großer Liquidations-Cluster | 1h | 301 (46/255) | 50 % | 48 % | 0,03 % | 53 % / 47 % | unklar |
| Nächster großer Liquidations-Cluster | 4h | 85 (12/73) | 45 % | 47 % | 0,08 % | 45 % / 44 % | unklar |
| Nächster großer Liquidations-Cluster | 24h | 16 (1/15) | 56 % | 50 % | 0,52 % | 50 % / 62 % | zu wenig Daten |
| Intraday-Kompass (gewichtete Summe) | 1h | 107 (37/70) | 47 % | 49 % | -0,04 % | 45 % / 48 % | unklar |
| Intraday-Kompass (gewichtete Summe) | 4h | 37 (16/21) | 46 % | 50 % | -0,10 % | 44 % / 47 % | unklar |
| Intraday-Kompass (gewichtete Summe) | 24h | 11 (6/5) | 36 % | 50 % | -0,33 % | 40 % / 33 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 1h | 20 (6/14) | 65 % | 49 % | -0,06 % | 70 % / 60 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 4h | 16 (4/12) | 44 % | 48 % | -0,11 % | 50 % / 38 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 24h | 6 (3/3) | 50 % | 50 % | -0,15 % | 33 % / 67 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 1h | 50 (50/0) | 46 % | 53 % | -0,02 % | 44 % / 48 % | Gegenindikator? |
| Gegen teures Funding der Börsen (Beobachtung) | 4h | 22 (22/0) | 55 % | 54 % | 0,10 % | 64 % / 45 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 24h | 8 (8/0) | 25 % | 50 % | -1,05 % | 0 % / 50 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 1h | 30 (26/4) | 40 % | 52 % | -0,13 % | 47 % / 33 % | Gegenindikator? |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 4h | 16 (13/3) | 56 % | 52 % | -0,03 % | 62 % / 50 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 24h | 6 (5/1) | 50 % | 50 % | -0,43 % | 33 % / 67 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 1h | 156 (0/156) | 45 % | 47 % | 0,01 % | 49 % / 41 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 4h | 48 (0/48) | 42 % | 46 % | 0,09 % | 42 % / 42 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 24h | 10 (0/10) | 40 % | 50 % | 0,50 % | 40 % / 40 % | zu wenig Daten |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 1h | 268 (131/137) | 53 % | 50 % | -0,00 % | 55 % / 50 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 4h | 84 (42/42) | 49 % | 50 % | -0,05 % | 43 % / 55 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 24h | 15 (9/6) | 47 % | 50 % | 0,31 % | 57 % / 38 % | zu wenig Daten |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 178 (42/136) | 49 % | 48 % | 0,02 % | 45 % / 53 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 50 (12/38) | 48 % | 48 % | 0,09 % | 40 % / 56 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 10 (2/8) | 60 % | 50 % | 0,69 % | 40 % / 80 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 193 (63/130) | 44 % | 49 % | -0,02 % | 44 % / 43 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (25/36) | 51 % | 49 % | 0,02 % | 60 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 15 (8/7) | 47 % | 50 % | -0,41 % | 43 % / 50 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 9 (9/0) | 56 % | 53 % | -0,01 % | 50 % / 60 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 5 (5/0) | 40 % | 54 % | -0,28 % | 50 % / 33 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 1 (1/0) | 0 % | 50 % | -0,58 % | – / 0 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 1h | 144 (6/138) | 44 % | 47 % | -0,01 % | 47 % / 40 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 4h | 47 (3/44) | 40 % | 47 % | 0,08 % | 39 % / 42 % | Gegenindikator? |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 24h | 12 (0/12) | 58 % | 50 % | 0,63 % | 33 % / 83 % | zu wenig Daten |

### Relative Wal-Signale – nur ungesehene Fälle ab 08.10.2026
Die Hypothese wurde am 07.10.2026 vorab festgelegt; nur diese Fälle zählen für die Bewertung (REVIEW.md). Markt-Vergleich aus demselben Zeitraum.
Vergleich (Kurs stieg, ab 08.10.2026): 1h: 55 % (n=190) · 4h: 53 % (n=51) · 24h: 57 % (n=7)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 1h | 151 (42/109) | 48 % | 48 % | 0,03 % | 47 % / 50 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 4h | 42 (12/30) | 52 % | 49 % | 0,10 % | 52 % / 52 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 24h | 7 (2/5) | 71 % | 47 % | 1,07 % | 67 % / 75 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 1h | 119 (34/85) | 43 % | 48 % | -0,01 % | 46 % / 40 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 4h | 36 (12/24) | 47 % | 49 % | 0,00 % | 56 % / 39 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 24h | 7 (4/3) | 43 % | 51 % | -0,21 % | 100 % / 0 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 1h | 5 (5/0) | 60 % | 55 % | -0,02 % | 100 % / 33 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 4h | 3 (3/0) | 33 % | 53 % | -0,16 % | 0 % / 50 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 1h | 85 (4/81) | 41 % | 46 % | -0,02 % | 45 % / 37 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 4h | 26 (2/24) | 42 % | 48 % | 0,11 % | 46 % / 38 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 24h | 5 (0/5) | 80 % | 43 % | 0,71 % | 100 % / 67 % | zu wenig Daten |

Hinweis: belastbar erst ab 30 Fällen. Markt-Vergleich = Trefferquote, die ein Signal mit derselben Long/Short-Mischung ohne jedes Wissen erreicht hätte. „bewährt“ = Trefferquote mindestens 6 Prozentpunkte über dem Markt-Vergleich, über 50 % und in beiden Hälften über dem Markt-Vergleich; „Gegenindikator?“ spiegelbildlich.

# Nachher (biasWinners 0, biasLosersFade 0; im Rückblick gewählt, daher geschönt)

## Signal-Bilanz BTC · 29.09.2026 00:50 bis 20.10.2026 09:50
Messungen: 2091 über 21,4 Tage · Lücken > 30 Min.: 14 · Scanfehler gesamt: 0
Börsendaten (Beobachtung): 1999 Messungen seit 29.09.2026 21:19 · häufigste Ausfälle: The operation was aborted due to timeout (21×), coingecko (3×), kraken BTC (2×), kraken ETH (2×)
Vergleich (Kurs stieg, Abstand = Horizont): 1h: 49 % (n=350) · 4h: 55 % (n=95) · 24h: 62 % (n=16)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Bias aller Wale | 1h | 3 (0/3) | 33 % | 51 % | -0,09 % | 0 % / 50 % | zu wenig Daten |
| Bias aller Wale | 4h | 2 (0/2) | 0 % | 45 % | -0,61 % | 0 % / 0 % | zu wenig Daten |
| Bias aller Wale | 24h | 1 (0/1) | 0 % | 38 % | -1,92 % | – / 0 % | zu wenig Daten |
| Bias der Gewinner-Wale | 1h | 222 (166/56) | 47 % | 50 % | -0,01 % | 49 % / 45 % | unklar |
| Bias der Gewinner-Wale | 4h | 63 (48/15) | 48 % | 52 % | -0,06 % | 55 % / 41 % | unklar |
| Bias der Gewinner-Wale | 24h | 12 (10/2) | 50 % | 58 % | -0,17 % | 83 % / 17 % | zu wenig Daten |
| Gegen die Verlierer-Wale | 1h | 276 (234/42) | 47 % | 50 % | -0,01 % | 49 % / 46 % | unklar |
| Gegen die Verlierer-Wale | 4h | 81 (69/12) | 47 % | 53 % | -0,06 % | 50 % / 44 % | Gegenindikator? |
| Gegen die Verlierer-Wale | 24h | 16 (16/0) | 56 % | 62 % | 0,04 % | 62 % / 50 % | zu wenig Daten |
| Aufbau/Abbau der letzten 4 Std. | 1h | 135 (70/65) | 44 % | 50 % | -0,02 % | 48 % / 41 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 4h | 57 (32/25) | 51 % | 51 % | -0,09 % | 43 % / 59 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 24h | 13 (9/4) | 15 % | 55 % | -0,47 % | 17 % / 14 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 1h | 7 (7/0) | 14 % | 49 % | -0,06 % | 0 % / 25 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 4h | 3 (3/0) | 33 % | 55 % | -0,31 % | 0 % / 50 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 24h | 1 (1/0) | 0 % | 62 % | -1,32 % | – / 0 % | zu wenig Daten |
| Nächster großer Liquidations-Cluster | 1h | 282 (140/142) | 50 % | 50 % | 0,01 % | 49 % / 51 % | unklar |
| Nächster großer Liquidations-Cluster | 4h | 86 (44/42) | 51 % | 50 % | -0,00 % | 53 % / 49 % | unklar |
| Nächster großer Liquidations-Cluster | 24h | 15 (7/8) | 60 % | 49 % | 0,02 % | 43 % / 75 % | zu wenig Daten |
| Intraday-Kompass (gewichtete Summe) | 1h | 57 (29/28) | 44 % | 50 % | 0,02 % | 43 % / 45 % | Gegenindikator? |
| Intraday-Kompass (gewichtete Summe) | 4h | 31 (15/16) | 58 % | 50 % | 0,01 % | 60 % / 56 % | bewährt |
| Intraday-Kompass (gewichtete Summe) | 24h | 11 (6/5) | 18 % | 51 % | -0,50 % | 40 % / 0 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 1h | 12 (3/9) | 42 % | 50 % | -0,23 % | 50 % / 33 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 4h | 12 (3/9) | 25 % | 48 % | -0,40 % | 33 % / 17 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 24h | 6 (1/5) | 50 % | 42 % | -0,12 % | 67 % / 33 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 1h | 45 (45/0) | 51 % | 49 % | 0,05 % | 55 % / 48 % | unklar |
| Gegen teures Funding der Börsen (Beobachtung) | 4h | 18 (18/0) | 67 % | 55 % | 0,17 % | 56 % / 78 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 24h | 9 (9/0) | 67 % | 62 % | 0,15 % | 50 % / 80 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 1h | 21 (21/0) | 29 % | 49 % | -0,19 % | 30 % / 27 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 4h | 12 (12/0) | 25 % | 55 % | -0,37 % | 33 % / 17 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 24h | 6 (6/0) | 17 % | 62 % | -0,82 % | 0 % / 33 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 1h | 45 (17/28) | 47 % | 50 % | -0,03 % | 36 % / 57 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 4h | 15 (6/9) | 47 % | 49 % | -0,06 % | 43 % / 50 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 24h | 5 (3/2) | 20 % | 52 % | -1,18 % | 0 % / 33 % | zu wenig Daten |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 1h | 267 (140/127) | 51 % | 50 % | -0,01 % | 52 % / 49 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 4h | 85 (49/36) | 48 % | 51 % | 0,01 % | 43 % / 53 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 24h | 15 (7/8) | 40 % | 49 % | -0,74 % | 29 % / 50 % | zu wenig Daten |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 207 (71/136) | 48 % | 50 % | -0,02 % | 45 % / 51 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (22/39) | 46 % | 49 % | -0,07 % | 33 % / 58 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 13 (3/10) | 46 % | 43 % | -0,25 % | 17 % / 71 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 204 (54/150) | 46 % | 50 % | 0,02 % | 45 % / 47 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (18/43) | 52 % | 48 % | -0,02 % | 57 % / 48 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 13 (3/10) | 54 % | 43 % | -0,10 % | 17 % / 86 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 49 (15/34) | 49 % | 50 % | -0,00 % | 46 % / 52 % | unklar |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 18 (5/13) | 50 % | 48 % | -0,06 % | 44 % / 56 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 5 (1/4) | 40 % | 42 % | -0,02 % | 0 % / 67 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 1h | 201 (69/132) | 47 % | 50 % | -0,00 % | 49 % / 46 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 4h | 65 (21/44) | 57 % | 48 % | -0,02 % | 59 % / 55 % | bewährt |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 24h | 14 (4/10) | 36 % | 45 % | -0,23 % | 14 % / 57 % | zu wenig Daten |

### Relative Wal-Signale – nur ungesehene Fälle ab 08.10.2026
Die Hypothese wurde am 07.10.2026 vorab festgelegt; nur diese Fälle zählen für die Bewertung (REVIEW.md). Markt-Vergleich aus demselben Zeitraum.
Vergleich (Kurs stieg, ab 08.10.2026): 1h: 53 % (n=190) · 4h: 57 % (n=51) · 24h: 71 % (n=7)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 1h | 143 (44/99) | 48 % | 49 % | -0,01 % | 42 % / 53 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 4h | 40 (13/27) | 52 % | 48 % | -0,00 % | 55 % / 50 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 24h | 7 (2/5) | 71 % | 41 % | 0,25 % | 67 % / 75 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 1h | 129 (32/97) | 47 % | 48 % | 0,03 % | 53 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 4h | 37 (10/27) | 51 % | 47 % | 0,03 % | 61 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 24h | 6 (1/5) | 83 % | 36 % | 0,42 % | 100 % / 67 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 1h | 0 | – | – | – | – | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 4h | 0 | – | – | – | – | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 1h | 125 (40/85) | 45 % | 49 % | -0,01 % | 47 % / 43 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 4h | 37 (12/25) | 59 % | 48 % | 0,03 % | 72 % / 47 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 24h | 7 (1/6) | 57 % | 35 % | 0,09 % | 33 % / 75 % | zu wenig Daten |

Hinweis: belastbar erst ab 30 Fällen. Markt-Vergleich = Trefferquote, die ein Signal mit derselben Long/Short-Mischung ohne jedes Wissen erreicht hätte. „bewährt“ = Trefferquote mindestens 6 Prozentpunkte über dem Markt-Vergleich, über 50 % und in beiden Hälften über dem Markt-Vergleich; „Gegenindikator?“ spiegelbildlich.

## Signal-Bilanz ETH · 29.09.2026 00:50 bis 20.10.2026 09:50
Messungen: 2091 über 21,4 Tage · Lücken > 30 Min.: 14 · Scanfehler gesamt: 0
Börsendaten (Beobachtung): 1999 Messungen seit 29.09.2026 21:19 · häufigste Ausfälle: The operation was aborted due to timeout (21×), coingecko (3×), kraken BTC (2×), kraken ETH (2×)
Vergleich (Kurs stieg, Abstand = Horizont): 1h: 53 % (n=350) · 4h: 54 % (n=95) · 24h: 50 % (n=16)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Bias aller Wale | 1h | 0 | – | – | – | – | zu wenig Daten |
| Bias aller Wale | 4h | 0 | – | – | – | – | zu wenig Daten |
| Bias aller Wale | 24h | 0 | – | – | – | – | zu wenig Daten |
| Bias der Gewinner-Wale | 1h | 267 (170/97) | 48 % | 51 % | -0,02 % | 53 % / 42 % | unklar |
| Bias der Gewinner-Wale | 4h | 74 (48/26) | 49 % | 51 % | -0,10 % | 54 % / 43 % | unklar |
| Bias der Gewinner-Wale | 24h | 14 (10/4) | 43 % | 50 % | -0,51 % | 57 % / 29 % | zu wenig Daten |
| Gegen die Verlierer-Wale | 1h | 257 (119/138) | 46 % | 50 % | -0,00 % | 48 % / 43 % | unklar |
| Gegen die Verlierer-Wale | 4h | 74 (35/39) | 51 % | 50 % | -0,00 % | 59 % / 43 % | unklar |
| Gegen die Verlierer-Wale | 24h | 14 (8/6) | 57 % | 50 % | -0,24 % | 71 % / 43 % | zu wenig Daten |
| Aufbau/Abbau der letzten 4 Std. | 1h | 124 (56/68) | 48 % | 50 % | 0,01 % | 42 % / 53 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 4h | 51 (22/29) | 49 % | 49 % | 0,04 % | 48 % / 50 % | unklar |
| Aufbau/Abbau der letzten 4 Std. | 24h | 12 (4/8) | 42 % | 50 % | 0,36 % | 33 % / 50 % | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 1h | 0 | – | – | – | – | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 4h | 0 | – | – | – | – | zu wenig Daten |
| Squeeze-Risiko (Druck + Liq.-Nähe) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Nächster großer Liquidations-Cluster | 1h | 301 (46/255) | 50 % | 48 % | 0,03 % | 53 % / 47 % | unklar |
| Nächster großer Liquidations-Cluster | 4h | 85 (12/73) | 45 % | 47 % | 0,08 % | 45 % / 44 % | unklar |
| Nächster großer Liquidations-Cluster | 24h | 16 (1/15) | 56 % | 50 % | 0,52 % | 50 % / 62 % | zu wenig Daten |
| Intraday-Kompass (gewichtete Summe) | 1h | 62 (10/52) | 45 % | 48 % | -0,01 % | 45 % / 45 % | unklar |
| Intraday-Kompass (gewichtete Summe) | 4h | 29 (3/26) | 45 % | 47 % | 0,07 % | 29 % / 60 % | zu wenig Daten |
| Intraday-Kompass (gewichtete Summe) | 24h | 11 (1/10) | 45 % | 50 % | 0,33 % | 0 % / 83 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 1h | 20 (6/14) | 65 % | 49 % | -0,06 % | 70 % / 60 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 4h | 16 (4/12) | 44 % | 48 % | -0,11 % | 50 % / 38 % | zu wenig Daten |
| Coinbase-Premium (US-Nachfrage) (Beobachtung) | 24h | 6 (3/3) | 50 % | 50 % | -0,15 % | 33 % / 67 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 1h | 50 (50/0) | 46 % | 53 % | -0,02 % | 44 % / 48 % | Gegenindikator? |
| Gegen teures Funding der Börsen (Beobachtung) | 4h | 22 (22/0) | 55 % | 54 % | 0,10 % | 64 % / 45 % | zu wenig Daten |
| Gegen teures Funding der Börsen (Beobachtung) | 24h | 8 (8/0) | 25 % | 50 % | -1,05 % | 0 % / 50 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 1h | 30 (26/4) | 40 % | 52 % | -0,13 % | 47 % / 33 % | Gegenindikator? |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 4h | 16 (13/3) | 56 % | 52 % | -0,03 % | 62 % / 50 % | zu wenig Daten |
| Neues Geld an den Börsen (OI 4 Std. + Kursrichtung) (Beobachtung) | 24h | 6 (5/1) | 50 % | 50 % | -0,43 % | 33 % / 67 % | zu wenig Daten |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 1h | 156 (0/156) | 45 % | 47 % | 0,01 % | 49 % / 41 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 4h | 48 (0/48) | 42 % | 46 % | 0,09 % | 42 % / 42 % | unklar |
| Große Positionen an OKX/Bitget/Gate (Beobachtung) | 24h | 10 (0/10) | 40 % | 50 % | 0,50 % | 40 % / 40 % | zu wenig Daten |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 1h | 268 (131/137) | 53 % | 50 % | -0,00 % | 55 % / 50 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 4h | 84 (42/42) | 49 % | 50 % | -0,05 % | 43 % / 55 % | unklar |
| Binance-Spot-Käufe gegen -Verkäufe (1 Std.) (Beobachtung) | 24h | 15 (9/6) | 47 % | 50 % | 0,31 % | 57 % / 38 % | zu wenig Daten |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 178 (42/136) | 49 % | 48 % | 0,02 % | 45 % / 53 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 50 (12/38) | 48 % | 48 % | 0,09 % | 40 % / 56 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 10 (2/8) | 60 % | 50 % | 0,69 % | 40 % / 80 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 193 (63/130) | 44 % | 49 % | -0,02 % | 44 % / 43 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 61 (25/36) | 51 % | 49 % | 0,02 % | 60 % / 42 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 15 (8/7) | 47 % | 50 % | -0,41 % | 43 % / 50 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 1h | 9 (9/0) | 56 % | 53 % | -0,01 % | 50 % / 60 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 4h | 5 (5/0) | 40 % | 54 % | -0,28 % | 50 % / 33 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) (Beobachtung) | 24h | 1 (1/0) | 0 % | 50 % | -0,58 % | – / 0 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 1h | 144 (6/138) | 44 % | 47 % | -0,01 % | 47 % / 40 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 4h | 47 (3/44) | 40 % | 47 % | 0,08 % | 39 % / 42 % | Gegenindikator? |
| Kompass B: relative Wal-Signale + Fluss + Magnet (Beobachtung) | 24h | 12 (0/12) | 58 % | 50 % | 0,63 % | 33 % / 83 % | zu wenig Daten |

### Relative Wal-Signale – nur ungesehene Fälle ab 08.10.2026
Die Hypothese wurde am 07.10.2026 vorab festgelegt; nur diese Fälle zählen für die Bewertung (REVIEW.md). Markt-Vergleich aus demselben Zeitraum.
Vergleich (Kurs stieg, ab 08.10.2026): 1h: 55 % (n=190) · 4h: 53 % (n=51) · 24h: 57 % (n=7)

| Signal | Horizont | Fälle (L/S) | Trefferquote | Markt-Vergleich | Ø Bewegung in Signalrichtung | 1. / 2. Hälfte | Urteil |
|---|---|---|---|---|---|---|---|
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 1h | 151 (42/109) | 48 % | 48 % | 0,03 % | 47 % / 50 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 4h | 42 (12/30) | 52 % | 49 % | 0,10 % | 52 % / 52 % | unklar |
| Gewinner-Wale longiger/shortiger als üblich (72 Std.) | 24h | 7 (2/5) | 71 % | 47 % | 1,07 % | 67 % / 75 % | zu wenig Daten |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 1h | 119 (34/85) | 43 % | 48 % | -0,01 % | 46 % / 40 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 4h | 36 (12/24) | 47 % | 49 % | 0,00 % | 56 % / 39 % | unklar |
| Gegen Verlierer-Wale, wenn longiger/shortiger als üblich (72 Std.) | 24h | 7 (4/3) | 43 % | 51 % | -0,21 % | 100 % / 0 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 1h | 5 (5/0) | 60 % | 55 % | -0,02 % | 100 % / 33 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 4h | 3 (3/0) | 33 % | 53 % | -0,16 % | 0 % / 50 % | zu wenig Daten |
| Alle Wale longiger/shortiger als üblich (72 Std.) | 24h | 0 | – | – | – | – | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 1h | 85 (4/81) | 41 % | 46 % | -0,02 % | 45 % / 37 % | unklar |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 4h | 26 (2/24) | 42 % | 48 % | 0,11 % | 46 % / 38 % | zu wenig Daten |
| Kompass B: relative Wal-Signale + Fluss + Magnet | 24h | 5 (0/5) | 80 % | 43 % | 0,71 % | 100 % / 67 % | zu wenig Daten |

Hinweis: belastbar erst ab 30 Fällen. Markt-Vergleich = Trefferquote, die ein Signal mit derselben Long/Short-Mischung ohne jedes Wissen erreicht hätte. „bewährt“ = Trefferquote mindestens 6 Prozentpunkte über dem Markt-Vergleich, über 50 % und in beiden Hälften über dem Markt-Vergleich; „Gegenindikator?“ spiegelbildlich.
