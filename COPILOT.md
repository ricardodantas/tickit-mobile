# COPILOT.md - Tickit Mobile

## Summary
React Native (Expo SDK 54) task manager app. Syncs with tickit-sync server. TypeScript + Zustand + expo-sqlite.

## Architecture
- `src/app/` - Expo Router file-based screens
- `src/store/index.ts` - Zustand global state
- `src/services/database.ts` - SQLite (native) / in-memory (web)
- `src/services/sync.ts` - Server sync client
- `src/theme/` - 15 themes with ThemeContext

## Critical Rules
1. **Theming**: Use `useTheme()` hook, inline styles for colors
2. **No uuid package**: Use `expo-crypto.randomUUID()`
3. **react-native-screens ~4.16.0**: Don't upgrade (breaks Expo 54)
4. **Web compat**: No Pressable style callbacks with dynamic colors
5. **Safe areas**: Use ScreenWrapper component

## Patterns
```typescript
// Theming
const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }}>

// Store
const tasks = useStore(s => s.tasks);
const addTask = useStore(s => s.addTask);

// Database
await db.insertTask(task);
await db.getTasks();
```

## Related Projects
- tickit (Rust TUI)
- tickit-sync (Rust server)
