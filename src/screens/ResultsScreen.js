import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, GLASS, getScoreColor, getScoreLabel } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { isPro, canAccessCategory, getCelebrityMatch, computeFacialRatios, getMaxTipsForCategory } from '../utils/pro';
import { getTipsForCategory, getOverallTips } from '../data/tips';
import { recordScan } from '../utils/streaks';
import ScoreCard from '../components/ScoreCard';
import ScoreRing from '../components/ScoreRing';

const getPercentile = (score) => {
  if (score >= 95) return { pct: 1, label: 'Top 1%', color: '#FFD700' };
  if (score >= 90) return { pct: 5, label: 'Top 5%', color: '#FFD700' };
  if (score >= 85) return { pct: 10, label: 'Top 10%', color: '#ff6090' };
  if (score >= 80) return { pct: 15, label: 'Top 15%', color: '#4d94ff' };
  if (score >= 75) return { pct: 20, label: 'Top 20%', color: '#00e676' };
  if (score >= 70) return { pct: 30, label: 'Top 30%', color: '#00e676' };
  if (score >= 60) return { pct: 45, label: 'Top 45%', color: '#ffab40' };
  if (score >= 50) return { pct: 55, label: 'Top 55%', color: '#ffab40' };
  return { pct: 70, label: 'Top 70%', color: '#ff5252' };
};

const ResultsScreen = ({ route, navigation }) => {
  const { scores, imageUri } = route.params;
  const pro = isPro();
  const celebrity = pro ? getCelebrityMatch(scores) : null;
  const ratios = pro ? computeFacialRatios(scores) : null;
  const overallColor = getScoreColor(scores.overall);
  const percentile = getPercentile(scores.overall);

  const categories = ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'];

  useEffect(() => {
    // Haptic feedback on score reveal
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Record scan for streak/XP system
    recordScan(scores.overall);
  }, []);

  const featureItems = [
    { screen: 'GlowUpSimulator', params: { scores, imageUri }, icon: 'sparkles-outline', title: 'Glow-Up Simulator', desc: 'See your potential transformation', color: '#ff6090', pro: true },
    { screen: 'ShareCard', params: { scores, imageUri }, icon: 'share-social-outline', title: 'Share Card', desc: 'Create a viral share card', color: '#00e5ff' },
    { screen: 'FaceShape', params: { scores }, icon: 'shapes-outline', title: 'Face Shape', desc: 'Discover your face shape', color: '#3388ff' },
    { screen: 'AgeEstimate', params: { scores }, icon: 'hourglass-outline', title: 'Age Estimate', desc: 'Perceived vs real age', color: '#e17055' },
    { screen: 'SkinTone', params: { scores }, icon: 'color-palette-outline', title: 'Skin Tone', desc: 'Personalized routine', color: '#fdcb6e' },
    { screen: 'Products', params: undefined, icon: 'bag-outline', title: 'Products', desc: 'Recommended for you', color: '#00d26a' },
    { screen: 'Challenge', params: undefined, icon: 'flame-outline', title: '30-Day Challenge', desc: 'Transform your look', color: '#ff6b35' },
    { screen: 'BodyFat', params: undefined, icon: 'body-outline', title: 'Body Fat', desc: 'Face definition score', color: '#74b9ff' },
    { screen: 'AIRecommendations', params: undefined, icon: 'sparkles-outline', title: 'AI Recommendations', desc: 'Personalized action plan', color: '#0066ff', pro: true },
    { screen: 'GlowUpReport', params: undefined, icon: 'document-text-outline', title: 'Glow-Up Report', desc: 'Full analysis breakdown', color: '#00e676', pro: true },
    { screen: 'BeforeAfter', params: undefined, icon: 'images-outline', title: 'Transformations', desc: 'Track your journey', color: '#ffab40', pro: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.headerBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Share', { scores })} style={[styles.headerBtn, GLASS.card]}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tips', { scores })} style={[styles.headerBtn, GLASS.card]}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overall Score Hero */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.overallSection}>
          <LinearGradient colors={GRADIENTS.hero} style={styles.heroBg}>
            <View style={styles.overallRingRow}>
              <View style={styles.photoWrapper}>
                <View style={[styles.photoGlow, { shadowColor: overallColor }]} />
                <Image source={{ uri: imageUri }} style={[styles.resultPhoto, { borderColor: overallColor }]} />
              </View>
              <ScoreRing score={scores.overall} size={130} strokeWidth={10} label={`${scores.overallRating}/10`} delay={200} />
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.ratingPill}>
                <View style={[styles.ratingDot, { backgroundColor: overallColor }]} />
                <Text style={[styles.ratingText, { color: overallColor }]}>{getScoreLabel(scores.overall)}</Text>
              </View>
              <View style={[styles.percentilePill, { backgroundColor: percentile.color + '20', borderColor: percentile.color + '40' }]}>
                <Ionicons name="trending-up" size={12} color={percentile.color} />
                <Text style={[styles.percentileText, { color: percentile.color }]}>{percentile.label}</Text>
              </View>
            </View>
            <Text style={styles.overallDescription}>
              {scores.overallRating >= 8 ? "You're in the top tier. Elite facial aesthetics." :
               scores.overallRating >= 6 ? "Above average. Strong features with room to optimize." :
               scores.overallRating >= 4 ? "Average range. Good foundation with improvement potential." :
               "Below average. Significant looksmaxxing potential ahead."}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Celebrity Match (PRO) */}
        <Animated.View entering={FadeInDown.duration(350).delay(300)}>
          {pro && celebrity && (
            <View style={styles.celebrityCard}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.celebrityGradient}>
                <Text style={styles.celebrityEmoji}>{celebrity.image}</Text>
                <View style={styles.celebrityInfo}>
                  <Text style={styles.celebrityLabel}>Celebrity Match</Text>
                  <Text style={styles.celebrityName}>{celebrity.name}</Text>
                  <Text style={styles.celebrityMatch}>{celebrity.matchPercent}% Match</Text>
                </View>
                <View style={styles.proBadgeSm}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {!pro && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <View style={styles.celebrityTeaser}>
                <View style={styles.teaserIconBg}>
                  <Ionicons name="star" size={18} color={COLORS.gold} />
                </View>
                <Text style={styles.teaserText}>See your celebrity look-alike match</Text>
                <View style={styles.proBadgeSm}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Score Cards Grid */}
        <Animated.View entering={FadeInDown.duration(350).delay(420)}>
          <Text style={styles.sectionTitle}>Category Scores</Text>
          <View style={styles.scoreGrid}>
            {categories.map((cat, index) => {
              const info = CATEGORY_INFO[cat];
              const locked = !canAccessCategory(cat);
              return (
                <ScoreCard
                  key={cat}
                  category={cat}
                  label={info.label}
                  score={scores[cat]}
                  icon={info.icon}
                  locked={locked}
                  index={index}
                  onPress={() => {
                    if (locked) {
                      navigation.navigate('Paywall');
                    } else {
                      navigation.navigate('DetailAnalysis', { category: cat, scores });
                    }
                  }}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Facial Ratios (PRO) */}
        {pro && ratios && (
          <Animated.View entering={FadeInDown.duration(350).delay(540)} style={styles.ratiosSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Facial Ratios</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            {ratios.map((ratio, i) => (
              <View key={i} style={styles.ratioRow}>
                <View style={styles.ratioLeft}>
                  <Text style={styles.ratioName}>{ratio.name}</Text>
                  <Text style={styles.ratioIdeal}>Ideal: {ratio.ideal}</Text>
                </View>
                <View style={styles.ratioRight}>
                  <Text style={styles.ratioValue}>{ratio.value}</Text>
                  <Text style={[styles.ratioRating, {
                    color: ratio.rating === 'Excellent' || ratio.rating === 'Good' || ratio.rating === 'High' || ratio.rating === 'Ideal' || ratio.rating === 'Strong' || ratio.rating === 'Wide' || ratio.rating === 'Positive'
                      ? COLORS.scoreHigh : COLORS.scoreMid
                  }]}>{ratio.rating}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Quick Tips */}
        <Animated.View entering={FadeInDown.duration(350).delay(660)} style={styles.tipsPreview}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tips', { scores })}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {getOverallTips(scores.overall).slice(0, 2).map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={styles.tipIconBg}>
                <Ionicons name="bulb" size={16} color={COLORS.accent} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText} numberOfLines={2}>{tip.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          ))}
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View entering={FadeInDown.duration(350).delay(780)} style={styles.featureCards}>
          <Text style={styles.sectionTitle}>Explore</Text>
          {featureItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureCard}
              onPress={() => navigation.navigate(item.screen, item.params)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconBg, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.featureCardContent}>
                <Text style={styles.featureCardTitle}>{item.title}</Text>
                <Text style={styles.featureCardDesc}>{item.desc}</Text>
              </View>
              {item.pro && !pro ? (
                <View style={styles.proBadgeSm}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              ) : (
                <View style={styles.featureArrow}>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(350).delay(900)} style={styles.actionButtons}>
          {pro && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Progress')}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="trending-up" size={18} color={COLORS.accent} />
                </View>
                <Text style={styles.actionBtnText}>Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Plan', { scores })}
                activeOpacity={0.7}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="clipboard-outline" size={18} color={COLORS.accent} />
                </View>
                <Text style={styles.actionBtnText}>Plan</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Compare')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Ionicons name="git-compare-outline" size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.actionBtnText}>Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={GRADIENTS.accent} style={styles.actionIconBgAccent}>
              <Ionicons name="refresh" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionBtnTextAccent}>New Scan</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Pro Upsell */}
        {!pro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.upsellCard}>
              <View style={styles.upsellIconBg}>
                <Ionicons name="lock-open" size={22} color="#fff" />
              </View>
              <Text style={styles.upsellTitle}>Unlock Full Analysis</Text>
              <Text style={styles.upsellText}>
                Get all 7 categories, celebrity matching, facial ratios, progress tracking & more
              </Text>
              <View style={styles.upsellBtn}>
                <Text style={styles.upsellBtnText}>Start Free Trial</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

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
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 6,
  },
  overallSection: {
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
  },
  heroBg: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overallRingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 58,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  resultPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  percentilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
  },
  percentileText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  overallDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  celebrityCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  celebrityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  celebrityEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  celebrityName: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  celebrityMatch: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  celebrityTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.goldDark + '40',
    gap: 10,
  },
  teaserIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teaserText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  proBadgeSm: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ratiosSection: {
    marginBottom: 20,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratioLeft: {},
  ratioName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  ratioIdeal: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  ratioRight: {
    alignItems: 'flex-end',
  },
  ratioValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  ratioRating: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tipsPreview: {
    marginBottom: 20,
  },
  seeAllLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  featureCards: {
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureCardContent: {
    flex: 1,
  },
  featureCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureCardDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  featureArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBgAccent: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtnTextAccent: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  upsellCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.accentGlow,
  },
  upsellIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  upsellTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  upsellText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  upsellBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 36,
    ...SHADOWS.soft,
  },
  upsellBtnText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ResultsScreen;
