import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, Share,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, RADIUS, SPACING } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');
const STORAGE_KEY = 'androgenic_supplement_stack';

// ─── Goals ───────────────────────────────────────────────────────────
const GOALS = [
  { id: 'jawline',      label: 'Jawline Definition',    icon: 'square-outline' },
  { id: 'skin',         label: 'Clear Skin',            icon: 'water-outline' },
  { id: 'hair',         label: 'Hair Growth',           icon: 'leaf-outline' },
  { id: 'antiaging',    label: 'Anti-Aging',            icon: 'hourglass-outline' },
  { id: 'muscle',       label: 'Muscle / Lean',         icon: 'barbell-outline' },
  { id: 'energy',       label: 'Energy',                icon: 'flash-outline' },
  { id: 'sleep',        label: 'Sleep Quality',         icon: 'moon-outline' },
  { id: 'testosterone', label: 'Testosterone Support',  icon: 'trending-up-outline' },
  { id: 'collagen',     label: 'Collagen Production',   icon: 'diamond-outline' },
  { id: 'inflammation', label: 'Reduce Inflammation',   icon: 'shield-checkmark-outline' },
];

// ─── Full Supplement Database (30+) ──────────────────────────────────
const SUPPLEMENTS = [
  // SKIN
  {
    id: 'vitc',
    name: 'Vitamin C',
    dosage: '1000mg',
    timing: 'Morning',
    why: 'Boosts collagen synthesis, brightens skin tone, and provides powerful antioxidant protection against free radical damage.',
    rating: 5,
    evidence: 'Strong',
    goals: ['skin', 'collagen', 'antiaging', 'jawline'],
    icon: 'sunny-outline',
    cost: 12,
  },
  {
    id: 'zinc',
    name: 'Zinc',
    dosage: '30mg',
    timing: 'Evening',
    why: 'Essential mineral that reduces acne breakouts, supports skin healing, and is critical for testosterone synthesis.',
    rating: 5,
    evidence: 'Strong',
    goals: ['skin', 'testosterone', 'inflammation'],
    icon: 'shield-outline',
    cost: 8,
  },
  {
    id: 'omega3',
    name: 'Omega-3 Fish Oil',
    dosage: '2000mg',
    timing: 'With Food',
    why: 'Reduces systemic inflammation, hydrates skin from within, and supports cardiovascular and brain health.',
    rating: 5,
    evidence: 'Strong',
    goals: ['skin', 'inflammation', 'antiaging', 'energy'],
    icon: 'water-outline',
    cost: 15,
  },
  {
    id: 'vite',
    name: 'Vitamin E',
    dosage: '400 IU',
    timing: 'Morning',
    why: 'Fat-soluble antioxidant that protects skin from UV damage and supports cell membrane integrity.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['skin', 'antiaging'],
    icon: 'leaf-outline',
    cost: 10,
  },
  {
    id: 'probiotics',
    name: 'Probiotics',
    dosage: '10B CFU',
    timing: 'Morning',
    why: 'Supports the gut-skin axis, reducing systemic inflammation that manifests as acne and skin dullness.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['skin', 'inflammation'],
    icon: 'nutrition-outline',
    cost: 20,
  },

  // HAIR
  {
    id: 'biotin',
    name: 'Biotin',
    dosage: '5000mcg',
    timing: 'Morning',
    why: 'B-vitamin that strengthens hair keratin infrastructure and significantly reduces shedding over time.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['hair', 'skin'],
    icon: 'leaf-outline',
    cost: 10,
  },
  {
    id: 'sawpalmetto',
    name: 'Saw Palmetto',
    dosage: '320mg',
    timing: 'Morning',
    why: 'Natural 5-alpha reductase inhibitor that blocks DHT at the follicle level, reducing androgenic hair loss.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['hair'],
    icon: 'flower-outline',
    cost: 14,
  },
  {
    id: 'iron',
    name: 'Iron',
    dosage: '18mg',
    timing: 'With Food',
    why: 'Prevents hair loss caused by iron deficiency and supports oxygen transport for energy and recovery.',
    rating: 5,
    evidence: 'Strong',
    goals: ['hair', 'energy'],
    icon: 'fitness-outline',
    cost: 8,
  },
  {
    id: 'vitd3',
    name: 'Vitamin D3',
    dosage: '4000 IU',
    timing: 'Morning',
    why: 'Stimulates hair follicle cycling and new growth. Most people are deficient, impacting testosterone and mood.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['hair', 'testosterone', 'energy', 'muscle'],
    icon: 'sunny-outline',
    cost: 10,
  },
  {
    id: 'pumpkinseed',
    name: 'Pumpkin Seed Oil',
    dosage: '1000mg',
    timing: 'Morning',
    why: 'Natural DHT blocker with phytosterols that support hair density without hormonal side effects.',
    rating: 3,
    evidence: 'Emerging',
    goals: ['hair'],
    icon: 'ellipse-outline',
    cost: 12,
  },

  // JAWLINE / COLLAGEN
  {
    id: 'collagenpep',
    name: 'Collagen Peptides',
    dosage: '10g',
    timing: 'Morning',
    why: 'Directly supplies hydrolyzed collagen that supports skin elasticity, jawline tissue, and joint health.',
    rating: 5,
    evidence: 'Strong',
    goals: ['jawline', 'collagen', 'skin', 'antiaging'],
    icon: 'diamond-outline',
    cost: 25,
  },
  {
    id: 'hyaluronic',
    name: 'Hyaluronic Acid',
    dosage: '200mg',
    timing: 'Morning',
    why: 'Attracts and retains moisture in skin, improving hydration, plumpness, and reducing fine lines.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['jawline', 'collagen', 'skin', 'antiaging'],
    icon: 'water-outline',
    cost: 18,
  },
  {
    id: 'msm',
    name: 'MSM',
    dosage: '1000mg',
    timing: 'Morning',
    why: 'Organic sulfur compound that supports collagen and keratin production for skin, hair, and nails.',
    rating: 3,
    evidence: 'Emerging',
    goals: ['collagen', 'jawline', 'hair', 'inflammation'],
    icon: 'flask-outline',
    cost: 12,
  },
  {
    id: 'bonebroth',
    name: 'Bone Broth Protein',
    dosage: '15g',
    timing: 'Any Time',
    why: 'Natural source of collagen, amino acids, and minerals that support connective tissue and gut health.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['collagen', 'jawline', 'skin'],
    icon: 'cafe-outline',
    cost: 30,
  },

  // TESTOSTERONE
  {
    id: 'ashwagandha',
    name: 'Ashwagandha KSM-66',
    dosage: '600mg',
    timing: 'Evening',
    why: 'Adaptogen that reduces cortisol by 28% and boosts testosterone by 15-17% in clinical trials.',
    rating: 5,
    evidence: 'Strong',
    goals: ['testosterone', 'sleep', 'muscle', 'energy'],
    icon: 'leaf-outline',
    cost: 20,
  },
  {
    id: 'tongkatali',
    name: 'Tongkat Ali',
    dosage: '400mg',
    timing: 'Morning',
    why: 'Malaysian herb clinically shown to increase free testosterone and improve body composition.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['testosterone', 'muscle', 'energy'],
    icon: 'trending-up-outline',
    cost: 22,
  },
  {
    id: 'magnesium',
    name: 'Magnesium Glycinate',
    dosage: '400mg',
    timing: 'Before Bed',
    why: 'Supports testosterone production, promotes deep sleep, and relaxes the nervous system. Most men are deficient.',
    rating: 5,
    evidence: 'Strong',
    goals: ['testosterone', 'sleep', 'muscle', 'energy'],
    icon: 'moon-outline',
    cost: 14,
  },
  {
    id: 'boron',
    name: 'Boron',
    dosage: '6mg',
    timing: 'Morning',
    why: 'Trace mineral that increases free testosterone by reducing SHBG and supports bone mineral density.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['testosterone', 'muscle'],
    icon: 'pulse-outline',
    cost: 8,
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek',
    dosage: '600mg',
    timing: 'Morning',
    why: 'Supports free testosterone levels through aromatase inhibition and enhances exercise performance.',
    rating: 3,
    evidence: 'Moderate',
    goals: ['testosterone', 'muscle'],
    icon: 'leaf-outline',
    cost: 12,
  },

  // ANTI-AGING
  {
    id: 'nmn',
    name: 'NMN',
    dosage: '500mg',
    timing: 'Morning',
    why: 'NAD+ precursor that combats cellular aging, boosts mitochondrial function, and supports DNA repair.',
    rating: 4,
    evidence: 'Emerging',
    goals: ['antiaging', 'energy'],
    icon: 'hourglass-outline',
    cost: 45,
  },
  {
    id: 'resveratrol',
    name: 'Resveratrol',
    dosage: '500mg',
    timing: 'Morning',
    why: 'Activates sirtuin longevity pathways and provides potent antioxidant protection against skin aging.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['antiaging', 'skin'],
    icon: 'wine-outline',
    cost: 28,
  },
  {
    id: 'coq10',
    name: 'CoQ10',
    dosage: '200mg',
    timing: 'Morning',
    why: 'Mitochondrial coenzyme that combats skin aging, supports heart health, and boosts cellular energy.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['antiaging', 'energy', 'skin'],
    icon: 'battery-charging-outline',
    cost: 22,
  },
  {
    id: 'astaxanthin',
    name: 'Astaxanthin',
    dosage: '12mg',
    timing: 'Morning',
    why: '6000x more powerful than Vitamin C as an antioxidant. Protects skin from UV damage and reduces wrinkles.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['antiaging', 'skin', 'inflammation'],
    icon: 'color-filter-outline',
    cost: 20,
  },

  // SLEEP
  {
    id: 'ltheanine',
    name: 'L-Theanine',
    dosage: '200mg',
    timing: 'Before Bed',
    why: 'Amino acid from green tea that promotes alpha brain waves, reducing anxiety and improving sleep quality.',
    rating: 5,
    evidence: 'Strong',
    goals: ['sleep', 'energy'],
    icon: 'cafe-outline',
    cost: 12,
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    dosage: '0.5-1mg',
    timing: 'Before Bed',
    why: 'Low-dose melatonin supports sleep onset and circadian rhythm without next-day grogginess.',
    rating: 4,
    evidence: 'Strong',
    goals: ['sleep'],
    icon: 'moon-outline',
    cost: 8,
  },

  // ENERGY / MUSCLE
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    dosage: '5g',
    timing: 'Morning',
    why: 'The most researched supplement ever. Boosts ATP energy, cognitive function, and lean muscle mass.',
    rating: 5,
    evidence: 'Strong',
    goals: ['energy', 'muscle', 'testosterone'],
    icon: 'barbell-outline',
    cost: 12,
  },
  {
    id: 'bcomplex',
    name: 'B-Complex',
    dosage: '1 capsule',
    timing: 'Morning',
    why: 'Essential B-vitamins that drive energy metabolism, nervous system function, and red blood cell production.',
    rating: 5,
    evidence: 'Strong',
    goals: ['energy', 'hair', 'skin'],
    icon: 'flash-outline',
    cost: 10,
  },

  // INFLAMMATION
  {
    id: 'turmeric',
    name: 'Turmeric / Curcumin',
    dosage: '1000mg',
    timing: 'With Food',
    why: 'Potent anti-inflammatory that reduces joint pain, improves skin clarity, and supports recovery.',
    rating: 5,
    evidence: 'Strong',
    goals: ['inflammation', 'skin', 'antiaging'],
    icon: 'flame-outline',
    cost: 15,
  },
  {
    id: 'quercetin',
    name: 'Quercetin',
    dosage: '500mg',
    timing: 'Morning',
    why: 'Flavonoid with anti-inflammatory and antihistamine properties. Supports immune function and skin health.',
    rating: 3,
    evidence: 'Moderate',
    goals: ['inflammation', 'skin', 'antiaging'],
    icon: 'rose-outline',
    cost: 16,
  },
  {
    id: 'nac',
    name: 'NAC (N-Acetyl Cysteine)',
    dosage: '600mg',
    timing: 'Morning',
    why: 'Precursor to glutathione, the master antioxidant. Supports liver detox, skin clarity, and lung health.',
    rating: 4,
    evidence: 'Moderate',
    goals: ['inflammation', 'skin', 'antiaging'],
    icon: 'medkit-outline',
    cost: 14,
  },

  // MUSCLE extras
  {
    id: 'wheyprotein',
    name: 'Whey Protein Isolate',
    dosage: '25-30g',
    timing: 'With Food',
    why: 'High bioavailability protein source for muscle recovery and growth. Supports collagen synthesis indirectly.',
    rating: 5,
    evidence: 'Strong',
    goals: ['muscle', 'collagen'],
    icon: 'fitness-outline',
    cost: 30,
  },
];

// Approximate cost lookup by evidence tier
const EVIDENCE_COLORS = {
  Strong: COLORS.green,
  Moderate: COLORS.orange,
  Emerging: COLORS.blue,
};

// ─── Goal Chip ───────────────────────────────────────────────────────
const GoalChip = memo(({ goal, selected, onPress }) => (
  <AnimatedPressable
    onPress={onPress}
    style={[styles.goalChip, selected && styles.goalChipSelected]}
  >
    <Ionicons
      name={goal.icon}
      size={14}
      color={selected ? COLORS.accent : COLORS.textTertiary}
      style={{ marginRight: 6 }}
    />
    <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>
      {goal.label}
    </Text>
  </AnimatedPressable>
));

// ─── Star Rating ─────────────────────────────────────────────────────
const StarRating = memo(({ rating }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={14}
        color={i <= rating ? COLORS.accent : COLORS.textMuted}
        style={{ marginRight: 2 }}
      />
    ))}
  </View>
));

// ─── Evidence Badge ──────────────────────────────────────────────────
const EvidenceBadge = memo(({ level }) => (
  <View style={[styles.evidenceBadge, { backgroundColor: (EVIDENCE_COLORS[level] || COLORS.blue) + '20' }]}>
    <View style={[styles.evidenceDot, { backgroundColor: EVIDENCE_COLORS[level] || COLORS.blue }]} />
    <Text style={[styles.evidenceText, { color: EVIDENCE_COLORS[level] || COLORS.blue }]}>
      {level === 'Strong' ? 'Strong Evidence' : level === 'Moderate' ? 'Moderate' : 'Emerging'}
    </Text>
  </View>
));

// ─── Supplement Card ─────────────────────────────────────────────────
const SupplementCard = memo(({ supplement, index, selectedGoals }) => {
  const matchingGoals = supplement.goals.filter((g) => selectedGoals.includes(g));
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index, 15) * 50)}>
      <GlassCard style={styles.suppCard}>
        <View style={styles.suppHeader}>
          <View style={styles.suppIconWrap}>
            <Ionicons name={supplement.icon} size={20} color={COLORS.accent} />
          </View>
          <View style={styles.suppTitleWrap}>
            <Text style={styles.suppName}>{supplement.name}</Text>
            <Text style={styles.suppDosage}>{supplement.dosage}</Text>
          </View>
          <EvidenceBadge level={supplement.evidence} />
        </View>

        <View style={styles.suppTimingRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.textTertiary} />
          <Text style={styles.suppTimingText}>{supplement.timing}</Text>
        </View>

        <Text style={styles.suppWhy}>{supplement.why}</Text>

        <View style={styles.suppFooter}>
          <StarRating rating={supplement.rating} />
          <View style={styles.goalTagsRow}>
            {matchingGoals.map((gId) => {
              const goal = GOALS.find((g) => g.id === gId);
              return goal ? (
                <View key={gId} style={styles.goalTag}>
                  <Text style={styles.goalTagText}>{goal.label}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
});

// ─── Schedule Item ───────────────────────────────────────────────────
const ScheduleItem = memo(({ supplement }) => (
  <View style={styles.scheduleItem}>
    <View style={styles.pillIcon}>
      <Ionicons name="ellipse" size={8} color={COLORS.accent} />
    </View>
    <Text style={styles.scheduleName}>{supplement.name}</Text>
    <Text style={styles.scheduleDose}>{supplement.dosage}</Text>
  </View>
));

// ─── Main Screen ─────────────────────────────────────────────────────
const SupplementStackScreen = ({ navigation }) => {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const pro = isPro();

  const toggleGoal = useCallback((goalId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  }, []);

  // Filter supplements for selected goals, deduplicate
  const filteredSupplements = useMemo(() => {
    if (selectedGoals.length === 0) return [];
    const seen = new Set();
    return SUPPLEMENTS.filter((s) => {
      if (seen.has(s.id)) return false;
      const match = s.goals.some((g) => selectedGoals.includes(g));
      if (match) seen.add(s.id);
      return match;
    });
  }, [selectedGoals]);

  // Schedule buckets
  const schedule = useMemo(() => {
    const morning = filteredSupplements.filter((s) =>
      s.timing === 'Morning' || s.timing === 'Any Time'
    );
    const withFood = filteredSupplements.filter((s) => s.timing === 'With Food');
    const evening = filteredSupplements.filter((s) =>
      s.timing === 'Evening' || s.timing === 'Before Bed'
    );
    return { morning, withFood, evening };
  }, [filteredSupplements]);

  // Monthly cost
  const monthlyCost = useMemo(
    () => filteredSupplements.reduce((sum, s) => sum + (s.cost || 0), 0),
    [filteredSupplements]
  );

  // Save stack
  const saveStack = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = {
      goals: selectedGoals,
      supplements: filteredSupplements.map((s) => ({
        name: s.name,
        dosage: s.dosage,
        timing: s.timing,
      })),
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [selectedGoals, filteredSupplements]);

  // Share stack as text
  const shareStack = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lines = filteredSupplements.map(
      (s) => `- ${s.name} ${s.dosage} (${s.timing})`
    );
    const text = `My Supplement Stack (Androgenic)\n\nGoals: ${selectedGoals
      .map((gId) => GOALS.find((g) => g.id === gId)?.label)
      .filter(Boolean)
      .join(', ')}\n\n${lines.join('\n')}\n\nEst. monthly cost: ~$${monthlyCost}`;
    await Share.share({ message: text });
  }, [filteredSupplements, selectedGoals, monthlyCost]);

  return (
    <GlassBackground variant="gold">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* ── Header ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Supplement Lab</Text>
          </View>
          <View style={styles.proBadge}>
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBadgeGradient}
            >
              <Ionicons name="diamond" size={10} color="#000" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Goal Selector ────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.sectionTitle}>Select Your Goals</Text>
            <Text style={styles.sectionSub}>
              Choose what matters most — we'll build your personalized stack
            </Text>
            <View style={styles.goalsWrap}>
              {GOALS.map((goal) => (
                <GoalChip
                  key={goal.id}
                  goal={goal}
                  selected={selectedGoals.includes(goal.id)}
                  onPress={() => toggleGoal(goal.id)}
                />
              ))}
            </View>
          </Animated.View>

          {/* ── Your Stack ───────────────────────────────────── */}
          {filteredSupplements.length > 0 && (
            <>
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Stack</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {filteredSupplements.length} supplements
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionSub}>
                  Personalized protocol based on your goals
                </Text>
              </Animated.View>

              {filteredSupplements.map((supp, i) => (
                <SupplementCard
                  key={supp.id}
                  supplement={supp}
                  index={i}
                  selectedGoals={selectedGoals}
                />
              ))}

              {/* ── Daily Schedule View ──────────────────────── */}
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
                  Daily Schedule
                </Text>

                {schedule.morning.length > 0 && (
                  <GlassCard style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Ionicons name="sunny-outline" size={18} color="#FFD700" />
                      <Text style={styles.scheduleTime}>Morning</Text>
                    </View>
                    {schedule.morning.map((s) => (
                      <ScheduleItem key={s.id} supplement={s} />
                    ))}
                  </GlassCard>
                )}

                {schedule.withFood.length > 0 && (
                  <GlassCard style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Ionicons name="restaurant-outline" size={18} color={COLORS.orange} />
                      <Text style={styles.scheduleTime}>With Food</Text>
                    </View>
                    {schedule.withFood.map((s) => (
                      <ScheduleItem key={s.id} supplement={s} />
                    ))}
                  </GlassCard>
                )}

                {schedule.evening.length > 0 && (
                  <GlassCard style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Ionicons name="moon-outline" size={18} color="#7c4dff" />
                      <Text style={styles.scheduleTime}>Evening / Before Bed</Text>
                    </View>
                    {schedule.evening.map((s) => (
                      <ScheduleItem key={s.id} supplement={s} />
                    ))}
                  </GlassCard>
                )}
              </Animated.View>

              {/* ── Important Notes ──────────────────────────── */}
              <Animated.View entering={FadeInDown.duration(400).delay(350)}>
                <GlassCard style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <Ionicons name="alert-circle-outline" size={20} color={COLORS.orange} />
                    <Text style={styles.notesTitle}>Important Notes</Text>
                  </View>
                  {[
                    'Consult your doctor before starting any supplement regimen',
                    'Start with one new supplement at a time',
                    'Quality matters — buy from reputable brands',
                    'Blood work recommended every 6 months',
                  ].map((note, i) => (
                    <View key={i} style={styles.noteRow}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} />
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  ))}
                </GlassCard>
              </Animated.View>

              {/* ── Monthly Cost Estimate ────────────────────── */}
              <Animated.View entering={FadeInDown.duration(400).delay(400)}>
                <GlassCard style={styles.costCard}>
                  <View style={styles.costHeader}>
                    <Ionicons name="wallet-outline" size={20} color={COLORS.accent} />
                    <Text style={styles.costTitle}>Monthly Cost Estimate</Text>
                  </View>
                  <View style={styles.costValueRow}>
                    <Text style={styles.costValue}>~${monthlyCost}</Text>
                    <Text style={styles.costPer}>/month</Text>
                  </View>
                  <Text style={styles.costNote}>
                    Based on average prices from major supplement retailers
                  </Text>
                </GlassCard>
              </Animated.View>

              {/* ── Save / Share ─────────────────────────────── */}
              <Animated.View entering={FadeInDown.duration(400).delay(450)} style={styles.actionRow}>
                <GlassButton
                  label="Save Stack"
                  icon="bookmark-outline"
                  onPress={saveStack}
                  style={styles.actionBtn}
                />
                <GlassButton
                  label="Share"
                  icon="share-outline"
                  onPress={shareStack}
                  style={styles.actionBtn}
                />
              </Animated.View>
            </>
          )}

          {/* ── Empty State ──────────────────────────────────── */}
          {selectedGoals.length === 0 && (
            <Animated.View entering={ZoomIn.duration(400).delay(300)} style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="flask-outline" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>Build Your Stack</Text>
              <Text style={styles.emptySub}>
                Select your goals above and we'll create a personalized supplement protocol tailored to you
              </Text>
            </Animated.View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  proBadge: {
    width: 60,
    alignItems: 'flex-end',
  },
  proBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Goal Chips */
  goalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  goalChipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.bgGlassAccent,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
  goalChipTextSelected: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  /* Count Badge */
  countBadge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginTop: 20,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },

  /* Supplement Card */
  suppCard: {
    marginBottom: 12,
    padding: SPACING.lg,
  },
  suppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suppIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suppTitleWrap: {
    flex: 1,
  },
  suppName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  suppDosage: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.accent,
    marginTop: 1,
  },
  suppTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5,
  },
  suppTimingText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  suppWhy: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  suppFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  /* Stars */
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Evidence Badge */
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  evidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  evidenceText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Goal Tags */
  goalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  goalTag: {
    backgroundColor: COLORS.accent + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  goalTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
  },

  /* Schedule */
  scheduleCard: {
    marginBottom: 10,
    padding: SPACING.lg,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scheduleTime: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  pillIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  scheduleName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scheduleDose: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },

  /* Notes */
  notesCard: {
    marginTop: 20,
    marginBottom: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.orange + '30',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.orange,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  /* Cost */
  costCard: {
    marginBottom: 12,
    padding: SPACING.lg,
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  costTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  costValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  costValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.accent,
  },
  costPer: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  costNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});

export default SupplementStackScreen;
