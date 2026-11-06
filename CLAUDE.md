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
- Bilder über 1600×1200 (Hochformat 1200×1600) werden beim Einsortieren verkleinert.
