# Tests

Browser-Tests mit Playwright (Chromium). Der Google-Drive-Ordner wird mit dem privaten Browser-Speicher (OPFS) nachgestellt,
zwei Tabs spielen zwei Rechner.

```
python3 -m http.server 8770 &      # im Repo-Ordner
for t in tests/*.js; do node "$t"; done
```

Jede Zeile beginnt mit PASS oder FAIL; `CLS` muss 0 sein (kein Layout-Springen).
