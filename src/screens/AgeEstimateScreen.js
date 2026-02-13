import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';

const estimateAge = (scores) => {
  if (!scores) return { perceived: 24, real: 22, delta: 2 };
  const skin = scores.skin || 50;
  const eyes = scores.eyes || 50;
  const hair = scores.hair || 50;
  const overall = scores.overall || 50;

  // Higher skin/eye/hair scores = younger looking
  const baseAge = 25;
  const skinFactor = (70 - skin) * 0.12;
  const eyeFactor = (60 - eyes) * 0.08;
  const hairFactor = (65 - hair) * 0.06;
  const perceived = Math.round(baseAge + skinFactor + eyeFactor + hairFactor);
  const realEstimate = Math.round(baseAge - 2 + (100 - overall) * 0.04);
  return {
    perceived: Math.max(16, Math.min(45, perceived)),
    real: Math.max(16, Math.min(40, realEstimate)),
    delta: perceived - realEstimate,
  };
};

const ANTI_AGING_TIPS = [
  { title: 'Daily SPF 50', desc: 'UV damage causes 80% of visible aging. Wear sunscreen every single day.', icon: 'sunny-outline', priority: 'Critical' },
  { title: 'Retinol at Night', desc: 'Gold standard for anti-aging. Start with 0.25% and build to 1%. Boosts collagen and cell turnover.', icon: 'moon-outline', priority: 'High' },
  { title: 'Vitamin C Serum', desc: 'Antioxidant that fights free radicals and brightens skin. Apply every morning before SPF.', icon: 'flash-outline', priority: 'High' },
  { title: 'Sleep 8+ Hours', desc: 'Growth hormone is released during deep sleep. This is when your skin repairs itself.', icon: 'bed-outline', priority: 'High' },
  { title: 'Hyaluronic Acid', desc: 'Holds 1000x its weight in water. Plumps fine lines and keeps skin hydrated from within.', icon: 'water-outline', priority: 'Medium' },
  { title: 'Cut Sugar', desc: 'Glycation breaks down collagen. Reducing sugar intake directly slows skin aging.', icon: 'nutrition-outline', priority: 'Medium' },
  { title: 'Facial Massage', desc: 'Stimulates blood flow and lymph drainage. 5 minutes daily reduces puffiness and firms skin.', icon: 'hand-left-outline', priority: 'Medium' },
  { title: 'Eye Cream', desc: 'The eye area is the first to show age. Use a peptide-based eye cream morning and night.', icon: 'eye-outline', priority: 'Medium' },
  { title: 'Quit Smoking/Alcohol', desc: 'Both accelerate aging dramatically. Even reducing alcohol improves skin within weeks.', icon: 'ban-outline', priority: 'Critical' },
  { title: 'Collagen Peptides', desc: 'Studies show 10g daily improves skin elasticity in 4-8 weeks. Add to coffee or smoothies.', icon: 'beaker-outline', priority: 'Low' },
];

const AgeEstimateScreen = ({ route, navigation }) => {
  const scores = route.params?.scores;
  const age = estimateAge(scores);

  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef(ANTI_AGING_TIPS.map(() => new Animated.Value(0))).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(ringAnim, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();

    fadeAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(500 + i * 80),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const deltaColor = age.delta > 2 ? COLORS.scoreLow : age.delta > 0 ? COLORS.scoreMid : COLORS.scoreHigh;
  const deltaIcon = age.delta > 0 ? 'arrow-up' : age.delta < 0 ? 'arrow-down' : 'remove';
  const deltaText = age.delta > 2 ? 'Looking older than your age' : age.delta > 0 ? 'Slightly above your age' : 'Looking younger than your age!';

  const getPriorityColor = (p) => {
    if (p === 'Critical') return COLORS.scoreLow;
    if (p === 'High') return COLORS.scoreMid;
    return COLORS.textMuted;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Age Estimation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Age Display */}
        <Animated.View style={[styles.ageCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.ageRow}>
            <View style={styles.ageItem}>
              <Text style={styles.ageLabel}>PERCEIVED AGE</Text>
              <Text style={styles.ageValue}>{age.perceived}</Text>
              <Text style={styles.ageUnit}>years old</Text>
            </View>
            <View style={styles.ageDivider}>
              <View style={[styles.deltaCircle, { backgroundColor: deltaColor + '20', borderColor: deltaColor }]}>
                <Ionicons name={deltaIcon} size={16} color={deltaColor} />
                <Text style={[styles.deltaNum, { color: deltaColor }]}>
                  {age.delta > 0 ? '+' : ''}{age.delta}
                </Text>
              </View>
            </View>
            <View style={styles.ageItem}>
              <Text style={styles.ageLabel}>ESTIMATED REAL</Text>
              <Text style={[styles.ageValue, { color: COLORS.accent }]}>{age.real}</Text>
              <Text style={styles.ageUnit}>years old</Text>
            </View>
          </View>
          <View style={[styles.statusBanner, { backgroundColor: deltaColor + '15' }]}>
            <Ionicons name={age.delta <= 0 ? 'checkmark-circle' : 'alert-circle'} size={16} color={deltaColor} />
            <Text style={[styles.statusText, { color: deltaColor }]}>{deltaText}</Text>
          </View>
        </Animated.View>

        {/* Factors */}
        <Text style={styles.sectionTitle}>Aging Factors</Text>
        <View style={styles.factorsGrid}>
          {[
            { label: 'Skin Quality', score: scores?.skin || 50, icon: 'water' },
            { label: 'Eye Area', score: scores?.eyes || 50, icon: 'eye' },
            { label: 'Hair Health', score: scores?.hair || 50, icon: 'leaf' },
            { label: 'Symmetry', score: scores?.symmetry || 50, icon: 'sync' },
          ].map((f, i) => {
            const impact = f.score > 65 ? 'Low' : f.score > 40 ? 'Moderate' : 'High';
            const impactColor = f.score > 65 ? COLORS.scoreHigh : f.score > 40 ? COLORS.scoreMid : COLORS.scoreLow;
            return (
              <View key={i} style={styles.factorCard}>
                <Ionicons name={f.icon} size={20} color={impactColor} />
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={[styles.factorImpact, { color: impactColor }]}>{impact} aging</Text>
              </View>
            );
          })}
        </View>

        {/* Anti-Aging Tips */}
        <Text style={styles.sectionTitle}>Anti-Aging Protocol</Text>
        {ANTI_AGING_TIPS.map((tip, i) => (
          <Animated.View key={i} style={[styles.tipCard, { opacity: fadeAnims[i], transform: [{ translateY: fadeAnims[i].interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
            <View style={styles.tipIcon}>
              <Ionicons name={tip.icon} size={20} color={COLORS.accent} />
            </View>
            <View style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(tip.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(tip.priority) }]}>{tip.priority}</Text>
                </View>
              </View>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </Animated.View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20 },
  ageCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ageItem: { flex: 1, alignItems: 'center' },
  ageLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  ageValue: { fontSize: 48, fontWeight: '900', color: COLORS.textPrimary },
  ageUnit: { color: COLORS.textMuted, fontSize: 12, marginTop: -4 },
  ageDivider: { alignItems: 'center', paddingHorizontal: 8 },
  deltaCircle: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  deltaNum: { fontSize: 12, fontWeight: '800' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  statusText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 4 },
  factorsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  factorCard: {
    width: '48%', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14,
    marginBottom: 8, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  factorLabel: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  factorImpact: { fontSize: 11, fontWeight: '700' },
  tipCard: {
    flexDirection: 'row', gap: 12, backgroundColor: COLORS.bgCard, borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  tipIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(108,92,231,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  tipContent: { flex: 1 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tipTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  tipDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
});

export default AgeEstimateScreen;
