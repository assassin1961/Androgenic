import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, getScoreColor } from '../utils/theme';
import { getProgressData } from '../utils/history';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const ProgressScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = useCallback(async () => {
    const data = await getProgressData();
    setProgress(data);
  }, []);

  useEffect(() => { loadProgress(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadProgress();
    setRefreshing(false);
  }, [loadProgress]);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Progress</Text>
          <AnimatedPressable onPress={() => navigation.navigate('ProgressTimeline')} style={styles.backBtn}>
            <Ionicons name="git-branch" size={18} color={COLORS.accent} />
          </AnimatedPressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={COLORS.accent} colors={[COLORS.accent]} progressBackgroundColor="#000" />
          }
        >
          {!progress ? (
            <Animated.View entering={ZoomIn.duration(400)} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="analytics-outline" size={40} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Not Enough Data</Text>
              <Text style={styles.emptyText}>Complete at least 2 scans to see your progress</Text>
              <GlassButton
                title="Take a Scan"
                icon="camera"
                onPress={() => navigation.navigate('Home')}
                style={{ marginTop: 20, width: 200 }}
              />
            </Animated.View>
          ) : (
            <>
              {/* Summary */}
              <Animated.View entering={FadeInDown.duration(400)}>
                <GlassCard variant="accent" style={styles.summaryCard} glow>
                  <Text style={styles.summaryLabel}>Total Scans</Text>
                  <Text style={styles.summaryValue}>{progress.totalScans}</Text>
                </GlassCard>
              </Animated.View>

              {/* Quick Actions */}
              <Animated.View entering={FadeInDown.duration(400).delay(80)}>
                <View style={styles.quickRow}>
                  <AnimatedPressable onPress={() => navigation.navigate('ProgressTimeline')} style={{ flex: 1 }}>
                    <GlassCard variant="default" style={styles.quickCard}>
                      <Ionicons name="git-branch" size={18} color={COLORS.accent} />
                      <Text style={styles.quickText}>Timeline</Text>
                    </GlassCard>
                  </AnimatedPressable>
                  <AnimatedPressable onPress={() => navigation.navigate('BeforeAfter')} style={{ flex: 1 }}>
                    <GlassCard variant="default" style={styles.quickCard}>
                      <Ionicons name="images" size={18} color={COLORS.purple} />
                      <Text style={styles.quickText}>Before/After</Text>
                    </GlassCard>
                  </AnimatedPressable>
                  <AnimatedPressable onPress={() => navigation.navigate('WeeklyInsights')} style={{ flex: 1 }}>
                    <GlassCard variant="default" style={styles.quickCard}>
                      <Ionicons name="bar-chart" size={18} color={COLORS.scoreHigh} />
                      <Text style={styles.quickText}>Insights</Text>
                    </GlassCard>
                  </AnimatedPressable>
                </View>
              </Animated.View>

              {/* Category Trends */}
              <Text style={styles.sectionTitle}>Category Trends</Text>
              {Object.entries(progress.trends)
                .filter(([key]) => key !== 'overall')
                .map(([key, data], i) => {
                  const info = CATEGORY_INFO[key];
                  if (!info) return null;
                  const changeColor = data.change > 0 ? COLORS.scoreHigh : data.change < 0 ? COLORS.scoreLow : COLORS.textMuted;
                  return (
                    <Animated.View key={key} entering={FadeInRight.duration(300).delay(160 + i * 60)}>
                      <GlassCard variant="default" style={styles.trendCard}>
                        <View style={styles.trendHeader}>
                          <View style={[styles.trendIcon, { backgroundColor: getScoreColor(data.current) + '15' }]}>
                            <Ionicons name={info.icon} size={16} color={getScoreColor(data.current)} />
                          </View>
                          <Text style={styles.trendLabel}>{info.label}</Text>
                          <View style={[styles.trendChange, { backgroundColor: changeColor + '15' }]}>
                            <Ionicons name={data.change > 0 ? 'arrow-up' : data.change < 0 ? 'arrow-down' : 'remove'} size={12} color={changeColor} />
                            <Text style={[styles.trendChangeText, { color: changeColor }]}>
                              {data.change > 0 ? '+' : ''}{data.change}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.trendBarTrack}>
                          <View style={[styles.trendBarPrev, { width: `${data.previous}%` }]} />
                          <Animated.View
                            entering={FadeInDown.duration(500).delay(300 + i * 60)}
                            style={[styles.trendBarCurrent, { width: `${data.current}%`, backgroundColor: getScoreColor(data.current) }]}
                          />
                        </View>
                        <View style={styles.trendValues}>
                          <Text style={styles.trendPrevValue}>Before: {data.previous}</Text>
                          <Text style={[styles.trendCurrentValue, { color: getScoreColor(data.current) }]}>Now: {data.current}</Text>
                        </View>
                      </GlassCard>
                    </Animated.View>
                  );
                })}

              {/* Overall */}
              {progress.trends.overall && (
                <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                  <GlassCard variant="accent" style={styles.overallCard} glow>
                    <View style={styles.trendHeader}>
                      <View style={[styles.trendIcon, { backgroundColor: COLORS.accent + '15' }]}>
                        <Ionicons name="star" size={16} color={COLORS.accent} />
                      </View>
                      <Text style={styles.trendLabel}>Overall</Text>
                      <View style={[styles.trendChange, {
                        backgroundColor: (progress.trends.overall.change >= 0 ? COLORS.scoreHigh : COLORS.scoreLow) + '15'
                      }]}>
                        <Ionicons
                          name={progress.trends.overall.change > 0 ? 'arrow-up' : progress.trends.overall.change < 0 ? 'arrow-down' : 'remove'}
                          size={12}
                          color={progress.trends.overall.change > 0 ? COLORS.scoreHigh : progress.trends.overall.change < 0 ? COLORS.scoreLow : COLORS.textMuted}
                        />
                        <Text style={[styles.trendChangeText, {
                          color: progress.trends.overall.change > 0 ? COLORS.scoreHigh : progress.trends.overall.change < 0 ? COLORS.scoreLow : COLORS.textMuted
                        }]}>
                          {progress.trends.overall.change > 0 ? '+' : ''}{progress.trends.overall.change}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.overallScores}>
                      <View style={styles.overallScoreItem}>
                        <Text style={styles.overallScoreLabel}>First Scan</Text>
                        <Text style={styles.overallScoreValue}>{progress.trends.overall.previous}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.textMuted} />
                      <View style={styles.overallScoreItem}>
                        <Text style={styles.overallScoreLabel}>Latest</Text>
                        <Text style={[styles.overallScoreValue, { color: getScoreColor(progress.trends.overall.current) }]}>
                          {progress.trends.overall.current}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>
              )}
            </>
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

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 260 },

  summaryCard: { padding: 20, alignItems: 'center', marginBottom: 16 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  summaryValue: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '800' },

  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickCard: { padding: 14, alignItems: 'center', gap: 6 },
  quickText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.3 },

  trendCard: { padding: 14, marginBottom: 8 },
  trendHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  trendIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  trendLabel: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  trendChange: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  trendChangeText: { fontSize: 12, fontWeight: '700' },
  trendBarTrack: { height: 5, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 6, position: 'relative' },
  trendBarPrev: { position: 'absolute', height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3 },
  trendBarCurrent: { height: '100%', borderRadius: 3 },
  trendValues: { flexDirection: 'row', justifyContent: 'space-between' },
  trendPrevValue: { color: COLORS.textMuted, fontSize: 11 },
  trendCurrentValue: { fontSize: 12, fontWeight: '700' },

  overallCard: { padding: 16, marginTop: 8 },
  overallScores: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 4 },
  overallScoreItem: { alignItems: 'center' },
  overallScoreLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  overallScoreValue: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
});

export default ProgressScreen;
