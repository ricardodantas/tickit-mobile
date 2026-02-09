# CLAUDE.md - Tickit Mobile

> Anthropic Claude-specific guidance for this codebase.

## Quick Context

Tickit Mobile is a React Native/Expo task manager app that syncs with a self-hosted server. It's the mobile companion to the terminal-based Tickit TUI.

**Tech Stack**: React Native 0.81 + Expo SDK 54 + TypeScript + Zustand + expo-sqlite

## Priority Rules

1. **Theming**: Always use `useTheme()` hook, never hardcode colors
2. **Web Compatibility**: Avoid Pressable style callbacks with colors (CSS errors)
3. **Package Versions**: Keep react-native-screens at ~4.16.0 (4.17+ broken)
4. **UUIDs**: Use `expo-crypto.randomUUID()`, not uuid package
5. **Safe Areas**: Use ScreenWrapper component, don't add manual padding

## File Structure at a Glance

```
src/app/           → Screens (Expo Router file-based routing)
src/components/    → Reusable UI (ScreenWrapper, Icon)
src/services/      → Database, sync, notifications
src/store/         → Zustand global state
src/theme/         → 15 themes + ThemeContext
src/types/         → TypeScript interfaces
```

## Common Patterns

### Theme Usage
```typescript
const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }}>
```

### Store Access
```typescript
const tasks = useStore(state => state.tasks);
const addTask = useStore(state => state.addTask);
```

### Database
- Native: expo-sqlite (persistent)
- Web: in-memory (session only)
- Schema matches desktop Tickit

## When in Doubt

- Check `AGENTS.md` for detailed guidance
- Cross-platform issues → check `Platform.OS` handling
- Sync issues → check `src/services/sync.ts`
- Theme issues → check `src/theme/ThemeContext.tsx`
