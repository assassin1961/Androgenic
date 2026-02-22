import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';

const SECTIONS = [
  {
    title: 'Facial Hair',
    icon: 'cut-outline',
    color: '#ff6b35',
    bullets: [
      'Match beard style to face shape — round faces suit angular jawline beards, square faces look great with rounded styles',
      'Clean shave works best if you have strong bone structure and clear skin',
      'Stubble (1-3mm) is universally flattering and adds perceived masculinity',
      'Invest in a quality trimmer with guard lengths — consistency is key',
      'Use beard oil daily to keep facial hair soft and prevent itchy skin underneath',
      'Define your neckline: shave below the line from earlobe to two fingers above the Adam\'s apple',
      'Trim stray cheek hairs weekly for a clean, intentional look',
    ],
  },
  {
    title: 'Eyebrow Grooming',
    icon: 'eye-outline',
    color: '#4d94ff',
    bullets: [
      'Trim overgrown brow hairs by brushing up with a spoolie and snipping anything past the brow line',
      'Tweeze stray hairs between the brows — unibrows are easily fixed with regular maintenance',
      'Avoid over-plucking; masculine brows are naturally fuller and straighter',
      'Shape subtly: follow your natural arch rather than creating a new one',
      'Fill sparse areas with a tinted brow gel or matte pencil that matches your hair color',
      'Visit a professional for initial shaping, then maintain at home every 1-2 weeks',
    ],
  },
  {
    title: 'Nose & Ear Hair',
    icon: 'body-outline',
    color: '#00e5ff',
    bullets: [
      'Trim nose hair weekly using a dedicated rotary nose hair trimmer — never pluck',
      'Plucking nose hairs can cause infections due to the "danger triangle" blood supply',
      'Check ear hair in good lighting — trim any visible hairs with a precision trimmer',
      'Electric nose/ear trimmers are inexpensive and last years with minimal maintenance',
      'Make it part of your weekly grooming routine so it never gets overlooked',
    ],
  },
  {
    title: 'Lip Care',
    icon: 'happy-outline',
    color: '#ff6090',
    bullets: [
      'Apply lip balm with SPF daily — lips have no melanin and burn easily',
      'Exfoliate lips gently once a week with a sugar scrub or soft toothbrush',
      'Stay hydrated — dry, cracked lips are often a sign of dehydration',
      'Avoid licking your lips; saliva evaporates and worsens dryness',
      'Use an overnight lip mask or thick balm before bed for deeper repair',
      'Choose fragrance-free, petroleum-based or beeswax-based balms over flavored ones',
    ],
  },
  {
    title: 'Teeth & Smile',
    icon: 'sparkles-outline',
    color: '#ffab40',
    bullets: [
      'Whiten teeth with peroxide-based strips or professional treatment — a bright smile elevates your entire face',
      'Brush twice daily for 2 minutes with an electric toothbrush for superior plaque removal',
      'Floss every night — gum disease causes recession that ages your face prematurely',
      'Consider clear aligners (Invisalign) if teeth are misaligned — straight teeth are high-impact',
      'Use a tongue scraper every morning to reduce bacteria and improve breath',
      'Limit coffee, red wine, and tea staining — rinse mouth with water after consuming',
      'Good oral hygiene prevents jaw bone loss which directly impacts facial structure',
    ],
  },
  {
    title: 'Fragrance',
    icon: 'rose-outline',
    color: '#1de9b6',
    bullets: [
      'Choose a signature scent that complements your body chemistry — test on skin, not paper',
      'Apply to pulse points: wrists, neck, behind ears, and inner elbows for best projection',
      'Less is more — 2-3 sprays max. Others should notice when close, not across the room',
      'Rotate seasonally: fresh citrus and aquatics for summer, warm amber and oud for winter',
      'Layer fragrances with matching shower gel and lotion for longer lasting scent',
      'Store fragrances in a cool, dark place — heat and sunlight degrade the molecules',
      'Invest in one quality fragrance over multiple cheap ones — it makes a noticeable difference',
    ],
  },
  {
    title: 'Nails & Hands',
    icon: 'hand-left-outline',
    color: '#00e676',
    bullets: [
      'Keep nails trimmed short and filed — clean nails are one of the first things people notice',
      'Push back cuticles gently after showering — never cut them as it risks infection',
      'Moisturize hands daily, especially in cold weather, to prevent dry cracked skin',
      'Use a hand cream with SPF during the day to prevent premature aging',
      'Address hangnails immediately by trimming cleanly rather than pulling them',
      'A clear coat of nail strengthener is subtle and keeps nails looking healthy',
      'Exfoliate the backs of your hands weekly to maintain smooth, even skin tone',
    ],
  },
];

const GroomingGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grooming Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,102,255,0.2)' }]}>
              <Ionicons name="cut-outline" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.heroTitle}>Complete Grooming Guide</Text>
            <Text style={styles.heroSubtitle}>
              Master every aspect of male grooming to maximize your appearance and make a lasting first impression
            </Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}>
                <Ionicons name="list-outline" size={12} color={COLORS.accent} />
                <Text style={styles.metaText}>7 Sections</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="school-outline" size={12} color={COLORS.accent} />
                <Text style={styles.metaText}>All Levels</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + '18' }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.bullets.map((bullet, bi) => (
              <View key={bi} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={14} color={section.color} style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
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
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
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
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  bulletText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
});

export default GroomingGuideScreen;
