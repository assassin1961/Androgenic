import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const FACE_NUTRIENTS = [
  { nutrient: 'Collagen', icon: 'diamond', color: '#ff6090', benefit: 'Skin elasticity & jawline definition', sources: 'Bone broth, salmon, berries, citrus', dailyGoal: '10g' },
  { nutrient: 'Vitamin C', icon: 'flash', color: '#ffab40', benefit: 'Collagen synthesis & skin brightening', sources: 'Oranges, bell peppers, kiwi, broccoli', dailyGoal: '90mg' },
  { nutrient: 'Zinc', icon: 'shield', color: '#00b4d8', benefit: 'Acne prevention & wound healing', sources: 'Oysters, beef, pumpkin seeds, chickpeas', dailyGoal: '11mg' },
  { nutrient: 'Omega-3', icon: 'water', color: '#0066ff', benefit: 'Reduces inflammation & skin hydration', sources: 'Salmon, walnuts, flaxseed, sardines', dailyGoal: '1.6g' },
  { nutrient: 'Vitamin A', icon: 'eye', color: '#00e676', benefit: 'Cell turnover & anti-aging', sources: 'Sweet potato, carrots, spinach, liver', dailyGoal: '900mcg' },
  { nutrient: 'Biotin', icon: 'leaf', color: '#1de9b6', benefit: 'Hair growth & nail strength', sources: 'Eggs, almonds, sweet potato, avocado', dailyGoal: '30mcg' },
];

const MEAL_PLANS = {
  glowUp: {
    name: 'Glow-Up Plan',
    icon: 'sparkles',
    color: '#00e5ff',
    desc: 'Maximize skin clarity and facial glow',
    meals: [
      { time: '7:00 AM', name: 'Morning Glow Bowl', items: ['Greek yogurt + berries + honey', 'Collagen peptides (10g)', 'Green tea'], calories: 380, faceScore: 92 },
      { time: '10:00 AM', name: 'Skin Snack', items: ['Mixed nuts (almonds + walnuts)', 'Orange'], calories: 220, faceScore: 85 },
      { time: '12:30 PM', name: 'Collagen Builder Lunch', items: ['Grilled salmon (200g)', 'Sweet potato mash', 'Spinach salad + olive oil'], calories: 580, faceScore: 95 },
      { time: '3:30 PM', name: 'Hydration Boost', items: ['Cucumber + bell pepper sticks', 'Hummus (3 tbsp)'], calories: 160, faceScore: 80 },
      { time: '7:00 PM', name: 'Anti-Aging Dinner', items: ['Bone broth soup', 'Grilled chicken breast', 'Steamed broccoli + carrots'], calories: 520, faceScore: 93 },
    ],
    totalCalories: 1860,
    avgFaceScore: 89,
  },
  jawline: {
    name: 'Jawline Carve Plan',
    icon: 'shield-half',
    color: '#ff6b35',
    desc: 'Low sodium, anti-bloat for sharper jaw',
    meals: [
      { time: '7:00 AM', name: 'Lean Start', items: ['Egg whites (4) + spinach omelette', 'Whole grain toast', 'Black coffee'], calories: 320, faceScore: 88 },
      { time: '10:00 AM', name: 'Crunch Snack', items: ['Apple slices + almond butter', 'Mastic gum (20 min)'], calories: 200, faceScore: 90 },
      { time: '12:30 PM', name: 'Definition Lunch', items: ['Grilled chicken breast (200g)', 'Brown rice (100g)', 'Mixed greens + lemon dressing'], calories: 520, faceScore: 87 },
      { time: '3:30 PM', name: 'Protein Boost', items: ['Whey protein shake', 'Banana'], calories: 250, faceScore: 82 },
      { time: '7:00 PM', name: 'Lean Dinner', items: ['Grilled white fish (200g)', 'Steamed asparagus', 'Quinoa (80g)'], calories: 440, faceScore: 91 },
    ],
    totalCalories: 1730,
    avgFaceScore: 88,
  },
  antiAging: {
    name: 'Anti-Aging Protocol',
    icon: 'hourglass',
    color: '#a855f7',
    desc: 'Antioxidant-rich for youthful appearance',
    meals: [
      { time: '7:00 AM', name: 'Antioxidant Breakfast', items: ['Acai bowl + mixed berries', 'Chia seeds (2 tbsp)', 'Matcha latte'], calories: 420, faceScore: 94 },
      { time: '10:00 AM', name: 'Youth Snack', items: ['Dark chocolate (85%)', 'Brazil nuts (3)'], calories: 180, faceScore: 86 },
      { time: '12:30 PM', name: 'Cell Renewal Lunch', items: ['Sardines on sourdough', 'Avocado + tomato salad', 'Lemon water'], calories: 500, faceScore: 92 },
      { time: '3:30 PM', name: 'Collagen Shake', items: ['Bone broth protein shake', 'Frozen berries'], calories: 220, faceScore: 90 },
      { time: '7:00 PM', name: 'Regeneration Dinner', items: ['Wild salmon (200g)', 'Roasted sweet potato', 'Kale + olive oil'], calories: 560, faceScore: 96 },
    ],
    totalCalories: 1880,
    avgFaceScore: 92,
  },
};

const MealCard = memo(({ meal, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(index * 60)}>
    <GlassCard variant="default" style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTime}>{meal.time}</Text>
        <View style={[styles.faceScoreBadge, { backgroundColor: (meal.faceScore >= 90 ? '#00e676' : '#ffab40') + '20' }]}>
          <Ionicons name="person" size={10} color={meal.faceScore >= 90 ? '#00e676' : '#ffab40'} />
          <Text style={[styles.faceScoreText, { color: meal.faceScore >= 90 ? '#00e676' : '#ffab40' }]}>{meal.faceScore}</Text>
        </View>
      </View>
      <Text style={styles.mealName}>{meal.name}</Text>
      {meal.items.map((item, i) => (
        <View key={i} style={styles.mealItemRow}>
          <View style={styles.mealDot} />
          <Text style={styles.mealItemText}>{item}</Text>
        </View>
      ))}
      <Text style={styles.mealCalories}>{meal.calories} cal</Text>
    </GlassCard>
  </Animated.View>
));

const MealPlanScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('glowUp');
  const plan = MEAL_PLANS[selectedPlan];
  const pro = isPro();

  const selectPlan = useCallback((key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlan(key);
  }, []);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Meal Plans</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <GlassCard variant="accent" style={styles.heroCard}>
              <Ionicons name="nutrition" size={28} color={COLORS.accent} />
              <Text style={styles.heroTitle}>Face-Optimized Nutrition</Text>
              <Text style={styles.heroSub}>Meal plans designed to maximize your facial aesthetics score</Text>
            </GlassCard>
          </Animated.View>

          {/* Plan Selector */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planSelector}>
              {Object.entries(MEAL_PLANS).map(([key, p], i) => (
                <AnimatedPressable key={key} onPress={() => selectPlan(key)}>
                  <GlassCard
                    variant={selectedPlan === key ? 'accent' : 'default'}
                    glow={selectedPlan === key}
                    style={styles.planChip}
                  >
                    <Ionicons name={p.icon} size={18} color={selectedPlan === key ? p.color : COLORS.textMuted} />
                    <Text style={[styles.planChipText, selectedPlan === key && { color: p.color }]}>{p.name}</Text>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Plan Summary */}
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <GlassCard variant="default" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{plan.totalCalories}</Text>
                  <Text style={styles.summaryLabel}>Calories</Text>
                </View>
                <View style={[styles.summaryDivider]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: COLORS.scoreHigh }]}>{plan.avgFaceScore}</Text>
                  <Text style={styles.summaryLabel}>Face Score</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{plan.meals.length}</Text>
                  <Text style={styles.summaryLabel}>Meals</Text>
                </View>
              </View>
              <Text style={styles.summaryDesc}>{plan.desc}</Text>
            </GlassCard>
          </Animated.View>

          {/* Meals */}
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {plan.meals.map((meal, i) => (
            <MealCard key={meal.time} meal={meal} index={i} />
          ))}

          {/* Key Nutrients */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.sectionTitle}>Key Face Nutrients</Text>
            {FACE_NUTRIENTS.map((n, i) => (
              <Animated.View key={n.nutrient} entering={FadeInDown.duration(300).delay(450 + i * 50)}>
                <GlassCard variant="default" style={styles.nutrientCard}>
                  <View style={styles.nutrientHeader}>
                    <View style={[styles.nutrientIcon, { backgroundColor: n.color + '15' }]}>
                      <Ionicons name={n.icon} size={14} color={n.color} />
                    </View>
                    <View style={styles.nutrientInfo}>
                      <Text style={styles.nutrientName}>{n.nutrient}</Text>
                      <Text style={styles.nutrientBenefit}>{n.benefit}</Text>
                    </View>
                    <View style={[styles.goalBadge, { backgroundColor: n.color + '15' }]}>
                      <Text style={[styles.goalText, { color: n.color }]}>{n.dailyGoal}</Text>
                    </View>
                  </View>
                  <Text style={styles.nutrientSources}>{n.sources}</Text>
                </GlassCard>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Pro Upsell */}
          {!pro && (
            <Animated.View entering={FadeInDown.duration(400).delay(600)}>
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.proBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="diamond" size={16} color="#000" />
                  <Text style={styles.proBannerText}>PRO: Custom AI meal plans based on your face analysis</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </LinearGradient>
              </AnimatedPressable>
            </Animated.View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  heroCard: { padding: 20, alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 10, marginBottom: 4 },
  heroSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },

  planSelector: { marginBottom: 16 },
  planChip: { padding: 12, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 140 },
  planChipText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },

  summaryCard: { padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  summaryLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  summaryDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  summaryDesc: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },

  mealCard: { padding: 14, marginBottom: 8 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  mealTime: { fontSize: 11, fontWeight: '700', color: COLORS.accent },
  faceScoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  faceScoreText: { fontSize: 10, fontWeight: '800' },
  mealName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  mealItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  mealDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted },
  mealItemText: { fontSize: 12, color: COLORS.textSecondary },
  mealCalories: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 6, textAlign: 'right' },

  nutrientCard: { padding: 12, marginBottom: 6 },
  nutrientHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  nutrientIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  nutrientInfo: { flex: 1 },
  nutrientName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  nutrientBenefit: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  goalText: { fontSize: 11, fontWeight: '700' },
  nutrientSources: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },

  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 12 },
  proBannerText: { flex: 1, color: '#000', fontSize: 12, fontWeight: '700' },
});

export default MealPlanScreen;
