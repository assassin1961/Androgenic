import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const SECTIONS = [
  {
    title: 'Why Symmetry Matters',
    icon: 'git-compare-outline',
    color: '#0066ff',
    points: [
      'Studies consistently show facial symmetry is one of the strongest predictors of perceived attractiveness',
      'Perfect symmetry does not exist — even top models have slight asymmetries',
      'Differences under 3% between sides are virtually undetectable to the human eye',
      'Symmetry signals developmental stability and genetic health to observers',
      'Most people overestimate their own asymmetry due to mirror-image familiarity bias',
      'Functional asymmetries (chewing, sleeping) are the easiest to correct with habit changes',
    ],
  },
  {
    title: 'Sleep Position',
    icon: 'bed-outline',
    color: '#00e5ff',
    points: [
      'Sleeping consistently on one side compresses that half of the face for 6-8 hours nightly',
      'Side-sleeping can flatten the cheekbone and push the jaw laterally over months and years',
      'Train yourself to sleep on your back using a cervical pillow with neck support',
      'Place pillows on both sides to prevent rolling during the night',
      'A memory foam pillow contoured for back sleeping reduces the urge to turn sideways',
      'It takes 2-4 weeks to adapt to a new sleep position — persist through the adjustment period',
    ],
  },
  {
    title: 'Chewing Habits',
    icon: 'restaurant-outline',
    color: '#ffab40',
    points: [
      'Habitual unilateral chewing builds the masseter unevenly, causing visible jaw asymmetry',
      'Consciously alternate chewing sides with every meal — start with your weaker side first',
      'Chew mastic or falim gum for equal time on each side (15 min left, 15 min right)',
      'The dominant chewing side often has a larger, more defined masseter muscle',
      'It takes 3-6 months of balanced chewing to notice measurable symmetry improvements',
      'Avoid resting your chin on your hand — this pushes the jaw off-center over time',
    ],
  },
  {
    title: 'Mewing for Symmetry',
    icon: 'body-outline',
    color: '#00e676',
    points: [
      'Ensure the tongue presses evenly across the entire palate, not favoring one side',
      'A deviated septum can make breathing asymmetric — address this with an ENT if needed',
      'Uneven tongue pressure will push the maxilla unevenly, worsening facial asymmetry',
      'Practice by placing the tongue tip behind upper front teeth and pressing the whole body up',
      'Use a mirror to check that your jaw rests centered when in proper mewing posture',
      'Consistent even mewing over 12+ months can gradually improve midface symmetry',
    ],
  },
  {
    title: 'Facial Exercises',
    icon: 'fitness-outline',
    color: '#ff6090',
    points: [
      'Perform exercises unilaterally — work the weaker side with extra sets to balance out',
      'Cheek puff holds: inflate cheeks evenly, hold 30 seconds, 3 sets per side',
      'One-sided smile holds: smile on the weaker side only for 10-sec holds, 15 reps',
      'Eyebrow raises: raise each brow independently to balance frontalis muscle strength',
      'Jaw side stretches: open jaw and shift to each side, hold 5 seconds, 10 reps each',
      'Do these exercises in front of a mirror to ensure proper form and track progress',
    ],
  },
  {
    title: 'Posture Correction',
    icon: 'body-outline',
    color: '#4d94ff',
    points: [
      'A habitual head tilt makes one side of the face appear compressed in photos and in person',
      'Forward head posture pulls the mandible backward, changing jaw alignment asymmetrically',
      'Strengthen deep neck flexors with chin tucks — 3 sets of 12 reps, 3 times daily',
      'Check your posture hourly: ears should align directly over shoulders when viewed from the side',
      'Uneven shoulder height (from bag carrying or desk posture) contributes to head tilt',
      'A standing desk or ergonomic chair setup prevents the chronic lean that distorts symmetry',
    ],
  },
  {
    title: 'Photography Tips',
    icon: 'camera-outline',
    color: '#1de9b6',
    points: [
      'Phone cameras at close range distort facial proportions — shoot from 4-6 feet with slight zoom',
      'Wide-angle lenses (most front cameras) enlarge the nose and shrink the ears, creating false asymmetry',
      'Your mirror image is flipped — photos show what others actually see, which feels unfamiliar',
      'Lighting from one side creates shadows that exaggerate asymmetry; use even, front-facing light',
      'Slight head angles (15-20 degrees) can minimize perceived asymmetry in photos',
      'True symmetry assessment requires a straight-on photo at eye level from at least 5 feet away',
    ],
  },
];

const SymmetryGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
          <Text style={styles.headerTitle}>Symmetry Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,229,255,0.15)', 'rgba(0,229,255,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,229,255,0.2)' }]}>
              <Ionicons name="git-compare-outline" size={32} color="#00e5ff" />
            </View>
            <Text style={styles.heroTitle}>Facial Symmetry Guide</Text>
            <Text style={styles.heroSubtitle}>
              Understand and improve facial balance through posture, habits, and targeted exercises
            </Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={12} color="#00e5ff" />
                <Text style={styles.metaText}>10 min read</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="list-outline" size={12} color="#00e5ff" />
                <Text style={styles.metaText}>7 Sections</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: section.color + '18' }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.points.map((point, pi) => (
              <View key={pi} style={styles.pointRow}>
                <Ionicons name="checkmark-circle" size={15} color={section.color} style={{ marginTop: 2 }} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Key Takeaway */}
        <View style={styles.takeawayCard}>
          <Ionicons name="bulb-outline" size={20} color="#ffab40" />
          <Text style={styles.takeawayText}>
            Most facial asymmetry comes from habits, not genetics. Correcting sleep position, chewing balance, and posture can produce visible improvements within 3-6 months.
          </Text>
        </View>

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
  sectionCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  pointText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  takeawayCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,171,64,0.08)', borderRadius: 14, padding: 14, marginTop: 10, gap: 10, borderWidth: 1, borderColor: 'rgba(255,171,64,0.2)' },
  takeawayText: { flex: 1, fontSize: 13, color: '#ffab40', lineHeight: 19 },
});

export default SymmetryGuideScreen;
