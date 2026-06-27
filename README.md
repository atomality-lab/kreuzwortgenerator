# Kreuzwortdrucker v0.2.0

PWA-Prototyp für einen deutschen Kreuzworträtsel-Generator mit Export für Buchsatz/Canva.

## Enthalten in v0.2.0

- PWA-Grundstruktur mit Manifest und Service Worker
- einstellbares Zielformat, z. B. 22 × 15 Kästchen
- Eingabe einer eigenen Wortliste
- automatische Umschrift: Ä → AE, Ö → OE, Ü → UE, ß → SS
- einfacher Freiform-im-Format-Generator
- Button „Rätsel erstellen“
- optionale Leitwörter waagrecht/senkrecht als frühe Testfunktion
- automatische Nummerierung
- leere Rätselansicht
- gelöste Rätselansicht
- Lösungsliste waagrecht/senkrecht
- Anzeige nicht platzierter Wörter und Hinweise
- Fragenverwaltung direkt unter dem Gitter:
  - getrennte Bereiche für Waagrecht und Senkrecht
  - Textfeld pro Nummer/Lösungswort
  - Anzeige von Originalwort, Gitterwort und Wortlänge
  - Status „Frage fehlt“ / „Frage eingetragen“
  - Fragen bleiben lokal im Browser gespeichert und werden möglichst über Richtung + Lösungswort wieder zugeordnet
- Export als SVG:
  - leeres Gitter
  - gelöstes Gitter
- Export als TXT:
  - Lösungsliste
  - Fragenkatalog
- Export als CSV:
  - Fragenkatalog mit Nummer, Richtung, Frage, Originalwort, Gitterwort, Länge und Status
- Export als JSON:
  - Projektstand inklusive Fragen
- lokale Speicherung der letzten Eingaben und Fragen im Browser

## Noch nicht enthalten

- Wörterbuchimport
- echte Kategorien wie Abkürzung, Fremdwort, Eigenname
- XLSX-Export
- PNG-Export
- manuelle Nachbearbeitung einzelner Wörter im Gitter
- klassischer Rastergenerator mit gezieltem Schwarzfeldmuster
- vollständige Konsistenzprüfung nach manuellen Änderungen
- Import gespeicherter Projekt-JSON-Dateien

## Nutzung

1. `index.html` im Browser öffnen oder den Ordner lokal über einen kleinen Webserver ausliefern.
2. Wörter eingeben oder Beispiel laden.
3. Format einstellen.
4. „Rätsel erstellen“ klicken.
5. Unter dem Gitter Fragen zu den nummerierten Wörtern eintragen.
6. Leeres oder gelöstes Gitter als SVG exportieren.
7. Fragen als TXT oder CSV exportieren.

Für PWA/Service-Worker-Funktion am besten über einen lokalen Webserver testen, z. B.:

```bash
python -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## Hinweise zum Generator

Der Generator ist in v0.2.0 weiterhin bewusst einfach gehalten. Er sucht Kreuzungen zwischen den eingegebenen Wörtern und setzt nicht nutzbare Felder beim Export als schwarze Felder. Nicht platzierbare Wörter werden angezeigt.

Die neue Fragenverwaltung ist bereits auf den späteren Buchsatz ausgerichtet: Das Gitter kann separat exportiert werden, die Fragen können als Text oder CSV in Canva, Excel oder ein anderes Satzprogramm übernommen werden.

Für die nächsten Versionen ist der Ausbau in Richtung Wörterbuch, Qualitätsfilter, PNG-Export, Projektimport und komfortablere Nachbearbeitung vorgesehen.
