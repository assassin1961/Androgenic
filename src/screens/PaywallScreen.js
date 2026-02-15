import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { PRO_CONFIG, startFreeTrial, purchasePlan, hasUsedTrial, isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const SOCIAL_PROOF = [
  { name: 'Jake M.', text: 'Score went from 5.8 to 7.2 in 3 months', rating: 5, improvement: '+1.4' },
  { name: 'Alex R.', text: 'The facial ratios showed me exactly what to fix', rating: 5, improvement: '+1.7' },
  { name: 'Chris D.', text: 'Best investment in my self-improvement journey', rating: 5, improvement: '+1.1' },
];

const PRO_FEATURES_DISPLAY = [
  { icon: 'infinite-outline', text: 'Unlimited face scans', color: '#7c6cf0' },
  { icon: 'grid-outline', text: 'All 7 analysis categories', color: '#00e676' },
  { icon: 'people-outline', text: 'Celebrity look-alike matching', color: '#ff6b35' },
  { icon: 'analytics-outline', text: '8 facial ratio measurements', color: '#00e5ff' },
  { icon: 'sparkles-outline', text: 'AI-powered recommendations', color: '#ffab40' },
  { icon: 'document-text-outline', text: 'Detailed glow-up report', color: '#a89afa' },
  { icon: 'trending-up', text: 'Progress & transformation tracking', color: '#1de9b6' },
  { icon: 'clipboard-outline', text: '12-week improvement plan', color: '#ff6090' },
];

const PaywallScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const trialUsed = hasUsedTrial();
  const alreadyPro = isPro();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const urgencyAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2500, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(urgencyAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(urgencyAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });

  const handleSubscribe = async () => {
    Alert.alert(
      'Confirm Purchase',
      `Subscribe to ${PRO_CONFIG.plans.find(p => p.id === selectedPlan)?.label} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            await purchasePlan(selectedPlan);
            Alert.alert('Welcome to PRO!', 'All features are now unlocked.', [
              { text: 'Let\'s Go!', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  const handleStartTrial = async () => {
    await startFreeTrial();
    Alert.alert(
      'Trial Started!',
      `Your ${PRO_CONFIG.trialDays}-day free trial has begun. Enjoy all PRO features!`,
      [{ text: 'Explore PRO', onPress: () => navigation.goBack() }]
    );
  };

  if (alreadyPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.alreadyPro}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.proBadgeSuccess}>
            <Ionicons name="checkmark" size={36} color="#000" />
          </LinearGradient>
          <Text style={styles.alreadyProTitle}>You're PRO!</Text>
          <Text style={styles.alreadyProText}>All premium features are unlocked.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Close */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.closeBtn, GLASS.card]}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.proBadgeLg}>
              <Ionicons name="diamond" size={32} color="#000" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Androgenic PRO</Text>
            <Text style={styles.heroSubtitle}>Join 12,000+ members transforming their looks</Text>
          </View>

          {/* Urgency Banner */}
          <Animated.View style={{ opacity: urgencyAnim }}>
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
          {PRO_CONFIG.plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity key={plan.id} onPress={() => setSelectedPlan(plan.id)} activeOpacity={0.7}>
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
              </TouchableOpacity>
            );
          })}

          {/* Trial CTA */}
          {!trialUsed && (
            <TouchableOpacity onPress={handleStartTrial} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.trialBtn}>
                  <Animated.View style={[styles.shimmerBar, { transform: [{ translateX: shimmerTranslate }] }]} />
                  <Ionicons name="gift-outline" size={20} color="#000" />
                  <View style={styles.trialBtnContent}>
                    <Text style={styles.trialBtnText}>Start {PRO_CONFIG.trialDays}-Day Free Trial</Text>
                    <Text style={styles.trialBtnSub}>No payment required</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Subscribe CTA */}
          <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>
                {trialUsed ? 'Subscribe Now' : 'Or Subscribe Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Guarantee */}
          <View style={styles.guaranteeRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#00e676" />
            <Text style={styles.guaranteeText}>7-day money-back guarantee</Text>
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={() => Alert.alert('Restore', 'No previous purchases found.')} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legalText}>
            Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions in your App Store account settings. Any unused portion of a free trial will be forfeited when you purchase a subscription.
          </Text>
          <Text style={styles.legalText}>
            Terms of Service: https://androgenic.app/terms{'\n'}
            Privacy Policy: https://androgenic.app/privacy
          </Text>

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
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
  socialCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginRight: 10, width: 240, borderWidth: 1, borderColor: COLORS.border },
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
  planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginBottom: 6, borderWidth: 2, borderColor: COLORS.border },
  planCardSelected: { borderColor: COLORS.accent, backgroundColor: 'rgba(124,108,240,0.06)' },
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
  alreadyPro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  proBadgeSuccess: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  alreadyProTitle: { fontSize: 24, fontWeight: '800', color: COLORS.gold, marginBottom: 8 },
  alreadyProText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24 },
  doneBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaywallScreen;
