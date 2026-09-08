# Belegungspläne Kassentastatur

Interaktive Belegungspläne für die Kassentastaturen MCI 84 (7 × 12) und
MCI 128 (8 × 16). Jede Seite ist eine eigenständige HTML-Datei ohne
Abhängigkeiten — im Browser öffnen genügt, auch offline.

- **MCI 84** — `mci-84.html`
- **MCI 128** — `mci-128.html`, Belegung aus der 84 übernommen
- **Tastenstatistik MCI 84** — `mci-84-tasten.html`, Anschläge je Taste (Warengruppen,
  Funktionen, Rabatte, Ziffern) im letzten Jahr auf der Ist-Belegung, mit Gütestufe je Zahl

Veröffentlicht unter https://5202.github.io/kassentastatur/ — nicht in
Suchmaschinen gelistet (`robots.txt`, `noindex`), aber für jeden erreichbar,
der die Adresse kennt.

## Aufbau

    index.html            Übersicht mit beiden Plänen und der Liste der Testpläne
    mci-84.html           7 × 12, 84 Positionen — speichert mit Namen im Netz
    mci-128.html          8 × 16, 128 Positionen
    mci-84-tasten.html    Ist-Belegung mit Anschlägen je Taste, Stand 09/2026
    404.html              leitet …/kassentastatur/Daniel auf mci-84.html?u=Daniel
    database.rules.json   Zugriffsregeln der Firebase Realtime Database
    firebase.json         Firebase-Konfiguration (nur Datenbank, kein Hosting)
    robots.txt            hält Suchmaschinen fern


## Bedienung

Taste antippen zum Bearbeiten (Beschriftung, Farbe, Größe, Status).
Verschieben am Rechner per Ziehen, am Handy durch Gedrückthalten und
Ziehen mit dem Finger — oder aufnehmen und die Zielposition antippen.
Gleich große Tasten tauschen den Platz.
Rückgängig mit ⌘Z / Strg + Z.

## Testumgebung MCI 84: ein Plan pro Person

Jede Testperson ruft die Seite mit ihrem Namen auf:

    https://5202.github.io/kassentastatur/Daniel
    https://5202.github.io/kassentastatur/Johanna

Die `404.html` leitet das auf `mci-84.html?u=daniel` weiter. Die Seite lädt den
Plan dieses Namens aus der Firebase Realtime Database (Projekt
`mci84-kasse`, Google-Konto oliverdoetsch@gmail.com, Gratis-Tarif) und speichert jede
Änderung nach kurzer Pause automatisch dorthin — pro Name ein Eintrag unter
`plaene/mci-84/<name>`. Der Name wird kleingeschrieben, `Daniel` und `daniel`
sind derselbe Plan. Alle Pläne stehen auf der Übersichtsseite; wer einen
fremden Plan öffnet und ändert, überschreibt ihn.

Ohne Netz zeigt die Seite den zuletzt auf dem Gerät gespeicherten Stand und
reicht Änderungen nach, sobald die Verbindung wieder da ist. Ohne Namen
speichert die Seite wie bisher nur im Browser des Geräts.

Regeln ändern und ausrollen (im Projektordner ist per `firebase login:use` das Konto oliverdoetsch@gmail.com gesetzt):

    firebase deploy --only database

Alle Pläne als JSON abrufen:

    curl https://mci84-kasse-default-rtdb.europe-west1.firebasedatabase.app/plaene/mci-84.json

## Icons auf den Tasten

Eine Taste kann statt der Beschriftung ein Bild zeigen. Im Editor das Feld
„Icon" mit dem Dateinamen ohne Endung füllen, z. B. `600` für `icons/600.png`;
die Beschriftung bleibt als Tooltip erhalten. Die Bilder in `icons/` sind
200 × 200 px mit transparentem Hintergrund, vom Weißrand befreit — die
Aufbereitung aus den 1024er Originalen ist nur für das Mockup gedacht, der
Druck der Tastenkappen läuft über die Originale. Benannt nach PLU:
600–698 Obst, 460–595 Gemüse. Die Weitergabe-HTML trägt keine Icons mit.

## Speichern

Der Browser sichert den Stand pro Gerät automatisch. „JSON sichern"
erzeugt eine Datensicherung, „JSON laden" spielt sie zurück.
„Weitergabe-HTML" erzeugt eine eigenständige Seite, in der der aktuelle
Stand fest eingebaut ist.

Ältere Stände holt man aus der Versionsverwaltung, nicht aus datierten
Kopien:

    git log --oneline mci-84.html      welche Änderungen gab es
    git checkout <commit> -- mci-84.html   einen alten Stand zurückholen
