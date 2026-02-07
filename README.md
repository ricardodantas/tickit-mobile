# Tickit Mobile

📱 Mobile companion app for [Tickit](https://github.com/ricardodantas/tickit) - the beautiful terminal task manager.

## Features

- ✅ **Task Management** - Create, edit, complete, and delete tasks
- 📋 **Lists** - Organize tasks into custom lists
- 🏷️ **Tags** - Color-coded tags for flexible categorization
- 🔄 **Sync** - Sync with your self-hosted [tickit-sync](https://github.com/ricardodantas/tickit-sync) server
- 🎨 **Dracula Theme** - Beautiful dark theme matching the desktop app
- 📴 **Offline-First** - Works fully offline, syncs when connected

## Tech Stack

- **React Native** with New Architecture (Fabric + TurboModules)
- **Expo** SDK 54 with Expo Router v6
- **TypeScript** for type safety
- **Zustand** for state management
- **expo-sqlite** for local storage
- **expo-secure-store** for secure credential storage

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Sync Setup

1. Deploy your [tickit-sync](https://github.com/ricardodantas/tickit-sync) server
2. Generate an API token: `tickit-sync token --name "mobile"`
3. Open Settings in the app
4. Enter your server URL and token
5. Enable sync

## Project Structure

```
src/
├── app/                 # Expo Router pages
│   ├── (tabs)/          # Tab navigation
│   │   ├── index.tsx    # Tasks screen
│   │   ├── lists.tsx    # Lists screen
│   │   └── tags.tsx     # Tags screen
│   ├── task/
│   │   ├── [id].tsx     # Task detail/edit
│   │   └── new.tsx      # New task
│   ├── settings.tsx     # Settings screen
│   └── _layout.tsx      # Root layout
├── components/          # Reusable components
├── hooks/               # Custom hooks
├── services/            # Database & sync services
├── store/               # Zustand store
├── theme/               # Colors & styling
└── types/               # TypeScript types
```

## License

MIT © Ricardo Dantas
