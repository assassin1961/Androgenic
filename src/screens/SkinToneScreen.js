import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

const SKIN_TONES = [
  { id: 'I', name: 'Type I — Fair', hex: '#FDEBD0', desc: 'Always burns, never tans', uvRisk: 'Very High', spf: '50+', concerns: ['Sun damage', 'Redness', 'Visible veins'], routine: 'Focus on SPF 50+ daily, vitamin C serum, gentle products. Avoid harsh exfoliants.' },
  { id: 'II', name: 'Type II — Light', hex: '#F5CBA7', desc: 'Burns easily, tans minimally', uvRisk: 'High', spf: '50', concerns: ['Freckling', 'Sun spots', 'Rosacea'], routine: 'SPF 50 daily, niacinamide for redness, retinol at night. Chemical sunscreen OK.' },
  { id: 'III', name: 'Type III — Medium', hex: '#E0B888', desc: 'Sometimes burns, tans gradually', uvRisk: 'Moderate', spf: '30-50', concerns: ['Hyperpigmentation', 'Melasma', 'Uneven tone'], routine: 'SPF 30-50, vitamin C + niacinamide combo, AHAs for exfoliation. Retinol safe.' },
  { id: 'IV', name: 'Type IV — Olive', hex: '#C49A6C', desc: 'Rarely burns, tans easily', uvRisk: 'Moderate', spf: '30', concerns: ['Dark spots', 'Hyperpigmentation', 'Scarring'], routine: 'SPF 30 minimum, tranexamic acid for dark spots, azelaic acid. Be cautious with lasers.' },
  { id: 'V', name: 'Type V — Brown', hex: '#A0785A', desc: 'Very rarely burns, tans darkly', uvRisk: 'Lower', spf: '30', concerns: ['Keloid scarring', 'Post-inflammatory hyperpigmentation', 'Ashiness'], routine: 'SPF 30 (look for no white cast), moisturize heavily, gentle actives. Avoid aggressive peels.' },
  { id: 'VI', name: 'Type VI — Dark', hex: '#6B4C3B', desc: 'Never burns, deeply pigmented', uvRisk: 'Lower', spf: '30', concerns: ['Hyperpigmentation', 'Ingrown hairs', 'Ashiness'], routine: 'SPF 30 mineral or tinted, rich moisturizer, vitamin C, gentle chemical exfoliants only.' },
];

const PRODUCT_RECS = {
  I: [
    { name: 'EltaMD UV Clear SPF 46', why: 'Lightweight, no irritation for sensitive fair skin' },
    { name: 'La Roche-Posay Cicaplast', why: 'Soothes redness and repairs skin barrier' },
    { name: 'SkinCeuticals C E Ferulic', why: 'Gold standard antioxidant protection' },
  ],
  II: [
    { name: 'Supergoop Unseen SPF 40', why: 'Invisible finish, great for light skin' },
    { name: 'The Ordinary Niacinamide 10%', why: 'Controls redness and oil' },
    { name: 'Differin Adapalene', why: 'Anti-aging retinoid without irritation' },
  ],
  III: [
    { name: 'Black Girl Sunscreen SPF 30', why: 'No white cast, moisturizing' },
    { name: 'Timeless Vitamin C', why: 'Brightens and evens skin tone' },
    { name: 'Paula\'s Choice 2% BHA', why: 'Unclogs pores, smooths texture' },
  ],
  IV: [
    { name: 'Isntree Hyaluronic Acid SPF 50', why: 'Hydrating, no white cast' },
    { name: 'Naturium Tranexamic Acid', why: 'Targets stubborn dark spots' },
    { name: 'Azelaic Acid 10%', why: 'Brightening without irritation' },
  ],
  V: [
    { name: 'Black Girl Sunscreen SPF 30', why: 'Designed for darker skin, zero white cast' },
    { name: 'Faded by Topicals', why: 'Targets hyperpigmentation safely' },
    { name: 'CeraVe Moisturizing Cream', why: 'Rich ceramide moisturizer prevents ashiness' },
  ],
  VI: [
    { name: 'Unsun Mineral Tinted SPF 30', why: 'Tinted mineral for deep skin tones' },
    { name: 'Ambi Fade Cream', why: 'Classic hyperpigmentation treatment' },
    { name: 'Shea Moisture African Black Soap', why: 'Gentle cleansing for melanin-rich skin' },
  ],
};

const SkinToneScreen = ({ navigation, route }) => {
  const scores = route?.params?.scores;
  const [selected, setSelected] = useState(null);
  const cardAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const detailAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  useEffect(() => {
    if (selected) {
      detailAnim.setValue(0);
      Animated.spring(detailAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    }
  }, [selected]);

  // Auto-detect skin tone from scores if available
  const autoDetected = scores ? (() => {
    const skinScore = scores.skin || 50;
    if (skinScore >= 80) return 'II';
    if (skinScore >= 65) return 'III';
    if (skinScore >= 50) return 'IV';
    if (skinScore >= 35) return 'V';
    return 'III';
  })() : null;

  const selectedTone = selected ? SKIN_TONES.find(t => t.id === selected) : null;
  const recs = selected ? PRODUCT_RECS[selected] || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skin Tone Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Select your Fitzpatrick skin type for personalized product and routine recommendations.
        </Text>

        {/* Tone Grid */}
        <View style={styles.toneGrid}>
          {SKIN_TONES.map((tone, i) => (
            <Animated.View key={tone.id} style={{
              opacity: cardAnims[i],
              transform: [{ scale: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            }}>
              <TouchableOpacity
                style={[
                  styles.toneCard,
                  selected === tone.id && styles.toneCardSelected,
                  autoDetected === tone.id && !selected && styles.toneCardAuto,
                ]}
                onPress={() => setSelected(tone.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.toneSwatch, { backgroundColor: tone.hex }]} />
                <View style={styles.toneInfo}>
                  <Text style={styles.toneName}>{tone.name}</Text>
                  <Text style={styles.toneDesc}>{tone.desc}</Text>
                </View>
                {autoDetected === tone.id && !selected && (
                  <View style={styles.autoTag}>
                    <Text style={styles.autoTagText}>Detected</Text>
                  </View>
                )}
                {selected === tone.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Detail Panel */}
        {selectedTone && (
          <Animated.View style={{
            opacity: detailAnim,
            transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            {/* UV Risk & SPF */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Ionicons name="sunny" size={20} color="#ff9f43" />
                <Text style={styles.infoLabel}>UV Risk</Text>
                <Text style={styles.infoValue}>{selectedTone.uvRisk}</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.scoreHigh} />
                <Text style={styles.infoLabel}>Min SPF</Text>
                <Text style={styles.infoValue}>{selectedTone.spf}</Text>
              </View>
            </View>

            {/* Key Concerns */}
            <Text style={styles.sectionTitle}>Key Concerns</Text>
            <View style={styles.concernsRow}>
              {selectedTone.concerns.map((c, i) => (
                <View key={i} style={styles.concernBadge}>
                  <Text style={styles.concernText}>{c}</Text>
                </View>
              ))}
            </View>

            {/* Routine */}
            <Text style={styles.sectionTitle}>Recommended Routine</Text>
            <View style={styles.routineCard}>
              <Ionicons name="flask" size={18} color={COLORS.accent} />
              <Text style={styles.routineText}>{selectedTone.routine}</Text>
            </View>

            {/* Product Recommendations */}
            <Text style={styles.sectionTitle}>Top Products for You</Text>
            {recs.map((rec, i) => (
              <View key={i} style={styles.recCard}>
                <View style={styles.recIdx}>
                  <Text style={styles.recIdxText}>{i + 1}</Text>
                </View>
                <View style={styles.recInfo}>
                  <Text style={styles.recName}>{rec.name}</Text>
                  <Text style={styles.recWhy}>{rec.why}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

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
  intro: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  toneGrid: { gap: 8, marginBottom: 20 },
  toneCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  toneCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  toneCardAuto: { borderColor: COLORS.scoreHigh + '50' },
  toneSwatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  toneInfo: { flex: 1 },
  toneName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  toneDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  autoTag: { backgroundColor: COLORS.scoreHigh + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  autoTagText: { color: COLORS.scoreHigh, fontSize: 10, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  infoValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 8 },
  concernsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  concernBadge: { backgroundColor: COLORS.scoreLow + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  concernText: { color: COLORS.scoreLow, fontSize: 12, fontWeight: '600' },
  routineCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14,
    gap: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  routineText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  recCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12,
    gap: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  recIdx: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  recIdxText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  recInfo: { flex: 1 },
  recName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  recWhy: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
});

export default SkinToneScreen;
