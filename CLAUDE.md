# Auto-Bildarchiv

Eine Datei: `index.html` (HTML, CSS, JS, Schrift eingebettet). Läuft über GitHub Pages in Chrome/Edge auf Mac und Windows.

## Gestaltung (dauerhaft, Wunsch von LION)

- Responsive: muss vom Handy bis zum großen Bildschirm sauber funktionieren, ohne waagrechtes Scrollen.
- **Kein Layout-Springen.** Beim Klicken, Hovern, Laden oder bei Zustandswechseln darf sich nichts verschieben, auch nicht minimal.
  Feste Größen für Knöpfe, Kacheln, Statuszeile und Bildflächen; wechselnde Texte bekommen feste Breite; Hinweise und Banner
  schieben nichts weg (fixiert oder Platz reserviert); Schrift ist eingebettet, die Seite erscheint erst, wenn sie geladen ist.
- Vor jedem Push prüfen: Cumulative Layout Shift = 0 (PerformanceObserver `layout-shift`) beim Laden und bei allen Bedienschritten.
- Gestaltung wie Loomn: dunkel, Barlow Condensed, Signalorange heißt aktiv, eine Höhe (40 px) für alle Bedienelemente.

## Daten

- Mediathek-Ordner: `Bilder/JJJJ/JJJJ-MM/<bild>` + `<bild>.auto.json` (Begleitdatei = Wahrheit). Feldnamen nie umbenennen, nur ergänzen.
- Auswahllisten (Marken › Modelle › Generationen, Karosserie, Ansicht, Tags) liegen in `Archivdaten/katalog.json` (schema 2). Die Reihenfolge dort ist die Reihenfolge im Formular. Entfernte Einträge bleiben bei vorhandenen Bildern erhalten. Tags werden ohne Groß-/Kleinschreibung, Bindestrich und Leerzeichen verglichen.
- Bilder über 1600×1200 (Hochformat 1200×1600) werden beim Einsortieren verkleinert.
- Zusätzliche Felder der Begleitdatei seit 1.7: `artnr` (Liste der Artikelnummern), `gpsRemoved` (Standortdaten wurden entfernt), `origSha256` (Fingerabdruck der Originaldatei, wenn verkleinert oder bereinigt).
- Papierkorb: `Archivdaten/Papierkorb/<bild>` + Begleitdatei mit `deletedAt`. Wiederherstellen schreibt das Bild über `store.add` zurück.
- Backup ist eine unkomprimierte ZIP-Datei mit `Bilder/<bild>` + `<bild>.auto.json` (alte `.json`-Backups werden weiter gelesen).
- Meldungen (`toast`) sind ein Popover, damit sie über offenen Fenstern liegen. Kacheln werden seitenweise (120) angehängt.

## Updates (dauerhaft, Wunsch von LION)

- Jeder Push auf `main` ist ein Update (GitHub Pages). Die App prüft `version.json` beim Start und alle 30 Minuten
  und zeigt oben rechts „Update verfügbar“ mit „Später“ / „Aktualisieren“ (wie archivn).
- Bei jeder Änderung **zusammen** hochzählen: `APP_VERSION`/`APP_BUILD` in `index.html` und `version` / `build` / `notes` in `version.json`.
  Bei Änderungen an `sw.js` den Cache-Namen erhöhen.
