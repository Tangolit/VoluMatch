// Beautiful reusable button component with gradient support
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from './LazyIonicons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, borderRadius, shadows } from '../styles/spacing';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left', // left, right
  gradient = null,
  style = {},
  textStyle = {},
  fullWidth = false,
}) => {
  const getButtonStyles = () => {
    const baseStyle = [styles.button];
    
    // Size variants
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    }
    
    // Width
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    // Variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineButton);
    } else if (variant === 'ghost') {
      baseStyle.push(styles.ghostButton);
    }
    
    // Disabled state
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyles = () => {
    const baseStyle = [styles.buttonText];
    
    // Size variants
    if (size === 'small') {
      baseStyle.push(styles.textSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.textLarge);
    }
    
    // Variant text colors
    if (variant === 'primary' || gradient) {
      baseStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    } else if (variant === 'ghost') {
      baseStyle.push(styles.ghostText);
    }
    
    return [...baseStyle, textStyle];
  };

  const renderContent = () => {
    const iconElement = icon && (
      <Ionicons 
        name={icon} 
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
        color={variant === 'primary' || gradient ? colors.white : colors.primary[600]}
        style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
      />
    );

    return (
      <>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || gradient ? colors.white : colors.primary[600]}
            style={styles.loader}
          />
        )}
        {!loading && iconPosition === 'left' && iconElement}
        <Text style={getTextStyles()}>{title}</Text>
        {!loading && iconPosition === 'right' && iconElement}
      </>
    );
  };

  if (gradient && !disabled) {
    return (
      <TouchableOpacity 
        style={getButtonStyles()}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  buttonSmall: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  buttonLarge: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: colors.secondary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  
  // Gradient button
  gradientButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  
  // Text styles
  buttonText: {
    ...typography.styles.button,
    textAlign: 'center',
  },
  textSmall: {
    ...typography.styles.buttonSmall,
  },
  textLarge: {
    fontSize: typography.sizes.lg,
  },
  
  // Text colors
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary[600],
  },
  ghostText: {
    color: colors.primary[600],
  },
  
  // Icon styles
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  loader: {
    marginRight: spacing.sm,
  },
  
  // State styles
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
