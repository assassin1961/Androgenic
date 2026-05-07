import React, { useState, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import {
  loadStreakState, getStreakState, getCurrentLevel, getNextLevel, getLevelProgress,
  LEVELS, ACHIEVEMENTS, getUnlockedCount,
} from '../utils/streaks';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const AchievementRow = memo(({ achievement, isUnlocked, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(200 + index * 40)}>
    <GlassCard style={[styles.achieveCard, isUnlocked && styles.achieveCardUnlocked]}>
      <View style={[styles.achieveIcon, {
        backgroundColor: isUnlocked ? achievement.color + '20' : 'rgba(255,255,255,0.04)',
      }]}>
        <Ionicons
          name={achievement.icon}
          size={22}
          color={isUnlocked ? achievement.color : COLORS.textMuted}
        />
      </View>
      <View style={styles.achieveInfo}>
        <Text style={[styles.achieveName, !isUnlocked && styles.achieveNameLocked]}>
          {achievement.name}
        </Text>
        <Text style={styles.achieveDesc}>{achievement.desc}</Text>
      </View>
      <View style={styles.achieveRight}>
        <Text style={[styles.achieveXP, { color: isUnlocked ? achievement.color : COLORS.textMuted }]}>
          +{achievement.xp} XP
        </Text>
        {isUnlocked ? (
          <Ionicons name="checkmark-circle" size={18} color={achievement.color} />
        ) : (
          <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
        )}
      </View>
    </GlassCard>
  </Animated.View>
));

const AchievementsScreen = ({ navigation }) => {
  const [state, setState] = useState(null);
  const [filter, setFilter] = useState('all');
  const streakScale = useSharedValue(1);

  useEffect(() => {
    loadStreakState().then(() => {
      setState(getStreakState());
    });
    streakScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const streakAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  if (!state) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  const level = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getLevelProgress();
  const unlockedCount = getUnlockedCount();

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (filter === 'unlocked') return state.unlockedAchievements[a.id];
    if (filter === 'locked') return !state.unlockedAchievements[a.id];
    return true;
  });

  return (
    <GlassBackground variant="purple">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Level Card */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.levelCard}>
              <View style={styles.levelTop}>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>LEVEL</Text>
                  <View style={styles.levelRow}>
                    <Text style={[styles.levelNum, { color: level.color }]}>{level.level}</Text>
                    <View>
                      <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
                      <Text style={styles.xpTotal}>{state.totalXP.toLocaleString()} XP</Text>
                    </View>
                  </View>
                </View>
                <Animated.View style={streakAnimStyle}>
                  <LinearGradient colors={['#ff6b35', '#ff4757']} style={styles.streakGrad}>
                    <Ionicons name="flame" size={20} color="#fff" />
                    <Text style={styles.streakNum}>{state.currentStreak}</Text>
                  </LinearGradient>
                </Animated.View>
              </View>

              {/* XP Progress Bar */}
              <View style={styles.xpBar}>
                <View style={[styles.xpBarFill, { width: `${Math.max(progress * 100, 2)}%` }]}>
                  <LinearGradient colors={[level.color, level.color + '80']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                </View>
              </View>
              <View style={styles.xpMeta}>
                <Text style={styles.xpMetaText}>{level.name}</Text>
                {nextLevel && (
                  <Text style={styles.xpMetaText}>{nextLevel.xpRequired - state.totalXP} XP to {nextLevel.name}</Text>
                )}
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{state.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{state.longestStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{state.totalScans}</Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Level Progression */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.sectionTitle}>Level Progression</Text>
          </Animated.View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelsScroll} contentContainerStyle={styles.levelsContent}>
            {LEVELS.map((l, i) => {
              const isUnlocked = state.totalXP >= l.xpRequired;
              const isCurrent = l.level === level.level;
              return (
                <Animated.View key={l.level} entering={FadeInRight.duration(250).delay(150 + i * 40)}>
                  <GlassCard style={[styles.levelPill, isCurrent && { borderColor: l.color, backgroundColor: l.color + '12' }]}>
                    <View style={[styles.levelDot, { backgroundColor: isUnlocked ? l.color : 'rgba(255,255,255,0.08)' }]}>
                      {isUnlocked ? (
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      ) : (
                        <Text style={styles.levelDotNum}>{l.level}</Text>
                      )}
                    </View>
                    <Text style={[styles.levelPillName, isUnlocked && { color: l.color }]}>{l.name}</Text>
                    <Text style={styles.levelPillXP}>{l.xpRequired} XP</Text>
                  </GlassCard>
                </Animated.View>
              );
            })}
          </ScrollView>

          {/* Filter Tabs */}
          <Animated.View entering={FadeInDown.duration(300).delay(200)}>
            <View style={styles.filterRow}>
              {[
                { key: 'all', label: `All (${ACHIEVEMENTS.length})` },
                { key: 'unlocked', label: `Unlocked (${unlockedCount})` },
                { key: 'locked', label: `Locked (${ACHIEVEMENTS.length - unlockedCount})` },
              ].map((f) => (
                <AnimatedPressable
                  key={f.key}
                  style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                  onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}
                >
                  <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>{f.label}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          {/* Achievement Cards */}
          {filteredAchievements.map((achievement, i) => {
            const isUnlocked = state.unlockedAchievements[achievement.id];
            return (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
                index={i}
              />
            );
          })}

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
  scroll: { paddingHorizontal: 20 },
  levelCard: { padding: 20, marginBottom: 20 },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  levelInfo: {},
  levelLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelNum: { fontSize: 42, fontWeight: '900' },
  levelName: { fontSize: 18, fontWeight: '800' },
  xpTotal: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  streakGrad: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  streakNum: { color: '#fff', fontSize: 13, fontWeight: '900', marginTop: -2 },
  xpBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  xpMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  xpMetaText: { color: COLORS.textMuted, fontSize: 11 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.06)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  levelsScroll: { marginBottom: 20, maxHeight: 90 },
  levelsContent: { gap: 8 },
  levelPill: { alignItems: 'center', gap: 4, padding: 10, minWidth: 70 },
  levelDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  levelDotNum: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  levelPillName: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  levelPillXP: { color: COLORS.textMuted, fontSize: 9 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  filterTabActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.accent },
  achieveCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 6 },
  achieveCardUnlocked: { borderColor: 'rgba(0,230,118,0.15)' },
  achieveIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  achieveInfo: { flex: 1 },
  achieveName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  achieveNameLocked: { color: COLORS.textMuted },
  achieveDesc: { color: COLORS.textSecondary, fontSize: 11 },
  achieveRight: { alignItems: 'flex-end', gap: 4 },
  achieveXP: { fontSize: 11, fontWeight: '700' },
});

export default AchievementsScreen;
