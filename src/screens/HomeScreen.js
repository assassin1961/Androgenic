import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Dimensions, ScrollView, Linking, RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, BLUR } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import { loadStreakState, getStreakState, markDayActive, getCurrentLevel, getLevelProgress } from '../utils/streaks';
import { getHistory } from '../utils/history';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

const DAILY_TIPS = [
  { tip: 'Drink 3L of water today for clearer skin and better facial definition.', icon: 'water', color: '#00b4d8' },
  { tip: 'Practice mewing for 10 minutes. Tongue flat on the roof of your mouth.', icon: 'fitness', color: '#0066ff' },
  { tip: 'Apply SPF 50 sunscreen. UV damage is the #1 cause of premature aging.', icon: 'sunny', color: '#ffab40' },
  { tip: 'Do 3 sets of chin tucks to improve jawline definition and posture.', icon: 'body', color: '#ff6b35' },
  { tip: 'Use a retinol serum tonight. It boosts collagen and reduces fine lines.', icon: 'sparkles', color: '#00e676' },
  { tip: 'Sleep on your back tonight. Side sleeping causes facial asymmetry.', icon: 'moon', color: '#4d94ff' },
  { tip: 'Chew mastic gum for 20 minutes to build masseter muscles.', icon: 'shield', color: '#ff5252' },
  { tip: 'Cold shower for 60 seconds. Reduces puffiness and boosts circulation.', icon: 'snow', color: '#00e5ff' },
  { tip: 'Apply vitamin C serum this morning for brighter, more even skin tone.', icon: 'flask', color: '#ffab40' },
  { tip: 'Do 50 neck curls before bed. Strong neck = better jaw definition.', icon: 'barbell', color: '#ff6090' },
];

const STORE_URL = 'https://androgenicpeptides.lovable.app';

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [lastScore, setLastScore] = useState(null);

  const loadData = useCallback(async () => {
    await Promise.all([loadProState(), loadStreakState()]);
    setStreakData(getStreakState());
    markDayActive().then(() => setStreakData(getStreakState()));
    const h = await getHistory();
    if (h && h.length > 0) setLastScore(h[0]);
    setReady(true);
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const level = streakData ? getCurrentLevel() : null;
  const levelProgress = streakData ? getLevelProgress() : 0;
  const todayTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

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

  // Featured: big cards for key features
  const FEATURED = [
    { icon: 'bulb', title: 'Androgenic IQ', sub: 'Your facial intelligence score', screen: 'AndrogenicIQ', colors: ['#b8860b', '#FFD700'] },
    { icon: 'chatbubbles', title: 'AI Advisor', sub: 'Get personalized advice', screen: 'Chat', colors: ['#0044cc', '#0066ff'] },
    { icon: 'people', title: 'Community', sub: 'Join 47K+ looksmaxxers', screen: 'Forum', colors: ['#006b3c', '#00e676'] },
    { icon: 'globe', title: 'LooksMax Hub', sub: 'Trending & success stories', screen: 'LooksMaxHub', colors: ['#8b1a4a', '#ff6090'] },
  ];

  // Tools grid: compact, no duplicates — includes new features
  const TOOLS = [
    { icon: 'flame', text: 'Challenge', screen: 'Challenge', color: '#ff6b35' },
    { icon: 'today', text: 'Routine', screen: 'RoutineTab', color: '#00e676' },
    { icon: 'trophy', text: 'Streaks', screen: 'StreakCalendar', color: '#FFD700' },
    { icon: 'analytics', text: 'Insights', screen: 'WeeklyInsights', color: '#0066ff' },
    { icon: 'flask', text: 'Skincare', screen: 'SkincareAnalyzer', color: '#a855f7' },
    { icon: 'scan', text: 'Symmetry', screen: 'FaceSymmetry', color: '#00e5ff' },
    { icon: 'nutrition', text: 'Meals', screen: 'MealPlan', color: '#ffab40' },
    { icon: 'moon', text: 'Sleep', screen: 'SleepTracker', color: '#4d94ff' },
    { icon: 'barbell', text: 'Workouts', screen: 'Workout', color: '#ff5252' },
    { icon: 'water', text: 'Water', screen: 'WaterTracker', color: '#00b4d8' },
    { icon: 'gift', text: 'Refer', screen: 'Referral', color: '#FFD700' },
    { icon: 'book', text: 'Guides', screen: 'Guides', color: '#1de9b6' },
  ];

  return (
    <GlassBackground variant="blue">
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ANDROGENIC</Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={COLORS.accent} colors={[COLORS.accent]}
            progressBackgroundColor="#000" />
        }
      >
        {/* Section 0: Level + Scan CTA */}
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          {streakData && (
            <TouchableOpacity style={styles.levelBar} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
              <Text style={styles.levelLabel}>Lv.{level?.level || 1}</Text>
              <Text style={[styles.levelName, level && { color: level.color }]}>{level?.name || 'Newbie'}</Text>
              <View style={styles.xpBarOuter}>
                <View style={[styles.xpBarInner, { width: `${Math.max(levelProgress * 100, 3)}%` }]} />
              </View>
              <Text style={styles.xpText}>{streakData.totalXP} XP</Text>
            </TouchableOpacity>
          )}

          <View style={styles.scanSection}>
            <LinearGradient colors={['#0055dd', '#0088ff']} style={styles.scanIconBg}>
              <Ionicons name="scan" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.scanTitle}>Analyze Your Face</Text>
            <Text style={styles.scanSub}>AI-powered scoring across 7 categories</Text>
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

        {/* Section 1: Last Score + Quick Nav */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
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

          <View style={styles.quickRow}>
            {[
              { icon: 'time', text: 'History', screen: 'History', color: '#4d94ff' },
              { icon: 'git-branch', text: 'Timeline', screen: 'ProgressTimeline', color: '#00e676' },
              { icon: 'share-social', text: 'Share', screen: 'ShareTemplates', color: '#0066ff' },
              { icon: 'bulb', text: 'Tips', screen: 'DailyTips', color: '#ffab40' },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickItem} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.7}>
                <View style={[styles.quickIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon} size={16} color={a.color} />
                </View>
                <Text style={styles.quickText}>{a.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Section 2: Featured Cards (2x2 grid) */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <View style={styles.featuredGrid}>
            {FEATURED.map((f, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => navigation.navigate(f.screen)}>
                <LinearGradient colors={f.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredCard}>
                  <View style={styles.featuredIconWrap}>
                    <Ionicons name={f.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.featuredTitle}>{f.title}</Text>
                  <Text style={styles.featuredSub}>{f.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Section 3: PRO Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          {!pro && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proBanner}>
                <Ionicons name="diamond" size={14} color="#000" />
                <Text style={styles.proBannerText}>Unlock PRO - Unlimited Scans & All Features</Text>
                <Ionicons name="arrow-forward" size={14} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Section 4: Daily Tip */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tip</Text>
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
        </Animated.View>

        {/* Section 5: Peptides Store Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <TouchableOpacity onPress={() => Linking.openURL(STORE_URL)} activeOpacity={0.85}>
            <LinearGradient colors={['#0044cc', '#0066ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.storeBanner}>
              <View style={styles.storeIconWrap}>
                <Ionicons name="flask" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeBannerTitle}>Androgenic Peptides</Text>
                <Text style={styles.storeBannerSub}>Premium peptides for peak aesthetics</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Section 6: Tools Grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(480)}>
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.grid}>
            {TOOLS.map((f, i) => (
              <TouchableOpacity key={i} style={styles.gridItem} onPress={() => navigation.navigate(f.screen)} activeOpacity={0.7}>
                <View style={[styles.gridIcon, { backgroundColor: f.color + '12' }]}>
                  <Ionicons name={f.icon} size={18} color={f.color} />
                </View>
                <Text style={styles.gridText} numberOfLines={1}>{f.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Section 7: PRO Features + Social Proof */}
        <Animated.View entering={FadeInDown.duration(400).delay(560)}>
          {!pro && (
            <>
              {[
                { icon: 'sparkles', title: 'Glow-Up Simulator', sub: 'See your potential transformation', screen: 'GlowUpSimulator', color: '#00e5ff' },
                { icon: 'document-text', title: 'Glow-Up Report', sub: 'Detailed analysis breakdown', screen: 'GlowUpReport', color: '#00e676' },
                { icon: 'images', title: 'Transformations', sub: 'Before & after tracking', screen: 'BeforeAfter', color: '#ffab40' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.proCard} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
                  <View style={[styles.proCardIcon, { backgroundColor: item.color + '12' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proCardTitle}>{item.title}</Text>
                    <Text style={styles.proCardSub}>{item.sub}</Text>
                  </View>
                  <View style={styles.proPill}><Text style={styles.proPillText}>PRO</Text></View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.socialProof} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
                <View style={styles.socialStars}>
                  {[0,1,2,3,4].map((i) => <Ionicons key={i} name="star" size={11} color="#FFD700" />)}
                </View>
                <Text style={styles.socialText}>Rated 4.9 by 12,000+ users</Text>
                <Text style={styles.socialCta}>Join PRO</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
    </GlassBackground>
  );
};

const COL3 = (width - 56) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6,
  },
  logo: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,107,53,0.12)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10,
  },
  streakNum: { color: '#ff6b35', fontSize: 13, fontWeight: '800' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },

  // Level Bar
  levelBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  levelLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  levelName: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '800' },
  xpBarOuter: { flex: 1, height: 3, backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden' },
  xpBarInner: { height: '100%', backgroundColor: '#0066ff', borderRadius: 2 },
  xpText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },

  // Scan Section
  scanSection: { alignItems: 'center', paddingTop: 8, paddingBottom: 14, marginBottom: 4 },
  scanIconBg: {
    width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, ...SHADOWS.accentGlow,
  },
  scanTitle: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 3 },
  scanSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 },
  scanButtons: { flexDirection: 'row', gap: 8, width: '100%' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, gap: 8 },
  scanBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  uploadBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: COLORS.borderLight, justifyContent: 'center', alignItems: 'center',
  },
  scansRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  scanDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  scanDotActive: { backgroundColor: '#0066ff' },
  scansLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },

  // Last Score
  lastScoreCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 12, marginBottom: 10, gap: 10, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  lastScoreLeft: { flex: 1 },
  lastScoreLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  lastScoreDate: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  lastScoreBadge: { alignItems: 'center' },
  lastScoreNum: { fontSize: 24, fontWeight: '900' },
  lastScoreRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lastScoreRating: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },

  // Quick Actions
  quickRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  quickItem: {
    flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  quickIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 3 },
  quickText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },

  // Featured Cards
  featuredGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  featuredCard: {
    width: CARD_W, borderRadius: 14, padding: 14, minHeight: 100,
    justifyContent: 'flex-end',
  },
  featuredIconWrap: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  featuredTitle: { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  featuredSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, lineHeight: 14 },

  // PRO Banner
  proBanner: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 12, gap: 8,
  },
  proBannerText: { flex: 1, color: '#000', fontSize: 12, fontWeight: '700' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.3 },
  seeAll: { color: '#0066ff', fontSize: 11, fontWeight: '600', marginBottom: 8 },

  // Tip
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  tipIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },

  // Store Banner
  storeBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14,
    marginBottom: 14, gap: 10,
  },
  storeIconWrap: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  storeBannerTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  storeBannerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 1 },

  // Tools Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  gridItem: {
    width: COL3, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 4, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  gridIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  gridText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // PRO Cards
  proCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  proCardIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  proCardTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  proCardSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  proPill: { backgroundColor: COLORS.gold, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  proPillText: { fontSize: 8, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  // Social Proof
  socialProof: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 10, marginTop: 4,
  },
  socialStars: { flexDirection: 'row', gap: 1 },
  socialText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  socialCta: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
});

export default HomeScreen;
