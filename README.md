<p align="center">
  <img src="screenshots/01-tasks.png" alt="Tickit Mobile" width="300">
</p>

<h1 align="center">
  📱 Tickit Mobile
</h1>

<p align="center">
  <strong>Mobile companion app for Tickit task manager</strong>
</p>

<p align="center">
  <i>Manage your tasks on the go — synced with your terminal.</i>
</p>

<p align="center">
  <a href="https://github.com/ricardodantas/tickit-mobile/releases">
    <img src="https://img.shields.io/github/v/release/ricardodantas/tickit-mobile?style=flat&labelColor=1e1e2e&color=cba6f7&logo=github&logoColor=white" alt="Release">
  </a>
  <a href="https://github.com/ricardodantas/tickit-mobile/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-89b4fa?style=flat&labelColor=1e1e2e" alt="License">
  </a>
  <a href="https://reactnative.dev">
    <img src="https://img.shields.io/badge/React_Native-0.81-61dafb?style=flat&labelColor=1e1e2e&logo=react&logoColor=white" alt="React Native">
  </a>
  <a href="https://expo.dev">
    <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=flat&labelColor=1e1e2e&logo=expo&logoColor=white" alt="Expo SDK">
  </a>
</p>

<br>

## 📖 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📱 Screens](#-screens)
- [🔄 Sync Setup](#-sync-setup)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Development](#️-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

<br>

## ✨ Features

<table>
<tr>
<td width="50%">

### ✅ Task Management
Create, edit, complete, and delete tasks with priorities, descriptions, and due dates.

### 📋 Lists
Organize tasks into custom lists with icons. Default Inbox for quick capture.

### 🏷️ Tags
Color-coded tags for flexible categorization.

</td>
<td width="50%">

### 🔄 Sync
Sync with your self-hosted [tickit-sync](https://github.com/ricardodantas/tickit-sync) server.

### 🎨 Dracula Theme
Beautiful dark theme matching the desktop app.

### 📴 Offline-First
Works fully offline. Syncs when connected.

</td>
</tr>
</table>

<br>

### Feature Highlights

| Feature | Description |
|---------|-------------|
| ⚡ **Priority Levels** | Low, Medium, High, Urgent |
| 📅 **Due Dates** | Set deadlines with visual indicators |
| 🔔 **Notifications** | Reminders at 9AM on due date; 24h advance for high/urgent |
| 💾 **SQLite Storage** | Local database matching desktop schema |
| 🔐 **Secure Storage** | API tokens stored securely (Keychain/EncryptedPrefs) |
| 🔄 **Background Sync** | Auto-sync at configurable intervals |
| 📱 **Native Feel** | React Native with New Architecture |

<br>

## 🚀 Quick Start

### Prerequisites

- **Node.js 24+**
- **pnpm**
- **Expo Go** app on your phone (for development)
- For native builds: Xcode (iOS) / Android Studio (Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/ricardodantas/tickit-mobile
cd tickit-mobile

# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Running the App

```bash
# Start Expo development server
pnpm start

# Run on iOS simulator (macOS only)
pnpm ios

# Run on Android emulator
pnpm android

# Run in web browser
pnpm web
```

Scan the QR code with Expo Go on your phone to run the app.

<br>

## 📱 Screens

<p align="center">
  <img src="screenshots/01-tasks.png" width="250" alt="Tasks">
  <img src="screenshots/02-lists.png" width="250" alt="Lists">
  <img src="screenshots/03-tags.png" width="250" alt="Tags">
</p>

<p align="center">
  <img src="screenshots/04-settings.png" width="250" alt="Settings">
  <img src="screenshots/05-new-task.png" width="250" alt="New Task">
</p>

### Tasks

The main screen showing your task list with completion toggle, priority indicators, due date badges, and quick access to settings.

### Lists

Browse and manage your lists with task counts, list selection for filtering, and quick list creation.

### Tags

Manage your color-coded tags for flexible task categorization.

### Task Editor

Create and edit tasks with title, description, priority levels (Low, Medium, High, Urgent), list assignment, and due date picker.

### Settings

Configure sync with your self-hosted server: enable/disable sync, set server URL and API token, configure sync interval, and test sync manually.

<br>

## 🔄 Sync Setup

Tickit Mobile syncs with your self-hosted [tickit-sync](https://github.com/ricardodantas/tickit-sync) server.

### 1. Deploy tickit-sync Server

```bash
# Using Docker
docker run -d \
  --name tickit-sync \
  -p 3030:3030 \
  -v tickit-data:/data \
  ricardodantas/tickit-sync

# Or using Podman
podman run -d \
  --name tickit-sync \
  -p 3030:3030 \
  -v tickit-data:/data \
  docker.io/ricardodantas/tickit-sync
```

### 2. Generate API Token

```bash
docker exec tickit-sync tickit-sync token --name "mobile"
# Output: Generated token for 'mobile': tks_abc123...
```

### 3. Configure in App

1. Open Tickit Mobile
2. Tap the ⚙️ settings icon
3. Enable sync toggle
4. Enter your server URL (e.g., `https://sync.yourdomain.com`)
5. Enter your API token
6. Tap "Save Settings"
7. Tap "Test Sync Now" to verify

### Sync Features

| Feature | Description |
|---------|-------------|
| **Auto-sync** | Syncs automatically at configured interval |
| **Manual sync** | Tap to sync immediately |
| **Offline queue** | Changes saved locally when offline |
| **Conflict resolution** | Last-write-wins by timestamp |

<br>

## 🔔 Notifications

Tickit Mobile sends push notifications for task due dates — even when the app is closed.

### How It Works

- **Due today** → Notification at 9:00 AM on the due date
- **Due tomorrow** → Advance warning for high/urgent priority tasks (24h before)
- **On task change** → Notifications auto-scheduled when creating/editing tasks
- **On completion** → Notification cancelled when task is marked complete

### Platform Support

| Platform | Technology | Security |
|----------|------------|----------|
| **iOS** | Apple Push Notification service (APNs) | Scheduled at OS level |
| **Android** | AlarmManager/WorkManager | Scheduled at OS level |

### Toggle Notifications

1. Open Settings (⚙️)
2. Scroll to "Notifications" section
3. Toggle "Due Date Reminders"

> **Note:** Some Android devices with aggressive battery optimization may require you to whitelist Tickit in battery settings.

<br>

## 🏗️ Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React Native 0.81** | Mobile framework with New Architecture |
| **Expo SDK 54** | Development platform and build tools |
| **Expo Router v6** | File-based navigation |
| **TypeScript** | Type safety |
| **Zustand** | State management |
| **expo-sqlite** | Local SQLite database |
| **expo-secure-store** | Secure credential storage |

### Project Structure

```
tickit-mobile/
├── src/
│   ├── app/                 # Expo Router pages
│   │   ├── (tabs)/          # Tab navigation
│   │   │   ├── _layout.tsx  # Tab bar config
│   │   │   ├── index.tsx    # Tasks screen
│   │   │   ├── lists.tsx    # Lists screen
│   │   │   └── tags.tsx     # Tags screen
│   │   ├── task/
│   │   │   ├── [id].tsx     # Task detail/edit
│   │   │   └── new.tsx      # New task
│   │   ├── settings.tsx     # Settings screen
│   │   └── _layout.tsx      # Root layout
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom React hooks
│   ├── services/
│   │   ├── database.ts      # SQLite operations
│   │   ├── notifications.ts # Push notifications
│   │   └── sync.ts          # Sync client
│   ├── store/
│   │   └── index.ts         # Zustand store
│   ├── theme/
│   │   └── index.ts         # Colors & styling
│   └── types/
│       └── index.ts         # TypeScript types
├── assets/                  # App icons & images
├── app.json                 # Expo config
└── package.json
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
│              (Screens, Task Items, Forms)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Zustand Store                          │
│        (Global state, actions, selectors)                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    Database Service     │     │      Sync Service           │
│    (expo-sqlite)        │     │    (HTTP + secure store)    │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   Local SQLite DB       │     │    tickit-sync Server       │
│   (On-device storage)   │     │    (Self-hosted)            │
└─────────────────────────┘     └─────────────────────────────┘
```

### Database Schema

The mobile app uses the same schema as the desktop Tickit app:

```
┌──────────────────┐     ┌──────────────────┐
│      Lists       │     │       Tags       │
│  • id            │     │  • id            │
│  • name          │     │  • name          │
│  • icon          │     │  • color         │
│  • is_inbox      │     │  • updated_at    │
│  • updated_at    │     └──────────────────┘
└──────────────────┘              │
         │                        │
         │ 1:N                    │ M:N
         ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                         Tasks                               │
│  • id, title, description, url                              │
│  • priority (low, medium, high, urgent)                     │
│  • completed, list_id, tag_ids[]                            │
│  • due_date, created_at, updated_at                         │
└─────────────────────────────────────────────────────────────┘
```

<br>

## 🛠️ Development

### Setup

```bash
# Clone and install
git clone https://github.com/ricardodantas/tickit-mobile
cd tickit-mobile
pnpm install

# Start dev server
pnpm start
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo development server |
| `pnpm ios` | Run on iOS simulator |
| `pnpm android` | Run on Android emulator |
| `pnpm web` | Run in web browser |
| `pnpm lint` | Run ESLint |
| `pnpm prebuild` | Generate native projects |

### Building for Production

```bash
# Install EAS CLI
pnpm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Environment

| File | Purpose |
|------|---------|
| `app.json` | Expo configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |

<br>

## 🤝 Contributing

Contributions are welcome!

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linter: `pnpm lint`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use Zustand for state management
- Keep components small and focused

<br>

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ⚛️ React Native and ❤️ by <a href="https://github.com/ricardodantas">Ricardo Dantas</a></sub>
</p>

<p align="center">
  <a href="https://github.com/ricardodantas/tickit">Desktop App</a> •
  <a href="https://github.com/ricardodantas/tickit-sync">Sync Server</a>
</p>
