import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, getScoreColor, getScoreLabel, getScoreGradient } from '../utils/theme';

const ScoreCard = ({ category, label, score, icon, locked, onPress, index = 0 }) => {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const gradient = getScoreGradient(score);
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay((index || 0) * 80),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    if (!locked) {
      Animated.sequence([
        Animated.delay(400 + (index || 0) * 80),
        Animated.timing(barAnim, { toValue: score / 100, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    }
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, locked && styles.locked]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {locked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={18} color={COLORS.gold} />
            </View>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}
        <View style={[styles.content, locked && styles.blurred]}>
          {/* Top accent line */}
          {!locked && (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentLine}
            />
          )}
          <View style={styles.header}>
            <View style={[styles.iconBg, { backgroundColor: (locked ? COLORS.textMuted : color) + '15' }]}>
              <Ionicons name={icon} size={16} color={locked ? COLORS.textMuted : color} />
            </View>
            <Text style={[styles.label, locked && styles.mutedText]}>{label}</Text>
          </View>
          <Text style={[styles.score, { color: locked ? COLORS.textMuted : color }]}>
            {locked ? '??' : score}
          </Text>
          <View style={styles.barContainer}>
            {locked ? (
              <View style={[styles.barStatic, { width: '50%', backgroundColor: COLORS.textMuted }]} />
            ) : (
              <Animated.View style={[styles.barStatic, { width: barWidth, backgroundColor: color }]} />
            )}
          </View>
          <Text style={[styles.levelLabel, { color: locked ? COLORS.textMuted : color }]}>
            {locked ? 'Locked' : scoreLabel}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '47%',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  locked: {
    borderColor: COLORS.goldDark + '40',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,5,10,0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  proText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    zIndex: 1,
  },
  blurred: {
    opacity: 0.3,
  },
  accentLine: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  mutedText: {
    color: COLORS.textMuted,
  },
  score: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -1,
  },
  barContainer: {
    height: 5,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barStatic: {
    height: '100%',
    borderRadius: 3,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default ScoreCard;
