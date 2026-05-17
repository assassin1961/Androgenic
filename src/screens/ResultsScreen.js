import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, Dimensions, Platform,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSequence, Easing, interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS, getScoreColor, getScoreLabel } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { isPro, canAccessCategory, getCelebrityMatch } from '../utils/pro';
import { getTipsForCategory } from '../data/tips';
import { recordScan } from '../utils/streaks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

// --- Score tier colors (Madden-style) ---
const GOLD = '#D4AF37';
const SCORE_GREEN = '#34C759';
const SCORE_BLUE = '#4A90D9';
const SCORE_ORANGE = '#FF9500';
const SCORE_RED = '#FF3B30';

const getCardScoreColor = (score) => {
  if (score >= 8) return SCORE_GREEN;
  if (score >= 6) return SCORE_BLUE;
  if (score >= 4) return SCORE_ORANGE;
  return SCORE_RED;
};

const getPercentile = (score) => {
  if (score >= 9.5) return 'Top 1%';
  if (score >= 9) return 'Top 5%';
  if (score >= 8.5) return 'Top 10%';
  if (score >= 8) return 'Top 15%';
  if (score >= 7.5) return 'Top 20%';
  if (score >= 7) return 'Top 25%';
  if (score >= 6.5) return 'Top 30%';
  if (score >= 6) return 'Top 35%';
  if (score >= 5.5) return 'Top 45%';
  if (score >= 5) return 'Top 55%';
  return 'Top 70%';
};

const getTierLabel = (score) => {
  if (score >= 8) return 'Model Tier';
  if (score >= 6) return 'Above Average';
  if (score >= 4) return 'Average';
  return 'Below Average';
};

// Convert 0-100 raw score to 1-10 display
const toTen = (raw) => {
  if (raw === undefined || raw === null) return 5;
  if (raw > 10) return Math.max(1, Math.min(10, Math.round(raw / 10)));
  return Math.max(1, Math.min(10, Math.round(raw)));
};

// --- Animated score counter component ---
const AnimatedScore = ({ targetScore, delay = 0, fontSize = 72 }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1200;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - p, 3);
        const current = Math.round(eased * targetScore * 10) / 10;
        setDisplayScore(current.toFixed(1));
        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayScore(targetScore.toFixed(1));
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [targetScore, delay]);

  const scoreColor = getCardScoreColor(targetScore);

  return (
    <Text style={[styles.heroScore, { color: scoreColor, fontSize }]}>
      {displayScore}
    </Text>
  );
};

// --- Progress bar component ---
const ScoreBar = ({ score, delay = 0 }) => {
  const width = useSharedValue(0);
  const color = getCardScoreColor(score);
  const percentage = (score / 10) * 100;

  useEffect(() => {
    width.value = withDelay(delay, withTiming(percentage, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, barStyle]} />
    </View>
  );
};

// --- Factor row in the rating grid ---
const FactorRow = ({ label, score, index }) => {
  const scoreColor = getCardScoreColor(score);
  const animDelay = 600 + index * 100;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(animDelay)}
      style={styles.factorRow}
    >
      <View style={styles.factorHeader}>
        <Text style={styles.factorLabel}>{label}</Text>
        <Text style={[styles.factorScore, { color: scoreColor }]}>{score.toFixed(1)}</Text>
      </View>
      <ScoreBar score={score} delay={animDelay} />
    </Animated.View>
  );
};

// --- Expandable detail card ---
const DetailCard = ({ category, score, analysis, tip, isProTip, locked, onProPress }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = getCardScoreColor(score);

  return (
    <TouchableOpacity
      style={styles.detailCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.detailHeader}>
        <Text style={styles.detailCategory}>{category}</Text>
        <View style={styles.detailScoreRow}>
          <Text style={[styles.detailScore, { color: scoreColor }]}>{score.toFixed(1)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#666"
          />
        </View>
      </View>
      <View style={styles.detailBarContainer}>
        <View style={[styles.detailBar, { width: `${(score / 10) * 100}%`, backgroundColor: scoreColor }]} />
      </View>
      {expanded && (
        <View style={styles.detailExpanded}>
          <Text style={styles.detailAnalysis}>{analysis}</Text>
          {tip && (
            <View style={styles.detailTipRow}>
              <Ionicons name="bulb-outline" size={14} color={GOLD} />
              <Text style={styles.detailTipText}>{tip}</Text>
              {isProTip && !isPro() && (
                <TouchableOpacity onPress={onProPress} style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// =============================================================================
// MAIN RESULTS SCREEN
// =============================================================================
const ResultsScreen = ({ route, navigation }) => {
  const { scores, imageUri } = route.params;
  const pro = isPro();
  const cardRef = useRef(null);
  const [additionalExpanded, setAdditionalExpanded] = useState(false);

  // Compute display scores (convert from 0-100 to 0-10 if needed)
  const overallScore = scores.overallRating || toTen(scores.overall);
  const overallColor = getCardScoreColor(overallScore);
  const percentileLabel = getPercentile(overallScore);
  const tierLabel = getTierLabel(overallScore);

  // The 6 main Madden-style factors
  const mainFactors = [
    { key: 'jawline', label: 'Jawline' },
    { key: 'skin', label: 'Skin Quality' },
    { key: 'eyes', label: 'Eye Area' },
    { key: 'symmetry', label: 'Symmetry' },
    { key: 'cheekbones', label: 'Cheekbones' },
    { key: 'masculinity', label: 'Masculinity' },
  ];

  // Generate factor scores in 1-10 scale
  const getFactorScore = (key) => {
    const raw = scores[key];
    if (raw === undefined || raw === null) return 5.0;
    if (raw > 10) return Math.max(1, Math.min(10, parseFloat((raw / 10).toFixed(1))));
    return Math.max(1, Math.min(10, parseFloat(raw.toFixed ? raw.toFixed(1) : raw)));
  };

  // Additional scores
  const additionalScores = [
    { label: 'Face Shape', score: getFactorScore('cheekbones'), locked: false },
    { label: 'Hair Score', score: getFactorScore('hair'), locked: false },
    { label: 'Potential Score', score: Math.min(10, overallScore + 1.5), locked: !pro },
    { label: 'Celebrity Match', score: null, locked: !pro },
  ];

  // Analysis text for detail breakdown
  const getAnalysisText = (key) => {
    const s = getFactorScore(key);
    const info = CATEGORY_INFO[key];
    if (s >= 8) return `Excellent ${info?.label || key}. Top-tier facial structure in this area.`;
    if (s >= 6) return `Good ${info?.label || key}. Above average with minor optimization possible.`;
    if (s >= 4) return `Average ${info?.label || key}. Solid foundation with noticeable improvement potential.`;
    return `Below average ${info?.label || key}. Significant room for enhancement with targeted effort.`;
  };

  const getImproveTip = (key) => {
    // getTipsForCategory expects 0-100 scale
    const rawScore = scores[key] || (getFactorScore(key) * 10);
    const tips = getTipsForCategory ? getTipsForCategory(key, rawScore) : null;
    if (tips && tips.length > 0) return tips[0].title + ': ' + tips[0].text.substring(0, 80) + '...';
    return null;
  };

  // --- Haptic + record on mount ---
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recordScan(scores.overall);

    // Save result to history
    const saveResult = async () => {
      try {
        const history = JSON.parse(await AsyncStorage.getItem('scan_history') || '[]');
        history.unshift({
          id: Date.now(),
          scores,
          imageUri,
          date: new Date().toISOString(),
        });
        await AsyncStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
      } catch (e) {}
    };
    saveResult();
  }, []);

  // --- Share card ---
  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (cardRef.current) {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your rating card',
        });
      }
    } catch (e) {
      console.warn('Share failed:', e);
    }
  };

  // Border color: gold for high scores, subtle for others
  const cardBorderColor = overallScore >= 8 ? GOLD : '#2A2A2A';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ============ THE RATING CARD ============ */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.cardWrapper}>
          <View
            ref={cardRef}
            style={[styles.ratingCard, { borderColor: cardBorderColor }]}
            collapsable={false}
          >
            {/* Gold shimmer for high scores */}
            {overallScore >= 8 && (
              <View style={styles.goldGlow} />
            )}

            {/* User Photo */}
            <View style={styles.photoSection}>
              <View style={[styles.photoRing, { borderColor: overallColor }]}>
                <Image source={{ uri: imageUri }} style={styles.photo} />
              </View>
            </View>

            {/* Overall Score - THE number */}
            <View style={styles.scoreSection}>
              <AnimatedScore targetScore={overallScore} delay={400} fontSize={72} />
              <Text style={[styles.tierLabel, { color: overallColor }]}>{tierLabel}</Text>
              <View style={[styles.percentilePill, { borderColor: GOLD + '60' }]}>
                <Text style={styles.percentileText}>{percentileLabel}</Text>
              </View>
            </View>

            {/* Six-Factor Rating Grid (2 columns, 3 rows) */}
            <View style={styles.factorsGrid}>
              <View style={styles.factorsColumn}>
                {mainFactors.slice(0, 3).map((f, i) => (
                  <FactorRow
                    key={f.key}
                    label={f.label}
                    score={getFactorScore(f.key)}
                    index={i}
                  />
                ))}
              </View>
              <View style={styles.factorsColumn}>
                {mainFactors.slice(3, 6).map((f, i) => (
                  <FactorRow
                    key={f.key}
                    label={f.label}
                    score={getFactorScore(f.key)}
                    index={i + 3}
                  />
                ))}
              </View>
            </View>

            {/* Watermark */}
            <Text style={styles.watermark}>ANDROGENIC</Text>
          </View>
        </Animated.View>

        {/* ============ DETAILED BREAKDOWN ============ */}
        <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
          {mainFactors.map((f) => (
            <DetailCard
              key={f.key}
              category={f.label}
              score={getFactorScore(f.key)}
              analysis={getAnalysisText(f.key)}
              tip={getImproveTip(f.key)}
              isProTip={!canAccessCategory(f.key)}
              locked={!canAccessCategory(f.key)}
              onProPress={() => navigation.navigate('Paywall')}
            />
          ))}
        </Animated.View>

        {/* ============ ADDITIONAL SCORES (collapsed) ============ */}
        <Animated.View entering={FadeInDown.duration(400).delay(1000)} style={styles.additionalSection}>
          <TouchableOpacity
            style={styles.additionalHeader}
            onPress={() => setAdditionalExpanded(!additionalExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Additional Scores</Text>
            <Ionicons
              name={additionalExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          {additionalExpanded && (
            <View style={styles.additionalGrid}>
              {additionalScores.map((item, i) => (
                <View key={i} style={styles.additionalCard}>
                  <Text style={styles.additionalLabel}>{item.label}</Text>
                  {item.locked ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Paywall')}
                      style={styles.lockedRow}
                    >
                      <Text style={styles.lockedScore}>--</Text>
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.additionalScore, { color: getCardScoreColor(item.score || 5) }]}>
                      {item.score ? item.score.toFixed(1) : 'N/A'}
                    </Text>
                  )}
                  {!item.locked && item.score && (
                    <View style={styles.additionalBarContainer}>
                      <View style={[styles.additionalBar, {
                        width: `${(item.score / 10) * 100}%`,
                        backgroundColor: getCardScoreColor(item.score),
                      }]} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Pro Upsell for free users */}
        {!pro && (
          <Animated.View entering={FadeInDown.duration(400).delay(1100)}>
            <TouchableOpacity
              style={styles.proUpsell}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <View style={styles.proUpsellIcon}>
                <Ionicons name="lock-open" size={20} color={GOLD} />
              </View>
              <View style={styles.proUpsellContent}>
                <Text style={styles.proUpsellTitle}>Unlock Full Analysis</Text>
                <Text style={styles.proUpsellDesc}>Celebrity match, potential score, all categories & more</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={GOLD} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bottom spacer for fixed buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============ FIXED ACTION BUTTONS ============ */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Tips', { scores });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trending-up" size={20} color="#000" />
          <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Improve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Home');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // --- Rating Card ---
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  goldGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GOLD + '30',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  // --- Photo ---
  photoSection: {
    marginBottom: 16,
  },
  photoRing: {
    width: 158,
    height: 158,
    borderRadius: 79,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },

  // --- Score ---
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroScore: {
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: 4,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  percentilePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: GOLD + '12',
  },
  percentileText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- Factors Grid ---
  factorsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  factorsColumn: {
    flex: 1,
    gap: 14,
  },
  factorRow: {
    marginBottom: 0,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  factorLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999999',
  },
  factorScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },

  // --- Watermark ---
  watermark: {
    fontSize: 11,
    fontWeight: '600',
    color: GOLD + '50',
    letterSpacing: 4,
    marginTop: 4,
  },

  // --- Section Title ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // --- Detail Breakdown ---
  breakdownSection: {
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 14,
    marginBottom: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailBarContainer: {
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  detailBar: {
    height: 3,
    borderRadius: 2,
  },
  detailExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  detailAnalysis: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 19,
    marginBottom: 10,
  },
  detailTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 10,
  },
  detailTipText: {
    flex: 1,
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 17,
  },

  // --- Additional Scores ---
  additionalSection: {
    marginBottom: 20,
  },
  additionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  additionalGrid: {
    gap: 8,
    marginTop: 8,
  },
  additionalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 14,
  },
  additionalLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999999',
    marginBottom: 6,
  },
  additionalScore: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  additionalBarContainer: {
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  additionalBar: {
    height: 3,
    borderRadius: 2,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
  },

  // --- PRO Badge ---
  proBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // --- Pro Upsell ---
  proUpsell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD + '40',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  proUpsellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GOLD + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proUpsellContent: {
    flex: 1,
  },
  proUpsellTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  proUpsellDesc: {
    fontSize: 12,
    color: '#999999',
  },

  // --- Fixed Action Bar ---
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  actionBtnPrimary: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionBtnTextPrimary: {
    color: '#000000',
  },
});

export default ResultsScreen;
