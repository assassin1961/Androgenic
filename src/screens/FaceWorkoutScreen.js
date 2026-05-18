import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Modal,
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
const STATS_KEY = 'androgenic_face_workout_stats';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Workout Programs ──────────────────────────────────────────────
const WORKOUT_PROGRAMS = [
  {
    id: 'jawline',
    title: 'Jawline Sculptor',
    duration: '8 min',
    exerciseCount: 6,
    tagline: 'Define your jaw',
    icon: 'fitness-outline',
    color: COLORS.accent,
  },
  {
    id: 'cheekbone',
    title: 'Cheekbone Lift',
    duration: '6 min',
    exerciseCount: 5,
    tagline: 'Enhance cheekbone definition',
    icon: 'diamond-outline',
    color: COLORS.accentLight,
  },
  {
    id: 'fullface',
    title: 'Full Face',
    duration: '12 min',
    exerciseCount: 10,
    tagline: 'Complete facial workout',
    icon: 'happy-outline',
    color: COLORS.scoreExcellent,
  },
  {
    id: 'mewing',
    title: 'Mewing Mastery',
    duration: '10 min',
    exerciseCount: 4,
    tagline: 'Proper tongue posture training',
    icon: 'body-outline',
    color: COLORS.blue,
  },
];

// ─── Exercise Data ─────────────────────────────────────────────────
const EXERCISES = {
  jawline: [
    { name: 'Jaw Clench', duration: 30, sets: 3, type: 'timed', instruction: 'Clench jaw firmly, hold, release' },
    { name: 'Chin Lifts', duration: 0, reps: 20, type: 'reps', instruction: 'Tilt head back, push lower jaw forward' },
    { name: 'Neck Curls', duration: 0, reps: 15, type: 'reps', instruction: 'Lie flat, curl chin to chest' },
    { name: 'Tongue Press', duration: 30, sets: 1, type: 'timed', instruction: 'Press tongue firmly against roof of mouth' },
    { name: 'Jaw Side-to-Side', duration: 0, reps: 20, type: 'reps', instruction: 'Move jaw left to right slowly' },
    { name: 'Cheek Puff', duration: 0, reps: 15, type: 'reps', instruction: 'Puff cheeks with air, hold 5 sec' },
  ],
  cheekbone: [
    { name: 'Fish Face', duration: 0, reps: 20, type: 'reps', instruction: 'Suck cheeks in, hold 5 seconds' },
    { name: 'Smile Press', duration: 0, reps: 15, type: 'reps', instruction: 'Smile wide while pressing cheeks with fingers' },
    { name: 'O-Shape Hold', duration: 30, sets: 1, type: 'timed', instruction: 'Form O with mouth, hold tension' },
    { name: 'Cheek Raise', duration: 0, reps: 20, type: 'reps', instruction: 'Raise cheeks toward eyes, hold 3 sec' },
    { name: 'Air Kiss', duration: 0, reps: 15, type: 'reps', instruction: 'Pucker lips, push forward, hold' },
  ],
  fullface: [
    { name: 'Jaw Clench', duration: 30, sets: 3, type: 'timed', instruction: 'Clench jaw firmly, hold, release' },
    { name: 'Chin Lifts', duration: 0, reps: 20, type: 'reps', instruction: 'Tilt head back, push lower jaw forward' },
    { name: 'Fish Face', duration: 0, reps: 20, type: 'reps', instruction: 'Suck cheeks in, hold 5 seconds' },
    { name: 'Smile Press', duration: 0, reps: 15, type: 'reps', instruction: 'Smile wide while pressing cheeks with fingers' },
    { name: 'Cheek Raise', duration: 0, reps: 20, type: 'reps', instruction: 'Raise cheeks toward eyes, hold 3 sec' },
    { name: 'Tongue Press', duration: 30, sets: 1, type: 'timed', instruction: 'Press tongue firmly against roof of mouth' },
    { name: 'Eye Squeeze', duration: 0, reps: 20, type: 'reps', instruction: 'Squeeze eyes shut tight, release' },
    { name: 'Forehead Smooth', duration: 0, reps: 15, type: 'reps', instruction: 'Raise eyebrows high, hold 5 sec' },
    { name: 'Lion Face', duration: 0, reps: 10, type: 'reps', instruction: 'Open mouth wide, stick tongue out, hold' },
    { name: 'Neck Stretch', duration: 30, sets: 2, type: 'timed', instruction: 'Tilt head to side, hold stretch' },
  ],
  mewing: [
    { name: 'Tongue Suction Hold', duration: 60, sets: 1, type: 'timed', instruction: 'Suction entire tongue to palate' },
    { name: 'Swallow Exercise', duration: 0, reps: 20, type: 'reps', instruction: 'Practice correct swallowing with tongue on roof' },
    { name: 'Chin Tuck', duration: 30, sets: 5, type: 'timed', instruction: 'Tuck chin back, creating double chin' },
    { name: 'Breathing Practice', duration: 120, sets: 1, type: 'timed', instruction: 'Breathe through nose only, tongue on palate' },
  ],
};

// ─── Helper: total seconds for an exercise ─────────────────────────
const getExerciseTotalSeconds = (exercise) => {
  if (exercise.type === 'timed') {
    return exercise.duration * (exercise.sets || 1);
  }
  // For rep exercises, estimate ~3 sec per rep
  return (exercise.reps || 10) * 3;
};

const getExerciseLabel = (exercise) => {
  if (exercise.type === 'timed') {
    if (exercise.sets && exercise.sets > 1) return `${exercise.duration}s x ${exercise.sets} sets`;
    return `${exercise.duration} sec hold`;
  }
  return `${exercise.reps} reps`;
};

// ─── Timer Ring Component ──────────────────────────────────────────
const RING_SIZE = 220;
const STROKE_WIDTH = 10;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const TimerRing = memo(({ progress, color }) => {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={timerStyles.ringWrapper}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={COLORS.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress ring */}
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

// ─── Gold Particle (completion effect) ─────────────────────────────
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

// ─── Workout Card ──────────────────────────────────────────────────
const WorkoutCard = memo(({ program, selected, onSelect, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(index * 80)}>
    <AnimatedPressable onPress={() => onSelect(program.id)}>
      <GlassCard
        variant={selected ? 'gold' : 'default'}
        style={[
          styles.programCard,
          selected && styles.programCardSelected,
        ]}
      >
        <View style={[styles.programIconWrap, { backgroundColor: program.color + '18' }]}>
          <Ionicons name={program.icon} size={24} color={program.color} />
        </View>
        <Text style={styles.programTitle}>{program.title}</Text>
        <Text style={styles.programTagline}>{program.tagline}</Text>
        <View style={styles.programMeta}>
          <View style={styles.programMetaItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textTertiary} />
            <Text style={styles.programMetaText}>{program.duration}</Text>
          </View>
          <View style={styles.programMetaItem}>
            <Ionicons name="barbell-outline" size={12} color={COLORS.textTertiary} />
            <Text style={styles.programMetaText}>{program.exerciseCount} exercises</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

// ─── Exercise List Item ────────────────────────────────────────────
const ExerciseItem = memo(({ exercise, index }) => (
  <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
    <GlassCard style={styles.exerciseCard}>
      <View style={styles.exerciseRow}>
        <View style={styles.exerciseNumber}>
          <Text style={styles.exerciseNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseInstruction}>{exercise.instruction}</Text>
        </View>
        <View style={styles.exerciseBadge}>
          <Text style={styles.exerciseBadgeText}>{getExerciseLabel(exercise)}</Text>
        </View>
      </View>
    </GlassCard>
  </Animated.View>
));

// ─── Active Workout Timer Overlay ──────────────────────────────────
const ActiveWorkoutOverlay = ({ exercises, programTitle, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [repCount, setRepCount] = useState(0);

  const progress = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const intervalRef = useRef(null);
  const hapticIntervalRef = useRef(null);

  const currentExercise = exercises[currentIndex];
  const totalExercises = exercises.length;

  // Compute total duration for current exercise
  const getTargetTime = useCallback((exercise) => {
    if (!exercise) return 0;
    if (exercise.type === 'timed') return exercise.duration;
    // For reps: give ~3 sec per rep
    return exercise.reps * 3;
  }, []);

  // Start/restart the timer for current exercise
  const startTimer = useCallback((exercise, rest = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);

    const target = rest ? 5 : getTargetTime(exercise);
    setTimeLeft(target);
    setRepCount(0);
    progress.value = 1;
    progress.value = withTiming(0, { duration: target * 1000, easing: Easing.linear });

    // Haptic pulse
    if (!rest) {
      const hapticInterval = exercise.type === 'timed' ? 5000 : 3000;
      hapticIntervalRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, hapticInterval);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
          intervalRef.current = null;
          hapticIntervalRef.current = null;
          return 0;
        }
        // Update rep count for rep exercises
        if (!rest && exercise.type === 'reps') {
          const totalTime = getTargetTime(exercise);
          const elapsed = totalTime - (prev - 1);
          const secPerRep = totalTime / exercise.reps;
          setRepCount(Math.min(Math.floor(elapsed / secPerRep), exercise.reps));
        }
        return prev - 1;
      });
    }, 1000);
  }, [getTargetTime, progress]);

  // Initialize first exercise
  useEffect(() => {
    if (currentExercise) {
      startTimer(currentExercise);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    };
  }, []);

  // Watch for timeLeft hitting 0
  useEffect(() => {
    if (timeLeft === 0 && !isComplete && intervalRef.current === null) {
      if (isResting) {
        // Rest done, move to next exercise
        setIsResting(false);
        const nextExercise = exercises[currentIndex + 1];
        if (nextExercise) {
          startTimer(nextExercise);
        }
      } else if (currentIndex < totalExercises - 1) {
        // Start rest period between exercises
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsResting(true);
        setCurrentIndex((prev) => prev + 1);
        startTimer(null, true);
      } else {
        // Workout complete
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsComplete(true);
        onComplete();
      }
    }
  }, [timeLeft, isResting, currentIndex, totalExercises, isComplete]);

  // Pause / resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      const exercise = isResting ? null : currentExercise;
      const target = isResting ? timeLeft : timeLeft;
      progress.value = withTiming(0, { duration: target * 1000, easing: Easing.linear });

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
            intervalRef.current = null;
            hapticIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (!isResting && currentExercise) {
        const hapticInterval = currentExercise.type === 'timed' ? 5000 : 3000;
        hapticIntervalRef.current = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, hapticInterval);
      }
    } else {
      // Pause
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
      intervalRef.current = null;
      hapticIntervalRef.current = null;
      cancelAnimation(progress);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isPaused, isResting, currentExercise, timeLeft, progress]);

  // Skip to next exercise
  const skipToNext = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    intervalRef.current = null;
    hapticIntervalRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentIndex < totalExercises - 1) {
      const nextIdx = isResting ? currentIndex : currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsResting(false);
      setIsPaused(false);
      const nextExercise = exercises[nextIdx];
      if (isResting) {
        // Already incremented in rest, just start
        startTimer(exercises[currentIndex]);
      } else {
        startTimer(nextExercise);
      }
    } else {
      // Last exercise, complete
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, totalExercises, isResting, exercises, startTimer, onComplete]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Completion Screen ───────────────────────────────────────────
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
        {/* Gold particles */}
        {particles.map((p) => (
          <GoldParticle key={p.id} delay={p.delay} startX={p.startX} startY={p.startY} />
        ))}

        <Animated.View entering={ZoomIn.duration(500)} style={timerStyles.completeContainer}>
          <View style={timerStyles.completeIconWrap}>
            <Ionicons name="trophy" size={64} color={COLORS.accent} />
          </View>
          <Text style={timerStyles.completeTitle}>Workout Complete!</Text>
          <Text style={timerStyles.completeXP}>+50 XP</Text>
          <Text style={timerStyles.completeProgram}>{programTitle}</Text>

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

  // ─── Active Timer ────────────────────────────────────────────────
  const displayExercise = exercises[currentIndex];
  const timerColor = isResting ? COLORS.accent : COLORS.scoreExcellent;

  return (
    <View style={timerStyles.overlay}>
      <LinearGradient
        colors={['#000000', '#050505', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={timerStyles.safeArea}>
        {/* Close button */}
        <View style={timerStyles.topBar}>
          <AnimatedPressable onPress={onClose} style={timerStyles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={timerStyles.progressLabel}>
            {currentIndex + 1} / {totalExercises}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Progress dots */}
        <View style={timerStyles.dotsRow}>
          {exercises.map((_, i) => (
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
          {isResting ? (
            <Animated.View entering={FadeIn.duration(300)} style={timerStyles.restContainer}>
              <Text style={timerStyles.restLabel}>REST</Text>
              <Text style={timerStyles.restNext}>Next: {displayExercise?.name}</Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(300)} key={currentIndex}>
              <Text style={timerStyles.exerciseName}>{displayExercise?.name}</Text>
            </Animated.View>
          )}

          {/* Timer ring */}
          <View style={timerStyles.ringContainer}>
            <TimerRing progress={progress} color={timerColor} />
            <View style={timerStyles.ringCenter}>
              <Text style={[timerStyles.timeText, { color: timerColor }]}>
                {formatTime(timeLeft)}
              </Text>
              {!isResting && displayExercise?.type === 'reps' && (
                <Text style={timerStyles.repText}>
                  {repCount} / {displayExercise.reps} reps
                </Text>
              )}
              {!isResting && displayExercise?.type === 'timed' && displayExercise.sets > 1 && (
                <Text style={timerStyles.repText}>
                  {displayExercise.sets} sets x {displayExercise.duration}s
                </Text>
              )}
            </View>
          </View>

          {/* Instruction */}
          {!isResting && (
            <Animated.View entering={FadeInDown.duration(300).delay(150)}>
              <Text style={timerStyles.instruction}>{displayExercise?.instruction}</Text>
            </Animated.View>
          )}
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

          <AnimatedPressable onPress={skipToNext} style={timerStyles.controlBtn}>
            <View style={[timerStyles.controlBtnInner, { backgroundColor: COLORS.accent + '20', borderColor: COLORS.borderAccent }]}>
              <Ionicons name="play-forward" size={28} color={COLORS.accent} />
            </View>
            <Text style={timerStyles.controlLabel}>Next</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ─── Main Screen ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const FaceWorkoutScreen = ({ navigation }) => {
  const [selectedProgram, setSelectedProgram] = useState('jawline');
  const [showTimer, setShowTimer] = useState(false);
  const [stats, setStats] = useState({ workoutsCompleted: 0, totalMinutes: 0 });

  // Load saved stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const raw = await AsyncStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
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

  const handleWorkoutComplete = useCallback(() => {
    const program = WORKOUT_PROGRAMS.find((p) => p.id === selectedProgram);
    const minutes = parseInt(program?.duration) || 0;
    const newStats = {
      workoutsCompleted: stats.workoutsCompleted + 1,
      totalMinutes: stats.totalMinutes + minutes,
    };
    saveStats(newStats);
  }, [selectedProgram, stats]);

  const handleCloseTimer = useCallback(() => {
    setShowTimer(false);
  }, []);

  const handleStartWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowTimer(true);
  }, []);

  const exercises = EXERCISES[selectedProgram] || [];
  const selectedProgramData = WORKOUT_PROGRAMS.find((p) => p.id === selectedProgram);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GlassBackground />

      <SafeAreaView style={styles.safeArea}>
        <GlassHeader
          title="Face Gym"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Stats Bar ─────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard variant="accent" style={styles.statsBar}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="trophy-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.statValue}>{stats.workoutsCompleted}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.statValue}>{stats.totalMinutes}</Text>
                  <Text style={styles.statLabel}>Total min</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* ── Workout Selection ─────────────────────────────── */}
          <Text style={styles.sectionTitle}>Workout Programs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programScroll}
            style={styles.programScrollContainer}
          >
            {WORKOUT_PROGRAMS.map((program, index) => (
              <WorkoutCard
                key={program.id}
                program={program}
                selected={selectedProgram === program.id}
                onSelect={setSelectedProgram}
                index={index}
              />
            ))}
          </ScrollView>

          {/* ── Exercise List ─────────────────────────────────── */}
          <View style={styles.exerciseHeader}>
            <Text style={styles.sectionTitle}>{selectedProgramData?.title}</Text>
            <View style={styles.exerciseHeaderMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
              <Text style={styles.exerciseHeaderText}>{selectedProgramData?.duration}</Text>
              <Text style={styles.exerciseHeaderDot}>·</Text>
              <Text style={styles.exerciseHeaderText}>{exercises.length} exercises</Text>
            </View>
          </View>

          {exercises.map((exercise, index) => (
            <ExerciseItem key={`${selectedProgram}-${index}`} exercise={exercise} index={index} />
          ))}

          {/* ── Start Button ──────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(exercises.length * 60 + 200)}>
            <View style={styles.startButtonWrap}>
              <GlassButton
                title="Start Workout"
                icon="play-circle"
                variant="gold"
                size="lg"
                onPress={handleStartWorkout}
              />
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Timer Modal ─────────────────────────────────────── */}
      <Modal
        visible={showTimer}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <ActiveWorkoutOverlay
          exercises={exercises}
          programTitle={selectedProgramData?.title || ''}
          onComplete={handleWorkoutComplete}
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
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  // Program Cards
  programScrollContainer: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  programScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  programCard: {
    width: 160,
    padding: 16,
  },
  programCardSelected: {
    ...SHADOWS.accentGlow,
  },
  programIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  programTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  programTagline: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 12,
    lineHeight: 15,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  programMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  programMetaText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },

  // Exercise List
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -4,
    marginBottom: 4,
  },
  exerciseHeaderText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  exerciseHeaderDot: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  exerciseCard: {
    padding: 14,
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  exerciseInstruction: {
    fontSize: 12,
    color: COLORS.textTertiary,
    lineHeight: 16,
  },
  exerciseBadge: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Start Button
  startButtonWrap: {
    marginTop: 8,
    marginBottom: 10,
  },
});

// ─── Timer Overlay Styles ──────────────────────────────────────────
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
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    maxWidth: 40,
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
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  restContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  restLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 2,
    marginBottom: 8,
  },
  restNext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
  repText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 280,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
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

export default FaceWorkoutScreen;
