import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image,
  Animated, Easing, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, GLASS, TYPOGRAPHY, SPACING, RADIUS, getScoreColor } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

// ─── Category Data ───────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'jawline',
    label: 'Jawline',
    icon: 'fitness-outline',
    color: '#ff6b35',
    minGain: 1.5,
    maxGain: 2.5,
    timeline: '6-12 months',
    actions: [
      'Mewing practice daily (tongue posture)',
      'Reduce body fat to 12%',
      'Neck training 3x/week',
    ],
  },
  {
    id: 'skin',
    label: 'Skin',
    icon: 'leaf-outline',
    color: '#00e676',
    minGain: 1.0,
    maxGain: 2.0,
    timeline: '3-6 months',
    actions: [
      'Tretinoin 0.05% every night',
      'SPF 50+ sunscreen daily',
      'Vitamin C serum morning routine',
    ],
  },
  {
    id: 'eyes',
    label: 'Eyes',
    icon: 'eye-outline',
    color: '#4A90D9',
    minGain: 0.5,
    maxGain: 1.0,
    timeline: 'Lifestyle changes',
    actions: [
      'Sleep 8+ hours on back',
      'Cold compress 5 min daily',
      'Caffeine eye cream PM routine',
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: 'cut-outline',
    color: '#ffd93d',
    minGain: 1.0,
    maxGain: 2.0,
    timeline: '3-6 months',
    actions: [
      'Optimize cut for face shape',
      'Minoxidil if thinning areas',
      'Biotin + zinc supplement daily',
    ],
  },
  {
    id: 'symmetry',
    label: 'Symmetry',
    icon: 'git-compare-outline',
    color: '#00b4d8',
    minGain: 0.3,
    maxGain: 0.8,
    timeline: '6-12 months',
    actions: [
      'Sleep on back consistently',
      'Chew evenly on both sides',
      'Daily facial symmetry exercises',
    ],
  },
  {
    id: 'cheekbones',
    label: 'Cheekbones',
    icon: 'diamond-outline',
    color: '#ff6090',
    minGain: 0.5,
    maxGain: 1.5,
    timeline: '6-12 months',
    actions: [
      'Lower body fat percentage',
      'Hard mewing technique',
      'Gua sha massage 5 min/day',
    ],
  },
  {
    id: 'bodyfat',
    label: 'Body Fat',
    icon: 'body-outline',
    color: '#1de9b6',
    minGain: 1.0,
    maxGain: 2.0,
    timeline: '3-6 months',
    actions: [
      'Caloric deficit 500 kcal/day',
      'Compound lifts 4x/week',
      'Daily 10k steps minimum',
    ],
  },
];

const TIMELINE_MONTHS = [
  { label: 'Now', month: 0 },
  { label: 'Month 3', month: 3 },
  { label: 'Month 6', month: 6 },
  { label: 'Month 12', month: 12 },
];

// ─── Helpers ─────────────────────────────────────────────────────────

const generateCategoryScores = (overall) => {
  const base = overall || 6.4;
  return CATEGORIES.map((cat) => {
    const variance = (Math.random() - 0.5) * 2.0;
    const current = Math.max(2.0, Math.min(9.5, base + variance));
    const gain = cat.minGain + Math.random() * (cat.maxGain - cat.minGain);
    const potential = Math.min(9.9, current + gain);
    return {
      ...cat,
      current: parseFloat(current.toFixed(1)),
      potential: parseFloat(potential.toFixed(1)),
      gain: parseFloat(gain.toFixed(1)),
      pct: Math.round((gain / current) * 100),
    };
  });
};

const getTimelineScores = (currentScore, potentialScore) => {
  const diff = potentialScore - currentScore;
  return [
    currentScore,
    parseFloat((currentScore + diff * 0.25).toFixed(1)),
    parseFloat((currentScore + diff * 0.58).toFixed(1)),
    parseFloat((currentScore + diff * 0.82).toFixed(1)),
    potentialScore,
  ];
};

// ─── Animated Counter ────────────────────────────────────────────────

const AnimatedCounter = ({ toValue, duration = 1200, delay = 0, style, prefix = '', suffix = '', decimals = 1 }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0.0');

  useEffect(() => {
    const id = animVal.addListener(({ value }) => {
      setDisplay(value.toFixed(decimals));
    });
    Animated.timing(animVal, {
      toValue,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(id);
  }, [toValue]);

  return <Text style={style}>{prefix}{display}{suffix}</Text>;
};

// ─── Main Component ──────────────────────────────────────────────────

const GlowUpPreviewScreen = ({ route, navigation }) => {
  const imageUri = route.params?.imageUri;
  const overallScore = route.params?.overallScore || route.params?.scores?.overall || 6.4;
  const pro = isPro();

  // Generate stable category data
  const [categoryData] = useState(() => generateCategoryScores(overallScore));
  const potentialScore = parseFloat(
    Math.min(9.9, categoryData.reduce((s, c) => s + c.potential, 0) / categoryData.length).toFixed(1)
  );
  const currentScore = parseFloat(overallScore.toFixed ? overallScore.toFixed(1) : parseFloat(overallScore).toFixed(1));
  const improvement = parseFloat((potentialScore - currentScore).toFixed(1));
  const timelineScores = getTimelineScores(currentScore, potentialScore);

  // ─── Animations ──────────────────────────────────────────────────
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const arrowPulse = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const potentialGlow = useRef(new Animated.Value(0)).current;
  const timelineDots = useRef(TIMELINE_MONTHS.map(() => new Animated.Value(0))).current;
  const cardAnims = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;
  const progressAnims = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;
  const ctaScale = useRef(new Animated.Value(0.9)).current;
  const sharePulse = useRef(new Animated.Value(1)).current;
  const viewShotRef = useRef(null);

  useEffect(() => {
    // Main entrance
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Gold glow on potential photo
    Animated.loop(
      Animated.sequence([
        Animated.timing(potentialGlow, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(potentialGlow, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Arrow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(arrowPulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Timeline dots stagger
    timelineDots.forEach((dot, i) => {
      Animated.sequence([
        Animated.delay(800 + i * 300),
        Animated.spring(dot, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    });

    // Category cards stagger
    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(400 + i * 100),
        Animated.spring(anim, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    });

    // Progress bars animate in
    progressAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(600 + i * 120),
        Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    });

    // CTA bounce
    Animated.sequence([
      Animated.delay(1200),
      Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Share button subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(sharePulse, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(sharePulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleUnlock = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Paywall');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // ─── Arrow animation interpolation ──────────────────────────────
  const arrowTranslate = arrowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const arrowScale = arrowPulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.fullFlex, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Glow-Up</Text>
            <LinearGradient colors={GRADIENTS.accent} style={styles.proBadge}>
              <Ionicons name="diamond" size={10} color="#000" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* ─── BEFORE / AFTER SCORE DISPLAY ─── */}
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.shareableArea}>
            <LinearGradient
              colors={['rgba(212,175,55,0.08)', 'rgba(0,0,0,0)']}
              style={styles.beforeAfterSection}
            >
              <View style={styles.beforeAfterRow}>
                {/* NOW */}
                <View style={styles.photoColumn}>
                  <Text style={styles.photoLabel}>Now</Text>
                  <View style={styles.photoCircle}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.photoImage} />
                    ) : (
                      <LinearGradient colors={['#1A1A1A', '#111']} style={styles.photoPlaceholder}>
                        <Ionicons name="person" size={48} color={COLORS.textTertiary} />
                      </LinearGradient>
                    )}
                  </View>
                  <Text style={[styles.scoreValue, { color: getScoreColor(currentScore) }]}>
                    {currentScore.toFixed(1)}
                  </Text>
                  <Text style={styles.scoreSub}>/10</Text>
                </View>

                {/* ARROW + IMPROVEMENT */}
                <View style={styles.arrowContainer}>
                  <Animated.View style={[
                    styles.improvementBadge,
                    { transform: [{ translateX: arrowTranslate }, { scale: arrowScale }] },
                  ]}>
                    <LinearGradient colors={GRADIENTS.accent} style={styles.improvementInner}>
                      <Text style={styles.improvementText}>+{improvement.toFixed(1)}</Text>
                    </LinearGradient>
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateX: arrowTranslate }] }}>
                    <Ionicons name="arrow-forward" size={28} color={COLORS.accent} />
                  </Animated.View>
                </View>

                {/* POTENTIAL */}
                <View style={styles.photoColumn}>
                  <Text style={[styles.photoLabel, { color: COLORS.accent }]}>Potential</Text>
                  <Animated.View style={[
                    styles.photoCirclePotential,
                    {
                      ...SHADOWS.goldGlow,
                      opacity: potentialGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ]}>
                    <LinearGradient
                      colors={['rgba(212,175,55,0.25)', 'rgba(212,175,55,0.05)']}
                      style={styles.glowOverlayOuter}
                    >
                      {imageUri ? (
                        <View style={styles.potentialImageWrap}>
                          <Image source={{ uri: imageUri }} style={styles.photoImage} />
                          <LinearGradient
                            colors={['rgba(212,175,55,0.25)', 'rgba(255,215,0,0.10)', 'transparent']}
                            style={styles.goldOverlay}
                          />
                        </View>
                      ) : (
                        <LinearGradient colors={['#2A2000', '#1A1500']} style={styles.photoPlaceholder}>
                          <Ionicons name="star" size={48} color={COLORS.accent} />
                        </LinearGradient>
                      )}
                    </LinearGradient>
                  </Animated.View>
                  <AnimatedCounter
                    toValue={potentialScore}
                    duration={1500}
                    delay={400}
                    style={[styles.scoreValue, { color: COLORS.scoreExcellent }]}
                  />
                  <Text style={styles.scoreSub}>/10</Text>
                </View>
              </View>
            </LinearGradient>
          </ViewShot>

          {/* ─── TRANSFORMATION TIMELINE ─── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Transformation Timeline</Text>
            <View style={[styles.timelineCard, GLASS.card]}>
              {/* Track */}
              <View style={styles.timelineTrack}>
                <View style={styles.timelineLineWrapper}>
                  <View style={styles.timelineLine} />
                  <LinearGradient
                    colors={[COLORS.accent, COLORS.accentLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.timelineLineFill]}
                  />
                </View>

                {TIMELINE_MONTHS.map((tm, i) => {
                  const scoreAtPoint = timelineScores[i + (i === 0 ? 0 : 0)];
                  const score = i === 0 ? timelineScores[0] : i === 1 ? timelineScores[1] : i === 2 ? timelineScores[2] : timelineScores[4];
                  return (
                    <Animated.View
                      key={tm.label}
                      style={[
                        styles.timelineDotWrap,
                        {
                          left: `${(i / (TIMELINE_MONTHS.length - 1)) * 100}%`,
                          transform: [
                            { scale: timelineDots[i] },
                          ],
                          opacity: timelineDots[i],
                        },
                      ]}
                    >
                      <View style={[
                        styles.timelineDot,
                        i === TIMELINE_MONTHS.length - 1 && styles.timelineDotFinal,
                      ]}>
                        {i === TIMELINE_MONTHS.length - 1 && (
                          <Ionicons name="star" size={10} color="#000" />
                        )}
                      </View>
                      <Text style={[
                        styles.timelineScore,
                        { color: getScoreColor(score) },
                      ]}>
                        {score.toFixed(1)}
                      </Text>
                      <Text style={styles.timelineLabel}>{tm.label}</Text>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ─── CATEGORY IMPROVEMENTS ─── */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Category Improvements</Text>
            <Text style={styles.sectionSubtitle}>7 areas of potential enhancement</Text>

            {categoryData.map((cat, i) => {
              const isLocked = !pro && i > 0;
              const currentPct = cat.current / 10;
              const potentialPct = cat.potential / 10;

              return (
                <Animated.View
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      opacity: cardAnims[i],
                      transform: [{
                        translateY: cardAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${cat.color}10`, 'rgba(26,26,26,0.9)']}
                    style={styles.categoryCardInner}
                  >
                    {/* Top Row: Icon + Name + Scores */}
                    <View style={styles.catHeader}>
                      <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                        <Ionicons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <View style={styles.catNameCol}>
                        <Text style={styles.catName}>{cat.label}</Text>
                        <Text style={styles.catTimeline}>{cat.timeline}</Text>
                      </View>
                      <View style={styles.catScoresRow}>
                        <Text style={[styles.catCurrentScore, { color: getScoreColor(cat.current) }]}>
                          {cat.current.toFixed(1)}
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.accent} style={{ marginHorizontal: 4 }} />
                        <Text style={[styles.catPotentialScore, { color: getScoreColor(cat.potential) }]}>
                          {cat.potential.toFixed(1)}
                        </Text>
                      </View>
                      <View style={[styles.pctBadge, { backgroundColor: `${cat.color}20` }]}>
                        <Text style={[styles.pctText, { color: cat.color }]}>+{cat.pct}%</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <Animated.View
                        style={[
                          styles.progressBarCurrent,
                          {
                            backgroundColor: `${cat.color}40`,
                            width: progressAnims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${potentialPct * 100}%`],
                            }),
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: cat.color,
                            width: progressAnims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${currentPct * 100}%`],
                            }),
                          },
                        ]}
                      />
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                      {cat.actions.map((action, j) => {
                        const locked = isLocked && j > 0;
                        return (
                          <View key={j} style={styles.actionRow}>
                            <View style={[styles.actionBullet, { backgroundColor: locked ? COLORS.textMuted : cat.color }]} />
                            {locked ? (
                              <View style={styles.actionLockedRow}>
                                <Text style={styles.actionTextBlurred} numberOfLines={1}>
                                  {action.replace(/[a-zA-Z]/g, '█')}
                                </Text>
                                <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
                              </View>
                            ) : (
                              <Text style={styles.actionText} numberOfLines={2}>{action}</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Lock overlay for non-pro */}
                    {isLocked && (
                      <TouchableOpacity
                        style={styles.cardLockOverlay}
                        onPress={handleUnlock}
                        activeOpacity={0.7}
                      >
                        <View style={styles.cardLockBadge}>
                          <Ionicons name="lock-closed" size={12} color={COLORS.accent} />
                          <Text style={styles.cardLockText}>Unlock with PRO</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </View>

          {/* ─── UNLOCK FULL PLAN CTA ─── */}
          {!pro && (
            <Animated.View style={[styles.ctaSection, { transform: [{ scale: ctaScale }] }]}>
              <LinearGradient
                colors={['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.03)']}
                style={styles.ctaCard}
              >
                <LinearGradient colors={GRADIENTS.accent} style={styles.ctaIconCircle}>
                  <Ionicons name="sparkles" size={28} color="#000" />
                </LinearGradient>
                <Text style={styles.ctaTitle}>Get Your Complete Transformation Plan</Text>
                <Text style={styles.ctaSubtitle}>Everything you need to reach your potential</Text>

                <View style={styles.ctaFeatures}>
                  {[
                    { icon: 'clipboard-outline', text: 'Personalized protocol' },
                    { icon: 'calendar-outline', text: 'Weekly milestones' },
                    { icon: 'cart-outline', text: 'Product recommendations' },
                    { icon: 'barbell-outline', text: 'Exercise routines' },
                  ].map((feat, i) => (
                    <View key={i} style={styles.ctaFeatureRow}>
                      <View style={styles.ctaFeatureIcon}>
                        <Ionicons name={feat.icon} size={16} color={COLORS.accent} />
                      </View>
                      <Text style={styles.ctaFeatureText}>{feat.text}</Text>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.scoreExcellent} />
                    </View>
                  ))}
                </View>

                <TouchableOpacity onPress={handleUnlock} activeOpacity={0.8}>
                  <LinearGradient colors={GRADIENTS.gold} style={styles.ctaButton}>
                    <Ionicons name="diamond" size={18} color="#000" />
                    <Text style={styles.ctaButtonText}>Unlock with PRO</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.ctaSocial}>
                  Join 12,000+ users on their glow-up journey
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* ─── SHARE SECTION ─── */}
          <View style={styles.shareSection}>
            <Animated.View style={{ transform: [{ scale: sharePulse }] }}>
              <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.05)']}
                  style={styles.shareButton}
                >
                  <View style={styles.shareIconWrap}>
                    <Ionicons name="share-social" size={22} color={COLORS.accent} />
                  </View>
                  <View style={styles.shareTextCol}>
                    <Text style={styles.shareTitle}>Share Your Potential</Text>
                    <Text style={styles.shareDesc}>
                      Show friends your {currentScore.toFixed(1)} → {potentialScore.toFixed(1)} transformation preview
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  fullFlex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  scroll: {
    paddingBottom: 20,
  },

  // Before / After Section
  shareableArea: {
    backgroundColor: COLORS.bgPrimary,
  },
  beforeAfterSection: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  beforeAfterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoColumn: {
    alignItems: 'center',
    flex: 1,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  photoCirclePotential: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
  },
  glowOverlayOuter: {
    flex: 1,
    borderRadius: 60,
    overflow: 'hidden',
  },
  potentialImageWrap: {
    flex: 1,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  goldOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 10,
  },
  scoreSub: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textTertiary,
    marginTop: -2,
  },

  // Arrow
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    gap: 6,
  },
  improvementBadge: {
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  improvementInner: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  improvementText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },

  // Timeline
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 16,
  },
  timelineCard: {
    borderRadius: RADIUS.lg,
    padding: 24,
    paddingBottom: 20,
    marginTop: 12,
  },
  timelineTrack: {
    height: 100,
    position: 'relative',
    marginHorizontal: 20,
  },
  timelineLineWrapper: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 3,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  timelineLineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
  timelineDotWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    marginLeft: -20,
    width: 40,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotFinal: {
    backgroundColor: COLORS.accentLight,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  timelineScore: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  timelineLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Category Cards
  categoryCard: {
    marginBottom: 12,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCardInner: {
    padding: 16,
    position: 'relative',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  catNameCol: {
    flex: 1,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catTimeline: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  catScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  catCurrentScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  catPotentialScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Progress Bar
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarCurrent: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    borderRadius: 3,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    borderRadius: 3,
  },

  // Actions
  actionsContainer: {
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  actionLockedRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTextBlurred: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 8,
  },

  // Card lock overlay
  cardLockOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  cardLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  cardLockText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  ctaCard: {
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  ctaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaFeatures: {
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  ctaFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(212,175,55,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaFeatureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: RADIUS.pill,
    gap: 8,
    width: width - 80,
    ...SHADOWS.goldGlow,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
  },
  ctaSocial: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 14,
    textAlign: 'center',
  },

  // Share Section
  shareSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    gap: 12,
  },
  shareIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTextCol: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shareDesc: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});

export default GlowUpPreviewScreen;
