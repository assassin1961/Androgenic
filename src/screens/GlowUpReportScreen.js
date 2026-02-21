import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { isPro } from '../utils/pro';

const REPORT_SECTIONS = [
  { title: 'Overall Rating', icon: 'star-outline', value: '7.2 / 10', desc: 'Above Average — Top 28%', color: '#00e676' },
  { title: 'Strongest Category', icon: 'trophy-outline', value: 'Eyes — 82', desc: 'Hunter eye morphology detected', color: '#FFD700' },
  { title: 'Biggest Opportunity', icon: 'trending-up', value: 'Jawline — 58', desc: '+22 points potential with training', color: '#ff6b35' },
  { title: 'Symmetry Score', icon: 'git-compare-outline', value: '91 / 100', desc: 'Top 15% facial symmetry', color: '#0066ff' },
  { title: 'Age Perception', icon: 'hourglass-outline', value: '2 years younger', desc: 'You look younger than your age', color: '#00e5ff' },
  { title: 'Celebrity Match', icon: 'people-outline', value: 'Henry Cavill — 73%', desc: 'Based on facial structure analysis', color: '#4d94ff' },
];

const DETAILED_SCORES = [
  { category: 'Masculinity', score: 71, percentile: 'Top 35%', trend: '+3', color: '#ff6b35' },
  { category: 'Jawline', score: 58, percentile: 'Top 52%', trend: '+5', color: '#0066ff' },
  { category: 'Eyes', score: 82, percentile: 'Top 18%', trend: '+1', color: '#00e676' },
  { category: 'Cheekbones', score: 65, percentile: 'Top 40%', trend: '+2', color: '#00e5ff' },
  { category: 'Hair', score: 74, percentile: 'Top 30%', trend: '+0', color: '#ffab40' },
  { category: 'Skin', score: 69, percentile: 'Top 38%', trend: '+7', color: '#ff6090' },
  { category: 'Symmetry', score: 91, percentile: 'Top 15%', trend: '+0', color: '#1de9b6' },
];

const RATIOS_DATA = [
  { name: 'Golden Ratio', value: '1.58', ideal: '1.618', status: 'Near Ideal' },
  { name: 'fWHR', value: '1.92', ideal: '1.8-2.0', status: 'Ideal' },
  { name: 'Jaw-Face Ratio', value: '0.72', ideal: '0.75-0.80', status: 'Slightly Narrow' },
  { name: 'Midface Ratio', value: '0.96', ideal: '1.0', status: 'Good' },
  { name: 'Canthal Tilt', value: '+4°', ideal: '+4-8°', status: 'Positive' },
];

const ACTION_PLAN = [
  { priority: 1, action: 'Begin daily mewing practice', category: 'Jaw', timeframe: 'Start today' },
  { priority: 2, action: 'Start skincare routine (AM/PM)', category: 'Skin', timeframe: 'This week' },
  { priority: 3, action: 'Reduce body fat to reveal structure', category: 'Overall', timeframe: '2-3 months' },
  { priority: 4, action: 'Add jaw exercises + mastic gum', category: 'Jaw', timeframe: 'This week' },
  { priority: 5, action: 'Optimize hairstyle for face shape', category: 'Hair', timeframe: 'Next cut' },
];

const GlowUpReportScreen = ({ navigation }) => {
  const pro = isPro();
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
          <Text style={styles.headerTitle}>Glow-Up Report</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.lockedScroll}>
          <LinearGradient colors={['rgba(0,102,255,0.12)', 'rgba(0,102,255,0.03)']} style={styles.lockedHero}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.lockedIcon}>
              <Ionicons name="document-text" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.lockedTitle}>Your Complete Glow-Up Report</Text>
            <Text style={styles.lockedDesc}>A comprehensive breakdown of your facial aesthetics with scores, ratios, percentile rankings, and a prioritized action plan.</Text>
          </LinearGradient>

          {/* Preview cards - partially visible */}
          <Text style={styles.previewLabel}>WHAT'S INCLUDED</Text>
          {[
            { icon: 'bar-chart-outline', text: '7 detailed category scores with percentile rankings' },
            { icon: 'analytics-outline', text: '5 facial ratio measurements vs ideal values' },
            { icon: 'people-outline', text: 'Celebrity match with similarity percentage' },
            { icon: 'clipboard-outline', text: 'Prioritized 5-step action plan' },
            { icon: 'trending-up', text: 'Score trends and improvement tracking' },
            { icon: 'share-social-outline', text: 'Shareable report card' },
          ].map((item, i) => (
            <View key={i} style={styles.previewItem}>
              <View style={styles.previewItemIcon}>
                <Ionicons name={item.icon} size={16} color={COLORS.accent} />
              </View>
              <Text style={styles.previewItemText}>{item.text}</Text>
              <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
            </View>
          ))}

          {/* Blurred preview */}
          <View style={styles.blurPreview}>
            <View style={styles.blurOverlay}>
              <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
              <Text style={styles.blurText}>Unlock Full Report</Text>
            </View>
            {REPORT_SECTIONS.slice(0, 2).map((s, i) => (
              <View key={i} style={[styles.previewCard, { opacity: 0.15 }]}>
                <Text style={styles.previewCardTitle}>{s.title}</Text>
                <Text style={styles.previewCardValue}>{s.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.unlockBtn}>
              <Ionicons name="diamond" size={18} color="#fff" />
              <Text style={styles.unlockBtnText}>Unlock with PRO</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.trialText}>Start 3-day free trial</Text>
        </ScrollView>
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
          <Text style={styles.headerTitle}>Glow-Up Report</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Summary Cards */}
          <Text style={styles.sectionTitle}>Analysis Summary</Text>
          <View style={styles.summaryGrid}>
            {REPORT_SECTIONS.map((s, i) => (
              <View key={i} style={styles.summaryCard}>
                <View style={[styles.summaryIcon, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <Text style={styles.summaryLabel}>{s.title}</Text>
                <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>

          {/* Detailed Scores */}
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {DETAILED_SCORES.map((s, i) => (
            <View key={i} style={styles.scoreRow}>
              <View style={[styles.scoreColor, { backgroundColor: s.color }]} />
              <Text style={styles.scoreCat}>{s.category}</Text>
              <Text style={styles.scorePercentile}>{s.percentile}</Text>
              <Text style={[styles.scoreVal, { color: s.color }]}>{s.score}</Text>
              <View style={[styles.trendBadge, { backgroundColor: parseInt(s.trend) > 0 ? '#00e67618' : '#55556618' }]}>
                <Text style={[styles.trendText, { color: parseInt(s.trend) > 0 ? '#00e676' : COLORS.textMuted }]}>
                  {parseInt(s.trend) > 0 ? '+' : ''}{s.trend}
                </Text>
              </View>
            </View>
          ))}

          {/* Ratios */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Facial Ratios</Text>
          {RATIOS_DATA.map((r, i) => (
            <View key={i} style={styles.ratioRow}>
              <View style={styles.ratioInfo}>
                <Text style={styles.ratioName}>{r.name}</Text>
                <Text style={styles.ratioIdeal}>Ideal: {r.ideal}</Text>
              </View>
              <Text style={styles.ratioValue}>{r.value}</Text>
              <View style={[styles.statusBadge, {
                backgroundColor: r.status === 'Ideal' || r.status === 'Near Ideal' || r.status === 'Positive' ? '#00e67618' : '#ffab4018'
              }]}>
                <Text style={[styles.statusText, {
                  color: r.status === 'Ideal' || r.status === 'Near Ideal' || r.status === 'Positive' ? '#00e676' : '#ffab40'
                }]}>{r.status}</Text>
              </View>
            </View>
          ))}

          {/* Action Plan */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Priority Action Plan</Text>
          {ACTION_PLAN.map((a, i) => (
            <View key={i} style={styles.actionRow}>
              <LinearGradient colors={GRADIENTS.accent} style={styles.actionNum}>
                <Text style={styles.actionNumText}>{a.priority}</Text>
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>{a.action}</Text>
                <View style={styles.actionMeta}>
                  <Text style={styles.actionCat}>{a.category}</Text>
                  <Text style={styles.actionTime}>{a.timeframe}</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  lockedScroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  proBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '900', color: '#000', letterSpacing: 1 },
  // Locked
  lockedHero: { padding: 28, borderRadius: 22, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  lockedIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 14, ...SHADOWS.accentGlow },
  lockedTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  lockedDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  previewLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8 },
  previewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  previewItemIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center' },
  previewItemText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  blurPreview: { position: 'relative', marginTop: 12, marginBottom: 20, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.bgCard, padding: 16 },
  blurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5,5,10,0.7)' },
  blurText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginTop: 6 },
  previewCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 14, marginBottom: 6 },
  previewCardTitle: { fontSize: 12, color: COLORS.textMuted },
  previewCardValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, ...SHADOWS.accentGlow },
  unlockBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  trialText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 8, marginBottom: 20 },
  // Pro state
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { width: '48%', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  summaryDesc: { fontSize: 10, color: COLORS.textMuted, lineHeight: 14 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  scoreColor: { width: 4, height: 28, borderRadius: 2 },
  scoreCat: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  scorePercentile: { fontSize: 11, color: COLORS.textMuted },
  scoreVal: { fontSize: 18, fontWeight: '800', width: 36, textAlign: 'right' },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, minWidth: 30, alignItems: 'center' },
  trendText: { fontSize: 11, fontWeight: '700' },
  ratioRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border },
  ratioInfo: { flex: 1 },
  ratioName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  ratioIdeal: { fontSize: 11, color: COLORS.textMuted },
  ratioValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  actionNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  actionNumText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  actionContent: { flex: 1 },
  actionText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  actionMeta: { flexDirection: 'row', gap: 10 },
  actionCat: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  actionTime: { fontSize: 11, color: COLORS.textMuted },
});

export default GlowUpReportScreen;
