import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, FlatList,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay,
  withSequence, withRepeat, Easing, FadeInRight, FadeOutLeft, FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../utils/theme';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const { width, height } = Dimensions.get('window');

// ─── Data ───────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'jawline', label: 'Improve my jawline', icon: 'fitness-outline' },
  { id: 'skin', label: 'Better skin', icon: 'sparkles-outline' },
  { id: 'progress', label: 'Track my progress', icon: 'trending-up-outline' },
  { id: 'glowup', label: 'Get a glow-up plan', icon: 'star-outline' },
  { id: 'compare', label: 'Compare with celebrities', icon: 'people-outline' },
  { id: 'learn', label: 'Learn looksmaxxing', icon: 'book-outline' },
];

const LEVELS = [
  { id: 'beginner', title: 'Beginner', subtitle: "I'm just starting my journey" },
  { id: 'intermediate', title: 'Intermediate', subtitle: 'I know the basics, want to level up' },
  { id: 'advanced', title: 'Advanced', subtitle: "I'm experienced, want data & precision" },
];

const CONCERNS = [
  'Jawline definition', 'Skin clarity', 'Dark circles', 'Facial symmetry',
  'Hair health', 'Body fat', 'Eye area', 'Cheekbones',
  'Forehead', 'Nose shape', 'Lip fullness', 'Neck posture',
];

// ─── Progress Dots ──────────────────────────────────────────────────────────

const ProgressDots = ({ currentStep, totalSteps }) => (
  <View style={styles.dotsContainer}>
    {Array.from({ length: totalSteps }, (_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === currentStep && styles.dotActive,
          i < currentStep && styles.dotComplete,
        ]}
      />
    ))}
  </View>
);

// ─── Step 1: Welcome ────────────────────────────────────────────────────────

const WelcomeStep = ({ onNext }) => {
  const glowPulse = useSharedValue(0.4);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 }),
      ),
      -1, false,
    );
    logoScale.value = withSpring(1, { damping: 6, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(300)} style={styles.stepContainer}>
      <View style={styles.welcomeContent}>
        <Animated.View style={[styles.glowOrb, glowStyle]} />
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <LinearGradient colors={GRADIENTS.accent} style={[styles.logoCircle, SHADOWS.accentGlow]}>
            <Text style={styles.logoIcon}>A</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={styles.logoText}>ANDROGENIC</Text>
        <Text style={styles.welcomeTitle}>Welcome to the #1 AI Face Analysis App</Text>
        <Text style={styles.welcomeSubtitle}>Join 47K+ users improving their appearance</Text>
      </View>

      <View style={styles.bottomAction}>
        <AnimatedPressable onPress={onNext} style={styles.primaryButtonWrapper}>
          <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
};

// ─── Step 2: Goals ──────────────────────────────────────────────────────────

const GoalsStep = ({ selectedGoals, onToggleGoal, onNext }) => (
  <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(300)} style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <Text style={styles.stepTitle}>What's your goal?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
    </View>

    <View style={styles.goalsGrid}>
      {GOALS.map((goal) => {
        const selected = selectedGoals.includes(goal.id);
        return (
          <AnimatedPressable
            key={goal.id}
            onPress={() => onToggleGoal(goal.id)}
            style={styles.goalCardWrapper}
          >
            <GlassCard
              variant={selected ? 'accent' : 'default'}
              glow={selected}
              borderRadius={RADIUS.md}
              style={styles.goalCard}
            >
              <View style={styles.goalCardContent}>
                <View style={[styles.goalIconContainer, selected && styles.goalIconSelected]}>
                  <Ionicons
                    name={goal.icon}
                    size={24}
                    color={selected ? COLORS.accent : COLORS.textSecondary}
                  />
                </View>
                <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
                  {goal.label}
                </Text>
                {selected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </View>
            </GlassCard>
          </AnimatedPressable>
        );
      })}
    </View>

    <View style={styles.bottomAction}>
      <AnimatedPressable
        onPress={onNext}
        disabled={selectedGoals.length === 0}
        style={[styles.primaryButtonWrapper, selectedGoals.length === 0 && { opacity: 0.4 }]}
      >
        <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  </Animated.View>
);

// ─── Step 3: Experience Level ───────────────────────────────────────────────

const LevelStep = ({ selectedLevel, onSelectLevel, onNext }) => (
  <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(300)} style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <Text style={styles.stepTitle}>Experience level</Text>
      <Text style={styles.stepSubtitle}>This helps us personalize your content</Text>
    </View>

    <View style={styles.levelsContainer}>
      {LEVELS.map((level) => {
        const selected = selectedLevel === level.id;
        return (
          <AnimatedPressable
            key={level.id}
            onPress={() => onSelectLevel(level.id)}
            style={styles.levelCardWrapper}
          >
            <GlassCard
              variant={selected ? 'accent' : 'default'}
              glow={selected}
              borderRadius={RADIUS.lg}
              style={styles.levelCard}
            >
              <View style={styles.levelCardContent}>
                <View style={styles.levelTextGroup}>
                  <Text style={[styles.levelTitle, selected && styles.levelTitleSelected]}>
                    {level.title}
                  </Text>
                  <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
              </View>
            </GlassCard>
          </AnimatedPressable>
        );
      })}
    </View>

    <View style={styles.bottomAction}>
      <AnimatedPressable
        onPress={onNext}
        disabled={!selectedLevel}
        style={[styles.primaryButtonWrapper, !selectedLevel && { opacity: 0.4 }]}
      >
        <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  </Animated.View>
);

// ─── Step 4: Concerns ───────────────────────────────────────────────────────

const ConcernsStep = ({ selectedConcerns, onToggleConcern, onNext }) => (
  <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(300)} style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <Text style={styles.stepTitle}>Your concerns</Text>
      <Text style={styles.stepSubtitle}>Select your top concerns</Text>
    </View>

    <ScrollView
      style={styles.chipsScrollView}
      contentContainerStyle={styles.chipsContainer}
      showsVerticalScrollIndicator={false}
    >
      {CONCERNS.map((concern) => {
        const selected = selectedConcerns.includes(concern);
        return (
          <AnimatedPressable
            key={concern}
            onPress={() => onToggleConcern(concern)}
            style={styles.chipWrapper}
          >
            <View style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {concern}
              </Text>
              {selected && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} style={{ marginLeft: 4 }} />
              )}
            </View>
          </AnimatedPressable>
        );
      })}
    </ScrollView>

    <View style={styles.bottomAction}>
      <AnimatedPressable
        onPress={onNext}
        disabled={selectedConcerns.length === 0}
        style={[styles.primaryButtonWrapper, selectedConcerns.length === 0 && { opacity: 0.4 }]}
      >
        <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  </Animated.View>
);

// ─── Step 5: Ready ──────────────────────────────────────────────────────────

const ReadyStep = ({ onFinish }) => {
  const checkScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    checkScale.value = withSpring(1, { damping: 5, stiffness: 100 });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(300)} style={styles.stepContainer}>
      <View style={styles.readyContent}>
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <LinearGradient colors={['#00e676', '#00c853']} style={styles.checkCircle}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.readyTitle}>Your personalized plan is ready</Text>

        <View style={styles.statsRow}>
          <GlassCard variant="default" borderRadius={RADIUS.md} style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>23+</Text>
              <Text style={styles.statLabel}>Guides</Text>
            </View>
          </GlassCard>
          <GlassCard variant="default" borderRadius={RADIUS.md} style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </GlassCard>
          <GlassCard variant="default" borderRadius={RADIUS.md} style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="flash" size={20} color={COLORS.accent} />
              <Text style={styles.statLabel}>AI Powered</Text>
            </View>
          </GlassCard>
        </View>
      </View>

      <View style={styles.bottomAction}>
        <Animated.View style={pulseStyle}>
          <AnimatedPressable onPress={onFinish} style={styles.primaryButtonWrapper}>
            <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Your Analysis</Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
        <Text style={styles.freeScansText}>2 free scans included</Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Onboarding Screen ─────────────────────────────────────────────────

const OnboardingScreen = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedConcerns, setSelectedConcerns] = useState([]);

  const handleToggleGoal = useCallback((goalId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  }, []);

  const handleSelectLevel = useCallback((levelId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLevel(levelId);
  }, []);

  const handleToggleConcern = useCallback((concern) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  }, []);

  const nextStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep((s) => s + 1);
  }, []);

  const handleFinish = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await AsyncStorage.multiSet([
        ['onboarding_complete', 'true'],
        ['user_goals', JSON.stringify(selectedGoals)],
        ['user_level', selectedLevel || 'beginner'],
        ['user_concerns', JSON.stringify(selectedConcerns)],
      ]);
    } catch (e) {
      // Silently fail — onboarding should not block the user
    }
    onFinish();
  }, [selectedGoals, selectedLevel, selectedConcerns, onFinish]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep key="welcome" onNext={nextStep} />;
      case 1:
        return (
          <GoalsStep
            key="goals"
            selectedGoals={selectedGoals}
            onToggleGoal={handleToggleGoal}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <LevelStep
            key="level"
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelectLevel}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <ConcernsStep
            key="concerns"
            selectedConcerns={selectedConcerns}
            onToggleConcern={handleToggleConcern}
            onNext={nextStep}
          />
        );
      case 4:
        return <ReadyStep key="ready" onFinish={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#060612', '#000000']} style={styles.bg}>
        {/* Ambient glow orbs */}
        <View style={[styles.ambientOrb, { top: height * 0.1, left: -80 }]} />
        <View style={[styles.ambientOrb, styles.ambientOrbRight, { top: height * 0.5 }]} />

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          <ProgressDots currentStep={step} totalSteps={5} />
        </View>

        {/* Step content */}
        {renderStep()}
      </LinearGradient>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  bg: {
    flex: 1,
  },
  ambientOrb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0,102,255,0.15)',
  },
  ambientOrbRight: {
    left: undefined,
    right: -100,
    backgroundColor: 'rgba(0,102,255,0.10)',
  },
  progressContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  dotComplete: {
    backgroundColor: COLORS.accentLight,
  },

  // Step container
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  // Welcome step
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentGlow,
  },
  logoWrapper: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 5,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Step header
  stepHeader: {
    paddingTop: 32,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // Goals grid
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
    alignContent: 'flex-start',
  },
  goalCardWrapper: {
    width: (width - 48 - 12) / 2,
  },
  goalCard: {
    padding: 0,
  },
  goalCardContent: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIconSelected: {
    backgroundColor: 'rgba(0,102,255,0.15)',
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: COLORS.textPrimary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Levels
  levelsContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'flex-start',
  },
  levelCardWrapper: {
    width: '100%',
  },
  levelCard: {
    padding: 0,
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  levelTextGroup: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  levelTitleSelected: {
    color: COLORS.accent,
  },
  levelSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },

  // Concerns chips
  chipsScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  chipWrapper: {},
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: 'rgba(0,102,255,0.12)',
    borderColor: COLORS.borderAccent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.accentLight,
  },

  // Ready step
  readyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
    shadowColor: '#00e676',
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    padding: 0,
  },
  statContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Bottom action
  bottomAction: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  primaryButtonWrapper: {
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: RADIUS.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  freeScansText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 12,
  },
});

export default OnboardingScreen;
