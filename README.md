# Kreuzwortdrucker v0.6.3

PWA-Prototyp für die Erstellung druckfähiger deutscher Kreuzworträtsel mit großem deutschem Wortfundus, persönlichem Wortschatz, zweistufiger Fülllogik, Fragenverwaltung und SVG-/TXT-/CSV-Export.

## Neu in v0.6.3

- Konsistenzprüfung korrigiert: einzelne Kreuzungsbuchstaben werden nicht mehr fälschlich als zu kurze Wörter markiert.
- Ein einzelnes Feld wird nur noch als Fehler gewertet, wenn es wirklich isoliert steht und zu keinem längeren Wort gehört.
- **Rätsel erstellen / Lücken füllen** respektiert jetzt einen bestehenden bearbeiteten Entwurf.
- Manuell gesetzte Buchstaben bleiben beim Füllen erhalten.
- Explizit gesetzte Schwarzfelder bleiben beim Füllen erhalten.
- Füllwörter werden nur ergänzt, wenn sie passend an vorhandene Buchstaben kreuzen.
- Der Bearbeitungsmodus speichert nun explizit gesetzte Schwarzfelder im Projektstand.

## Bereits enthalten

- einstellbares Format, z. B. 22 × 15
- großer eingebauter deutscher Wörterbuchfundus auf Basis von `@cspell/dict-de-de` 4.1.2 / de-DE_frami / igerman98
- Zusatzlisten-Import für fremdsprachige Wörter, Fachbegriffe oder Eigennamen
- automatische Umschrift Ä/Ö/Ü/ß zu AE/OE/UE/SS
- Unicode-Normalisierung für zerlegte Umlaute
- Datenbank-Formenfilter: rätselgeeignete Substantive/Pluralformen, sehr streng, vorsichtig gemischt oder alle Wörterbuchformen
- Wortarten-Gewichtung
- persönliche Wörter und gesperrte Wörter
- persönliche Listen mit Mehrfachzuordnung
- gesicherter Wortschatz als bevorzugter Füllwortspeicher
- automatische Nummerierung
- leere, gelöste und bearbeitbare Ansicht
- Fragenfelder für Waagrecht/Senkrecht
- Export leeres Gitter als SVG
- Export Lösung als SVG
- Export Lösungen als TXT
- Export Fragen als TXT/CSV
- Export Projektstand als JSON
- Export/Import persönlicher und gesicherter Wortschatz als JSON
- Darstellungsoption: schwarze Felder oder Begrenzungslinien
- Schwarzfeld-Bearbeitungsmodus mit Konsistenzprüfung

## Bedienlogik persönlicher Wortschatz

1. Liste anlegen, z. B. `Philosophie` oder `Pflege`.
2. Beim Wort hinzufügen eine oder mehrere Ziellisten auswählen.
3. Wort hinzufügen oder eine TXT-/CSV-Wortliste importieren.
4. Bei bestehenden Wörtern über die Trefferliste weitere Listen ergänzen.
5. Optional Wörter sperren, damit sie bei künftigen Generatorläufen ausgeschlossen werden.
6. Mit **Rätsel aus Liste erstellen** die ausgewählte Liste ins aktuelle Rätsel übernehmen und ohne Datenbank-Füllwörter generieren.
7. Mit **Rätsel erstellen / Lücken füllen** den aktuellen Arbeitskorb zusätzlich mit gesichertem Wortschatz und Basiswortschatz ergänzen.
8. Gute verwendete Wörter in der Lösungsliste bewusst über **„sichern“** in den gesicherten Wortschatz übernehmen.
9. Ungeeignete Wörter über **„nicht verwenden“** ausschließen. Sie werden dann nicht bevorzugt gespeichert.

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

## Hinweise zum Bearbeitungsmodus

Der Bearbeitungsmodus arbeitet zunächst mit dem Schwarzfeld-Modell. Nicht belegte Felder sind schwarze Sperrfelder, können aber in leere Buchstabenfelder umgewandelt werden. Die spätere Vollraster-Variante mit Begrenzungslinien ohne schwarze Felder bleibt eine eigene Generatorstufe.

## Hinweis zur nächsten Generatorstufe

v0.6.3 repariert den ersten Bearbeitungsmodus. Die nächste größere Generatorstufe sollte die Fülllogik weiter verbessern, z. B. mehrere Füllvorschläge, gezieltes Austauschen einzelner Wörter und später den kompakten Vollraster-Modus mit Begrenzungslinien.
