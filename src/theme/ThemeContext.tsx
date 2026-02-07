// Theme context for dynamic theme switching

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, defaultTheme, getColors, setThemeColors, Theme, ThemePalette } from './index';

const THEME_STORAGE_KEY = 'tickit_theme';

interface ThemeContextValue {
  theme: Theme;
  colors: ReturnType<typeof getColors>;
  setTheme: (themeName: string) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const colors = getColors(theme.palette);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Update global colors when theme changes
  useEffect(() => {
    setThemeColors(theme.palette);
  }, [theme]);

  const loadSavedTheme = async () => {
    try {
      const savedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeName && themes[savedThemeName]) {
        setThemeState(themes[savedThemeName]);
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    }
  };

  const setTheme = async (themeName: string) => {
    const newTheme = themes[themeName];
    if (newTheme) {
      setThemeState(newTheme);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
      } catch (e) {
        console.error('Failed to save theme:', e);
      }
    }
  };

  // Determine if theme is dark based on background luminance
  const isDark = isColorDark(theme.palette.background);

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper to determine if a color is dark
function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
