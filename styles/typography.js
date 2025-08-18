// Design System - Typography
export const typography = {
  // Font Families
  fonts: {
    regular: 'System', // iOS: San Francisco, Android: Roboto
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Text Styles
  styles: {
    // Headlines
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.35,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.45,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
    },
    
    // Body Text
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    
    // Special Styles
    subtitle1: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 1.5,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    
    // Button Text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1,
      letterSpacing: 0.25,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1,
      letterSpacing: 0.25,
    },
  }
};
