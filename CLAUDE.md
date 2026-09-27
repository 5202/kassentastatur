# Hinweise für Claude

Projektüberblick und Aufbau stehen in der `README.md`. Hier nur, was sich
aus dem Code nicht ablesen lässt.

**Dieses Repo ist öffentlich** (GitHub Pages). Niemals Zugangsdaten
committen — auch keine IPs, Subnetze, VPN-Profile, Freigabepfade mit
Adressen oder Konten der Kassen. Solche Angaben bleiben lokal.

## Tastaturprogrammierung MCI 84

- **Gearbeitet wird am Layout Göggingen** (`keytable/goeggingen`, „G“).
  `keytable/kasse1` und `kasse2` sind **Leitershofen** und dienen nur zum
  Nachschlagen, wie Details dort gelöst sind.
- PrehKeyTec-Tool: **WinProgrammer** 2.5 Build 20213 (nur Windows, Download
  auf prehkeytec.com → Support → Keyboards, `WinProg_Latest.zip`). Übertragung
  auf die Tastatur per **C2K** („Copy to Keyboard“, im Paket enthalten).
  „Read…“ in C2K liest die Tastatur als `.mwx` aus (`Upload = 1` in `c2k.ini`);
  gespeichert wird wegen Program Files im VirtualStore
  (`%LOCALAPPDATA%\VirtualStore\Program Files (x86)\PrehKeyTec\WinProg\`).
- `Mwx2Mwf.exe` aus dem Paket läuft hier nicht (VB6, `COMDLG32.OCX` fehlt).
  Stattdessen `node tools/mwxdecode.js <datei.mwx>`; an beiden
  Leitershofen-Paaren `.mwx`/`.MWF` mit `tools/verify.js` geprüft (alle
  Belegungen gleich). Die `.mwx` enthält nur Belegungen, keine Beschriftungen.
- Keytable-Formate: `.mwf` = editierbarer Text (CRLF — beim Bearbeiten so
  lassen; Beschriftungen `!@KEYPRINT` in cp1252, Belegungstexte in **cp850**,
  z. B. ü = `81`), `.mwx` = binär, wird per C2K übertragen.
- `BioBillKB.exe` auf den Kassen ist **nicht** das Tastatur-Tool, sondern das
  Kassenbuch/Schubladen-Modul.
- **Göggingen**: `goeggingen_original.mwx` am 27.09.2026 von der Test-Tastatur
  (Original aus Göggingen) an Olivers Rechner ausgelesen, lesbar in
  `goeggingen_original.txt`. Zuschläge auf E06–E09 (10/15/30/50, ohne `+`).
- **Leitershofen**: Die Keytables liegen auf Kasse1 im BioBill-Ordner unter
  `Daten\update\`, die von Kasse2 als Kopie auf Kasse1 unter
  `Daten\K2\BioBill\Daten\update\`, byte-gleich im Repo (27.09.2026).
  Beide Kassen unterscheiden sich nur in F04–F06:
  - Kasse1-`.mwx` (25.06.2025) = `kasse1/XBB_…MWF`: `{SHIFT+ALT+5}+10{ENTER}`.
  - Kasse2-`.mwx` (22.08.2023) = `kasse2/XBB_…MWF`: `{SHIFT+ALT+5}10{ENTER}`.
  - Beide `BB_…MWF` haben `+{DEL}{DELAY}` vor 10/25/50 und sind laut `.mwx`
    auf keiner Tastatur; sie unterscheiden sich untereinander nur im Flag `/A`.
  Ob die `.mwx`-Kopien wirklich auf den Tastaturen sind, zeigt nur Auslesen.
- WinProgrammer-Installer liegt auch auf Kasse1 unter
  `Downloads\WinProg_Latest\Winprog25_Build20213.EXE`.

## Belegung und Fachregeln

- **Finale Belegung** für die Programmierung: `plaene/mci-84-oliver.json`
  (Export aus Firebase `plaene/mci-84/oliver`, Stand 22.09.2026 20:47, 80 Tasten,
  `r`/`c` = Zeile A–G / Spalte 01–12, `w`/`h` = Tastengröße). Firebase kann sich
  weiter ändern; bei Abweichung neu exportieren und committen.
- Obst/Gemüse nach PLU-Nummernkreis trennen: 400–599 Gemüse, 600–699 Obst.
  **Ingwer (PLU 633) ist Obst** — ohne Nachfrage beim Obst lassen.
- Keine Saisonartikel auf die Tasten (deshalb Brokkoli 481 statt Feldsalat 541).
- Olivers Plan (`plaene/mci-84/oliver`, Stand 16.09.2026): 18 O&G-Tasten mit den
  Top 18 nach Bonzeilen über Obst und Gemüse **zusammen** (nicht 10 + 10):
  Obst 600 605 698 690 620 628, Gemüse 465 460 515 595 525 519 581 590 475 510
  462 481. Datenquelle: `queries/og_plu_top.sql` im Repo Bios-SQL.
- Alle 22 Tasten in Zeile 1–2 (außer ESC/WIN) tragen ein Icon. C11 heißt
  „Bestellt 5 %“, D12 Retour ist Weiß/Funktion.

## Icons

- Motive entstehen in Gemini (1024 px). Nachbesserungen bekommen eine
  angehängte Nummer (Käse 4, Paprika7), die höchste gilt. Die verbauten
  Originale liegen unter `icons/original/<icon>.png`.
- Freistellen: Flutfüllung von außen über fast-weiße Pixel, Motiv auf 184 px
  in 200 px zentriert. Das Skript (Swift/AppKit, ~40 Zeilen) ist nicht im
  Repo; unter Windows bei Bedarf in Python/Pillow neu schreiben.
- Wackelkandidaten: 519 Spitzpaprika (wirkt noch chiliartig), Clementine.

## Druck der Tastenkappen

- `mci-84-druck.html?u=Name`, Einleger 12,8 × 13,1 mm, Motiv ~11 mm, Raster
  19,05 mm. Schalter per Adresse: `farbe`, `icons`, `pos`, `marken`, `nur`.
- PrehKeyTec-Vorlage `PKT_Labeling_Template.xls`: alle Zeilen 6,56 mm,
  1×1 = 2×2 Zellen ≈ 13 × 13,1 mm, Doppeltasten 5 Zellen ≈ 32,5/32,8 mm —
  etwas größer als das Rastermaß. Enter und „Drucken Bezahlen“ nach dem ersten
  Ausdruck an der echten Kappe nachmessen.
