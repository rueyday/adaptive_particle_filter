# Axiom Tab

> A productivity-focused Chrome new tab extension with a sci-fi aesthetic — clock, calendar, tasks, and shortcuts in one place.

![Axiom Tab Demo](demo.gif)

## Features

### Live Clock
A large, real-time clock sits at the center of every new tab, updating every second.

### Customizable Shortcuts
A row of quick-access site buttons sits below the clock. Click the pencil icon (✎) to open the edit panel where you can:
- Add new shortcuts with a name and URL
- Rename existing ones
- Remove any shortcut with the × button

Shortcuts are saved in `localStorage` and persist across browser sessions.

### Google Calendar Widget
A fixed left-side panel displays your upcoming events for the next 10 days pulled directly from Google Calendar. Features include:
- Events grouped by day with date headers
- Start time shown for timed events; "All Day" for full-day events
- Event location displayed when available
- A **NOW** badge highlights whichever event is currently in progress
- Automatically refreshes your token if it expires

Click **Connect Calendar** and sign in with your Google account to get started. Only read access is requested — the extension never modifies your calendar.

### Task List
A fixed right-side panel holds a lightweight to-do list. Tasks are saved in `localStorage`.
- Press **Enter** or click **+** to add a task
- Click any task to mark it as done — a strikethrough and countdown timer appear
- Completed tasks auto-dismiss after 10 minutes

### Animated Background
A full-screen canvas animation runs behind everything:
- Faint hex grid overlay
- Rotating 3D wireframe shapes
- Targeting ring systems with orbital arcs
- Expanding pulse rings
- Twinkling star field

---

## Setup

### Load Unpacked (Developer Mode)

1. [Download or clone this repository](https://github.com/Ruey-Day/axiom-tab)
2. Open Chrome and go to `chrome://extensions`
3. Toggle on **Developer mode** in the top-right corner
4. Click **Load unpacked** and select the `axiom-tab` folder
5. Open a new tab — Axiom Tab is now active

### Connect Google Calendar

1. Click the **Connect Calendar** button in the left panel
2. A Google sign-in popup will appear — sign in and grant calendar read access
3. Your upcoming events will load automatically

> **Note:** If you see "Auth failed", make sure your Google Cloud project has the Calendar API enabled and your extension ID is added as an authorized redirect URI. See the [OAuth setup guide](#oauth-setup) below.

### Video Walkthrough

[![Watch the setup guide](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

> Replace `VIDEO_ID` in this README with your actual YouTube video ID once uploaded.

---

## OAuth Setup

If you are loading this unpacked (not installed from the Chrome Web Store), you need to wire up OAuth yourself:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a project
2. Enable the **Google Calendar API** under *APIs & Services → Library*
3. Go to *APIs & Services → Credentials* and create an **OAuth 2.0 Client ID** (type: Chrome Extension)
4. Go to `chrome://extensions`, enable Developer Mode, and copy your extension's **ID**
5. Add the following as an authorized redirect URI in your OAuth client:
   ```
   https://<your-extension-id>.chromiumapp.org/
   ```
6. Copy the client ID into `manifest.json` under the `oauth2.client_id` field
7. Go to *OAuth consent screen* and add your Google account as a **test user** (required while the app is in Testing status)

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `identity` | Google OAuth2 sign-in to access Google Calendar |
| `storage` | Persist shortcuts and tasks across browser sessions |
| `https://www.googleapis.com/*` | Fetch events from the Google Calendar API |

---

## Stack

- Manifest V3 Chrome Extension
- Vanilla JavaScript, HTML, CSS — no build step, no dependencies
- Google OAuth2 via `chrome.identity` (calendar read-only scope)
- Canvas 2D API for the animated background

---

## File Overview

| File | Purpose |
|---|---|
| `newtab.html` | Main page structure |
| `style.css` | All styles and layout |
| `background.js` | Canvas animation (hex grid, shapes, stars) |
| `script.js` | Clock |
| `shortcuts.js` | Shortcuts grid and edit panel |
| `calendar.js` | Google Calendar auth and event rendering |
| `todo.js` | Task list with auto-dismiss timers |
| `manifest.json` | Extension config, permissions, OAuth credentials |

---

## License

[MIT](LICENSE)
