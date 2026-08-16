# Belegungspläne Kassentastatur

Interaktive Belegungspläne für die Kassentastaturen MCI 84 (7 × 12) und
MCI 128 (8 × 16). Jede Seite ist eine eigenständige HTML-Datei ohne
Abhängigkeiten — im Browser öffnen genügt, auch offline.

- **MCI 84** — `mci-84.html`
- **MCI 128** — `mci-128.html`, Belegung aus der 84 übernommen

Veröffentlicht unter https://5202.github.io/kassentastatur/ — nicht in
Suchmaschinen gelistet (`robots.txt`, `noindex`), aber für jeden erreichbar,
der die Adresse kennt.

## Aufbau

    index.html        Übersicht mit beiden Plänen
    mci-84.html       7 × 12, 84 Positionen
    mci-128.html      8 × 16, 128 Positionen
    robots.txt        hält Suchmaschinen fern


## Bedienung

Taste antippen zum Bearbeiten (Beschriftung, Farbe, Größe, Status).
Verschieben am Rechner per Ziehen, am Handy durch Gedrückthalten und
Ziehen mit dem Finger — oder aufnehmen und die Zielposition antippen.
Gleich große Tasten tauschen den Platz.
Rückgängig mit ⌘Z / Strg + Z.

## Speichern

Der Browser sichert den Stand pro Gerät automatisch. „JSON sichern"
erzeugt eine Datensicherung, „JSON laden" spielt sie zurück.
„Weitergabe-HTML" erzeugt eine eigenständige Seite, in der der aktuelle
Stand fest eingebaut ist.

Ältere Stände holt man aus der Versionsverwaltung, nicht aus datierten
Kopien:

    git log --oneline mci-84.html      welche Änderungen gab es
    git checkout <commit> -- mci-84.html   einen alten Stand zurückholen
