# Kreuzwortdrucker v0.4.0

PWA-Prototyp zum Erzeugen, Bearbeiten und Exportieren von Kreuzworträtseln für Buchsatz/Canva.

## Enthalten in v0.4.0

### Persönlicher Wortschatz

- eigener persönlicher Wortschatz wird lokal im Browser gespeichert
- Standardliste „Allgemein“
- neue Listen anlegen, z. B. Philosophie, Pflege, IT, Medizin
- Wörter manuell hinzufügen
- TXT-/CSV-Wortlisten in die ausgewählte Liste importieren
- persönliche Wörter durchsuchen
- Wörter aus einer Liste entfernen
- Wörter als „gesperrt“ markieren und wieder freigeben
- gesperrte persönliche Wörter werden bei der Generierung ausgeschlossen
- persönliche Liste kann in das Feld „Zusatz-/Wunschwörter“ übernommen werden
- persönlicher Wortschatz kann als JSON exportiert und später wieder importiert werden

### Deutscher Vollfundus

- eingebauter deutscher Wortfundus aus `@cspell/dict-de-de` 4.1.2
- Quelle: de-DE_frami / igerman98
- Umlaute und ß werden automatisch in AE/OE/UE/SS normalisiert
- Wortformenfilter: basisnah, streng, alle Wörterbuchformen
- heuristische Wortarten-Gewichtung: Substantive, Adjektive, Verben, Andere
- zusätzliche TXT-/DIC-Wortlisten können als Ergänzungsfundus importiert werden

### Rätsel

- Format einstellbar, z. B. 22 × 15 Kästchen
- Mindestwortlänge einstellbar
- maximale Wortanzahl einstellbar
- optionale Leitwörter waagrecht/senkrecht
- automatische Platzierung als Freiform-im-Format
- ungenutzte Felder werden beim Export schwarz dargestellt
- automatische Nummerierung
- leere und gelöste Ansicht
- Lösungsliste waagrecht/senkrecht
- Fragenfelder pro Wort

### Export

- leeres Gitter als SVG
- gelöstes Gitter als SVG
- Lösungsliste als TXT
- Fragen als TXT
- Fragen als CSV
- Projektstand als JSON
- persönlicher Wortschatz als JSON

## Nutzung

Die App sollte über einen lokalen Webserver oder GitHub/Netlify/GitHub Pages geöffnet werden. Nicht per direktem Doppelklick auf `index.html`, da PWA-Funktionen und Service Worker sonst je nach Browser eingeschränkt sind.

Lokal im entpackten Ordner starten:

```bash
python -m http.server 8000
```

Dann öffnen:

```text
http://localhost:8000
```

## Arbeitsweise mit persönlichem Wortschatz

1. Im Bereich „Persönlicher Wortschatz“ eine Liste anlegen, z. B. „Philosophie“.
2. Wörter manuell hinzufügen oder eine TXT-/CSV-Liste importieren.
3. Die Liste mit „Liste ins Rätsel übernehmen“ in die Zusatz-/Wunschwörter übernehmen.
4. „Rätsel erstellen“ klicken.
5. Nicht gewünschte Wörter sperren oder in „Nicht verwenden“ aufnehmen.
6. Rätsel neu erzeugen.
7. Fragen erfassen und Exportdateien erzeugen.

Die eigentliche Zwei-Schritt-Logik „erst Themenliste platzieren, danach Lücken mit Datenbankwörtern füllen“ ist für die nächste Ausbaustufe vorbereitet, aber in v0.4.0 noch nicht vollständig getrennt umgesetzt.

## Wichtige Hinweise

Der persönliche Wortschatz liegt lokal im Browser. Vor Cache-/Website-Datenlöschungen bitte den persönlichen Wortschatz als JSON exportieren.

Der Generator ist weiterhin ein Prototyp. Er nutzt den großen deutschen Fundus und persönliche Wörter, aber die spätere Qualitätslogik für gezieltes Füllen, Variantenvergleich und Themenpriorisierung kommt in den Folgeversionen.

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Gestaltung
- `app.js` – Logik, Generator, persönlicher Wortschatz, Export
- `builtin-de.js` – eingebauter deutscher Wortfundus
- `manifest.webmanifest` – PWA-Manifest
- `service-worker.js` – Offline-/Cache-Grundlage
- `THIRD_PARTY_NOTICES.md` – Quellen- und Lizenzhinweise
- `LICENSE-cspell-dict-de-de.txt` – Lizenzhinweis zur Wörterbuchquelle

## Nächste sinnvolle Version

### v0.5.0: Rätsel aus persönlicher Liste

- Liste auswählen
- Wörter der Liste als Hauptwörter priorisieren
- möglichst viele Wörter der Liste platzieren
- persönliche Wörter klar markieren
- nicht platzierte Themenwörter separat anzeigen
- optional danach zweiter Schritt „Lücken füllen“ vorbereiten
