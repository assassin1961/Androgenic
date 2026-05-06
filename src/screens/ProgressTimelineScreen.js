import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Image, RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../utils/theme';
import { getHistory } from '../utils/history';
import { getScoreColor } from '../utils/theme';

const { width } = Dimensions.get('window');

const TimelineNode = memo(({ entry, index, isLatest }) => {
  const score = entry.scores?.overall || 0;
  const color = getScoreColor(score);
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 80)}>
      <View style={styles.timelineRow}>
        <View style={styles.timelineLeft}>
          <Text style={styles.timelineDate}>{dateStr}</Text>
          <Text style={styles.timelineTime}>{timeStr}</Text>
        </View>

        <View style={styles.timelineLine}>
          <View style={[styles.timelineDot, { backgroundColor: color }, isLatest && styles.timelineDotLatest]} />
          {!isLatest && <View style={styles.timelineConnector} />}
        </View>

        <GlassCard variant={isLatest ? 'accent' : 'default'} style={styles.timelineCard} glow={isLatest}>
          <View style={styles.cardRow}>
            {entry.imageUri && (
              <Image source={{ uri: entry.imageUri }} style={styles.cardThumb} />
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardScoreRow}>
                <Text style={[styles.cardScore, { color }]}>{score}</Text>
                <Text style={styles.cardScoreLabel}>/100</Text>
                {entry.scores?.overallRating && (
                  <View style={[styles.ratingPill, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.ratingText, { color }]}>{entry.scores.overallRating}/10</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardCategories}>
                {Object.entries(entry.scores || {})
                  .filter(([k]) => !['overall', 'overallRating'].includes(k))
                  .slice(0, 4)
                  .map(([key, val]) => (
                    <View key={key} style={styles.miniBar}>
                      <Text style={styles.miniLabel}>{key.slice(0, 3)}</Text>
                      <View style={styles.miniTrack}>
                        <View style={[styles.miniFill, { width: `${val}%`, backgroundColor: getScoreColor(val) }]} />
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          </View>
        </GlassCard>
      </View>
    </Animated.View>
  );
});

const ProgressTimelineScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ best: 0, avg: 0, total: 0, change: 0 });

  const loadData = useCallback(async () => {
    const h = await getHistory();
    if (h && h.length > 0) {
      setHistory(h);
      const scores = h.map(e => e.scores?.overall || 0);
      const best = Math.max(...scores);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const change = scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 0;
      setStats({ best, avg, total: h.length, change });
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Progress Timeline</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor="#000" />
          }
        >
          {/* Stats Row */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.statsRow}>
            {[
              { label: 'Best', value: stats.best, color: COLORS.scoreHigh, icon: 'trophy' },
              { label: 'Average', value: stats.avg, color: COLORS.accent, icon: 'analytics' },
              { label: 'Total', value: stats.total, color: COLORS.purple, icon: 'camera' },
              { label: 'Change', value: `${stats.change > 0 ? '+' : ''}${stats.change}`, color: stats.change >= 0 ? COLORS.scoreHigh : COLORS.scoreLow, icon: 'trending-up' },
            ].map((s, i) => (
              <GlassCard key={i} variant="default" style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                  <Ionicons name={s.icon} size={14} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </Animated.View>

          {/* Score Trend Visual */}
          {history.length >= 2 && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <GlassCard variant="default" style={styles.trendCard}>
                <Text style={styles.trendTitle}>Score Trend</Text>
                <View style={styles.trendGraph}>
                  {history.slice(0, 10).reverse().map((entry, i) => {
                    const score = entry.scores?.overall || 0;
                    const h = Math.max((score / 100) * 80, 8);
                    return (
                      <Animated.View
                        key={i}
                        entering={FadeInDown.duration(300).delay(200 + i * 50)}
                        style={styles.trendBarWrap}
                      >
                        <View style={[styles.trendBar, { height: h, backgroundColor: getScoreColor(score) }]} />
                        <Text style={styles.trendBarLabel}>{score}</Text>
                      </Animated.View>
                    );
                  })}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Timeline */}
          {history.length > 0 ? (
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              {history.map((entry, i) => (
                <TimelineNode key={entry.date || i} entry={entry} index={i} isLatest={i === 0} />
              ))}
            </View>
          ) : (
            <Animated.View entering={ZoomIn.duration(400)} style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="camera-outline" size={40} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Scans Yet</Text>
              <Text style={styles.emptyText}>Take your first face scan to start tracking your progress over time</Text>
              <GlassButton
                title="Take First Scan"
                icon="camera"
                onPress={() => navigation.navigate('Home')}
                style={{ marginTop: 20, width: 200 }}
              />
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

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 12 },
  statIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  trendCard: { padding: 16, marginBottom: 16 },
  trendTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  trendGraph: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100 },
  trendBarWrap: { flex: 1, alignItems: 'center' },
  trendBar: { width: '100%', borderRadius: 4, minWidth: 8 },
  trendBarLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', marginTop: 4 },

  timelineSection: { marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 16, letterSpacing: 0.3 },

  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { width: 52, paddingTop: 8, alignItems: 'flex-end', paddingRight: 10 },
  timelineDate: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  timelineTime: { fontSize: 9, color: COLORS.textMuted, marginTop: 1 },
  timelineLine: { width: 24, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 10 },
  timelineDotLatest: { width: 14, height: 14, borderRadius: 7, ...SHADOWS.glow },
  timelineConnector: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4 },

  timelineCard: { flex: 1, padding: 12, marginBottom: 8 },
  cardRow: { flexDirection: 'row', gap: 10 },
  cardThumb: { width: 48, height: 48, borderRadius: 10 },
  cardContent: { flex: 1 },
  cardScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 6 },
  cardScore: { fontSize: 22, fontWeight: '900' },
  cardScoreLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  ratingPill: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '700' },

  cardCategories: { gap: 3 },
  miniBar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniLabel: { fontSize: 8, color: COLORS.textMuted, fontWeight: '600', width: 22, textTransform: 'uppercase' },
  miniTrack: { flex: 1, height: 3, backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 19, maxWidth: 260 },
});

export default ProgressTimelineScreen;
