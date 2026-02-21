import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const TRANSFORMATIONS = [
  { name: 'Jake M.', months: 3, before: 5.8, after: 7.2, improvements: ['Jawline +22', 'Skin +18', 'Symmetry +5'], method: 'Mewing + Skincare + Fat Loss' },
  { name: 'Alex R.', months: 6, before: 5.2, after: 6.9, improvements: ['Masculinity +20', 'Jawline +28', 'Eyes +8'], method: 'Full looksmax protocol' },
  { name: 'Chris D.', months: 4, before: 6.1, after: 7.5, improvements: ['Skin +25', 'Hair +15', 'Cheekbones +10'], method: 'Skincare + Nutrition + Gym' },
  { name: 'Tyler K.', months: 8, before: 4.9, after: 7.0, improvements: ['Jawline +35', 'Masculinity +25', 'Skin +20'], method: 'Mewing + Jaw exercises + Posture' },
];

const MILESTONES = [
  { week: 1, title: 'Baseline Scan', desc: 'Take your first scan to establish starting scores', icon: 'camera-outline', color: '#0066ff' },
  { week: 2, title: 'First Habits Set', desc: 'Mewing, skincare, and posture habits established', icon: 'checkmark-done-outline', color: '#00e676' },
  { week: 4, title: 'First Comparison', desc: 'Scan again and compare against baseline', icon: 'git-compare-outline', color: '#00e5ff' },
  { week: 8, title: 'Visible Changes', desc: 'Most users report noticeable improvements', icon: 'eye-outline', color: '#ffab40' },
  { week: 12, title: 'Transformation', desc: 'Full before/after with measurable score increase', icon: 'trophy-outline', color: '#FFD700' },
];

const BeforeAfterScreen = ({ navigation }) => {
  const pro = isPro();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  if (!pro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transformations</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Teaser */}
          <LinearGradient colors={['rgba(0,102,255,0.12)', 'rgba(0,230,118,0.06)']} style={styles.teaserHero}>
            <View style={styles.teaserBefore}>
              <Text style={styles.teaserScore}>5.8</Text>
              <Text style={styles.teaserLabel}>BEFORE</Text>
            </View>
            <View style={styles.teaserArrow}>
              <Ionicons name="arrow-forward" size={24} color={COLORS.accent} />
              <Text style={styles.teaserMonths}>3 months</Text>
            </View>
            <View style={styles.teaserAfter}>
              <Text style={[styles.teaserScore, { color: '#00e676' }]}>7.2</Text>
              <Text style={styles.teaserLabel}>AFTER</Text>
            </View>
          </LinearGradient>

          <Text style={styles.teaserTitle}>Track Your Transformation</Text>
          <Text style={styles.teaserDesc}>
            Compare your scans over time, see score improvements visualized, and track every category change with before/after analysis.
          </Text>

          {/* Sample transformation cards */}
          {TRANSFORMATIONS.slice(0, 1).map((t, i) => (
            <View key={i} style={styles.transformCard}>
              <View style={styles.transformHeader}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.transformAvatar}>
                  <Text style={styles.transformInitial}>{t.name[0]}</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.transformName}>{t.name}</Text>
                  <Text style={styles.transformDuration}>{t.months} months</Text>
                </View>
                <View style={styles.transformScores}>
                  <Text style={styles.transformBefore}>{t.before}</Text>
                  <Ionicons name="arrow-forward" size={12} color={COLORS.textMuted} />
                  <Text style={styles.transformAfter}>{t.after}</Text>
                </View>
              </View>
              <View style={styles.transformImprovements}>
                {t.improvements.map((imp, ii) => (
                  <View key={ii} style={styles.impBadge}>
                    <Ionicons name="trending-up" size={10} color="#00e676" />
                    <Text style={styles.impText}>{imp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Locked remaining */}
          <View style={styles.lockedOverlay}>
            <View style={styles.lockedContent}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
              <Text style={styles.lockedText}>+3 more transformations</Text>
            </View>
            {TRANSFORMATIONS.slice(1, 3).map((t, i) => (
              <View key={i} style={[styles.transformCard, { opacity: 0.15 }]}>
                <View style={styles.transformHeader}>
                  <View style={[styles.transformAvatar, { backgroundColor: COLORS.bgSecondary }]} />
                  <Text style={styles.transformName}>{t.name}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Milestones preview */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your 12-Week Journey</Text>
          {MILESTONES.map((m, i) => (
            <View key={i} style={styles.milestoneRow}>
              <View style={[styles.milestoneIcon, { backgroundColor: m.color + '18' }]}>
                <Ionicons name={m.icon} size={16} color={m.color} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTitle}>Week {m.week}: {m.title}</Text>
                <Text style={styles.milestoneDesc}>{m.desc}</Text>
              </View>
              {i >= 2 && <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />}
            </View>
          ))}

          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.ctaBtn}>
              <Ionicons name="diamond" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Unlock Transformation Tracker</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.ctaSub}>Track unlimited scans with PRO</Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Pro view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transformations</Text>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Your Progress */}
          <LinearGradient colors={GRADIENTS.hero} style={styles.progressHero}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressSubtitle}>Take regular scans to track your transformation journey</Text>
            <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Home')}>
              <LinearGradient colors={GRADIENTS.accent} style={styles.scanBtnGrad}>
                <Ionicons name="camera-outline" size={18} color="#fff" />
                <Text style={styles.scanBtnText}>New Scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          {/* Community Transformations */}
          <Text style={styles.sectionTitle}>Community Results</Text>
          {TRANSFORMATIONS.map((t, i) => (
            <View key={i} style={styles.transformCard}>
              <View style={styles.transformHeader}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.transformAvatar}>
                  <Text style={styles.transformInitial}>{t.name[0]}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transformName}>{t.name}</Text>
                  <Text style={styles.transformDuration}>{t.months} months • {t.method}</Text>
                </View>
                <View style={styles.transformScores}>
                  <Text style={styles.transformBefore}>{t.before}</Text>
                  <Ionicons name="arrow-forward" size={12} color={COLORS.textMuted} />
                  <Text style={styles.transformAfter}>{t.after}</Text>
                </View>
              </View>
              <View style={styles.transformImprovements}>
                {t.improvements.map((imp, ii) => (
                  <View key={ii} style={styles.impBadge}>
                    <Ionicons name="trending-up" size={10} color="#00e676" />
                    <Text style={styles.impText}>{imp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Milestones */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>12-Week Journey</Text>
          {MILESTONES.map((m, i) => (
            <View key={i} style={styles.milestoneRow}>
              <View style={[styles.milestoneIcon, { backgroundColor: m.color + '18' }]}>
                <Ionicons name={m.icon} size={16} color={m.color} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTitle}>Week {m.week}: {m.title}</Text>
                <Text style={styles.milestoneDesc}>{m.desc}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  proBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '900', color: '#000', letterSpacing: 1 },
  // Teaser
  teaserHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 28, borderRadius: 22, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  teaserBefore: { alignItems: 'center' },
  teaserAfter: { alignItems: 'center' },
  teaserScore: { fontSize: 36, fontWeight: '900', color: COLORS.textPrimary },
  teaserLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 2 },
  teaserArrow: { alignItems: 'center', marginHorizontal: 20 },
  teaserMonths: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  teaserTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  teaserDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  // Transform cards
  transformCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  transformHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  transformAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  transformInitial: { fontSize: 16, fontWeight: '800', color: '#fff' },
  transformName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  transformDuration: { fontSize: 11, color: COLORS.textMuted },
  transformScores: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' },
  transformBefore: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted },
  transformAfter: { fontSize: 16, fontWeight: '800', color: '#00e676' },
  transformImprovements: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  impBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,230,118,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  impText: { fontSize: 11, color: '#00e676', fontWeight: '600' },
  // Locked
  lockedOverlay: { position: 'relative', marginBottom: 16 },
  lockedContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  lockedText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  // Milestones
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  milestoneIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  milestoneContent: { flex: 1 },
  milestoneTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  milestoneDesc: { fontSize: 11, color: COLORS.textMuted },
  // CTA
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, marginTop: 16, ...SHADOWS.accentGlow },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  ctaSub: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  // Pro progress
  progressHero: { padding: 24, borderRadius: 22, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  progressTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  progressSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 14 },
  scanBtn: {},
  scanBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  scanBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default BeforeAfterScreen;
