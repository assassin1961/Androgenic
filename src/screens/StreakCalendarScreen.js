import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn, useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS } from '../utils/theme';
import { getStreakState, getCurrentLevel, getNextLevel, getLevelProgress, ACHIEVEMENTS, getUnlockedCount } from '../utils/streaks';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.floor((width - 56) / 7);

const FlameIcon = memo(() => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1, true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="flame" size={48} color="#ff6b35" />
    </Animated.View>
  );
});

const StreakCalendarScreen = ({ navigation }) => {
  const [streakState, setStreakState] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const state = getStreakState();
    setStreakState(state);
    generateCalendar(state);
  }, []);

  const generateCalendar = useCallback((state) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ empty: true });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toDateString();
      const isToday = dateStr === today.toDateString();
      const isActive = state?.lastActiveDate === dateStr ||
        (state?.currentStreak > 0 && d >= today.getDate() - state.currentStreak && d <= today.getDate());
      const isPast = d < today.getDate();

      days.push({ day: d, isToday, isActive, isPast });
    }
    setCalendarDays(days);
  }, []);

  const level = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getLevelProgress();
  const unlockedCount = getUnlockedCount();

  const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Streaks & Stats</Text>
          <AnimatedPressable onPress={() => navigation.navigate('Achievements')} style={styles.backBtn}>
            <Ionicons name="trophy" size={18} color={COLORS.gold} />
          </AnimatedPressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Streak Hero */}
          <Animated.View entering={ZoomIn.duration(500)}>
            <GlassCard variant="accent" style={styles.heroCard} glow>
              <FlameIcon />
              <Text style={styles.heroStreak}>{streakState?.currentStreak || 0}</Text>
              <Text style={styles.heroLabel}>Day Streak</Text>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{streakState?.longestStreak || 0}</Text>
                  <Text style={styles.heroStatLabel}>Best</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{streakState?.totalXP || 0}</Text>
                  <Text style={styles.heroStatLabel}>Total XP</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{streakState?.totalScans || 0}</Text>
                  <Text style={styles.heroStatLabel}>Scans</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Level Progress */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard variant="default" style={styles.levelCard}>
              <View style={styles.levelRow}>
                <View style={[styles.levelBadge, { backgroundColor: level?.color + '20' }]}>
                  <Text style={[styles.levelNum, { color: level?.color }]}>{level?.level || 1}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, { color: level?.color }]}>{level?.name || 'Newbie'}</Text>
                  {nextLevel && (
                    <Text style={styles.levelNext}>Next: {nextLevel.name} ({nextLevel.xpRequired} XP)</Text>
                  )}
                </View>
              </View>
              <View style={styles.levelBarOuter}>
                <View style={[styles.levelBarInner, { width: `${Math.max(progress * 100, 3)}%`, backgroundColor: level?.color }]} />
              </View>
              <Text style={styles.levelXP}>{streakState?.totalXP || 0} / {nextLevel?.xpRequired || 'MAX'} XP</Text>
            </GlassCard>
          </Animated.View>

          {/* Calendar */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.sectionTitle}>{monthName}</Text>
            <GlassCard variant="default" style={styles.calendarCard}>
              <View style={styles.weekHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <Text key={i} style={styles.weekDay}>{d}</Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, i) => (
                  <View key={i} style={styles.calendarCell}>
                    {!day.empty && (
                      <View style={[
                        styles.dayCircle,
                        day.isActive && styles.dayActive,
                        day.isToday && styles.dayToday,
                      ]}>
                        <Text style={[
                          styles.dayText,
                          day.isActive && styles.dayTextActive,
                          day.isToday && styles.dayTextToday,
                          day.isPast && !day.isActive && styles.dayTextPast,
                        ]}>
                          {day.day}
                        </Text>
                        {day.isActive && <View style={styles.dayDot} />}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Achievements Preview */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <View style={styles.achieveHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <AnimatedPressable onPress={() => navigation.navigate('Achievements')}>
                <Text style={styles.seeAll}>See All ({unlockedCount}/{ACHIEVEMENTS.length})</Text>
              </AnimatedPressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACHIEVEMENTS.slice(0, 8).map((a, i) => {
                const unlocked = streakState?.unlockedAchievements?.[a.id];
                return (
                  <Animated.View key={a.id} entering={FadeInRight.duration(300).delay(350 + i * 50)}>
                    <GlassCard
                      variant={unlocked ? 'accent' : 'default'}
                      style={[styles.achieveCard, !unlocked && styles.achieveLocked]}
                    >
                      <View style={[styles.achieveIcon, { backgroundColor: (unlocked ? a.color : COLORS.textMuted) + '15' }]}>
                        <Ionicons name={a.icon} size={18} color={unlocked ? a.color : COLORS.textMuted} />
                      </View>
                      <Text style={[styles.achieveName, unlocked && { color: a.color }]}>{a.name}</Text>
                      <Text style={styles.achieveXP}>+{a.xp} XP</Text>
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* XP History */}
          {streakState?.dailyXPHistory?.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <Text style={styles.sectionTitle}>Recent XP</Text>
              {streakState.dailyXPHistory.slice(0, 5).map((entry, i) => (
                <Animated.View key={i} entering={FadeInRight.duration(300).delay(450 + i * 40)}>
                  <GlassCard variant="default" style={styles.xpCard}>
                    <Ionicons name="flash" size={14} color={COLORS.gold} />
                    <View style={styles.xpInfo}>
                      <Text style={styles.xpDate}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.xpSource}>{entry.source || 'Activity'}</Text>
                    </View>
                    <Text style={styles.xpAmount}>+{entry.xp} XP</Text>
                  </GlassCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}

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

  heroCard: { padding: 24, alignItems: 'center', marginBottom: 16 },
  heroStreak: { fontSize: 48, fontWeight: '900', color: '#ff6b35', marginTop: 4 },
  heroLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 0 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  heroStatLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  heroDivider: { width: 1, height: 24, backgroundColor: COLORS.border },

  levelCard: { padding: 16, marginBottom: 16 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  levelBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  levelNum: { fontSize: 18, fontWeight: '900' },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 16, fontWeight: '800' },
  levelNext: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  levelBarOuter: { height: 6, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  levelBarInner: { height: '100%', borderRadius: 3 },
  levelXP: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },

  calendarCard: { padding: 12, marginBottom: 16 },
  weekHeader: { flexDirection: 'row', marginBottom: 6 },
  weekDay: { width: CELL_SIZE, textAlign: 'center', fontSize: 10, color: COLORS.textMuted, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  dayCircle: {
    width: CELL_SIZE - 8, height: CELL_SIZE - 8, borderRadius: (CELL_SIZE - 8) / 2,
    justifyContent: 'center', alignItems: 'center',
  },
  dayActive: { backgroundColor: 'rgba(255,107,53,0.20)' },
  dayToday: { borderWidth: 2, borderColor: '#ff6b35' },
  dayText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  dayTextActive: { color: '#ff6b35', fontWeight: '800' },
  dayTextToday: { color: '#ff6b35', fontWeight: '900' },
  dayTextPast: { color: COLORS.textMuted },
  dayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ff6b35', position: 'absolute', bottom: 2 },

  achieveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: COLORS.accent, fontSize: 11, fontWeight: '600', marginBottom: 12 },
  achieveCard: { padding: 14, marginRight: 10, width: 110, alignItems: 'center' },
  achieveLocked: { opacity: 0.5 },
  achieveIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  achieveName: { fontSize: 10, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 2 },
  achieveXP: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },

  xpCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpInfo: { flex: 1 },
  xpDate: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  xpSource: { fontSize: 10, color: COLORS.textMuted, marginTop: 1, textTransform: 'capitalize' },
  xpAmount: { fontSize: 14, fontWeight: '800', color: COLORS.gold },
});

export default StreakCalendarScreen;
