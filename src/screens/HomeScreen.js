import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import { loadStreakState, getStreakState, markDayActive, getCurrentLevel, getLevelProgress } from '../utils/streaks';
import { getHistory } from '../utils/history';

const { width } = Dimensions.get('window');
const COL3 = (width - 56) / 3;
const COL4 = (width - 66) / 4;

const DAILY_TIPS = [
  { tip: 'Drink 3L of water today for clearer skin and better facial definition.', icon: 'water', color: '#00b4d8' },
  { tip: 'Practice mewing for 10 minutes. Tongue flat on the roof of your mouth.', icon: 'fitness', color: '#0066ff' },
  { tip: 'Apply SPF 50 sunscreen. UV damage is the #1 cause of premature aging.', icon: 'sunny', color: '#ffab40' },
  { tip: 'Do 3 sets of chin tucks to improve jawline definition and posture.', icon: 'body', color: '#ff6b35' },
  { tip: 'Use a retinol serum tonight. It boosts collagen and reduces fine lines.', icon: 'sparkles', color: '#00e676' },
  { tip: 'Sleep on your back tonight. Side sleeping causes facial asymmetry.', icon: 'moon', color: '#4d94ff' },
  { tip: 'Chew mastic gum for 20 minutes to build masseter muscles.', icon: 'shield', color: '#ff5252' },
  { tip: 'Cold shower for 60 seconds. It reduces facial puffiness and boosts circulation.', icon: 'snow', color: '#00e5ff' },
  { tip: 'Apply vitamin C serum this morning for brighter, more even skin tone.', icon: 'flask', color: '#ffab40' },
  { tip: 'Do 50 neck curls before bed. Strong neck = better jaw definition.', icon: 'barbell', color: '#ff6090' },
];

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [lastScore, setLastScore] = useState(null);

  // Staggered opacity-only fades (no transforms = no scroll jank)
  const sectionFades = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Promise.all([loadProState(), loadStreakState()]).then(() => {
      setStreakData(getStreakState());
      markDayActive().then(() => setStreakData(getStreakState()));
      setReady(true);
    });
    getHistory().then((h) => {
      if (h && h.length > 0) setLastScore(h[0]);
    });
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      Promise.all([loadProState(), loadStreakState()]).then(() => {
        setStreakData(getStreakState());
        setReady(true);
      });
      getHistory().then((h) => {
        if (h && h.length > 0) setLastScore(h[0]);
      });
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    if (!ready) return;
    // Staggered fade-in: each section fades in 120ms after the previous
    sectionFades.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: i * 120,
        useNativeDriver: true,
      }).start();
    });
  }, [ready]);

  const level = streakData ? getCurrentLevel() : null;
  const levelProgress = streakData ? getLevelProgress() : 0;
  const todayTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
  const todayTip2 = DAILY_TIPS[(new Date().getDate() + 3) % DAILY_TIPS.length];

  const handleCamera = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  }, [navigation]);

  const handleUpload = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Photo library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  }, [navigation]);

  if (!ready) return <View style={styles.container} />;

  const scansLeft = getScansRemaining();
  const pro = isPro();

  const QUICK_ACTIONS = [
    { icon: 'time', text: 'History', screen: 'History', color: '#4d94ff' },
    { icon: 'trending-up', text: 'Progress', screen: 'Progress', color: '#00e676' },
    { icon: 'book', text: 'Guides', screen: 'Guides', color: '#1de9b6' },
    { icon: 'bulb', text: 'Tips', screen: 'DailyTips', color: '#ffab40' },
  ];

  const FEATURES = [
    { icon: 'bulb', text: 'IQ Score', screen: 'AndrogenicIQ', color: '#FFD700' },
    { icon: 'people', text: 'Community', screen: 'Forum', color: '#00e676' },
    { icon: 'chatbubbles', text: 'AI Chat', screen: 'Chat', color: '#0066ff' },
    { icon: 'globe', text: 'LooksMax', screen: 'LooksMaxHub', color: '#ff6090' },
    { icon: 'flask', text: 'Peptides', screen: 'Products', color: '#4d94ff' },
    { icon: 'flame', text: 'Challenge', screen: 'Challenge', color: '#ff6b35' },
    { icon: 'today', text: 'Routine', screen: 'RoutineTab', color: '#00e676' },
    { icon: 'trophy', text: 'Achieve', screen: 'Achievements', color: '#FFD700' },
    { icon: 'analytics', text: 'Insights', screen: 'WeeklyInsights', color: '#0066ff' },
    { icon: 'barbell', text: 'Workouts', screen: 'Workout', color: '#ff5252' },
    { icon: 'water', text: 'Water', screen: 'WaterTracker', color: '#00b4d8' },
    { icon: 'podium', text: 'Ranks', screen: 'LeaderboardTab', color: '#FFD700' },
    { icon: 'body', text: 'Body Fat', screen: 'BodyFat', color: '#4d94ff' },
    { icon: 'color-palette', text: 'Skin Tone', screen: 'SkinTone', color: '#ff6090' },
    { icon: 'sparkles', text: 'Glow-Up', screen: 'GlowUpSimulator', color: '#00e5ff' },
    { icon: 'nutrition', text: 'Nutrition', screen: 'NutritionGuide', color: '#ffab40' },
    { icon: 'book', text: 'Guides', screen: 'Guides', color: '#1de9b6' },
    { icon: 'bag', text: 'Products', screen: 'Products', color: '#ffab40' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header - fixed, no animation */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ANDROGENIC</Text>
          <Text style={styles.tagline}>AI Face Analysis</Text>
        </View>
        <View style={styles.headerRight}>
          {streakData && streakData.currentStreak > 0 && (
            <TouchableOpacity style={styles.streakChip} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
              <Ionicons name="flame" size={14} color="#ff6b35" />
              <Text style={styles.streakNum}>{streakData.currentStreak}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={17} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="person-outline" size={17} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        removeClippedSubviews={true}
      >
        {/* Section 0: Level + Scan CTA */}
        <Animated.View style={{ opacity: sectionFades[0] }}>
          {/* Level Bar */}
          {streakData && (
            <TouchableOpacity style={styles.levelBar} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
              <View style={styles.levelLeft}>
                <Text style={styles.levelLabel}>Lv.{level?.level || 1}</Text>
                <Text style={[styles.levelName, level && { color: level.color }]}>{level?.name || 'Newbie'}</Text>
              </View>
              <View style={styles.xpBarOuter}>
                <View style={[styles.xpBarInner, { width: `${Math.max(levelProgress * 100, 3)}%` }]} />
              </View>
              <Text style={styles.xpText}>{streakData.totalXP} XP</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          {/* Scan CTA */}
          <View style={styles.scanSection}>
            <LinearGradient colors={['#0055dd', '#0088ff']} style={styles.scanIconBg}>
              <Ionicons name="scan" size={30} color="#fff" />
            </LinearGradient>
            <Text style={styles.scanTitle}>Analyze Your Face</Text>
            <Text style={styles.scanSub}>AI scoring across 7 categories with personalized tips</Text>
            <View style={styles.scanButtons}>
              <TouchableOpacity onPress={handleCamera} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={['#0055dd', '#0077ff']} style={styles.scanBtn}>
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.scanBtnText}>Take Selfie</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpload} activeOpacity={0.85} style={styles.uploadBtn}>
                <Ionicons name="image-outline" size={18} color={COLORS.accentLight} />
              </TouchableOpacity>
            </View>
            {!pro && (
              <View style={styles.scansRow}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.scanDot, i < scansLeft && styles.scanDotActive]} />
                ))}
                <Text style={styles.scansLabel}>{scansLeft} free scan{scansLeft !== 1 ? 's' : ''} left</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Section 1: PRO Banner + Last Score */}
        <Animated.View style={{ opacity: sectionFades[1] }}>
          {!pro && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proBanner}>
                <Ionicons name="diamond" size={15} color="#000" />
                <Text style={styles.proBannerText}>Unlock PRO - Unlimited Scans & All Features</Text>
                <Ionicons name="arrow-forward" size={16} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Last Score Summary */}
          {lastScore && (
            <TouchableOpacity style={styles.lastScoreCard} onPress={() => navigation.navigate('History')} activeOpacity={0.7}>
              <View style={styles.lastScoreLeft}>
                <Text style={styles.lastScoreLabel}>Last Score</Text>
                <Text style={styles.lastScoreDate}>
                  {new Date(lastScore.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.lastScoreBadge}>
                <Text style={[styles.lastScoreNum, {
                  color: lastScore.scores.overall >= 70 ? '#00e676' : lastScore.scores.overall >= 40 ? '#ffab40' : '#ff5252'
                }]}>
                  {lastScore.scores.overall}
                </Text>
              </View>
              <View style={styles.lastScoreRight}>
                <Text style={styles.lastScoreRating}>{lastScore.scores.overallRating}/10</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          )}

          {/* Quick Actions Row */}
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickItem} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.7}>
                <View style={[styles.quickIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={styles.quickText}>{a.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Section 2: Daily Tips */}
        <Animated.View style={{ opacity: sectionFades[2] }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DailyTips')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: todayTip.color + '15' }]}>
              <Ionicons name={todayTip.icon} size={16} color={todayTip.color} />
            </View>
            <Text style={styles.tipText}>{todayTip.tip}</Text>
          </View>
          <View style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: todayTip2.color + '15' }]}>
              <Ionicons name={todayTip2.icon} size={16} color={todayTip2.color} />
            </View>
            <Text style={styles.tipText}>{todayTip2.tip}</Text>
          </View>
        </Animated.View>

        {/* Section 3: Features Grid */}
        <Animated.View style={{ opacity: sectionFades[3] }}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.grid}>
            {FEATURES.map((f, i) => (
              <TouchableOpacity key={i} style={styles.gridItem} onPress={() => navigation.navigate(f.screen)} activeOpacity={0.7}>
                <View style={[styles.gridIcon, { backgroundColor: f.color + '15' }]}>
                  <Ionicons name={f.icon} size={18} color={f.color} />
                </View>
                <Text style={styles.gridText} numberOfLines={1}>{f.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Section 4: PRO Features (for free users) */}
        <Animated.View style={{ opacity: sectionFades[4] }}>
          {!pro && (
            <>
              <Text style={styles.sectionTitle}>PRO Features</Text>
              {[
                { icon: 'sparkles', title: 'Glow-Up Simulator', sub: 'See your potential transformation', screen: 'GlowUpSimulator', color: '#00e5ff' },
                { icon: 'bulb', title: 'AI Recommendations', sub: 'Personalized action plan', screen: 'AIRecommendations', color: '#0066ff' },
                { icon: 'document-text', title: 'Glow-Up Report', sub: 'Detailed analysis breakdown', screen: 'GlowUpReport', color: '#00e676' },
                { icon: 'images', title: 'Transformations', sub: 'Before & after tracking', screen: 'BeforeAfter', color: '#ffab40' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.proCard} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
                  <View style={[styles.proCardIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proCardTitle}>{item.title}</Text>
                    <Text style={styles.proCardSub}>{item.sub}</Text>
                  </View>
                  <View style={styles.proPill}><Text style={styles.proPillText}>PRO</Text></View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </Animated.View>

        {/* Section 5: Bottom social proof */}
        <Animated.View style={{ opacity: sectionFades[5] }}>
          {!pro && (
            <TouchableOpacity style={styles.socialProof} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <View style={styles.socialStars}>
                {[0,1,2,3,4].map((i) => <Ionicons key={i} name="star" size={12} color="#FFD700" />)}
              </View>
              <Text style={styles.socialText}>Rated 4.9 by 12,000+ users</Text>
              <Text style={styles.socialCta}>Join PRO</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6,
  },
  logo: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
  tagline: { fontSize: 9, color: '#0077ff', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,107,53,0.12)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10,
  },
  streakNum: { color: '#ff6b35', fontSize: 13, fontWeight: '800' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },

  // Level Bar
  levelBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  levelLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  levelName: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '800' },
  xpBarOuter: { flex: 1, height: 3, backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden' },
  xpBarInner: { height: '100%', backgroundColor: '#0066ff', borderRadius: 2 },
  xpText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },

  // Scan Section
  scanSection: { alignItems: 'center', paddingTop: 12, paddingBottom: 16, marginBottom: 4 },
  scanIconBg: {
    width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, ...SHADOWS.accentGlow,
  },
  scanTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: 0.3 },
  scanSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  scanButtons: { flexDirection: 'row', gap: 8, width: '100%' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, gap: 8 },
  scanBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  uploadBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  scansRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  scanDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  scanDotActive: { backgroundColor: '#0066ff' },
  scansLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },

  // PRO Banner
  proBanner: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 10, gap: 8,
  },
  proBannerText: { flex: 1, color: '#000', fontSize: 12, fontWeight: '700' },

  // Last Score
  lastScoreCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 10, padding: 12, marginBottom: 10, gap: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  lastScoreLeft: { flex: 1 },
  lastScoreLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  lastScoreDate: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  lastScoreBadge: { alignItems: 'center' },
  lastScoreNum: { fontSize: 24, fontWeight: '900' },
  lastScoreRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lastScoreRating: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },

  // Quick Actions
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickItem: { flex: 1, alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  quickIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  quickText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  seeAll: { color: '#0066ff', fontSize: 12, fontWeight: '600' },

  // Tips
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard,
    borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  tipIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },

  // 3-col Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  gridItem: {
    width: COL3, alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  gridIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  gridText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // PRO Cards
  proCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 10, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  proCardIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  proCardTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  proCardSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  proPill: { backgroundColor: COLORS.gold, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  proPillText: { fontSize: 8, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  // Social Proof
  socialProof: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, marginTop: 8,
  },
  socialStars: { flexDirection: 'row', gap: 1 },
  socialText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  socialCta: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
});

export default HomeScreen;
