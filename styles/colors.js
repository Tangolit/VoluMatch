// Design System - Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f6f7fb',
    100: '#e5e7f5',
    200: '#c9cbe5',
    300: '#a6a9cf',
    400: '#8184b4',
    500: '#1c1f49', // Volumatch brand navy
    600: '#11143b',
    700: '#0f1235',
    800: '#0b0e2a',
    900: '#07081f',
  },
  
  // Secondary/Accent Colors
  secondary: {
    50: '#fff8f0',
    100: '#fdecd9',
    200: '#f8d5b0',
    300: '#ecb981',
    400: '#dfa163',
    500: '#c58a45', // Warm gold accent
    600: '#a96f34',
    700: '#885427',
    800: '#6a3e20',
    900: '#4f2c18',
  },
  
  // Success Colors (for volunteer actions)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Orange Colors (for pending/warning states)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Red Colors (alias for error colors)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral Colors
  gray: {
    50: '#f7f7fb',
    100: '#e6e6f3',
    200: '#cfd0e5',
    300: '#b3b6d1',
    400: '#8f91b4',
    500: '#6b6d8f',
    600: '#4f5170',
    700: '#363754',
    800: '#23243a',
    900: '#121327',
  },
  
  // Special Colors
  white: '#ffffff',
  black: '#000000',
  
  // Gradient Colors
  gradients: {
    primary: ['#1c1f49', '#11143b'],
    secondary: ['#c58a45', '#a96f34'],
    success: ['#22c55e', '#16a34a'],
    sunset: ['#f59e0b', '#c58a45'],
    ocean: ['#1c1f49', '#22c55e'],
    purple: ['#7c6ad9', '#c58a45'],
  }
};

// Add text and background directly to colors object for easier access
colors.text = {
  primary: colors.gray[900],
  secondary: colors.gray[600],
  tertiary: colors.gray[400],
  inverse: colors.white,
};

colors.background = colors.gray[50];
colors.surface = colors.white;

colors.border = {
  light: colors.gray[200],
  medium: colors.gray[300],
  strong: colors.gray[400],
};

// Semantic Color Mappings
export const semanticColors = {
  background: colors.gray[50],
  surface: colors.white,
  surfaceSecondary: colors.gray[100],
  
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[400],
    inverse: colors.white,
  },
  
  border: {
    light: colors.gray[200],
    medium: colors.gray[300],
    strong: colors.gray[400],
  },
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.15)',
  }
};
