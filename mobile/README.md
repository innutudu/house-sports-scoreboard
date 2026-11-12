# House Sports Scoreboard — Expo Mobile App (iOS & Android)

A native mobile application built with **React Native + Expo SDK 58 + TypeScript** for school sports house competitions between **Britto**, **Campion**, **Kostka**, and **Loyola**.

---

## Features

- **4 Official Houses**:
  - **Britto House** (`#2F8CDC`)
  - **Campion House** (`#F5A9CA`)
  - **Kostka House** (`#82CC1F`)
  - **Loyola House** (`#9B1C3B`)

- **Three Role-Based Access Modes (PIN Protected)**:
  - **Admin Mode**: Add new competition events, delete events, edit meet instructions, configure tournament settings. (PIN protected).
  - **Judges Mode**: Field scoring desk with 1-tap position entry (**🥇 1st: 5 pts**, **🥈 2nd: 3 pts**, **🥉 1pt**), athlete name and times recording. (PIN protected).
  - **Spectator / User Mode**: View-only leaderboard, 2D official score matrix, event schedule, and meet instructions. (No PIN required).
  - *No PIN hints are shown on screen to protect role access.*

- **Distinctive Left-Side Navigation Drawer**:
  - Slide-out drawer menu with 4-House color ribbon.
  - Live **Standings Snapshot** widget showing ranked house points.
  - In-drawer role switcher.
  - Navigation between:
    - 🏆 **Leaderboard & Standings**: Hero leader banner, percentage progress bars, medal tally (1st, 2nd, 3rd count).
    - 📊 **Official Score Matrix**: 2D touch-scrollable grid of Houses vs All 12 Events with total points and final rank.
    - 🏃 **Events & Placings**: All 12 track & field events, status filters (*All*, *Upcoming*, *Live*, *Completed*).
    - 📋 **On-Field Judge Score Card**: 1-Tap 1st/2nd/3rd scoring slip with conflict prevention and instant 5-3-1 points calculation.
    - 📜 **Meet Instructions**: Official rules and announcement banner managed directly by the Admin.

- **Offline Support**:
  - Automatically caches all scores, events, and rules using `AsyncStorage`.
  - Works seamlessly on the field or stadium track even without active internet access.

---

## Quick Start

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Open on Your Phone
- **Android**: Scan the QR code in the terminal using the **Expo Go** app from Google Play Store.
- **iOS**: Scan the QR code using the Camera app to open in **Expo Go** from the App Store.
- **Web Preview**: Press `w` in the terminal to launch in browser.
- **Emulator**: Press `a` for Android Emulator or `i` for iOS Simulator.

---

## Building Native Binaries (APK / IPA)

To build a standalone installable Android `.apk` or iOS `.ipa`:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build Android APK directly
eas build --platform android --profile preview
```
