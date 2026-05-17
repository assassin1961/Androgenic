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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SHADOWS, BLUR } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import { loadStreakState, getStreakState, markDayActive, getCurrentLevel, getLevelProgress, addXP } from '../utils/streaks';
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

const DAILY_CHALLENGES = [
  'Take a face scan and compare with yesterday',
  'Complete your morning skincare routine',
  'Practice mewing for 10 minutes',
  'Drink 8 glasses of water today',
  'Do 5 minutes of jawline exercises',
  'Apply SPF before going outside',
  'Get 8 hours of sleep tonight',
];

const TRENDING_TOPICS = [
  { title: 'Mewing results after 6 months', views: '12.4K', screen: 'Guides' },
  { title: 'Ice face method going viral', views: '8.7K', screen: 'LooksMaxHub' },
  { title: 'Best jawline exercises 2024', views: '15.2K', screen: 'Guides' },
  { title: 'Skincare routine that changed my face', views: '9.1K', screen: 'LooksMaxHub' },
  { title: 'How I went from 5 to 8 in 4 months', views: '22.3K', screen: 'LooksMaxHub' },
];

const SUCCESS_STORIES = [
  { name: 'Jake M.', quote: 'Went from 5.8 to 7.2 in 3 months', focus: 'Jawline focus', duration: '3 months', colors: ['#0044cc', '#0066ff'] },
  { name: 'Sarah K.', quote: 'Skin score improved 40% in 6 weeks', focus: 'Skincare focus', duration: '6 weeks', colors: ['#006b3c', '#00e676'] },
  { name: 'Mike R.', quote: 'Lost face fat, gained definition', focus: '4 month journey', duration: '4 months', colors: ['#8b1a4a', '#ff6090'] },
  { name: 'Alex T.', quote: 'Mewing + routine = complete transformation', focus: '6 months', duration: '6 months', colors: ['#b8860b', '#FFD700'] },
];

const CHALLENGE_STORAGE_KEY = 'androgenic_daily_challenge';

const STORE_URL = 'https://androgenicpeptides.lovable.app';

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [totalScans, setTotalScans] = useState(0);
  const [daysActive, setDaysActive] = useState(0);

  const loadData = useCallback(async () => {
    await Promise.all([loadProState(), loadStreakState()]);
    setStreakData(getStreakState());
    markDayActive().then(() => setStreakData(getStreakState()));
    const h = await getHistory();
    if (h && h.length > 0) {
      setLastScore(h[0]);
      setScanHistory(h);
    }
    // Load total scans and days active from streak state
    const currentState = getStreakState();
    setTotalScans(currentState.totalScans || 0);
    // Calculate days active from dailyXPHistory length or streak data
    const xpHistory = currentState.dailyXPHistory || [];
    setDaysActive(Math.max(xpHistory.length, currentState.currentStreak || 0));
    // Check daily challenge completion
    await checkChallengeCompletion();
    setReady(true);
  }, []);

  const checkChallengeCompletion = async () => {
    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setChallengeCompleted(parsed.date === today && parsed.completed);
      } else {
        setChallengeCompleted(false);
      }
    } catch {
      setChallengeCompleted(false);
    }
  };

  const handleCompleteChallenge = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const today = new Date().toDateString();
    try {
      await AsyncStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify({ date: today, completed: true }));
      setChallengeCompleted(true);
      await addXP(25, 'daily_challenge');
      setStreakData(getStreakState());
    } catch {}
  };

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
  const todayChallenge = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];

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
    { icon: 'options', text: 'Calibrate', screen: 'Calibration', color: '#7c4dff' },
    { icon: 'images', text: 'Photo Rank', screen: 'PhotoRanking', color: '#ff6090' },
  ];

  // Progress data
  const hasScans = scanHistory.length >= 2;
  const firstScore = hasScans ? scanHistory[scanHistory.length - 1]?.scores?.overall : null;
  const latestScore = hasScans ? scanHistory[0]?.scores?.overall : null;
  const scoreImproved = hasScans && latestScore > firstScore;

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
        {/* Quick Stats Bar - after header, before level bar */}
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <View style={styles.quickStatsBar}>
            <View style={styles.quickStatPill}>
              <Ionicons name="scan-outline" size={12} color={COLORS.accentLight} />
              <Text style={styles.quickStatValue}>{totalScans}</Text>
              <Text style={styles.quickStatLabel}>Scans</Text>
            </View>
            <View style={styles.quickStatPill}>
              <Ionicons name="flame-outline" size={12} color="#ff6b35" />
              <Text style={styles.quickStatValue}>{streakData?.currentStreak || 0}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStatPill}>
              <Ionicons name="calendar-outline" size={12} color="#00e676" />
              <Text style={styles.quickStatValue}>{daysActive}</Text>
              <Text style={styles.quickStatLabel}>Days</Text>
            </View>
          </View>
        </Animated.View>

        {/* Section 0: Level + Progress Widget + Scan CTA */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
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

          {/* Progress Widget - shown only if user has previous scans */}
          {hasScans && (
            <TouchableOpacity style={styles.progressWidget} onPress={() => navigation.navigate('ProgressTimeline')} activeOpacity={0.7}>
              <View style={styles.progressHeader}>
                <Ionicons name="trending-up" size={14} color={COLORS.accentLight} />
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
              <View style={styles.progressBody}>
                <View style={styles.progressScores}>
                  <Text style={styles.progressFirstScore}>{firstScore}</Text>
                  <Ionicons name={scoreImproved ? 'arrow-forward' : 'arrow-forward'} size={14} color={scoreImproved ? '#00e676' : '#ffab40'} />
                  <Text style={[styles.progressLatestScore, { color: scoreImproved ? '#00e676' : '#ffab40' }]}>{latestScore}</Text>
                </View>
                <View style={styles.progressDots}>
                  {scanHistory.slice(0, 7).reverse().map((scan, idx) => {
                    const score = scan?.scores?.overall || 0;
                    const normalizedHeight = Math.max((score / 100) * 16, 4);
                    return (
                      <View key={idx} style={[styles.progressDot, { height: normalizedHeight, backgroundColor: score >= 70 ? '#00e676' : score >= 40 ? '#ffab40' : '#ff5252' }]} />
                    );
                  })}
                </View>
                <View style={styles.progressStreak}>
                  <Ionicons name="flame" size={12} color="#ff6b35" />
                  <Text style={styles.progressStreakText}>{daysActive} days active</Text>
                </View>
              </View>
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

        {/* Trending Now Section - after Today's Tip */}
        <Animated.View entering={FadeInDown.duration(400).delay(360)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LooksMaxHub')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll} contentContainerStyle={styles.trendingScrollContent}>
            {TRENDING_TOPICS.map((topic, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(topic.screen);
                }}
              >
                <View style={styles.trendingCard}>
                  <LinearGradient
                    colors={['rgba(0,102,255,0.12)', 'rgba(0,102,255,0.03)']}
                    style={styles.trendingCardGradient}
                  >
                    <View style={styles.trendingCardHeader}>
                      <Ionicons name="trending-up" size={14} color="#0066ff" />
                      <Text style={styles.trendingViews}>{topic.views} views</Text>
                    </View>
                    <Text style={styles.trendingTitle} numberOfLines={2}>{topic.title}</Text>
                    <View style={styles.trendingArrow}>
                      <Ionicons name="arrow-up" size={10} color="#00e676" />
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Daily Challenge Card - after TOOLS grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(520)}>
          <View style={styles.dailyChallengeCard}>
            <LinearGradient
              colors={['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.04)']}
              style={styles.dailyChallengeGradient}
            >
              <View style={styles.dailyChallengeHeader}>
                <View style={styles.dailyChallengeBadge}>
                  <Ionicons name="flash" size={10} color="#fff" />
                  <Text style={styles.dailyChallengeBadgeText}>Daily Challenge</Text>
                </View>
                <View style={styles.dailyChallengeXP}>
                  <Text style={styles.dailyChallengeXPText}>+25 XP</Text>
                </View>
              </View>
              <Text style={styles.dailyChallengeText}>{todayChallenge}</Text>
              <TouchableOpacity
                style={[styles.dailyChallengeBtn, challengeCompleted && styles.dailyChallengeBtnDone]}
                onPress={!challengeCompleted ? handleCompleteChallenge : undefined}
                activeOpacity={challengeCompleted ? 1 : 0.7}
              >
                <Ionicons
                  name={challengeCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={challengeCompleted ? '#00e676' : COLORS.textSecondary}
                />
                <Text style={[styles.dailyChallengeBtnText, challengeCompleted && { color: '#00e676' }]}>
                  {challengeCompleted ? 'Completed!' : 'Mark Complete'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
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
                { icon: 'stats-chart', title: 'Statistical Report', sub: 'Bell curve & percentile analysis', screen: 'StatisticalReport', color: '#4d94ff' },
                { icon: 'earth', title: 'Demographic Insights', sub: 'How different groups perceive you', screen: 'DemographicInsights', color: '#7c4dff' },
                { icon: 'camera', title: 'Photo Ranking', sub: 'Find your best photo', screen: 'PhotoRanking', color: '#ff6090' },
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

        {/* Success Stories Carousel - after PRO features section */}
        <Animated.View entering={FadeInDown.duration(400).delay(620)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Success Stories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BeforeAfter')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.successScroll} contentContainerStyle={styles.successScrollContent}>
            {SUCCESS_STORIES.map((story, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('BeforeAfter');
                }}
              >
                <LinearGradient
                  colors={story.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.successCard}
                >
                  <Text style={styles.successName}>{story.name}</Text>
                  <Text style={styles.successQuote}>{story.quote}</Text>
                  <View style={styles.successMeta}>
                    <Text style={styles.successDuration}>{story.duration}</Text>
                    <Text style={styles.successFocus}>{story.focus}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  // Quick Stats Bar
  quickStatsBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12, marginTop: 4,
  },
  quickStatPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  quickStatValue: { color: '#fff', fontSize: 12, fontWeight: '800' },
  quickStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },

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

  // Progress Widget
  progressWidget: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  progressHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
  },
  progressTitle: { flex: 1, color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  progressBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressScores: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressFirstScore: { color: COLORS.textMuted, fontSize: 18, fontWeight: '800' },
  progressLatestScore: { fontSize: 18, fontWeight: '900' },
  progressDots: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 },
  progressDot: { width: 4, borderRadius: 2, minHeight: 4 },
  progressStreak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  progressStreakText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },

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

  // Trending Section
  trendingScroll: { marginBottom: 14, marginHorizontal: -20 },
  trendingScrollContent: { paddingHorizontal: 20, gap: 10 },
  trendingCard: {
    width: 160, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  trendingCardGradient: { padding: 12, minHeight: 95 },
  trendingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  trendingViews: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600' },
  trendingTitle: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 16, flex: 1 },
  trendingArrow: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,230,118,0.12)',
    justifyContent: 'center', alignItems: 'center', marginTop: 8, alignSelf: 'flex-end',
  },

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

  // Daily Challenge
  dailyChallengeCard: { marginBottom: 14, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderAccent },
  dailyChallengeGradient: { padding: 14 },
  dailyChallengeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dailyChallengeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#0066ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  dailyChallengeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  dailyChallengeXP: {
    backgroundColor: 'rgba(0,230,118,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  dailyChallengeXPText: { color: '#00e676', fontSize: 10, fontWeight: '800' },
  dailyChallengeText: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 12 },
  dailyChallengeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  dailyChallengeBtnDone: { backgroundColor: 'rgba(0,230,118,0.08)', borderColor: 'rgba(0,230,118,0.25)' },
  dailyChallengeBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },

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

  // Success Stories
  successScroll: { marginBottom: 14, marginHorizontal: -20 },
  successScrollContent: { paddingHorizontal: 20, gap: 10 },
  successCard: {
    width: 180, borderRadius: 14, padding: 14, minHeight: 120, justifyContent: 'flex-end',
  },
  successName: { color: '#fff', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  successQuote: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600', lineHeight: 15, marginBottom: 8 },
  successMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successDuration: {
    color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  successFocus: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '500' },
});

export default HomeScreen;
