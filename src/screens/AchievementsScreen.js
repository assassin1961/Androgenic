import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import {
  loadStreakState, getStreakState, getCurrentLevel, getNextLevel, getLevelProgress,
  LEVELS, ACHIEVEMENTS, getUnlockedCount,
} from '../utils/streaks';

const { width } = Dimensions.get('window');

const AchievementsScreen = ({ navigation }) => {
  const [state, setState] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const levelAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(ACHIEVEMENTS.map(() => new Animated.Value(0))).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadStreakState().then(() => {
      setState(getStreakState());
      animateEntrance();
    });
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(levelAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(xpAnim, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 50),
        Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(streakPulse, { toValue: 1.15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(streakPulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  };

  if (!state) return <View style={styles.container} />;

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Level Card */}
        <View style={styles.levelCard}>
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
            <Animated.View style={[styles.streakCircle, { transform: [{ scale: streakPulse }] }]}>
              <LinearGradient colors={['#ff6b35', '#ff4757']} style={styles.streakGrad}>
                <Ionicons name="flame" size={22} color="#fff" />
                <Text style={styles.streakNum}>{state.currentStreak}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpBar}>
            <Animated.View style={[styles.xpBarFill, {
              width: levelAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${Math.max(progress * 100, 2)}%`] }),
            }]}>
              <LinearGradient colors={[level.color, level.color + '80']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </Animated.View>
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
        </View>

        {/* Level Progression */}
        <Text style={styles.sectionTitle}>Level Progression</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelsScroll} contentContainerStyle={styles.levelsContent}>
          {LEVELS.map((l) => {
            const isUnlocked = state.totalXP >= l.xpRequired;
            const isCurrent = l.level === level.level;
            return (
              <View key={l.level} style={[styles.levelPill, isCurrent && { borderColor: l.color, backgroundColor: l.color + '15' }]}>
                <View style={[styles.levelDot, { backgroundColor: isUnlocked ? l.color : COLORS.bgSecondary }]}>
                  {isUnlocked ? (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  ) : (
                    <Text style={styles.levelDotNum}>{l.level}</Text>
                  )}
                </View>
                <Text style={[styles.levelPillName, isUnlocked && { color: l.color }]}>{l.name}</Text>
                <Text style={styles.levelPillXP}>{l.xpRequired} XP</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: `All (${ACHIEVEMENTS.length})` },
            { key: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { key: 'locked', label: `Locked (${ACHIEVEMENTS.length - unlockedCount})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}
            >
              <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievement Cards */}
        {filteredAchievements.map((achievement, i) => {
          const isUnlocked = state.unlockedAchievements[achievement.id];
          const idx = Math.min(i, cardAnims.length - 1);
          return (
            <Animated.View key={achievement.id} style={{
              opacity: cardAnims[idx],
              transform: [{ translateY: cardAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }],
            }}>
              <View style={[styles.achieveCard, isUnlocked && styles.achieveCardUnlocked]}>
                <View style={[styles.achieveIcon, {
                  backgroundColor: isUnlocked ? achievement.color + '20' : COLORS.bgSecondary,
                }]}>
                  <Ionicons
                    name={achievement.icon}
                    size={24}
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
                  {isUnlocked && <Ionicons name="checkmark-circle" size={18} color={achievement.color} />}
                  {!isUnlocked && <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />}
                </View>
              </View>
            </Animated.View>
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
  levelCard: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  levelInfo: {},
  levelLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelNum: { fontSize: 42, fontWeight: '900' },
  levelName: { fontSize: 18, fontWeight: '800' },
  xpTotal: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  streakCircle: {},
  streakGrad: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  streakNum: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: -2 },
  xpBar: { height: 6, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  xpMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  xpMetaText: { color: COLORS.textMuted, fontSize: 11 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  levelsScroll: { marginBottom: 20, maxHeight: 80 },
  levelsContent: { gap: 8 },
  levelPill: { alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: COLORS.border, minWidth: 70 },
  levelDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  levelDotNum: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  levelPillName: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  levelPillXP: { color: COLORS.textMuted, fontSize: 9 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.accent },
  achieveCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  achieveCardUnlocked: { borderColor: 'rgba(0,230,118,0.2)' },
  achieveIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  achieveInfo: { flex: 1 },
  achieveName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  achieveNameLocked: { color: COLORS.textMuted },
  achieveDesc: { color: COLORS.textSecondary, fontSize: 12 },
  achieveRight: { alignItems: 'flex-end', gap: 4 },
  achieveXP: { fontSize: 12, fontWeight: '700' },
});

export default AchievementsScreen;
