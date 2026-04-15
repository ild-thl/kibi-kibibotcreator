# Kibibot Creator

Kibibot Creator is a multi-step wizard for configuring a study/teaching avatar.  
It collects user choices (usage, role/name, communication style, behavior, knowledge, feedback, appearance, privacy) and submits the result to a configurable API endpoint.

## Overview

- Multi-step wizard (`step0` to `step9`) with validation.
- Clickable wheel navigation with direct step jumps.
- Avatar preview in the center of the wheel.
- Wheel-center animation resolver with Lottie JSON and SVG fallback support.
- DiceBear-based avatar rendering (`avataaars` for human, `bottts` for robot).
- Configurable API endpoint and optional test/debug modes.

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- TailwindCSS via CDN (utility classes) + custom CSS in `styles/styles.css`
- DiceBear avatar APIs
- Lottie Web (CDN in `index.html`)

## Project Structure

```text
.
├─ index.html
├─ README.md
├─ server.js
├─ assets/
│  ├─ wheel-animations/
│  │  ├─ transitions/
│  │  ├─ step-01/
│  │  └─ ...
│  └─ avatar-types/
├─ styles/
│  └─ styles.css
└─ src/
   ├─ app.js
   ├─ config.js
   └─ wizard/
      ├─ wheel-center-lottie.js
      ├─ wheel.js
      ├─ avatar.js
      └─ ...
```

## Running Locally

This is a static web app.

### Option A: Open `index.html` directly

- Fastest for basic UI checks.

### Option B: Use any local web server (recommended)

- Example: VS Code Live Server, Python, Node, IIS.
- Recommended because `file://` can block JSON loading (CORS/XHR), especially for Lottie assets.

### Option C: Use the included Node server

1. Run `node server.js` in the project folder.
2. Open [http://localhost:3000](http://localhost:3000).

## Configuration

Update `src/config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: "https://your-target-url.example/api",
  enableTestMode: false
};
```

When the wizard is complete, the app calls `apiBaseUrl` with collected values as query parameters.

## Test and Debug Modes

### Test Mode

Enable fast navigation/testing by setting both:

1. `enableTestMode: true` in `src/config.js`
2. URL parameter `?test=1`

Behavior in test mode:

- Step validation is skipped.
- Wheel jumps can move to any step immediately.

### Wheel Hit-Target Debug

- URL: `?wheelDebug=1` (or `wheeldebug=1`)
- Keyboard toggle: `Alt+Shift+D`

When active, the app adds `wizard-wheel-debug` to `body` and shows visual hit zones.

### Wheel Animation Debug Logs

- URL: `?wheelAnimDebug=1` (or `wheelanimdebug=1`)
- Console prefix: `[wheel-anim-debug]`

Useful events include `candidate_list`, `candidate_try`, `candidate_loaded`, `candidate_failed`, `fetch_not_ok`, `candidate_timeout`, and `skip_known_missing`.

## Wheel-Center Animation System

Animation logic is implemented in `src/wizard/wheel-center-lottie.js`.

- For a `*.json` candidate, the resolver can also try the matching `*.svg` file.
- For `step-NN/sel-*.json`, JSON is prioritized before SVG so motion clips can replay when available.
- On revisit of completed steps, the last successful step visual is cached and reused first.

### When Animations Run

1. **Step 0 (start)**: plays `transitions/on-load.json` in a loop.
2. **Step transitions**: whenever `currentStep` changes.
3. **Selection changes**: on `.card-select` interactions, including avatar options in step 8.

Animations are skipped when:

- `currentStep === 9` (summary), or
- Step 8 already shows a finalized avatar preview.

For multi-select deselection, the wheel updates to the remaining state using restore candidates.

### Asset Locations

```text
assets/wheel-animations/
├─ transitions/
│  ├─ on-load.json
│  ├─ from-step-00-to-step-01.json
│  ├─ to-step-01.json
│  └─ ...
├─ step-01/
│  ├─ sel-usage-lernraum.json
│  ├─ sel-help-lernen.json
│  ├─ sel-help-lernen__usage-lernraum.json
│  └─ sel-usage-lernraum__help-lernen-and-planen.json
├─ step-02/
│  └─ ...
└─ step-08/
   └─ ...
```

- `transitions/`: clips when entering a step.
- `step-NN/`: selection clips for wizard step `01` to `08`.
- You can provide JSON and/or SVG with the same base name.

### Resolver Order (Simplified)

**Transitions**:

1. Context-aware transition based on last shown wheel clip  
   `from-step-{A}-{lastClipBase}-to-step-{B}.json`  
   `from-{lastClipBase}-to-step-{B}.json`
2. Generic pair transition  
   `from-step-{A}-to-step-{B}.json`
3. Generic target transition  
   `to-step-{B}.json`

**Selections**:

1. Field value change transition (`sel-from-{seg}-{old}-to-{seg}-{new}`)
2. Full-state transition (`sel-from-{oldCanonicalBase}-to-{newCanonicalBase}`)
3. Canonical full combo (`sel-{seg1}-{slug1}__{seg2}-{slug2}`)
4. Clicked-first legacy combo variants
5. Pairwise variants and solo fallback

## Step-to-Field Mapping for `step-NN` Assets

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

Notes:

- For `human`, `avatarClothing` is derived from step 2 tone:
  - `Locker` -> `shirtCrewNeck`
  - `Professionell` -> `collarAndSweater`
- Avatar types: `human`, `robot`, `owl`
- Step 8 no longer preselects `human`; avatar type starts empty until chosen by the user.

## Behavioral Notes

- Wheel navigation:
  - From step 0, clicking **Start** jumps to the first incomplete step.
  - From other steps, **Start** returns to step 0.
  - Forward jumps require validation unless test mode is active.
- Step 3:
  - The wizard offers randomly generated name suggestions.
  - Suggestions include male, female, and neutral names.
  - Names are drawn from fixed internal pools (`NAME_SUGGESTIONS_MALE`, `..._FEMALE`, `..._NEUTRAL`) and assigned once during app initialization; reloading the page can produce a different set.
- Step 8:
  - Mouth is derived from step 2 humor.
  - Clothing is derived from step 2 tone (for human).
  - DiceBear accessories are disabled.
- Name free-text input (`#inputName`) currently does not trigger wheel clips directly (button choices do).

## Debug API Helpers (Console)

- `WizardWheelCenter.notifyUiUpdate(state)`
- `WizardWheelCenter.notifySelection(state, { field, value, isMulti, added })`
- `WizardWheelCenter.slugify(value)`
- `WizardWheelCenter.fieldSeg(field)`

## Troubleshooting

- Hard refresh the browser (`Ctrl+F5`) if changes do not appear.
- Verify you opened the correct `index.html` from this repository.
- Prefer local server mode instead of `file://` when testing animation files.

## License

No license is defined yet. Add a `LICENSE` file to specify usage terms.