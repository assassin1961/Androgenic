import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Modal, TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn, FadeIn,
  useSharedValue, useAnimatedStyle, useAnimatedProps,
  withTiming, withSpring, withRepeat, withSequence, withDelay,
  Easing, runOnJS, cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassHeader from '../components/GlassHeader';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../utils/theme';

const { width, height } = Dimensions.get('window');
const STATS_KEY = 'androgenic_skincare_routine_stats';
const STREAK_KEY = 'androgenic_skincare_streak';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Timer Ring Constants ─────────────────────────────────────────
const RING_SIZE = 220;
const STROKE_WIDTH = 10;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Morning Routine Steps ────────────────────────────────────────
const MORNING_STEPS = [
  {
    name: 'Cleanser',
    duration: 60,
    instructions: [
      'Apply gentle cleanser to damp face',
      'Massage in circular motions for 60 seconds',
      'Rinse with lukewarm water',
    ],
    productType: 'Gel or foam cleanser',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe Foaming Cleanser', price: '$10-15' },
      { tier: 'Mid-range', name: 'La Roche-Posay Toleriane', price: '$15-20' },
      { tier: 'Premium', name: 'SkinCeuticals Gentle Cleanser', price: '$35-40' },
    ],
  },
  {
    name: 'Toner',
    duration: 30,
    instructions: [
      'Apply toner with cotton pad or palms',
      'Pat gently, don\'t rub',
    ],
    productType: 'Hydrating toner (no alcohol)',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'Thayers Witch Hazel Toner', price: '$8-12' },
      { tier: 'Mid-range', name: 'Paula\'s Choice Pore-Reducing Toner', price: '$21-25' },
      { tier: 'Premium', name: 'SK-II Facial Treatment Essence', price: '$95-100' },
    ],
  },
  {
    name: 'Vitamin C Serum',
    duration: 30,
    instructions: [
      'Apply 3-4 drops to face and neck',
      'Pat until absorbed',
    ],
    productType: 'L-Ascorbic Acid 10-20%',
    note: 'Morning only — photosensitizing',
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'TruSkin Vitamin C Serum', price: '$15-20' },
      { tier: 'Mid-range', name: 'Timeless 20% Vitamin C+E', price: '$25-28' },
      { tier: 'Premium', name: 'SkinCeuticals C E Ferulic', price: '$166-180' },
    ],
  },
  {
    name: 'Hyaluronic Acid',
    duration: 30,
    instructions: [
      'Apply to slightly damp skin',
      '2-3 drops, pat in',
    ],
    productType: 'HA serum',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'The Ordinary Hyaluronic Acid 2%', price: '$7-10' },
      { tier: 'Mid-range', name: 'Vichy Mineral 89', price: '$25-30' },
      { tier: 'Premium', name: 'SkinMedica HA5 Rejuvenating', price: '$178-200' },
    ],
  },
  {
    name: 'Eye Cream',
    duration: 20,
    instructions: [
      'Dab with ring finger around orbital bone',
      'Never pull or drag eye area',
    ],
    productType: 'Peptide eye cream',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe Eye Repair Cream', price: '$12-15' },
      { tier: 'Mid-range', name: 'Olay Eyes Retinol24 Eye Cream', price: '$28-32' },
      { tier: 'Premium', name: 'La Mer Eye Concentrate', price: '$230-260' },
    ],
  },
  {
    name: 'Moisturizer',
    duration: 30,
    instructions: [
      'Apply to face and neck',
      'Use upward strokes',
    ],
    productType: 'Lightweight for AM',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe AM Moisturizing Lotion', price: '$12-16' },
      { tier: 'Mid-range', name: 'Neutrogena Hydro Boost Gel', price: '$18-22' },
      { tier: 'Premium', name: 'Tatcha Water Cream', price: '$68-72' },
    ],
  },
  {
    name: 'Sunscreen',
    duration: 60,
    instructions: [
      'Apply generously — 2 finger lengths',
      'Wait 15 min before sun exposure',
      'MOST IMPORTANT STEP',
    ],
    productType: 'SPF 50+ broad spectrum',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'Neutrogena Ultra Sheer SPF 55', price: '$10-14' },
      { tier: 'Mid-range', name: 'EltaMD UV Clear SPF 46', price: '$37-40' },
      { tier: 'Premium', name: 'Supergoop Unseen Sunscreen SPF 40', price: '$44-48' },
    ],
  },
  {
    name: 'Lip Balm',
    duration: 10,
    instructions: [
      'Apply SPF lip balm',
    ],
    productType: 'SPF lip balm',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'Sun Bum SPF 30 Lip Balm', price: '$4-6' },
      { tier: 'Mid-range', name: 'Fresh Sugar Lip Treatment SPF 15', price: '$24-28' },
      { tier: 'Premium', name: 'La Roche-Posay Cicaplast Lips', price: '$10-12' },
    ],
  },
];

// ─── Night Routine Steps ──────────────────────────────────────────
const NIGHT_STEPS = [
  {
    name: 'Oil Cleanser',
    duration: 60,
    instructions: [
      'Massage onto dry face to dissolve sunscreen/dirt',
      'Emulsify with water, rinse',
    ],
    productType: 'Cleansing oil or balm',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'DHC Deep Cleansing Oil', price: '$15-20' },
      { tier: 'Mid-range', name: 'Banila Co Clean It Zero', price: '$18-22' },
      { tier: 'Premium', name: 'Tatcha Camellia Cleansing Oil', price: '$48-52' },
    ],
  },
  {
    name: 'Water-Based Cleanser',
    duration: 60,
    instructions: [
      'Second cleanse for thorough clean',
      'Gentle circular motions',
    ],
    productType: 'Gel or cream cleanser',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe Hydrating Cleanser', price: '$10-15' },
      { tier: 'Mid-range', name: 'La Roche-Posay Toleriane', price: '$15-20' },
      { tier: 'Premium', name: 'Drunk Elephant Beste Jelly Cleanser', price: '$34-38' },
    ],
  },
  {
    name: 'Exfoliant',
    duration: 60,
    instructions: [
      'Apply chemical exfoliant',
      'Don\'t use with retinol on same night',
    ],
    productType: 'AHA/BHA (glycolic, salicylic)',
    note: null,
    badge: '2-3x/week',
    recommendations: [
      { tier: 'Budget', name: 'The Ordinary AHA 30% + BHA 2%', price: '$7-10' },
      { tier: 'Mid-range', name: 'Paula\'s Choice 2% BHA Liquid', price: '$30-34' },
      { tier: 'Premium', name: 'Drunk Elephant T.L.C. Framboos', price: '$90-95' },
    ],
  },
  {
    name: 'Toner',
    duration: 30,
    instructions: [
      'Apply toner with cotton pad or palms',
      'Pat gently, don\'t rub',
    ],
    productType: 'Hydrating toner (no alcohol)',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'Thayers Witch Hazel Toner', price: '$8-12' },
      { tier: 'Mid-range', name: 'Paula\'s Choice Pore-Reducing Toner', price: '$21-25' },
      { tier: 'Premium', name: 'SK-II Facial Treatment Essence', price: '$95-100' },
    ],
  },
  {
    name: 'Retinol / Retinoid',
    duration: 30,
    instructions: [
      'Apply pea-size amount',
      'Build up tolerance slowly',
      'Skip on exfoliant nights',
    ],
    productType: 'Retinol 0.3-1%',
    note: null,
    badge: 'Alternate nights',
    recommendations: [
      { tier: 'Budget', name: 'The Ordinary Retinol 0.5%', price: '$6-9' },
      { tier: 'Mid-range', name: 'CeraVe Resurfacing Retinol Serum', price: '$18-22' },
      { tier: 'Premium', name: 'SkinCeuticals Retinol 0.5', price: '$76-82' },
    ],
  },
  {
    name: 'Niacinamide',
    duration: 30,
    instructions: [
      'Apply after retinol has absorbed',
    ],
    productType: 'Niacinamide 5-10%',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'The Ordinary Niacinamide 10%', price: '$6-8' },
      { tier: 'Mid-range', name: 'Paula\'s Choice 10% Niacinamide', price: '$44-48' },
      { tier: 'Premium', name: 'SkinCeuticals Metacell Renewal B3', price: '$112-120' },
    ],
  },
  {
    name: 'Eye Cream',
    duration: 20,
    instructions: [
      'Dab with ring finger around orbital bone',
      'Never pull or drag eye area',
    ],
    productType: 'Peptide eye cream',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe Eye Repair Cream', price: '$12-15' },
      { tier: 'Mid-range', name: 'Olay Eyes Retinol24 Eye Cream', price: '$28-32' },
      { tier: 'Premium', name: 'La Mer Eye Concentrate', price: '$230-260' },
    ],
  },
  {
    name: 'Night Moisturizer',
    duration: 30,
    instructions: [
      'Richer than morning moisturizer',
    ],
    productType: 'Cream or sleeping mask',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'CeraVe Moisturizing Cream', price: '$14-18' },
      { tier: 'Mid-range', name: 'Laneige Water Sleeping Mask', price: '$28-32' },
      { tier: 'Premium', name: 'La Mer Creme de la Mer', price: '$190-210' },
    ],
  },
  {
    name: 'Lip Treatment',
    duration: 10,
    instructions: [
      'Apply overnight lip mask or heavy balm',
    ],
    productType: 'Overnight lip mask',
    note: null,
    badge: null,
    recommendations: [
      { tier: 'Budget', name: 'Aquaphor Lip Repair', price: '$4-6' },
      { tier: 'Mid-range', name: 'Laneige Lip Sleeping Mask', price: '$22-25' },
      { tier: 'Premium', name: 'By Terry Baume de Rose', price: '$60-65' },
    ],
  },
];

// ─── Weekly Schedule ──────────────────────────────────────────────
const WEEKLY_SCHEDULE = [
  { day: 'Mon', active: 'Retinol', color: COLORS.accent },
  { day: 'Tue', active: 'AHA', color: COLORS.green },
  { day: 'Wed', active: 'Retinol', color: COLORS.accent },
  { day: 'Thu', active: 'Rest', color: COLORS.textTertiary },
  { day: 'Fri', active: 'Retinol', color: COLORS.accent },
  { day: 'Sat', active: 'BHA', color: COLORS.blue },
  { day: 'Sun', active: 'Rest', color: COLORS.textTertiary },
];

// ─── Helpers ──────────────────────────────────────────────────────
const getTotalDuration = (steps) => {
  return steps.reduce((sum, step) => sum + step.duration, 0);
};

const formatDuration = (totalSec) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
};

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDayOfWeek = () => new Date().getDay(); // 0=Sun

// ─── Timer Ring Component ─────────────────────────────────────────
const TimerRing = memo(({ progress, color }) => {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={timerStyles.ringWrapper}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={COLORS.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
    </View>
  );
});

// ─── Gold Particle (completion effect) ────────────────────────────
const GoldParticle = memo(({ delay, startX, startY }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    const targetX = (Math.random() - 0.5) * width * 0.8;
    const targetY = -(Math.random() * height * 0.5 + 100);
    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay, withTiming(targetY, { duration: 2000, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(targetX, { duration: 2000, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay + 800, withTiming(0, { duration: 1200 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: startY,
    width: 6 + Math.random() * 6,
    height: 6 + Math.random() * 6,
    borderRadius: 4,
    backgroundColor: Math.random() > 0.5 ? COLORS.accent : COLORS.accentLight,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
});

// ─── Step Card Component ──────────────────────────────────────────
const StepCard = memo(({ step, index, expanded, onToggle }) => (
  <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
    <AnimatedPressable onPress={() => onToggle(index)}>
      <GlassCard style={styles.stepCard}>
        {/* Header row */}
        <View style={styles.stepRow}>
          <View style={styles.stepNumberCircle}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepInfo}>
            <View style={styles.stepNameRow}>
              <Text style={styles.stepName}>{step.name}</Text>
              {step.badge && (
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.stepProductType}>{step.productType}</Text>
          </View>
          <View style={styles.stepTimeBadge}>
            <Text style={styles.stepTimeText}>{step.duration}s</Text>
          </View>
        </View>

        {/* Expanded instructions */}
        {expanded && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.stepExpanded}>
            {step.instructions.map((instr, i) => (
              <View key={i} style={styles.instrRow}>
                <View style={styles.instrBullet} />
                <Text style={styles.instrText}>{instr}</Text>
              </View>
            ))}
            {step.note && (
              <View style={styles.noteRow}>
                <Ionicons name="warning-outline" size={13} color={COLORS.warning} />
                <Text style={styles.noteText}>{step.note}</Text>
              </View>
            )}

            {/* Product Recommendations */}
            <View style={styles.recsContainer}>
              <Text style={styles.recsTitle}>Product Recommendations</Text>
              {step.recommendations.map((rec, i) => (
                <View key={i} style={styles.recRow}>
                  <View style={[
                    styles.recTierBadge,
                    rec.tier === 'Budget' && { backgroundColor: COLORS.green + '18' },
                    rec.tier === 'Mid-range' && { backgroundColor: COLORS.blue + '18' },
                    rec.tier === 'Premium' && { backgroundColor: COLORS.accent + '18' },
                  ]}>
                    <Text style={[
                      styles.recTierText,
                      rec.tier === 'Budget' && { color: COLORS.green },
                      rec.tier === 'Mid-range' && { color: COLORS.blue },
                      rec.tier === 'Premium' && { color: COLORS.accent },
                    ]}>{rec.tier}</Text>
                  </View>
                  <View style={styles.recInfo}>
                    <Text style={styles.recName}>{rec.name}</Text>
                    <Text style={styles.recPrice}>{rec.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

// ─── Routine Timer Overlay ────────────────────────────────────────
const RoutineTimerOverlay = ({ steps, routineType, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const progress = useSharedValue(1);
  const intervalRef = useRef(null);

  const currentStep = steps[currentIndex];
  const totalSteps = steps.length;

  const startTimer = useCallback((step) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const target = step.duration;
    setTimeLeft(target);
    progress.value = 1;
    progress.value = withTiming(0, { duration: target * 1000, easing: Easing.linear });

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [progress]);

  // Initialize first step
  useEffect(() => {
    if (currentStep) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startTimer(currentStep);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Watch for timeLeft hitting 0
  useEffect(() => {
    if (timeLeft === 0 && !isComplete && intervalRef.current === null && currentStep) {
      if (currentIndex < totalSteps - 1) {
        // Move to next step
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        startTimer(steps[nextIdx]);
      } else if (currentIndex === totalSteps - 1) {
        // Routine complete
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsComplete(true);
        onComplete();
      }
    }
  }, [timeLeft, currentIndex, totalSteps, isComplete]);

  // Pause / resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      progress.value = withTiming(0, { duration: timeLeft * 1000, easing: Easing.linear });
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      cancelAnimation(progress);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isPaused, timeLeft, progress]);

  // Skip to next step
  const skipToNext = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentIndex < totalSteps - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsPaused(false);
      startTimer(steps[nextIdx]);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, totalSteps, steps, startTimer, onComplete]);

  // Mark current step done and move on
  const markDone = useCallback(() => {
    skipToNext();
  }, [skipToNext]);

  // ─── Completion Screen ──────────────────────────────────────────
  if (isComplete) {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 600,
      startX: width / 2 - 3,
      startY: height / 2,
    }));

    return (
      <View style={timerStyles.overlay}>
        <LinearGradient
          colors={['#000000', '#0A0A00', '#000000']}
          style={StyleSheet.absoluteFill}
        />
        {particles.map((p) => (
          <GoldParticle key={p.id} delay={p.delay} startX={p.startX} startY={p.startY} />
        ))}

        <Animated.View entering={ZoomIn.duration(500)} style={timerStyles.completeContainer}>
          <View style={timerStyles.completeIconWrap}>
            <Ionicons
              name={routineType === 'morning' ? 'sunny' : 'moon'}
              size={64}
              color={COLORS.accent}
            />
          </View>
          <Text style={timerStyles.completeTitle}>Routine Complete!</Text>
          <Text style={timerStyles.completeXP}>+30 XP</Text>
          <Text style={timerStyles.completeProgram}>
            {routineType === 'morning' ? 'Morning' : 'Night'} Skincare
          </Text>

          <View style={{ width: '80%', marginTop: 40 }}>
            <GlassButton
              title="Done"
              icon="checkmark-circle"
              variant="gold"
              size="lg"
              onPress={onClose}
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  // ─── Active Timer ───────────────────────────────────────────────
  const displayStep = steps[currentIndex];
  const timerColor = COLORS.scoreExcellent;

  return (
    <View style={timerStyles.overlay}>
      <LinearGradient
        colors={['#000000', '#050505', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={timerStyles.safeArea}>
        {/* Top bar */}
        <View style={timerStyles.topBar}>
          <AnimatedPressable onPress={onClose} style={timerStyles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={timerStyles.progressLabel}>
            Step {currentIndex + 1} / {totalSteps}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Progress dots */}
        <View style={timerStyles.dotsRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                timerStyles.dot,
                i < currentIndex && timerStyles.dotDone,
                i === currentIndex && timerStyles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={timerStyles.centerContent}>
          {/* Step name */}
          <Animated.View entering={FadeIn.duration(300)} key={currentIndex}>
            <Text style={timerStyles.exerciseName}>{displayStep?.name}</Text>
            {displayStep?.badge && (
              <View style={timerStyles.badgeRow}>
                <View style={timerStyles.timerBadge}>
                  <Ionicons name="calendar-outline" size={11} color={COLORS.accent} />
                  <Text style={timerStyles.timerBadgeText}>{displayStep.badge}</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Timer ring */}
          <View style={timerStyles.ringContainer}>
            <TimerRing progress={progress} color={timerColor} />
            <View style={timerStyles.ringCenter}>
              <Text style={[timerStyles.timeText, { color: timerColor }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={timerStyles.productTypeText}>{displayStep?.productType}</Text>
            </View>
          </View>

          {/* Instructions */}
          <Animated.View entering={FadeInDown.duration(300).delay(150)} style={timerStyles.instructionsList}>
            {displayStep?.instructions.map((instr, i) => (
              <Text key={i} style={timerStyles.instruction}>
                {instr}
              </Text>
            ))}
          </Animated.View>
        </View>

        {/* Bottom controls */}
        <View style={timerStyles.controls}>
          <AnimatedPressable onPress={togglePause} style={timerStyles.controlBtn}>
            <View style={timerStyles.controlBtnInner}>
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={28}
                color={COLORS.textPrimary}
              />
            </View>
            <Text style={timerStyles.controlLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={markDone} style={timerStyles.controlBtn}>
            <View style={[timerStyles.controlBtnInner, { backgroundColor: COLORS.green + '20', borderColor: COLORS.green + '40' }]}>
              <Ionicons name="checkmark" size={28} color={COLORS.green} />
            </View>
            <Text style={timerStyles.controlLabel}>Done</Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={skipToNext} style={timerStyles.controlBtn}>
            <View style={[timerStyles.controlBtnInner, { backgroundColor: COLORS.accent + '20', borderColor: COLORS.borderAccent }]}>
              <Ionicons name="play-forward" size={28} color={COLORS.accent} />
            </View>
            <Text style={timerStyles.controlLabel}>Skip</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

// ─── Streak Calendar Row ──────────────────────────────────────────
const StreakCalendar = memo(({ streakData }) => {
  // Show last 7 days
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = dayNames[d.getDay()];
    const dateNum = d.getDate();
    const completed = streakData[key] || false;
    const isToday = i === 0;
    days.push({ key, dayName, dateNum, completed, isToday });
  }

  return (
    <View style={styles.streakRow}>
      {days.map((day) => (
        <View key={day.key} style={styles.streakDayCol}>
          <Text style={[styles.streakDayName, day.isToday && styles.streakDayNameToday]}>
            {day.dayName}
          </Text>
          <View style={[
            styles.streakDot,
            day.completed && styles.streakDotDone,
            day.isToday && !day.completed && styles.streakDotToday,
          ]}>
            <Text style={[
              styles.streakDateNum,
              day.completed && styles.streakDateNumDone,
            ]}>
              {day.dateNum}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════
// ─── Main Screen ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const SkincareRoutineScreen = ({ navigation }) => {
  const [selectedRoutine, setSelectedRoutine] = useState('morning');
  const [expandedStep, setExpandedStep] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalCompleted: 0,
    consistencyPercent: 0,
  });
  const [streakData, setStreakData] = useState({});

  // Load saved stats
  useEffect(() => {
    loadStats();
    loadStreakData();
  }, []);

  const loadStats = async () => {
    try {
      const raw = await AsyncStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  };

  const loadStreakData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STREAK_KEY);
      if (raw) setStreakData(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  };

  const saveStats = async (newStats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (e) {
      // ignore
    }
  };

  const saveStreakData = async (newData) => {
    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      setStreakData(newData);
    } catch (e) {
      // ignore
    }
  };

  const computeStreak = (data) => {
    let streak = 0;
    const d = new Date();
    // Check from today backwards
    for (let i = 0; i < 365; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (data[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        // If today hasn't been logged yet, don't break, just skip today
        if (i === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const computeConsistency = (data) => {
    // Last 30 days
    let completed = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (data[key]) completed++;
      d.setDate(d.getDate() - 1);
    }
    return Math.round((completed / 30) * 100);
  };

  const handleRoutineComplete = useCallback(() => {
    const todayKey = getTodayKey();
    const newStreakData = { ...streakData, [todayKey]: true };
    saveStreakData(newStreakData);

    const newStreak = computeStreak(newStreakData);
    const consistency = computeConsistency(newStreakData);
    const newStats = {
      currentStreak: newStreak,
      totalCompleted: stats.totalCompleted + 1,
      consistencyPercent: consistency,
    };
    saveStats(newStats);
  }, [streakData, stats]);

  const handleCloseTimer = useCallback(() => {
    setShowTimer(false);
  }, []);

  const handleStartRoutine = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowTimer(true);
  }, []);

  const toggleStep = useCallback((index) => {
    setExpandedStep((prev) => (prev === index ? null : index));
  }, []);

  const steps = selectedRoutine === 'morning' ? MORNING_STEPS : NIGHT_STEPS;
  const totalDuration = getTotalDuration(steps);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GlassBackground />

      <SafeAreaView style={styles.safeArea}>
        <GlassHeader
          title="Skincare Routine"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Routine Toggle ───────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <View style={styles.toggleContainer}>
              <AnimatedPressable
                onPress={() => { setSelectedRoutine('morning'); setExpandedStep(null); }}
                style={[
                  styles.toggleBtn,
                  selectedRoutine === 'morning' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={18}
                  color={selectedRoutine === 'morning' ? COLORS.accent : COLORS.textTertiary}
                />
                <Text style={[
                  styles.toggleText,
                  selectedRoutine === 'morning' && styles.toggleTextActive,
                ]}>Morning</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => { setSelectedRoutine('night'); setExpandedStep(null); }}
                style={[
                  styles.toggleBtn,
                  selectedRoutine === 'night' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="moon"
                  size={18}
                  color={selectedRoutine === 'night' ? COLORS.accent : COLORS.textTertiary}
                />
                <Text style={[
                  styles.toggleText,
                  selectedRoutine === 'night' && styles.toggleTextActive,
                ]}>Night</Text>
              </AnimatedPressable>
            </View>
          </Animated.View>

          {/* ── Stats Bar ────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard variant="accent" style={styles.statsBar}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.statValue}>{stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-done-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="analytics-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.statValue}>{stats.consistencyPercent}%</Text>
                  <Text style={styles.statLabel}>Consistency</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* ── Streak Calendar ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <GlassCard style={styles.streakCard}>
              <StreakCalendar streakData={streakData} />
            </GlassCard>
          </Animated.View>

          {/* ── Routine Info Header ──────────────────────────── */}
          <View style={styles.routineHeader}>
            <Text style={styles.sectionTitle}>
              {selectedRoutine === 'morning' ? 'Morning Routine' : 'Night Routine'}
            </Text>
            <View style={styles.routineHeaderMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
              <Text style={styles.routineHeaderText}>{formatDuration(totalDuration)}</Text>
              <Text style={styles.routineHeaderDot}>{'·'}</Text>
              <Text style={styles.routineHeaderText}>{steps.length} steps</Text>
            </View>
          </View>

          {/* ── Steps List ───────────────────────────────────── */}
          {steps.map((step, index) => (
            <StepCard
              key={`${selectedRoutine}-${index}`}
              step={step}
              index={index}
              expanded={expandedStep === index}
              onToggle={toggleStep}
            />
          ))}

          {/* ── Start Button ─────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(steps.length * 60 + 200)}>
            <View style={styles.startButtonWrap}>
              <GlassButton
                title="Start Routine"
                icon="play-circle"
                variant="gold"
                size="lg"
                onPress={handleStartRoutine}
              />
            </View>
          </Animated.View>

          {/* ── Weekly Schedule ───────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(steps.length * 60 + 300)}>
            <Text style={styles.sectionTitle}>Weekly Actives Schedule</Text>
            <GlassCard style={styles.weeklyCard}>
              <Text style={styles.weeklySubtitle}>Nighttime active rotation</Text>
              {WEEKLY_SCHEDULE.map((item, i) => (
                <View key={i} style={styles.weeklyRow}>
                  <Text style={[styles.weeklyDay, getDayOfWeek() === (i === 6 ? 0 : i + 1) && styles.weeklyDayToday]}>
                    {item.day}
                  </Text>
                  <View style={styles.weeklyBarTrack}>
                    <View style={[
                      styles.weeklyBarFill,
                      { backgroundColor: item.color + '30', width: item.active === 'Rest' ? '30%' : '70%' },
                    ]} />
                  </View>
                  <View style={[styles.weeklyActiveBadge, { backgroundColor: item.color + '18' }]}>
                    <Text style={[styles.weeklyActiveText, { color: item.color }]}>
                      {item.active}
                    </Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Timer Modal ──────────────────────────────────────── */}
      <Modal
        visible={showTimer}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <RoutineTimerOverlay
          steps={steps}
          routineType={selectedRoutine}
          onComplete={handleRoutineComplete}
          onClose={handleCloseTimer}
        />
      </Modal>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── Styles ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    gap: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.accent + '18',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    ...SHADOWS.accentGlow,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  toggleTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  // Stats Bar
  statsBar: {
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },

  // Streak Calendar
  streakCard: {
    padding: 16,
    marginBottom: 20,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakDayCol: {
    alignItems: 'center',
    gap: 6,
  },
  streakDayName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
  streakDayNameToday: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  streakDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDotDone: {
    backgroundColor: COLORS.accent + '20',
    borderColor: COLORS.borderAccent,
  },
  streakDotToday: {
    borderColor: COLORS.accent + '60',
    borderWidth: 2,
  },
  streakDateNum: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  streakDateNumDone: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  // Routine header
  routineHeader: {
    marginBottom: 12,
  },
  routineHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -4,
    marginBottom: 4,
  },
  routineHeaderText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  routineHeaderDot: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Step Card
  stepCard: {
    padding: 14,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
  },
  stepInfo: {
    flex: 1,
  },
  stepNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepBadge: {
    backgroundColor: COLORS.warning + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
  },
  stepProductType: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  stepTimeBadge: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Step expanded
  stepExpanded: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  instrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  instrBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 5,
  },
  instrText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: COLORS.warning + '0A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning + '20',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
  },

  // Product Recommendations
  recsContainer: {
    marginTop: 8,
  },
  recsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  recTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 68,
    alignItems: 'center',
  },
  recTierText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  recPrice: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Start Button
  startButtonWrap: {
    marginTop: 8,
    marginBottom: 24,
  },

  // Weekly Schedule
  weeklyCard: {
    padding: 16,
    marginBottom: 20,
  },
  weeklySubtitle: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 14,
    fontWeight: '500',
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  weeklyDay: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 32,
  },
  weeklyDayToday: {
    color: COLORS.accent,
    fontWeight: '800',
  },
  weeklyBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.bgCard,
    borderRadius: 3,
    overflow: 'hidden',
  },
  weeklyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  weeklyActiveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  weeklyActiveText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

// ─── Timer Overlay Styles ─────────────────────────────────────────
const timerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    maxWidth: 32,
  },
  dotDone: {
    backgroundColor: COLORS.accent,
  },
  dotActive: {
    backgroundColor: COLORS.scoreExcellent,
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  exerciseName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  timerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },

  // Timer ring
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 1,
  },
  productTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Instructions list in timer
  instructionsList: {
    alignItems: 'center',
    maxWidth: 300,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 4,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
  },
  controlBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },

  // Completion
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completeIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.goldGlow,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  completeXP: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 8,
  },
  completeProgram: {
    fontSize: 15,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

export default SkincareRoutineScreen;
