import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Dimensions, Platform, Linking,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { PRO_CONFIG, startFreeTrial, purchasePlan, hasUsedTrial, isPro, restorePurchases } from '../utils/pro';
import { getManageSubscriptionUrl } from '../config/iap';
import AnimatedPressable from '../components/AnimatedPressable';
import GlassBackground from '../components/GlassBackground';

const { width } = Dimensions.get('window');

const SOCIAL_PROOF = [
  { name: 'Jake M.', text: 'Score went from 5.8 to 7.2 in 3 months', rating: 5, improvement: '+1.4' },
  { name: 'Alex R.', text: 'The facial ratios showed me exactly what to fix', rating: 5, improvement: '+1.7' },
  { name: 'Chris D.', text: 'Best investment in my self-improvement journey', rating: 5, improvement: '+1.1' },
];

const PRO_FEATURES_DISPLAY = [
  { icon: 'infinite-outline', text: 'Unlimited face scans', color: '#0066ff' },
  { icon: 'grid-outline', text: 'All 7 analysis categories', color: '#00e676' },
  { icon: 'people-outline', text: 'Celebrity look-alike matching', color: '#ff6b35' },
  { icon: 'analytics-outline', text: '8 facial ratio measurements', color: '#00e5ff' },
  { icon: 'sparkles-outline', text: 'AI-powered recommendations', color: '#ffab40' },
  { icon: 'document-text-outline', text: 'Detailed glow-up report', color: '#4d94ff' },
  { icon: 'trending-up', text: 'Progress & transformation tracking', color: '#1de9b6' },
  { icon: 'clipboard-outline', text: '12-week improvement plan', color: '#ff6090' },
];

const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const trialUsed = hasUsedTrial();
  const alreadyPro = isPro();

  const shimmerX = useSharedValue(-width);
  const pulseScale = useSharedValue(1);
  const urgencyOpacity = useSharedValue(0.8);

  useEffect(() => {
    shimmerX.value = withRepeat(withTiming(width, { duration: 2500, easing: Easing.linear }), -1, false);
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1, false,
    );
    urgencyOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.8, { duration: 800 })),
      -1, false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const urgencyStyle = useAnimatedStyle(() => ({ opacity: urgencyOpacity.value }));

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

  const handleStartTrial = async () => {
    try {
      setLoading(true);
      await purchasePlan('monthly');
      Alert.alert(
        'Welcome to PRO!',
        `Your ${PRO_CONFIG.trialDays}-day free trial has started. Enjoy all PRO features!`,
        [{ text: 'Explore PRO', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      if (err.message !== 'CANCELLED') {
        Alert.alert('Error', 'Could not start trial. Please try again.');
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

  if (alreadyPro) {
    return (
      <GlassBackground variant="gold">
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
      </GlassBackground>
    );
  }

  return (
    <GlassBackground variant="purple">
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)}>
          {/* Close */}
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={[styles.closeBtn, GLASS.card]}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
          </View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.hero}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.proBadgeLg}>
              <Ionicons name="diamond" size={32} color="#000" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Androgenic PRO</Text>
            <Text style={styles.heroSubtitle}>Join 12,000+ members transforming their looks</Text>
          </Animated.View>

          {/* Urgency Banner */}
          <Animated.View style={urgencyStyle}>
            <View style={styles.urgencyBanner}>
              <Ionicons name="flash" size={16} color="#FFD700" />
              <Text style={styles.urgencyText}>Limited offer: 50% off first month</Text>
              <Ionicons name="flash" size={16} color="#FFD700" />
            </View>
          </Animated.View>

          {/* Social Proof */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.socialScroll}>
            {SOCIAL_PROOF.map((s, i) => (
              <View key={i} style={styles.socialCard}>
                <View style={styles.socialHeader}>
                  <LinearGradient colors={GRADIENTS.accent} style={styles.socialAvatar}>
                    <Text style={styles.socialInitial}>{s.name[0]}</Text>
                  </LinearGradient>
                  <Text style={styles.socialName}>{s.name}</Text>
                  <View style={styles.socialImp}>
                    <Text style={styles.socialImpText}>{s.improvement}</Text>
                  </View>
                </View>
                <Text style={styles.socialText}>"{s.text}"</Text>
                <View style={styles.socialStars}>
                  {[...Array(s.rating)].map((_, si) => (
                    <Ionicons key={si} name="star" size={12} color={COLORS.gold} />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Features Grid */}
          <Text style={styles.featuresTitle}>Everything You Get</Text>
          <View style={styles.featuresGrid}>
            {PRO_FEATURES_DISPLAY.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={[styles.featureIconBg, { backgroundColor: f.color + '18' }]}>
                  <Ionicons name={f.icon} size={16} color={f.color} />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          {PRO_CONFIG.plans.map((plan, idx) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Animated.View key={plan.id} entering={FadeInDown.duration(300).delay(300 + idx * 80)}>
                <AnimatedPressable onPress={() => { Haptics.selectionAsync(); setSelectedPlan(plan.id); }} scaleDown={0.97}>
                  <View style={[styles.planCard, isSelected && styles.planCardSelected]}>
                    <View style={styles.planLeft}>
                      <View style={[styles.planRadio, isSelected && styles.planRadioSelected]}>
                        {isSelected && <View style={styles.planRadioDot} />}
                      </View>
                      <View>
                        <View style={styles.planLabelRow}>
                          <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>{plan.label}</Text>
                          {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>BEST VALUE</Text></View>}
                          {plan.savings && !plan.popular && <View style={styles.savingsBadge}><Text style={styles.savingsText}>{plan.savings}</Text></View>}
                        </View>
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      </View>
                    </View>
                    <Text style={[styles.planPrice, isSelected && { color: COLORS.accent }]}>{plan.price}</Text>
                  </View>
                </AnimatedPressable>
              </Animated.View>
            );
          })}

          {/* Trial CTA */}
          {!trialUsed && (
            <AnimatedPressable onPress={handleStartTrial} scaleDown={0.97}>
              <Animated.View style={pulseStyle}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.trialBtn}>
                  <Animated.View style={[styles.shimmerBar, shimmerStyle]} />
                  <Ionicons name="gift-outline" size={20} color="#000" />
                  <View style={styles.trialBtnContent}>
                    <Text style={styles.trialBtnText}>Start {PRO_CONFIG.trialDays}-Day Free Trial</Text>
                    <Text style={styles.trialBtnSub}>Cancel anytime during trial</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </AnimatedPressable>
          )}

          {/* Subscribe CTA */}
          <AnimatedPressable onPress={handleSubscribe} scaleDown={0.97}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>
                {trialUsed ? 'Subscribe Now' : 'Or Subscribe Now'}
              </Text>
            </LinearGradient>
          </AnimatedPressable>

          {/* Guarantee */}
          <View style={styles.guaranteeRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#00e676" />
            <Text style={styles.guaranteeText}>7-day money-back guarantee</Text>
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={loading}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legalText}>
            {Platform.OS === 'ios'
              ? 'Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions in your App Store account settings.'
              : 'Payment will be charged to your Google Play account at confirmation of purchase. Subscription automatically renews unless canceled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions in Google Play Store > Account > Subscriptions.'}
            {' '}Any unused portion of a free trial will be forfeited when you purchase a subscription.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://androgenic.app/terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://androgenic.app/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity onPress={() => Linking.openURL(getManageSubscriptionUrl())}>
              <Text style={styles.legalLink}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20 },
  header: { alignItems: 'flex-end', paddingVertical: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', marginBottom: 16 },
  proBadgeLg: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 14, ...SHADOWS.accentGlow },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.gold, letterSpacing: 1, marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  urgencyBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 12, paddingVertical: 10, gap: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  urgencyText: { fontSize: 13, fontWeight: '700', color: COLORS.gold },
  socialScroll: { marginBottom: 20 },
  socialCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginRight: 10, width: 240, borderWidth: 1, borderColor: COLORS.border },
  socialHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  socialAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  socialInitial: { fontSize: 12, fontWeight: '800', color: '#fff' },
  socialName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  socialImp: { backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  socialImpText: { fontSize: 11, fontWeight: '800', color: '#00e676' },
  socialText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 6, fontStyle: 'italic' },
  socialStars: { flexDirection: 'row', gap: 1 },
  featuresTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: 6, gap: 8 },
  featureIconBg: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', flex: 1 },
  plansTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 6, borderWidth: 2, borderColor: COLORS.border },
  planCardSelected: { borderColor: COLORS.accent, backgroundColor: 'rgba(0,102,255,0.06)' },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  planRadioSelected: { borderColor: COLORS.accent },
  planRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  planLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  planLabelSelected: { color: COLORS.accent },
  planPeriod: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  planPrice: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  popularBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  popularText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  savingsBadge: { backgroundColor: '#00e676', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  savingsText: { color: '#000', fontSize: 8, fontWeight: '800' },
  trialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 18, marginTop: 16, marginBottom: 8, overflow: 'hidden' },
  trialBtnContent: { alignItems: 'flex-start' },
  trialBtnText: { fontSize: 18, fontWeight: '800', color: '#000' },
  trialBtnSub: { fontSize: 11, color: 'rgba(0,0,0,0.5)', fontWeight: '600' },
  shimmerBar: { position: 'absolute', top: 0, bottom: 0, width: 50, backgroundColor: 'rgba(255,255,255,0.25)', transform: [{ skewX: '-20deg' }] },
  ctaBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  guaranteeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  guaranteeText: { fontSize: 12, color: '#00e676', fontWeight: '600' },
  restoreBtn: { alignItems: 'center', paddingVertical: 8 },
  restoreText: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
  legalText: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', lineHeight: 14, marginTop: 8, paddingHorizontal: 10 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  legalLink: { fontSize: 11, color: COLORS.accent, textDecorationLine: 'underline' },
  legalDivider: { fontSize: 11, color: COLORS.textMuted },
  alreadyPro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  proBadgeSuccess: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  alreadyProTitle: { fontSize: 24, fontWeight: '800', color: COLORS.gold, marginBottom: 8 },
  alreadyProText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24 },
  doneBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaywallScreen;
