# Kreuzwortdrucker v0.5.1

PWA-Prototyp für die Erstellung druckfähiger deutscher Kreuzworträtsel mit großem deutschem Wortfundus, persönlichem Wortschatz, Fragenverwaltung und SVG-/TXT-/CSV-Export.

## Neu in v0.5.1

- Oberfläche aufgeräumt: persönliche Listen stehen stärker im Mittelpunkt
- Datenbank-Wortschatz ist jetzt standardmäßig eingeklappt und als Hintergrund-/Füllfundus beschrieben
- Wörterbuchsuche zeigt ohne Suchbegriff keine lange Vorschau mehr an
- Bereich für aktuelle Themenwörter und Ausschlüsse ist in einen eigenen aufklappbaren Arbeitskorb gewandert
- „Nicht platziert“ zeigt prominent nur noch nicht platzierte Themenwörter, nicht mehr jeden verworfenen Datenbank-Füllkandidaten
- Statistik unterscheidet zwischen platzierten Wörtern und nicht platzierten Themenwörtern
- Texte von „Zusatz-/Wunschwörter“ zu „Themenwörter“ geschärft

## Bereits enthalten

- einstellbares Format, z. B. 22 × 15
- großer eingebauter deutscher Wörterbuchfundus auf Basis von `@cspell/dict-de-de` 4.1.2 / de-DE_frami / igerman98
- Zusatzlisten-Import für fremdsprachige Wörter, Fachbegriffe oder Eigennamen
- automatische Umschrift Ä/Ö/Ü/ß zu AE/OE/UE/SS
- Unicode-Normalisierung für zerlegte Umlaute
- Wortformenfilter
- Wortarten-Gewichtung
- persönliche Wörter und gesperrte Wörter
- automatische Nummerierung
- leere und gelöste Ansicht
- Fragenfelder für Waagrecht/Senkrecht
- Export leeres Gitter als SVG
- Export Lösung als SVG
- Export Lösungen als TXT
- Export Fragen als TXT/CSV
- Export Projektstand als JSON
- Export/Import persönlicher Wortschatz als JSON
- Darstellungsoption: schwarze Felder oder Begrenzungslinien

## Bedienlogik persönlicher Wortschatz

1. Liste anlegen, z. B. `Philosophie` oder `Pflege`.
2. Beim Wort hinzufügen eine oder mehrere Ziellisten auswählen.
3. Wort hinzufügen.
4. Bei bestehenden Wörtern über die Trefferliste weitere Listen ergänzen.
5. Optional Wörter sperren, damit sie bei künftigen Generatorläufen ausgeschlossen werden.
6. Mit **Rätsel aus Liste erstellen** die ausgewählte Liste ins aktuelle Rätsel übernehmen und direkt generieren.

Wenn keine Zielliste für ein neues Wort oder einen Import markiert ist, wird die aktuell ausgewählte Liste verwendet.

## Lokal starten

Im entpackten Ordner:

```bash
python -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## Update-Hinweis

Bei GitHub Pages, Netlify oder installierter PWA kann der Service Worker alte Dateien cachen. Falls noch eine alte Version angezeigt wird:

1. Entwicklertools öffnen.
2. Application / Anwendung öffnen.
3. Service Worker abmelden.
4. Website-Daten löschen.
5. Seite hart neu laden.

Vor dem Löschen von Website-Daten bitte den persönlichen Wortschatz als JSON exportieren.

## Hinweis zur nächsten Generatorstufe

v0.5.1 verbessert die Oberfläche für den Themenwort-Workflow und macht klarer, dass persönliche Listen die Themenbasis sind. Die eigentliche Zwei-Schritt-Logik „erst Themenliste möglichst vollständig platzieren, danach Lücken mit Datenbankwörtern füllen“ ist vorbereitet, aber noch nicht als eigener Füllmodus umgesetzt.
