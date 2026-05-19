import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import AnimatedPressable from './AnimatedPressable';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E5C76B';
const CARD_BG = '#1A1A1A';

// ─── Variant 1: Locked Feature Card ──────────────────────────────────
export const LockedFeatureCard = ({ title, subtitle, onPress }) => (
  <AnimatedPressable onPress={onPress}>
    <View style={lockedStyles.card}>
      <View style={lockedStyles.iconWrap}>
        <Ionicons name="lock-closed" size={18} color={GOLD} />
      </View>
      <View style={lockedStyles.textWrap}>
        <Text style={lockedStyles.title} numberOfLines={1}>
          {title || 'Unlock Feature'}
        </Text>
        <Text style={lockedStyles.subtitle} numberOfLines={1}>
          {subtitle || 'Get PRO for full access'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={GOLD} />
    </View>
  </AnimatedPressable>
);

const lockedStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: GOLD + '50',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GOLD + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary || '#999',
    fontWeight: '500',
  },
});

// ─── Variant 2: Upgrade Banner ───────────────────────────────────────
export const UpgradeBanner = ({ message, compact, onPress }) => (
  <AnimatedPressable onPress={onPress}>
    <View style={[bannerStyles.container, compact && bannerStyles.containerCompact]}>
      <View style={bannerStyles.goldEdge} />
      <View style={bannerStyles.content}>
        <View style={bannerStyles.iconWrap}>
          <Ionicons name="diamond" size={compact ? 12 : 14} color={GOLD} />
        </View>
        <Text
          style={[bannerStyles.text, compact && bannerStyles.textCompact]}
          numberOfLines={compact ? 1 : 2}
        >
          {message || 'Upgrade to PRO'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={GOLD} />
      </View>
    </View>
  </AnimatedPressable>
);

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GOLD + '30',
  },
  containerCompact: {
    borderRadius: 10,
  },
  goldEdge: {
    width: 4,
    backgroundColor: GOLD,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: GOLD + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: GOLD_LIGHT,
    lineHeight: 18,
  },
  textCompact: {
    fontSize: 12,
  },
});

// ─── Variant 3: Blurred Content Overlay ──────────────────────────────
export const BlurredContent = ({ children, locked, message, onPress }) => {
  if (!locked) return children;

  return (
    <View style={blurStyles.wrapper}>
      <View style={blurStyles.childrenWrap}>
        {children}
      </View>
      <AnimatedPressable onPress={onPress} style={blurStyles.overlay}>
        <View style={blurStyles.overlayInner}>
          <View style={blurStyles.lockCircle}>
            <Ionicons name="lock-closed" size={20} color={GOLD} />
          </View>
          <Text style={blurStyles.overlayText}>
            {message || 'Tap to unlock with PRO'}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
};

const blurStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
  },
  childrenWrap: {
    opacity: 0.25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  overlayInner: {
    alignItems: 'center',
    gap: 8,
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD + '18',
    borderWidth: 1,
    borderColor: GOLD + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD_LIGHT,
    textAlign: 'center',
  },
});

// ─── Combined Default Export ─────────────────────────────────────────
const ProUpsell = {
  LockedFeatureCard,
  UpgradeBanner,
  BlurredContent,
};

export default ProUpsell;
