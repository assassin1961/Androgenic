import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isLoggedIn, getChallenge as apiGetChallenge, startChallenge as apiStartChallenge, toggleChallengeDay as apiToggleDay } from '../services/api';

const CHALLENGE_KEY = 'androgenic_challenge';

const CHALLENGES = [
  // Week 1: Basics
  { day: 1, title: 'Cold Water Splash', desc: 'Splash your face with cold water for 30 seconds morning and night', category: 'skin', xp: 10 },
  { day: 2, title: 'Mewing Awareness', desc: 'Check tongue posture 10 times today. Lips sealed, teeth together, tongue on palate.', category: 'jawline', xp: 10 },
  { day: 3, title: 'Hydration King', desc: 'Drink at least 3 liters of water today. Track every glass.', category: 'skin', xp: 15 },
  { day: 4, title: 'Posture Check Day', desc: 'Set 5 alarms throughout the day to check and correct your posture', category: 'symmetry', xp: 10 },
  { day: 5, title: 'Skincare Start', desc: 'Do a full AM skincare routine: cleanser, moisturizer, SPF', category: 'skin', xp: 20 },
  { day: 6, title: 'First Chew Session', desc: 'Chew mastic gum or falim gum for 30 minutes', category: 'jawline', xp: 15 },
  { day: 7, title: 'Sleep Optimization', desc: 'Sleep on your back tonight. Use a neck pillow if needed.', category: 'symmetry', xp: 15 },
  // Week 2: Stepping Up
  { day: 8, title: 'Eye Area Care', desc: 'Apply caffeine eye cream and use cold compress for 5 min', category: 'eyes', xp: 15 },
  { day: 9, title: 'Jaw Workout', desc: 'Do 3 sets of jaw clenches (20 reps each) + 30min gum chewing', category: 'jawline', xp: 20 },
  { day: 10, title: 'Hair Care Day', desc: 'Deep condition your hair. Massage scalp for 5 minutes.', category: 'hair', xp: 15 },
  { day: 11, title: 'No Sugar Challenge', desc: 'Zero added sugar today. Read every label. Your skin will thank you.', category: 'skin', xp: 25 },
  { day: 12, title: 'Facial Exercises', desc: 'Do cheekbone lifts (3x15), chin tucks (3x10), and brow raises (3x15)', category: 'cheekbones', xp: 20 },
  { day: 13, title: 'Grooming Session', desc: 'Shape eyebrows, trim nose hair, clean up facial hair lines', category: 'masculinity', xp: 15 },
  { day: 14, title: 'Progress Photo', desc: 'Take a front and side profile photo. Compare with day 1.', category: 'overall', xp: 30 },
  // Week 3: Intensity
  { day: 15, title: 'Hard Mewing Hour', desc: 'Practice hard mewing for 1 cumulative hour today', category: 'jawline', xp: 25 },
  { day: 16, title: 'Retinol Night', desc: 'Apply retinol serum tonight. Follow with heavy moisturizer.', category: 'skin', xp: 20 },
  { day: 17, title: 'Neck Training', desc: 'Do neck curls and extensions: 3 sets of 15 reps each direction', category: 'masculinity', xp: 25 },
  { day: 18, title: 'Symmetry Focus', desc: 'Chew gum on your weaker side for 45 minutes', category: 'symmetry', xp: 20 },
  { day: 19, title: 'Full Skincare Stack', desc: 'AM: Cleanser→VitC→Moisturizer→SPF. PM: Double cleanse→Retinol→Moisturizer', category: 'skin', xp: 30 },
  { day: 20, title: 'Derma Roll Session', desc: 'Use a 0.5mm derma roller on face (or 1.5mm on scalp for hair)', category: 'skin', xp: 25 },
  { day: 21, title: 'Midpoint Scan', desc: 'Take a new face scan and compare your scores with day 1', category: 'overall', xp: 35 },
  // Week 4: Advanced
  { day: 22, title: 'Bone Smashing Lite', desc: 'Light tapping along jawline and cheekbones for 10 min (gentle!)', category: 'cheekbones', xp: 20 },
  { day: 23, title: 'Cold Shower', desc: 'End your shower with 2 minutes of cold water. Tightens skin, boosts circulation.', category: 'skin', xp: 25 },
  { day: 24, title: 'Double Chew Day', desc: 'Two 30-minute mastic gum sessions. Focus on even chewing.', category: 'jawline', xp: 30 },
  { day: 25, title: 'Eye Maximize', desc: 'Castor oil on lashes, caffeine cream, cold compress. All 3 today.', category: 'eyes', xp: 25 },
  { day: 26, title: 'Style Upgrade', desc: 'Get a haircut that complements your face shape. Ask your barber.', category: 'hair', xp: 30 },
  { day: 27, title: 'Full Body Day', desc: 'Compound lifts at the gym: squats, deadlifts, bench, rows', category: 'masculinity', xp: 35 },
  { day: 28, title: 'Gua Sha Session', desc: 'Use a gua sha stone on face for 10 min. Focus on jawline and cheekbones.', category: 'cheekbones', xp: 25 },
  { day: 29, title: 'Everything Day', desc: 'Do every routine: full skincare, mewing, chewing, exercises, posture', category: 'overall', xp: 40 },
  { day: 30, title: 'Final Scan', desc: 'Take your final scan! Compare with day 1 and celebrate your progress.', category: 'overall', xp: 50 },
];

const ChallengeScreen = ({ navigation }) => {
  const [state, setState] = useState({ startDate: null, completed: {}, streak: 0 });
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    // Try backend first
    if (isLoggedIn()) {
      try {
        const data = await apiGetChallenge();
        if (data.challenge) {
          const backendState = {
            startDate: data.challenge.start_date ? new Date(data.challenge.start_date).getTime() : null,
            completed: data.challenge.completed || {},
            streak: data.challenge.streak || 0,
          };
          setState(backendState);
          animateProgress(backendState);
          await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(backendState));
          return;
        }
      } catch {}
    }
    try {
      const data = await AsyncStorage.getItem(CHALLENGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setState(parsed);
        animateProgress(parsed);
      }
    } catch {}
  };

  const saveState = async (newState) => {
    setState(newState);
    try {
      await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(newState));
    } catch {}
    animateProgress(newState);
  };

  const animateProgress = (s) => {
    const completedCount = Object.keys(s.completed || {}).length;
    Animated.timing(progressAnim, {
      toValue: completedCount / 30,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.sequence([
      Animated.timing(streakScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.spring(streakScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const startChallenge = async () => {
    const newState = { startDate: Date.now(), completed: {}, streak: 0 };
    saveState(newState);
    if (isLoggedIn()) {
      try { await apiStartChallenge(); } catch {}
    }
  };

  const toggleDay = async (day) => {
    const updated = { ...state };
    if (!updated.completed) updated.completed = {};
    if (updated.completed[day]) {
      delete updated.completed[day];
    } else {
      updated.completed[day] = Date.now();
    }
    // Calc streak
    let streak = 0;
    for (let d = 1; d <= 30; d++) {
      if (updated.completed[d]) streak = d;
      else break;
    }
    updated.streak = streak;
    saveState(updated);
    if (isLoggedIn()) {
      try { await apiToggleDay(day); } catch {}
    }
  };

  const completedCount = Object.keys(state.completed || {}).length;
  const totalXP = CHALLENGES.filter((c) => state.completed?.[c.day]).reduce((sum, c) => sum + c.xp, 0);
  const currentDay = state.startDate
    ? Math.min(30, Math.floor((Date.now() - state.startDate) / (24 * 60 * 60 * 1000)) + 1)
    : 0;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getCatColor = (cat) => {
    const map = { skin: '#00d26a', jawline: '#f5a623', eyes: '#6c5ce7', symmetry: '#00b4d8',
      cheekbones: '#ff6b6b', hair: '#ffd93d', masculinity: '#ff4757', overall: '#a29bfe' };
    return map[cat] || COLORS.accent;
  };

  if (!state.startDate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>30-Day Challenge</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.startContainer}>
          <LinearGradient colors={GRADIENTS.accentAlt} style={styles.startIcon}>
            <Ionicons name="flame" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.startTitle}>30-Day Glow Up</Text>
          <Text style={styles.startSubtitle}>Transform your face in 30 days with daily challenges</Text>
          <View style={styles.startStats}>
            {[
              { num: '30', label: 'Days' },
              { num: '655', label: 'Total XP' },
              { num: '7', label: 'Categories' },
            ].map((s, i) => (
              <View key={i} style={styles.startStatItem}>
                <Text style={styles.startStatNum}>{s.num}</Text>
                <Text style={styles.startStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={startChallenge} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.startBtn}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Start Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>30-Day Challenge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Banner */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Day {currentDay} of 30</Text>
              <Text style={styles.progressSubLabel}>{completedCount}/30 completed</Text>
            </View>
            <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakScale }] }]}>
              <Ionicons name="flame" size={16} color="#ff6b35" />
              <Text style={styles.streakNum}>{state.streak}</Text>
            </Animated.View>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFg, { width: progressWidth }]}>
              <LinearGradient colors={GRADIENTS.accent} style={styles.progressGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </Animated.View>
          </View>
          <View style={styles.xpRow}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.xpText}>{totalXP} XP earned</Text>
          </View>
        </View>

        {/* Challenge Days */}
        {CHALLENGES.map((challenge) => {
          const isDone = state.completed?.[challenge.day];
          const isToday = challenge.day === currentDay;
          const isLocked = challenge.day > currentDay;
          const catColor = getCatColor(challenge.category);

          return (
            <TouchableOpacity
              key={challenge.day}
              style={[styles.dayCard, isDone && styles.dayCardDone, isToday && styles.dayCardToday, isLocked && styles.dayCardLocked]}
              onPress={() => !isLocked && toggleDay(challenge.day)}
              activeOpacity={isLocked ? 1 : 0.7}
              disabled={isLocked}
            >
              <View style={[styles.dayNum, isDone && styles.dayNumDone, isToday && styles.dayNumToday]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : isLocked ? (
                  <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
                ) : (
                  <Text style={[styles.dayNumText, isToday && styles.dayNumTextToday]}>{challenge.day}</Text>
                )}
              </View>
              <View style={styles.dayContent}>
                <Text style={[styles.dayTitle, isDone && styles.dayTitleDone, isLocked && styles.dayTitleLocked]}>
                  {challenge.title}
                </Text>
                <Text style={[styles.dayDesc, isLocked && { color: COLORS.textMuted }]} numberOfLines={isToday ? 3 : 1}>
                  {challenge.desc}
                </Text>
                <View style={styles.dayMeta}>
                  <View style={[styles.catPill, { backgroundColor: catColor + '20' }]}>
                    <Text style={[styles.catPillText, { color: catColor }]}>{challenge.category}</Text>
                  </View>
                  <Text style={styles.xpLabel}>+{challenge.xp} XP</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20 },
  // Start screen
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  startIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  startTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  startSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 28 },
  startStats: { flexDirection: 'row', gap: 24, marginBottom: 32 },
  startStatItem: { alignItems: 'center' },
  startStatNum: { fontSize: 24, fontWeight: '800', color: COLORS.accent },
  startStatLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  startBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, gap: 8 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  // Progress
  progressCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  progressSubLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4,
  },
  streakNum: { color: '#ff6b35', fontSize: 16, fontWeight: '800' },
  progressBarBg: { height: 6, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBarFg: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  progressGradient: { flex: 1 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },
  // Day cards
  dayCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.bgCard,
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  dayCardDone: { opacity: 0.6, borderColor: COLORS.scoreHigh + '30' },
  dayCardToday: { borderColor: COLORS.accent, backgroundColor: 'rgba(108,92,231,0.06)' },
  dayCardLocked: { opacity: 0.4 },
  dayNum: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  dayNumDone: { backgroundColor: COLORS.scoreHigh },
  dayNumToday: { backgroundColor: COLORS.accent },
  dayNumText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  dayNumTextToday: { color: '#fff' },
  dayContent: { flex: 1 },
  dayTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  dayTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  dayTitleLocked: { color: COLORS.textMuted },
  dayDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  dayMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  catPillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  xpLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
});

export default ChallengeScreen;
