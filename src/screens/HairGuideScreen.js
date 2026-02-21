import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const FACE_SHAPES = [
  {
    shape: 'Oval',
    icon: 'ellipse-outline',
    color: '#0066ff',
    best: ['Side part', 'Textured quiff', 'Pompadour', 'Most styles work'],
    avoid: ['Heavy bangs that shorten face'],
    tip: 'You have the most versatile face shape. Experiment freely.',
  },
  {
    shape: 'Round',
    icon: 'radio-button-off-outline',
    color: '#ff6b35',
    best: ['Height on top (pompadour, faux hawk)', 'Angular side parts', 'Fade on sides'],
    avoid: ['Full fringe', 'Curtain bangs', 'Bowl cuts'],
    tip: 'Create vertical height and keep sides short to elongate your face.',
  },
  {
    shape: 'Square',
    icon: 'square-outline',
    color: '#00e676',
    best: ['Short textured crop', 'Classic side part', 'Buzz cut', 'Short quiff'],
    avoid: ['Long straight styles that emphasize angular jaw'],
    tip: 'Your strong jawline is an asset. Keep styles clean and structured.',
  },
  {
    shape: 'Oblong',
    icon: 'tablet-portrait-outline',
    color: '#00e5ff',
    best: ['Fringe/bangs to shorten face', 'Side-swept styles', 'Medium length layers'],
    avoid: ['Excessive height on top', 'Slicked back styles'],
    tip: 'Add width at the sides and avoid too much height on top.',
  },
  {
    shape: 'Heart',
    icon: 'heart-outline',
    color: '#ff6090',
    best: ['Side-swept fringe', 'Medium length with texture', 'Chin-length styles'],
    avoid: ['Slicked back (emphasizes wide forehead)', 'Very short buzz cuts'],
    tip: 'Balance your wider forehead with styles that add width at the jaw level.',
  },
  {
    shape: 'Diamond',
    icon: 'diamond-outline',
    color: '#ffab40',
    best: ['Textured fringe', 'Side parts with volume', 'Medium length layers'],
    avoid: ['Styles that add width at cheekbones', 'Very short sides'],
    tip: 'Soften your angular cheekbones with textured, layered styles.',
  },
];

const HAIR_CARE = [
  { title: 'Wash Frequency', desc: 'Oily hair: every other day. Normal: 2-3x/week. Dry: 1-2x/week. Over-washing strips natural oils.', icon: 'water-outline', color: '#00e5ff' },
  { title: 'Shampoo Technique', desc: 'Apply to scalp only, not lengths. Massage 60 sec with fingertips (not nails). Rinse thoroughly with lukewarm water.', icon: 'hand-left-outline', color: '#0066ff' },
  { title: 'Conditioner', desc: 'Apply mid-lengths to ends only. Leave 2-3 min. Rinse with cool water to seal cuticles for shine.', icon: 'sparkles-outline', color: '#00e676' },
  { title: 'Towel Drying', desc: 'Never rub vigorously. Gently squeeze and pat with microfiber towel or old t-shirt to prevent frizz and breakage.', icon: 'shirt-outline', color: '#ffab40' },
  { title: 'Heat Protection', desc: 'Always use heat protectant before blow drying. Medium heat, keep dryer 6 inches from hair. Finish with cool shot.', icon: 'flame-outline', color: '#ff6b35' },
  { title: 'Products Order', desc: 'Apply products to damp hair. Pre-styler → blow dry → post-styler. Less is more — start small, add if needed.', icon: 'layers-outline', color: '#4d94ff' },
];

const GROWTH_TIPS = [
  { tip: 'Minoxidil (5%)', desc: 'FDA-approved for hair regrowth. Apply 1ml to scalp 2x daily. Takes 3-6 months for visible results. May cause initial shedding.', tier: 'S-Tier', color: '#ff6b35' },
  { tip: 'Finasteride', desc: 'Prescription DHT blocker. Most effective for male pattern baldness prevention. Consult a dermatologist first.', tier: 'S-Tier', color: '#ff5252' },
  { tip: 'Derma Rolling', desc: '0.5-1.5mm needles on scalp 1x/week. Stimulates collagen and growth factors. Wait 24hr before applying minoxidil.', tier: 'A-Tier', color: '#0066ff' },
  { tip: 'Biotin Supplement', desc: '5000-10000mcg daily. Supports keratin production. Results in 3+ months. Get blood work first.', tier: 'B-Tier', color: '#00e676' },
  { tip: 'Scalp Massage', desc: '5-10 min daily with fingertips. Increases blood flow to follicles. Can use rosemary oil for additional benefit.', tier: 'A-Tier', color: '#00e5ff' },
  { tip: 'Protein & Nutrition', desc: 'Hair is 95% keratin (protein). Eat: eggs, salmon, nuts, spinach, sweet potatoes. Deficiencies cause hair loss.', tier: 'A-Tier', color: '#ffab40' },
  { tip: 'Rosemary Oil', desc: 'Studies show comparable to minoxidil 2%. Mix 3-5 drops with carrier oil, massage into scalp, leave 30+ min.', tier: 'B-Tier', color: '#1de9b6' },
];

const PRODUCTS_BY_TYPE = [
  { type: 'Clay', hold: 'High', shine: 'Matte', best: 'Textured, messy styles', hair: 'Thick/medium' },
  { type: 'Pomade', hold: 'Medium-High', shine: 'High', best: 'Slick backs, side parts', hair: 'All types' },
  { type: 'Wax', hold: 'Medium', shine: 'Natural', best: 'Everyday styling', hair: 'All types' },
  { type: 'Paste', hold: 'Medium', shine: 'Matte-Natural', best: 'Textured, natural look', hair: 'Fine/medium' },
  { type: 'Sea Salt Spray', hold: 'Light', shine: 'Matte', best: 'Beach texture, volume', hair: 'Fine/straight' },
  { type: 'Mousse', hold: 'Light-Medium', shine: 'Natural', best: 'Volume, curly hair', hair: 'Fine/curly' },
];

const HairGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedShape, setExpandedShape] = useState(-1);

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
          <Text style={styles.headerTitle}>Hair Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(255,96,144,0.15)', 'rgba(255,96,144,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(255,96,144,0.2)' }]}>
              <Ionicons name="cut-outline" size={32} color="#ff6090" />
            </View>
            <Text style={styles.heroTitle}>Hair Optimization</Text>
            <Text style={styles.heroSubtitle}>Styles for your face shape, care routines, growth strategies, and product guide</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#ff6090" /><Text style={styles.metaText}>11 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="people-outline" size={12} color="#ff6090" /><Text style={styles.metaText}>All Levels</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Styles by Face Shape */}
        <Text style={styles.sectionTitle}>Styles by Face Shape</Text>
        {FACE_SHAPES.map((fs, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.shapeCard, expandedShape === idx && styles.shapeCardActive]}
              onPress={() => setExpandedShape(expandedShape === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.shapeIcon, { backgroundColor: fs.color + '18' }]}>
                <Ionicons name={fs.icon} size={20} color={fs.color} />
              </View>
              <Text style={styles.shapeName}>{fs.shape}</Text>
              <Ionicons name={expandedShape === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedShape === idx && (
              <View style={styles.shapeExpanded}>
                <Text style={styles.shapeTip}>{fs.tip}</Text>
                <Text style={styles.subLabel}>Best Styles:</Text>
                {fs.best.map((s, si) => (
                  <View key={si} style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#00e676" />
                    <Text style={styles.checkText}>{s}</Text>
                  </View>
                ))}
                <Text style={[styles.subLabel, { marginTop: 8 }]}>Avoid:</Text>
                {fs.avoid.map((a, ai) => (
                  <View key={ai} style={styles.checkRow}>
                    <Ionicons name="close-circle" size={14} color="#ff5252" />
                    <Text style={styles.checkText}>{a}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Hair Care */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Care Routine</Text>
        {HAIR_CARE.map((item, idx) => (
          <View key={idx} style={styles.careCard}>
            <View style={[styles.careIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <View style={styles.careContent}>
              <Text style={styles.careTitle}>{item.title}</Text>
              <Text style={styles.careDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {/* Growth */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Hair Growth & Restoration</Text>
        {GROWTH_TIPS.map((g, idx) => (
          <View key={idx} style={styles.growthCard}>
            <View style={styles.growthHeader}>
              <Text style={styles.growthName}>{g.tip}</Text>
              <View style={[styles.tierBadge, { backgroundColor: g.color + '20' }]}>
                <Text style={[styles.tierText, { color: g.color }]}>{g.tier}</Text>
              </View>
            </View>
            <Text style={styles.growthDesc}>{g.desc}</Text>
          </View>
        ))}

        {/* Product Guide */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Styling Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
          {PRODUCTS_BY_TYPE.map((p, idx) => (
            <View key={idx} style={styles.productCard}>
              <Text style={styles.productType}>{p.type}</Text>
              <View style={styles.productRow}>
                <Text style={styles.productLabel}>Hold</Text>
                <Text style={styles.productValue}>{p.hold}</Text>
              </View>
              <View style={styles.productRow}>
                <Text style={styles.productLabel}>Shine</Text>
                <Text style={styles.productValue}>{p.shine}</Text>
              </View>
              <View style={styles.productRow}>
                <Text style={styles.productLabel}>Best For</Text>
                <Text style={styles.productValue}>{p.best}</Text>
              </View>
              <View style={[styles.productRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.productLabel}>Hair</Text>
                <Text style={styles.productValue}>{p.hair}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

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
  shapeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  shapeCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  shapeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  shapeName: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  shapeExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  shapeTip: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 10 },
  subLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  checkText: { fontSize: 13, color: COLORS.textSecondary },
  careCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  careIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  careContent: { flex: 1 },
  careTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  careDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  growthCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  growthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  growthName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tierText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  growthDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  productScroll: { marginBottom: 10 },
  productCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginRight: 10, width: 180, borderWidth: 1, borderColor: COLORS.border },
  productType: { fontSize: 16, fontWeight: '800', color: COLORS.accent, marginBottom: 10, textAlign: 'center' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  productLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  productValue: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500', flex: 1, textAlign: 'right' },
});

export default HairGuideScreen;
