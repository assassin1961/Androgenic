import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, BLUR, RADIUS } from '../utils/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 12, stiffness: 200, mass: 0.5 };

/**
 * GlassButton — translucent CTA with spring scale + haptic.
 * Variants:
 *   - primary (gradient fill)
 *   - secondary (glass)
 *   - ghost (transparent border)
 *   - gold (premium gold gradient)
 */
const GlassButton = memo(({
  title,
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  disabled = false,
  loading = false,
  fullWidth = true,
  haptic = true,
  iconRight = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value * (disabled ? 0.5 : 1),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRING);
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING);
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;
  const iconSize = ICON_SIZES[size] || ICON_SIZES.md;

  // ─── Primary (gradient) ─────────────────────────────────────────
  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, sizeStyle.container]}
        >
          {icon && !iconRight && <Ionicons name={icon} size={iconSize} color="#fff" />}
          <Text style={[styles.text, sizeStyle.text, { color: '#fff' }, textStyle]}>{title}</Text>
          {icon && iconRight && <Ionicons name={icon} size={iconSize} color="#fff" />}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // ─── Gold ─────────────────────────────────────────────────────
  if (variant === 'gold') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={GRADIENTS.goldShine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, sizeStyle.container]}
        >
          {icon && !iconRight && <Ionicons name={icon} size={iconSize} color="#000" />}
          <Text style={[styles.text, sizeStyle.text, { color: '#000' }, textStyle]}>{title}</Text>
          {icon && iconRight && <Ionicons name={icon} size={iconSize} color="#000" />}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // ─── Secondary (glass blur) ────────────────────────────────────
  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth, style]}
      >
        <View style={[styles.container, styles.glass, sizeStyle.container]}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={BLUR.medium} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.glassRow}>
            {icon && !iconRight && <Ionicons name={icon} size={iconSize} color={COLORS.accent} />}
            <Text style={[styles.text, sizeStyle.text, { color: COLORS.accent }, textStyle]}>{title}</Text>
            {icon && iconRight && <Ionicons name={icon} size={iconSize} color={COLORS.accent} />}
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  // ─── Ghost ─────────────────────────────────────────────────────
  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[animatedStyle, fullWidth && styles.fullWidth, style]}
    >
      <View style={[styles.container, styles.ghost, sizeStyle.container]}>
        {icon && !iconRight && <Ionicons name={icon} size={iconSize} color={COLORS.textPrimary} />}
        <Text style={[styles.text, sizeStyle.text, { color: COLORS.textPrimary }, textStyle]}>{title}</Text>
        {icon && iconRight && <Ionicons name={icon} size={iconSize} color={COLORS.textPrimary} />}
      </View>
    </AnimatedPressable>
  );
});

const SIZE_STYLES = {
  sm: {
    container: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: RADIUS.sm },
    text: { fontSize: 13, fontWeight: '700' },
  },
  md: {
    container: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: RADIUS.md },
    text: { fontSize: 15, fontWeight: '700' },
  },
  lg: {
    container: { paddingVertical: 17, paddingHorizontal: 24, borderRadius: RADIUS.md },
    text: { fontSize: 16, fontWeight: '800' },
  },
};

const ICON_SIZES = { sm: 16, md: 18, lg: 20 };

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  glassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  text: {
    letterSpacing: 0.3,
  },
});

export default GlassButton;
