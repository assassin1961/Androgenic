import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';

const { width } = Dimensions.get('window');

const SHOWCASE_FEATURES = [
  {
    icon: 'scan-outline',
    title: 'Unlimited Scans',
    desc: 'Scan as many times as you want. Track every change.',
    free: '3/day',
    pro: 'Unlimited',
    color: '#0066ff',
  },
  {
    icon: 'grid-outline',
    title: 'All 7 Categories',
    desc: 'Full analysis across masculinity, jawline, eyes, cheekbones, hair, skin, and symmetry.',
    free: '3 categories',
    pro: '7 categories',
    color: '#00e676',
  },
  {
    icon: 'people-outline',
    title: 'Celebrity Matching',
    desc: 'See which celebrities share your facial structure. 12+ celebrity database with match percentage.',
    free: 'Locked',
    pro: 'Full Access',
    color: '#ff6b35',
  },
  {
    icon: 'analytics-outline',
    title: 'Facial Ratios',
    desc: '8 precise facial ratios including Golden Ratio, fWHR, and Canthal Tilt measurement.',
    free: 'Locked',
    pro: 'Full Access',
    color: '#00e5ff',
  },
  {
    icon: 'trending-up',
    title: 'Progress Tracking',
    desc: 'Track your scores over time. See improvement graphs and trend analysis.',
    free: 'Locked',
    pro: 'Full Access',
    color: '#ffab40',
  },
  {
    icon: 'clipboard-outline',
    title: '12-Week Plan',
    desc: 'Personalized improvement plan with 3 phases and 18 actionable tasks.',
    free: 'Locked',
    pro: 'Full Access',
    color: '#4d94ff',
  },
  {
    icon: 'bulb-outline',
    title: 'Unlimited Tips',
    desc: 'Get every recommendation for every category. No more "Unlock 4 more tips" messages.',
    free: '1 per category',
    pro: 'Unlimited',
    color: '#ff6090',
  },
  {
    icon: 'time-outline',
    title: 'Full History',
    desc: 'Access your complete scan history. Compare any two scans side by side.',
    free: '3 scans',
    pro: 'Unlimited',
    color: '#1de9b6',
  },
];

const TESTIMONIALS = [
  { name: 'Jake M.', age: 22, text: 'Went from a 5.8 to 7.2 in 3 months following the pro plan. The detailed category breakdowns showed me exactly what to work on.', rating: 5, improvement: '+1.4' },
  { name: 'Alex R.', age: 19, text: 'The facial ratio analysis blew my mind. Found out my midface ratio was off and the mewing guide helped fix it. Worth every penny.', rating: 5, improvement: '+0.9' },
  { name: 'Chris D.', age: 25, text: 'Celebrity matching is fun but the real value is progress tracking. Seeing my scores improve week by week keeps me motivated.', rating: 5, improvement: '+1.1' },
  { name: 'Tyler K.', age: 20, text: 'The 12-week plan is insanely good. Each phase builds on the last. My jawline score went up 18 points.', rating: 5, improvement: '+2.0' },
];

const STATS = [
  { value: '847K+', label: 'Scans Completed' },
  { value: '93%', label: 'See Improvement' },
  { value: '4.9', label: 'App Rating' },
  { value: '12K+', label: 'PRO Members' },
];

const ProFeaturesScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(SHOWCASE_FEATURES.map(() => ({
    fade: new Animated.Value(0), slide: new Animated.Value(20),
  }))).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 70),
        Animated.parallel([
          Animated.timing(anim.fade, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(anim.slide, { toValue: 0, friction: 8, useNativeDriver: true }),
        ]),
      ]).start();
    });

    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2500, useNativeDriver: true })
    ).start();
  }, []);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1], outputRange: [-width, width],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['rgba(255,215,0,0.12)', 'rgba(0,102,255,0.08)', 'rgba(255,215,0,0.04)']} style={styles.heroBg}>
            <View style={styles.heroGlow}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.heroBadge}>
                <Ionicons name="diamond" size={32} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Androgenic PRO</Text>
            <Text style={styles.heroSubtitle}>The complete looksmaxxing toolkit</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              {STATS.map((s, i) => (
                <View key={i} style={styles.stat}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Free vs Pro Comparison */}
        <View style={styles.comparisonHeader}>
          <Text style={styles.sectionTitle}>Free vs PRO</Text>
          <View style={styles.compLabels}>
            <Text style={styles.compLabel}>FREE</Text>
            <Text style={[styles.compLabel, { color: COLORS.gold }]}>PRO</Text>
          </View>
        </View>

        {SHOWCASE_FEATURES.map((feat, idx) => (
          <Animated.View key={idx} style={{ opacity: cardAnims[idx].fade, transform: [{ translateY: cardAnims[idx].slide }] }}>
            <View style={styles.featureCard}>
              <View style={styles.featureTop}>
                <View style={[styles.featureIconBg, { backgroundColor: feat.color + '18' }]}>
                  <Ionicons name={feat.icon} size={20} color={feat.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feat.title}</Text>
                  <Text style={styles.featureDesc}>{feat.desc}</Text>
                </View>
              </View>
              <View style={styles.compRow}>
                <View style={styles.compFree}>
                  <Ionicons name="close-circle" size={14} color="#ff5252" />
                  <Text style={styles.compFreeText}>{feat.free}</Text>
                </View>
                <View style={styles.compPro}>
                  <Ionicons name="checkmark-circle" size={14} color="#00e676" />
                  <Text style={styles.compProText}>{feat.pro}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Testimonials */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Success Stories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
          {TESTIMONIALS.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialInitial}>{t.name[0]}</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.testimonialName}>{t.name}, {t.age}</Text>
                  <View style={styles.starsRow}>
                    {[...Array(t.rating)].map((_, si) => (
                      <Ionicons key={si} name="star" size={12} color={COLORS.gold} />
                    ))}
                  </View>
                </View>
                <View style={styles.improvementBadge}>
                  <Text style={styles.improvementText}>{t.improvement}</Text>
                </View>
              </View>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
            </View>
          ))}
        </ScrollView>

        {/* Money-back guarantee */}
        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={24} color="#00e676" />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>100% Money-Back Guarantee</Text>
            <Text style={styles.guaranteeDesc}>Not satisfied? Get a full refund within 7 days. No questions asked.</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.ctaButton}>
            <Animated.View style={[styles.ctaShimmer, { transform: [{ translateX: shimmerTranslate }] }]} />
            <Text style={styles.ctaText}>Start Free Trial</Text>
            <Text style={styles.ctaSubtext}>3 days free, then $9.99/month</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.legalText}>Cancel anytime. No commitment.</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroSection: { marginBottom: 24 },
  heroBg: { padding: 28, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)' },
  heroGlow: { marginBottom: 16, ...SHADOWS.accentGlow },
  heroBadge: { width: 68, height: 68, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.gold, letterSpacing: 1, marginBottom: 4 },
  heroSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  comparisonHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  compLabels: { flexDirection: 'row', gap: 28 },
  compLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  featureCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  featureTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  featureIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  compRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  compFree: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,82,82,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  compFreeText: { fontSize: 11, color: '#ff5252', fontWeight: '600' },
  compPro: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,230,118,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  compProText: { fontSize: 11, color: '#00e676', fontWeight: '700' },
  testimonialScroll: { marginBottom: 20 },
  testimonialCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginRight: 12, width: 280, borderWidth: 1, borderColor: COLORS.border },
  testimonialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  testimonialInitial: { fontSize: 16, fontWeight: '800', color: '#fff' },
  testimonialName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  starsRow: { flexDirection: 'row', gap: 1, marginTop: 2 },
  improvementBadge: { marginLeft: 'auto', backgroundColor: 'rgba(0,230,118,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  improvementText: { fontSize: 13, fontWeight: '800', color: '#00e676' },
  testimonialText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  guaranteeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,230,118,0.06)', borderRadius: 16, padding: 16, gap: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,230,118,0.15)' },
  guaranteeContent: { flex: 1 },
  guaranteeTitle: { fontSize: 14, fontWeight: '700', color: '#00e676', marginBottom: 2 },
  guaranteeDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  ctaButton: { borderRadius: 18, padding: 18, alignItems: 'center', overflow: 'hidden', ...SHADOWS.accentGlow },
  ctaShimmer: { position: 'absolute', top: 0, bottom: 0, width: 60, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ skewX: '-20deg' }] },
  ctaText: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
  ctaSubtext: { fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 2 },
  legalText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 10 },
});

export default ProFeaturesScreen;
