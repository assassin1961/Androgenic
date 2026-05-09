import React, { memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isPro } from '../utils/pro';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const GUIDE_CATEGORIES = [
  {
    title: 'Fundamentals',
    guides: [
      { id: 'mewing', screen: 'MewingGuide', icon: 'fitness-outline', title: 'Mewing Technique', desc: 'Proper tongue posture for facial development', color: '#0066ff', duration: '12 min', level: 'Beginner' },
      { id: 'skincare', screen: 'SkinCareGuide', icon: 'sparkles-outline', title: 'Skincare Mastery', desc: 'Build the perfect routine for clear skin', color: '#00e676', duration: '15 min', level: 'All Levels' },
      { id: 'nutrition', screen: 'NutritionGuide', icon: 'nutrition-outline', title: 'Face Nutrition', desc: 'Diet strategies for facial aesthetics', color: '#ffab40', duration: '10 min', level: 'Beginner' },
      { id: 'grooming', screen: 'GroomingGuide', icon: 'cut-outline', title: 'Complete Grooming', desc: 'Beard, brows, teeth, fragrance & more', color: '#ff6090', duration: '14 min', level: 'All Levels' },
    ],
  },
  {
    title: 'Advanced Techniques',
    guides: [
      { id: 'jawline', screen: 'JawlineGuide', icon: 'shield-outline', title: 'Jawline Sculpting', desc: 'Exercises and tools for a defined jaw', color: '#ff6b35', duration: '14 min', level: 'Intermediate' },
      { id: 'bone', screen: 'BoneStructureGuide', icon: 'scan-outline', title: 'Bone Structure', desc: 'Understanding and optimizing facial bones', color: '#00e5ff', duration: '18 min', level: 'Advanced' },
      { id: 'eyes', screen: 'EyeAreaGuide', icon: 'eye-outline', title: 'Eye Area Mastery', desc: 'Under-eye, brows, canthal tilt & more', color: '#4d94ff', duration: '13 min', level: 'Intermediate', pro: true },
      { id: 'symmetry', screen: 'SymmetryGuide', icon: 'git-compare-outline', title: 'Facial Symmetry', desc: 'Fix asymmetry with posture, sleep & exercises', color: '#1de9b6', duration: '11 min', level: 'Intermediate', pro: true },
    ],
  },
  {
    title: 'Lifestyle & Habits',
    guides: [
      { id: 'hair', screen: 'HairGuide', icon: 'cut-outline', title: 'Hair Optimization', desc: 'Styles, growth, and care for your face shape', color: '#ff6090', duration: '11 min', level: 'All Levels' },
      { id: 'sleep', screen: 'SleepGuide', icon: 'moon-outline', title: 'Sleep Optimization', desc: 'How sleep affects facial appearance', color: '#4d94ff', duration: '8 min', level: 'Beginner' },
      { id: 'posture', screen: 'PostureGuide', icon: 'body-outline', title: 'Posture & Alignment', desc: 'Neck and posture for jawline definition', color: '#1de9b6', duration: '9 min', level: 'Beginner' },
      { id: 'supplements', screen: 'SupplementsGuide', icon: 'flask-outline', title: 'Supplements Guide', desc: 'Vitamins & supplements for aesthetics', color: '#ffab40', duration: '12 min', level: 'Intermediate', pro: true },
    ],
  },
  {
    title: 'PRO Masterclasses',
    guides: [
      { id: 'testosterone', screen: 'TestosteroneGuide', icon: 'trending-up-outline', title: 'Testosterone Guide', desc: 'Natural T optimization for facial masculinity', color: '#ff3d00', duration: '20 min', level: 'Advanced', pro: true },
      { id: 'facefat', screen: 'FaceFatGuide', icon: 'water-outline', title: 'Lean Face Protocol', desc: 'Lose face fat & reveal bone structure', color: '#00b0ff', duration: '18 min', level: 'Intermediate', pro: true },
      { id: 'softmaxxing', screen: 'SoftMaxxingGuide', icon: 'diamond-outline', title: 'Soft Maxxing', desc: 'Style, fragrance & grooming mastery', color: '#ffd740', duration: '16 min', level: 'All Levels', pro: true },
    ],
  },
];

const allGuides = GUIDE_CATEGORIES.flatMap(c => c.guides);

const GuideRow = memo(({ guide, locked, onPress, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
    <AnimatedPressable onPress={onPress}>
      <GlassCard variant={locked ? 'default' : 'default'} style={styles.guideCard}>
        <View style={[styles.guideIcon, { backgroundColor: guide.color + '15' }]}>
          <Ionicons name={guide.icon} size={18} color={guide.color} />
        </View>
        <View style={styles.guideContent}>
          <View style={styles.guideTopRow}>
            <Text style={styles.guideTitle} numberOfLines={1}>{guide.title}</Text>
            {locked && (
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.guideDesc} numberOfLines={1}>{guide.desc}</Text>
          <View style={styles.guideMeta}>
            <Ionicons name="time-outline" size={10} color={COLORS.textMuted} />
            <Text style={styles.guideMetaText}>{guide.duration}</Text>
            <View style={[styles.levelDot, { backgroundColor: guide.color }]} />
            <Text style={styles.guideMetaText}>{guide.level}</Text>
          </View>
        </View>
        <Ionicons name={locked ? 'lock-closed' : 'chevron-forward'} size={14} color={locked ? COLORS.gold : COLORS.textMuted} />
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

const GuidesScreen = ({ navigation }) => {
  const pro = isPro();

  const handlePress = (guide) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (guide.pro && !pro) {
      navigation.navigate('Paywall');
    } else {
      navigation.navigate(guide.screen);
    }
  };

  let globalIndex = 0;

  return (
    <GlassBackground variant="purple">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Guides</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.statsRow}>
              <GlassCard variant="default" style={styles.statCard}>
                <Text style={[styles.statNum, { color: COLORS.accent }]}>{allGuides.length}</Text>
                <Text style={styles.statLabel}>Guides</Text>
              </GlassCard>
              <GlassCard variant="default" style={styles.statCard}>
                <Text style={[styles.statNum, { color: COLORS.purple }]}>120+</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </GlassCard>
              <GlassCard variant="default" style={styles.statCard}>
                <Text style={[styles.statNum, { color: COLORS.scoreHigh }]}>3</Text>
                <Text style={styles.statLabel}>Levels</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Categories */}
          {GUIDE_CATEGORIES.map((category, ci) => (
            <View key={ci}>
              <Animated.View entering={FadeInDown.duration(300).delay(80 + ci * 60)}>
                <Text style={styles.catTitle}>{category.title}</Text>
              </Animated.View>
              {category.guides.map((guide) => {
                const locked = guide.pro && !pro;
                const idx = globalIndex++;
                return (
                  <GuideRow
                    key={guide.id}
                    guide={guide}
                    locked={locked}
                    onPress={() => handlePress(guide)}
                    index={idx}
                  />
                );
              })}
            </View>
          ))}

          {/* PRO Upsell */}
          {!pro && (
            <Animated.View entering={FadeInDown.duration(400).delay(500)}>
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.upsell}>
                  <Ionicons name="lock-open" size={16} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upsellTitle}>Unlock All Guides</Text>
                    <Text style={styles.upsellSub}>6 premium guides including Testosterone, Lean Face & Soft Maxxing</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
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

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },

  catTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, marginTop: 12, letterSpacing: 0.3 },

  guideCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  guideContent: { flex: 1 },
  guideTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  guideTitle: { fontSize: 13, fontWeight: '700', color: '#fff', flex: 1 },
  guideDesc: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guideMetaText: { fontSize: 9, color: COLORS.textMuted },
  levelDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 4 },

  proPill: { backgroundColor: COLORS.gold, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6 },
  proPillText: { fontSize: 8, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  upsell: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginTop: 12 },
  upsellTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  upsellSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 1 },
});

export default GuidesScreen;
