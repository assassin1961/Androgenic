import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, Dimensions, Platform,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSequence, withRepeat, Easing, interpolate,
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

const RESULT_EXPIRY_KEY = 'result_timestamp_';
const RESULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// Categories free users can see (first two shown)
const FREE_VISIBLE_CATEGORIES = ['jawline', 'skin'];
// Categories that are blurred/locked for free users
const LOCKED_CATEGORIES = ['eyes', 'symmetry', 'cheekbones', 'masculinity'];

// --- Animated score counter component ---
const AnimatedScore = ({ targetScore, delay = 0, fontSize = 72 }) => {
  const [displayScore, setDisplayScore] = useState(0);

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
const ScoreBar = ({ score, delay = 0, locked = false }) => {
  const width = useSharedValue(0);
  const color = locked ? '#444' : getCardScoreColor(score);
  const percentage = locked ? 60 : (score / 10) * 100;

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
const FactorRow = ({ label, score, index, locked = false, onLockPress }) => {
  const scoreColor = locked ? '#444' : getCardScoreColor(score);
  const animDelay = 600 + index * 100;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(animDelay)}
      style={styles.factorRow}
    >
      <TouchableOpacity
        activeOpacity={locked ? 0.7 : 1}
        onPress={locked ? onLockPress : undefined}
        disabled={!locked}
      >
        <View style={styles.factorHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.factorLabel, locked && { color: '#555' }]}>{label}</Text>
            {locked && (
              <Ionicons name="lock-closed" size={10} color={GOLD} />
            )}
          </View>
          <Text style={[styles.factorScore, { color: scoreColor }]}>
            {locked ? '•••' : score.toFixed(1)}
          </Text>
        </View>
        <View style={{ position: 'relative' }}>
          <ScoreBar score={score} delay={animDelay} locked={locked} />
          {locked && (
            <View style={styles.factorLockOverlay} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Locked category card for detailed breakdown ---
const LockedDetailCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.detailCard, styles.lockedDetailCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.lockedDetailOverlay}>
        <View style={styles.detailHeader}>
          <Text style={[styles.detailCategory, { color: '#666' }]}>{category}</Text>
          <View style={styles.detailScoreRow}>
            <Text style={[styles.detailScore, { color: '#444' }]}>?</Text>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={12} color={GOLD} />
            </View>
          </View>
        </View>
        <View style={styles.detailBarContainer}>
          <View style={[styles.detailBar, { width: '55%', backgroundColor: '#333' }]} />
        </View>
        <View style={styles.lockedDetailHint}>
          <Ionicons name="eye-off-outline" size={12} color={GOLD + '90'} />
          <Text style={styles.lockedDetailHintText}>Unlock with PRO to see score</Text>
        </View>
      </View>
    </TouchableOpacity>
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

// --- Unlock Full Analysis CTA card ---
const UnlockAnalysisCard = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.unlockCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.unlockCardInner}>
        <View style={styles.unlockIconRow}>
          <View style={styles.unlockIconCircle}>
            <Ionicons name="analytics" size={22} color={GOLD} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.unlockCardTitle}>Unlock Full Analysis</Text>
            <Text style={styles.unlockCardDesc}>See all 6 categories + improvement tips</Text>
          </View>
        </View>
        <View style={styles.unlockButton}>
          <Ionicons name="lock-open" size={14} color="#000" />
          <Text style={styles.unlockButtonText}>Unlock with PRO</Text>
        </View>
        <Text style={styles.unlockTrialText}>3-day free trial available</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Share template card ---
const ShareTemplateCard = ({ label, isBasic, onPress, locked }) => {
  return (
    <TouchableOpacity
      style={[styles.shareTemplateCard, locked && styles.shareTemplateLocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.shareTemplateLabel, locked && { color: '#555' }]}>{label}</Text>
      {locked ? (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      ) : isBasic ? (
        <Text style={styles.shareTemplateFreeTag}>Free</Text>
      ) : null}
      {locked && (
        <Text style={styles.shareTemplateUpgrade}>Upgrade to unlock</Text>
      )}
    </TouchableOpacity>
  );
};

// --- Bounce CTA banner ---
const BottomCTABanner = ({ onPress }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Appear after 3 seconds
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      // Subtle bounce loop
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.bottomCTA, animStyle]}>
      <TouchableOpacity
        style={styles.bottomCTAButton}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="star" size={16} color="#000" />
        <Text style={styles.bottomCTAText}>Unlock Full Analysis — Start Free Trial</Text>
      </TouchableOpacity>
    </Animated.View>
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
  const [resultsExpired, setResultsExpired] = useState(false);
  const [selectedShareTemplate, setSelectedShareTemplate] = useState('minimal');

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

  // Check if a category is locked for free users
  const isCategoryLocked = (key) => {
    if (pro) return false;
    if (resultsExpired) return true; // All categories locked after 24h for free
    return LOCKED_CATEGORIES.includes(key);
  };

  // Check if a category is visible (free teaser) in the rating card
  const isCategoryVisibleInCard = (key) => {
    if (pro) return true;
    if (resultsExpired) return FREE_VISIBLE_CATEGORIES.includes(key); // Only jawline & skin after expiry
    return FREE_VISIBLE_CATEGORIES.includes(key) || !LOCKED_CATEGORIES.includes(key);
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

  const goToPaywall = (source) => {
    navigation.navigate('Paywall');
  };

  // --- Check result expiry for free users ---
  useEffect(() => {
    if (pro) return;
    const checkExpiry = async () => {
      try {
        const resultId = scores.overall ? `${RESULT_EXPIRY_KEY}${Math.round(scores.overall)}` : RESULT_EXPIRY_KEY + 'latest';
        const stored = await AsyncStorage.getItem(resultId);
        if (stored) {
          const timestamp = parseInt(stored, 10);
          if (Date.now() - timestamp > RESULT_EXPIRY_MS) {
            setResultsExpired(true);
          }
        } else {
          // Store current timestamp for this result
          await AsyncStorage.setItem(resultId, String(Date.now()));
        }
      } catch (e) {}
    };
    checkExpiry();
  }, [pro]);

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

  // Share templates
  const shareTemplates = [
    { id: 'minimal', label: 'Minimal', locked: false, isBasic: true },
    { id: 'detailed', label: 'Detailed', locked: !pro },
    { id: 'neon', label: 'Neon Glow', locked: !pro },
    { id: 'gold', label: 'Gold Elite', locked: !pro },
  ];

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

            {/* Overall Score - THE number (always shown) */}
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
                    locked={isCategoryLocked(f.key)}
                    onLockPress={() => goToPaywall('locked_factor_' + f.key)}
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
                    locked={isCategoryLocked(f.key)}
                    onLockPress={() => goToPaywall('locked_factor_' + f.key)}
                  />
                ))}
              </View>
            </View>

            {/* Watermark */}
            <Text style={styles.watermark}>ANDROGENIC</Text>
          </View>
        </Animated.View>

        {/* ============ RESULT EXPIRY NUDGE (free users only) ============ */}
        {!pro && (
          <Animated.View entering={FadeInDown.duration(300).delay(700)}>
            <View style={styles.expiryNudge}>
              <Ionicons name="time-outline" size={14} color={GOLD + '90'} />
              <Text style={styles.expiryNudgeText}>
                {resultsExpired
                  ? 'Detailed results have expired. Upgrade to keep results forever.'
                  : 'Detailed results available for 24 hours'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ============ DETAILED BREAKDOWN ============ */}
        <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>

          {/* Free visible categories: Jawline and Skin Quality */}
          {mainFactors
            .filter((f) => !isCategoryLocked(f.key))
            .map((f) => (
              <DetailCard
                key={f.key}
                category={f.label}
                score={getFactorScore(f.key)}
                analysis={getAnalysisText(f.key)}
                tip={getImproveTip(f.key)}
                isProTip={!canAccessCategory(f.key)}
                locked={!canAccessCategory(f.key)}
                onProPress={() => goToPaywall('detail_tip_' + f.key)}
              />
            ))}

          {/* Unlock Full Analysis card (between visible and locked) - free users only */}
          {!pro && (
            <UnlockAnalysisCard onPress={() => goToPaywall('unlock_analysis_card')} />
          )}

          {/* Locked categories for free users */}
          {!pro &&
            mainFactors
              .filter((f) => isCategoryLocked(f.key))
              .map((f) => (
                <LockedDetailCard
                  key={f.key}
                  category={f.label}
                  onPress={() => goToPaywall('locked_detail_' + f.key)}
                />
              ))}

          {/* PRO users see all categories normally */}
          {pro &&
            mainFactors
              .filter((f) => !FREE_VISIBLE_CATEGORIES.includes(f.key))
              .map((f) => (
                <DetailCard
                  key={f.key}
                  category={f.label}
                  score={getFactorScore(f.key)}
                  analysis={getAnalysisText(f.key)}
                  tip={getImproveTip(f.key)}
                  isProTip={false}
                  locked={false}
                  onProPress={() => {}}
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
                      onPress={() => goToPaywall('additional_' + item.label)}
                      style={styles.lockedRow}
                    >
                      <Text style={styles.lockedScore}>
                        {item.label === 'Celebrity Match' ? '???' : '•••'}
                      </Text>
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
                  {item.locked && (
                    <Text style={styles.lockedMissingText}>
                      {item.label === 'Potential Score'
                        ? 'See how much you can improve'
                        : item.label === 'Celebrity Match'
                        ? 'Find your celebrity look-alike'
                        : 'Unlock to view'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* ============ SHARE TEMPLATES ============ */}
        <Animated.View entering={FadeInDown.duration(400).delay(1050)} style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Card</Text>
          <View style={styles.shareTemplateGrid}>
            {shareTemplates.map((template) => (
              <ShareTemplateCard
                key={template.id}
                label={template.label}
                isBasic={template.isBasic}
                locked={template.locked}
                onPress={() => {
                  if (template.locked) {
                    goToPaywall('share_template_' + template.id);
                  } else {
                    setSelectedShareTemplate(template.id);
                  }
                }}
              />
            ))}
          </View>
          {!pro && (
            <Text style={styles.shareWatermarkNote}>
              Free shares include ANDROGENIC watermark
            </Text>
          )}
        </Animated.View>

        {/* ============ PRO UPSELL (free users) ============ */}
        {!pro && (
          <Animated.View entering={FadeInDown.duration(400).delay(1100)}>
            <TouchableOpacity
              style={styles.proUpsell}
              onPress={() => goToPaywall('results_upsell')}
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

        {/* Bottom spacer for fixed buttons + CTA banner */}
        <View style={{ height: pro ? 100 : 160 }} />
      </ScrollView>

      {/* ============ FIXED ACTION BUTTONS ============ */}
      <View style={[styles.actionBar, !pro && { bottom: 56 }]}>
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

      {/* ============ BOTTOM CTA BANNER (free users only) ============ */}
      {!pro && (
        <BottomCTABanner onPress={() => goToPaywall('bottom_cta')} />
      )}
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
  factorLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
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

  // --- Locked Detail Card ---
  lockedDetailCard: {
    backgroundColor: '#141414',
    borderColor: '#222',
    overflow: 'hidden',
  },
  lockedDetailOverlay: {
    opacity: 0.85,
  },
  lockIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GOLD + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedDetailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  lockedDetailHintText: {
    fontSize: 11,
    color: GOLD + '80',
    fontWeight: '500',
  },

  // --- Unlock Analysis Card ---
  unlockCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GOLD + '60',
    backgroundColor: GOLD + '08',
    marginBottom: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  unlockCardInner: {
    padding: 18,
    alignItems: 'center',
  },
  unlockIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  unlockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  unlockCardDesc: {
    fontSize: 13,
    color: '#999',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    marginBottom: 8,
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  unlockTrialText: {
    fontSize: 11,
    color: '#777',
    fontWeight: '500',
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
  lockedMissingText: {
    fontSize: 11,
    color: '#555',
    marginTop: 6,
    fontStyle: 'italic',
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

  // --- Share Section ---
  shareSection: {
    marginBottom: 20,
  },
  shareTemplateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shareTemplateCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareTemplateLocked: {
    opacity: 0.6,
  },
  shareTemplateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  shareTemplateFreeTag: {
    fontSize: 10,
    color: SCORE_GREEN,
    fontWeight: '600',
  },
  shareTemplateUpgrade: {
    fontSize: 9,
    color: GOLD + '80',
    fontWeight: '500',
    marginLeft: 2,
  },
  shareWatermarkNote: {
    fontSize: 11,
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // --- Expiry Nudge ---
  expiryNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: GOLD + '08',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD + '15',
  },
  expiryNudgeText: {
    fontSize: 11,
    color: GOLD + '90',
    fontWeight: '500',
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

  // --- Bottom CTA Banner ---
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 4 : 4,
    paddingTop: 4,
    backgroundColor: '#000',
  },
  bottomCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  bottomCTAText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

export default ResultsScreen;
