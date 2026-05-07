import React, { useState, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, getScoreColor } from '../utils/theme';
import { getHistory, clearHistory } from '../utils/history';
import { isPro, PRO_CONFIG } from '../utils/pro';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const HistoryRow = memo(({ entry, onPress, index }) => {
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View entering={FadeInRight.duration(300).delay(index * 60)}>
      <AnimatedPressable onPress={onPress}>
        <GlassCard style={styles.historyCard}>
          <Image source={{ uri: entry.imageUri }} style={styles.historyPhoto} />
          <View style={styles.historyInfo}>
            <Text style={styles.historyDate}>{dateStr} at {timeStr}</Text>
            <View style={styles.historyScores}>
              <Text style={[styles.historyOverall, { color: getScoreColor(entry.scores.overall) }]}>
                {entry.scores.overallRating}/10
              </Text>
              <Text style={styles.historyOverallLabel}>Overall</Text>
            </View>
            <View style={styles.miniScores}>
              {['masculinity', 'jawline', 'eyes'].map((cat) => (
                <View key={cat} style={styles.miniScore}>
                  <View style={[styles.miniDot, { backgroundColor: getScoreColor(entry.scores[cat]) }]} />
                  <Text style={styles.miniLabel}>{cat.slice(0, 3).toUpperCase()}</Text>
                  <Text style={[styles.miniValue, { color: getScoreColor(entry.scores[cat]) }]}>
                    {entry.scores[cat]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
});

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Clear History', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  };

  const pro = isPro();
  const displayHistory = pro ? history : history.slice(0, PRO_CONFIG.freeHistoryLimit);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>History</Text>
          {history.length > 0 ? (
            <AnimatedPressable onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={COLORS.scoreLow} />
            </AnimatedPressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats Row */}
          {history.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={styles.statsRow}>
                <GlassCard style={styles.statCard}>
                  <Text style={[styles.statNum, { color: COLORS.accent }]}>{history.length}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </GlassCard>
                <GlassCard style={styles.statCard}>
                  <Text style={[styles.statNum, { color: COLORS.scoreHigh }]}>
                    {history.length > 0 ? Math.max(...history.map(h => h.scores.overallRating || 0)) : 0}
                  </Text>
                  <Text style={styles.statLabel}>Best Score</Text>
                </GlassCard>
                <GlassCard style={styles.statCard}>
                  <Text style={[styles.statNum, { color: COLORS.purple }]}>
                    {history.length > 0 ? (history.reduce((s, h) => s + (h.scores.overallRating || 0), 0) / history.length).toFixed(1) : 0}
                  </Text>
                  <Text style={styles.statLabel}>Average</Text>
                </GlassCard>
              </View>
            </Animated.View>
          )}

          {displayHistory.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptyText}>Your scan results will appear here</Text>
            </Animated.View>
          ) : (
            displayHistory.map((entry, i) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                index={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Results', { scores: entry.scores, imageUri: entry.imageUri });
                }}
              />
            ))
          )}

          {!pro && history.length > PRO_CONFIG.freeHistoryLimit && (
            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <GlassCard variant="gold" style={styles.proCard}>
                  <Ionicons name="lock-closed" size={18} color={COLORS.gold} />
                  <Text style={styles.proCardText}>
                    +{history.length - PRO_CONFIG.freeHistoryLimit} more entries with PRO
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
                </GlassCard>
              </AnimatedPressable>
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
  clearBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,80,80,0.08)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,80,80,0.15)',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  historyCard: {
    padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  historyPhoto: { width: 52, height: 52, borderRadius: 26 },
  historyInfo: { flex: 1 },
  historyDate: { color: COLORS.textMuted, fontSize: 10, marginBottom: 3 },
  historyScores: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 3 },
  historyOverall: { fontSize: 18, fontWeight: '800' },
  historyOverallLabel: { color: COLORS.textMuted, fontSize: 10 },
  miniScores: { flexDirection: 'row', gap: 10 },
  miniScore: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniDot: { width: 5, height: 5, borderRadius: 3 },
  miniLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600' },
  miniValue: { fontSize: 10, fontWeight: '700' },
  proCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, gap: 8, marginTop: 8,
  },
  proCardText: { color: COLORS.gold, fontSize: 13, fontWeight: '600', flex: 1 },
});

export default HistoryScreen;
