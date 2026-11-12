# Inter-House Sports Meet Scoreboard

A sports competition scoreboard application tailored to the official sports meet format between:
- **Britto House**: Azure / Sky Blue (`#2F8CDC`)
- **Campion House**: Light Pink (`#F5A9CA`)
- **Kostka House**: Lime Green (`#82CC1F`)
- **Loyola House**: Maroon / Burgundy (`#9B1C3B`)

---

## Role-Based Access Modes

The app supports three access modes via the top-header **Mode Switcher**:

1. **Admin Mode (Full Access)**
   - Add, configure, and delete events.
   - Write, edit, and manage meet instructions, rules, scoring criteria, and announcement banners.
   - Edit and override scores, placings, and judge sheets.
   - **PIN Protected** (Confidential administrator PIN required)

2. **Judges Mode (Score & Name Edits)**
   - Tailored for field marshals, track judges, and scorers.
   - Quick 1-tap position selection (**1st [5 pts]**, **2nd [3 pts]**, **3rd [1 pt]**).
   - Edit student athlete names, select houses, and record times/remarks.
   - Restricted from deleting events and editing schedule instructions.
   - **PIN Protected** (Confidential judges PIN required)

3. **User Mode (View Only Access)**
   - Free spectator access for students, parents, and visitors.
   - Real-time leaderboard, score matrix, event cards, judge records, and program schedule.
   - All editing controls, score buttons, and deletion actions are hidden/disabled.
   - **No PIN required**.

---

## Key Features

- **Updated Houses and Custom Hex Colors**:
  - Full theme color tokens, progress bars, rings, badges, and chips matching the exact house hex codes:
    - **Britto**: `#2F8CDC` (Azure / Sky Blue)
    - **Campion**: `#F5A9CA` (Light Pink)
    - **Kostka**: `#82CC1F` (Lime Green)
    - **Loyola**: `#9B1C3B` (Maroon / Burgundy)

- **Judges' Score Cards for Quick Scoring**:
  - Dedicated on-field score card interface matching the layout in the official score sheets document: `Name | Position | Name of the House`.
  - **1-Tap Position Tagging**: Large, high-visibility buttons for **🥇 1st (5 pts)**, **🥈 2nd (3 pts)**, and **🥉 3rd (1 pt)** with conflict-free auto-reassignment.
  - Automatically calculates house points and updates the leaderboard and matrix.
  - **Printable Judge Slips**: Formatted for clipboards with official signature sign-off lines.

- **Distinctive Left-Side Navigation Drawer Menu**:
  - Full-featured, accessible left-side slide-out drawer menu (`LeftDrawerMenu.tsx`) with smooth backdrop blur and responsive behavior.
  - **Championship Header & 4-House Color Ribbon**: Displays Britto, Campion, Kostka, and Loyola house identities.
  - **Distinctive Navigation Items**: High-contrast icons, explanatory sub-labels, active indicator borders, and live status badges (`Live`, `12 Events`, `Scoring`, `Editable`).
  - **Live Standings Snapshot**: Embedded mini-standings card showing house rankings and scores directly in the drawer.
  - **In-Drawer Role Switcher**: Quick access to switch between Admin, Judges, and User access modes.
  - **Quick Actions Footer**: Print Score Sheet, Refresh Scores, and Add Event button for Admins.
  - Accessible via the prominent header `[ ☰ Menu ]` button, section breadcrumb, or `Escape` key.

- **Admin-Managed Instructions Section**:
  - Full instructions board managed directly by the Admin:
    - *General Meet Guidelines & Conduct*
    - *Scoring & House Points System*
    - *Track & Field Rules & Regulations*
    - *Judges, Marshals & Protests Protocol*
  - Admins can add new custom categories, edit existing rules, delete sections, or restore templates with 1-click.
  - Official announcement banner editable by Admin for real-time alerts.
  - Numbered item rendering, live search filter for athletes/judges, and print-ready formatting.

- **12 Official Events Pre-configured**:
  - Track: 100m, 200m, 400m, 800m, 1500m, Relay (4x100m).
  - Field: Javelin, Shot-put, Discus, High Jump, Long Jump.
  - Team: Tug of War.

- **Official House Score Matrix Table**:
  - Displays each House as rows vs. all 12 events as columns with total points and final rank.

- **March Past Contingents Sequence**:
  - Official order of standing for all 16 participating schools.

---

## Quick Start

### Web Application (React 19)
```bash
# Start web development server
npm run dev

# Or build production web bundle
npm run build
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Mobile Application (React Native + Expo SDK 58)
```bash
# Start Expo development server
npm run mobile:start

# Run on Android
npm run mobile:android

# Run on iOS
npm run mobile:ios

# Run on Web Preview
npm run mobile:web
```
Scan the generated QR code in your terminal with **Expo Go** on Android or the Camera app on iOS. See [`mobile/README.md`](file:///C:/Users/SXIC/house-sports-scoreboard/mobile/README.md) for full mobile documentation and APK/IPA build commands.
