# Regelwerk für Auswertung und Optimierung

Bild dazu: Die Wetterstation misst rund um die Uhr, der Wochen-Review ist der Trainer, der sich die Spielaufzeichnungen ansieht. Taktik wird erst geändert, wenn genug Spiele ausgewertet sind – nicht nach einer einzelnen Niederlage.

## Täglicher Wal-Block (Morgencheck 7 Uhr)
1. Repo aktualisieren, die Momentaufnahmen der letzten 24 Std. aus `data/history/` lesen (UTC-Dateinamen beachten).
2. Für BTC (und ETH, falls Platz) ausgeben:
   - **Bias**: Anteil Long am Notional – alle Wale, Gewinner-Wale, Verlierer-Wale.
   - **Fluss über Nacht**: Veränderung Long/Short-Notional seit 22 Uhr und seit 24 Std.
   - **Druck**: USD nahe Liquidation und im Minus je Seite (Squeeze-Risiko, wenn eine Seite überfüllt, im Minus und nahe Liq. ist).
   - **Liquiditätsmagnete**: größte Long-Liq.-Cluster unter dem Kurs und Short-Liq.-Cluster über dem Kurs, mit Abstand in % und USD.
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
