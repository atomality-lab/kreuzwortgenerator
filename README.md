# Kreuzwortdrucker v0.3.0

PWA-Prototyp für einen deutschen Kreuzworträtsel-Generator mit Export für Buchsatz/Canva.

## Enthalten in v0.3.0

- PWA-Grundstruktur mit Manifest und Service Worker
- einstellbares Zielformat, z. B. 22 × 15 Kästchen
- Eingabe einer eigenen Wortliste
- Import lokaler Open-Source-Wortlisten als TXT oder Hunspell-DIC
- lokale Speicherung des importierten Wörterbuchs im Browser über IndexedDB
- automatische Umschrift: Ä → AE, Ö → OE, Ü → UE, ß → SS
- Wörterbuch-Normalisierung und Bereinigung:
  - Hunspell-Flags nach `/` werden entfernt
  - Leer-/Sonderzeichen werden bereinigt
  - sehr kurze Wörter unter 3 Buchstaben werden beim Import ausgeschlossen
  - die aktuelle Mindestwortlänge filtert die Auswahl für das Rätsel
- Erkennung von Dubletten und mehrdeutigen Gitterformen
  - Beispiel: „Masse“ und „Maße“ ergeben beide `MASSE`
- interne Wörterbuchsuche mit Filter nach aktueller Mindestlänge und Formatgröße
- Button „Wortliste aus Wörterbuch füllen“
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
- Exportbereich direkt unter dem Gitter
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

- echte Kategorien wie Abkürzung, Fremdwort, Eigenname
- gezielte Qualitätsbewertung der Wörter
- automatische semantische Auswahl anspruchsvoller Wörter
- XLSX-Export
- PNG-Export
- manuelle Nachbearbeitung einzelner Wörter im Gitter
- klassischer Rastergenerator mit gezieltem Schwarzfeldmuster
- vollständige Konsistenzprüfung nach manuellen Änderungen
- Import gespeicherter Projekt-JSON-Dateien

## Nutzung

1. Ordner lokal über einen kleinen Webserver ausliefern.
2. Optional eine TXT- oder DIC-Wortliste importieren.
3. Mindestwortlänge, Format und maximale Wortanzahl einstellen.
4. Optional „Wortliste aus Wörterbuch füllen“ klicken oder eigene Wörter eingeben.
5. „Rätsel erstellen“ klicken.
6. Unter dem Gitter Fragen zu den nummerierten Wörtern eintragen.
7. Gitter, Lösung und Fragen exportieren.

Für PWA/Service-Worker-Funktion am besten über einen lokalen Webserver testen, z. B.:

```bash
python -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## Hinweise zum Wörterbuch

Das Programm liefert bewusst keine große Wortliste mit. Importiere nur Wortlisten, deren Lizenz für Deinen Zweck passt. Der Import läuft lokal im Browser; die Wörter werden nicht an einen Server übertragen.

TXT-Dateien sollten ein Wort pro Zeile enthalten. Hunspell-DIC-Dateien werden einfach gelesen, wobei die erste Zählzeile und Flags nach `/` ignoriert werden. Affix-Regeln aus `.aff`-Dateien werden in v0.3.0 noch nicht ausgewertet.

## Hinweise zum Generator

Der Generator ist in v0.3.0 weiterhin bewusst einfach gehalten. Er sucht Kreuzungen zwischen den ausgewählten Wörtern und setzt nicht nutzbare Felder beim Export als schwarze Felder. Nicht platzierbare Wörter werden angezeigt.

Die Wörterbuchfunktion ist die Grundlage für spätere Versionen mit Wortqualität, Kategorien, Abkürzungsfiltern und besserer automatischer Auswahl.
