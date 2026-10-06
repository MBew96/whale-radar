#!/usr/bin/env python3
"""Wächter für die Wetterstation: prüft data/history auf Messlücken.

Ausgabe eine Zeile, z. B.
  Wetterstation OK: letzte Messung vor 7 Min., keine Lücke > 30 Min. in 24 h (142 Messungen)
  Wetterstation LÜCKE: letzte Messung vor 95 Min.; Lücken > 30 Min.: 05.10. 20:50–23:32 MESZ (162 Min.)
Exit-Code 0 = OK, 1 = Lücke gefunden. Nur lesen, ändert nichts.
"""
import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

BERLIN = ZoneInfo("Europe/Berlin")


def zeiten(history: Path):
    for f in history.glob("*/*.json"):
        try:
            yield datetime.strptime(f"{f.parent.name} {f.stem}", "%Y-%m-%d %H%M").replace(tzinfo=timezone.utc)
        except ValueError:
            continue


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stunden", type=int, default=24)
    ap.add_argument("--max-min", type=int, default=30)
    a = ap.parse_args()

    history = Path(__file__).resolve().parent.parent / "data" / "history"
    jetzt = datetime.now(timezone.utc)
    start = jetzt - timedelta(hours=a.stunden)
    ts = sorted(t for t in zeiten(history) if t >= start - timedelta(hours=2))
    if not ts:
        print(f"Wetterstation LÜCKE: keine Messung in den letzten {a.stunden} h")
        return 1

    grenze = timedelta(minutes=a.max_min)
    luecken = []
    for vor, nach in zip(ts, ts[1:]):
        if nach >= start and nach - vor > grenze:
            luecken.append((max(vor, start), nach))
    alter = jetzt - ts[-1]
    if alter > grenze:
        luecken.append((ts[-1], None))

    def hm(t):
        return t.astimezone(BERLIN).strftime("%d.%m. %H:%M")

    n = sum(1 for t in ts if t >= start)
    alter_min = int(alter.total_seconds() // 60)
    if not luecken:
        print(f"Wetterstation OK: letzte Messung vor {alter_min} Min., keine Lücke > {a.max_min} Min. "
              f"in {a.stunden} h ({n} Messungen)")
        return 0
    teile = []
    for v, b in luecken:
        if b is None:
            teile.append(f"seit {hm(v)} offen")
        else:
            teile.append(f"{hm(v)}–{b.astimezone(BERLIN).strftime('%H:%M')} ({int((b - v).total_seconds() // 60)} Min.)")
    print(f"Wetterstation LÜCKE: letzte Messung vor {alter_min} Min.; Lücken > {a.max_min} Min. "
          f"(MESZ): " + "; ".join(teile) + f" ({n} Messungen in {a.stunden} h)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
