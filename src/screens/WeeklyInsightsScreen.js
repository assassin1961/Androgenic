import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, getScoreColor } from '../utils/theme';
import { getHistory } from '../utils/history';
import { getStreakState, getCurrentLevel } from '../utils/streaks';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const MOTIVATIONAL_QUOTES = [
  "Your face is your fortune — invest in it daily.",
  "Consistency beats intensity. Show up every day.",
  "The glow-up isn't a sprint, it's a lifestyle.",
  "Every day you skip is a day you lose.",
  "Discipline is the bridge between goals and results.",
  "You're not competing with anyone but yesterday's you.",
  "Small improvements compound into transformations.",
  "The best time to start was yesterday. The next best time is now.",
];

const DAILY_TIPS_POOL = {
  jawline: [
    { tip: 'Chew mastic gum for 30 minutes today', priority: 'high', timeNeeded: '30 min' },
    { tip: 'Practice hard mewing for 1 hour cumulative', priority: 'high', timeNeeded: '1 hr' },
    { tip: 'Do 3 sets of jaw clenches (20 reps)', priority: 'medium', timeNeeded: '5 min' },
  ],
  skin: [
    { tip: 'Apply SPF 50 before going outside today', priority: 'high', timeNeeded: '1 min' },
    { tip: 'Do your double cleanse tonight', priority: 'high', timeNeeded: '3 min' },
    { tip: 'Drink an extra liter of water for skin hydration', priority: 'medium', timeNeeded: '-' },
  ],
  eyes: [
    { tip: 'Apply cold compress to eye area for 5 minutes', priority: 'medium', timeNeeded: '5 min' },
    { tip: 'Get to bed 30 minutes earlier tonight', priority: 'high', timeNeeded: '-' },
  ],
  hair: [
    { tip: 'Do a 5-minute scalp massage in the shower', priority: 'medium', timeNeeded: '5 min' },
    { tip: 'Apply leave-in conditioner or hair oil', priority: 'low', timeNeeded: '2 min' },
  ],
  symmetry: [
    { tip: 'Check your posture right now — shoulders back, chin tucked', priority: 'high', timeNeeded: '30 sec' },
    { tip: 'Sleep on your back tonight using a neck pillow', priority: 'medium', timeNeeded: '-' },
  ],
  cheekbones: [
    { tip: 'Do cheekbone lifts: 3 sets of 15 reps', priority: 'medium', timeNeeded: '5 min' },
    { tip: 'Try gua sha massage on cheekbones for 5 minutes', priority: 'low', timeNeeded: '5 min' },
  ],
  masculinity: [
    { tip: 'Hit the gym today — compound lifts prioritized', priority: 'high', timeNeeded: '60 min' },
    { tip: 'Do 3 sets of neck curls and extensions', priority: 'medium', timeNeeded: '10 min' },
  ],
};

const WeeklyInsightsScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const pro = isPro();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const chartAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const h = await getHistory();
    setHistory(h);
    setStreakData(getStreakState());

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    chartAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(400 + i * 100),
        Animated.spring(anim, { toValue: 1, friction: 6, useNativeDriver: false }),
      ]).start();
    });
  };

  // Get weekly scan data
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const weekScans = history.filter((h) => new Date(h.date).getTime() > weekAgo);
  const prevWeekScans = history.filter((h) => {
    const t = new Date(h.date).getTime();
    return t > weekAgo - 7 * 86400000 && t <= weekAgo;
  });

  const avgOverall = weekScans.length > 0
    ? Math.round(weekScans.reduce((s, h) => s + (h.scores?.overall || 0), 0) / weekScans.length)
    : null;
  const prevAvgOverall = prevWeekScans.length > 0
    ? Math.round(prevWeekScans.reduce((s, h) => s + (h.scores?.overall || 0), 0) / prevWeekScans.length)
    : null;
  const weekChange = avgOverall && prevAvgOverall ? avgOverall - prevAvgOverall : null;

  // Find weakest category from latest scan
  const latestScan = history[0]?.scores || {};
  const categories = ['jawline', 'skin', 'eyes', 'hair', 'symmetry', 'cheekbones', 'masculinity'];
  const weakest = categories
    .filter((c) => latestScan[c] !== undefined)
    .sort((a, b) => (latestScan[a] || 0) - (latestScan[b] || 0))
    .slice(0, 3);

  // Get personalized daily tips based on weakest areas
  const dailyTips = weakest.flatMap((cat) => {
    const pool = DAILY_TIPS_POOL[cat] || [];
    return pool.slice(0, 1).map((t) => ({ ...t, category: cat }));
  });

  const quoteOfDay = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];
  const level = getCurrentLevel();

  // Percentile estimation based on overall score
  const getPercentile = (score) => {
    if (score >= 90) return 5;
    if (score >= 80) return 15;
    if (score >= 70) return 30;
    if (score >= 60) return 50;
    if (score >= 50) return 65;
    return 80;
  };

  const percentile = avgOverall ? getPercentile(avgOverall) : null;

  if (!pro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weekly Insights</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
        </View>
        <View style={styles.lockedContainer}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.lockedIcon}>
            <Ionicons name="analytics" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.lockedTitle}>Weekly Insights</Text>
          <Text style={styles.lockedDesc}>
            Get a personalized weekly report with score trends, percentile rankings, AI-powered tips, and your improvement roadmap.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.unlockBtn}>
              <Ionicons name="lock-open" size={18} color="#000" />
              <Text style={styles.unlockBtnText}>Unlock with PRO</Text>
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
        <Text style={styles.headerTitle}>Weekly Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim }}>
        {/* Quote of the Day */}
        <View style={styles.quoteCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.accent} />
          <Text style={styles.quoteText}>"{quoteOfDay}"</Text>
        </View>

        {/* Weekly Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>THIS WEEK'S SUMMARY</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{weekScans.length}</Text>
              <Text style={styles.summaryLabel}>Scans</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, avgOverall && { color: getScoreColor(avgOverall) }]}>
                {avgOverall || '—'}
              </Text>
              <Text style={styles.summaryLabel}>Avg Score</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              {weekChange !== null ? (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={weekChange > 0 ? 'arrow-up' : weekChange < 0 ? 'arrow-down' : 'remove'}
                    size={16}
                    color={weekChange > 0 ? '#00e676' : weekChange < 0 ? '#ff5252' : COLORS.textMuted}
                  />
                  <Text style={[styles.summaryValue, {
                    color: weekChange > 0 ? '#00e676' : weekChange < 0 ? '#ff5252' : COLORS.textMuted,
                  }]}>{weekChange > 0 ? '+' : ''}{weekChange}</Text>
                </View>
              ) : (
                <Text style={styles.summaryValue}>—</Text>
              )}
              <Text style={styles.summaryLabel}>vs Last Week</Text>
            </View>
          </View>
        </View>

        {/* Percentile Ranking */}
        {percentile && (
          <View style={styles.percentileCard}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.percentileGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={styles.percentileContent}>
                <View>
                  <Text style={styles.percentileLabel}>YOUR RANKING</Text>
                  <Text style={styles.percentileValue}>Top {percentile}%</Text>
                  <Text style={styles.percentileDesc}>Based on {weekScans.length} scans this week</Text>
                </View>
                <View style={styles.percentileCircle}>
                  <Text style={styles.percentileNum}>{percentile}%</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Score Trend Chart */}
        {weekScans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Score Trend</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartGrid}>
                {['100', '75', '50', '25', '0'].map((label) => (
                  <View key={label} style={styles.chartGridRow}>
                    <Text style={styles.chartGridLabel}>{label}</Text>
                    <View style={styles.chartGridLine} />
                  </View>
                ))}
              </View>
              <View style={styles.chartBars}>
                {weekScans.slice(0, 7).reverse().map((scan, i) => {
                  const score = scan.scores?.overall || 0;
                  return (
                    <View key={i} style={styles.chartBarCol}>
                      <Animated.View style={[styles.chartBar, {
                        height: chartAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${score}%`],
                        }),
                        backgroundColor: getScoreColor(score),
                      }]} />
                      <Text style={styles.chartBarLabel}>
                        {new Date(scan.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Personalized Daily Tips */}
        <Text style={styles.sectionTitle}>Today's Action Plan</Text>
        {dailyTips.length > 0 ? dailyTips.map((tip, i) => {
          const catColor = {
            jawline: '#ff6b35', skin: '#00e676', eyes: '#0055dd', hair: '#ffd93d',
            symmetry: '#00b4d8', cheekbones: '#ff6090', masculinity: '#ff4757',
          }[tip.category] || COLORS.accent;

          return (
            <View key={i} style={styles.tipCard}>
              <View style={[styles.tipPriority, {
                backgroundColor: tip.priority === 'high' ? '#ff4757' : tip.priority === 'medium' ? '#ffab40' : '#00b4d8',
              }]} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.tip}</Text>
                <View style={styles.tipMeta}>
                  <View style={[styles.tipCatBadge, { backgroundColor: catColor + '20' }]}>
                    <Text style={[styles.tipCatText, { color: catColor }]}>{tip.category}</Text>
                  </View>
                  {tip.timeNeeded !== '-' && (
                    <View style={styles.tipTimeRow}>
                      <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.tipTimeText}>{tip.timeNeeded}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyTips}>
            <Ionicons name="checkmark-done" size={24} color={COLORS.scoreHigh} />
            <Text style={styles.emptyTipsText}>Take a scan to get personalized tips!</Text>
          </View>
        )}

        {/* Weakest Areas */}
        {weakest.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Focus Areas</Text>
            <View style={styles.focusRow}>
              {weakest.map((cat) => {
                const score = latestScan[cat] || 0;
                const catColor = {
                  jawline: '#ff6b35', skin: '#00e676', eyes: '#0055dd', hair: '#ffd93d',
                  symmetry: '#00b4d8', cheekbones: '#ff6090', masculinity: '#ff4757',
                }[cat] || COLORS.accent;

                return (
                  <View key={cat} style={styles.focusCard}>
                    <Text style={[styles.focusScore, { color: getScoreColor(score) }]}>{score}</Text>
                    <Text style={styles.focusLabel}>{cat}</Text>
                    <View style={styles.focusBar}>
                      <View style={[styles.focusBarFill, { width: `${score}%`, backgroundColor: catColor }]} />
                    </View>
                    <Text style={styles.focusPriority}>Needs work</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Level Progress */}
        {streakData && (
          <View style={styles.levelCard}>
            <View style={styles.levelTop}>
              <Ionicons name="star" size={20} color={level.color} />
              <Text style={styles.levelTitle}>Level {level.level} — {level.name}</Text>
              <Text style={[styles.levelXP, { color: level.color }]}>{streakData.totalXP} XP</Text>
            </View>
            <Text style={styles.levelTip}>Complete daily tasks and scans to level up faster!</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  proBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  scroll: { paddingHorizontal: 20 },
  lockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  lockedIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  lockedTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  lockedDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, gap: 8 },
  unlockBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  quoteCard: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.accent + '10', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '20' },
  quoteText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '500', fontStyle: 'italic', flex: 1, lineHeight: 18 },
  summaryCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  percentileCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  percentileGrad: { padding: 18 },
  percentileContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percentileLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  percentileValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  percentileDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  percentileCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  percentileNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 4 },
  chartCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, height: 180, flexDirection: 'row' },
  chartGrid: { width: 30, justifyContent: 'space-between', paddingVertical: 4 },
  chartGridRow: { flexDirection: 'row', alignItems: 'center' },
  chartGridLabel: { color: COLORS.textMuted, fontSize: 8, width: 20, textAlign: 'right' },
  chartGridLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginLeft: 4 },
  chartBars: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 16 },
  chartBarCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 20, borderRadius: 4, minHeight: 4 },
  chartBarLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', marginTop: 4 },
  tipCard: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: COLORS.bgCard, borderRadius: 14, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  tipPriority: { width: 4 },
  tipContent: { flex: 1, padding: 14 },
  tipTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6, lineHeight: 18 },
  tipMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipCatBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tipCatText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  tipTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tipTimeText: { color: COLORS.textMuted, fontSize: 11 },
  emptyTips: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  emptyTipsText: { color: COLORS.textSecondary, fontSize: 13 },
  focusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  focusCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  focusScore: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  focusLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  focusBar: { height: 4, width: '100%', backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  focusBarFill: { height: '100%', borderRadius: 2 },
  focusPriority: { color: COLORS.scoreLow, fontSize: 9, fontWeight: '700' },
  levelCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  levelXP: { fontSize: 14, fontWeight: '800' },
  levelTip: { color: COLORS.textMuted, fontSize: 12, marginTop: 6 },
});

export default WeeklyInsightsScreen;
