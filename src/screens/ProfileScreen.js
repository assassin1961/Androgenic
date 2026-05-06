import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, getScoreColor, SHADOWS } from '../utils/theme';
import { getHistory } from '../utils/history';
import { isPro, isTrialActive, getTrialDaysLeft, loadProState } from '../utils/pro';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { getStreakState, getCurrentLevel, getLevelProgress } from '../utils/streaks';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const ProfileScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    await loadProState();
    const history = await getHistory();
    if (history.length === 0) { setStats({ totalScans: 0 }); return; }

    const latest = history[0].scores;
    const oldest = history[history.length - 1].scores;
    const categories = ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry', 'overall'];

    const bestScores = {};
    categories.forEach(c => { bestScores[c] = 0; });
    history.forEach(e => categories.forEach(c => { if (e.scores[c] > bestScores[c]) bestScores[c] = e.scores[c]; }));

    const catScores = Object.entries(latest).filter(([k]) => !['overall', 'overallRating'].includes(k)).sort((a, b) => b[1] - a[1]);
    const strongest = catScores[0];
    const weakest = catScores[catScores.length - 1];

    let totalChange = 0, changeCount = 0;
    if (history.length >= 2) {
      categories.filter(c => c !== 'overall').forEach(cat => {
        if (latest[cat] !== undefined && oldest[cat] !== undefined) { totalChange += latest[cat] - oldest[cat]; changeCount++; }
      });
    }

    setStats({
      totalScans: history.length,
      latestRating: latest.overallRating,
      latestOverall: latest.overall,
      bestOverall: bestScores.overall,
      bestRating: Math.max(1, Math.min(10, Math.round(bestScores.overall / 10))),
      strongest, weakest,
      avgChange: changeCount > 0 ? Math.round(totalChange / changeCount) : 0,
      bestScores, latest,
    });
  }, []);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { const unsub = navigation.addListener('focus', loadStats); return unsub; }, [navigation, loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const pro = isPro();
  const trial = isTrialActive();
  const level = getCurrentLevel();
  const levelProgress = getLevelProgress();
  const streakState = getStreakState();

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <AnimatedPressable onPress={() => navigation.navigate('Settings')} style={styles.backBtn}>
            <Ionicons name="settings-outline" size={18} color={COLORS.textSecondary} />
          </AnimatedPressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor="#000" />}
        >
          {/* Avatar */}
          <Animated.View entering={ZoomIn.duration(400)} style={styles.profileHeader}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.avatarCircle}>
              <Ionicons name="person" size={36} color="#fff" />
            </LinearGradient>
            {pro ? (
              <LinearGradient colors={GRADIENTS.gold} style={styles.statusBadge}>
                <Ionicons name="star" size={11} color="#000" />
                <Text style={styles.statusText}>{trial ? `Trial (${getTrialDaysLeft()}d)` : 'PRO'}</Text>
              </LinearGradient>
            ) : (
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <GlassCard variant="default" style={styles.freeBadge}>
                  <Text style={styles.freeText}>Free Plan</Text>
                </GlassCard>
              </AnimatedPressable>
            )}
          </Animated.View>

          {/* Level & Streak */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <GlassCard variant="accent" style={styles.levelCard}>
              <View style={styles.levelRow}>
                <View style={[styles.levelBadge, { backgroundColor: level?.color + '20' }]}>
                  <Text style={[styles.levelNum, { color: level?.color }]}>{level?.level || 1}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, { color: level?.color }]}>{level?.name || 'Newbie'}</Text>
                  <Text style={styles.levelXP}>{streakState?.totalXP || 0} XP</Text>
                </View>
                <AnimatedPressable onPress={() => navigation.navigate('StreakCalendar')} style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#ff6b35" />
                  <Text style={styles.streakText}>{streakState?.currentStreak || 0}</Text>
                </AnimatedPressable>
              </View>
              <View style={styles.levelBarOuter}>
                <View style={[styles.levelBarInner, { width: `${Math.max(levelProgress * 100, 3)}%`, backgroundColor: level?.color }]} />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Stats Grid */}
          {stats && stats.totalScans > 0 ? (
            <>
              <Animated.View entering={FadeInDown.duration(400).delay(160)}>
                <View style={styles.statsGrid}>
                  {[
                    { label: 'Total Scans', value: stats.totalScans, color: COLORS.textPrimary },
                    { label: 'Latest Rating', value: `${stats.latestRating}/10`, color: getScoreColor(stats.latestOverall) },
                    { label: 'Best Rating', value: `${stats.bestRating}/10`, color: COLORS.gold },
                    { label: 'Avg Change', value: `${stats.avgChange > 0 ? '+' : ''}${stats.avgChange}`, color: stats.avgChange > 0 ? COLORS.scoreHigh : stats.avgChange < 0 ? COLORS.scoreLow : COLORS.textMuted },
                  ].map((s, i) => (
                    <GlassCard key={i} variant="default" style={styles.statCard}>
                      <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </GlassCard>
                  ))}
                </View>
              </Animated.View>

              {/* Strengths */}
              {stats.strongest && (
                <Animated.View entering={FadeInRight.duration(300).delay(240)}>
                  <GlassCard variant="default" style={styles.insightCard}>
                    <View style={[styles.insightIcon, { backgroundColor: COLORS.scoreHigh + '15' }]}>
                      <Ionicons name="trending-up" size={16} color={COLORS.scoreHigh} />
                    </View>
                    <View style={styles.insightInfo}>
                      <Text style={styles.insightTitle}>Strongest Feature</Text>
                      <Text style={styles.insightValue}>{CATEGORY_INFO[stats.strongest[0]]?.label || stats.strongest[0]} — {stats.strongest[1]}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              )}

              {stats.weakest && (
                <Animated.View entering={FadeInRight.duration(300).delay(300)}>
                  <GlassCard variant="default" style={styles.insightCard}>
                    <View style={[styles.insightIcon, { backgroundColor: COLORS.scoreMid + '15' }]}>
                      <Ionicons name="fitness" size={16} color={COLORS.scoreMid} />
                    </View>
                    <View style={styles.insightInfo}>
                      <Text style={styles.insightTitle}>Focus Area</Text>
                      <Text style={styles.insightValue}>{CATEGORY_INFO[stats.weakest[0]]?.label || stats.weakest[0]} — {stats.weakest[1]}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              )}

              {/* Best Scores */}
              <Animated.View entering={FadeInDown.duration(400).delay(360)}>
                <Text style={styles.sectionTitle}>All-Time Best</Text>
                {Object.entries(stats.bestScores).filter(([k]) => k !== 'overall').map(([cat, score], i) => (
                  <Animated.View key={cat} entering={FadeInRight.duration(250).delay(400 + i * 40)}>
                    <GlassCard variant="default" style={styles.bestItem}>
                      <Ionicons name={CATEGORY_INFO[cat]?.icon || 'star'} size={14} color={getScoreColor(score)} />
                      <Text style={styles.bestLabel}>{CATEGORY_INFO[cat]?.label || cat}</Text>
                      <Text style={[styles.bestValue, { color: getScoreColor(score) }]}>{score}</Text>
                    </GlassCard>
                  </Animated.View>
                ))}
              </Animated.View>
            </>
          ) : (
            <Animated.View entering={ZoomIn.duration(400)} style={styles.noData}>
              <View style={styles.noDataIcon}>
                <Ionicons name="analytics-outline" size={36} color={COLORS.textMuted} />
              </View>
              <Text style={styles.noDataTitle}>No Scans Yet</Text>
              <Text style={styles.noDataText}>Take your first scan to see stats</Text>
              <GlassButton title="Take First Scan" icon="camera" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16, width: 200 }} />
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'camera', label: 'New Scan', screen: 'Home', color: COLORS.accent },
                { icon: 'time', label: 'History', screen: 'History', color: '#4d94ff' },
                { icon: 'git-branch', label: 'Timeline', screen: 'ProgressTimeline', color: COLORS.scoreHigh },
                { icon: 'flask', label: 'Skincare', screen: 'SkincareAnalyzer', color: COLORS.purple },
                { icon: 'scan', label: 'Symmetry', screen: 'FaceSymmetry', color: '#00e5ff' },
                { icon: 'nutrition', label: 'Meals', screen: 'MealPlan', color: '#ffab40' },
                { icon: 'moon', label: 'Sleep', screen: 'SleepTracker', color: '#4d94ff' },
                { icon: 'gift', label: 'Refer', screen: 'Referral', color: COLORS.gold },
                { icon: 'share-social', label: 'Share', screen: 'ShareTemplates', color: COLORS.accentLight },
              ].map((action, i) => (
                <AnimatedPressable key={i} onPress={() => navigation.navigate(action.screen)} style={styles.actionWrap}>
                  <GlassCard variant="default" style={styles.actionItem}>
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                      <Ionicons name={action.icon} size={18} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, ...SHADOWS.accentGlow,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, gap: 4 },
  statusText: { color: '#000', fontSize: 11, fontWeight: '800' },
  freeBadge: { paddingHorizontal: 12, paddingVertical: 4 },
  freeText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  levelCard: { padding: 14, marginBottom: 16 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  levelBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  levelNum: { fontSize: 16, fontWeight: '900' },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 15, fontWeight: '800' },
  levelXP: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,107,53,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  streakText: { fontSize: 14, fontWeight: '800', color: '#ff6b35' },
  levelBarOuter: { height: 5, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden' },
  levelBarInner: { height: '100%', borderRadius: 3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statCard: { width: '48%', flexGrow: 1, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500', marginTop: 3 },

  insightCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  insightInfo: { flex: 1 },
  insightTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  insightValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12, marginBottom: 10, letterSpacing: 0.3 },

  bestItem: { padding: 12, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bestLabel: { flex: 1, color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  bestValue: { fontSize: 15, fontWeight: '800' },

  noData: { alignItems: 'center', paddingTop: 40 },
  noDataIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 12,
  },
  noDataTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  noDataText: { color: COLORS.textMuted, fontSize: 13 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionWrap: { width: '31%', flexGrow: 1 },
  actionItem: { padding: 14, alignItems: 'center' },
  actionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  actionLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
});

export default ProfileScreen;
