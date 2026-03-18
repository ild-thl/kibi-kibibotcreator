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

## Configuration

Update the API endpoint in `src/config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: "https://your-target-url.example/api",
};
```

When the wizard is completed, the app calls the configured endpoint with the collected values as **query parameters**.

## Notes / behavior

- **Step wheel**: click on circles to jump to steps. Clicking the “Start” circle returns to the start page (Step 0). If the start circle is currently highlighted, it jumps to the next incomplete step.
- **Step 3 (Communication style)**: consists of 5 categories with two options each.
- **Step 7 (Avatar appearance)**: the “Facial expression” is not shown as a UI category; it is derived automatically from Step 3 “Humor”.

## Troubleshooting

- If changes don’t appear in the browser, try a hard refresh: **Ctrl+F5**.
- Make sure you are opening the correct `index.html` from this project folder.

## License

No license specified yet. Add a `LICENSE` file if you want to define usage terms.