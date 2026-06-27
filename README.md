# Kreuzwortdrucker v0.5.2

PWA-Prototyp für die Erstellung druckfähiger deutscher Kreuzworträtsel mit großem deutschem Wortfundus, persönlichem Wortschatz, Fragenverwaltung und SVG-/TXT-/CSV-Export.

## Neu in v0.5.2

- **Max. Wörter** wurde zu **Max. Füllwörter** umbenannt. Die Grenze gilt nur noch für Wörter aus dem Hintergrund-/Basiswortschatz. Themenwörter aus der persönlichen Liste werden nicht mehr durch diese Zahl abgeschnitten.
- **Rätsel aus Liste erstellen** nutzt zuerst nur die ausgewählte persönliche Liste. Es werden noch keine Datenbank-Füllwörter ergänzt.
- **Rätsel erstellen / Lücken füllen** darf zusätzlich den gesicherten Wortschatz und den großen Basiswortschatz als Füllmaterial verwenden.
- Leitwörter können per Vorschlagsliste aus der aktuell ausgewählten persönlichen Liste ausgewählt werden. Frei eingegebene Leitwörter können direkt in der aktuellen Liste gespeichert werden.
- Die ausgewählte persönliche Liste wird direkt in der Oberfläche angezeigt und kann durchsucht werden.
- Der Button **Wort hinzufügen** sitzt jetzt direkt unter dem Eingabefeld.
- JSON-Sicherung wurde verständlicher benannt: Sie sichert persönlichen Wortschatz, Listen, Sperrungen und gesicherten Wortschatz.
- Neuer Bereich **Gesicherter Wortschatz**: bereits verwendete oder bewusst als sicher markierte Wörter werden lokal gespeichert und beim Füllen bevorzugt vor dem großen Basiswortschatz verwendet.
- Datenbank-Zufallswörter werden nicht mehr als Themenwörter in das Eingabefeld gekippt. Der große Fundus bleibt Füllmaterial im Hintergrund.

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
- Export/Import persönlicher und gesicherter Wortschatz als JSON
- Darstellungsoption: schwarze Felder oder Begrenzungslinien
- gesicherter Wortschatz als bevorzugter Füllwortspeicher

## Bedienlogik persönlicher Wortschatz

1. Liste anlegen, z. B. `Philosophie` oder `Pflege`.
2. Beim Wort hinzufügen eine oder mehrere Ziellisten auswählen.
3. Wort hinzufügen.
4. Bei bestehenden Wörtern über die Trefferliste weitere Listen ergänzen.
5. Optional Wörter sperren, damit sie bei künftigen Generatorläufen ausgeschlossen werden.
6. Mit **Rätsel aus Liste erstellen** die ausgewählte Liste ins aktuelle Rätsel übernehmen und ohne Datenbank-Füllwörter generieren.
7. Mit **Rätsel erstellen / Lücken füllen** kann der aktuelle Arbeitskorb zusätzlich mit gesichertem Wortschatz und Basiswortschatz ergänzt werden.

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

v0.5.2 trennt die Bedienlogik erstmals sichtbar in zwei Schritte: Themenliste platzieren und danach optional mit gesichertem/Basiswortschatz füllen. Die nächste größere Generatorstufe sollte die Fülllogik weiter verbessern, z. B. mehrere Füllvorschläge, gezieltes Austauschen einzelner Wörter und später den kompakten Vollraster-Modus mit Begrenzungslinien.
