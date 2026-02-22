import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const SECTIONS = [
  {
    title: 'Why Eyes Matter',
    icon: 'analytics-outline',
    color: '#0066ff',
    points: [
      'Eyes account for roughly 30% of facial attractiveness perception in studies',
      'The periorbital region is the first area people look at during conversation',
      'Dark circles, puffiness, and drooping lids age you faster than any other feature',
      'Bright, well-defined eyes signal health, youth, and genetic fitness',
      'Small improvements here yield disproportionately large aesthetic gains',
    ],
  },
  {
    title: 'Under-Eye Care',
    icon: 'eye-outline',
    color: '#00e5ff',
    points: [
      'Apply cold compresses or chilled spoons for 5 min each morning to reduce puffiness',
      'Use a caffeine-based eye cream (1-5% caffeine) to constrict blood vessels and reduce dark circles',
      'Get 7-9 hours of quality sleep — under-eye hollows worsen with sleep debt',
      'Reduce sodium intake below 2,300mg/day to minimize water retention and puffiness',
      'Sleep with head slightly elevated to prevent fluid pooling around the orbital area',
      'Apply vitamin K cream at night to help fade persistent dark discoloration',
    ],
  },
  {
    title: 'Eyebrow Optimization',
    icon: 'brush-outline',
    color: '#ffab40',
    points: [
      'Threading gives the most precise shape for men — cleaner edges than waxing',
      'Ideal male brow: straight to slightly arched, thicker, with a defined tail',
      'Never over-pluck — remove only obvious strays below and between brows',
      'Brush brows upward daily with a spoolie to train hair direction',
      'Use castor oil nightly on sparse areas to promote thicker growth over 8-12 weeks',
      'The brow should start aligned with the inner nostril and end at the outer eye corner',
    ],
  },
  {
    title: 'Canthal Tilt',
    icon: 'trending-up',
    color: '#00e676',
    points: [
      'Canthal tilt is the angle from inner eye corner (medial canthus) to outer corner (lateral canthus)',
      'Positive canthal tilt (outer corner higher) is associated with a youthful, hunter-eye look',
      'Negative canthal tilt (outer corner lower) can make eyes appear droopy or tired',
      'Hunter eyes exercises: squinting hard for 10-sec holds, 3 sets of 15 daily',
      'Proper mewing over time may subtly influence orbital bone positioning',
      'Reducing body fat to 10-15% reveals the natural bone structure around eyes',
    ],
  },
  {
    title: 'Eye Drops & Brightness',
    icon: 'sparkles-outline',
    color: '#4d94ff',
    points: [
      'Use preservative-free artificial tears daily to maintain clear, hydrated eyes',
      'Brimonidine-based drops (e.g. Lumify) reduce redness for up to 8 hours safely',
      'Increase omega-3 intake (fish oil, flaxseed) for brighter, less inflamed sclera',
      'Follow the 20-20-20 rule: every 20 min, look 20 feet away for 20 seconds',
      'Stay well-hydrated — dehydration causes bloodshot, dull-looking eyes',
      'Wear UV-blocking sunglasses outdoors to prevent yellowing of the sclera',
    ],
  },
  {
    title: 'Advanced: Orbital Bone',
    icon: 'skull-outline',
    color: '#ff6090',
    points: [
      'The supraorbital ridge (brow bone) defines how deep-set your eyes appear',
      'Forward maxillary growth from mewing can subtly improve under-eye support over years',
      'Low body fat reveals orbital rim definition — aim for 10-15% for visible structure',
      'Bone remodeling is most effective under age 25 when sutures are not fully fused',
      'Proper tongue posture supports the maxilla, which forms the orbital floor',
      'Infraorbital rim support determines whether under-eye hollows are prominent or filled',
    ],
  },
  {
    title: 'Daily Eye Routine',
    icon: 'calendar-outline',
    color: '#1de9b6',
    points: [
      'Morning: Splash cold water on closed eyes for 30 seconds to reduce overnight puffiness',
      'Morning: Apply caffeine eye serum with ring finger using gentle tapping motions',
      'Morning: Use Lumify drops if needed for a bright, clear-eyed look',
      'Morning: Apply SPF around orbital area to prevent collagen breakdown',
      'Evening: Double-cleanse eye area to remove all sunscreen and debris',
      'Evening: Apply retinol eye cream (0.025%) to target fine lines and dark circles',
      'Evening: Finish with a peptide-rich eye mask or heavy eye cream to repair overnight',
    ],
  },
];

const EyeAreaGuideScreen = ({ navigation }) => {
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
          <Text style={styles.headerTitle}>Eye Area Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,102,255,0.2)' }]}>
              <Ionicons name="eye-outline" size={32} color="#0066ff" />
            </View>
            <Text style={styles.heroTitle}>Eye Area Mastery</Text>
            <Text style={styles.heroSubtitle}>
              Optimize the most impactful region of your face for a striking, youthful appearance
            </Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={12} color="#0066ff" />
                <Text style={styles.metaText}>12 min read</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="list-outline" size={12} color="#0066ff" />
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
            Consistency beats intensity. A simple daily eye care routine maintained for months will outperform expensive one-time treatments every time.
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

export default EyeAreaGuideScreen;
