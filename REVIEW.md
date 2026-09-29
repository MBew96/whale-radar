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
3. Nur Signale verwenden, die in `config/settings.json` auf `active: true` stehen.
4. Der Wal-Block ist **ein Baustein** der Ampel, nie allein ausschlaggebend. Kurz halten (3–5 Zeilen) und die Datenlage nennen (z. B. „Messungen seit …, Lücken …“).

## Wochen-Review (sonntags)
### Datenlage prüfen
- Anzahl Messungen, Lücken (> 30 Min. ohne Messung), Fehlerquote (`n.err`), Anzahl Wallets mit Positionen.

### Signal-Bilanz (erst ab 14 Tagen Daten, Änderungen erst ab 21 Tagen)
Für jedes Signal aus `config/settings.json` → `signals`:
- Zu jedem Messzeitpunkt das Signal auswerten (Richtung: long/short/neutral).
- Den späteren BTC-Preis in 1 Std., 4 Std. und 24 Std. aus den folgenden Momentaufnahmen (`px.BTC`) ablesen.
- Trefferquote = Anteil der Fälle, in denen sich der Preis in Signalrichtung bewegt hat; dazu die durchschnittliche Bewegung in %.
- Nur nicht überlappende Fälle zählen (mindestens 4 Std. Abstand zwischen zwei gezählten Fällen desselben Signals), sonst zählt ein Ereignis vielfach.
- Mindestens 30 Fälle, bevor eine Trefferquote als belastbar gilt. Darunter: „zu wenig Daten“.
- Vergleich mit dem Zufall: Trefferquote muss deutlich über 50 % liegen (Faustregel: ≥ 56 % bei ≥ 30 Fällen) und in beiden Hälften des Zeitraums in dieselbe Richtung zeigen (Test auf ungesehenen Daten).

### Intraday-Kompass
- Der Kompass (`compass`) wird in der Bilanz wie ein eigenes Signal bewertet (Richtung = Vorzeichen des Scores ab `compassMin`).
- Gewichte (`signals.*.weight`) frühestens nach 21 Tagen und höchstens in Schritten von ±0,5 ändern, und nur, wenn ein Signal in beiden Hälften des Zeitraums klar besser bzw. schlechter als der Vergleichswert abschneidet. Ein Signal mit Gewicht 0 bleibt im Beobachtungsmodus.
- Jede Gewichtsänderung mit Vorher/Nachher-Trefferquote des Kompasses im CHANGELOG belegen.

### Börsendaten (Beobachtungsmodus seit 29.09.2026)
- `review.py` bewertet zusätzlich die Signale aus `settings.json` → `beobachtung.signals` (in der Tabelle mit „(Beobachtung)“ markiert). Gleiche Regeln: nicht überlappend, ≥ 30 Fälle, ≥ 56 % und beide Hälften > 50 %.
- Vorab festgelegte Hypothesen (nicht nachträglich umdeuten):
  - `cbPremium`: Coinbase-Premium ≥ +0,03 % → long, ≤ −0,03 % → short (US-Nachfrage führt).
  - `cexFundingFade`: OI-gewichtetes Funding ≥ 0,02 %/8 Std. → short, < 0 → long (überfüllte Seite zahlt).
  - `cexOiTrend`: OI aller Börsen inkl. Hyperliquid +1,5 % in 4 Std. → in Kursrichtung derselben 4 Std. (neues Geld drückt).
  - `cexTopTraders`: große Positionen an OKX/Bitget/Gate ≥ 53 % long → long, ≤ 47 % → short.
  - `bnSpotTaker`: Taker-Käufe Binance Spot ≥ 55 % der letzten Std. → long, ≤ 45 % → short.
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
