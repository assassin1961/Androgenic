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

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const getScoreColor = (score) => {
  if (score >= 80) return '#00e676';
  if (score >= 60) return '#0066ff';
  if (score >= 40) return '#ffab40';
  return '#ff5252';
};

const scoreToPercentile = (score) => clamp(Math.round(100 - score * 0.85 - 3), 1, 99);

const generateDemographicData = (scores) => {
  const overall = scores.overall || 50;
  const masculinity = scores.masculinity || 50;
  const jawline = scores.jawline || 50;
  const eyes = scores.eyes || 50;
  const cheekbones = scores.cheekbones || 50;
  const hair = scores.hair || 50;
  const skin = scores.skin || 50;
  const symmetry = scores.symmetry || 50;

  // --- Gender Perception ---
  // Women 18-29 weight jawline/eyes higher
  const women1829Score = clamp(
    Math.round(overall + (jawline - 50) * 0.12 + (eyes - 50) * 0.14 + 3),
    0, 100,
  );
  // Women 30-49 weight symmetry/skin more
  const women3049Score = clamp(
    Math.round(overall + (symmetry - 50) * 0.10 + (skin - 50) * 0.10 - 2),
    0, 100,
  );
  // Men 18-29 weight masculinity higher
  const men1829Score = clamp(
    Math.round(overall + (masculinity - 50) * 0.16 - 5),
    0, 100,
  );
  // Men 30-49 weight symmetry/skin more
  const men3049Score = clamp(
    Math.round(overall + (symmetry - 50) * 0.12 + (skin - 50) * 0.08 - 3),
    0, 100,
  );

  const genderPerception = [
    { group: 'Women 18-29', score: women1829Score, percentile: scoreToPercentile(women1829Score), icon: 'woman-outline' },
    { group: 'Women 30-49', score: women3049Score, percentile: scoreToPercentile(women3049Score), icon: 'woman-outline' },
    { group: 'Men 18-29', score: men1829Score, percentile: scoreToPercentile(men1829Score), icon: 'man-outline' },
    { group: 'Men 30-49', score: men3049Score, percentile: scoreToPercentile(men3049Score), icon: 'man-outline' },
  ];

  // --- Age Group Perception ---
  // Younger groups: hair/eyes/skin. Older groups: bone structure/symmetry.
  const age1824Score = clamp(
    Math.round(overall + (hair - 50) * 0.10 + (eyes - 50) * 0.10 + (skin - 50) * 0.08 + 5),
    0, 100,
  );
  const age2534Score = clamp(
    Math.round(overall + (eyes - 50) * 0.08 + (skin - 50) * 0.06 + (jawline - 50) * 0.06 + 2),
    0, 100,
  );
  const age3544Score = clamp(
    Math.round(overall + (jawline - 50) * 0.08 + (cheekbones - 50) * 0.08 + (symmetry - 50) * 0.06 - 1),
    0, 100,
  );
  const age45Score = clamp(
    Math.round(overall + (symmetry - 50) * 0.12 + (cheekbones - 50) * 0.10 + (jawline - 50) * 0.06 - 4),
    0, 100,
  );

  const ageGroupPerception = [
    { group: '18-24', score: age1824Score, percentile: scoreToPercentile(age1824Score), emoji: '🎓' },
    { group: '25-34', score: age2534Score, percentile: scoreToPercentile(age2534Score), emoji: '💼' },
    { group: '35-44', score: age3544Score, percentile: scoreToPercentile(age3544Score), emoji: '🏠' },
    { group: '45+', score: age45Score, percentile: scoreToPercentile(age45Score), emoji: '👔' },
  ];

  // --- Regional Perception ---
  // Western: jaw/eyes
  const westernScore = clamp(
    Math.round(overall + (jawline - 50) * 0.12 + (eyes - 50) * 0.10 + 2),
    0, 100,
  );
  // East Asian: skin/symmetry
  const eastAsianScore = clamp(
    Math.round(overall + (skin - 50) * 0.14 + (symmetry - 50) * 0.10 + 1),
    0, 100,
  );
  // South Asian: eyes/hair
  const southAsianScore = clamp(
    Math.round(overall + (eyes - 50) * 0.10 + (hair - 50) * 0.10 - 1),
    0, 100,
  );
  // Middle Eastern: masculinity/jawline
  const middleEasternScore = clamp(
    Math.round(overall + (masculinity - 50) * 0.12 + (jawline - 50) * 0.08 + 3),
    0, 100,
  );
  // African: cheekbones/symmetry
  const africanScore = clamp(
    Math.round(overall + (cheekbones - 50) * 0.12 + (symmetry - 50) * 0.08),
    0, 100,
  );
  // Latin American: overall balance — eyes/skin
  const latinScore = clamp(
    Math.round(overall + (eyes - 50) * 0.08 + (skin - 50) * 0.08 + 1),
    0, 100,
  );

  const regionalPerception = [
    { region: 'Western', score: westernScore, icon: 'globe-outline', color: '#0066ff' },
    { region: 'East Asian', score: eastAsianScore, icon: 'globe-outline', color: '#ff6090' },
    { region: 'South Asian', score: southAsianScore, icon: 'globe-outline', color: '#ffab40' },
    { region: 'Middle Eastern', score: middleEasternScore, icon: 'globe-outline', color: '#00e676' },
    { region: 'African', score: africanScore, icon: 'globe-outline', color: '#7c4dff' },
    { region: 'Latin American', score: latinScore, icon: 'globe-outline', color: '#ff6b35' },
  ];

  // --- Strongest / Weakest ---
  const allDemographics = [
    ...genderPerception.map((g) => ({ label: g.group, score: g.score })),
    ...ageGroupPerception.map((a) => ({ label: `Age ${a.group}`, score: a.score })),
    ...regionalPerception.map((r) => ({ label: r.region, score: r.score })),
  ];

  allDemographics.sort((a, b) => b.score - a.score);
  const strongestDemographic = allDemographics[0];
  const weakestDemographic = allDemographics[allDemographics.length - 1];

  return {
    genderPerception,
    ageGroupPerception,
    regionalPerception,
    strongestDemographic,
    weakestDemographic,
  };
};

const getInsights = (data, scores) => {
  const { strongestDemographic, weakestDemographic, genderPerception, regionalPerception } = data;
  const spread = strongestDemographic.score - weakestDemographic.score;
  const insights = [];

  insights.push(
    `Your highest appeal is with ${strongestDemographic.label} (score ${strongestDemographic.score}). This demographic values your strongest facial features the most.`,
  );

  insights.push(
    `Your lowest-rated demographic is ${weakestDemographic.label} (score ${weakestDemographic.score}). Focusing on ${scores.symmetry < scores.jawline ? 'symmetry and skin quality' : 'jawline definition and eye area'} could help close this gap.`,
  );

  if (spread <= 8) {
    insights.push(
      'Your appeal is remarkably consistent across demographics, with only a ' + spread + '-point spread. This indicates well-balanced, universally attractive features.',
    );
  } else {
    insights.push(
      'There is a ' + spread + '-point spread between your highest and lowest demographics. This suggests your features are polarizing — some groups find you significantly more attractive than others.',
    );
  }

  const topRegion = [...regionalPerception].sort((a, b) => b.score - a.score)[0];
  insights.push(
    `Regionally, you score highest in ${topRegion.region} beauty standards (${topRegion.score}). Consider tailoring grooming and styling to emphasize this advantage.`,
  );

  return insights;
};

const DemographicInsightsScreen = ({ route, navigation }) => {
  const { scores } = route.params;

  const data = useMemo(() => generateDemographicData(scores), [scores]);
  const insights = useMemo(() => getInsights(data, scores), [data, scores]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <GlassBackground variant="purple">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <AnimatedPressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Demographic Insights</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <GlassCard variant="accent" glow style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroSubtitle}>How the world sees you</Text>
                <Text style={styles.heroScore}>{scores.overall || 50}</Text>
                <Text style={styles.heroScoreLabel}>Overall Attractiveness</Text>
                <View style={styles.heroDivider} />
                <View style={styles.heroHighlight}>
                  <Ionicons name="star" size={18} color={COLORS.gold} />
                  <Text style={styles.heroHighlightText}>
                    Most attractive to: <Text style={styles.heroHighlightGroup}>{data.strongestDemographic.label}</Text>
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Section 1: Gender & Age Perception */}
          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <Text style={styles.sectionTitle}>Gender & Age Perception</Text>
          </Animated.View>
          {data.genderPerception.map((item, idx) => {
            const color = getScoreColor(item.score);
            return (
              <Animated.View
                key={item.group}
                entering={FadeInRight.duration(400).delay(350 + idx * 100)}
                style={styles.barCard}
              >
                <View style={styles.barHeader}>
                  <View style={styles.barLabelRow}>
                    <Ionicons name={item.icon} size={18} color={COLORS.textSecondary} />
                    <Text style={styles.barGroupName}>{item.group}</Text>
                  </View>
                  <View style={styles.barScoreRow}>
                    <Text style={[styles.barScore, { color }]}>{item.score}</Text>
                    <Text style={styles.barPercentile}>Top {item.percentile}%</Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={[color, color + '88']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${item.score}%` }]}
                  />
                </View>
              </Animated.View>
            );
          })}

          {/* Section 2: Age Group Perception */}
          <Animated.View entering={FadeInDown.duration(400).delay(750)}>
            <Text style={styles.sectionTitle}>Age Group Perception</Text>
          </Animated.View>
          {data.ageGroupPerception.map((item, idx) => {
            const color = getScoreColor(item.score);
            return (
              <Animated.View
                key={item.group}
                entering={FadeInRight.duration(400).delay(850 + idx * 100)}
                style={styles.barCard}
              >
                <View style={styles.barHeader}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barEmoji}>{item.emoji}</Text>
                    <Text style={styles.barGroupName}>{item.group}</Text>
                  </View>
                  <View style={styles.barScoreRow}>
                    <Text style={[styles.barScore, { color }]}>{item.score}</Text>
                    <Text style={styles.barPercentile}>Top {item.percentile}%</Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={[color, color + '88']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${item.score}%` }]}
                  />
                </View>
              </Animated.View>
            );
          })}

          {/* Section 3: Regional Perception */}
          <Animated.View entering={FadeInDown.duration(400).delay(1250)}>
            <Text style={styles.sectionTitle}>Regional Perception</Text>
          </Animated.View>
          <View style={styles.regionGrid}>
            {data.regionalPerception.map((item, idx) => (
              <Animated.View
                key={item.region}
                entering={FadeInDown.duration(400).delay(1350 + idx * 80)}
                style={styles.regionCardWrapper}
              >
                <GlassCard style={styles.regionCard}>
                  <View style={styles.regionContent}>
                    <View style={[styles.regionAccentBar, { backgroundColor: item.color }]} />
                    <Ionicons name={item.icon} size={22} color={item.color} style={styles.regionIcon} />
                    <Text style={styles.regionName}>{item.region}</Text>
                    <Text style={[styles.regionScore, { color: item.color }]}>{item.score}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </View>

          {/* Section 4: Key Insights */}
          <Animated.View entering={FadeInDown.duration(400).delay(1700)}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            <GlassCard variant="premium" style={styles.insightsCard}>
              <View style={styles.insightsContent}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="bulb-outline" size={22} color={COLORS.accent} />
                  <Text style={styles.insightsTitle}>Analysis</Text>
                </View>
                {insights.map((insight, idx) => (
                  <View key={idx} style={styles.insightRow}>
                    <View style={styles.insightBullet}>
                      <View style={[styles.insightDot, { backgroundColor: idx === 0 ? COLORS.scoreHigh : idx === 1 ? COLORS.scoreLow : COLORS.accent }]} />
                    </View>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const CARD_GAP = 10;
const REGION_CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
  },

  // Hero
  heroCard: {
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroScore: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  heroScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.borderAccent,
    borderRadius: 1,
    marginVertical: 14,
  },
  heroHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,215,0,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  heroHighlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroHighlightGroup: {
    color: COLORS.gold,
    fontWeight: '800',
  },

  // Section titles
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Bar cards (Gender & Age groups)
  barCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barGroupName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  barEmoji: {
    fontSize: 18,
  },
  barScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  barPercentile: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Regional grid
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  regionCardWrapper: {
    width: REGION_CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
  regionCard: {
    padding: 0,
  },
  regionContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    position: 'relative',
  },
  regionAccentBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
  },
  regionIcon: {
    marginBottom: 6,
  },
  regionName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  regionScore: {
    fontSize: 24,
    fontWeight: '900',
  },

  // Insights
  insightsCard: {
    marginBottom: 8,
  },
  insightsContent: {
    padding: 18,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  insightBullet: {
    width: 20,
    paddingTop: 6,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});

export default DemographicInsightsScreen;
