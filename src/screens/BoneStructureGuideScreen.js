import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const BONE_AREAS = [
  {
    name: 'Maxilla (Upper Jaw)',
    icon: 'scan-outline',
    color: '#0066ff',
    desc: 'The maxilla is the most impactful bone for facial aesthetics. Forward-grown maxilla creates prominent cheekbones, good undereye support, and attractive midface.',
    ideal: ['Forward projected (no flat midface)', 'Wide palate', 'High cheekbones', 'Good infraorbital rim support'],
    optimize: ['Mewing (tongue posture)', 'Hard food chewing', 'Nasal breathing', 'MSE/SARPE (surgical palate expansion)', 'Lefort I osteotomy (surgical)'],
    rating: 'Critical',
  },
  {
    name: 'Mandible (Lower Jaw)',
    icon: 'shield-outline',
    color: '#ff6b35',
    desc: 'The mandible determines jawline shape, chin projection, and lower facial harmony. A strong, forward mandible creates the classic masculine jaw.',
    ideal: ['Wide gonial angle (not too obtuse)', 'Good chin projection', 'Defined jaw angle', 'Adequate ramus height'],
    optimize: ['Mewing', 'Jaw exercises (masseter hypertrophy)', 'Chewing hard gum', 'Chin implant (surgical)', 'Sliding genioplasty (surgical)', 'BSSO (surgical)'],
    rating: 'Critical',
  },
  {
    name: 'Zygomatic Bones (Cheekbones)',
    icon: 'diamond-outline',
    color: '#00e5ff',
    desc: 'Prominent, high-set cheekbones are universally attractive. They create facial width and the hollow-cheek look that gives a sculpted appearance.',
    ideal: ['High-set zygomatic arch', 'Lateral projection', 'Visible hollow below cheekbone', 'Balanced with midface'],
    optimize: ['Reduce body fat (reveals bone structure)', 'Mewing (supports maxilla upswing)', 'Buccal fat removal (surgical)', 'Cheekbone implants (surgical)', 'Filler (non-surgical, temporary)'],
    rating: 'High',
  },
  {
    name: 'Orbital Bones (Eye Area)',
    icon: 'eye-outline',
    color: '#00e676',
    desc: 'The orbital rim protects the eye and determines eye depth, canthal tilt, and the amount of upper eyelid exposure. Deep-set eyes with positive canthal tilt are most attractive.',
    ideal: ['Strong brow ridge', 'Positive canthal tilt', 'Low upper eyelid exposure', 'Good infraorbital support'],
    optimize: ['Body fat reduction for undereye definition', 'Brow ridge implant (surgical)', 'Canthopexy (surgical)', 'Infraorbital rim implant (surgical)'],
    rating: 'High',
  },
  {
    name: 'Supraorbital Ridge (Brow)',
    icon: 'remove-outline',
    color: '#ffab40',
    desc: 'The brow ridge creates facial dominance and depth. A pronounced brow ridge with good brow position frames the eyes and creates a hunter-eye appearance.',
    ideal: ['Moderate protrusion', 'Even across the ridge', 'Good brow position above rim', 'Creates slight shadow over eyes'],
    optimize: ['Cannot be naturally enhanced', 'Custom brow ridge implant (surgical)', 'Forehead augmentation (surgical)'],
    rating: 'Moderate',
  },
  {
    name: 'Nasal Bones',
    icon: 'trending-down-outline',
    color: '#ff6090',
    desc: 'Nose shape affects overall facial harmony. A straight, proportionate nose bridge with appropriate projection complements strong bone structure.',
    ideal: ['Straight dorsum', 'Appropriate projection', 'Good nasion depth', 'Proportionate width'],
    optimize: ['Rhinoplasty (surgical)', 'Non-surgical nose job (filler)', 'Nose exercises (minimal effect)'],
    rating: 'Moderate',
  },
];

const RATIOS = [
  { name: 'Facial Thirds', ideal: 'Equal thirds: hairline-brow, brow-nose, nose-chin', impact: 'Overall balance' },
  { name: 'Bigonial-Bizygomatic', ideal: '75-80% (jaw width to cheekbone width)', impact: 'Facial taper' },
  { name: 'FWHR (Facial Width-Height)', ideal: '1.8-2.0 (width/midface height)', impact: 'Dominance perception' },
  { name: 'E-Line (Ricketts)', ideal: 'Lips should touch or slightly behind imaginary line from nose tip to chin', impact: 'Profile harmony' },
  { name: 'Gonial Angle', ideal: '120-130 degrees (male ideal)', impact: 'Jaw definition' },
  { name: 'Ramus Length', ideal: 'Equal to or greater than mandibular body', impact: 'Jaw height' },
  { name: 'Chin-to-Philtrum', ideal: '2:1 ratio (chin length twice philtrum)', impact: 'Lower face balance' },
];

const SOFTMAXXING = [
  { method: 'Reduce Body Fat', target: '10-15% BF', effect: 'Reveals bone structure, creates hollows', difficulty: 'Moderate' },
  { method: 'Mewing', target: '24/7 tongue posture', effect: 'Maxilla repositioning over years', difficulty: 'Easy' },
  { method: 'Masseter Training', target: '30 min/day gum chewing', effect: 'Wider jaw appearance', difficulty: 'Easy' },
  { method: 'Neck Training', target: '3x/week resistance', effect: 'Thicker neck enhances jaw-neck contrast', difficulty: 'Moderate' },
  { method: 'Posture Correction', target: 'Neutral head position', effect: 'Forward head posture masks jawline', difficulty: 'Easy' },
];

const BoneStructureGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedBone, setExpandedBone] = useState(0);

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
          <Text style={styles.headerTitle}>Bone Structure</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,229,255,0.15)', 'rgba(0,229,255,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,229,255,0.2)' }]}>
              <Ionicons name="scan-outline" size={32} color="#00e5ff" />
            </View>
            <Text style={styles.heroTitle}>Facial Bone Analysis</Text>
            <Text style={styles.heroSubtitle}>Deep dive into facial bone structure — understanding, measuring, and optimizing your skeletal foundation</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#00e5ff" /><Text style={styles.metaText}>18 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color="#00e5ff" /><Text style={styles.metaText}>Advanced</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Bone Areas */}
        <Text style={styles.sectionTitle}>Key Bone Areas</Text>
        {BONE_AREAS.map((bone, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.boneCard, expandedBone === idx && styles.boneCardActive]}
              onPress={() => setExpandedBone(expandedBone === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.boneIcon, { backgroundColor: bone.color + '18' }]}>
                <Ionicons name={bone.icon} size={20} color={bone.color} />
              </View>
              <View style={styles.boneInfo}>
                <Text style={styles.boneName}>{bone.name}</Text>
                <View style={[styles.impactBadge, { backgroundColor: bone.color + '20' }]}>
                  <Text style={[styles.impactText, { color: bone.color }]}>{bone.rating}</Text>
                </View>
              </View>
              <Ionicons name={expandedBone === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedBone === idx && (
              <View style={styles.boneExpanded}>
                <Text style={styles.boneDesc}>{bone.desc}</Text>
                <Text style={styles.subLabel}>Ideal Characteristics:</Text>
                {bone.ideal.map((item, i) => (
                  <View key={i} style={styles.pointRow}>
                    <Ionicons name="checkmark" size={14} color="#00e676" />
                    <Text style={styles.pointText}>{item}</Text>
                  </View>
                ))}
                <Text style={[styles.subLabel, { marginTop: 10 }]}>Optimization Methods:</Text>
                {bone.optimize.map((item, i) => (
                  <View key={i} style={styles.pointRow}>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
                    <Text style={styles.pointText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Ratios */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Golden Ratios</Text>
        {RATIOS.map((ratio, idx) => (
          <View key={idx} style={styles.ratioCard}>
            <Text style={styles.ratioName}>{ratio.name}</Text>
            <Text style={styles.ratioIdeal}>{ratio.ideal}</Text>
            <View style={styles.ratioImpactRow}>
              <Ionicons name="analytics-outline" size={12} color={COLORS.accent} />
              <Text style={styles.ratioImpact}>{ratio.impact}</Text>
            </View>
          </View>
        ))}

        {/* Softmaxxing */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Non-Surgical Optimization</Text>
        <Text style={styles.sectionSubtitle}>Maximize your existing bone structure without surgery</Text>
        {SOFTMAXXING.map((s, idx) => (
          <View key={idx} style={styles.softCard}>
            <View style={styles.softHeader}>
              <Text style={styles.softMethod}>{s.method}</Text>
              <View style={styles.softTarget}>
                <Text style={styles.softTargetText}>{s.target}</Text>
              </View>
            </View>
            <Text style={styles.softEffect}>{s.effect}</Text>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Difficulty:</Text>
              <Text style={[styles.diffValue, { color: s.difficulty === 'Easy' ? '#00e676' : '#ffab40' }]}>{s.difficulty}</Text>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.accent} />
          <Text style={styles.disclaimerText}>
            Surgical procedures mentioned are for educational purposes only. Always consult qualified maxillofacial surgeons. Focus on softmaxxing first — most people never need surgery.
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, marginTop: -6 },
  boneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  boneCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  boneIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  boneInfo: { flex: 1 },
  boneName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  impactText: { fontSize: 10, fontWeight: '700' },
  boneExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  boneDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  subLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  pointText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  ratioCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  ratioName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  ratioIdeal: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  ratioImpactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratioImpact: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  softCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  softHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  softMethod: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  softTarget: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  softTargetText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
  softEffect: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  diffRow: { flexDirection: 'row', gap: 4 },
  diffLabel: { fontSize: 11, color: COLORS.textMuted },
  diffValue: { fontSize: 11, fontWeight: '700' },
  disclaimerCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(0,102,255,0.08)', borderRadius: 14, padding: 14, marginTop: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(0,102,255,0.2)' },
  disclaimerText: { flex: 1, fontSize: 13, color: COLORS.accentLight, lineHeight: 19 },
});

export default BoneStructureGuideScreen;
