# Auto-Bildarchiv

Sortier- und Suchwerkzeug für Autobilder. Bilder per Drag-and-drop rein, Marke, Modell, Generation, Facelift, Baujahr von–bis und Spezifikationen angeben, später gezielt wiederfinden. Eine Version für Mac und Windows.

**App:** https://liontuning.github.io/carpicturearchiv/ (in Google Chrome oder Microsoft Edge öffnen)

## Einrichten (einmal pro Rechner)

1. **Google Drive für Desktop** installieren und anmelden: https://www.google.com/drive/download/
   - Mac: Google Drive erscheint im Finder links unter „Orte“.
   - Windows: Google Drive erscheint als Laufwerk `G:` im Explorer.
2. Die App in **Chrome oder Edge** öffnen. Rechts in der Adresszeile auf das Installieren-Symbol klicken
   (oder in der App: Mediathek › „Als App installieren“). Dann hat die App ein eigenes Fenster und Icon.
3. **Erster Rechner:** Mediathek › „Neue Mediathek anlegen …“ › in Google Drive „Meine Ablage“ wählen.
   Es entsteht der Ordner `Auto Bildarchiv`.
   **Jeder weitere Rechner:** Mediathek › „Vorhandene öffnen …“ › `Meine Ablage/Auto Bildarchiv` wählen.
4. Chrome fragt nach Erlaubnis für den Ordner: **„Bei jedem Besuch erlauben“** wählen.

Änderungen von anderen Rechnern erscheinen automatisch (alle 30 Sekunden und beim Zurückkehren ins Fenster), sobald Google Drive sie synchronisiert hat.

## Mediathek

```
Auto Bildarchiv/
  mediathek.auto.json          Kennung
  LIESMICH.txt
  Bilder/JJJJ/JJJJ-MM/
     2026-11-06_1035_BMW_3er_F30_FL_8f3a.jpg
     2026-11-06_1035_BMW_3er_F30_FL_8f3a.jpg.auto.json   Begleitdatei (die Wahrheit)
  Archivdaten/Vorschauen/      kleine Vorschaubilder (480 px), werden bei Bedarf neu erzeugt
  Archivdaten/Papierkorb/      gelöschte Bilder (von Hand leeren)
```

- Bilder größer als 1600×1200 (Hochformat 1200×1600) werden beim Einsortieren verkleinert.
- SHA-256-Fingerabdruck: Duplikate werden erkannt (auch das große Original), jede Kopie wird nach dem Schreiben geprüft.
- Die Suche wird aus den Begleitdateien aufgebaut; unbekannte Felder bleiben beim Speichern erhalten.
- Konfliktkopien von Google Drive (`… (1).auto.json`) werden erkannt: die neuere Fassung gilt, die alte wird beim nächsten Speichern aufgeräumt.
- Letzte Angaben im Formular werden pro Rechner gemerkt (nicht im Drive, damit es keine Konflikte gibt).
- Safari und Firefox können keine Ordner öffnen; dort speichert die App nur im Browser (Sicherung über „Backup-Datei“).

Bausteine (Mediathek mit Begleitdateien, Fingerabdruck, Suchlogik, Gestaltung) nach dem Vorbild von Loomn Archiv.
