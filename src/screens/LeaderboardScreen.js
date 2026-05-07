import React, { useEffect, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, getScoreColor } from '../utils/theme';
import { getHistory } from '../utils/history';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const LEADERBOARD = [
  { rank: 1, name: 'ChadMax99', score: 94, change: 2, badge: 'crown' },
  { rank: 2, name: 'JawlineKing', score: 91, change: 5, badge: 'medal' },
  { rank: 3, name: 'MewingPro', score: 89, change: 1, badge: 'medal' },
  { rank: 4, name: 'LooksAscend', score: 87, change: 8, badge: null },
  { rank: 5, name: 'FaceGod2024', score: 86, change: 3, badge: null },
  { rank: 6, name: 'SymmetryMax', score: 84, change: -1, badge: null },
  { rank: 7, name: 'GlowUpSZN', score: 83, change: 12, badge: null },
  { rank: 8, name: 'SkinCareKing', score: 82, change: 0, badge: null },
  { rank: 9, name: 'BoneStructure', score: 80, change: 4, badge: null },
  { rank: 10, name: 'LeanFace', score: 79, change: 6, badge: null },
  { rank: 11, name: 'MasculineMax', score: 78, change: 2, badge: null },
  { rank: 12, name: 'CheekboneMog', score: 77, change: -2, badge: null },
  { rank: 13, name: 'HunterEyes', score: 76, change: 9, badge: null },
  { rank: 14, name: 'SquareJaw', score: 75, change: 1, badge: null },
  { rank: 15, name: 'OrthoMax', score: 74, change: 3, badge: null },
];

const CATEGORIES_LEADERS = {
  jawline: [
    { name: 'JawlineKing', score: 97 },
    { name: 'SquareJaw', score: 94 },
    { name: 'ChadMax99', score: 92 },
  ],
  eyes: [
    { name: 'HunterEyes', score: 96 },
    { name: 'FaceGod2024', score: 93 },
    { name: 'SymmetryMax', score: 91 },
  ],
  symmetry: [
    { name: 'SymmetryMax', score: 98 },
    { name: 'ChadMax99', score: 95 },
    { name: 'MewingPro', score: 93 },
  ],
};

const getRankColor = (rank) => {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return COLORS.textSecondary;
};

const RankRow = memo(({ entry, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(200 + index * 50)}>
    <GlassCard style={styles.rankRow}>
      <Text style={[styles.rankNum, { color: getRankColor(entry.rank) }]}>{entry.rank}</Text>
      <View style={[styles.rankAvatar, entry.rank <= 3 && { borderColor: getRankColor(entry.rank) }]}>
        <Ionicons name="person" size={14} color={entry.rank <= 3 ? getRankColor(entry.rank) : COLORS.textMuted} />
      </View>
      <View style={styles.rankInfo}>
        <Text style={styles.rankName}>{entry.name}</Text>
        <View style={styles.rankBar}>
          <View style={[styles.rankBarFill, { width: `${entry.score}%`, backgroundColor: getScoreColor(entry.score) }]} />
        </View>
      </View>
      <View style={styles.rankScoreCol}>
        <Text style={[styles.rankScore, { color: getScoreColor(entry.score) }]}>{entry.score}</Text>
        {entry.change !== 0 && (
          <View style={styles.rankChange}>
            <Ionicons
              name={entry.change > 0 ? 'caret-up' : 'caret-down'}
              size={10}
              color={entry.change > 0 ? COLORS.scoreHigh : COLORS.scoreLow}
            />
            <Text style={[styles.rankChangeText, { color: entry.change > 0 ? COLORS.scoreHigh : COLORS.scoreLow }]}>
              {Math.abs(entry.change)}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  </Animated.View>
));

const LeaderboardScreen = ({ navigation }) => {
  const [userScore, setUserScore] = useState(null);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    loadUserScore();
  }, []);

  const loadUserScore = async () => {
    const history = await getHistory();
    if (history.length > 0) {
      setUserScore(history[0].scores.overall);
    }
  };

  const getUserRank = () => {
    if (!userScore) return null;
    const rank = LEADERBOARD.filter((e) => e.score > userScore).length + 1;
    return Math.min(rank, LEADERBOARD.length + 1);
  };

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top 3 Podium */}
          <View style={styles.podium}>
            {[1, 0, 2].map((idx) => {
              const entry = LEADERBOARD[idx];
              const isFirst = idx === 0;
              return (
                <Animated.View
                  key={idx}
                  entering={ZoomIn.duration(400).delay(100 + idx * 120)}
                  style={[styles.podiumItem, isFirst && styles.podiumFirst]}
                >
                  <View style={[styles.podiumAvatar, { borderColor: getRankColor(entry.rank) }]}>
                    <Ionicons name="person" size={isFirst ? 26 : 20} color={getRankColor(entry.rank)} />
                  </View>
                  <Ionicons
                    name={entry.rank === 1 ? 'trophy' : 'medal'}
                    size={entry.rank === 1 ? 20 : 16}
                    color={getRankColor(entry.rank)}
                    style={styles.podiumBadge}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
                  <Text style={[styles.podiumScore, { color: getRankColor(entry.rank) }]}>{entry.score}</Text>
                  <View style={[styles.podiumBase, {
                    height: isFirst ? 56 : idx === 1 ? 40 : 28,
                    backgroundColor: getRankColor(entry.rank) + '15',
                  }]}>
                    <Text style={[styles.podiumRank, { color: getRankColor(entry.rank) }]}>#{entry.rank}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* Your Rank */}
          {userScore && (
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <LinearGradient colors={GRADIENTS.accent} style={styles.yourRank}>
                <View style={styles.yourRankLeft}>
                  <Text style={styles.yourRankLabel}>Your Rank</Text>
                  <Text style={styles.yourRankValue}>#{getUserRank()}</Text>
                </View>
                <View style={styles.yourRankRight}>
                  <Text style={styles.yourScoreLabel}>Score</Text>
                  <Text style={styles.yourScoreValue}>{userScore}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Tab Filter */}
          <Animated.View entering={FadeInDown.duration(300).delay(350)}>
            <View style={styles.tabs}>
              {['overall', 'jawline', 'eyes', 'symmetry'].map((tab) => (
                <AnimatedPressable
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          {/* Rankings */}
          {activeTab === 'overall' ? (
            LEADERBOARD.map((entry, i) => (
              <RankRow key={i} entry={entry} index={i} />
            ))
          ) : (
            (CATEGORIES_LEADERS[activeTab] || []).map((entry, i) => (
              <Animated.View key={i} entering={FadeInRight.duration(300).delay(i * 80)}>
                <GlassCard style={styles.rankRow}>
                  <Text style={[styles.rankNum, { color: getRankColor(i + 1) }]}>{i + 1}</Text>
                  <View style={[styles.rankAvatar, i < 3 && { borderColor: getRankColor(i + 1) }]}>
                    <Ionicons name="person" size={14} color={i < 3 ? getRankColor(i + 1) : COLORS.textMuted} />
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{entry.name}</Text>
                    <View style={styles.rankBar}>
                      <View style={[styles.rankBarFill, { width: `${entry.score}%`, backgroundColor: getScoreColor(entry.score) }]} />
                    </View>
                  </View>
                  <Text style={[styles.rankScore, { color: getScoreColor(entry.score) }]}>{entry.score}</Text>
                </GlassCard>
              </Animated.View>
            ))
          )}

          <View style={{ height: 100 }} />
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
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20, paddingTop: 10, gap: 12 },
  podiumItem: { alignItems: 'center', width: 88 },
  podiumFirst: { marginBottom: 16 },
  podiumAvatar: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: COLORS.borderLight,
    backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
  },
  podiumBadge: { marginTop: -4, marginBottom: 4 },
  podiumName: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700', marginBottom: 2 },
  podiumScore: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  podiumBase: {
    width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  podiumRank: { fontSize: 13, fontWeight: '800' },
  yourRank: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  yourRankLeft: {},
  yourRankLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  yourRankValue: { color: '#fff', fontSize: 26, fontWeight: '900' },
  yourRankRight: { alignItems: 'flex-end' },
  yourScoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  yourScoreValue: { color: '#fff', fontSize: 26, fontWeight: '900' },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 5,
  },
  rankNum: { fontSize: 14, fontWeight: '800', width: 22, textAlign: 'center' },
  rankAvatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: COLORS.borderLight,
    backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center',
  },
  rankInfo: { flex: 1 },
  rankName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  rankBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  rankBarFill: { height: '100%', borderRadius: 2 },
  rankScoreCol: { alignItems: 'flex-end' },
  rankScore: { fontSize: 16, fontWeight: '800' },
  rankChange: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  rankChangeText: { fontSize: 10, fontWeight: '700' },
});

export default LeaderboardScreen;
