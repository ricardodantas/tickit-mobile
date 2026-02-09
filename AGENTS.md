# AGENTS.md - Tickit Mobile

AI agent guidance for the Tickit Mobile codebase.

## Project Overview

**Tickit Mobile** is a React Native (Expo) companion app for the [Tickit](https://github.com/ricardodantas/tickit) terminal task manager. It syncs with a self-hosted [tickit-sync](https://github.com/ricardodantas/tickit-sync) server.

- **Platform**: iOS, Android, Web
- **Framework**: React Native 0.81 with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router v6 (file-based)
- **State**: Zustand
- **Database**: expo-sqlite (native), in-memory (web)
- **Styling**: React Native StyleSheet (no CSS-in-JS libraries)

## Architecture

```
src/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/             # Tab navigation group
│   │   ├── _layout.tsx     # Tab bar configuration
│   │   ├── index.tsx       # Tasks screen (main inbox)
│   │   ├── lists.tsx       # Lists management
│   │   └── tags.tsx        # Tags management
│   ├── task/[id].tsx       # Task create/edit (id='new' for create)
│   ├── list/[id].tsx       # List detail view
│   ├── settings.tsx        # Settings screen
│   ├── themes.tsx          # Theme picker
│   └── _layout.tsx         # Root layout (Stack navigator)
├── components/             # Reusable UI components
│   ├── ScreenWrapper.tsx   # SafeAreaView + header wrapper
│   └── Icon.tsx            # Feather icon wrapper
├── services/               # Business logic
│   ├── database.ts         # SQLite operations + web fallback
│   ├── sync.ts             # Sync client for tickit-sync server
│   └── notifications.ts    # Push notification scheduling
├── store/
│   └── index.ts            # Zustand global store
├── theme/
│   ├── index.ts            # 15 theme definitions
│   └── ThemeContext.tsx    # Theme provider + useTheme hook
└── types/
    └── index.ts            # TypeScript interfaces
```

## Key Patterns

### Theming

```typescript
// Always use useTheme() for dynamic colors
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const { colors } = useTheme();
  
  // Apply colors via inline styles, not StyleSheet
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.foreground }}>Hello</Text>
    </View>
  );
}
```

**15 Themes Available**: Dracula, Nord, Tokyo Night, Catppuccin Mocha/Latte, Gruvbox Dark/Light, One Dark, Solarized Dark/Light, Rosé Pine/Dawn, Everforest, Kanagawa, Monokai.

### State Management

```typescript
import { useStore } from '../store';

function TaskList() {
  // Select only what you need
  const tasks = useStore(state => state.tasks);
  const toggleTask = useStore(state => state.toggleTask);
  
  // Actions are async and update the store
  await toggleTask(taskId);
}
```

### Database

- **Native (iOS/Android)**: expo-sqlite with SQLite database
- **Web**: In-memory store (data doesn't persist on refresh)
- **Schema matches desktop**: tasks, lists, tags, task_tags tables
- **Migrations**: Auto-run on init (see `runMigrations()` in database.ts)

### Sync

- Syncs with [tickit-sync](https://github.com/ricardodantas/tickit-sync) server
- Auto-sync on interval (configurable, default 5 min)
- Foreground sync when app becomes active
- Sync after mutations (500ms debounce)
- Tokens stored in expo-secure-store

## Critical Constraints

### DO NOT

1. **Use Pressable style callbacks with dynamic colors** - causes CSS errors on web:
   ```typescript
   // ❌ WRONG - breaks on web
   <Pressable style={({ pressed }) => ({ backgroundColor: pressed ? colors.hover : colors.bg })}>
   
   // ✅ CORRECT - use static styles
   <Pressable style={[styles.button, { backgroundColor: colors.bg }]}>
   ```

2. **Upgrade react-native-screens beyond ~4.16.0** - versions 4.17+ have a boolean/string type error with Expo SDK 54.

3. **Use `uuid` package** - requires polyfill. Use `expo-crypto.randomUUID()` instead.

4. **Add custom SafeAreaView padding/height** - let React Navigation handle safe areas via `ScreenWrapper` component.

5. **Use markdown tables in Discord/WhatsApp outputs** - use bullet lists instead.

### Platform Differences

| Feature | iOS/Android | Web |
|---------|-------------|-----|
| Database | SQLite (persistent) | In-memory (session only) |
| Secure Storage | Keychain/EncryptedPrefs | localStorage |
| Notifications | Native push | Not supported |
| Safe Areas | Native handling | CSS fallback |

## Common Tasks

### Adding a New Screen

1. Create file in `src/app/` (e.g., `src/app/myscreen.tsx`)
2. Export default React component
3. Add to Stack in `src/app/_layout.tsx` if needed:
   ```typescript
   <Stack.Screen name="myscreen" options={{ animation: 'slide_from_right' }} />
   ```

### Adding a New Theme

Edit `src/theme/index.ts`:
```typescript
export const themes: Record<ThemeName, Theme> = {
  // ... existing themes
  'my-theme': {
    name: 'My Theme',
    colors: {
      background: '#1a1a2e',
      foreground: '#eaeaea',
      // ... all color properties
    },
  },
};
```

### Adding Store Actions

Edit `src/store/index.ts`:
```typescript
interface AppState {
  // ... add new state/action types
  myAction: (param: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // ... add implementation
  myAction: async (param) => {
    // Update database
    await db.doSomething(param);
    // Update store
    await get().refreshData();
    // Trigger sync
    get().syncAfterChange();
  },
}));
```

## Testing

```bash
# Start dev server
pnpm start

# Run on specific platform
pnpm ios      # iOS simulator (macOS only)
pnpm android  # Android emulator
pnpm web      # Web browser

# Lint
pnpm lint
```

## Related Projects

- **[tickit](https://github.com/ricardodantas/tickit)** - Terminal TUI (Rust)
- **[tickit-sync](https://github.com/ricardodantas/tickit-sync)** - Sync server (Rust)

## Files to Check First

When debugging issues:
1. `src/store/index.ts` - State management and actions
2. `src/services/database.ts` - Data persistence
3. `src/services/sync.ts` - Sync logic
4. `src/theme/ThemeContext.tsx` - Theming issues
5. `src/app/_layout.tsx` - Navigation/routing issues
