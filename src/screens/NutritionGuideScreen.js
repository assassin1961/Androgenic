import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const MACRO_TARGETS = [
  { name: 'Protein', target: '1g per lb bodyweight', icon: 'barbell-outline', color: '#ff6b35', foods: ['Chicken breast', 'Eggs', 'Greek yogurt', 'Salmon', 'Whey protein'], why: 'Builds collagen, maintains skin elasticity, supports muscle growth for facial definition.' },
  { name: 'Healthy Fats', target: '25-35% of calories', icon: 'water-outline', color: '#ffab40', foods: ['Avocado', 'Olive oil', 'Salmon', 'Nuts', 'Seeds'], why: 'Essential for skin moisture, hormonal balance, and reducing inflammation.' },
  { name: 'Complex Carbs', target: 'Moderate, low GI', icon: 'nutrition-outline', color: '#00e676', foods: ['Sweet potato', 'Brown rice', 'Oats', 'Quinoa', 'Berries'], why: 'Sustained energy. High GI carbs spike insulin causing inflammation and breakouts.' },
  { name: 'Water', target: '3-4L daily', icon: 'water', color: '#00e5ff', foods: ['Water', 'Green tea', 'Coconut water', 'Cucumber', 'Watermelon'], why: 'Skin is 64% water. Dehydration causes sunken eyes, dark circles, and dull skin.' },
];

const SKIN_SUPERFOODS = [
  { name: 'Wild Salmon', nutrient: 'Omega-3, Astaxanthin', effect: 'Anti-inflammatory, UV protection, collagen support', color: '#ff6090' },
  { name: 'Bone Broth', nutrient: 'Collagen, Glycine', effect: 'Direct collagen supplementation, gut health, skin repair', color: '#ffab40' },
  { name: 'Blueberries', nutrient: 'Anthocyanins, Vitamin C', effect: 'Antioxidant, collagen synthesis, free radical protection', color: '#7c6cf0' },
  { name: 'Sweet Potato', nutrient: 'Beta-carotene, Vitamin A', effect: 'Skin cell turnover, natural glow, sun protection', color: '#ff6b35' },
  { name: 'Avocado', nutrient: 'Vitamin E, Healthy Fats', effect: 'Skin hydration, elasticity, anti-aging', color: '#00e676' },
  { name: 'Spinach', nutrient: 'Iron, Folate, Vitamin K', effect: 'Blood circulation to skin, dark circle reduction', color: '#1de9b6' },
  { name: 'Walnuts', nutrient: 'Omega-3, Zinc, Selenium', effect: 'Skin barrier, wound healing, anti-inflammatory', color: '#a89afa' },
  { name: 'Green Tea', nutrient: 'EGCG, Catechins', effect: 'Reduces sebum, anti-aging, UV damage protection', color: '#00e5ff' },
];

const FOODS_TO_AVOID = [
  { food: 'Sugar & Processed Foods', reason: 'Glycation damages collagen. Insulin spikes trigger acne and inflammation.', severity: 'High' },
  { food: 'Dairy (for acne-prone)', reason: 'Contains IGF-1 and hormones that stimulate oil production and breakouts.', severity: 'High' },
  { food: 'Alcohol', reason: 'Dehydrates skin, dilates blood vessels, impairs nutrient absorption, causes bloating.', severity: 'High' },
  { food: 'Refined Carbs', reason: 'White bread, pasta — high glycemic index spikes insulin, promotes inflammation.', severity: 'Medium' },
  { food: 'Excess Sodium', reason: 'Causes water retention and facial bloating. Aim under 2300mg/day.', severity: 'Medium' },
  { food: 'Seed Oils', reason: 'High omega-6 ratio promotes systemic inflammation. Use olive/coconut oil instead.', severity: 'Medium' },
];

const SUPPLEMENTS = [
  { name: 'Collagen Peptides', dose: '10-15g/day', timing: 'Morning', effect: 'Directly supports skin collagen production. Type I/III best for skin.', tier: 'S' },
  { name: 'Vitamin D3+K2', dose: '4000IU D3 + 100mcg K2', timing: 'With fat meal', effect: 'Immune function, skin health, testosterone support. Most people deficient.', tier: 'S' },
  { name: 'Omega-3 (Fish Oil)', dose: '2-3g EPA+DHA', timing: 'With meals', effect: 'Anti-inflammatory, skin moisture, reduces acne and redness.', tier: 'A' },
  { name: 'Zinc', dose: '15-30mg', timing: 'Evening', effect: 'Wound healing, acne reduction, immune function, testosterone.', tier: 'A' },
  { name: 'Magnesium Glycinate', dose: '400mg', timing: 'Before bed', effect: 'Sleep quality, stress reduction, muscle recovery, skin repair.', tier: 'A' },
  { name: 'Vitamin C', dose: '500-1000mg', timing: 'Morning', effect: 'Collagen synthesis, antioxidant, brightening from inside.', tier: 'B' },
  { name: 'Biotin', dose: '5000mcg', timing: 'Morning', effect: 'Hair and nail growth support. Takes 3+ months.', tier: 'B' },
  { name: 'Astaxanthin', dose: '4-12mg', timing: 'With fat meal', effect: 'Powerful antioxidant. Natural UV protection. Anti-wrinkle.', tier: 'B' },
];

const MEAL_PLAN = [
  { meal: 'Breakfast', time: '7:00 AM', items: '4 eggs scrambled + avocado toast on whole grain + blueberries + green tea', macros: 'P: 30g | F: 25g | C: 35g' },
  { meal: 'Snack', time: '10:00 AM', items: 'Greek yogurt + walnuts + collagen peptides mixed in', macros: 'P: 25g | F: 12g | C: 10g' },
  { meal: 'Lunch', time: '1:00 PM', items: 'Grilled salmon + sweet potato + spinach salad with olive oil', macros: 'P: 40g | F: 20g | C: 45g' },
  { meal: 'Snack', time: '4:00 PM', items: 'Protein shake + banana + almond butter', macros: 'P: 30g | F: 10g | C: 35g' },
  { meal: 'Dinner', time: '7:00 PM', items: 'Chicken breast + brown rice + broccoli + bone broth soup', macros: 'P: 45g | F: 10g | C: 40g' },
];

const NutritionGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedMacro, setExpandedMacro] = useState(-1);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(255,171,64,0.15)', 'rgba(255,171,64,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(255,171,64,0.2)' }]}>
              <Ionicons name="nutrition-outline" size={32} color="#ffab40" />
            </View>
            <Text style={styles.heroTitle}>Face Nutrition</Text>
            <Text style={styles.heroSubtitle}>What you eat directly impacts your skin, bone health, and facial aesthetics. Optimize your diet for maximum results.</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#ffab40" /><Text style={styles.metaText}>10 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color="#ffab40" /><Text style={styles.metaText}>Beginner</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Macros */}
        <Text style={styles.sectionTitle}>Macro Foundations</Text>
        {MACRO_TARGETS.map((macro, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.macroCard, expandedMacro === idx && styles.macroCardActive]}
              onPress={() => setExpandedMacro(expandedMacro === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.macroIcon, { backgroundColor: macro.color + '18' }]}>
                <Ionicons name={macro.icon} size={20} color={macro.color} />
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroName}>{macro.name}</Text>
                <Text style={styles.macroTarget}>{macro.target}</Text>
              </View>
              <Ionicons name={expandedMacro === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedMacro === idx && (
              <View style={styles.macroExpanded}>
                <Text style={styles.macroWhy}>{macro.why}</Text>
                <Text style={styles.subLabel}>Top Sources:</Text>
                <View style={styles.foodTags}>
                  {macro.foods.map((f, fi) => (
                    <View key={fi} style={[styles.foodTag, { borderColor: macro.color + '40' }]}>
                      <Text style={[styles.foodTagText, { color: macro.color }]}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Superfoods */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Skin Superfoods</Text>
        {SKIN_SUPERFOODS.map((sf, idx) => (
          <View key={idx} style={styles.superfoodCard}>
            <View style={[styles.sfDot, { backgroundColor: sf.color }]} />
            <View style={styles.sfContent}>
              <View style={styles.sfHeader}>
                <Text style={styles.sfName}>{sf.name}</Text>
                <Text style={styles.sfNutrient}>{sf.nutrient}</Text>
              </View>
              <Text style={styles.sfEffect}>{sf.effect}</Text>
            </View>
          </View>
        ))}

        {/* Foods to Avoid */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Foods to Limit / Avoid</Text>
        {FOODS_TO_AVOID.map((f, idx) => (
          <View key={idx} style={styles.avoidCard}>
            <View style={styles.avoidHeader}>
              <Ionicons name="close-circle" size={16} color="#ff5252" />
              <Text style={styles.avoidName}>{f.food}</Text>
              <View style={[styles.severityBadge, { backgroundColor: f.severity === 'High' ? '#ff525220' : '#ffab4020' }]}>
                <Text style={[styles.severityText, { color: f.severity === 'High' ? '#ff5252' : '#ffab40' }]}>{f.severity}</Text>
              </View>
            </View>
            <Text style={styles.avoidReason}>{f.reason}</Text>
          </View>
        ))}

        {/* Supplements */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Supplement Stack</Text>
        {SUPPLEMENTS.map((s, idx) => (
          <View key={idx} style={styles.suppCard}>
            <View style={styles.suppHeader}>
              <Text style={styles.suppName}>{s.name}</Text>
              <View style={[styles.tierBadge, {
                backgroundColor: s.tier === 'S' ? '#00e67620' : s.tier === 'A' ? '#7c6cf020' : '#ffab4020'
              }]}>
                <Text style={[styles.tierText, {
                  color: s.tier === 'S' ? '#00e676' : s.tier === 'A' ? '#7c6cf0' : '#ffab40'
                }]}>{s.tier}-Tier</Text>
              </View>
            </View>
            <View style={styles.suppDetails}>
              <View style={styles.suppDetail}>
                <Text style={styles.suppLabel}>Dose</Text>
                <Text style={styles.suppValue}>{s.dose}</Text>
              </View>
              <View style={styles.suppDetail}>
                <Text style={styles.suppLabel}>Timing</Text>
                <Text style={styles.suppValue}>{s.timing}</Text>
              </View>
            </View>
            <Text style={styles.suppEffect}>{s.effect}</Text>
          </View>
        ))}

        {/* Sample Meal Plan */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sample Day Meal Plan</Text>
        {MEAL_PLAN.map((m, idx) => (
          <View key={idx} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTimeBadge}>
                <Text style={styles.mealTime}>{m.time}</Text>
              </View>
              <Text style={styles.mealName}>{m.meal}</Text>
            </View>
            <Text style={styles.mealItems}>{m.items}</Text>
            <Text style={styles.mealMacros}>{m.macros}</Text>
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
  macroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  macroCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  macroIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  macroInfo: { flex: 1 },
  macroName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  macroTarget: { fontSize: 12, color: COLORS.textMuted },
  macroExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  macroWhy: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 10 },
  subLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  foodTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  foodTag: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  foodTagText: { fontSize: 12, fontWeight: '600' },
  superfoodCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  sfDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  sfContent: { flex: 1 },
  sfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  sfName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  sfNutrient: { fontSize: 10, color: COLORS.textMuted },
  sfEffect: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  avoidCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  avoidHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  avoidName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: '700' },
  avoidReason: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  suppCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  suppHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  suppName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tierText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  suppDetails: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  suppDetail: { flexDirection: 'row', gap: 4 },
  suppLabel: { fontSize: 11, color: COLORS.textMuted },
  suppValue: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  suppEffect: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  mealCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  mealTimeBadge: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mealTime: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },
  mealName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  mealItems: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 6 },
  mealMacros: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
});

export default NutritionGuideScreen;
