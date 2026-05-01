import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { isPro } from '../utils/pro';
import { getStreakState } from '../utils/streaks';
import { getHistory } from '../utils/history';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');
const IQ_STORAGE_KEY = 'androgenic_iq_data';

const QUESTION_BANK = [
  { q: 'What is the ideal fWHR (facial width-to-height ratio)?', opts: ['1.0-1.2', '1.8-2.0', '2.5-3.0', '0.5-0.8'], answer: 1 },
  { q: 'Which sleeping position helps prevent facial asymmetry?', opts: ['On your side', 'On your stomach', 'On your back', 'Fetal position'], answer: 2 },
  { q: 'What is mewing?', opts: ['A facial exercise for eyes', 'Proper tongue posture on the palate', 'A jawline massage technique', 'A skincare routine'], answer: 1 },
  { q: 'What does canthal tilt refer to?', opts: ['Lip curvature', 'Nose bridge angle', 'Angle of the eye corners', 'Jaw angle measurement'], answer: 2 },
  { q: 'Which vitamin is most critical for skin health?', opts: ['Vitamin B12', 'Vitamin D', 'Vitamin A (Retinol)', 'Vitamin K'], answer: 2 },
  { q: 'What is the golden ratio value used in facial aesthetics?', opts: ['1.414', '1.618', '2.718', '3.142'], answer: 1 },
  { q: 'How much water should you drink daily for optimal skin?', opts: ['1 liter', '2-3 liters', '5 liters', '500ml'], answer: 1 },
  { q: 'What does SPF stand for?', opts: ['Skin Protection Formula', 'Sun Protection Factor', 'Sunburn Prevention Filter', 'Skin Pigment Factor'], answer: 1 },
  { q: 'Which exercise targets the masseter muscles?', opts: ['Squats', 'Mastic gum chewing', 'Planks', 'Neck curls'], answer: 1 },
  { q: 'What is the bigonial width?', opts: ['Distance between pupils', 'Width at the jaw angles', 'Width of the forehead', 'Distance between cheekbones'], answer: 1 },
  { q: 'What causes dark circles under the eyes?', opts: ['Only genetics', 'Only dehydration', 'Sleep deprivation, genetics, and thin skin', 'Too much sunlight'], answer: 2 },
  { q: 'What is a derma roller used for?', opts: ['Removing blackheads', 'Stimulating collagen via micro-needling', 'Applying sunscreen', 'Exfoliating dead skin'], answer: 1 },
  { q: 'Which macronutrient is most important for collagen production?', opts: ['Carbohydrates', 'Fats', 'Protein', 'Fiber'], answer: 2 },
  { q: 'What is the ideal midface ratio?', opts: ['0.5', '1.0', '1.5', '2.0'], answer: 1 },
  { q: 'How does mouth breathing affect facial development?', opts: ['No effect', 'Improves jawline', 'Can cause elongated face and recessed jaw', 'Strengthens cheekbones'], answer: 2 },
];

const getIQColor = (iq) => {
  if (iq >= 160) return '#FFD700';
  if (iq >= 120) return '#0066ff';
  if (iq >= 80) return '#ffab40';
  return '#ff5252';
};

const getIQLabel = (iq) => {
  if (iq >= 160) return 'Genius';
  if (iq >= 120) return 'Superior';
  if (iq >= 80) return 'Average';
  return 'Developing';
};

const getDailyQuestions = () => {
  const dayOfMonth = new Date().getDate();
  const startIdx = ((dayOfMonth - 1) * 3) % QUESTION_BANK.length;
  const questions = [];
  for (let i = 0; i < 3; i++) {
    questions.push(QUESTION_BANK[(startIdx + i) % QUESTION_BANK.length]);
  }
  return questions;
};

const computePercentile = (iq) => {
  if (iq >= 180) return 99;
  if (iq >= 160) return 95;
  if (iq >= 140) return 88;
  if (iq >= 120) return 75;
  if (iq >= 100) return 50;
  if (iq >= 80) return 30;
  if (iq >= 60) return 15;
  return 5;
};

const AnimatedBar = ({ value, maxValue, color, delay }) => {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(delay, withSpring((value / maxValue) * 100, { damping: 14, stiffness: 80 }));
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={styles.subBar}>
      <Animated.View style={[styles.subBarFill, animatedStyle]} />
    </View>
  );
};

const AndrogenicIQScreen = ({ navigation }) => {
  const [iqData, setIqData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const pro = isPro();

  const iqScale = useSharedValue(0);
  const iqOpacity = useSharedValue(0);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const [h, stored] = await Promise.all([
      getHistory(),
      AsyncStorage.getItem(IQ_STORAGE_KEY),
    ]);
    setHistory(h);
    setStreakData(getStreakState());

    const parsed = stored ? JSON.parse(stored) : null;
    const today = new Date().toDateString();

    if (parsed) {
      setIqData(parsed);
      if (parsed.lastQuizDate === today) {
        setQuizSubmitted(true);
        setQuizAnswers(parsed.lastQuizAnswers || {});
      }
    }

    iqScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 90 }));
    iqOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  };

  const iqCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iqScale.value }],
    opacity: iqOpacity.value,
  }));

  const computeSubScores = useCallback((quizCorrect) => {
    const streak = streakData || getStreakState();
    const streakDays = streak.currentStreak || 0;
    const totalXP = streak.totalXP || 0;
    const totalScans = streak.totalScans || 0;
    const achievements = Object.keys(streak.unlockedAchievements || {}).length;

    const knowledgeIQ = Math.min(200, Math.round((quizCorrect / 3) * 120 + (totalXP > 500 ? 40 : totalXP * 0.08)));
    const consistencyIQ = Math.min(200, Math.round(Math.min(streakDays, 30) * 5 + (totalScans > 20 ? 50 : totalScans * 2.5)));
    const routineIQ = Math.min(200, Math.round(Math.min(streakDays, 14) * 8 + (totalXP > 300 ? 50 : totalXP * 0.16)));

    let progressIQ = 100;
    if (history.length >= 2) {
      const latest = history[0]?.scores?.overall || 50;
      const oldest = history[history.length - 1]?.scores?.overall || 50;
      const improvement = latest - oldest;
      progressIQ = Math.min(200, Math.max(20, 100 + improvement * 5));
    }

    const awarenessIQ = Math.min(200, Math.round(achievements * 12 + (totalXP > 200 ? 40 : totalXP * 0.2)));

    return { knowledgeIQ, consistencyIQ, progressIQ, routineIQ, awarenessIQ };
  }, [streakData, history]);

  const computeOverallIQ = useCallback((subs) => {
    const { knowledgeIQ, consistencyIQ, progressIQ, routineIQ, awarenessIQ } = subs;
    return Math.round((knowledgeIQ * 0.25 + consistencyIQ * 0.2 + progressIQ * 0.25 + routineIQ * 0.15 + awarenessIQ * 0.15));
  }, []);

  const handleAnswer = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    Haptics.selectionAsync();
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = async () => {
    if (Object.keys(quizAnswers).length < 3) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQuizSubmitted(true);

    const dailyQs = getDailyQuestions();
    let correct = 0;
    dailyQs.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });

    const subs = computeSubScores(correct);
    const overall = computeOverallIQ(subs);
    const today = new Date().toDateString();

    const prevData = iqData || { iqHistory: [] };
    const iqHistory = [{ date: today, score: overall }, ...(prevData.iqHistory || [])].slice(0, 30);

    const newData = {
      overallIQ: overall,
      subScores: subs,
      lastQuizDate: today,
      lastQuizAnswers: quizAnswers,
      lastQuizCorrect: correct,
      iqHistory,
    };

    setIqData(newData);
    await AsyncStorage.setItem(IQ_STORAGE_KEY, JSON.stringify(newData));
  };

  const dailyQuestions = getDailyQuestions();
  const overallIQ = iqData?.overallIQ ?? 0;
  const subScores = iqData?.subScores || {};
  const iqHistory = (iqData?.iqHistory || []).slice(0, 7);
  const percentile = computePercentile(overallIQ);
  const iqColor = getIQColor(overallIQ);

  const SUB_SCORE_META = [
    { key: 'knowledgeIQ', label: 'Knowledge IQ', icon: 'school-outline', desc: 'Quiz performance' },
    { key: 'consistencyIQ', label: 'Consistency IQ', icon: 'flame-outline', desc: 'Streak & adherence' },
    { key: 'progressIQ', label: 'Progress IQ', icon: 'trending-up-outline', desc: 'Scan score improvement' },
    { key: 'routineIQ', label: 'Routine IQ', icon: 'calendar-outline', desc: 'Daily routine completion' },
    { key: 'awarenessIQ', label: 'Awareness IQ', icon: 'eye-outline', desc: 'Guides & tips viewed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Androgenic IQ</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* IQ Circle - animated spring entrance */}
        <Animated.View style={[styles.iqCircleWrap, iqCircleStyle]}>
          <View style={styles.iqCircleContainer}>
            <View style={[styles.iqCircleOuter, { borderColor: iqColor + '30' }]}>
              <View style={[styles.iqCircleInner, { borderColor: iqColor }]}>
                <Text style={[styles.iqScoreText, { color: iqColor }]}>{overallIQ}</Text>
                <Text style={styles.iqScoreLabel}>{getIQLabel(overallIQ)}</Text>
              </View>
            </View>
            <Text style={styles.iqScaleLabel}>Androgenic IQ</Text>
            <Text style={styles.iqScaleRange}>0 — 200 Scale</Text>
          </View>
        </Animated.View>

        {/* Sub Scores */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>IQ Breakdown</Text>
            {!pro && <Ionicons name="lock-closed" size={16} color={COLORS.gold} />}
          </View>
          {pro ? (
            SUB_SCORE_META.map((item, idx) => {
              const val = subScores[item.key] || 0;
              const barColor = getIQColor(val);
              return (
                <Animated.View key={item.key} entering={FadeInDown.duration(300).delay(300 + idx * 80)} style={styles.subRow}>
                  <Ionicons name={item.icon} size={18} color={barColor} style={styles.subIcon} />
                  <View style={styles.subInfo}>
                    <View style={styles.subLabelRow}>
                      <Text style={styles.subLabel}>{item.label}</Text>
                      <Text style={[styles.subValue, { color: barColor }]}>{val}</Text>
                    </View>
                    <AnimatedBar value={val} maxValue={200} color={barColor} delay={400 + idx * 100} />
                    <Text style={styles.subDesc}>{item.desc}</Text>
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={28} color={COLORS.gold} />
              <Text style={styles.lockedText}>Unlock detailed IQ breakdown</Text>
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.lockedBtn}>
                  <Text style={styles.lockedBtnText}>Get PRO</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          )}
        </Animated.View>

        {/* Daily Quiz */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Quiz</Text>
            <View style={styles.quizBadge}>
              <Ionicons name="help-circle" size={14} color={COLORS.accent} />
              <Text style={styles.quizBadgeText}>3 Questions</Text>
            </View>
          </View>
          {dailyQuestions.map((q, qIdx) => {
            const userAnswer = quizAnswers[qIdx];
            const isCorrect = userAnswer === q.answer;
            return (
              <Animated.View key={qIdx} entering={FadeInDown.duration(300).delay(500 + qIdx * 100)} style={styles.questionBlock}>
                <Text style={styles.questionText}>{qIdx + 1}. {q.q}</Text>
                {q.opts.map((opt, oIdx) => {
                  let optStyle = styles.optionBtn;
                  let optTextStyle = styles.optionText;
                  if (quizSubmitted) {
                    if (oIdx === q.answer) {
                      optStyle = [styles.optionBtn, styles.optionCorrect];
                      optTextStyle = [styles.optionText, { color: '#00e676' }];
                    } else if (oIdx === userAnswer && !isCorrect) {
                      optStyle = [styles.optionBtn, styles.optionWrong];
                      optTextStyle = [styles.optionText, { color: '#ff5252' }];
                    }
                  } else if (oIdx === userAnswer) {
                    optStyle = [styles.optionBtn, styles.optionSelected];
                    optTextStyle = [styles.optionText, { color: COLORS.accent }];
                  }
                  return (
                    <AnimatedPressable
                      key={oIdx}
                      style={optStyle}
                      onPress={() => handleAnswer(qIdx, oIdx)}
                      disabled={quizSubmitted}
                      scaleDown={0.97}
                    >
                      <Text style={optTextStyle}>{opt}</Text>
                    </AnimatedPressable>
                  );
                })}
              </Animated.View>
            );
          })}
          {!quizSubmitted ? (
            <AnimatedPressable
              onPress={submitQuiz}
              disabled={Object.keys(quizAnswers).length < 3}
              style={{ opacity: Object.keys(quizAnswers).length < 3 ? 0.4 : 1 }}
            >
              <LinearGradient colors={GRADIENTS.accent} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Submit Answers</Text>
              </LinearGradient>
            </AnimatedPressable>
          ) : (
            <Animated.View entering={ZoomIn.duration(300)} style={styles.quizResult}>
              <Text style={styles.quizResultText}>
                You got {iqData?.lastQuizCorrect ?? 0}/3 correct today!
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Percentile */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Percentile Ranking</Text>
          <Text style={styles.percentileText}>
            You're smarter than <Text style={{ color: iqColor, fontWeight: '800' }}>{percentile}%</Text> of users
          </Text>
          {pro ? (
            <View style={styles.curveContainer}>
              {[5, 12, 22, 35, 50, 65, 78, 88, 95, 100, 95, 88, 78, 65, 50, 35, 22, 12, 5].map((h, i) => {
                const userBarIdx = Math.round((percentile / 100) * 18);
                return (
                  <Animated.View
                    key={i}
                    entering={FadeInDown.duration(200).delay(700 + i * 30)}
                    style={[
                      styles.curveBar,
                      {
                        height: h * 0.6,
                        backgroundColor: i === userBarIdx ? iqColor : COLORS.border,
                        opacity: i === userBarIdx ? 1 : 0.5,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.miniLocked}>
              <Ionicons name="lock-closed" size={14} color={COLORS.gold} />
              <Text style={styles.miniLockedText}>Detailed curve available with PRO</Text>
            </View>
          )}
        </Animated.View>

        {/* IQ History */}
        <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>IQ History</Text>
          {!pro ? (
            <View style={styles.miniLocked}>
              <Ionicons name="lock-closed" size={14} color={COLORS.gold} />
              <Text style={styles.miniLockedText}>Track your IQ trend with PRO</Text>
            </View>
          ) : (
            <>
              <View style={styles.historyRow}>
                {(iqHistory.length > 0 ? iqHistory : [{ date: 'Today', score: overallIQ }]).map((entry, i) => {
                  const maxScore = Math.max(...(iqHistory.length > 0 ? iqHistory : [{ score: overallIQ }]).map((d) => d.score), 1);
                  const barH = (entry.score / maxScore) * 60;
                  const color = getIQColor(entry.score);
                  const label = typeof entry.date === 'string' && entry.date.length > 5
                    ? new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : entry.date;
                  return (
                    <Animated.View key={i} entering={FadeInDown.duration(250).delay(900 + i * 60)} style={styles.historyCol}>
                      <Text style={[styles.historyScore, { color }]}>{entry.score}</Text>
                      <View style={[styles.historyBar, { height: barH, backgroundColor: color }]} />
                      <Text style={styles.historyLabel}>{label}</Text>
                    </Animated.View>
                  );
                })}
              </View>
              {iqHistory.length >= 2 && (
                <Text style={styles.historyTrend}>
                  {iqHistory[0].score >= iqHistory[iqHistory.length - 1].score ? 'Trending up' : 'Trending down'}
                  {' '}over the last {iqHistory.length} sessions
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {/* Pro Upsell */}
        {!pro && (
          <Animated.View entering={FadeInDown.duration(400).delay(1000)}>
            <AnimatedPressable onPress={() => navigation.navigate('Paywall')} scaleDown={0.97}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.upsellCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.upsellContent}>
                  <Ionicons name="diamond" size={28} color="#000" />
                  <View style={styles.upsellTextWrap}>
                    <Text style={styles.upsellTitle}>Unlock Full Androgenic IQ</Text>
                    <Text style={styles.upsellDesc}>
                      Get detailed breakdowns, history tracking, and percentile curves with PRO.
                    </Text>
                  </View>
                </View>
                <View style={styles.upsellBtnRow}>
                  <Text style={styles.upsellBtnText}>Upgrade Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </View>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20 },

  iqCircleWrap: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  iqCircleContainer: { alignItems: 'center' },
  iqCircleOuter: { width: 180, height: 180, borderRadius: 90, borderWidth: 6, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow },
  iqCircleInner: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  iqScoreText: { fontSize: 52, fontWeight: '900' },
  iqScoreLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: -2 },
  iqScaleLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 14 },
  iqScaleRange: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sectionCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  subRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  subIcon: { marginTop: 2, marginRight: 12, width: 20 },
  subInfo: { flex: 1 },
  subLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  subLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  subValue: { fontSize: 13, fontWeight: '800' },
  subBar: { height: 5, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  subBarFill: { height: '100%', borderRadius: 3 },
  subDesc: { fontSize: 10, color: COLORS.textMuted },
  lockedOverlay: { alignItems: 'center', paddingVertical: 20 },
  lockedText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8, marginBottom: 14 },
  lockedBtn: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: 12 },
  lockedBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  miniLocked: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: COLORS.bgSecondary, padding: 10, borderRadius: 10 },
  miniLockedText: { color: COLORS.textMuted, fontSize: 12 },
  quizBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quizBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  questionBlock: { marginBottom: 16 },
  questionText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 8, lineHeight: 18 },
  optionBtn: { backgroundColor: COLORS.bgSecondary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  optionSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '12' },
  optionCorrect: { borderColor: '#00e676', backgroundColor: 'rgba(0,230,118,0.1)' },
  optionWrong: { borderColor: '#ff5252', backgroundColor: 'rgba(255,82,82,0.1)' },
  optionText: { color: COLORS.textSecondary, fontSize: 13 },
  submitBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  quizResult: { alignItems: 'center', paddingVertical: 10, backgroundColor: COLORS.accent + '10', borderRadius: 10, marginTop: 4 },
  quizResultText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  percentileText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 14, marginTop: 4 },
  curveContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 65 },
  curveBar: { width: Math.max((width - 80) / 19 - 3, 8), borderRadius: 3 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 10, height: 100 },
  historyCol: { alignItems: 'center', flex: 1 },
  historyScore: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  historyBar: { width: 18, borderRadius: 4, minHeight: 4 },
  historyLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  historyTrend: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 },
  upsellCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  upsellContent: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  upsellTextWrap: { flex: 1 },
  upsellTitle: { color: '#000', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  upsellDesc: { color: 'rgba(0,0,0,0.6)', fontSize: 12, lineHeight: 16 },
  upsellBtnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.15)', paddingVertical: 10, borderRadius: 10 },
  upsellBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
});

export default AndrogenicIQScreen;
