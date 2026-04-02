# Axiom Tab
A productivity-focused techno Chrome new tab extension for busy engineers

![Axiom Tab Demo](demo.gif)

## Features

- **Live Clock** — updates every second, displayed front and center
- **Customizable Shortcuts** — click the edit button to edit or remove site shortcuts; saved locally
- **Google Calendar Widget** — connect your Google account to see upcoming events
- **Task List** — add tasks, check them off, and they auto-dismiss 10 minutes after completion

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. Open a new tab

## Usage

| Feature | How to use |
|---|---|
| Shortcuts | Click the pencil icon (✎) to open the edit panel — add, rename, or remove shortcuts |
| Calendar | Click **Connect Calendar** and authorize with your Google account |
| Tasks | Type in the task input and press **Enter** or **+** to add; click a task to mark it done |

## Permissions

| Permission | Reason |
|---|---|
| `identity` | Google OAuth2 sign-in for Calendar |
| `storage` | Persist shortcuts and tasks across sessions |
| `https://www.googleapis.com/*` | Fetch Google Calendar events |
