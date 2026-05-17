import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Dimensions, ScrollView, RefreshControl, Image,
} from 'react-native';
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS } from '../utils/theme';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import { loadStreakState, getStreakState, markDayActive, getCurrentLevel } from '../utils/streaks';
import { getHistory } from '../utils/history';

const { width } = Dimensions.get('window');

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E5C76B';
const CARD_BG = '#1A1A1A';
const CARD_BORDER = '#1F1F1F';
const TEXT_SECONDARY = '#999999';
const TEXT_MUTED = '#666666';

const DAILY_TIPS = [
  'Drink 3L of water today for clearer skin and better facial definition.',
  'Practice mewing for 10 minutes. Tongue flat on the roof of your mouth.',
  'Apply SPF 50 sunscreen. UV damage is the #1 cause of premature aging.',
  'Do 3 sets of chin tucks to improve jawline definition and posture.',
  'Use a retinol serum tonight. It boosts collagen and reduces fine lines.',
  'Sleep on your back tonight. Side sleeping causes facial asymmetry.',
  'Chew mastic gum for 20 minutes to build masseter muscles.',
  'Cold shower for 60 seconds. Reduces puffiness and boosts circulation.',
  'Apply vitamin C serum this morning for brighter, more even skin tone.',
  'Do 50 neck curls before bed. Strong neck = better jaw definition.',
];

const getScoreLabel = (rating) => {
  if (rating >= 8) return 'Exceptional';
  if (rating >= 7) return 'Above Average';
  if (rating >= 6) return 'Average';
  if (rating >= 5) return 'Below Average';
  return 'Needs Work';
};

const getScoreColor = (rating) => {
  if (rating >= 8) return '#00e676';
  if (rating >= 7) return '#4dff88';
  if (rating >= 6) return GOLD;
  if (rating >= 5) return '#ffab40';
  return '#ff5252';
};

// Pulsing ring component for the scan button
const PulsingRing = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulsingRing, animatedStyle]} />
  );
};

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [totalScans, setTotalScans] = useState(0);

  const loadData = useCallback(async () => {
    await Promise.all([loadProState(), loadStreakState()]);
    setStreakData(getStreakState());
    markDayActive().then(() => setStreakData(getStreakState()));
    const h = await getHistory();
    if (h && h.length > 0) {
      setLastScore(h[0]);
      setScanHistory(h);
    }
    const currentState = getStreakState();
    setTotalScans(currentState.totalScans || 0);
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

  const handleScan = useCallback(async () => {
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

  if (!ready) return <View style={styles.container} />;

  const pro = isPro();
  const level = streakData ? getCurrentLevel() : null;
  const todayTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
  const hasScans = scanHistory.length > 0;
  const overallRating = lastScore?.scores?.overallRating;
  const scoreColor = overallRating ? getScoreColor(overallRating) : GOLD;
  const scoreLabel = overallRating ? getScoreLabel(overallRating) : '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>ANDROGENIC</Text>
          {pro && (
            <View style={styles.proBadge}>
              <Ionicons name="diamond" size={10} color={GOLD} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GOLD}
            colors={[GOLD]}
            progressBackgroundColor="#000"
          />
        }
      >
        {/* Hero Scan Section */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <TouchableOpacity
            onPress={handleScan}
            activeOpacity={0.85}
            style={styles.scanButtonOuter}
          >
            <PulsingRing />
            <View style={styles.scanButtonRing}>
              <View style={styles.scanButtonInner}>
                <Ionicons name="scan" size={48} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Scan Your Face</Text>
          <Text style={styles.scanSubtitle}>AI-powered analysis in seconds</Text>
        </Animated.View>

        {/* Score Preview Card */}
        <Animated.View entering={FadeIn.duration(600).delay(100)}>
          {hasScans && lastScore ? (
            <TouchableOpacity
              style={styles.scoreCard}
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.7}
            >
              <View style={styles.scoreCardLeft}>
                {lastScore.imageUri ? (
                  <Image source={{ uri: lastScore.imageUri }} style={styles.scoreThumb} />
                ) : (
                  <View style={[styles.scoreThumb, styles.scoreThumbPlaceholder]}>
                    <Ionicons name="person" size={20} color={TEXT_MUTED} />
                  </View>
                )}
              </View>
              <View style={styles.scoreCardCenter}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                  {overallRating || '--'}
                </Text>
                <Text style={styles.scoreLabel}>{scoreLabel}</Text>
              </View>
              <View style={styles.scoreCardRight}>
                <Text style={styles.viewDetails}>View Details</Text>
                <Ionicons name="arrow-forward" size={12} color={TEXT_SECONDARY} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.scoreCard}>
              <View style={styles.noScansContent}>
                <Ionicons name="camera-outline" size={24} color={TEXT_MUTED} />
                <Text style={styles.noScansText}>Take your first scan</Text>
                <Text style={styles.noScansSubtext}>Tap the scan button above to begin</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions Row */}
        <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.quickActionsRow}>
          {[
            { icon: 'time-outline', label: 'History', screen: 'History' },
            { icon: 'analytics-outline', label: 'Progress', screen: 'ProgressTimeline' },
            { icon: 'book-outline', label: 'Guides', screen: 'Guides' },
            { icon: 'chatbubble-outline', label: 'AI Chat', screen: 'Chat' },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(action.screen);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionCircle}>
                <Ionicons name={action.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Your Stats */}
        <Animated.View entering={FadeIn.duration(600).delay(300)} style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{totalScans}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{streakData?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{level?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </Animated.View>

        {/* PRO Banner */}
        {!pro && (
          <Animated.View entering={FadeIn.duration(600).delay(400)}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.85}
              style={styles.proBanner}
            >
              <View style={styles.proBannerContent}>
                <View style={styles.proBannerTextWrap}>
                  <Text style={styles.proBannerTitle}>Unlock Your Full Potential</Text>
                  <Text style={styles.proBannerSubtitle}>Get detailed analysis, guides & more</Text>
                </View>
                <LinearGradient
                  colors={[GOLD, GOLD_LIGHT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.proButton}
                >
                  <Text style={styles.proButtonText}>Go PRO</Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Daily Tip */}
        <Animated.View entering={FadeIn.duration(600).delay(500)}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={16} color={GOLD} style={{ marginTop: 1 }} />
            <Text style={styles.tipText}>{todayTip}</Text>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 3,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Scan Section
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  scanButtonOuter: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulsingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: GOLD,
  },
  scanButtonRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  scanSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },

  // Score Preview Card
  scoreCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCardLeft: {
    marginRight: 14,
  },
  scoreThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  scoreThumbPlaceholder: {
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCardCenter: {
    flex: 1,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  scoreLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 2,
  },
  scoreCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetails: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  noScansContent: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  noScansText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  noScansSubtext: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: CARD_BORDER,
  },

  // PRO Banner
  proBanner: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GOLD + '40',
    marginBottom: 24,
    overflow: 'hidden',
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  proBannerTextWrap: {
    flex: 1,
  },
  proBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  proBannerSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
  proButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  proButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Daily Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 19,
    fontWeight: '400',
  },
});

export default HomeScreen;
