# Regelwerk für Auswertung und Optimierung

Bild dazu: Die Wetterstation misst rund um die Uhr, der Wochen-Review ist der Trainer, der sich die Spielaufzeichnungen ansieht. Taktik wird erst geändert, wenn genug Spiele ausgewertet sind – nicht nach einer einzelnen Niederlage.

## Täglicher Wal-Block (Morgencheck 7 Uhr)
1. Repo aktualisieren, die Momentaufnahmen der letzten 24 Std. aus `data/history/` lesen (UTC-Dateinamen beachten).
2. Für BTC (und ETH, falls Platz) ausgeben:
   - **Bias**: Anteil Long am Notional – alle Wale, Gewinner-Wale, Verlierer-Wale.
   - **Fluss über Nacht**: Veränderung Long/Short-Notional seit 22 Uhr und seit 24 Std.
   - **Druck**: USD nahe Liquidation und im Minus je Seite (Squeeze-Risiko, wenn eine Seite überfüllt, im Minus und nahe Liq. ist).
   - **Liquiditätsmagnete**: nächste große Long-Liq.-Cluster unter dem Kurs und Short-Liq.-Cluster über dem Kurs (mind. 1 % des Wal-Notionals), mit Abstand in % und USD.
   - **Intraday-Kompass**: Richtung und Score aus `tools/wal_block.py` (erste Zeile), ausdrücklich als „noch unbewertet“, solange der Review keine Bilanz hat.
   - **Zwischenstand der Signal-Bilanz** (seit 05.10.2026, Wunsch von Mirco): je Coin die Zeile aus `python3 tools/review.py --coin BTC --kurz` (und ETH) unverändert übernehmen. Nur lesen: Daraus wird täglich **nichts** bewertet oder geändert, das bleibt dem Wochen-Review mit den 14/21-Tage-Regeln vorbehalten. Trefferquote immer neben dem Markt-Vergleichswert nennen.
3. Nur Signale verwenden, die in `config/settings.json` auf `active: true` stehen.
4. Der Wal-Block ist **ein Baustein** der Ampel, nie allein ausschlaggebend. Kurz halten (3–5 Zeilen) und die Datenlage nennen (z. B. „Messungen seit …, Lücken …“).

## Wochen-Review (sonntags)
### Datenlage prüfen
- Anzahl Messungen, Lücken (> 30 Min. ohne Messung), Fehlerquote (`n.err`), Anzahl Wallets mit Positionen.
- **Bekannte Datenlücken** (nicht nachholbar, nichts auffüllen; im Bericht an Mirco ausdrücklich nennen):
  - 12.10.2026 17:10 UTC bis 16.10.2026 09:36 UTC (rund 3,7 Tage). Ursache: Ein Lauf hing an der Website-Freigabe (github-pages) und blockierte die Warteschlange. Folge: Der 14-Tage-Zeitraum vor dem Review am 18.10. enthält nur etwa 10 Tage Daten. Fallzahlen sind kleiner, und die zweite Hälfte im Hälften-Vergleich ist dünner besetzt. Für die vorab freigegebene Optimierung zum 20.10. die tatsächlichen Datentage nennen, nicht die Kalendertage.

### Signal-Bilanz (erst ab 14 Tagen Daten, Änderungen erst ab 21 Tagen)
Für jedes Signal aus `config/settings.json` → `signals`:
- Zu jedem Messzeitpunkt das Signal auswerten (Richtung: long/short/neutral).
- Den späteren BTC-Preis in 1 Std., 4 Std. und 24 Std. aus den folgenden Momentaufnahmen (`px.BTC`) ablesen.
- Trefferquote = Anteil der Fälle, in denen sich der Preis in Signalrichtung bewegt hat; dazu die durchschnittliche Bewegung in %.
- Nur nicht überlappende Fälle zählen, sonst zählt ein Ereignis vielfach. Abstand zwischen zwei gezählten Fällen desselben Signals = Horizont (1h-Test: 1 Std., 4h-Test: 4 Std., 24h-Test: 24 Std.; seit 05.10.2026, vorher pauschal 4 Std.). Der Markt-Vergleichswert wird genauso gezählt.
- Mindestens 30 Fälle, bevor eine Trefferquote als belastbar gilt. Darunter: „zu wenig Daten“.
- Vergleich mit dem Markt (seit 05.10.2026, mit Mircos OK): Maßstab ist nicht 50 %, sondern der **Markt-Vergleich** = die Trefferquote, die ein Signal mit derselben Long/Short-Mischung ohne jedes Wissen erreicht hätte (Long-Fälle treffen so oft, wie der Kurs stieg; Short-Fälle so oft, wie er fiel). „Bewährt“ = Trefferquote mindestens 6 Prozentpunkte über dem Markt-Vergleich, über 50 % und in beiden Hälften des Zeitraums über dem Markt-Vergleich (Test auf ungesehenen Daten). „Gegenindikator?“ spiegelbildlich (6 Punkte darunter, beide Hälften darunter).

### Intraday-Kompass
- Der Kompass (`compass`) wird in der Bilanz wie ein eigenes Signal bewertet (Richtung = Vorzeichen des Scores ab `compassMin`).
- Gewichte (`signals.*.weight`) frühestens nach 21 Tagen und höchstens in Schritten von ±0,5 ändern, und nur, wenn ein Signal in beiden Hälften des Zeitraums klar besser bzw. schlechter als der Vergleichswert abschneidet. Ein Signal mit Gewicht 0 bleibt im Beobachtungsmodus.
- Jede Gewichtsänderung mit Vorher/Nachher-Trefferquote des Kompasses im CHANGELOG belegen.

### Vorab freigegebene Optimierung zum 20.10.2026 (OK von Mirco, 13.10.2026)
Diese Regeln wurden am 13.10.2026 festgelegt. Sie gehen ausnahmsweise über die Schritte von ±0,5 hinaus. Später werden sie nicht umgedeutet. Stichtag ist frühestens der 20.10.2026, ab dann liegen 21 Tage Daten vor. Maßgeblich ist die Ausgabe von `review.py`, BTC entscheidet (Mircos Hauptmarkt), ETH dient zur Kontrolle.
1. **Klemmende Nadel lösen:** `biasWinners` und `biasLosersFade` bekommen jeweils Gewicht 0 (Beobachtung, `active` bleibt true), wenn ihre BTC-Trefferquote im 1h-Test **und** im 4h-Test (je ≥ 30 Fälle) weniger als 3 Punkte über dem Markt-Vergleich liegt. Steht dasselbe Signal bei ETH im 1h- oder 4h-Test auf „bewährt“, bleibt es unverändert.
2. **Gegenindikatoren drehen:** Ein Kompass-Signal aus `signals` (nicht `compass`, nicht `takerFlow`, keine Beobachtungs-Signale) bekommt ein negatives Gewicht (−|Gewicht|), wenn es bei BTC im 1h- oder 4h-Test mit ≥ 30 Fällen auf „Gegenindikator?“ steht. Ausnahme: Es steht bei ETH im selben Horizont auf „bewährt“. Ein negatives Gewicht spiegelt das Signal, `tools/common.py` und das Dashboard rechnen dafür mit |Gewicht| im Nenner. Ein 24h-Befund zählt nicht, weil der Kompass für 1–4 Std. gedacht ist.
   - **Vorrang (Entscheidung Mirco, 19.10.2026):** Erfüllt ein Signal Regel 1 und Regel 2 zugleich, gilt Regel 1 (Gewicht 0, Beobachtung). Anlass: `biasLosersFade` stand am 18.10. nach Regel 1 auf 0 und nach Regel 2 auf −1.
3. **Belegen:** Vor dem Umsetzen den Kompass mit den neuen Gewichten rechnen: `python3 review.py --coin BTC --settings <Kopie mit neuen Gewichten>`, ebenso für ETH. Die Vorher/Nachher-Trefferquote des Kompasses (1h/4h, BTC und ETH) kommt ins CHANGELOG. Diese Nachher-Zahlen sind „im Rückblick gewählt“ und damit geschönt. Ob die Änderung trägt, zeigen erst die Fälle ab dem Stichtag.
4. **Rückweg:** Liegt der geänderte Kompass zwei Wochen nach dem Stichtag auf den neuen Fällen im 1h-Test **unter** dem Markt-Vergleich, wird das an Mirco gemeldet, mit dem Vorschlag, die Gewichte zurückzusetzen.
5. Alles andere bleibt Vorschlag an Mirco, z. B. Kompass B als Live-Kompass oder Beobachtungs-Signale in den Kompass.

### Börsendaten (Beobachtungsmodus seit 29.09.2026)
- `review.py` bewertet zusätzlich die Signale aus `settings.json` → `beobachtung.signals` (in der Tabelle mit „(Beobachtung)“ markiert). Gleiche Regeln: nicht überlappend, ≥ 30 Fälle, ≥ 56 % und beide Hälften > 50 %.
- Vorab festgelegte Hypothesen (nicht nachträglich umdeuten):
  - `cbPremium`: Coinbase-Premium ≥ +0,03 % → long, ≤ −0,03 % → short (US-Nachfrage führt).
  - `cexFundingFade`: OI-gewichtetes Funding ≥ 0,02 %/8 Std. → short, < 0 → long (überfüllte Seite zahlt).
  - `cexOiTrend`: OI aller Börsen inkl. Hyperliquid +1,5 % in 4 Std. → in Kursrichtung derselben 4 Std. (neues Geld drückt).
  - `cexTopTraders`: große Positionen an OKX/Bitget/Gate ≥ 53 % long → long, ≤ 47 % → short.
  - `bnSpotTaker`: Taker-Käufe Binance Spot ≥ 55 % der letzten Std. → long, ≤ 45 % → short.
- Relative Wal-Signale (seit 07.10.2026, `beobachtung.relativ`, Hypothese vorab festgelegt): Long-Anteil ≥ 5 Punkte über dem eigenen 72-Std.-Median → long, ≤ 5 darunter → short (`relWinners`, `relAll`; `relLosersFade` gespiegelt). `relCompass` = Kompass B aus diesen drei plus Fluss 4 Std. und Magnet, gleiche Gewichte. Für die Bewertung zählen nur die Fälle ab 08.10.2026 (ungesehene Daten; eigener Abschnitt in `review.py` seit 13.10.2026); die Rückrechnung davor diente nur der Prüfung, dass die Signale drehen. Frühestens ab 19.10.2026 Vorschlag an Mirco, ob Kompass B den Live-Kompass ersetzt oder ein Signal als Gegenindikator geführt wird.
- Datenlage der Börsendaten mitberichten (Zeile „Börsendaten“: Anzahl Messungen, häufigste Ausfälle). Fällt eine Quelle dauerhaft aus (> 50 % der Messungen), im Bericht nennen und mit dem Workflow „Quellen-Test“ neu prüfen.
- Frühestens nach 3 Wochen (ab 20.10.2026): Vorschlag an Mirco, welches Beobachtungs-Signal ins Dashboard bzw. mit welchem Startgewicht in den Kompass kommt. Ohne sein OK nichts davon als Signal in Kompass, Lagebild oder Morgencheck übernehmen. (Die Infokachel „Gesamtmarkt“ zeigt die Rohwerte seit 29.09.2026 ohne Wertung.)

### Optimieren
- Signale, die die Hürde klar reißen, bleiben aktiv; Signale, die über ≥ 3 Wochen klar unter 50 % liegen, als „Gegenindikator“ prüfen oder deaktivieren (Vorschlag an Mirco).
- Schwellenwerte (z. B. `biasStrong`) höchstens in kleinen Schritten ändern und nur, wenn die Verbesserung in beiden Hälften des Zeitraums auftritt.
- Neue Indikatoren/On-Chain-Daten zuerst nur mitschreiben (Beobachtungsmodus), erst nach 3 Wochen Bewertung ins Dashboard nehmen.
- Ergebnis immer in `CHANGELOG.md` festhalten, auch wenn die Entscheidung „nichts ändern“ lautet.

### Bericht an Mirco
- 5–10 Zeilen: Datenlage, Top-Signale mit Trefferquote und Fallzahl, was geändert wurde und warum, was als Vorschlag wartet.
- Ehrlich bleiben: Wenn die Daten nichts hergeben, genau das sagen.

## Datenpflege
- Momentaufnahmen älter als 90 Tage einmal im Monat zu Tagesdateien zusammenfassen (`data/archive/JJJJ-MM-TT.json`), damit das Repo schlank bleibt.
