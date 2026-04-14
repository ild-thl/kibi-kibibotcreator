# Kibibot Creator

Create a personalized avatar for study & teaching through a multi-step wizard. The app guides users through usage, role/name, communication style, interaction preferences, knowledge scope, feedback style, avatar appearance, and privacy principles—then submits the result to a configurable API endpoint.

## Features

- **Multi-step wizard (Step 0–9)** with validation (you can’t proceed without completing the current step).
- **Clickable step wheel** for direct navigation between steps.
- **Avatar preview** in the center of the wheel (placeholder until the avatar is generated).
- **Lottie animations** in the wheel center on step changes and on answer selections (`assets/wheel-animations/`, see below).
- **DiceBear avatar generation** using the `avataaars` style.
- **Custom validation modal** instead of browser `alert()`.
- **Configurable API target** via `src/config.js`.

## Tech stack

- **HTML + CSS + Vanilla JavaScript**
- **TailwindCSS** via CDN (utility classes) plus custom styles in `styles/styles.css`
- **DiceBear** (`https://api.dicebear.com/9.x/avataaars/svg`)

## Project structure

```text
.
├─ index.html
├─ README.md
├─ assets/
│  ├─ avatar-animations/     (optional fallback for step transitions)
│  ├─ wheel-animations/       (Lottie JSON: transitions + per-step selections)
│  └─ wheel-ring.svg
├─ styles/
│  └─ styles.css
└─ src/
   ├─ wizard/
   │  ├─ wheel-center-lottie.js
   │  └─ …
   ├─ app.js
   └─ config.js
```

## Run locally

This is a static web app.

### Option A: Open directly

- Open `index.html` in your browser.

### Option B: Use a local web server (recommended)

Using a server avoids potential browser restrictions around local files.

- VS Code extension “Live Server”
- or any simple server (e.g. Python, Node, IIS)

### Option C: Use the included Node server

- Run `node server.js` in the project folder
- Open `http://localhost:3000`

This is especially important if you use **Lottie JSON** (`assets/wheel-animations/**/*.json` and `assets/avatar-animations/*.json`), because `file://` loading will block XMLHttpRequests due to browser CORS rules.

## Configuration

Update the API endpoint in `src/config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: "https://your-target-url.example/api",

  // Optional: allow using test mode via URL (see below)
  enableTestMode: false,
};
```

When the wizard is completed, the app calls the configured endpoint with the collected values as **query parameters**.

## Test mode

For UI development and quick checks (especially of **Step 7 / avatar appearance**) there is a simple test mode:

- **Enable test mode via config + URL**
  - In `src/config.js`, set `enableTestMode: true`.
  - Then add `?test=1` to the URL, e.g. `index.html?test=1`.
  - Only when **both** are true (`enableTestMode === true` **and** `?test=1`) is test mode active.

- If `enableTestMode` is `false` (default), the URL parameter is ignored and test mode is always off.

When test mode is active:

- **All validations are skipped** – every step is treated as valid.
- You can jump directly to any step via the wheel (for example, from the start page straight to Step 7) without filling out previous steps.

## Wheel debug mode (development)

The wheel uses **invisible hit targets** (transparent buttons) aligned to the SVG artwork. To check or fine-tune alignment:

- **URL:** append `?wheelDebug=1` (or `wheeldebug=1`) when opening the app, e.g. `index.html?wheelDebug=1`.
- **Keyboard:** press **Alt+Shift+D** to toggle the debug overlay on or off (no reload).

When debug mode is on, `body` gets the class `wizard-wheel-debug`:

- **Start (step 0)** is shown with a green-tinted dashed circle and label `0`.
- **Steps 1–8** use a red-tinted dashed circle and their step number.

Implementation: `src/wizard/wheel.js` (`WizardWheel.setWheelDebug(true|false)` and `WizardWheel.isWheelDebugEnabled()` are also available in the console).

## Wheel center animations (Lottie)

Center animations are driven by **`src/wizard/wheel-center-lottie.js`** (Lottie Web is loaded from the CDN in `index.html`). They play **inside** `.wizard-wheel-avatar` on the **currently visible** step.

### When animations run

1. **Start step (step 0)** – whenever the welcome screen is shown, the app plays `transitions/on-load.json` in the wheel center **in a loop** (`loop: true`). That happens on first load, after **“Avatar zurücksetzen”**, and whenever you **navigate back** to the start step. Leaving step 0 stops the loop (other clips use `loop: false`). If `on-load.json` is missing or fails to load, the placeholder image stays visible.
2. **Step transition** – whenever `currentStep` changes (after `updateUI`), the app tries to load a **transition** clip for the step you **enter**.
3. **Answer selection** – when the user clicks a `.card-select` (or an avatar option in step 8), the app tries to load a **selection** clip that can depend on **all other answers already set in that same step** (order-independent: filenames use the same rules whether the user answers “usage” first or “help” first).

Other animations are **not** played when:

- `currentStep === 9` (summary has no wheel), or
- `currentStep === 8` **and** `avatarInitialized === true` (center shows the static DiceBear preview instead).

Multi-select **deselect** does not trigger a clip (only **adding** a value does).

### Where to put files

Use this folder (create it if needed):

```text
assets/wheel-animations/
├─ transitions/
│  ├─ on-load.json                   (Schritt 0, geloopt, bei jedem Aufenthalt auf Start)
│  ├─ from-step-00-to-step-01.json   (optional, most specific)
│  ├─ to-step-01.json                … to-step-09.json
│  └─ …
├─ step-01/
│  ├─ sel-usage-lernraum.json
│  ├─ sel-help-lernen.json
│  ├─ sel-help-lernen__usage-lernraum.json
│  └─ sel-usage-lernraum__help-lernen-and-planen.json
├─ step-02/
│  └─ …
└─ step-08/
    └─ …
```

- **`transitions/`** – clips when **entering** a step (`currentStep` after navigation).
- **`step-NN/`** – `NN` = wizard step **01–08** (two digits), matching `state.currentStep` (1 = first question step after start, …, 8 = avatar appearance).

### How the app picks a file (fallback chain)

**Transitions** (in order, first successful load wins):

1. **Context-aware (last shown wheel clip):**  
   `transitions/from-step-{A}-{lastClipBase}-to-step-{B}.json`  
   `transitions/from-{lastClipBase}-to-step-{B}.json`  
   Example (if last clip was `sel-help-schreiben-and-planen`):  
   `transitions/from-step-01-sel-help-schreiben-and-planen-to-step-02.json`
2. `transitions/from-step-{A}-to-step-{B}.json` with **two-digit** `A` and `B` (e.g. `from-step-00-to-step-01.json`).
3. `transitions/to-step-{B}.json` (e.g. `to-step-01.json`).
4. **Legacy:** `assets/avatar-animations/step{B}.json` (same numbering as before).

**Selections** for step `S` (in order, first successful load wins):

1. **Canonical full combo:** `step-NN/sel-{seg1}-{slug1}__{seg2}-{slug2}__….json`  
   – one pair per field in that step that already has a value, in **`STEP_FIELDS` order** (same order as the table below), independent of which option was clicked last. Example step 1: `sel-usage-lernraum__help-lernen.json`.
2. **Clicked-first combo** (legacy / alternate authoring): same pairs but the **clicked** field’s segment comes first in the filename.
3. **Pairwise** (clicked field vs each other set field), then **solo** for the clicked value.

`{seg}` is a short alias for the `data-field` / state key (e.g. `usage_context` → `usage`, `help_context` → `help`). See `FIELD_SEGMENT` in `wheel-center-lottie.js` for the full list.

`{valueSlug}` is derived from the **clicked** value (or current state for the other fields): lowercased, `&` → `and`, non-alphanumeric → `-`, empty → `none`.  
For **arrays** (multi-select), values are **sorted**, slugified, and joined with `-and-` (e.g. `lernen-and-planen`).  
**Step 1 `help_context`:** If sort order and **click order** differ (e.g. Schreiben + Planen → sorted `planen-and-schreiben` vs. order `schreiben-and-planen`), the resolver tries **both** full combo filenames so assets like `sel-help-schreiben-and-planen.json` / `sel-usage-…__help-schreiben-and-planen.json` still match.

**Examples (step 1)**

| Situation | Tried files (simplified) |
|-----------|---------------------------|
| Choose “Lernraum” only | `sel-usage-lernraum.json` |
| Then add help “Lernen” | `sel-usage-lernraum__help-lernen.json`, then fallbacks (`sel-help-lernen__usage-lernraum.json`, `sel-help-lernen.json`) |
| Choose “Lernen” first, no usage yet | `sel-help-lernen.json` |
| Then choose “Lernraum” | `sel-usage-lernraum__help-lernen.json`, then `sel-usage-lernraum.json` |

So you can author **either** the **combo** file, **or** only the **solo** files, depending on how granular your motion design is. Missing files are skipped automatically.

### Steps and fields (for `step-NN` clips)

The resolver knows these fields per wizard step (must match `index.html` / `state`):

| Step (`currentStep`) | Fields used in filenames |
|----------------------|---------------------------|
| 1 | `usage_context`, `help_context` |
| 2 | `personality_greeting`, `personality_humor`, `personality_answer`, `personality_tone`, `personality_style` |
| 3 | `role`, `nameChoice` |
| 4 | `interaction_workflow`, `interaction_examples` |
| 5 | `knowledge`, `knowledge_source`, `decision_mode` |
| 6 | `feedback` |
| 7 | `privacy` |
| 8 | `avatarType`, `avatarSkinColor`, `avatarHairColor`, `avatarTop`, `avatarFacialHair`, `avatarClothing`, `avatarMouth` |

Für den Typ **human** wird `avatarClothing` nicht in Schritt 8 gewählt, sondern aus Schritt 2 **Ton** abgeleitet: *Locker* → `shirtCrewNeck` (T‑Shirt runder Ausschnitt), *Professionell* → `collarAndSweater` (Kragen & Pullover).

**Avatar-Typen:** `human` (Dicebear Avataaars + detaillierte Optionen), `robot` (Dicebear Bottts), `owl` (lokale SVGs `assets/avatar-types/owl-{happy|serious}.svg`). Ältere Exporte mit anderen Typen werden beim Öffnen von Schritt 8 auf `human` zurückgesetzt.

**Note:** Free-text name entry (`#inputName`) does not trigger a clip yet; only `nameChoice` buttons do. You can extend this later with an `input` listener if needed.

### API (console / debugging)

- `WizardWheelCenter.notifyUiUpdate(state)` – normally called from navigation after UI update.
- `WizardWheelCenter.notifySelection(state, { field, value, isMulti, added })` – mirrors card clicks.
- `WizardWheelCenter.slugify(value)` / `WizardWheelCenter.fieldSeg(field)` – to preview filename segments.

## Notes / behavior

- **Step wheel**: click the **Start** area or **step 1–8** areas on the ring to jump (forward jumps still respect validation unless test mode is on). On the **welcome page (step 0)**, **Start** jumps to the **first incomplete** step (or the summary if everything is done). On any other step, **Start** returns to the welcome page.
- **Step 2 (Persönlichkeit & Ton)**: five categories with two options each (greeting, humor, answer style, tone, style).
- **Step 8 (Avatar appearance)**: Mouth is not a separate UI row; it follows Step 2 “Humor”. **Clothing** is not shown either; for humans it follows Step 2 **Ton** (Locker = crew-neck shirt, Professionell = collar & sweater). **Accessories** are not used (DiceBear URL always has accessories disabled).

## Troubleshooting

- If changes don’t appear in the browser, try a hard refresh: **Ctrl+F5**.
- Make sure you are opening the correct `index.html` from this project folder.

## License

No license specified yet. Add a `LICENSE` file if you want to define usage terms.