import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
  Dimensions, Platform, Linking, Share, Modal, BackHandler,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, FadeInUp, ZoomIn, SlideInRight,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
  withDelay, withSpring, Easing, interpolate, runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { PRO_CONFIG, purchasePlan, hasUsedTrial, isPro, restorePurchases } from '../utils/pro';
import { getManageSubscriptionUrl } from '../config/iap';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

// ─── Storage Keys ──────────────────────────────────────────────────
const PAYWALL_VIEW_COUNT_KEY = 'androgenic_paywall_views';
const OFFER_START_KEY = 'androgenic_offer_start';
const EXIT_OFFER_USED_KEY = 'androgenic_exit_offer_used';

// ─── Blurred score data for the preview card ───────────────────────
const BLURRED_SCORES = [
  { label: 'Overall', value: '7.8' },
  { label: 'Jawline', value: '8.2' },
  { label: 'Eyes', value: '7.1' },
  { label: 'Symmetry', value: '8.5' },
  { label: 'Skin', value: '6.9' },
  { label: 'Hair', value: '7.4' },
];

const FEATURES = [
  'Detailed face analysis across 6 categories',
  'Personalized improvement plan',
  'Celebrity match & potential score',
  '23+ expert guides & protocols',
  'Track your progress over time',
  'Unlimited scans',
];

// ─── Testimonial Data ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Jake M.',
    text: 'Went from 5.8 to 7.2 in 3 months with PRO guides. The facial ratio analysis showed me exactly what to focus on.',
    improvement: '+1.4',
    rating: 5,
  },
  {
    name: 'Mike R.',
    text: 'The supplement stack alone is worth 10x the price. My skin cleared up and my jawline sharpened in just 6 weeks.',
    improvement: '+0.9',
    rating: 5,
  },
  {
    name: 'Alex T.',
    text: 'Best investment I made for my appearance. The progress tracking kept me accountable and I can actually see results.',
    improvement: '+1.1',
    rating: 5,
  },
];

// ─── Social Proof Notifications ────────────────────────────────────
const NOTIFICATION_NAMES = [
  { name: 'Sarah', city: 'Toronto' },
  { name: 'James', city: 'London' },
  { name: 'Marcus', city: 'New York' },
  { name: 'David', city: 'Sydney' },
  { name: 'Ryan', city: 'Austin' },
  { name: 'Chris', city: 'Miami' },
  { name: 'Daniel', city: 'Chicago' },
  { name: 'Matt', city: 'Berlin' },
  { name: 'Tom', city: 'LA' },
  { name: 'Ben', city: 'Seattle' },
];

// ─── Plan Comparison Table Data ────────────────────────────────────
const COMPARISON_FEATURES = [
  { feature: 'Face Scans', free: '3 total', pro: 'Unlimited', icon: 'scan-outline' },
  { feature: 'Categories', free: '2 of 6', pro: 'All 6', icon: 'grid-outline' },
  { feature: 'Guides', free: '2 basic', pro: '23+ premium', icon: 'book-outline' },
  { feature: 'AI Chat', free: '5 messages', pro: 'Unlimited', icon: 'chatbubble-outline' },
  { feature: 'Share Cards', free: '1 template', pro: '5 premium', icon: 'share-outline' },
  { feature: 'Progress Tracking', free: false, pro: true, icon: 'trending-up-outline' },
  { feature: 'Celebrity Match', free: false, pro: true, icon: 'star-outline' },
];

// ─── Helpers ───────────────────────────────────────────────────────

/** Generate a realistic-feeling subscriber count based on time of day */
const getSubscriberCount = () => {
  const hour = new Date().getHours();
  // Base count varies by hour to feel realistic
  const baseCounts = [
    312, 287, 198, 145, 134, 156, 289, 478, 687, 834,
    967, 1089, 1247, 1198, 1156, 1078, 1134, 1267, 1345, 1289,
    1167, 987, 756, 534,
  ];
  const base = baseCounts[hour] || 800;
  // Add a deterministic daily variance from the date
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const variance = ((dayOfYear * 7 + 13) % 200) - 100;
  return Math.max(400, base + variance);
};

/** Format seconds to HH:MM:SS */
const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─── Component ─────────────────────────────────────────────────────

const PaywallScreen = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [friendsInvited, setFriendsInvited] = useState(0);
  const trialUsed = hasUsedTrial();
  const alreadyPro = isPro();

  // Conversion state
  const [viewCount, setViewCount] = useState(0);
  const [countdown, setCountdown] = useState(86400); // 24h in seconds
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [exitOfferUsed, setExitOfferUsed] = useState(false);
  const [subscriberCount] = useState(getSubscriberCount());
  const exitOfferShownThisSession = useRef(false);
  const countdownIntervalRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const cameFromScan = route?.params?.fromScan || false;

  // ─── Animations ────────────────────────────────────────────────
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const shimmerTranslate = useSharedValue(-1);
  const notificationOpacity = useSharedValue(0);
  const notificationTranslateY = useSharedValue(20);

  useEffect(() => {
    // CTA pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
    // Lock glow
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
    // Shimmer sweep
    shimmerTranslate.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 0 }),
      ),
      -1, false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerTranslate.value, [-1, 1], [-width, width]) }],
    opacity: 0.15,
  }));

  // ─── Paywall View Counter & Offer Timer ────────────────────────
  useEffect(() => {
    const initPaywallState = async () => {
      try {
        // Increment view count
        const stored = await AsyncStorage.getItem(PAYWALL_VIEW_COUNT_KEY);
        const count = stored ? parseInt(stored, 10) + 1 : 1;
        await AsyncStorage.setItem(PAYWALL_VIEW_COUNT_KEY, String(count));
        setViewCount(count);

        // Check exit offer usage
        const exitUsed = await AsyncStorage.getItem(EXIT_OFFER_USED_KEY);
        if (exitUsed === 'true') setExitOfferUsed(true);

        // Offer timer: show from first view
        {
          let offerStart = await AsyncStorage.getItem(OFFER_START_KEY);
          if (!offerStart) {
            offerStart = String(Date.now());
            await AsyncStorage.setItem(OFFER_START_KEY, offerStart);
          }
          const elapsed = Math.floor((Date.now() - parseInt(offerStart, 10)) / 1000);
          const remaining = Math.max(0, 86400 - elapsed);
          setCountdown(remaining);
          setShowOfferBanner(remaining > 0);
        }
      } catch {
        // Silent fail
      }
    };
    initPaywallState();
  }, []);

  // ─── Countdown Timer ───────────────────────────────────────────
  useEffect(() => {
    if (!showOfferBanner || countdown <= 0) return;
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowOfferBanner(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownIntervalRef.current);
  }, [showOfferBanner]);

  // ─── Rotating Social Proof Notifications ───────────────────────
  useEffect(() => {
    const showNotification = () => {
      const person = NOTIFICATION_NAMES[Math.floor(Math.random() * NOTIFICATION_NAMES.length)];
      const minutes = Math.floor(Math.random() * 12) + 1;
      setCurrentNotification({ ...person, minutes });
      notificationOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withDelay(3500, withTiming(0, { duration: 400 })),
      );
      notificationTranslateY.value = withSequence(
        withSpring(0, { damping: 14, stiffness: 120 }),
        withDelay(3500, withTiming(20, { duration: 300 })),
      );
    };

    // First notification after 4 seconds
    const initialTimeout = setTimeout(showNotification, 4000);
    // Then every 8-12 seconds
    notificationIntervalRef.current = setInterval(showNotification, 8000 + Math.random() * 4000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(notificationIntervalRef.current);
    };
  }, []);

  const notificationStyle = useAnimatedStyle(() => ({
    opacity: notificationOpacity.value,
    transform: [{ translateY: notificationTranslateY.value }],
  }));

  // ─── Exit Intent (Android back / close button) ────────────────
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!exitOfferShownThisSession.current && !exitOfferUsed && !alreadyPro) {
        exitOfferShownThisSession.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setExitModalVisible(true);
        return true; // Prevent default back
      }
      return false;
    });
    return () => backHandler.remove();
  }, [exitOfferUsed, alreadyPro]);

  const handleClosePress = useCallback(() => {
    if (!exitOfferShownThisSession.current && !exitOfferUsed && !alreadyPro) {
      exitOfferShownThisSession.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setExitModalVisible(true);
    } else {
      navigation.goBack();
    }
  }, [exitOfferUsed, alreadyPro, navigation]);

  const handleClaimExitOffer = useCallback(async () => {
    setExitModalVisible(false);
    setExitOfferUsed(true);
    await AsyncStorage.setItem(EXIT_OFFER_USED_KEY, 'true');
    // Proceed to purchase with discount context
    handleSubscribe();
  }, []);

  const handleDismissExitModal = useCallback(() => {
    setExitModalVisible(false);
    navigation.goBack();
  }, [navigation]);

  // ─── Existing Handlers ─────────────────────────────────────────

  const getSelectedPlanData = () => {
    return PRO_CONFIG.plans.find(p => p.id === selectedPlan) || PRO_CONFIG.plans[2];
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await purchasePlan(selectedPlan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Welcome to PRO!', 'All features are now unlocked.', [
        { text: "Let's Go!", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (err.message !== 'CANCELLED') {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const result = await restorePurchases();
      if (result) {
        Alert.alert('Restored!', 'Your PRO access has been restored.', [
          { text: 'Great!', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await Share.share({
        message: Platform.OS === 'ios'
          ? 'Check out Androgenic - AI-powered face analysis that actually works. Get your score: https://androgenic.app/invite'
          : 'https://androgenic.app/invite',
        title: 'Unlock Androgenic PRO for free',
      });
      if (result.action === Share.sharedAction) {
        setFriendsInvited(prev => Math.min(prev + 1, 3));
        if (friendsInvited + 1 >= 3) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      // Share cancelled or failed
    }
  };

  // ─── Dynamic CTA Text ─────────────────────────────────────────
  const getCtaText = () => {
    if (viewCount >= 3 && showOfferBanner) return 'Claim Your Discount';
    if (cameFromScan) return 'See Your Results';
    if (viewCount > 1) return 'Claim Your Discount';
    if (!trialUsed) return 'Start Free Trial';
    return 'Continue';
  };

  const getUrgencyMessage = () => {
    if (viewCount >= 5) return 'Last chance — this offer won\'t appear again';
    if (viewCount >= 3) return 'Special pricing unlocked for you';
    if (viewCount >= 1) return 'Limited-time offer active — don\'t miss it';
    return null;
  };

  // ─── Already Pro ───────────────────────────────────────────────
  if (alreadyPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
        </View>
        <View style={styles.alreadyPro}>
          <Animated.View entering={ZoomIn.duration(400)}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.proBadgeSuccess}>
              <Ionicons name="checkmark" size={36} color="#000" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.alreadyProTitle}>You're PRO!</Text>
          <Text style={styles.alreadyProText}>All premium features are unlocked.</Text>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  const selectedPlanData = getSelectedPlanData();
  const isUrgent = countdown > 0 && countdown < 3600;
  const urgencyMessage = getUrgencyMessage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── Header with close button ─────────────────────────── */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <AnimatedPressable onPress={handleClosePress} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </AnimatedPressable>
        </Animated.View>

        {/* ─── 1. Limited-Time Offer Banner ─────────────────────── */}
        {showOfferBanner && (
          <Animated.View entering={FadeInDown.duration(500).delay(50)}>
            <LinearGradient
              colors={isUrgent ? ['#3D0000', '#1A0000'] : ['#2A2000', '#1A1400']}
              style={styles.offerBanner}
            >
              <View style={styles.offerBannerInner}>
                <View style={styles.offerTextRow}>
                  <Ionicons
                    name={isUrgent ? 'flame' : 'gift-outline'}
                    size={18}
                    color={isUrgent ? '#FF4444' : '#D4AF37'}
                  />
                  <Text style={[styles.offerTitle, isUrgent && styles.offerTitleUrgent]}>
                    {viewCount >= 5 ? 'LAST CHANCE' : 'Special Offer'} — 40% OFF
                  </Text>
                </View>
                <View style={styles.timerRow}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isUrgent ? '#FF4444' : '#D4AF37'}
                  />
                  <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
                    Expires in {formatCountdown(countdown)}
                  </Text>
                </View>
              </View>
              {isUrgent && <View style={styles.urgentPulse} />}
            </LinearGradient>
          </Animated.View>
        )}

        {/* ─── 2. Animated Score Reveal Teaser ──────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.blurSection}>
          <View style={styles.blurredCard}>
            {/* Mock score grid */}
            <View style={styles.blurredGrid}>
              {BLURRED_SCORES.map((item, i) => (
                <View key={i} style={styles.blurredScoreItem}>
                  <Text style={styles.blurredLabel}>{item.label}</Text>
                  <Text style={styles.blurredValue}>{item.value}</Text>
                </View>
              ))}
            </View>
            {/* Blur overlay */}
            <View style={styles.blurOverlay} />
            {/* Shimmer sweep */}
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(212,175,55,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            {/* Lock icon centered */}
            <View style={styles.lockContainer}>
              <Animated.View style={glowStyle}>
                <View style={styles.lockGlow} />
              </Animated.View>
              <View style={styles.lockIcon}>
                <Ionicons name="lock-closed" size={28} color="#D4AF37" />
              </View>
            </View>
          </View>
          <Text style={styles.unlockTitle}>Your Score Is Ready</Text>
          <Text style={styles.unlockSubtitle}>Unlock to see your results</Text>
        </Animated.View>

        {/* ─── 3. Price Anchoring ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(170)} style={styles.anchorSection}>
          <Text style={styles.anchorHeader}>How much is self-improvement worth?</Text>
          <View style={styles.anchorRow}>
            <Ionicons name="fitness-outline" size={18} color="#666" />
            <Text style={styles.anchorStrikethrough}>Personal trainer</Text>
            <Text style={styles.anchorCost}>$200/month</Text>
          </View>
          <View style={styles.anchorDividerLine} />
          <View style={styles.anchorRow}>
            <Ionicons name="medkit-outline" size={18} color="#666" />
            <Text style={styles.anchorStrikethrough}>Dermatologist visit</Text>
            <Text style={styles.anchorCost}>$150/visit</Text>
          </View>
          <View style={styles.anchorDividerLine} />
          <View style={styles.anchorRow}>
            <LinearGradient
              colors={GRADIENTS.gold}
              style={styles.anchorGoldDot}
            >
              <Ionicons name="diamond-outline" size={12} color="#000" />
            </LinearGradient>
            <Text style={styles.anchorGoldLabel}>Androgenic PRO</Text>
            <Text style={styles.anchorGoldCost}>$0.77/week</Text>
          </View>
        </Animated.View>

        {/* ─── Value Proposition ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(230)} style={styles.featuresSection}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── Pricing Plans ────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.plansSection}>
          <View style={styles.plansRow}>
            {/* Weekly */}
            <AnimatedPressable
              onPress={() => { Haptics.selectionAsync(); setSelectedPlan('weekly'); }}
              style={[styles.planCard, selectedPlan === 'weekly' && styles.planCardSelected]}
            >
              <Text style={styles.planDuration}>Weekly</Text>
              <Text style={styles.planPrice}>$4.99</Text>
              <Text style={styles.planPeriod}>/week</Text>
            </AnimatedPressable>

            {/* Yearly - Best Value */}
            <AnimatedPressable
              onPress={() => { Haptics.selectionAsync(); setSelectedPlan('yearly'); }}
              style={[styles.planCard, styles.planCardYearly, selectedPlan === 'yearly' && styles.planCardSelected]}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planDuration}>Yearly</Text>
              <Text style={[styles.planPrice, styles.planStrikethrough]}>$259/yr</Text>
              <Text style={styles.planPrice}>$39.99</Text>
              <Text style={styles.planPeriod}>/year</Text>
              <Text style={styles.planBreakdown}>just $0.11/day</Text>
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>Save 85%</Text>
              </View>
            </AnimatedPressable>

            {/* Lifetime */}
            <AnimatedPressable
              onPress={() => { Haptics.selectionAsync(); setSelectedPlan('lifetime'); }}
              style={[styles.planCard, selectedPlan === 'lifetime' && styles.planCardSelected]}
            >
              <Text style={styles.planDuration}>Lifetime</Text>
              <Text style={styles.planPrice}>$79.99</Text>
              <Text style={styles.planPeriod}>one-time</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* ─── Urgency Message (view count >= 3) ────────────────── */}
        {urgencyMessage && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.urgencyBadge}>
            <Ionicons name="alert-circle" size={14} color="#D4AF37" />
            <Text style={styles.urgencyText}>{urgencyMessage}</Text>
          </Animated.View>
        )}

        {/* ─── CTA Button ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <AnimatedPressable onPress={handleSubscribe} scaleDown={0.97} disabled={loading}>
            <Animated.View style={pulseStyle}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>{getCtaText()}</Text>
              </LinearGradient>
            </Animated.View>
          </AnimatedPressable>
          {!trialUsed && (
            <Text style={styles.ctaSubtext}>
              {PRO_CONFIG.trialDays}-day free trial, then {selectedPlanData.price}{selectedPlanData.period !== 'one-time' ? selectedPlanData.period : ''}
            </Text>
          )}
          <Text style={styles.memberCount}>Join 47,000+ members</Text>
          <Text style={styles.cancelText}>Cancel anytime</Text>
        </Animated.View>

        {/* ─── 5. Money-Back Guarantee Badge ────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)} style={styles.guaranteeSection}>
          <View style={styles.guaranteeBadge}>
            <View style={styles.guaranteeIconWrap}>
              <Ionicons name="shield-checkmark" size={24} color="#D4AF37" />
            </View>
            <View style={styles.guaranteeTextWrap}>
              <Text style={styles.guaranteeTitle}>7-Day Money Back Guarantee</Text>
              <Text style={styles.guaranteeSubtext}>Cancel anytime, no questions asked</Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── 4. Social Proof Counter ──────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.socialSection}>
          <View style={styles.subscriberRow}>
            <View style={styles.avatarDots}>
              {['#D4AF37', '#4A90D9', '#34C759', '#FF9500'].map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatarDot,
                    { backgroundColor: color, marginLeft: i > 0 ? -6 : 0, zIndex: 4 - i },
                  ]}
                >
                  <Text style={styles.avatarDotText}>
                    {['J', 'M', 'A', 'D'][i]}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.subscriberText}>
              <Text style={styles.subscriberBold}>{subscriberCount.toLocaleString()}</Text> people subscribed today
            </Text>
          </View>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons key={i} name="star" size={16} color="#D4AF37" />
            ))}
            <Text style={styles.ratingText}>Rated 4.9 by 47,000+ users</Text>
          </View>
        </Animated.View>

        {/* ─── 6. Testimonial Cards ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(550)} style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>Real Results</Text>
          {TESTIMONIALS.map((t, idx) => (
            <View key={idx} style={styles.testimonialCard}>
              <View style={styles.testimonialTopRow}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>{t.name[0]}</Text>
                </View>
                <View style={styles.testimonialMeta}>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <View style={styles.testimonialStars}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#D4AF37" />
                    ))}
                  </View>
                </View>
                <View style={styles.improvementBadge}>
                  <Ionicons name="trending-up" size={12} color="#34C759" />
                  <Text style={styles.improvementText}>{t.improvement}</Text>
                </View>
              </View>
              <Text style={styles.testimonialText}>{t.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── 9. Plan Comparison Table ─────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Free vs PRO</Text>
          <View style={styles.comparisonTable}>
            {/* Table header */}
            <View style={styles.comparisonHeaderRow}>
              <Text style={[styles.comparisonHeaderCell, { flex: 2 }]}>Feature</Text>
              <Text style={styles.comparisonHeaderCell}>Free</Text>
              <Text style={[styles.comparisonHeaderCell, styles.comparisonHeaderPro]}>PRO</Text>
            </View>
            {/* Table rows */}
            {COMPARISON_FEATURES.map((row, idx) => (
              <View
                key={idx}
                style={[
                  styles.comparisonRow,
                  idx % 2 === 0 && styles.comparisonRowAlt,
                ]}
              >
                <View style={[styles.comparisonCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <Ionicons name={row.icon} size={14} color="#666" />
                  <Text style={styles.comparisonFeatureText}>{row.feature}</Text>
                </View>
                <View style={styles.comparisonCell}>
                  {typeof row.free === 'boolean' ? (
                    <Ionicons
                      name={row.free ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={row.free ? '#D4AF37' : '#444'}
                    />
                  ) : (
                    <Text style={styles.comparisonFreeText}>{row.free}</Text>
                  )}
                </View>
                <View style={styles.comparisonCell}>
                  {typeof row.pro === 'boolean' ? (
                    <Ionicons
                      name={row.pro ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={row.pro ? '#D4AF37' : '#444'}
                    />
                  ) : (
                    <Text style={styles.comparisonProText}>{row.pro}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ─── Alternative Unlock - Viral Mechanic ──────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(650)} style={styles.referralSection}>
          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          <Text style={styles.referralTitle}>Invite 3 friends to unlock for free</Text>
          <AnimatedPressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={18} color="#D4AF37" />
            <Text style={styles.shareButtonText}>Share with friends</Text>
          </AnimatedPressable>
          <View style={styles.progressRow}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[styles.progressDot, i < friendsInvited && styles.progressDotFilled]}
              />
            ))}
            <Text style={styles.progressText}>{friendsInvited}/3 friends invited</Text>
          </View>
        </Animated.View>

        {/* ─── Bottom Links ─────────────────────────────────────── */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity onPress={handleRestore} disabled={loading}>
            <Text style={styles.bottomLinkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.bottomDivider}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://androgenic.app/terms')}>
            <Text style={styles.bottomLinkText}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.bottomDivider}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://androgenic.app/privacy')}>
            <Text style={styles.bottomLinkText}>Privacy</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Legal ────────────────────────────────────────────── */}
        <Text style={styles.legalText}>
          {Platform.OS === 'ios'
            ? 'Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.'
            : 'Payment will be charged to your Google Play account at confirmation of purchase. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.'}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── 4b. Floating Social Proof Notification ───────────── */}
      {currentNotification && (
        <Animated.View style={[styles.floatingNotification, notificationStyle]} pointerEvents="none">
          <View style={styles.notifDot}>
            <Text style={styles.notifDotText}>{currentNotification.name[0]}</Text>
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifText}>
              <Text style={styles.notifName}>{currentNotification.name}</Text> from {currentNotification.city} just went PRO
            </Text>
            <Text style={styles.notifTime}>{currentNotification.minutes} min ago</Text>
          </View>
        </Animated.View>
      )}

      {/* ─── 8. Exit Intent Modal ───────────────────────────────── */}
      <Modal
        visible={exitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismissExitModal}
      >
        <View style={styles.exitOverlay}>
          <Animated.View entering={ZoomIn.duration(300)} style={styles.exitModal}>
            <LinearGradient
              colors={['#1A1400', '#0A0A0A']}
              style={styles.exitModalGradient}
            >
              {/* Close X */}
              <TouchableOpacity
                onPress={handleDismissExitModal}
                style={styles.exitCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.exitEmoji}>Wait!</Text>
              <Text style={styles.exitTitle}>Here's 50% off your first month</Text>
              <Text style={styles.exitSubtitle}>
                This one-time offer is only available right now. Don't miss out on unlocking your full potential.
              </Text>

              <View style={styles.exitPriceRow}>
                <Text style={styles.exitOldPrice}>$9.99</Text>
                <Text style={styles.exitNewPrice}>$4.99</Text>
                <Text style={styles.exitPeriod}>/first month</Text>
              </View>

              <AnimatedPressable onPress={handleClaimExitOffer} scaleDown={0.97}>
                <LinearGradient
                  colors={['#D4AF37', '#FFD700', '#D4AF37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exitCtaButton}
                >
                  <Text style={styles.exitCtaText}>Claim Offer</Text>
                </LinearGradient>
              </AnimatedPressable>

              <TouchableOpacity onPress={handleDismissExitModal} style={styles.exitNoThanks}>
                <Text style={styles.exitNoThanksText}>No thanks, I'll pass</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'flex-end',
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Section Title ────────────────────────────────────────────
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  // ─── 1. Offer Banner ─────────────────────────────────────────
  offerBanner: {
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    overflow: 'hidden',
  },
  offerBannerInner: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  offerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  offerTitleUrgent: {
    color: '#FF4444',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.5,
  },
  timerTextUrgent: {
    color: '#FF4444',
  },
  urgentPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 14,
  },

  // ─── 2. Blurred Preview Section ──────────────────────────────
  blurSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  blurredCard: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    overflow: 'hidden',
    position: 'relative',
  },
  blurredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  blurredScoreItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  blurredLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  blurredValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: width * 0.5,
  },
  lockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    letterSpacing: 0.3,
  },
  unlockSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },

  // ─── 3. Price Anchoring ───────────────────────────────────────
  anchorSection: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  anchorHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  anchorStrikethrough: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    textDecorationColor: '#666',
  },
  anchorCost: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textDecorationLine: 'line-through',
    textDecorationColor: '#666',
  },
  anchorDividerLine: {
    height: 1,
    backgroundColor: '#1F1F1F',
  },
  anchorGoldDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorGoldLabel: {
    flex: 1,
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '700',
  },
  anchorGoldCost: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '800',
  },

  // ─── Features Section ────────────────────────────────────────
  featuresSection: {
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
    flex: 1,
  },

  // ─── Plans Section ───────────────────────────────────────────
  plansSection: {
    marginBottom: 20,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 8,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1F1F1F',
    position: 'relative',
    overflow: 'visible',
  },
  planCardYearly: {
    paddingTop: 22,
  },
  planCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212,175,55,0.04)',
    ...SHADOWS.glow,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  planDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planStrikethrough: {
    fontSize: 12,
    fontWeight: '400',
    color: '#555555',
    textDecorationLine: 'line-through',
    marginBottom: -2,
  },
  planPeriod: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  planBreakdown: {
    fontSize: 11,
    color: '#D4AF37',
    marginTop: 4,
    fontWeight: '600',
  },
  savePill: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  savePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },

  // ─── Urgency Badge ───────────────────────────────────────────
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // ─── CTA Button ──────────────────────────────────────────────
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.3,
  },
  ctaSubtext: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    marginTop: 10,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  cancelText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },

  // ─── 5. Guarantee Badge ──────────────────────────────────────
  guaranteeSection: {
    marginBottom: 28,
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    gap: 14,
  },
  guaranteeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guaranteeTextWrap: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 2,
  },
  guaranteeSubtext: {
    fontSize: 12,
    color: '#999',
  },

  // ─── 4. Social Proof ─────────────────────────────────────────
  socialSection: {
    marginBottom: 28,
  },
  subscriberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatarDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  avatarDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  subscriberText: {
    fontSize: 13,
    color: '#999',
  },
  subscriberBold: {
    fontWeight: '700',
    color: '#FFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#999999',
    marginLeft: 8,
    fontWeight: '500',
  },

  // ─── 6. Testimonials ─────────────────────────────────────────
  testimonialsSection: {
    marginBottom: 28,
  },
  testimonialCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginBottom: 10,
  },
  testimonialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  testimonialAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  testimonialAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  testimonialMeta: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52,199,89,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  testimonialText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // ─── 9. Comparison Table ──────────────────────────────────────
  comparisonSection: {
    marginBottom: 32,
  },
  comparisonTable: {
    backgroundColor: '#111111',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  comparisonHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  comparisonHeaderPro: {
    color: '#D4AF37',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  comparisonRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonFeatureText: {
    fontSize: 13,
    color: '#CCC',
    fontWeight: '500',
  },
  comparisonFreeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  comparisonProText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    textAlign: 'center',
  },

  // ─── Referral Section ────────────────────────────────────────
  referralSection: {
    marginBottom: 32,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F1F1F',
  },
  orText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '700',
    marginHorizontal: 16,
  },
  referralTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  shareButtonText: {
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#666666',
    backgroundColor: 'transparent',
  },
  progressDotFilled: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },

  // ─── Bottom Links ────────────────────────────────────────────
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#666666',
  },
  bottomDivider: {
    fontSize: 12,
    color: '#444444',
  },

  // ─── Legal ───────────────────────────────────────────────────
  legalText: {
    fontSize: 10,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 10,
  },

  // ─── Floating Notification ───────────────────────────────────
  floatingNotification: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    gap: 10,
    ...SHADOWS.card,
  },
  notifDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: 12,
    color: '#CCC',
  },
  notifName: {
    fontWeight: '700',
    color: '#FFF',
  },
  notifTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },

  // ─── 8. Exit Intent Modal ────────────────────────────────────
  exitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  exitModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    ...SHADOWS.goldGlow,
  },
  exitModalGradient: {
    padding: 28,
    alignItems: 'center',
  },
  exitCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  exitEmoji: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 8,
  },
  exitTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  exitSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exitPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  exitOldPrice: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    textDecorationLine: 'line-through',
    textDecorationColor: '#666',
  },
  exitNewPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D4AF37',
  },
  exitPeriod: {
    fontSize: 14,
    color: '#999',
  },
  exitCtaButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  exitCtaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.3,
  },
  exitNoThanks: {
    paddingVertical: 8,
  },
  exitNoThanksText: {
    fontSize: 13,
    color: '#666',
  },

  // ─── Already Pro ─────────────────────────────────────────────
  alreadyPro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  proBadgeSuccess: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alreadyProTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 8,
  },
  alreadyProText: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  doneBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaywallScreen;
