import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BLUR } from '../utils/theme';
import AnimatedPressable from './AnimatedPressable';

/**
 * GlassHeader — translucent screen header with optional left/right actions.
 * Sits over content with native blur for a premium feel.
 */
const GlassHeader = memo(({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRight,
  rightLabel,
  hideBack = false,
  intensity = BLUR.medium,
  transparent = false,
}) => {
  return (
    <View style={[styles.wrapper, transparent && styles.transparent]}>
      {!transparent && Platform.OS !== 'web' && (
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.row}>
        <View style={styles.side}>
          {!hideBack && onBack && (
            <AnimatedPressable
              onPress={onBack}
              style={styles.iconBtn}
              scaleDown={0.9}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
          )}
        </View>
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <View style={styles.side}>
          {rightIcon && (
            <AnimatedPressable onPress={onRight} style={styles.iconBtn} scaleDown={0.9}>
              <Ionicons name={rightIcon} size={20} color={COLORS.accent} />
            </AnimatedPressable>
          )}
          {rightLabel && (
            <AnimatedPressable onPress={onRight} style={styles.labelBtn}>
              <Text style={styles.labelText}>{rightLabel}</Text>
            </AnimatedPressable>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  side: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
});

export default GlassHeader;
