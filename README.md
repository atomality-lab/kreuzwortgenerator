# Kreuzwortdrucker v0.3.1

PWA-Prototyp für einen deutschen Kreuzworträtsel-Generator mit eingebauter Basis-Wortliste, Zusatzimport, Fragenverwaltung und Export für Buchsatz/Canva.

## Enthalten in v0.3.1

- PWA-Grundstruktur mit Manifest und Service Worker
- einstellbares Zielformat, z. B. 22 × 15 Kästchen
- Eingabe einer eigenen Wortliste
- eingebaute deutsche Basis-Wortliste mit rund 800 handkuratierten Begriffen
- Button „Wortliste aus Basisliste füllen“
- zusätzlicher Import lokaler Wortlisten als TXT oder einfache Hunspell-DIC-Dateien
- Import bleibt als Ergänzung erhalten, z. B. für englische Wörter, Fremdwörter, Eigennamen oder Fachbegriffe
- lokale Speicherung importierter Zusatzlisten im Browser über IndexedDB
- automatische Umschrift: Ä → AE, Ö → OE, Ü → UE, ß → SS
- Wörterbuch-Normalisierung und Bereinigung:
  - Hunspell-Flags nach `/` werden entfernt
  - Leer-/Sonderzeichen werden bereinigt
  - sehr kurze Wörter unter 3 Buchstaben werden ausgeschlossen
  - die aktuelle Mindestwortlänge filtert die Auswahl für das Rätsel
- Erkennung von Dubletten und mehrdeutigen Gitterformen
  - Beispiel: „Masse“ und „Maße“ ergeben beide `MASSE`
- interne Suche über eingebaute Basisliste plus importierte Zusatzliste
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

## Änderungen gegenüber v0.3.0

- Eine eingebaute deutsche Basis-Wortliste wird direkt mitgeliefert.
- Die App ist sofort nutzbar, ohne dass zuerst ein externes Wörterbuch heruntergeladen werden muss.
- Der bisherige Wörterbuchimport bleibt erhalten, arbeitet aber jetzt als Zusatzliste.
- „Wörterbuch entfernen“ wurde zu „Zusatzliste entfernen“: Die eingebaute Basisliste bleibt immer aktiv.
- Service-Worker-Cache und Versionsnummer wurden auf v0.3.1 erhöht.

## Noch nicht enthalten

- große vollständige Hunspell-/igerman98-Wortliste als mitgelieferter Datenbestand
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
2. Mindestwortlänge, Format und maximale Wortanzahl einstellen.
3. Optional „Wortliste aus Basisliste füllen“ klicken oder eigene Wörter eingeben.
4. Optional eine TXT- oder DIC-Zusatzliste importieren.
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

## Hinweise zur eingebauten Wortliste

Die eingebaute Basisliste ist eine handkuratierte Startliste, damit der Kreuzwortdrucker sofort ohne externen Download nutzbar ist. Sie ist noch keine vollständige Rechtschreib- oder Kreuzworträtselwortliste. Für spätere Versionen kann diese Liste durch eine größere geprüfte Open-Source-Wortbasis ersetzt oder erweitert werden.

Der Import bleibt bewusst erhalten. TXT-Dateien sollten ein Wort pro Zeile enthalten. Hunspell-DIC-Dateien werden einfach gelesen, wobei die erste Zählzeile und Flags nach `/` ignoriert werden. Affix-Regeln aus `.aff`-Dateien werden in v0.3.1 noch nicht ausgewertet.

## Hinweise zum Generator

Der Generator ist in v0.3.1 weiterhin bewusst einfach gehalten. Er sucht Kreuzungen zwischen den ausgewählten Wörtern und setzt nicht nutzbare Felder beim Export als schwarze Felder. Nicht platzierbare Wörter werden angezeigt.

Die Wortlistenfunktion ist die Grundlage für spätere Versionen mit Wortqualität, Kategorien, Abkürzungsfiltern und besserer automatischer Auswahl.
