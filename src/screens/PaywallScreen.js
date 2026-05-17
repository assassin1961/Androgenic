import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
  Dimensions, Platform, Linking, Share,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { PRO_CONFIG, purchasePlan, hasUsedTrial, isPro, restorePurchases } from '../utils/pro';
import { getManageSubscriptionUrl } from '../config/iap';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

// Mock blurred score data for the preview card
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

const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [friendsInvited, setFriendsInvited] = useState(0);
  const trialUsed = hasUsedTrial();
  const alreadyPro = isPro();

  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header with close button */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </AnimatedPressable>
        </Animated.View>

        {/* Section 1: Blurred Preview Card */}
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
          <Text style={styles.unlockTitle}>Unlock Your Results</Text>
          <Text style={styles.unlockSubtitle}>Your analysis is ready</Text>
        </Animated.View>

        {/* Section 2: Value Proposition */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.featuresSection}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Section 3: Pricing Plans */}
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
              <Text style={styles.planPrice}>$39.99</Text>
              <Text style={styles.planPeriod}>/year</Text>
              <Text style={styles.planBreakdown}>$0.77/week</Text>
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

        {/* Section 4: CTA Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <AnimatedPressable onPress={handleSubscribe} scaleDown={0.97} disabled={loading}>
            <Animated.View style={pulseStyle}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>
                  {!trialUsed ? 'Start Free Trial' : 'Continue'}
                </Text>
              </LinearGradient>
            </Animated.View>
          </AnimatedPressable>
          {!trialUsed && (
            <Text style={styles.ctaSubtext}>
              {PRO_CONFIG.trialDays}-day free trial, then {selectedPlanData.price}{selectedPlanData.period !== 'one-time' ? selectedPlanData.period : ''}
            </Text>
          )}
          <Text style={styles.cancelText}>Cancel anytime</Text>
        </Animated.View>

        {/* Section 5: Social Proof */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.socialSection}>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons key={i} name="star" size={16} color="#D4AF37" />
            ))}
            <Text style={styles.ratingText}>Rated 4.9 by 12,000+ users</Text>
          </View>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "Score went from 5.8 to 7.2 in 3 months following the guides. The facial ratio analysis showed me exactly what to focus on."
            </Text>
            <Text style={styles.testimonialAuthor}>- Jake M., +1.4 improvement</Text>
          </View>
        </Animated.View>

        {/* Section 6: Alternative Unlock - Viral Mechanic */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.referralSection}>
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

        {/* Section 7: Bottom Links */}
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

        {/* Legal */}
        <Text style={styles.legalText}>
          {Platform.OS === 'ios'
            ? 'Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.'
            : 'Payment will be charged to your Google Play account at confirmation of purchase. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.'}
        </Text>

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

  // Blurred Preview Section
  blurSection: {
    alignItems: 'center',
    marginBottom: 32,
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
    backdropFilter: 'blur(10px)',
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

  // Features Section
  featuresSection: {
    marginBottom: 32,
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

  // Plans Section
  plansSection: {
    marginBottom: 24,
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

  // CTA Button
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
  cancelText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },

  // Social Proof
  socialSection: {
    marginBottom: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 14,
  },
  ratingText: {
    fontSize: 13,
    color: '#999999',
    marginLeft: 8,
    fontWeight: '500',
  },
  testimonialCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  testimonialText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    color: '#666666',
    marginTop: 10,
    fontWeight: '600',
  },

  // Referral Section
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

  // Bottom Links
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

  // Legal
  legalText: {
    fontSize: 10,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 10,
  },

  // Already Pro
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
