// Design System - Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary/Accent Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Accent color
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
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
  
  // Neutral Colors
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Special Colors
  white: '#ffffff',
  black: '#000000',
  
  // Gradient Colors
  gradients: {
    primary: ['#0ea5e9', '#0284c7'],
    secondary: ['#d946ef', '#c026d3'],
    success: ['#22c55e', '#16a34a'],
    sunset: ['#f59e0b', '#ef4444'],
    ocean: ['#0ea5e9', '#22c55e'],
    purple: ['#8b5cf6', '#d946ef'],
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
