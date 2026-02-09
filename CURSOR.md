# CURSOR.md - Tickit Mobile

## Project Type
React Native mobile app (Expo SDK 54, TypeScript)

## Key Files
- `src/store/index.ts` - Zustand state management
- `src/services/database.ts` - SQLite + web fallback
- `src/services/sync.ts` - Server sync client
- `src/theme/index.ts` - 15 theme definitions
- `src/app/` - Expo Router screens

## Rules
1. Use `useTheme()` for colors, never hardcode
2. Keep `react-native-screens@~4.16.0` (4.17+ broken with Expo 54)
3. Use `expo-crypto.randomUUID()` not uuid package
4. No Pressable style callbacks with colors (breaks web)
5. Use ScreenWrapper for consistent layouts

## Commands
```bash
pnpm start     # Dev server
pnpm ios       # iOS simulator
pnpm android   # Android emulator
pnpm web       # Web browser
pnpm lint      # ESLint
```

## Architecture
```
Screens (app/) → Store (Zustand) → Services (database/sync)
                     ↓
              Theme (ThemeContext)
```
