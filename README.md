# Kreuzwortdrucker v0.3.4

PWA-Prototyp für einen deutschen Kreuzworträtsel-Generator mit eingebautem deutschem Vollfundus, Wortformenfilter, gewichteter Wortarten-Auswahl, Zusatzimport, Ausschlussliste, Fragenverwaltung und Export für Buchsatz/Canva.

## Enthalten in v0.3.4

- PWA-Grundstruktur mit Manifest und Service Worker
- einstellbares Zielformat, z. B. 22 × 15 Kästchen
- Standard-Mindestwortlänge 3, damit klassische kurze Kreuzwortbegriffe wie ERZ möglich bleiben
- Button „Rätsel erstellen“ erzeugt das Rätsel direkt aus dem eingebauten Wörterbuchfundus
- eingebauter deutscher Vollfundus aus `@cspell/dict-de-de` 4.1.2 / de-DE_frami / igerman98
- rund 759.000 normalisierte, deduplizierte Wörter im eingebauten Fundus
- Wortformenfilter mit drei Modi: basisnah, streng und alle Wörterbuchformen
- gewichtete Wortarten-Auswahl mit Standardverhältnis 60:20:10:10
  - 60 % Substantive
  - 20 % Adjektive
  - 10 % Verben
  - 10 % Andere
- Wortarten werden heuristisch aus Schreibweise, Groß-/Kleinschreibung und typischen Endungen geschätzt
- Wörterbuchstatus zeigt aktive Wortformenfilter und Wortarten-Gewichtung
- Wörterbuchsuche zeigt zu Treffern eine geschätzte Wortart an
- optionale Zusatz-/Wunschwörter im Textfeld
- optionale Leitwörter waagrecht/senkrecht
- optionale Liste „Nicht verwenden“ für Wörter, die ausgeschlossen werden sollen
- in der Lösungsliste kann ein Wort mit „nicht verwenden“ gesperrt und das Rätsel direkt neu erzeugt werden
- zusätzlicher Import lokaler Wortlisten als TXT oder einfache Hunspell-DIC-Dateien
- Import bleibt als Ergänzung erhalten, z. B. für englische Wörter, Fremdwörter, Eigennamen oder Fachbegriffe
- lokale Speicherung importierter Zusatzlisten im Browser über IndexedDB
- automatische Umschrift: Ä → AE, Ö → OE, Ü → UE, ß → SS
- Wörterbuch-Normalisierung und Bereinigung:
  - Hunspell-Flags nach `/` werden entfernt
  - Leer-/Sonderzeichen werden bereinigt
  - die aktuelle Mindestwortlänge filtert die Auswahl für das Rätsel
- Erkennung von Dubletten und mehrdeutigen Gitterformen bei Import-/Zusatzlisten
- interne Suche über eingebauten Vollfundus plus importierte Zusatzliste
- einfacher Freiform-im-Format-Generator
- automatische Nummerierung
- leere Rätselansicht
- gelöste Rätselansicht
- Lösungsliste waagrecht/senkrecht
- Anzeige nicht platzierter Kandidaten und Hinweise
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

## Änderungen gegenüber v0.3.3

- neuer Bereich „Wortarten-Gewichtung“ ergänzt
- Standardgewichtung 60:20:10:10 für Substantive, Adjektive, Verben und andere Wortformen
- Generator zieht Kandidaten nun nach gewichteten Wortarten-Buckets statt nur nach Länge/Zufall
- Substantive werden deutlich bevorzugt, damit weniger Verbformen im Rätsel landen
- Verben bleiben erlaubt, treten aber deutlich seltener auf
- Wörterbuchsuche zeigt bei Treffern die geschätzte Wortart an
- Wörterbuchstatus zeigt die aktive Gewichtung an
- Service-Worker-Cache und Versionsnummer wurden auf v0.3.4 erhöht

## Noch nicht enthalten

- perfekte grammatische Wortartenanalyse
- echte Kategorien wie Abkürzung, Fremdwort, Eigenname
- gezielte Qualitätsbewertung der Wörter nach Häufigkeit oder Verständlichkeit
- XLSX-Export
- PNG-Export
- manuelle Nachbearbeitung einzelner Wörter im Gitter
- klassischer Rastergenerator mit gezieltem Schwarzfeldmuster
- vollständige Konsistenzprüfung nach manuellen Änderungen
- Import gespeicherter Projekt-JSON-Dateien

## Nutzung

1. Ordner lokal über einen kleinen Webserver ausliefern.
2. Mindestwortlänge, Format, maximale Wortanzahl und Wortformenfilter einstellen.
3. Optional die Wortarten-Gewichtung anpassen.
4. Optional Zusatz-/Wunschwörter oder Leitwörter eintragen.
5. Optional Wörter unter „Nicht verwenden“ eintragen.
6. Optional eine TXT- oder DIC-Zusatzliste importieren.
7. „Rätsel erstellen“ klicken.
8. Bei Bedarf Wörter in der Lösungsliste mit „nicht verwenden“ sperren und neu erzeugen lassen.
9. Unter dem Gitter Fragen zu den nummerierten Wörtern eintragen.
10. Gitter, Lösung und Fragen exportieren.

Für PWA/Service-Worker-Funktion am besten über einen lokalen Webserver testen, z. B.:

```bash
python -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## Hinweise zur eingebauten Wortliste

Die eingebaute Liste wurde aus dem npm-Paket `@cspell/dict-de-de` Version 4.1.2 erzeugt. Das Paket basiert auf de-DE_frami / igerman98. Für die Kreuzwortnutzung wurde die Liste normalisiert und nach Gitterform dedupliziert. Wörter mit Umlauten oder ß werden im Gitter als AE/OE/UE/SS verarbeitet.

Weitere Hinweise stehen in `THIRD_PARTY_NOTICES.md` und `LICENSE-cspell-dict-de-de.txt`.

## Hinweise zur Wortarten-Gewichtung

Die Wortarten-Gewichtung ist bewusst heuristisch. Die Wörterbuchquelle liefert keine zuverlässigen Wortart-Tags für alle Einträge. Der Kreuzwortdrucker schätzt daher anhand von Groß-/Kleinschreibung und typischen Endungen, ob ein Wort eher Substantiv, Adjektiv, Verb oder „Andere“ ist.

Für Kreuzworträtsel ist das ein praktischer Filter, aber keine linguistische Tiefenbohrung. Die Einstellung 60:20:10:10 sorgt dafür, dass Substantive deutlich häufiger im Kandidatenpool landen, ohne Adjektive, Verben und kurze klassische Kreuzwortbegriffe vollständig auszuschließen.

## Hinweise zum Generator

Der Generator ist in v0.3.4 weiterhin bewusst einfach gehalten. Er zieht Kandidaten aus dem großen Wörterbuchfundus, filtert je nach Einstellung typische gebeugte Formen, gewichtet die Kandidatenauswahl nach geschätzten Wortarten, sucht Kreuzungen und setzt nicht genutzte Felder beim Export als schwarze Felder. Nicht platzierbare Kandidaten werden angezeigt.

Die Wortlistenfunktion ist die Grundlage für spätere Versionen mit Wortqualität, Kategorien, Abkürzungsfiltern und besserer automatischer Auswahl.
