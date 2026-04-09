# Kibibot Creator

Create a personalized avatar for study & teaching through a multi-step wizard. The app guides users through usage, role/name, communication style, interaction preferences, knowledge scope, feedback style, avatar appearance, and privacy principles—then submits the result to a configurable API endpoint.

## Features

- **Multi-step wizard (Step 0–9)** with validation (you can’t proceed without completing the current step).
- **Clickable step wheel** for direct navigation between steps.
- **Avatar preview** in the center of the wheel (placeholder until the avatar is generated).
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
│  ├─ avatar-placeholder.png
│  └─ wheel-ring.svg
├─ styles/
│  └─ styles.css
└─ src/
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

This is especially important if you use **Lottie animations** (`assets/avatar-animations/*.json`), because `file://` loading will block XMLHttpRequests due to browser CORS rules.

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

## Notes / behavior

- **Step wheel**: click the **Start** area or **step 1–8** areas on the ring to jump (forward jumps still respect validation unless test mode is on). On the **welcome page (step 0)**, **Start** jumps to the **first incomplete** step (or the summary if everything is done). On any other step, **Start** returns to the welcome page.
- **Step 3 (Communication style)**: consists of 5 categories with two options each.
- **Step 7 (Avatar appearance)**: the “Facial expression” is not shown as a UI category; it is derived automatically from Step 3 “Humor”.

## Troubleshooting

- If changes don’t appear in the browser, try a hard refresh: **Ctrl+F5**.
- Make sure you are opening the correct `index.html` from this project folder.

## License

No license specified yet. Add a `LICENSE` file if you want to define usage terms.