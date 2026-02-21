import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, GLASS } from '../utils/theme';

const GUIDE_CATEGORIES = [
  {
    title: 'Fundamentals',
    guides: [
      { id: 'mewing', screen: 'MewingGuide', icon: 'fitness-outline', title: 'Mewing Technique', desc: 'Proper tongue posture for facial development', color: '#0066ff', duration: '12 min read', level: 'Beginner' },
      { id: 'skincare', screen: 'SkinCareGuide', icon: 'sparkles-outline', title: 'Skincare Mastery', desc: 'Build the perfect routine for clear skin', color: '#00e676', duration: '15 min read', level: 'All Levels' },
      { id: 'nutrition', screen: 'NutritionGuide', icon: 'nutrition-outline', title: 'Face Nutrition', desc: 'Diet strategies for facial aesthetics', color: '#ffab40', duration: '10 min read', level: 'Beginner' },
    ],
  },
  {
    title: 'Advanced Techniques',
    guides: [
      { id: 'jawline', screen: 'JawlineGuide', icon: 'shield-outline', title: 'Jawline Sculpting', desc: 'Exercises and tools for a defined jaw', color: '#ff6b35', duration: '14 min read', level: 'Intermediate' },
      { id: 'bone', screen: 'BoneStructureGuide', icon: 'scan-outline', title: 'Bone Structure', desc: 'Understanding and optimizing facial bones', color: '#00e5ff', duration: '18 min read', level: 'Advanced' },
      { id: 'hair', screen: 'HairGuide', icon: 'cut-outline', title: 'Hair Optimization', desc: 'Styles, growth, and care for your face shape', color: '#ff6090', duration: '11 min read', level: 'All Levels' },
    ],
  },
  {
    title: 'Lifestyle & Habits',
    guides: [
      { id: 'sleep', screen: 'SleepGuide', icon: 'moon-outline', title: 'Sleep Optimization', desc: 'How sleep affects facial appearance', color: '#4d94ff', duration: '8 min read', level: 'Beginner' },
      { id: 'posture', screen: 'PostureGuide', icon: 'body-outline', title: 'Posture & Alignment', desc: 'Neck and posture for jawline definition', color: '#1de9b6', duration: '9 min read', level: 'Beginner' },
    ],
  },
];

const GuidesScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardAnims = useRef(
    GUIDE_CATEGORIES.flatMap(c => c.guides).map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    let idx = 0;
    GUIDE_CATEGORIES.forEach(cat => {
      cat.guides.forEach((_, gi) => {
        const anim = cardAnims[idx];
        Animated.sequence([
          Animated.delay(200 + idx * 80),
          Animated.parallel([
            Animated.timing(anim.fade, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(anim.slide, { toValue: 0, friction: 8, useNativeDriver: true }),
          ]),
        ]).start();
        idx++;
      });
    });
  }, []);

  let globalIdx = 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guides & Tutorials</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={GRADIENTS.hero} style={styles.heroBanner}>
            <View style={styles.heroIconBg}>
              <Ionicons name="book-outline" size={28} color={COLORS.accent} />
            </View>
            <Text style={styles.heroTitle}>Your Looksmaxxing Library</Text>
            <Text style={styles.heroSubtitle}>
              Expert guides covering everything from mewing to skincare, jawline sculpting to nutrition optimization.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>8</Text>
                <Text style={styles.heroStatLabel}>Guides</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>97</Text>
                <Text style={styles.heroStatLabel}>Min Read</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>3</Text>
                <Text style={styles.heroStatLabel}>Levels</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Guide Categories */}
        {GUIDE_CATEGORIES.map((category, ci) => (
          <View key={ci} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.guides.map((guide, gi) => {
              const anim = cardAnims[globalIdx];
              globalIdx++;
              return (
                <Animated.View key={guide.id} style={{ opacity: anim.fade, transform: [{ translateY: anim.slide }] }}>
                  <TouchableOpacity
                    style={styles.guideCard}
                    onPress={() => navigation.navigate(guide.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.guideIconBg, { backgroundColor: guide.color + '18' }]}>
                      <Ionicons name={guide.icon} size={22} color={guide.color} />
                    </View>
                    <View style={styles.guideContent}>
                      <View style={styles.guideTopRow}>
                        <Text style={styles.guideTitle}>{guide.title}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: guide.color + '20' }]}>
                          <Text style={[styles.levelText, { color: guide.color }]}>{guide.level}</Text>
                        </View>
                      </View>
                      <Text style={styles.guideDesc}>{guide.desc}</Text>
                      <View style={styles.guideMeta}>
                        <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.guideMetaText}>{guide.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.guideArrow}>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        ))}

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Text style={styles.ctaText}>New guides added weekly</Text>
          <Text style={styles.ctaSubtext}>Check back for the latest techniques</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.5 },
  heroBanner: {
    padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, alignItems: 'center',
  },
  heroIconBg: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  heroStatLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },
  heroStatDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  categorySection: { marginBottom: 20 },
  categoryTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, letterSpacing: 0.3,
  },
  guideCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  guideIconBg: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  guideContent: { flex: 1 },
  guideTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  guideTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  guideDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 4 },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guideMetaText: { fontSize: 11, color: COLORS.textMuted },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  levelText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  guideArrow: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  bottomCta: { alignItems: 'center', paddingVertical: 20 },
  ctaText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  ctaSubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});

export default GuidesScreen;
