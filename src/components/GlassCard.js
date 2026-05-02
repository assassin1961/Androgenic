import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, BLUR, RADIUS } from '../utils/theme';

/**
 * GlassCard — premium glassmorphism container.
 *
 * Stacks: BlurView (native blur) → LinearGradient (subtle shine)
 *       → tinted overlay (border + bg) → children.
 *
 * On Android, BlurView is supported via expo-blur (uses experimental blur
 * on older OS versions). We fall back to a darker bg tint for older devices.
 */
const GlassCard = memo(({
  children,
  style,
  intensity = BLUR.medium,
  tint = 'dark',
  variant = 'default',
  glow = false,
  borderRadius = RADIUS.md,
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: styles.default,
    light: styles.light,
    heavy: styles.heavy,
    accent: styles.accent,
    gold: styles.gold,
    premium: styles.premium,
  }[variant];

  const shineGradient = {
    default: GRADIENTS.glass,
    light: GRADIENTS.glass,
    heavy: GRADIENTS.glassDark,
    accent: GRADIENTS.glassAccent,
    gold: GRADIENTS.glassGold,
    premium: GRADIENTS.glassPremium,
  }[variant];

  return (
    <View
      style={[
        styles.container,
        variantStyles,
        glow && styles.glow,
        { borderRadius },
        style,
      ]}
      {...props}
    >
      {/* Native blur layer */}
      {Platform.OS !== 'web' && (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      )}

      {/* Subtle gradient shine for premium look */}
      <LinearGradient
        colors={shineGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  default: {
    backgroundColor: COLORS.bgGlass,
    borderColor: COLORS.borderLight,
  },
  light: {
    backgroundColor: COLORS.bgGlassLight,
    borderColor: COLORS.borderLight,
  },
  heavy: {
    backgroundColor: COLORS.bgGlassHeavy,
    borderColor: COLORS.borderLight,
  },
  accent: {
    backgroundColor: COLORS.bgGlassAccent,
    borderColor: COLORS.borderAccent,
  },
  gold: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderColor: 'rgba(255,215,0,0.30)',
  },
  premium: {
    backgroundColor: 'rgba(20,20,40,0.55)',
    borderColor: COLORS.borderAccent,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard;
