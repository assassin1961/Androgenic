import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Dimensions, ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';

const { width } = Dimensions.get('window');

const GOLD = COLORS.accent;
const GOLD_LIGHT = COLORS.accentLight;
const CARD_BG = COLORS.bgCard;
const CARD_BORDER = COLORS.border;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textTertiary;

// ─── Face Shape Data ───────────────────────────────────────────────
const FACE_SHAPE_DATA = {
  Oval: {
    icon: 'ellipse-outline',
    description: 'Best suited for: textured crops, side parts, medium length styles',
    shapePoints: { width: 70, height: 95, borderRadius: 45 },
    hairstyles: [
      {
        name: 'Textured Crop',
        match: 97,
        description: 'A short, choppy cut that adds movement and works perfectly with your balanced proportions.',
        difficulty: 'Easy',
        steps: ['Apply matte clay to towel-dried hair', 'Use fingers to push hair forward', 'Pinch ends for texture and separation'],
        products: ['Matte clay', 'Sea salt spray'],
      },
      {
        name: 'Quiff',
        match: 95,
        description: 'Volume on top swept back or to the side. Oval faces carry this classic look effortlessly.',
        difficulty: 'Medium',
        steps: ['Blow dry hair upward at the roots', 'Apply pomade and sweep back', 'Use a comb for clean side definition'],
        products: ['Medium-hold pomade', 'Blow dryer', 'Volumizing spray'],
      },
      {
        name: 'Side Part',
        match: 93,
        description: 'A timeless gentleman\'s cut. The natural symmetry of an oval face makes this look sharp.',
        difficulty: 'Easy',
        steps: ['Find your natural parting line', 'Comb hair to one side while damp', 'Set with light-hold product'],
        products: ['Light pomade', 'Fine-tooth comb'],
      },
      {
        name: 'Buzz Cut',
        match: 90,
        description: 'Low maintenance and clean. Oval faces have the bone structure to pull off minimal hair.',
        difficulty: 'Easy',
        steps: ['Use a #2 or #3 guard all over', 'Fade the sides slightly shorter', 'Moisturize scalp daily'],
        products: ['Scalp moisturizer', 'SPF for scalp'],
      },
      {
        name: 'Slick Back',
        match: 88,
        description: 'A polished, high-confidence style. The balanced oval shape keeps proportions in check.',
        difficulty: 'Medium',
        steps: ['Apply gel or pomade to damp hair', 'Comb straight back from forehead', 'Blow dry on low heat to set'],
        products: ['High-shine pomade', 'Strong-hold gel'],
      },
      {
        name: 'Medium Length',
        match: 85,
        description: 'Versatile length that frames your face. Great for experimenting with different textures.',
        difficulty: 'Advanced',
        steps: ['Air dry or diffuse for natural movement', 'Apply cream from mid-length to ends', 'Tuck behind ears or style freely'],
        products: ['Leave-in conditioner', 'Styling cream', 'Hair oil'],
      },
    ],
  },
  Round: {
    icon: 'radio-button-off-outline',
    description: 'Best suited for: pompadours, faux hawks, high fades that add height',
    shapePoints: { width: 85, height: 85, borderRadius: 42 },
    hairstyles: [
      {
        name: 'Pompadour',
        match: 96,
        description: 'Height on top elongates a round face, creating the illusion of a more angular structure.',
        difficulty: 'Advanced',
        steps: ['Blow dry hair upward from roots', 'Apply strong-hold pomade', 'Shape the volume with a round brush'],
        products: ['Strong-hold pomade', 'Round brush', 'Blow dryer'],
      },
      {
        name: 'Faux Hawk',
        match: 94,
        description: 'A modern edgy look that draws the eye upward and slims the face considerably.',
        difficulty: 'Medium',
        steps: ['Apply gel to damp hair', 'Push hair toward the center', 'Pinch upward for height and definition'],
        products: ['Strong-hold gel', 'Matte paste'],
      },
      {
        name: 'Side Part Undercut',
        match: 92,
        description: 'The tight sides and defined part create strong angles that counterbalance roundness.',
        difficulty: 'Medium',
        steps: ['Get sides buzzed to a #1 or #2', 'Part hair sharply on one side', 'Style top with pomade for sleekness'],
        products: ['Medium pomade', 'Fine-tooth comb'],
      },
      {
        name: 'Spiky',
        match: 89,
        description: 'Upward spikes add vertical dimension and give an energetic, youthful appearance.',
        difficulty: 'Easy',
        steps: ['Towel dry hair until slightly damp', 'Apply wax and spike upward', 'Set with light hairspray'],
        products: ['Hair wax', 'Light hairspray'],
      },
      {
        name: 'Angular Fringe',
        match: 87,
        description: 'An angled fringe across the forehead creates diagonal lines that slim the face.',
        difficulty: 'Medium',
        steps: ['Blow dry fringe to one side', 'Use paste for piece-y texture', 'Keep sides short for contrast'],
        products: ['Texturizing paste', 'Blow dryer'],
      },
      {
        name: 'High Fade',
        match: 85,
        description: 'Removes bulk at the sides, instantly making the face appear longer and leaner.',
        difficulty: 'Easy',
        steps: ['Ask barber for a high skin fade', 'Keep 2-3 inches on top', 'Style top with light product'],
        products: ['Light-hold cream', 'Barber visits every 2 weeks'],
      },
    ],
  },
  Square: {
    icon: 'square-outline',
    description: 'Best suited for: crew cuts, short textured styles, classic side parts',
    shapePoints: { width: 80, height: 85, borderRadius: 12 },
    hairstyles: [
      {
        name: 'Crew Cut',
        match: 96,
        description: 'A clean, masculine cut that complements your strong jawline and angular features.',
        difficulty: 'Easy',
        steps: ['Shorter on the sides, slightly longer on top', 'Style forward with fingers', 'Apply light product for texture'],
        products: ['Matte paste', 'Light styling cream'],
      },
      {
        name: 'Short Textured',
        match: 94,
        description: 'Adds movement to the top while the square jaw does the heavy lifting for structure.',
        difficulty: 'Easy',
        steps: ['Rub clay between palms to warm', 'Work through hair in random directions', 'Pull up and pinch for peaks'],
        products: ['Matte clay', 'Dry shampoo'],
      },
      {
        name: 'Side Part Classic',
        match: 92,
        description: 'The ultimate power look. Your defined jawline pairs perfectly with this sharp style.',
        difficulty: 'Easy',
        steps: ['Part hair on your dominant side', 'Comb neatly into place', 'Finish with a light pomade'],
        products: ['Light pomade', 'Classic comb'],
      },
      {
        name: 'Ivy League',
        match: 90,
        description: 'A slightly longer crew cut with enough length to part. Refined and effortlessly cool.',
        difficulty: 'Medium',
        steps: ['Keep top 1-2 inches long', 'Part to one side naturally', 'Set with light cream for a natural finish'],
        products: ['Styling cream', 'Boar bristle brush'],
      },
      {
        name: 'Flat Top',
        match: 87,
        description: 'A bold geometric cut that echoes your square features for a powerful, defined look.',
        difficulty: 'Advanced',
        steps: ['Requires skilled barber for flat shape', 'Use gel to keep hair standing', 'Maintain with regular trims'],
        products: ['Strong-hold gel', 'Pick comb'],
      },
      {
        name: 'Brush Up',
        match: 85,
        description: 'Hair brushed upward from the forehead. The vertical lift softens strong angles slightly.',
        difficulty: 'Medium',
        steps: ['Blow dry hair upward', 'Apply strong paste for hold', 'Push hair back and slightly up'],
        products: ['Strong-hold paste', 'Blow dryer'],
      },
    ],
  },
  Heart: {
    icon: 'heart-outline',
    description: 'Best suited for: fringes, medium textured, side sweeps that balance the forehead',
    shapePoints: { width: 80, height: 90, borderRadius: 40 },
    hairstyles: [
      {
        name: 'Fringe Forward',
        match: 96,
        description: 'Covers the wider forehead and draws attention to your defined cheekbones and chin.',
        difficulty: 'Easy',
        steps: ['Let hair fall naturally over forehead', 'Apply texturizing spray', 'Use fingers to separate pieces'],
        products: ['Texturizing spray', 'Light cream'],
      },
      {
        name: 'Medium Textured',
        match: 94,
        description: 'Medium length with texture adds width around the jaw, balancing the wider forehead.',
        difficulty: 'Medium',
        steps: ['Air dry or diffuse hair', 'Apply styling cream from roots to tips', 'Scrunch for natural wave and body'],
        products: ['Styling cream', 'Diffuser attachment', 'Sea salt spray'],
      },
      {
        name: 'Side Sweep',
        match: 91,
        description: 'Sweeping hair across the forehead creates a diagonal that minimizes width up top.',
        difficulty: 'Easy',
        steps: ['Blow dry hair to one side', 'Use light pomade for direction', 'Tuck one side behind the ear'],
        products: ['Light pomade', 'Wide-tooth comb'],
      },
      {
        name: 'Messy Top',
        match: 89,
        description: 'Controlled chaos on top adds fullness where you need it and looks effortlessly cool.',
        difficulty: 'Easy',
        steps: ['Towel dry and apply clay', 'Tousle with fingers randomly', 'Pull up slightly at the crown'],
        products: ['Matte clay', 'Dry shampoo'],
      },
      {
        name: 'Curtain Bangs',
        match: 87,
        description: 'Parted down the middle, these frame the face beautifully and soften a pointed chin.',
        difficulty: 'Medium',
        steps: ['Part hair in the center', 'Blow dry each side outward', 'Apply light cream for flow'],
        products: ['Blow dryer', 'Styling cream', 'Round brush'],
      },
      {
        name: 'Layered',
        match: 84,
        description: 'Layers add dimension and movement throughout, creating a balanced, natural silhouette.',
        difficulty: 'Advanced',
        steps: ['Ask stylist for face-framing layers', 'Use mousse for body and hold', 'Diffuse or air dry for best results'],
        products: ['Volumizing mousse', 'Leave-in conditioner'],
      },
    ],
  },
  Oblong: {
    icon: 'tablet-portrait-outline',
    description: 'Best suited for: full fringes, waves, chin-length cuts that add width',
    shapePoints: { width: 65, height: 100, borderRadius: 32 },
    hairstyles: [
      {
        name: 'Full Fringe',
        match: 97,
        description: 'A thick fringe shortens the apparent length of your face for perfect proportions.',
        difficulty: 'Easy',
        steps: ['Grow out the front to eyebrow length', 'Blow dry fringe downward', 'Apply light product to keep flat'],
        products: ['Light-hold cream', 'Flat brush'],
      },
      {
        name: 'Side Part Volume',
        match: 93,
        description: 'Volume on the sides adds horizontal width, breaking up the length of the face.',
        difficulty: 'Medium',
        steps: ['Part to one side', 'Blow dry sides outward for volume', 'Use volumizing product at roots'],
        products: ['Volumizing spray', 'Round brush', 'Blow dryer'],
      },
      {
        name: 'Waves',
        match: 91,
        description: 'Natural or styled waves add width and movement, perfectly balancing face length.',
        difficulty: 'Medium',
        steps: ['Apply sea salt spray to damp hair', 'Scrunch hair while drying', 'Use diffuser for defined waves'],
        products: ['Sea salt spray', 'Diffuser', 'Curl cream'],
      },
      {
        name: 'Chin-Length',
        match: 89,
        description: 'Hair that hits at the chin creates a horizontal line that visually shortens the face.',
        difficulty: 'Advanced',
        steps: ['Grow hair to chin length evenly', 'Use a styling cream for shape', 'Tuck behind ears for variation'],
        products: ['Styling cream', 'Hair oil', 'Wide-tooth comb'],
      },
      {
        name: 'Textured Bangs',
        match: 86,
        description: 'Piece-y bangs with texture cover the forehead without looking heavy or flat.',
        difficulty: 'Easy',
        steps: ['Cut bangs to mid-forehead', 'Apply dry texture spray', 'Separate with fingers for a piece-y look'],
        products: ['Texture spray', 'Matte paste'],
      },
      {
        name: 'Layered Crop',
        match: 84,
        description: 'A layered short cut adds volume on the sides, creating the appearance of more width.',
        difficulty: 'Medium',
        steps: ['Ask for layers throughout, longer on sides', 'Blow dry with round brush for lift', 'Use paste for separation'],
        products: ['Matte paste', 'Round brush', 'Blow dryer'],
      },
    ],
  },
  Diamond: {
    icon: 'diamond-outline',
    description: 'Best suited for: fringe styles, side parts, textured tops that add forehead width',
    shapePoints: { width: 75, height: 92, borderRadius: 37 },
    hairstyles: [
      {
        name: 'Fringe Styles',
        match: 95,
        description: 'A fringe adds width to the forehead, balancing your prominent cheekbones beautifully.',
        difficulty: 'Easy',
        steps: ['Grow out front to desired length', 'Style forward and to one side', 'Use light product for hold'],
        products: ['Light-hold paste', 'Texturizing spray'],
      },
      {
        name: 'Side Part',
        match: 93,
        description: 'A deep side part adds asymmetric volume that complements diamond proportions.',
        difficulty: 'Easy',
        steps: ['Create a deep part on one side', 'Comb larger section across', 'Set with light pomade'],
        products: ['Light pomade', 'Fine-tooth comb'],
      },
      {
        name: 'Textured Top',
        match: 91,
        description: 'Texture on top with shorter sides draws attention upward past the widest cheekbones.',
        difficulty: 'Medium',
        steps: ['Keep sides at a medium fade', 'Apply clay to top section', 'Create messy, upward texture'],
        products: ['Matte clay', 'Sea salt spray'],
      },
      {
        name: 'Medium Length Swept',
        match: 88,
        description: 'Medium-length hair swept back softens the angular cheekbones with flowing lines.',
        difficulty: 'Medium',
        steps: ['Grow top to 4-5 inches', 'Blow dry backward with volume', 'Apply styling cream to hold shape'],
        products: ['Styling cream', 'Blow dryer', 'Round brush'],
      },
      {
        name: 'Chin Length',
        match: 86,
        description: 'Longer hair that hits the chin adds width at the jawline for a balanced look.',
        difficulty: 'Advanced',
        steps: ['Grow to chin length', 'Use conditioner for smooth texture', 'Style with oil for shine and weight'],
        products: ['Argan oil', 'Leave-in conditioner', 'Wide-tooth comb'],
      },
      {
        name: 'Tousled',
        match: 83,
        description: 'Casual, lived-in texture adds volume everywhere, creating a relaxed balanced silhouette.',
        difficulty: 'Easy',
        steps: ['Apply sea salt spray to damp hair', 'Scrunch and tousle with fingers', 'Let air dry for natural finish'],
        products: ['Sea salt spray', 'Matte paste'],
      },
    ],
  },
};

const STYLE_TIPS = [
  { icon: 'cut-outline', tip: 'Match your haircut to your jawline' },
  { icon: 'water-outline', tip: 'Use product that matches your hair texture' },
  { icon: 'calendar-outline', tip: 'Visit your barber every 3-4 weeks' },
  { icon: 'flame-outline', tip: 'Blow dry for volume and control' },
  { icon: 'walk-outline', tip: 'Consider your lifestyle when choosing length' },
];

const DIFFICULTY_COLORS = {
  Easy: COLORS.scoreExcellent,
  Medium: COLORS.scoreAverage,
  Advanced: COLORS.scoreBelow,
};

// ─── Face Shape Illustration Component ─────────────────────────────
const FaceShapeIllustration = ({ shape }) => {
  const data = FACE_SHAPE_DATA[shape];
  const dims = data?.shapePoints || { width: 70, height: 90, borderRadius: 40 };

  return (
    <View style={faceStyles.illustrationContainer}>
      <View style={faceStyles.outerGlow}>
        <View
          style={[
            faceStyles.shapeView,
            {
              width: dims.width,
              height: dims.height,
              borderRadius: dims.borderRadius,
            },
          ]}
        >
          <View style={faceStyles.eyeRow}>
            <View style={faceStyles.eye} />
            <View style={faceStyles.eye} />
          </View>
          <View style={faceStyles.nose} />
          <View style={faceStyles.mouth} />
        </View>
      </View>
    </View>
  );
};

const faceStyles = StyleSheet.create({
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  outerGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,175,55,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  shapeView: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.04)',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
    marginTop: -4,
  },
  eye: {
    width: 8,
    height: 5,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  nose: {
    width: 3,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(212,175,55,0.5)',
    marginBottom: 6,
  },
  mouth: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(212,175,55,0.4)',
  },
});

// ─── Hairstyle Card Component ──────────────────────────────────────
const HairstyleCard = ({ hairstyle, index }) => {
  const [expanded, setExpanded] = useState(false);

  const matchColor =
    hairstyle.match >= 90 ? COLORS.scoreExcellent :
    hairstyle.match >= 80 ? COLORS.scoreGood :
    COLORS.scoreAverage;

  const toggleExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100 + index * 60)}>
      <View style={styles.hairstyleCard}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hairstyleName}>{hairstyle.name}</Text>
            <View style={styles.matchRow}>
              <View style={[styles.matchDot, { backgroundColor: matchColor }]} />
              <Text style={[styles.matchText, { color: matchColor }]}>
                {hairstyle.match}% match
              </Text>
            </View>
          </View>
          <View style={[styles.difficultyBadge, { borderColor: DIFFICULTY_COLORS[hairstyle.difficulty] + '60' }]}>
            <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[hairstyle.difficulty] }]}>
              {hairstyle.difficulty}
            </Text>
          </View>
        </View>

        {/* Match bar */}
        <View style={styles.matchBarBg}>
          <View style={[styles.matchBarFill, { width: `${hairstyle.match}%`, backgroundColor: matchColor }]} />
        </View>

        {/* Description */}
        <Text style={styles.cardDescription}>{hairstyle.description}</Text>

        {/* Products needed */}
        <View style={styles.productsRow}>
          <Ionicons name="flask-outline" size={13} color={TEXT_MUTED} />
          <Text style={styles.productsText}>{hairstyle.products.join(', ')}</Text>
        </View>

        {/* Expandable styling steps */}
        <TouchableOpacity
          onPress={toggleExpand}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <Ionicons name="cut-outline" size={14} color={GOLD} />
          <Text style={styles.expandButtonText}>How to style</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={GOLD}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.stepsContainer}>
            {hairstyle.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────
const HairstyleScreen = ({ navigation, route }) => {
  const faceShape = route?.params?.faceShape || 'Oval';
  const shapeData = FACE_SHAPE_DATA[faceShape] || FACE_SHAPE_DATA.Oval;

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handlePaywall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Paywall');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hairstyle Lab</Text>
        <View style={styles.proBadge}>
          <Ionicons name="diamond" size={10} color={GOLD} />
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ── Face Shape Card ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(0)}>
          <View style={styles.faceShapeCard}>
            <FaceShapeIllustration shape={faceShape} />
            <Text style={styles.faceShapeTitle}>Your face shape: {faceShape}</Text>
            <Text style={styles.faceShapeDesc}>{shapeData.description}</Text>
            {/* Face shape selector pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shapePillsRow}
            >
              {Object.keys(FACE_SHAPE_DATA).map((shape) => (
                <TouchableOpacity
                  key={shape}
                  style={[
                    styles.shapePill,
                    faceShape === shape && styles.shapePillActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.setParams({ faceShape: shape });
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.shapePillText,
                      faceShape === shape && styles.shapePillTextActive,
                    ]}
                  >
                    {shape}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* ── Recommended Hairstyles ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={18} color={GOLD} />
            <Text style={styles.sectionTitle}>Recommended Hairstyles</Text>
          </View>
        </Animated.View>

        {shapeData.hairstyles.map((hairstyle, index) => (
          <HairstyleCard key={hairstyle.name} hairstyle={hairstyle} index={index} />
        ))}

        {/* ── Style Tips Section ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={18} color={GOLD} />
            <Text style={styles.sectionTitle}>Style Tips</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(550)}>
          <View style={styles.tipsCard}>
            {STYLE_TIPS.map((item, i) => (
              <View key={i} style={[styles.tipRow, i < STYLE_TIPS.length - 1 && styles.tipRowBorder]}>
                <View style={styles.tipIconCircle}>
                  <Ionicons name={item.icon} size={16} color={GOLD} />
                </View>
                <Text style={styles.tipText}>{item.tip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── CTA Button ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(650)}>
          <TouchableOpacity onPress={handlePaywall} activeOpacity={0.85} style={styles.ctaWrapper}>
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Ionicons name="diamond" size={18} color="#000" />
              <Text style={styles.ctaText}>Get PRO for personalized AI hair analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
  },

  // Face Shape Card
  faceShapeCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  faceShapeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  faceShapeDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  shapePillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  shapePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  shapePillActive: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderColor: COLORS.borderAccent,
  },
  shapePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  shapePillTextActive: {
    color: GOLD,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },

  // Hairstyle Cards
  hairstyleCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hairstyleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  matchBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 19,
    marginBottom: 12,
  },
  productsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
  },
  productsText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
    flex: 1,
  },

  // Expand Button
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: GOLD,
    flex: 1,
  },

  // Steps
  stepsContainer: {
    marginTop: 8,
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },

  // Style Tips
  tipsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 4,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  tipRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    lineHeight: 18,
  },

  // CTA
  ctaWrapper: {
    marginTop: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.3,
  },
});

export default HairstyleScreen;
