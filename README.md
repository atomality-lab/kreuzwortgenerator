# Kreuzwortdrucker v0.6.4

PWA-Prototyp für die Erstellung druckfähiger deutscher Kreuzworträtsel mit großem deutschem Wortfundus, persönlichem Wortschatz, zweistufiger Fülllogik, Bearbeitungsmodus, Fragenverwaltung und SVG-/TXT-/CSV-Export.

## Neu in v0.6.4

- Der mittlere Vorschau-/Board-Bereich wurde deutlich vergrößert.
- Die unpraktische Innen-Scrollleiste im Boardbereich wurde entfernt.
- SVG-Gitter skalieren sich stärker an die verfügbare Boardbreite an.
- Der Bearbeitungsmodus nutzt ein responsives Raster, damit auch größere Boards besser sichtbar bleiben.
- Neue Einstellung **Brettform**:
  - **Klassisches Rechteck**
  - **Angepasste Form: 1 Feld Rand oben/unten/links/rechts**
- Im angepassten Modus bleibt das eingestellte Format der Kern, z. B. 22 × 15. Die App ergänzt außen einen zusätzlichen Bearbeitungsrand, sodass oben, unten, links oder rechts ein Feld überstehen kann.
- Der Zusatzrand wird im Bearbeitungsmodus dezent markiert.

## Bereits enthalten

- einstellbares Kernformat, z. B. 22 × 15
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

## Angepasste Brettform

Die angepasste Form ist ein Zwischenschritt Richtung klassischer Rätsel mit nicht ganz rechteckiger Außenkontur. Wenn Du z. B. 22 × 15 einstellst, bleibt dies das Kernformat. Die Arbeitsfläche wird intern um einen Rand erweitert, sodass einzelne Wörter oben, unten, links oder rechts um ein Feld überstehen können.

Das ist noch kein vollständiger Vollraster-Generator mit Begrenzungslinien, aber die Oberfläche und der Bearbeitungsmodus sind dafür vorbereitet.

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

v0.6.4 verbessert Layout und Brettform. Die nächste größere Generatorstufe sollte die Fülllogik weiter verbessern, z. B. mehrere Füllvorschläge, gezieltes Austauschen einzelner Wörter und später den kompakten Vollraster-Modus mit Begrenzungslinien.
