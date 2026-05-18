import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Image, Switch,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn,
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY, getScoreColor, getScoreLabel } from '../utils/theme';

const { width } = Dimensions.get('window');
const POSTURE_KEY = 'androgenic_posture_checker';
const REMINDER_KEY = 'androgenic_posture_reminders';
const CHALLENGE_KEY = 'androgenic_posture_challenge';

// ─── Quiz Data ──────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'head',
    question: 'How does your head sit?',
    options: [
      { label: 'Forward', value: 0, icon: 'head-forward' },
      { label: 'Neutral', value: 2, icon: 'head-neutral' },
      { label: 'Pulled Back', value: 1, icon: 'head-back' },
    ],
  },
  {
    id: 'shoulders',
    question: 'How are your shoulders?',
    options: [
      { label: 'Rounded Forward', value: 0, icon: 'shoulders-forward' },
      { label: 'Neutral', value: 2, icon: 'shoulders-neutral' },
      { label: 'Pulled Back', value: 1, icon: 'shoulders-back' },
    ],
  },
  {
    id: 'back',
    question: "How's your back when sitting?",
    options: [
      { label: 'Slouched', value: 0, icon: 'back-slouched' },
      { label: 'Slightly Curved', value: 1, icon: 'back-curved' },
      { label: 'Straight', value: 2, icon: 'back-straight' },
    ],
  },
  {
    id: 'neck_pain',
    question: 'Do you have neck pain?',
    options: [
      { label: 'Often', value: 0, icon: null },
      { label: 'Sometimes', value: 1, icon: null },
      { label: 'Rarely', value: 2, icon: null },
      { label: 'Never', value: 3, icon: null },
    ],
  },
  {
    id: 'screen_time',
    question: 'Hours per day on phone/computer?',
    options: [
      { label: '8+', value: 0, icon: null },
      { label: '5-7', value: 1, icon: null },
      { label: '2-4', value: 2, icon: null },
      { label: 'Less than 2', value: 3, icon: null },
    ],
  },
];

// Max possible score: 2+2+2+3+3 = 12 -> scaled to 10
const MAX_QUIZ_RAW = 12;

// ─── Impact Cards ───────────────────────────────────────────────────
const IMPACT_CARDS = [
  {
    title: 'Forward Head = Weak Jawline',
    desc: 'Every inch of forward head posture reduces jawline definition. Your jaw recedes and neck muscles compensate.',
    icon: 'alert-circle',
    color: '#FF3B30',
  },
  {
    title: 'Rounded Shoulders = Shorter Neck',
    desc: 'Rounded shoulders compress the neck, making it appear shorter and reducing overall facial frame.',
    icon: 'arrow-down-circle',
    color: '#FF9500',
  },
  {
    title: 'Mouth Breathing = Face Elongation',
    desc: 'Poor posture leads to mouth breathing, which over time elongates the face and narrows the palate.',
    icon: 'warning',
    color: '#FFCC00',
  },
  {
    title: 'Good Posture = Better Photos',
    desc: 'Standing tall with chin slightly tucked gives you the best angles for photos and real life.',
    icon: 'checkmark-circle',
    color: '#34C759',
  },
];

// ─── Exercises ──────────────────────────────────────────────────────
const EXERCISES = [
  {
    name: 'Chin Tuck',
    target: 'Neck / Jaw',
    reps: '3 sets of 10',
    duration: 50, // seconds for timer (5s hold x 10)
    instruction: 'Pull chin straight back, hold 5 sec',
    icon: 'body-outline',
    color: '#4A90D9',
  },
  {
    name: 'Wall Angels',
    target: 'Shoulders / Back',
    reps: '3 sets of 10',
    duration: 90,
    instruction: 'Back against wall, slide arms up and down',
    icon: 'fitness-outline',
    color: '#34C759',
  },
  {
    name: 'Doorway Stretch',
    target: 'Chest / Shoulders',
    reps: '30 sec each side',
    duration: 60,
    instruction: 'Stretch chest in doorway',
    icon: 'expand-outline',
    color: '#FF9500',
  },
  {
    name: 'Cat-Cow',
    target: 'Spine',
    reps: '2 min',
    duration: 120,
    instruction: 'Alternate arching and rounding spine',
    icon: 'swap-vertical-outline',
    color: '#a855f7',
  },
  {
    name: "Bruegger's Relief",
    target: 'Upper Back / Posture',
    reps: '30 sec holds',
    duration: 30,
    instruction: 'Sit tall, squeeze shoulder blades, open palms',
    icon: 'hand-left-outline',
    color: '#00e5ff',
  },
  {
    name: 'Dead Hang',
    target: 'Spine / Shoulders',
    reps: '30 sec',
    duration: 30,
    instruction: 'Hang from bar, decompress spine',
    icon: 'arrow-down-outline',
    color: '#ff6090',
  },
];

// ─── 30-Day Challenge Tasks ─────────────────────────────────────────
const CHALLENGE_TASKS = [
  'Check posture 5 times today',
  '10 chin tucks, 3 sets',
  'Wall angels — 3 sets of 10',
  'Set hourly posture reminders',
  'Doorway stretch — 30 sec each side',
  'Walk for 20 min with perfect posture',
  'Cat-cow — 2 minutes',
  'No slouching during meals',
  'Dead hang — 30 seconds',
  "Bruegger's relief — 5 holds",
  'Screen at eye level all day',
  'Chin tucks + wall angels combo',
  'Posture check every 30 min',
  'Sleep on your back tonight',
  'Doorway + cat-cow superset',
  '15-min posture-focused walk',
  'No phone in bed',
  'Full exercise routine (all 6)',
  'Teach someone about posture',
  'Stand for 50% of work today',
  'Wall angels + dead hang combo',
  'Chin tuck during every red light',
  'Foam roll upper back — 5 min',
  'Posture self-assessment quiz',
  'Side photo — compare to day 1',
  'Full routine + 20 min walk',
  'No slouching challenge — all day',
  'Stretch every hour for 1 min',
  'Perfect posture during all meals',
  'Final photo + celebrate progress!',
];

// ─── Side-Profile Posture Illustration ──────────────────────────────
const PostureIllustration = memo(({ type }) => {
  // type: 'forward', 'neutral', 'back' (for head)
  // type: 'shoulders-forward', 'shoulders-neutral', 'shoulders-back'
  // type: 'back-slouched', 'back-curved', 'back-straight'

  const getHeadOffset = () => {
    if (type === 'head-forward') return -12;
    if (type === 'head-back') return 6;
    return 0;
  };

  const getShoulderRotation = () => {
    if (type === 'shoulders-forward') return '15deg';
    if (type === 'shoulders-back') return '-8deg';
    return '0deg';
  };

  const getSpineCurve = () => {
    if (type === 'back-slouched') return 20;
    if (type === 'back-curved') return 8;
    return 0;
  };

  const isHead = type?.startsWith('head');
  const isShoulder = type?.startsWith('shoulders');
  const isBack = type?.startsWith('back');

  if (isHead) {
    const offset = getHeadOffset();
    return (
      <View style={illustStyles.container}>
        {/* Spine line */}
        <View style={illustStyles.spineLine} />
        {/* Head */}
        <View style={[illustStyles.head, { left: 22 + offset, top: 4 }]} />
        {/* Neck */}
        <View style={[illustStyles.neck, {
          left: 26 + (offset * 0.5),
          top: 24,
          transform: [{ rotate: offset < 0 ? '15deg' : offset > 0 ? '-5deg' : '0deg' }],
        }]} />
        {/* Shoulder line */}
        <View style={[illustStyles.shoulderLine, { top: 38 }]} />
      </View>
    );
  }

  if (isShoulder) {
    const rot = getShoulderRotation();
    return (
      <View style={illustStyles.container}>
        <View style={illustStyles.spineLine} />
        <View style={[illustStyles.head, { left: 22, top: 4 }]} />
        {/* Shoulders */}
        <View style={[illustStyles.shoulderLine, {
          top: 36,
          transform: [{ rotate: rot }],
        }]} />
        {/* Chest indicator */}
        {type === 'shoulders-forward' && (
          <View style={[illustStyles.chestCurve, { top: 42 }]} />
        )}
      </View>
    );
  }

  if (isBack) {
    const curve = getSpineCurve();
    return (
      <View style={illustStyles.container}>
        {/* Curved spine */}
        <View style={[illustStyles.spineLine, {
          borderRadius: curve > 0 ? 40 : 0,
          transform: [{ rotate: curve > 10 ? '5deg' : '0deg' }],
        }]} />
        <View style={[illustStyles.head, {
          left: 22 - (curve * 0.3),
          top: 4,
        }]} />
        <View style={[illustStyles.shoulderLine, { top: 36 }]} />
        {/* Back curve indicator */}
        {curve > 0 && (
          <View style={[illustStyles.curveIndicator, {
            borderRadius: 20,
            height: curve > 10 ? 30 : 20,
          }]} />
        )}
      </View>
    );
  }

  return null;
});

const illustStyles = StyleSheet.create({
  container: {
    width: 56,
    height: 64,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
    position: 'absolute',
  },
  neck: {
    width: 2,
    height: 14,
    backgroundColor: COLORS.accent,
    position: 'absolute',
  },
  spineLine: {
    width: 2,
    height: 36,
    backgroundColor: COLORS.textTertiary,
    position: 'absolute',
    left: 27,
    top: 22,
  },
  shoulderLine: {
    width: 36,
    height: 2,
    backgroundColor: COLORS.textTertiary,
    position: 'absolute',
    left: 10,
  },
  chestCurve: {
    width: 20,
    height: 12,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    borderRadius: 10,
    position: 'absolute',
    left: 18,
    borderTopWidth: 0,
  },
  curveIndicator: {
    width: 8,
    height: 20,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    position: 'absolute',
    left: 20,
    top: 30,
    borderRightWidth: 0,
  },
});

// ─── Photo Overlay Component ────────────────────────────────────────
const PhotoOverlay = memo(({ photoUri }) => (
  <View style={styles.photoContainer}>
    <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
    {/* Vertical alignment line */}
    <View style={styles.overlayLineVertical} />
    {/* Ear-to-shoulder line */}
    <View style={styles.overlayLineHorizontal1} />
    {/* Hip alignment line */}
    <View style={styles.overlayLineHorizontal2} />
    {/* Guide dots */}
    <View style={[styles.overlayDot, { top: '18%', left: '50%' }]} />
    <View style={[styles.overlayDot, { top: '35%', left: '50%' }]} />
    <View style={[styles.overlayDot, { top: '55%', left: '50%' }]} />
    <View style={[styles.overlayDot, { top: '75%', left: '50%' }]} />
    {/* Labels */}
    <View style={[styles.overlayLabel, { top: '16%', right: 12 }]}>
      <Text style={styles.overlayLabelText}>Ear</Text>
    </View>
    <View style={[styles.overlayLabel, { top: '33%', right: 12 }]}>
      <Text style={styles.overlayLabelText}>Shoulder</Text>
    </View>
    <View style={[styles.overlayLabel, { top: '53%', right: 12 }]}>
      <Text style={styles.overlayLabelText}>Hip</Text>
    </View>
    <View style={[styles.overlayLabel, { top: '73%', right: 12 }]}>
      <Text style={styles.overlayLabelText}>Ankle</Text>
    </View>
  </View>
));

// ─── Exercise Timer ─────────────────────────────────────────────────
const ExerciseTimer = memo(({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (onComplete) onComplete();
            return 0;
          }
          // Haptic pulse every 5 seconds
          if ((prev - 1) % 5 === 0 && prev > 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timeLeft === 0) {
      setTimeLeft(duration);
      setRunning(true);
    } else {
      setRunning(!running);
    }
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(false);
    setTimeLeft(duration);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - (timeLeft / duration);

  return (
    <View style={styles.timerRow}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>
          {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`}
        </Text>
        <View style={styles.timerBar}>
          <LinearGradient
            colors={GRADIENTS.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.timerBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
      <AnimatedPressable onPress={toggleTimer} style={styles.timerButton}>
        <LinearGradient
          colors={running ? ['#FF3B30', '#CC2D25'] : GRADIENTS.gold}
          style={styles.timerButtonInner}
        >
          <Ionicons
            name={timeLeft === 0 ? 'refresh' : running ? 'pause' : 'play'}
            size={16}
            color="#000"
          />
          <Text style={styles.timerButtonText}>
            {timeLeft === 0 ? 'Reset' : running ? 'Pause' : 'Start'}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
      {running && (
        <AnimatedPressable onPress={resetTimer} style={styles.timerResetBtn}>
          <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
        </AnimatedPressable>
      )}
    </View>
  );
});

// ─── Main Screen ────────────────────────────────────────────────────
const PostureCheckerScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [postureScore, setPostureScore] = useState(null);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeDay, setChallengeDay] = useState(0);
  const [activeTimers, setActiveTimers] = useState({});

  // Load saved data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postureData, reminderData, challengeData] = await Promise.all([
        AsyncStorage.getItem(POSTURE_KEY),
        AsyncStorage.getItem(REMINDER_KEY),
        AsyncStorage.getItem(CHALLENGE_KEY),
      ]);
      if (postureData) {
        const parsed = JSON.parse(postureData);
        if (parsed.score !== undefined) setPostureScore(parsed.score);
        if (parsed.photoUri) setPhotoUri(parsed.photoUri);
        if (parsed.quizAnswers) {
          setQuizAnswers(parsed.quizAnswers);
          setQuizComplete(true);
        }
      }
      if (reminderData) setRemindersEnabled(JSON.parse(reminderData));
      if (challengeData) {
        const cd = JSON.parse(challengeData);
        setChallengeStarted(cd.started || false);
        setChallengeDay(cd.day || 0);
      }
    } catch {}
  };

  const saveData = async (data) => {
    try {
      const existing = await AsyncStorage.getItem(POSTURE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem(POSTURE_KEY, JSON.stringify({ ...parsed, ...data }));
    } catch {}
  };

  // ─── Photo Picker ─────────────────────────────────────────────────
  const pickPhoto = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      saveData({ photoUri: result.assets[0].uri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // ─── Quiz Logic ───────────────────────────────────────────────────
  const selectQuizOption = useCallback((questionId, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuizAnswers(prev => {
      const next = { ...prev, [questionId]: value };
      // Check if all questions answered
      if (Object.keys(next).length === QUIZ_QUESTIONS.length) {
        const rawScore = Object.values(next).reduce((sum, v) => sum + v, 0);
        const scaled = Math.round((rawScore / MAX_QUIZ_RAW) * 10 * 10) / 10;
        const clamped = Math.min(10, Math.max(0, scaled));
        setPostureScore(clamped);
        setQuizComplete(true);
        saveData({ score: clamped, quizAnswers: next });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return next;
    });
  }, []);

  // ─── Reminders Toggle ─────────────────────────────────────────────
  const toggleReminders = useCallback(async (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemindersEnabled(value);
    await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(value));
  }, []);

  // ─── Challenge ────────────────────────────────────────────────────
  const startChallenge = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChallengeStarted(true);
    setChallengeDay(1);
    await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify({ started: true, day: 1, startDate: Date.now() }));
  }, []);

  const advanceChallenge = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = Math.min(30, challengeDay + 1);
    setChallengeDay(next);
    await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify({ started: true, day: next }));
  }, [challengeDay]);

  // ─── Score Display Color ──────────────────────────────────────────
  const scoreColor = postureScore !== null ? getScoreColor(postureScore) : COLORS.textMuted;
  const scoreLabel = postureScore !== null ? getScoreLabel(postureScore) : '—';

  return (
    <View style={styles.root}>
      <GlassBackground />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Posture Check</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Section 1: Posture Score Card ── */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <GlassCard style={styles.scoreCard} glow={postureScore !== null && postureScore >= 7}>
              <Text style={styles.sectionLabel}>YOUR POSTURE SCORE</Text>
              <View style={styles.scoreCircleOuter}>
                <LinearGradient
                  colors={postureScore !== null ? [scoreColor + '30', scoreColor + '08'] : ['#1A1A1A', '#111']}
                  style={styles.scoreCircle}
                >
                  <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                    {postureScore !== null ? postureScore.toFixed(1) : '—'}
                  </Text>
                  <Text style={[styles.scoreOutOf, { color: scoreColor + '99' }]}>/10</Text>
                </LinearGradient>
              </View>
              {postureScore !== null && (
                <Text style={[styles.scoreLabelText, { color: scoreColor }]}>{scoreLabel}</Text>
              )}

              {!photoUri && (
                <Text style={styles.scoreHint}>
                  Take a side photo to analyze your posture
                </Text>
              )}

              <AnimatedPressable onPress={pickPhoto} style={styles.uploadButton}>
                <LinearGradient
                  colors={GRADIENTS.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.uploadButtonInner}
                >
                  <Ionicons name="camera-outline" size={20} color="#000" />
                  <Text style={styles.uploadButtonText}>
                    {photoUri ? 'Retake Photo' : 'Upload Side Photo'}
                  </Text>
                </LinearGradient>
              </AnimatedPressable>

              {photoUri && <PhotoOverlay photoUri={photoUri} />}
            </GlassCard>
          </Animated.View>

          {/* ── Section 2: Self-Assessment Quiz ── */}
          {!photoUri && (
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard-outline" size={20} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Self-Assessment</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Answer 5 questions to estimate your posture score
              </Text>

              {QUIZ_QUESTIONS.map((q, qi) => (
                <Animated.View
                  key={q.id}
                  entering={FadeInDown.duration(400).delay(250 + qi * 80)}
                >
                  <GlassCard style={styles.quizCard}>
                    <Text style={styles.quizQuestion}>
                      <Text style={styles.quizNumber}>Q{qi + 1}. </Text>
                      {q.question}
                    </Text>
                    <View style={styles.quizOptions}>
                      {q.options.map((opt) => {
                        const selected = quizAnswers[q.id] === opt.value;
                        return (
                          <AnimatedPressable
                            key={opt.label}
                            onPress={() => selectQuizOption(q.id, opt.value)}
                            style={[
                              styles.quizOption,
                              selected && styles.quizOptionSelected,
                            ]}
                          >
                            {opt.icon && (
                              <PostureIllustration type={opt.icon} />
                            )}
                            <Text
                              style={[
                                styles.quizOptionText,
                                selected && styles.quizOptionTextSelected,
                              ]}
                            >
                              {opt.label}
                            </Text>
                            {selected && (
                              <View style={styles.quizCheck}>
                                <Ionicons name="checkmark" size={12} color="#000" />
                              </View>
                            )}
                          </AnimatedPressable>
                        );
                      })}
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}

              {quizComplete && (
                <Animated.View entering={ZoomIn.duration(500)}>
                  <GlassCard style={styles.quizResultCard} glow>
                    <Ionicons name="checkmark-circle" size={32} color={scoreColor} />
                    <Text style={styles.quizResultTitle}>Assessment Complete</Text>
                    <Text style={[styles.quizResultScore, { color: scoreColor }]}>
                      {postureScore?.toFixed(1)}/10
                    </Text>
                    <Text style={styles.quizResultDesc}>
                      {postureScore >= 7
                        ? 'Your posture is solid. Keep up the good habits!'
                        : postureScore >= 4
                        ? 'Room for improvement. Follow the exercises below.'
                        : 'Your posture needs work. The exercises below will help significantly.'}
                    </Text>
                  </GlassCard>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {/* ── Section 3: Posture Impact on Face ── */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Posture Impact on Face</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              How your posture directly shapes your facial appearance
            </Text>

            {IMPACT_CARDS.map((card, i) => (
              <Animated.View
                key={card.title}
                entering={FadeInRight.duration(400).delay(350 + i * 80)}
              >
                <GlassCard style={styles.impactCard}>
                  <View style={styles.impactHeader}>
                    <View style={[styles.impactIconCircle, { backgroundColor: card.color + '18' }]}>
                      <Ionicons name={card.icon} size={20} color={card.color} />
                    </View>
                    <Text style={styles.impactTitle}>{card.title}</Text>
                  </View>
                  <Text style={styles.impactDesc}>{card.desc}</Text>
                </GlassCard>
              </Animated.View>
            ))}
          </Animated.View>

          {/* ── Section 4: Correction Exercises ── */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness-outline" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Correction Exercises</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              6 targeted exercises to fix your posture
            </Text>

            {EXERCISES.map((ex, i) => (
              <Animated.View
                key={ex.name}
                entering={FadeInDown.duration(400).delay(450 + i * 60)}
              >
                <GlassCard style={styles.exerciseCard}>
                  <View style={styles.exerciseTop}>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseNameRow}>
                        <Ionicons name={ex.icon} size={18} color={ex.color} />
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                      </View>
                      <View style={[styles.targetBadge, { backgroundColor: ex.color + '15' }]}>
                        <Text style={[styles.targetText, { color: ex.color }]}>{ex.target}</Text>
                      </View>
                    </View>
                    <View style={styles.repsBadge}>
                      <Text style={styles.repsText}>{ex.reps}</Text>
                    </View>
                  </View>
                  <Text style={styles.exerciseInstruction}>{ex.instruction}</Text>
                  <ExerciseTimer duration={ex.duration} />
                </GlassCard>
              </Animated.View>
            ))}
          </Animated.View>

          {/* ── Section 5: Daily Posture Reminders ── */}
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <GlassCard style={styles.reminderCard}>
              <View style={styles.reminderRow}>
                <View style={styles.reminderInfo}>
                  <View style={styles.reminderIconCircle}>
                    <Ionicons name="notifications-outline" size={20} color={COLORS.accent} />
                  </View>
                  <View style={styles.reminderTextWrap}>
                    <Text style={styles.reminderTitle}>Hourly Posture Reminders</Text>
                    <Text style={styles.reminderDesc}>
                      Get reminded to check your posture every hour
                    </Text>
                  </View>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={toggleReminders}
                  trackColor={{ false: '#333', true: COLORS.accent + '60' }}
                  thumbColor={remindersEnabled ? COLORS.accent : '#666'}
                  ios_backgroundColor="#333"
                />
              </View>
              {remindersEnabled && (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.reminderActive}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                  <Text style={styles.reminderActiveText}>
                    Reminders active — stay tall, king
                  </Text>
                </Animated.View>
              )}
            </GlassCard>
          </Animated.View>

          {/* ── Section 6: 30-Day Posture Challenge ── */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)}>
            <GlassCard style={styles.challengeCard} glow={challengeStarted}>
              <LinearGradient
                colors={GRADIENTS.glassGold}
                style={styles.challengeGradient}
              >
                <View style={styles.challengeHeader}>
                  <Ionicons name="trophy" size={24} color={COLORS.accent} />
                  <Text style={styles.challengeTitle}>30-Day Posture Challenge</Text>
                </View>
                <Text style={styles.challengeSubtitle}>
                  Fix your posture in 30 days
                </Text>

                {/* Progress Dots */}
                <View style={styles.dotsContainer}>
                  {Array.from({ length: 30 }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i < challengeDay && styles.dotCompleted,
                        i === challengeDay && challengeStarted && styles.dotCurrent,
                      ]}
                    />
                  ))}
                </View>

                {challengeStarted && (
                  <View style={styles.challengeDayInfo}>
                    <Text style={styles.challengeDayLabel}>
                      Day {challengeDay}/30
                    </Text>
                    <Text style={styles.challengeTask}>
                      {CHALLENGE_TASKS[Math.min(challengeDay - 1, CHALLENGE_TASKS.length - 1)]}
                    </Text>
                    {challengeDay < 30 && (
                      <AnimatedPressable onPress={advanceChallenge} style={styles.completeDayBtn}>
                        <LinearGradient
                          colors={GRADIENTS.gold}
                          style={styles.completeDayBtnInner}
                        >
                          <Ionicons name="checkmark" size={16} color="#000" />
                          <Text style={styles.completeDayText}>Complete Day</Text>
                        </LinearGradient>
                      </AnimatedPressable>
                    )}
                    {challengeDay >= 30 && (
                      <View style={styles.challengeCompleteWrap}>
                        <Ionicons name="trophy" size={28} color={COLORS.accent} />
                        <Text style={styles.challengeCompleteText}>Challenge Complete!</Text>
                      </View>
                    )}
                  </View>
                )}

                {!challengeStarted && (
                  <AnimatedPressable onPress={startChallenge} style={styles.startChallengeBtn}>
                    <LinearGradient
                      colors={GRADIENTS.gold}
                      style={styles.startChallengeBtnInner}
                    >
                      <Ionicons name="flash" size={18} color="#000" />
                      <Text style={styles.startChallengeText}>Start Challenge</Text>
                    </LinearGradient>
                  </AnimatedPressable>
                )}
              </LinearGradient>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },

  // ── Score Card ──
  scoreCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  scoreCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: -4,
  },
  scoreLabelText: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  scoreHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  uploadButton: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  uploadButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.pill,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  // ── Photo Overlay ──
  photoContainer: {
    width: '100%',
    height: 380,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  overlayLineVertical: {
    position: 'absolute',
    width: 1.5,
    height: '100%',
    backgroundColor: COLORS.accent + '60',
    left: '50%',
    top: 0,
  },
  overlayLineHorizontal1: {
    position: 'absolute',
    width: '80%',
    height: 1.5,
    backgroundColor: '#4A90D9' + '60',
    left: '10%',
    top: '35%',
  },
  overlayLineHorizontal2: {
    position: 'absolute',
    width: '80%',
    height: 1.5,
    backgroundColor: '#34C759' + '60',
    left: '10%',
    top: '55%',
  },
  overlayDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginLeft: -5,
    ...SHADOWS.glow,
  },
  overlayLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  overlayLabelText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // ── Section Headers ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // ── Quiz ──
  quizCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  quizQuestion: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  quizNumber: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  quizOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quizOption: {
    flex: 1,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  quizOptionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '12',
  },
  quizOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  quizOptionTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  quizCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Quiz Result ──
  quizResultCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quizResultTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  quizResultScore: {
    fontSize: 40,
    fontWeight: '800',
    marginVertical: SPACING.sm,
  },
  quizResultDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },

  // ── Impact Cards ──
  impactCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  impactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  impactDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: 48,
  },

  // ── Exercise Cards ──
  exerciseCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  exerciseTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  exerciseName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  targetBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  targetText: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
  },
  repsBadge: {
    backgroundColor: COLORS.bgCardHover,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  repsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  exerciseInstruction: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },

  // ── Timer ──
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timerDisplay: {
    flex: 1,
  },
  timerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  timerBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.bgCardHover,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  timerButton: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  timerButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  timerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  timerResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgCardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Reminders ──
  reminderCard: {
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  reminderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTextWrap: {
    flex: 1,
    marginRight: SPACING.md,
  },
  reminderTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  reminderDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  reminderActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  reminderActiveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.green,
  },

  // ── Challenge ──
  challengeCard: {
    marginTop: SPACING.xxl,
    padding: 0,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: SPACING.xl,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  challengeSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgCardHover,
  },
  dotCompleted: {
    backgroundColor: COLORS.accent,
  },
  dotCurrent: {
    backgroundColor: COLORS.accentLight,
    ...SHADOWS.glow,
  },
  challengeDayInfo: {
    marginTop: SPACING.sm,
  },
  challengeDayLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  challengeTask: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  completeDayBtn: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  completeDayBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.pill,
    gap: SPACING.xs,
  },
  completeDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  challengeCompleteWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  challengeCompleteText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.accent,
    fontWeight: '700',
  },
  startChallengeBtn: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  startChallengeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.pill,
    gap: SPACING.sm,
  },
  startChallengeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
});

export default PostureCheckerScreen;
