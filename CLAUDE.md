# Hinweise für Claude

Projektüberblick und Aufbau stehen in der `README.md`. Hier nur, was sich
aus dem Code nicht ablesen lässt.

**Dieses Repo ist öffentlich** (GitHub Pages). Niemals Zugangsdaten
committen — auch keine IPs, Subnetze, VPN-Profile, Freigabepfade mit
Adressen oder Konten der Kassen. Solche Angaben bleiben lokal.

## Tastaturprogrammierung MCI 84

- **Zwei Zeilenzählungen!** Plan-Seite (`mci-84.html`, JSON `r` = 1…7) zählt
  **A = oberste** Zeile, Tastatur/WinProgrammer/`.mwx` zählt **A = unterste**
  Zeile. Spalten 01–12 sind gleich. Plan A B C D E F G = Tastatur G F E D C B A,
  Tastatur-Position = `ABCDEFG`[7 − Planzeile] + Spalte (belegt über KEYPRINT:
  A12 Enter, A07 Drucken, B06 Bar, B04 Menge). Oliver nennt Tasten nach der
  Plan-Seite; in Tastatur-Positionen umrechnen und immer beide nennen.
  Änderungen für G stehen in `keytable/goeggingen/aenderungen.md`.

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
  lassen), `.mwx` = binär, wird per C2K übertragen. **Gemischte Codepages im
  `.mwf`:** `!@KEYPRINT`-Beschriftungen sind cp1252 („Rück-“), die Makros
  selbst DOS-cp850 (`0x81` = ü, `0x94` = ö, z. B. Shift-E04 = `ü`). Per Skript
  nur byteweise bearbeiten, nicht als Ganzes umkodieren.
- Aufbau einer Taste im `.mwf`: `!@KEYPRINT:<pos> "<Kappentext>";…` (Beschriftung,
  `\line` = Zeilenumbruch), `<pos>/<flags>: "<Makro>"` (normal),
  `<pos>-SL+L…: "<Makro>"` (Shift-Ebene), `!@KEYATTRIB:<pos> <hex>`. Die
  KEYPRINT-Zeilen sind praktisch das „Foto“ der Tastatur.
- `.mwx` lesen: Kopf `Preh`, Makros als Set-1-Scancodes (Make/Break), z. B.
  `2a 38 06 86 aa b8` = Shift+Alt+5, `1b 9b` = `+` (deutsches Layout),
  `0b 8b` = 0, `e0 1c e0 9c` = Enter (Ziffernblock).
- `BioBillKB.exe` auf den Kassen ist **nicht** das Tastatur-Tool, sondern das
  Kassenbuch/Schubladen-Modul.
- **Göggingen**: `goeggingen_original.mwx` am 27.09.2026 von der Test-Tastatur
  (Original aus Göggingen) an Olivers Rechner ausgelesen, lesbar in
  `goeggingen_original.txt`. Zuschläge auf E06–E09 (10/15/30/50, ohne `+`).
  Neue Belegung: `node tools/build-mwf.js` baut `goeggingen_neu.MWF` aus
  Original, `aenderungen.md` und `plaene/mci-84-oliver.json`; übertragen und
  zurückgelesen (`goeggingen_neu_read.mwx` byte-gleich) am 27.09.2026.
- **Leitershofen**: Die Keytables liegen auf Kasse1 im BioBill-Ordner unter
  `Daten\update\`, die von Kasse2 als Kopie auf Kasse1 unter
  `Daten\K2\BioBill\Daten\update\`, byte-gleich im Repo (27.09.2026):
  - `keytable/kasse1`: `BB_…MWF` (26.06.2025, Belegungen mit Flag `/K/A/P/L`)
    mit passender `.mwx` (25.06.2025); `XBB_…MWF` (25.06.2025, Flag `/K/P/L`).
  - `keytable/kasse2`: `BB_…MWF` (02.12.2025), `XBB_…MWF` und `.mwx` (22.08.2023).
  Andere oder ältere Stände gibt es auf beiden Kassen nicht (beide Rechner
  komplett durchsucht am 27.09.2026). Die Kassen unterscheiden sich nur in
  F04–F06 (F05/F06 analog mit 25/50):
  1. 22.08.2023, Kasse2 `XBB` + `.mwx`: `{SHIFT+ALT+5}10{ENTER}`
  2. 25.06.2025, Kasse1 `XBB` + `.mwx`: `{SHIFT+ALT+5}+10{ENTER}`
  3. 26.06.2025 Kasse1 / 02.12.2025 Kasse2, `BB_…MWF`:
     `{SHIFT+ALT+5}+{DEL}{DELAY}10{ENTER}` — als `.mwx` nie gespeichert, laut
     `.mwx` auf keiner Tastatur (oder direkt aus dem WinProgrammer übertragen).
     Beide `BB_…MWF` unterscheiden sich untereinander nur im Flag `/A`.
  Ob die `.mwx`-Kopien wirklich auf den Tastaturen sind, zeigt nur Auslesen.
- WinProgrammer-Installer liegt auch auf Kasse1 unter
  `Downloads\WinProg_Latest\Winprog25_Build20213.EXE`.

## Makros: Vorbild Leitershofen, Bausteine für Göggingen

Leitershofen-Keytable (Keytable-Position → Plan-Position):

| Funktion (Kappe) | Keytable | Plan | Makro |
|---|---|---|---|
| kein Kunde | C04 | E04 | `{ALT+k}k` (E03 „Personal“ identisch) |
| Kunden Bericht | C05 | E05 | `{ALT+k}b` |
| Kundenkarte per Taste (Kredit, Kunden-Kredit, Lieferant, Lastschrift) | E04, C06, E05, E06 | C04, E06, C05, C06 | interne Karten-EAN + `{ENTER}`, z. B. `2000001000021{ENTER}` — Rabatt steht im Kundenstamm, nicht in der Taste |
| Rabatt fester % | F04–F06 | B04–B06 | `{SHIFT+ALT+5}` = Rabatt-Taste, dann Satz (Historie oben) |
| Aktion | A05 | G05 | `w` (A–Z-Artikel `@Aktion`); Shift: `{SHIFT+ALT+5}` |
| **Kiste/Gebinde** | F09 | B09 | **`{ALT+g}`** (Menüpunkt „**G**ebinde“) |
| Auszahlung / Einzahlung | C02 / D02 | E02 / D02 | `{ALT+m}za` / `{ALT+m}ze` |
| Retour | D12 | D12 | `-` |
| Mengen-/Multiplikationstaste | C12 | E12 | `*` (Shift: `+`) |

Göggingen, neue Belegung (Testbetrieb seit 27.09.2026, noch nicht produktiv):
Warengruppen- und Funktionstasten tippen den Buchstaben des A–Z-Artikels.

| Taste im Plan | Makro | Artikel |
|---|---|---|
| Artikel 7 % | `a` | A Lebensmittel 7 % |
| Artikel 19 % | `h` | H Lebensmittel 19 % (neu) |
| Käse / Fleisch / Brot | `b` / `j` / `k` | Warengruppen-Buchstaben |
| Gutschrift | `q` `{ENTER}` | Q Gutschrift 0 % MwSt, fester Preis −2,00 € im Artikel — **nicht** zusätzlich Retour drücken |
| Bestellt 5 % | `w` | W `@Aktion:0:5` (5 % auf den zuletzt erfassten Artikel) |
| Gebinde | `{ALT+g}` | erst Flasche scannen, dann Taste |
| Gutschein | `s` | S Gutschein (Altgutscheine, bleibt wie bisher) |

Beträge und Prozentsätze stehen im Artikel bzw. Kundenkonto (BioOffice), nicht
in der Taste — Änderungen dort brauchen keine Neuprogrammierung. Offen/zu
testen: Aufruf der Rabattkonten (5 %/10 %/Mitarbeiter 20 %) per Taste;
Details und Prüfergebnisse im privaten Repo Bios-SQL.

## Belegung und Fachregeln

- **Finale Belegung** für die Programmierung: `plaene/mci-84-oliver.json`
  (Export aus Firebase `plaene/mci-84/oliver`, Stand 22.09.2026 20:47, 80 Tasten,
  `r`/`c` = Zeile A–G der Plan-Seite (1 = A = oben) / Spalte 01–12,
  `w`/`h` = Tastengröße). Firebase kann sich
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
