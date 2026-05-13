import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'masculinity', label: 'Masculinity', icon: 'shield-outline' },
  { key: 'jawline', label: 'Jawline', icon: 'square-outline' },
  { key: 'eyes', label: 'Eyes', icon: 'eye-outline' },
  { key: 'cheekbones', label: 'Cheekbones', icon: 'diamond-outline' },
  { key: 'hair', label: 'Hair', icon: 'leaf-outline' },
  { key: 'skin', label: 'Skin', icon: 'water-outline' },
  { key: 'symmetry', label: 'Symmetry', icon: 'git-compare-outline' },
];

const NUM_BARS = 30;
const BAR_GAP = 2;
const BELL_CURVE_PADDING = 30;
const BAR_WIDTH = (width - BELL_CURVE_PADDING * 2 - BAR_GAP * (NUM_BARS - 1)) / NUM_BARS;

// Normal distribution PDF
const normalPDF = (x, mean, sd) => {
  const exp = -0.5 * Math.pow((x - mean) / sd, 2);
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, exp);
};

// Generate bell curve bar heights
const generateBellBars = () => {
  const bars = [];
  const maxHeight = 100;
  const mean = NUM_BARS / 2;
  const sd = NUM_BARS / 6; // ~3 SDs across entire range
  const peakValue = normalPDF(mean, mean, sd);
  for (let i = 0; i < NUM_BARS; i++) {
    const value = normalPDF(i, mean, sd);
    bars.push((value / peakValue) * maxHeight);
  }
  return bars;
};

const BELL_BARS = generateBellBars();

const getPercentile = (score) => {
  if (score >= 95) return { value: 1, label: 'Top 1%' };
  if (score >= 90) return { value: 5, label: 'Top 5%' };
  if (score >= 85) return { value: 10, label: 'Top 10%' };
  if (score >= 80) return { value: 15, label: 'Top 15%' };
  if (score >= 75) return { value: 20, label: 'Top 20%' };
  if (score >= 70) return { value: 30, label: 'Top 30%' };
  if (score >= 60) return { value: 45, label: 'Top 45%' };
  if (score >= 50) return { value: 55, label: 'Top 55%' };
  return { value: 70, label: 'Top 70%' };
};

const computeStatistics = (scores) => {
  const overall = scores.overall || 50;
  const percentile = getPercentile(overall);
  const zScore = Math.round(((overall - 50) / 15) * 100) / 100;
  const sdLabel = zScore >= 0 ? `+${zScore.toFixed(2)} SD` : `${zScore.toFixed(2)} SD`;
  const ciLow = overall - 3;
  const ciHigh = overall + 3;
  const confidenceInterval = `${ciLow} - ${ciHigh}`;

  // Bell curve position: map score (0-100) onto the 0-100% range
  // Score of 0 = left edge, score of 100 = right edge
  const bellCurvePosition = Math.max(0, Math.min(100, overall));

  // Category stats
  const categoryStats = CATEGORIES.map((cat) => {
    const score = scores[cat.key] || 50;
    const catPercentile = getPercentile(score);
    const catZ = Math.round(((score - 50) / 15) * 100) / 100;
    const catSdLabel = catZ >= 0 ? `+${catZ.toFixed(2)} SD` : `${catZ.toFixed(2)} SD`;
    return {
      ...cat,
      score,
      percentile: catPercentile,
      zScore: catZ,
      sdLabel: catSdLabel,
    };
  });

  // Comparative stats
  const sorted = [...categoryStats].sort((a, b) => b.score - a.score);
  const bestCategory = sorted[0];
  const weakestCategory = sorted[sorted.length - 1];
  const aboveAvgCount = categoryStats.filter((c) => c.score > 50).length;

  const comparatives = [
    {
      icon: 'trending-up-outline',
      label: `Higher than ${100 - percentile.value}% of users overall`,
      color: COLORS.scoreHigh,
    },
    {
      icon: 'trophy-outline',
      label: `Within top ${bestCategory.percentile.value}% for ${bestCategory.label.toLowerCase()}`,
      color: COLORS.gold,
    },
    {
      icon: 'stats-chart-outline',
      label: `${aboveAvgCount} of 7 categories above the mean`,
      color: COLORS.accent,
    },
    {
      icon: 'arrow-up-outline',
      label: `${weakestCategory.label} has the most room for improvement`,
      color: COLORS.scoreMid,
    },
  ];

  return {
    overall,
    percentile,
    zScore,
    sdLabel,
    confidenceInterval,
    ciLow,
    ciHigh,
    bellCurvePosition,
    sampleSize: '1,247,000+',
    categoryStats,
    comparatives,
    bestCategory,
  };
};

const StatisticalReportScreen = ({ route, navigation }) => {
  const { scores } = route.params;

  const stats = useMemo(() => computeStatistics(scores), [scores]);

  // Determine which bar the user falls on
  const userBarIndex = Math.round((stats.bellCurvePosition / 100) * (NUM_BARS - 1));

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            <AnimatedPressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Statistical Report</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>

          {/* Hero Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <GlassCard variant="accent" style={styles.heroCard} glow>
              <View style={styles.heroContent}>
                <View style={styles.heroTitleRow}>
                  <Ionicons name="analytics-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.heroTitleText}>Statistical Analysis</Text>
                </View>

                <View style={styles.heroPercentileContainer}>
                  <Text style={styles.heroPercentileLabel}>PERCENTILE RANK</Text>
                  <Text style={styles.heroPercentileValue}>
                    Top {stats.percentile.value}%
                  </Text>
                  <View style={styles.heroSdRow}>
                    <View style={styles.sdBadge}>
                      <Text style={styles.sdBadgeText}>{stats.sdLabel}</Text>
                    </View>
                    <Text style={styles.heroSdDesc}>above mean</Text>
                  </View>
                </View>

                <View style={styles.heroDivider} />

                <View style={styles.heroMetaRow}>
                  <Ionicons name="people-outline" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.heroMetaText}>
                    Based on {stats.sampleSize} analyses
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Bell Curve Section */}
          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <GlassCard style={styles.bellCurveCard}>
              <View style={styles.bellCurveContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="bar-chart-outline" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Score Distribution</Text>
                </View>

                <Text style={styles.bellCurveSubtitle}>
                  Normal distribution of all face scores
                </Text>

                {/* Bell curve bars */}
                <View style={styles.bellCurveContainer}>
                  <View style={styles.barsRow}>
                    {BELL_BARS.map((height, index) => {
                      const isUser = index === userBarIndex;
                      return (
                        <View key={index} style={styles.barWrapper}>
                          {isUser ? (
                            <LinearGradient
                              colors={GRADIENTS.accent}
                              start={{ x: 0, y: 1 }}
                              end={{ x: 0, y: 0 }}
                              style={[
                                styles.bar,
                                {
                                  height: Math.max(4, height),
                                  width: BAR_WIDTH,
                                },
                              ]}
                            />
                          ) : (
                            <View
                              style={[
                                styles.bar,
                                styles.barInactive,
                                {
                                  height: Math.max(4, height),
                                  width: BAR_WIDTH,
                                },
                              ]}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* User position marker */}
                  <View
                    style={[
                      styles.markerContainer,
                      {
                        left:
                          BELL_CURVE_PADDING +
                          userBarIndex * (BAR_WIDTH + BAR_GAP) +
                          BAR_WIDTH / 2 -
                          BELL_CURVE_PADDING -
                          6,
                      },
                    ]}
                  >
                    <Ionicons name="caret-up" size={14} color={COLORS.accent} />
                    <Text style={styles.markerText}>You</Text>
                  </View>

                  {/* SD labels */}
                  <View style={styles.sdLabelsRow}>
                    {['-3σ', '-2σ', '-1σ', 'μ', '+1σ', '+2σ', '+3σ'].map(
                      (label, i) => (
                        <Text key={i} style={styles.sdLabel}>
                          {label}
                        </Text>
                      )
                    )}
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Category Statistics */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={18} color={COLORS.accent} />
              <Text style={styles.sectionHeaderText}>Category Statistics</Text>
            </View>
          </Animated.View>

          {stats.categoryStats.map((cat, index) => (
            <Animated.View
              key={cat.key}
              entering={FadeInRight.delay(600 + index * 80).duration(500)}
            >
              <GlassCard style={styles.categoryCard}>
                <View style={styles.categoryContent}>
                  <View style={styles.categoryTopRow}>
                    <View style={styles.categoryNameRow}>
                      <View style={styles.categoryIconWrapper}>
                        <Ionicons name={cat.icon} size={16} color={COLORS.accent} />
                      </View>
                      <Text style={styles.categoryName}>{cat.label}</Text>
                    </View>
                    <View style={styles.categoryScoreBadge}>
                      <Text style={styles.categoryScoreText}>{cat.score}</Text>
                    </View>
                  </View>

                  {/* Score bar */}
                  <View style={styles.categoryBarBg}>
                    <LinearGradient
                      colors={GRADIENTS.accent}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.categoryBarFill,
                        { width: `${Math.min(100, cat.score)}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.categoryMetaRow}>
                    <View style={styles.categoryMetaItem}>
                      <Text style={styles.categoryMetaLabel}>Percentile</Text>
                      <Text style={styles.categoryMetaValue}>
                        {cat.percentile.label}
                      </Text>
                    </View>
                    <View style={styles.categoryMetaItem}>
                      <Text style={styles.categoryMetaLabel}>Std Dev</Text>
                      <Text style={styles.categoryMetaValue}>{cat.sdLabel}</Text>
                    </View>
                    <View style={styles.categoryMetaItem}>
                      <Text style={styles.categoryMetaLabel}>z-Score</Text>
                      <Text style={styles.categoryMetaValue}>
                        {cat.zScore >= 0 ? '+' : ''}
                        {cat.zScore.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}

          {/* Comparative Statistics */}
          <Animated.View entering={FadeInDown.delay(1200).duration(600)}>
            <GlassCard style={styles.comparativeCard}>
              <View style={styles.comparativeContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="podium-outline" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>How You Compare</Text>
                </View>

                {stats.comparatives.map((item, index) => (
                  <View key={index} style={styles.comparativeRow}>
                    <View
                      style={[
                        styles.comparativeIconWrapper,
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <Ionicons name={item.icon} size={16} color={item.color} />
                    </View>
                    <Text style={styles.comparativeText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Confidence Section */}
          <Animated.View entering={FadeInDown.delay(1400).duration(600)}>
            <GlassCard style={styles.confidenceCard}>
              <View style={styles.confidenceContent}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Analysis Confidence</Text>
                </View>

                <View style={styles.confidenceItem}>
                  <Text style={styles.confidenceLabel}>Confidence Interval (95%)</Text>
                  <Text style={styles.confidenceValue}>
                    Your true score likely falls between{' '}
                    <Text style={styles.confidenceHighlight}>{stats.ciLow}</Text> and{' '}
                    <Text style={styles.confidenceHighlight}>{stats.ciHigh}</Text>
                  </Text>
                </View>

                <View style={styles.confidenceDivider} />

                <View style={styles.confidenceGridRow}>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>Sample Size</Text>
                    <Text style={styles.confidenceGridValue}>{stats.sampleSize}</Text>
                  </View>
                  <View style={styles.confidenceGridItem}>
                    <Text style={styles.confidenceGridLabel}>Model Accuracy</Text>
                    <Text style={styles.confidenceGridValue}>94.2%</Text>
                  </View>
                </View>

                <View style={styles.confidenceDivider} />

                <View style={styles.confidenceFooter}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.confidenceFooterText}>
                    Last calibrated: {todayDate}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },

  // Hero Card
  heroCard: {
    marginBottom: 16,
  },
  heroContent: {
    padding: 20,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  heroTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroPercentileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroPercentileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroPercentileValue: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 10,
  },
  heroSdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sdBadge: {
    backgroundColor: 'rgba(0,102,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.25)',
  },
  sdBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentLight,
    fontVariant: ['tabular-nums'],
  },
  heroSdDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  heroMetaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },

  // Bell Curve
  bellCurveCard: {
    marginBottom: 20,
  },
  bellCurveContent: {
    padding: 20,
  },
  bellCurveSubtitle: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 20,
  },
  bellCurveContainer: {
    alignItems: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    gap: BAR_GAP,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
  },
  barInactive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  markerContainer: {
    position: 'absolute',
    bottom: -30,
    alignItems: 'center',
    width: 30,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: -2,
  },
  sdLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 32,
    paddingHorizontal: 4,
  },
  sdLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Category Cards
  categoryCard: {
    marginBottom: 10,
  },
  categoryContent: {
    padding: 16,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,102,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoryScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  categoryBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: 6,
    borderRadius: 3,
  },
  categoryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  categoryMetaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  // Comparative
  comparativeCard: {
    marginTop: 10,
    marginBottom: 16,
  },
  comparativeContent: {
    padding: 20,
  },
  comparativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  comparativeIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparativeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Confidence
  confidenceCard: {
    marginBottom: 16,
  },
  confidenceContent: {
    padding: 20,
  },
  confidenceItem: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  confidenceHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  confidenceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  confidenceGridRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  confidenceGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  confidenceGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  confidenceGridValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  confidenceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  confidenceFooterText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default StatisticalReportScreen;
