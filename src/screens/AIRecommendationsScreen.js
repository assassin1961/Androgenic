import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { isPro } from '../utils/pro';

const AI_CATEGORIES = [
  {
    category: 'Priority Actions',
    icon: 'flash-outline',
    color: '#ff6b35',
    tips: [
      { title: 'Start mewing immediately', impact: 'High', timeline: '6-12 months', desc: 'Your maxilla positioning suggests significant improvement potential. Proper tongue posture can reshape your midface over time.' },
      { title: 'Reduce body fat to 12-14%', impact: 'High', timeline: '2-4 months', desc: 'Your facial definition score would jump 15+ points with lower body fat revealing your bone structure.' },
      { title: 'Begin retinoid treatment', impact: 'High', timeline: '3-6 months', desc: 'Skin texture analysis shows uneven tone. Tretinoin 0.025% would significantly improve clarity and glow.' },
    ],
  },
  {
    category: 'Quick Wins',
    icon: 'rocket-outline',
    color: '#00e676',
    tips: [
      { title: 'Optimize your hairstyle', impact: 'Medium', timeline: 'Immediate', desc: 'Based on your face shape analysis, a textured quiff with faded sides would maximize your facial proportions.' },
      { title: 'Groom your eyebrows', impact: 'Medium', timeline: 'Immediate', desc: 'Clean up your brow shape to enhance the eye area score. Remove strays, don\'t reshape.' },
      { title: 'Fix your skincare routine', impact: 'Medium', timeline: '2-4 weeks', desc: 'Adding vitamin C serum AM and niacinamide PM would address the areas flagged in your skin analysis.' },
    ],
  },
  {
    category: 'Long-Term Strategy',
    icon: 'calendar-outline',
    color: '#7c6cf0',
    tips: [
      { title: 'Jawline training protocol', impact: 'High', timeline: '3-6 months', desc: 'Your jaw score indicates masseter underdevelopment. Daily mastic gum chewing + jaw exercises will add definition.' },
      { title: 'Neck training for aesthetics', impact: 'Medium', timeline: '2-3 months', desc: 'A thicker neck improves jaw-neck ratio dramatically. Add neck curls 3x/week to your routine.' },
      { title: 'Posture correction program', impact: 'High', timeline: '1-3 months', desc: 'Forward head posture detected. This is masking your jawline. Chin tucks + wall angels daily.' },
      { title: 'Collagen supplementation', impact: 'Low', timeline: '3-6 months', desc: 'Support skin elasticity and joint health with 10g collagen peptides daily for subtle but compounding benefits.' },
    ],
  },
  {
    category: 'Lifestyle Optimization',
    icon: 'leaf-outline',
    color: '#00e5ff',
    tips: [
      { title: 'Sleep optimization', impact: 'High', timeline: '1-2 weeks', desc: 'Dark circles and skin quality suggest poor sleep. 7-9 hours, mouth taped, back sleeping position.' },
      { title: 'Anti-inflammatory diet', impact: 'Medium', timeline: '2-4 weeks', desc: 'Cut dairy and sugar for 30 days. Your skin inflammation markers suggest dietary triggers.' },
      { title: 'Hydration protocol', impact: 'Medium', timeline: '1 week', desc: 'Facial bloating pattern suggests inadequate hydration. 3L water minimum, reduce sodium to under 2000mg.' },
    ],
  },
];

const AIRecommendationsScreen = ({ navigation }) => {
  const pro = isPro();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedCategory, setExpandedCategory] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  if (!pro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.lockedContainer}>
          <LinearGradient colors={['rgba(255,215,0,0.12)', 'rgba(124,108,240,0.06)']} style={styles.lockedCard}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={28} color="#000" />
            </LinearGradient>
            <Text style={styles.lockedTitle}>AI-Powered Recommendations</Text>
            <Text style={styles.lockedDesc}>
              Get personalized, actionable advice based on your unique facial analysis. Our AI generates a custom improvement roadmap just for you.
            </Text>
            {/* Preview blurred tips */}
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>PREVIEW</Text>
              {[
                { title: 'Start mewing immediately', impact: 'High' },
                { title: 'Reduce body fat to 12-14%', impact: 'High' },
                { title: '??? ?????? ???? ????????', impact: '????' },
              ].map((t, i) => (
                <View key={i} style={[styles.previewTip, i === 2 && styles.blurredTip]}>
                  <View style={[styles.impactDot, { backgroundColor: i < 2 ? '#ff6b35' : COLORS.textMuted }]} />
                  <Text style={[styles.previewTipText, i === 2 && styles.blurredText]}>{t.title}</Text>
                  <View style={[styles.impactBadge, { backgroundColor: i < 2 ? '#ff6b3518' : '#55556618' }]}>
                    <Text style={[styles.impactBadgeText, { color: i < 2 ? '#ff6b35' : COLORS.textMuted }]}>{t.impact}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.moreBlurred}>
                <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
                <Text style={styles.moreBlurredText}>+10 more personalized recommendations</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <LinearGradient colors={GRADIENTS.gold} style={styles.unlockBtn}>
                <Ionicons name="diamond" size={16} color="#000" />
                <Text style={styles.unlockBtnText}>Unlock with PRO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={GRADIENTS.hero} style={styles.hero}>
            <View style={styles.heroIconBg}>
              <Ionicons name="sparkles" size={28} color={COLORS.accent} />
            </View>
            <Text style={styles.heroTitle}>Your Personalized Roadmap</Text>
            <Text style={styles.heroSubtitle}>13 AI-generated recommendations based on your latest scan analysis</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}><Text style={styles.heroStatNum}>4</Text><Text style={styles.heroStatLabel}>High Impact</Text></View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}><Text style={styles.heroStatNum}>5</Text><Text style={styles.heroStatLabel}>Medium</Text></View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}><Text style={styles.heroStatNum}>4</Text><Text style={styles.heroStatLabel}>Quick Wins</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {AI_CATEGORIES.map((cat, ci) => (
          <View key={ci}>
            <TouchableOpacity
              style={[styles.catHeader, expandedCategory === ci && styles.catHeaderActive]}
              onPress={() => setExpandedCategory(expandedCategory === ci ? -1 : ci)}
              activeOpacity={0.7}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                <Ionicons name={cat.icon} size={20} color={cat.color} />
              </View>
              <View style={styles.catInfo}>
                <Text style={styles.catTitle}>{cat.category}</Text>
                <Text style={styles.catCount}>{cat.tips.length} recommendations</Text>
              </View>
              <Ionicons name={expandedCategory === ci ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedCategory === ci && (
              <View style={styles.catBody}>
                {cat.tips.map((tip, ti) => (
                  <View key={ti} style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <View style={[styles.impactBadge, {
                        backgroundColor: tip.impact === 'High' ? '#ff6b3518' : tip.impact === 'Medium' ? '#ffab4018' : '#00e67618'
                      }]}>
                        <Text style={[styles.impactBadgeText, {
                          color: tip.impact === 'High' ? '#ff6b35' : tip.impact === 'Medium' ? '#ffab40' : '#00e676'
                        }]}>{tip.impact}</Text>
                      </View>
                    </View>
                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                    <View style={styles.tipFooter}>
                      <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.tipTimeline}>{tip.timeline}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  proBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '900', color: '#000', letterSpacing: 1 },
  // Locked state
  lockedContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  lockedCard: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)' },
  lockedBadge: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  lockedTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  lockedDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  previewSection: { width: '100%', marginBottom: 20 },
  previewLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8 },
  previewTip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 10, marginBottom: 4, gap: 8 },
  blurredTip: { opacity: 0.3 },
  impactDot: { width: 8, height: 8, borderRadius: 4 },
  previewTipText: { flex: 1, fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  blurredText: { color: COLORS.textMuted },
  moreBlurred: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 8, opacity: 0.5 },
  moreBlurredText: { fontSize: 12, color: COLORS.textMuted },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  unlockBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },
  // Pro state
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, alignItems: 'center' },
  heroIconBg: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 14 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  heroStatLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  heroStatDiv: { width: 1, height: 24, backgroundColor: COLORS.border },
  catHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  catHeaderActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  catIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catInfo: { flex: 1 },
  catTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  catCount: { fontSize: 11, color: COLORS.textMuted },
  catBody: { backgroundColor: COLORS.bgCard, padding: 12, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40', gap: 6 },
  tipCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 12 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  impactBadgeText: { fontSize: 10, fontWeight: '700' },
  tipDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 6 },
  tipFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipTimeline: { fontSize: 11, color: COLORS.textMuted },
});

export default AIRecommendationsScreen;
