# Auto-Bildarchiv

Sortier- und Suchwerkzeug für Autobilder. Bilder per Drag-and-drop rein, Marke, Modell, Generation, Facelift, Baujahr von–bis und Spezifikationen angeben, später gezielt wiederfinden.

Läuft im Browser (Chrome oder Edge) auf Mac und Windows: **https://liontuning.github.io/carpicturearchiv/**

## Mediathek

Beim ersten Start „Mediathek anlegen“ und einen Ordner wählen. Für Mac + Windows den Ordner in Google Drive (15 GB frei), OneDrive oder Dropbox legen, auf dem zweiten Rechner „Vorhandene öffnen“.

```
Auto Bildarchiv/
  mediathek.auto.json          Kennung
  LIESMICH.txt
  Bilder/JJJJ/JJJJ-MM/
     2026-11-06_1035_BMW_3er_F30_FL_8f3a.jpg
     2026-11-06_1035_BMW_3er_F30_FL_8f3a.jpg.auto.json   Begleitdatei (die Wahrheit)
  Archivdaten/katalog.json     letzte Angaben
  Archivdaten/Papierkorb/      gelöschte Bilder
```

- Bilder größer als 1600×1200 (Hochformat 1200×1600) werden beim Einsortieren verkleinert.
- SHA-256-Fingerabdruck: Duplikate werden erkannt, jede Kopie wird nach dem Schreiben geprüft.
- Die Suche wird beim Öffnen aus den Begleitdateien aufgebaut; unbekannte Felder bleiben beim Speichern erhalten.
- Ohne Ordner-Zugriff (Safari, Firefox) wird im Browser gespeichert, Sicherung über „Backup-Datei speichern“.

Bausteine (Mediathek mit Begleitdateien, Fingerabdruck, Suchlogik, Gestaltung) nach dem Vorbild von Loomn Archiv.
