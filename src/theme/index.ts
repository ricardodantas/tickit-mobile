// Theme system matching ratatui-themes from the desktop app

export interface ThemePalette {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  foreground: string;
  comment: string;
  cyan: string;
  green: string;
  orange: string;
  pink: string;
  purple: string;
  red: string;
  yellow: string;
}

export interface Theme {
  name: string;
  displayName: string;
  palette: ThemePalette;
}

// All themes matching ratatui-themes
export const themes: Record<string, Theme> = {
  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    palette: {
      background: '#282a36',
      backgroundSecondary: '#1e1f29',
      backgroundTertiary: '#44475a',
      foreground: '#f8f8f2',
      comment: '#6272a4',
      cyan: '#8be9fd',
      green: '#50fa7b',
      orange: '#ffb86c',
      pink: '#ff79c6',
      purple: '#bd93f9',
      red: '#ff5555',
      yellow: '#f1fa8c',
    },
  },
  nord: {
    name: 'nord',
    displayName: 'Nord',
    palette: {
      background: '#2e3440',
      backgroundSecondary: '#242933',
      backgroundTertiary: '#3b4252',
      foreground: '#eceff4',
      comment: '#4c566a',
      cyan: '#88c0d0',
      green: '#a3be8c',
      orange: '#d08770',
      pink: '#b48ead',
      purple: '#b48ead',
      red: '#bf616a',
      yellow: '#ebcb8b',
    },
  },
  tokyoNight: {
    name: 'tokyoNight',
    displayName: 'Tokyo Night',
    palette: {
      background: '#1a1b26',
      backgroundSecondary: '#13141c',
      backgroundTertiary: '#24283b',
      foreground: '#c0caf5',
      comment: '#565f89',
      cyan: '#7dcfff',
      green: '#9ece6a',
      orange: '#ff9e64',
      pink: '#ff007c',
      purple: '#bb9af7',
      red: '#f7768e',
      yellow: '#e0af68',
    },
  },
  catppuccinMocha: {
    name: 'catppuccinMocha',
    displayName: 'Catppuccin Mocha',
    palette: {
      background: '#1e1e2e',
      backgroundSecondary: '#181825',
      backgroundTertiary: '#313244',
      foreground: '#cdd6f4',
      comment: '#6c7086',
      cyan: '#89dceb',
      green: '#a6e3a1',
      orange: '#fab387',
      pink: '#f5c2e7',
      purple: '#cba6f7',
      red: '#f38ba8',
      yellow: '#f9e2af',
    },
  },
  catppuccinLatte: {
    name: 'catppuccinLatte',
    displayName: 'Catppuccin Latte',
    palette: {
      background: '#eff1f5',
      backgroundSecondary: '#e6e9ef',
      backgroundTertiary: '#ccd0da',
      foreground: '#4c4f69',
      comment: '#9ca0b0',
      cyan: '#04a5e5',
      green: '#40a02b',
      orange: '#fe640b',
      pink: '#ea76cb',
      purple: '#8839ef',
      red: '#d20f39',
      yellow: '#df8e1d',
    },
  },
  gruvboxDark: {
    name: 'gruvboxDark',
    displayName: 'Gruvbox Dark',
    palette: {
      background: '#282828',
      backgroundSecondary: '#1d2021',
      backgroundTertiary: '#3c3836',
      foreground: '#ebdbb2',
      comment: '#928374',
      cyan: '#83a598',
      green: '#b8bb26',
      orange: '#fe8019',
      pink: '#d3869b',
      purple: '#d3869b',
      red: '#fb4934',
      yellow: '#fabd2f',
    },
  },
  gruvboxLight: {
    name: 'gruvboxLight',
    displayName: 'Gruvbox Light',
    palette: {
      background: '#fbf1c7',
      backgroundSecondary: '#f2e5bc',
      backgroundTertiary: '#ebdbb2',
      foreground: '#3c3836',
      comment: '#928374',
      cyan: '#427b58',
      green: '#79740e',
      orange: '#af3a03',
      pink: '#b16286',
      purple: '#8f3f71',
      red: '#9d0006',
      yellow: '#b57614',
    },
  },
  oneDark: {
    name: 'oneDark',
    displayName: 'One Dark',
    palette: {
      background: '#282c34',
      backgroundSecondary: '#21252b',
      backgroundTertiary: '#2c313a',
      foreground: '#abb2bf',
      comment: '#5c6370',
      cyan: '#56b6c2',
      green: '#98c379',
      orange: '#d19a66',
      pink: '#c678dd',
      purple: '#c678dd',
      red: '#e06c75',
      yellow: '#e5c07b',
    },
  },
  solarizedDark: {
    name: 'solarizedDark',
    displayName: 'Solarized Dark',
    palette: {
      background: '#002b36',
      backgroundSecondary: '#00212b',
      backgroundTertiary: '#073642',
      foreground: '#839496',
      comment: '#586e75',
      cyan: '#2aa198',
      green: '#859900',
      orange: '#cb4b16',
      pink: '#d33682',
      purple: '#6c71c4',
      red: '#dc322f',
      yellow: '#b58900',
    },
  },
  solarizedLight: {
    name: 'solarizedLight',
    displayName: 'Solarized Light',
    palette: {
      background: '#fdf6e3',
      backgroundSecondary: '#eee8d5',
      backgroundTertiary: '#eee8d5',
      foreground: '#657b83',
      comment: '#93a1a1',
      cyan: '#2aa198',
      green: '#859900',
      orange: '#cb4b16',
      pink: '#d33682',
      purple: '#6c71c4',
      red: '#dc322f',
      yellow: '#b58900',
    },
  },
  rosePine: {
    name: 'rosePine',
    displayName: 'Rosé Pine',
    palette: {
      background: '#191724',
      backgroundSecondary: '#1f1d2e',
      backgroundTertiary: '#26233a',
      foreground: '#e0def4',
      comment: '#6e6a86',
      cyan: '#9ccfd8',
      green: '#31748f',
      orange: '#ebbcba',
      pink: '#eb6f92',
      purple: '#c4a7e7',
      red: '#eb6f92',
      yellow: '#f6c177',
    },
  },
  rosePineDawn: {
    name: 'rosePineDawn',
    displayName: 'Rosé Pine Dawn',
    palette: {
      background: '#faf4ed',
      backgroundSecondary: '#fffaf3',
      backgroundTertiary: '#f2e9e1',
      foreground: '#575279',
      comment: '#9893a5',
      cyan: '#56949f',
      green: '#286983',
      orange: '#d7827e',
      pink: '#b4637a',
      purple: '#907aa9',
      red: '#b4637a',
      yellow: '#ea9d34',
    },
  },
  everforest: {
    name: 'everforest',
    displayName: 'Everforest',
    palette: {
      background: '#2d353b',
      backgroundSecondary: '#272e33',
      backgroundTertiary: '#343f44',
      foreground: '#d3c6aa',
      comment: '#859289',
      cyan: '#83c092',
      green: '#a7c080',
      orange: '#e69875',
      pink: '#d699b6',
      purple: '#d699b6',
      red: '#e67e80',
      yellow: '#dbbc7f',
    },
  },
  kanagawa: {
    name: 'kanagawa',
    displayName: 'Kanagawa',
    palette: {
      background: '#1f1f28',
      backgroundSecondary: '#16161d',
      backgroundTertiary: '#2a2a37',
      foreground: '#dcd7ba',
      comment: '#727169',
      cyan: '#7fb4ca',
      green: '#98bb6c',
      orange: '#ffa066',
      pink: '#d27e99',
      purple: '#957fb8',
      red: '#c34043',
      yellow: '#c0a36e',
    },
  },
  monokai: {
    name: 'monokai',
    displayName: 'Monokai',
    palette: {
      background: '#272822',
      backgroundSecondary: '#1e1f1c',
      backgroundTertiary: '#3e3d32',
      foreground: '#f8f8f2',
      comment: '#75715e',
      cyan: '#66d9ef',
      green: '#a6e22e',
      orange: '#fd971f',
      pink: '#f92672',
      purple: '#ae81ff',
      red: '#f92672',
      yellow: '#e6db74',
    },
  },
};

// Theme list for picker
export const themeList = Object.values(themes);

// Get derived colors from palette
export function getColors(palette: ThemePalette) {
  return {
    ...palette,
    // Semantic colors
    primary: palette.purple,
    success: palette.green,
    warning: palette.orange,
    error: palette.red,
    info: palette.cyan,
    // Priority colors
    priorityLow: palette.comment,
    priorityMedium: palette.cyan,
    priorityHigh: palette.orange,
    priorityUrgent: palette.red,
  };
}

// Default theme
export const defaultTheme = themes.dracula;

// Export current colors (will be updated by ThemeProvider)
export let colors = getColors(defaultTheme.palette);

// Update the exported colors
export function setThemeColors(palette: ThemePalette) {
  colors = getColors(palette);
}

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

export type ThemeColors = ReturnType<typeof getColors>;
