import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, getScoreColor } from '../utils/theme';
import { getHistory } from '../utils/history';

// Simulated community leaderboard data
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

const LeaderboardScreen = ({ navigation }) => {
  const [userScore, setUserScore] = useState(null);
  const [activeTab, setActiveTab] = useState('overall');
  const slideAnims = useRef(LEADERBOARD.map(() => new Animated.Value(50))).current;
  const fadeAnims = useRef(LEADERBOARD.map(() => new Animated.Value(0))).current;
  const topThreeScale = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    loadUserScore();
    // Stagger entry animations
    slideAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(200 + i * 60),
        Animated.parallel([
          Animated.spring(anim, { toValue: 0, friction: 8, useNativeDriver: true }),
          Animated.timing(fadeAnims[i], { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    });
    // Top 3 bounce
    topThreeScale.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(100 + i * 150),
        Animated.spring(anim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]).start();
    });
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

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return COLORS.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
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
                style={[
                  styles.podiumItem,
                  isFirst && styles.podiumFirst,
                  { transform: [{ scale: topThreeScale[idx] }] },
                ]}
              >
                <View style={[styles.podiumAvatar, { borderColor: getRankColor(entry.rank) }]}>
                  <Ionicons name="person" size={isFirst ? 28 : 22} color={getRankColor(entry.rank)} />
                </View>
                <Ionicons
                  name={entry.rank === 1 ? 'trophy' : 'medal'}
                  size={entry.rank === 1 ? 22 : 18}
                  color={getRankColor(entry.rank)}
                  style={styles.podiumBadge}
                />
                <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
                <Text style={[styles.podiumScore, { color: getRankColor(entry.rank) }]}>{entry.score}</Text>
                <View style={[styles.podiumBase, { height: isFirst ? 60 : idx === 1 ? 44 : 32, backgroundColor: getRankColor(entry.rank) + '20' }]}>
                  <Text style={[styles.podiumRank, { color: getRankColor(entry.rank) }]}>#{entry.rank}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Your Rank */}
        {userScore && (
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
        )}

        {/* Tab Filter */}
        <View style={styles.tabs}>
          {['overall', 'jawline', 'eyes', 'symmetry'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rankings */}
        {activeTab === 'overall' ? (
          LEADERBOARD.map((entry, i) => (
            <Animated.View
              key={i}
              style={[styles.rankRow, { opacity: fadeAnims[i], transform: [{ translateX: slideAnims[i] }] }]}
            >
              <Text style={[styles.rankNum, { color: getRankColor(entry.rank) }]}>
                {entry.rank}
              </Text>
              <View style={[styles.rankAvatar, entry.rank <= 3 && { borderColor: getRankColor(entry.rank) }]}>
                <Ionicons name="person" size={16} color={entry.rank <= 3 ? getRankColor(entry.rank) : COLORS.textMuted} />
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
            </Animated.View>
          ))
        ) : (
          (CATEGORIES_LEADERS[activeTab] || []).map((entry, i) => (
            <View key={i} style={styles.rankRow}>
              <Text style={[styles.rankNum, { color: getRankColor(i + 1) }]}>{i + 1}</Text>
              <View style={[styles.rankAvatar, i < 3 && { borderColor: getRankColor(i + 1) }]}>
                <Ionicons name="person" size={16} color={i < 3 ? getRankColor(i + 1) : COLORS.textMuted} />
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{entry.name}</Text>
                <View style={styles.rankBar}>
                  <View style={[styles.rankBarFill, { width: `${entry.score}%`, backgroundColor: getScoreColor(entry.score) }]} />
                </View>
              </View>
              <Text style={[styles.rankScore, { color: getScoreColor(entry.score) }]}>{entry.score}</Text>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
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
  // Podium
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20, paddingTop: 10, gap: 12 },
  podiumItem: { alignItems: 'center', width: 90 },
  podiumFirst: { marginBottom: 16 },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center',
  },
  podiumBadge: { marginTop: -4, marginBottom: 4 },
  podiumName: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  podiumScore: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  podiumBase: {
    width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  podiumRank: { fontSize: 14, fontWeight: '800' },
  // Your rank
  yourRank: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  yourRankLeft: {},
  yourRankLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  yourRankValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  yourRankRight: { alignItems: 'flex-end' },
  yourScoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  yourScoreValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  // Tabs
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.bgCard,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  // Rank rows
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard,
    borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  rankNum: { fontSize: 15, fontWeight: '800', width: 22, textAlign: 'center' },
  rankAvatar: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center',
  },
  rankInfo: { flex: 1 },
  rankName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  rankBar: { height: 3, backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden' },
  rankBarFill: { height: '100%', borderRadius: 2 },
  rankScoreCol: { alignItems: 'flex-end' },
  rankScore: { fontSize: 18, fontWeight: '800' },
  rankChange: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  rankChangeText: { fontSize: 10, fontWeight: '700' },
});

export default LeaderboardScreen;
