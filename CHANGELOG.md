# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [v0.2.1-rc.1] – 2026-07-07

**Zweiter Prototyp – Nachbesserungen (Release-Candidate)**

Kleiner Patch-Release auf Basis von `v0.2.0-rc.1` mit Layout- und Theme-Korrekturen für Schritt 8 und den Seitentitel im Hellmodus.

### Behoben

- Seitentitel „Dein Avatar für Studium und Lehre!“ und Zahnrad-Icon im **Hellmodus** auf `#333333` gesetzt – auch in **Schritt 0** (mobil und Desktop)
- Radio-Buttons in **Schritt 8 (mobil)** werden unten nicht mehr abgeschnitten
- Abstand zwischen Radio-Buttons und Avatar-Auswahl-SVGs in **Schritt 8 (mobil)** vergrößert

### Geändert

- Avatar-SVGs in Schritt 8 aktualisiert und zugehöriges CSS optimiert
- Mobile CSS für Schritt 8 weiter verfeinert (Avatar-Typ-Auswahl und Varianten-Picker)

### Technisch

- 3 Commits seit `v0.2.0-rc.1`
- HEAD: `2651d4f`

---

## [v0.2.0-rc.1] – 2026-07-03

**Zweiter Prototyp für die Testphase (Release-Candidate)**

Großes Feature- und Design-Update seit dem ersten Prototypen: vollständige Mobile-Ansicht, Desktop-Mockup, neue Zusammenfassung, erweiterte Avatar-Gestaltung, Internationalisierung und Theme-Unterstützung.

### Hinzugefügt

- **Internationalisierung (i18n):** Deutsch/Englisch mit Locale-JSONs, `data-i18n`-Attributen und Legacy-Migration
- **Hell-/Dunkelmodus** mit Theme-Switch im Einstellungsdialog
- **Mobile Ansicht** für alle Schritte (0–8) inkl. Paginierung
- **Swipe-Navigation** zwischen Schritten mit Hinweis-Animation (blendet nach 3 Sekunden aus)
- **Desktop-Mockup** ab 1025px Viewport-Breite (Wheel links, Karten-Layout rechts)
- **Kompakt-Desktop-Modus** für geringe Viewport-Höhen (z. B. 150 %-Windows-Skalierung)
- **Neue Zusammenfassung (Schritt 9):** Desktop-Layout mit Chat-Animation und Summary-Karte; mobile paginierte Ansicht mit Icons
- **Zwischenseite** zwischen Schritt 8 und Zusammenfassung (Bridge: Zusammenfassung oder Umfrage)
- **Schritt 8:** Neue Avatar-Bilder (Mensch, Roboter, Eule; je 4 Farbvarianten), Varianten-Picker, Option „Kein Avatar-Bild“ (KIBI-38)
- **Schritt 2:** Schrittweise Freischaltung der Optionen (KIBI-17)
- **Willkommens-Chat-Animation** auf Schritt 0 (Lottie, DE/EN, Hell/Dunkel, Desktop/Tablet/Mobil)
- **Start-Button** „Avatar erstellen“ auf Schritt 0
- Umfangreiche **Wheel- und Übergangsanimationen** (Schritte 0–3, Wheel-Center, Fortschritts-Ring)
- Neue **Summary-Icons** für Hell- und Dunkelmodus
- Hilfsskripte für Wheel-SVG-Umbenennung und Step-2→3-Übergänge

### Geändert

- Wizard-Rad komplett überarbeitet (separate Asset-Sets für Hell/Dunkel)
- Layout, Typografie und Abstände für Schritte 1–8 (mobil und Desktop)
- Schritt 3: Namensfeld nur bei „Eigener Eintrag“; Optionsreihenfolge korrigiert
- Schritte 3–5: verfeinerte Desktop-Abstände zwischen Fragen und Optionen
- Navigation-Buttons: Stile für Hell/Dunkel, dezente Ausgrauung bei unvollständigen Schritten
- Header, Zahnrad und Content-Fläche („Flap“) im neuen Design
- Einstellungsdialog neu strukturiert (Sprache, Erscheinungsbild, Export, Reset)
- Zusammenfassung: kompaktere Desktop-Typografie, überarbeitete Mobil-Darstellung
- README und Server an neue Projektstruktur angepasst

### Behoben

- Flackern beim Wizard-Rad
- SVG-Anzeige beim Zurücknavigieren
- Horizontale Linie/Lücke in der mobilen Ansicht
- „Avatar erstellen“-Button auf Mobil
- Eulen-Darstellung in Avatar-Vorschau
- Button-Farben in der Zusammenfassung
- Validierung in Schritt 8

### Entfernt

- Veraltete Wheel- und Avatar-Assets
- Nicht mehr genutzte Sprechblasen-Elemente in der Zusammenfassung
- Alte statische Willkommens-Grafik (`start-willkommen-grafik.svg`)

### Technisch

- 87 Commits seit `v0.1.0-rc.1`
- Tag-Commit: `8c37070`
- 506 geänderte Dateien (+276.784 / −3.524 Zeilen)

---

## [v0.1.0-rc.1] – 2026-04-17

**Erster Prototyp für die Testphase (Release-Candidate)**

- Initiale Testversion des Profil-Assistenten-Wizards
- Grundlegender Fragen-Flow, Wizard-Rad und erste Zusammenfassung
- Tag-Commit: `9c6b9dd`

---

## Tag-Übersicht

| Tag | Datum | Beschreibung |
|-----|-------|--------------|
| `v0.1.0-rc.1` | 2026-04-17 | Erster Prototyp |
| `v0.2.0-rc.1` | 2026-07-03 | Zweiter Prototyp |
| `v0.2.1-rc.1` | 2026-07-07 | Patch auf v0.2.0-rc.1 (Layout/Theme-Fixes) |
