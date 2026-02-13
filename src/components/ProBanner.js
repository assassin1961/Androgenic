import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { isPro, isTrialActive, getTrialDaysLeft, getScansRemaining } from '../utils/pro';

const ProBanner = ({ onUpgrade }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  if (isPro() && !isTrialActive()) return null;

  if (isTrialActive()) {
    const daysLeft = getTrialDaysLeft();
    return (
      <TouchableOpacity onPress={onUpgrade} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={GRADIENTS.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trialBanner}
          >
            <View style={styles.trialIconBg}>
              <Ionicons name="time" size={14} color="#000" />
            </View>
            <Text style={styles.trialText}>
              Trial: {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </Text>
            <View style={styles.upgradeChip}>
              <Text style={styles.upgradeChipText}>Upgrade</Text>
            </View>
            {/* Shimmer */}
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  const scansLeft = getScansRemaining();
  return (
    <View>
      <TouchableOpacity onPress={onUpgrade} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.banner, SHADOWS.accentGlow]}
          >
            <Ionicons name="diamond" size={16} color="#fff" />
            <Text style={styles.bannerText}>Unlock All Features</Text>
            <View style={styles.arrowChip}>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </View>
            {/* Shimmer */}
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.scansCounter}>
        <View style={styles.scansDots}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={[styles.scanDot, i < scansLeft && styles.scanDotActive]} />
          ))}
        </View>
        <Text style={styles.scansText}>
          {scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining today
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 8,
    gap: 8,
    overflow: 'hidden',
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  arrowChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 8,
    overflow: 'hidden',
  },
  trialIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  upgradeChip: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upgradeChipText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 11,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ skewX: '-20deg' }],
  },
  scansCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 8,
  },
  scansDots: {
    flexDirection: 'row',
    gap: 4,
  },
  scanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  scanDotActive: {
    backgroundColor: COLORS.accent,
  },
  scansText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});

export default ProBanner;
