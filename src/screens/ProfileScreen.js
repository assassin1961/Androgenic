import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, getScoreColor } from '../utils/theme';
import { getHistory } from '../utils/history';
import { isPro, isTrialActive, getTrialDaysLeft, loadProState } from '../utils/pro';
import { CATEGORY_INFO } from '../utils/faceAnalysis';

const ProfileScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    await loadProState();
    const history = await getHistory();
    if (history.length === 0) {
      setStats({ totalScans: 0 });
      return;
    }

    const latest = history[0].scores;
    const oldest = history[history.length - 1].scores;

    // Best scores across all scans
    const bestScores = {};
    const categories = ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry', 'overall'];
    categories.forEach((cat) => {
      bestScores[cat] = 0;
    });
    history.forEach((entry) => {
      categories.forEach((cat) => {
        if (entry.scores[cat] > bestScores[cat]) {
          bestScores[cat] = entry.scores[cat];
        }
      });
    });

    // Strongest and weakest
    const catScores = Object.entries(latest)
      .filter(([k]) => k !== 'overall' && k !== 'overallRating')
      .sort((a, b) => b[1] - a[1]);

    const strongest = catScores[0];
    const weakest = catScores[catScores.length - 1];

    // Average improvement
    let totalChange = 0;
    let changeCount = 0;
    if (history.length >= 2) {
      categories.filter(c => c !== 'overall').forEach((cat) => {
        if (latest[cat] !== undefined && oldest[cat] !== undefined) {
          totalChange += latest[cat] - oldest[cat];
          changeCount++;
        }
      });
    }

    setStats({
      totalScans: history.length,
      latestRating: latest.overallRating,
      latestOverall: latest.overall,
      bestOverall: bestScores.overall,
      bestRating: Math.max(1, Math.min(10, Math.round(bestScores.overall / 10))),
      strongest,
      weakest,
      avgChange: changeCount > 0 ? Math.round(totalChange / changeCount) : 0,
      bestScores,
      latest,
    });
  };

  const pro = isPro();
  const trial = isTrialActive();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.backBtn}>
          <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar / Status */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#fff" />
          </LinearGradient>
          {pro ? (
            <LinearGradient colors={GRADIENTS.gold} style={styles.statusBadge}>
              <Ionicons name="star" size={12} color="#000" />
              <Text style={styles.statusText}>{trial ? `Trial (${getTrialDaysLeft()}d)` : 'PRO'}</Text>
            </LinearGradient>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} style={styles.freeBadge}>
              <Text style={styles.freeText}>Free Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        {stats && stats.totalScans > 0 ? (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalScans}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: getScoreColor(stats.latestOverall) }]}>
                  {stats.latestRating}/10
                </Text>
                <Text style={styles.statLabel}>Latest Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.gold }]}>
                  {stats.bestRating}/10
                </Text>
                <Text style={styles.statLabel}>Best Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {
                  color: stats.avgChange > 0 ? COLORS.scoreHigh : stats.avgChange < 0 ? COLORS.scoreLow : COLORS.textMuted
                }]}>
                  {stats.avgChange > 0 ? '+' : ''}{stats.avgChange}
                </Text>
                <Text style={styles.statLabel}>Avg Change</Text>
              </View>
            </View>

            {/* Strengths */}
            {stats.strongest && (
              <View style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <Ionicons name="trending-up" size={20} color={COLORS.scoreHigh} />
                  <View style={styles.insightInfo}>
                    <Text style={styles.insightTitle}>Strongest Feature</Text>
                    <Text style={styles.insightValue}>
                      {CATEGORY_INFO[stats.strongest[0]]?.label || stats.strongest[0]} — {stats.strongest[1]}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {stats.weakest && (
              <View style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <Ionicons name="fitness" size={20} color={COLORS.scoreMid} />
                  <View style={styles.insightInfo}>
                    <Text style={styles.insightTitle}>Focus Area</Text>
                    <Text style={styles.insightValue}>
                      {CATEGORY_INFO[stats.weakest[0]]?.label || stats.weakest[0]} — {stats.weakest[1]}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* All-time Bests */}
            <Text style={styles.sectionTitle}>All-Time Best Scores</Text>
            <View style={styles.bestGrid}>
              {Object.entries(stats.bestScores)
                .filter(([k]) => k !== 'overall')
                .map(([cat, score]) => (
                  <View key={cat} style={styles.bestItem}>
                    <Ionicons name={CATEGORY_INFO[cat]?.icon || 'star'} size={16} color={getScoreColor(score)} />
                    <Text style={styles.bestLabel}>{CATEGORY_INFO[cat]?.label || cat}</Text>
                    <Text style={[styles.bestValue, { color: getScoreColor(score) }]}>{score}</Text>
                  </View>
                ))}
            </View>
          </>
        ) : (
          <View style={styles.noData}>
            <Ionicons name="analytics-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.noDataText}>Take your first scan to see stats</Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'camera', label: 'New Scan', screen: 'Home', color: COLORS.accent },
            { icon: 'time-outline', label: 'History', screen: 'History', color: COLORS.textSecondary },
            { icon: 'git-compare-outline', label: 'Compare', screen: 'Compare', color: COLORS.scoreMid },
            { icon: 'today-outline', label: 'Routine', screen: 'Routine', color: COLORS.scoreHigh },
            { icon: 'trending-up', label: 'Progress', screen: 'Progress', color: COLORS.accent },
            { icon: 'share-social-outline', label: 'Share', screen: stats?.totalScans > 0 ? 'Share' : null, color: COLORS.accentLight },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionItem}
              onPress={() => {
                if (action.screen === 'Share' && stats?.latest) {
                  navigation.navigate('Share', { scores: stats.latest });
                } else if (action.screen) {
                  navigation.navigate(action.screen);
                }
              }}
            >
              <Ionicons name={action.icon} size={22} color={action.color} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  freeBadge: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  freeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  insightCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  insightValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 10,
  },
  bestGrid: {
    gap: 6,
    marginBottom: 8,
  },
  bestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bestLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  bestValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '31%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  actionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ProfileScreen;
