import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const ROUTINES = {
  morning: [
    { step: 1, name: 'Cleanser', desc: 'Gentle water-based cleanser to remove overnight oil. Avoid harsh sulfates.', ingredient: 'CeraVe / La Roche-Posay', timing: '60 sec' },
    { step: 2, name: 'Toner (Optional)', desc: 'Balances pH and preps skin. Skip if your cleanser is pH-balanced.', ingredient: 'Niacinamide toner', timing: '30 sec' },
    { step: 3, name: 'Vitamin C Serum', desc: 'Antioxidant protection, brightens skin, fights free radical damage.', ingredient: '15-20% L-Ascorbic Acid', timing: '60 sec' },
    { step: 4, name: 'Moisturizer', desc: 'Hydrate and lock in serums. Choose based on skin type.', ingredient: 'Hyaluronic acid + ceramides', timing: '30 sec' },
    { step: 5, name: 'Sunscreen (CRITICAL)', desc: 'The #1 most important skincare step. Prevents aging, dark spots, and skin damage.', ingredient: 'SPF 50+ PA++++ broad spectrum', timing: '30 sec' },
  ],
  evening: [
    { step: 1, name: 'Oil Cleanser', desc: 'Dissolves sunscreen, makeup, and sebum. Essential first cleanse.', ingredient: 'DHC / Banila Co', timing: '60 sec' },
    { step: 2, name: 'Water Cleanser', desc: 'Second cleanse to remove remaining impurities.', ingredient: 'Low pH gel cleanser', timing: '60 sec' },
    { step: 3, name: 'Exfoliant (2-3x/week)', desc: 'Chemical exfoliation for cell turnover. Do NOT use physical scrubs daily.', ingredient: 'BHA 2% / AHA 8%', timing: '10-20 min' },
    { step: 4, name: 'Retinol / Tretinoin', desc: 'Gold standard anti-aging. Start low, build tolerance. Use on non-exfoliant nights.', ingredient: '0.025% tretinoin starter', timing: '60 sec' },
    { step: 5, name: 'Moisturizer', desc: 'Richer than morning formula. Aids skin barrier repair overnight.', ingredient: 'Ceramide-rich cream', timing: '30 sec' },
  ],
};

const INGREDIENTS_GUIDE = [
  { name: 'Retinol/Tretinoin', purpose: 'Anti-aging, acne, texture', rating: 'S-Tier', color: '#ff6b35', desc: 'Increases cell turnover, boosts collagen. Start 0.025% and work up. Use PM only. Causes purging for 4-6 weeks.' },
  { name: 'Vitamin C', purpose: 'Brightening, antioxidant', rating: 'S-Tier', color: '#ffab40', desc: 'L-Ascorbic Acid at 15-20%. Use AM under sunscreen. Unstable — store in dark, cool place.' },
  { name: 'Niacinamide', purpose: 'Pores, oil control, barrier', rating: 'A-Tier', color: '#00e676', desc: '5% concentration is optimal. Reduces pore appearance, controls oil, strengthens skin barrier.' },
  { name: 'Hyaluronic Acid', purpose: 'Hydration', rating: 'A-Tier', color: '#00e5ff', desc: 'Humectant that draws moisture. Apply to damp skin. Multi-molecular weight formulas work best.' },
  { name: 'BHA (Salicylic Acid)', purpose: 'Acne, blackheads', rating: 'A-Tier', color: '#a89afa', desc: 'Oil-soluble, penetrates pores. 2% for acne-prone skin. Use 2-3x/week max.' },
  { name: 'AHA (Glycolic/Lactic)', purpose: 'Exfoliation, glow', rating: 'B-Tier', color: '#ff6090', desc: 'Water-soluble surface exfoliant. Glycolic for normal skin, lactic for sensitive. Increases sun sensitivity.' },
  { name: 'Ceramides', purpose: 'Barrier repair', rating: 'A-Tier', color: '#1de9b6', desc: 'Lipids that form the skin barrier. Essential in moisturizers. Great for all skin types.' },
  { name: 'Peptides', purpose: 'Anti-aging, firmness', rating: 'B-Tier', color: '#7c6cf0', desc: 'Signal peptides boost collagen production. Copper peptides aid healing. Good complement to retinol.' },
];

const SKIN_TYPES = [
  { type: 'Oily', icon: 'water', color: '#00e5ff', tips: ['Use gel/water-based moisturizer', 'BHA cleanser', 'Niacinamide 10% serum', 'Clay mask 1x/week', 'Don\'t skip moisturizer'] },
  { type: 'Dry', icon: 'sunny', color: '#ffab40', tips: ['Cream-based cleanser', 'Hyaluronic acid serum', 'Rich ceramide moisturizer', 'Avoid foaming cleansers', 'Facial oil at night'] },
  { type: 'Combo', icon: 'contrast', color: '#00e676', tips: ['Gel cleanser', 'Niacinamide for T-zone', 'Light moisturizer', 'Multi-mask different zones', 'BHA on oily areas only'] },
  { type: 'Sensitive', icon: 'shield-checkmark', color: '#ff6090', tips: ['Fragrance-free everything', 'Centella/cica products', 'Patch test new products', 'Minimal routine', 'Avoid actives initially'] },
];

const SkinCareGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeRoutine, setActiveRoutine] = useState('morning');
  const [expandedIngredient, setExpandedIngredient] = useState(-1);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skincare Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,230,118,0.15)', 'rgba(0,230,118,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,230,118,0.2)' }]}>
              <Ionicons name="sparkles-outline" size={32} color="#00e676" />
            </View>
            <Text style={styles.heroTitle}>Skincare Mastery</Text>
            <Text style={styles.heroSubtitle}>Build a science-backed routine for clear, glowing skin that enhances your facial aesthetics</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#00e676" /><Text style={styles.metaText}>15 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="flask-outline" size={12} color="#00e676" /><Text style={styles.metaText}>8 Ingredients</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Daily Routine */}
        <Text style={styles.sectionTitle}>Daily Routine</Text>
        <View style={styles.routineToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeRoutine === 'morning' && styles.toggleBtnActive]}
            onPress={() => setActiveRoutine('morning')}
          >
            <Ionicons name="sunny-outline" size={16} color={activeRoutine === 'morning' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.toggleText, activeRoutine === 'morning' && styles.toggleTextActive]}>Morning</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeRoutine === 'evening' && styles.toggleBtnActive]}
            onPress={() => setActiveRoutine('evening')}
          >
            <Ionicons name="moon-outline" size={16} color={activeRoutine === 'evening' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.toggleText, activeRoutine === 'evening' && styles.toggleTextActive]}>Evening</Text>
          </TouchableOpacity>
        </View>

        {ROUTINES[activeRoutine].map((step) => (
          <View key={step.step} style={styles.routineCard}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.stepNum}>
              <Text style={styles.stepNumText}>{step.step}</Text>
            </LinearGradient>
            <View style={styles.routineContent}>
              <View style={styles.routineTopRow}>
                <Text style={styles.routineName}>{step.name}</Text>
                <View style={styles.timingPill}>
                  <Text style={styles.timingText}>{step.timing}</Text>
                </View>
              </View>
              <Text style={styles.routineDesc}>{step.desc}</Text>
              <View style={styles.ingredientRow}>
                <Ionicons name="flask" size={12} color={COLORS.accent} />
                <Text style={styles.ingredientText}>{step.ingredient}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Ingredients Guide */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Ingredients Encyclopedia</Text>
        {INGREDIENTS_GUIDE.map((ing, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.ingredientCard}
            onPress={() => setExpandedIngredient(expandedIngredient === idx ? -1 : idx)}
            activeOpacity={0.7}
          >
            <View style={styles.ingHeader}>
              <View style={[styles.ingDot, { backgroundColor: ing.color }]} />
              <View style={styles.ingInfo}>
                <Text style={styles.ingName}>{ing.name}</Text>
                <Text style={styles.ingPurpose}>{ing.purpose}</Text>
              </View>
              <View style={[styles.ratingBadge, { backgroundColor: ing.color + '20' }]}>
                <Text style={[styles.ratingText, { color: ing.color }]}>{ing.rating}</Text>
              </View>
            </View>
            {expandedIngredient === idx && (
              <Text style={styles.ingDesc}>{ing.desc}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Skin Type Guide */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>By Skin Type</Text>
        {SKIN_TYPES.map((st, idx) => (
          <View key={idx} style={styles.skinTypeCard}>
            <View style={styles.skinTypeHeader}>
              <View style={[styles.skinTypeIcon, { backgroundColor: st.color + '18' }]}>
                <Ionicons name={st.icon} size={20} color={st.color} />
              </View>
              <Text style={styles.skinTypeName}>{st.type} Skin</Text>
            </View>
            {st.tips.map((tip, ti) => (
              <View key={ti} style={styles.skinTipRow}>
                <Ionicons name="checkmark" size={14} color={st.color} />
                <Text style={styles.skinTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Pro Tips */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Pro Tips</Text>
        {[
          { tip: 'Introduce one new product at a time. Wait 2 weeks before adding another.', icon: 'warning-outline' },
          { tip: 'Sunscreen is non-negotiable. Reapply every 2 hours when outdoors.', icon: 'sunny-outline' },
          { tip: 'Don\'t touch your face. Your hands carry bacteria and oils.', icon: 'hand-left-outline' },
          { tip: 'Change pillowcases 2x/week. Silk pillowcases reduce friction.', icon: 'bed-outline' },
          { tip: 'Hydrate from inside: 2-3L water daily. Skin is 64% water.', icon: 'water-outline' },
        ].map((t, i) => (
          <View key={i} style={styles.proTipCard}>
            <View style={styles.proTipIcon}>
              <Ionicons name={t.icon} size={16} color={COLORS.accent} />
            </View>
            <Text style={styles.proTipText}>{t.tip}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, alignItems: 'center' },
  heroIconBg: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  routineToggle: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  toggleTextActive: { color: '#fff' },
  routineCard: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  routineContent: { flex: 1 },
  routineTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  routineName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  timingPill: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  timingText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
  routineDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 6 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ingredientText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  ingredientCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  ingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ingDot: { width: 10, height: 10, borderRadius: 5 },
  ingInfo: { flex: 1 },
  ingName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  ingPurpose: { fontSize: 11, color: COLORS.textMuted },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ingDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  skinTypeCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  skinTypeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  skinTypeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  skinTypeName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  skinTipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  skinTipText: { fontSize: 13, color: COLORS.textSecondary },
  proTipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  proTipIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  proTipText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});

export default SkinCareGuideScreen;
