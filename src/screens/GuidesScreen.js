import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isPro } from '../utils/pro';

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
];

const allGuides = GUIDE_CATEGORIES.flatMap(c => c.guides);

const GuidesScreen = ({ navigation }) => {
  const pro = isPro();

  const handlePress = (guide) => {
    if (guide.pro && !pro) {
      navigation.navigate('Paywall');
    } else {
      navigation.navigate(guide.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guides</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{allGuides.length}</Text>
            <Text style={styles.statLabel}>Guides</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>120+</Text>
            <Text style={styles.statLabel}>Min Read</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
        </View>

        {/* Guide Categories */}
        {GUIDE_CATEGORIES.map((category, ci) => (
          <View key={ci} style={styles.catSection}>
            <Text style={styles.catTitle}>{category.title}</Text>
            {category.guides.map((guide) => {
              const locked = guide.pro && !pro;
              return (
                <TouchableOpacity
                  key={guide.id}
                  style={styles.guideCard}
                  onPress={() => handlePress(guide)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.guideIcon, { backgroundColor: guide.color + '15' }]}>
                    <Ionicons name={guide.icon} size={20} color={guide.color} />
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
                      <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                      <Text style={styles.guideMetaText}>{guide.duration}</Text>
                      <View style={[styles.levelDot, { backgroundColor: guide.color }]} />
                      <Text style={styles.guideMetaText}>{guide.level}</Text>
                    </View>
                  </View>
                  <Ionicons name={locked ? 'lock-closed' : 'chevron-forward'} size={14} color={locked ? COLORS.gold : COLORS.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* PRO Upsell */}
        {!pro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.upsell}>
              <Ionicons name="lock-open" size={18} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.upsellTitle}>Unlock All Guides</Text>
                <Text style={styles.upsellSub}>Get access to Eye Area, Symmetry & Supplements guides</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border, gap: 16,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#0066ff' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },
  statDiv: { width: 1, height: 20, backgroundColor: COLORS.border },

  catSection: { marginBottom: 16 },
  catTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.3 },

  guideCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  guideIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  guideContent: { flex: 1 },
  guideTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  guideTitle: { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1 },
  guideDesc: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guideMetaText: { fontSize: 10, color: COLORS.textMuted },
  levelDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 4 },

  proPill: { backgroundColor: COLORS.gold, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6 },
  proPillText: { fontSize: 8, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  upsell: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginTop: 4,
  },
  upsellTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  upsellSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },
});

export default GuidesScreen;
