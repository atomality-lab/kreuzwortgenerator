# Kreuzwortdrucker v0.1.0

PWA-Prototyp für einen deutschen Kreuzworträtsel-Generator mit Export für Buchsatz/Canva.

## Enthalten in v0.1.0

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
- Export als SVG:
  - leeres Gitter
  - gelöstes Gitter
- Export als TXT:
  - Lösungsliste
- Export als JSON:
  - Projektstand
- lokale Speicherung der letzten Eingaben im Browser

## Noch nicht enthalten

- Wörterbuchimport
- echte Kategorien wie Abkürzung, Fremdwort, Eigenname
- XLSX-/CSV-Fragenexport
- PNG-Export
- manuelle Nachbearbeitung einzelner Wörter im Gitter
- klassischer Rastergenerator mit gezieltem Schwarzfeldmuster
- vollständige Konsistenzprüfung nach manuellen Änderungen

## Nutzung

1. `index.html` im Browser öffnen oder den Ordner lokal über einen kleinen Webserver ausliefern.
2. Wörter eingeben oder Beispiel laden.
3. Format einstellen.
4. „Rätsel erstellen“ klicken.
5. Leeres oder gelöstes Gitter als SVG exportieren.

Für PWA/Service-Worker-Funktion am besten über einen lokalen Webserver testen, z. B.:

```bash
python -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## Hinweise zum Generator

Der Generator ist in v0.1.0 bewusst einfach gehalten. Er sucht Kreuzungen zwischen den eingegebenen Wörtern und setzt nicht nutzbare Felder beim Export als schwarze Felder. Nicht platzierbare Wörter werden angezeigt.

Für die nächsten Versionen ist der Ausbau in Richtung Wörterbuch, Qualitätsfilter, Fragenverwaltung und Canva-Exportpaket vorgesehen.
