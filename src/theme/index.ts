// Dracula theme colors matching the desktop app

export const colors = {
  // Dracula palette
  background: '#282a36',
  backgroundSecondary: '#1e1f29',
  backgroundTertiary: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  
  // Accent colors
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
  
  // Semantic colors
  primary: '#bd93f9',
  success: '#50fa7b',
  warning: '#ffb86c',
  error: '#ff5555',
  info: '#8be9fd',
  
  // Priority colors
  priorityLow: '#6272a4',
  priorityMedium: '#8be9fd',
  priorityHigh: '#ffb86c',
  priorityUrgent: '#ff5555',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export type ThemeColors = typeof colors;
