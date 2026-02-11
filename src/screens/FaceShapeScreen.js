import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { COLORS, GRADIENTS } from '../utils/theme';

const FACE_SHAPES = {
  oval: {
    name: 'Oval',
    description: 'Balanced proportions with a gently rounded jawline. Considered the most versatile face shape.',
    strengths: ['Most hairstyles work', 'Naturally balanced proportions', 'Ages well'],
    tips: ['Almost any hairstyle works for you', 'Avoid adding too much volume at the sides', 'Experiment with different beard styles'],
    celebrities: ['Brad Pitt', 'Ryan Gosling', 'Henry Cavill'],
    svg: 'M50,15 C70,15 85,30 88,50 C90,70 80,88 65,92 C55,95 45,95 35,92 C20,88 10,70 12,50 C15,30 30,15 50,15',
  },
  square: {
    name: 'Square',
    description: 'Strong jawline with equal width forehead and jaw. Projects power and masculinity.',
    strengths: ['Strong masculine appearance', 'Great jawline definition', 'Photographs well from angles'],
    tips: ['Textured hairstyles add balance', 'Keep sideburns trimmed to avoid widening', 'Slight stubble enhances the angular look'],
    celebrities: ['Matt Bomer', 'David Beckham', 'Nick Bateman'],
    svg: 'M20,15 L80,15 C85,15 88,18 88,23 L88,75 C88,82 80,92 65,92 C55,95 45,95 35,92 C20,92 12,82 12,75 L12,23 C12,18 15,15 20,15',
  },
  round: {
    name: 'Round',
    description: 'Soft angles with similar width and length. Full cheeks and curved jawline.',
    strengths: ['Youthful appearance', 'Approachable look', 'Softens with age gracefully'],
    tips: ['Add height on top with your hairstyle', 'A beard can add definition to the jawline', 'Mewing and chewing exercises help define the jaw'],
    celebrities: ['Leonardo DiCaprio', 'Elijah Wood', 'Jack Black'],
    svg: 'M50,12 C75,12 90,25 90,50 C90,75 75,92 50,92 C25,92 10,75 10,50 C10,25 25,12 50,12',
  },
  oblong: {
    name: 'Oblong',
    description: 'Longer than wide with a strong forehead and elongated cheeks. Distinguished look.',
    strengths: ['Suits structured hairstyles', 'Model-tier proportions when lean', 'Ages into sharper features'],
    tips: ['Add width with side-swept hairstyles', 'Avoid very long hair on top', 'Facial hair adds width and balance'],
    celebrities: ['Adam Driver', 'Ben Affleck', 'Keanu Reeves'],
    svg: 'M50,8 C68,8 82,22 85,40 C87,55 87,65 85,75 C80,88 65,95 50,95 C35,95 20,88 15,75 C13,65 13,55 15,40 C18,22 32,8 50,8',
  },
  diamond: {
    name: 'Diamond',
    description: 'Wide cheekbones with a narrow forehead and jaw. Striking angular appearance.',
    strengths: ['Eye-catching bone structure', 'Cheekbones are a standout feature', 'Lean face looks extremely defined'],
    tips: ['Hairstyles with volume at the forehead balance proportions', 'Avoid slicked-back styles that emphasize width', 'Light stubble softens the narrow chin'],
    celebrities: ['Johnny Depp', 'Robert Pattinson', 'Cristiano Ronaldo'],
    svg: 'M50,10 C60,10 72,20 82,42 C88,55 85,65 75,80 C65,90 55,95 50,95 C45,95 35,90 25,80 C15,65 12,55 18,42 C28,20 40,10 50,10',
  },
  heart: {
    name: 'Heart',
    description: 'Wider forehead that tapers to a narrower, pointed chin. Expressive and youthful.',
    strengths: ['Expressive upper face', 'Suits creative hairstyles', 'Naturally youthful proportions'],
    tips: ['Side-parted hairstyles balance the forehead', 'A beard helps widen the narrow chin area', 'Avoid heavy bangs that add more forehead width'],
    celebrities: ['Zayn Malik', 'Ryan Reynolds', 'Zac Efron'],
    svg: 'M50,12 C65,12 82,18 88,35 C92,48 85,58 75,72 C65,85 55,95 50,95 C45,95 35,85 25,72 C15,58 8,48 12,35 C18,18 35,12 50,12',
  },
};

const determineFaceShape = (scores) => {
  if (!scores) return 'oval';
  const jaw = scores.jawline || 50;
  const cheek = scores.cheekbones || 50;
  const sym = scores.symmetry || 50;
  const masc = scores.masculinity || 50;

  if (jaw > 70 && masc > 65) return 'square';
  if (cheek > 75 && jaw < 55) return 'diamond';
  if (jaw < 45 && cheek < 50) return 'round';
  if (sym > 75 && jaw > 55 && jaw < 75) return 'oval';
  if (masc > 60 && cheek > 60 && jaw < 60) return 'heart';
  return 'oblong';
};

const FaceShapeScreen = ({ route, navigation }) => {
  const scores = route.params?.scores;
  const detectedShape = determineFaceShape(scores);
  const shapeData = FACE_SHAPES[detectedShape];

  const fadeAnims = useRef(Object.keys(FACE_SHAPES).map(() => new Animated.Value(0))).current;
  const mainScale = useRef(new Animated.Value(0.8)).current;
  const mainOpacity = useRef(new Animated.Value(0)).current;
  const detailsTranslate = useRef(new Animated.Value(30)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mainScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(mainOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(detailsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(detailsTranslate, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    // Stagger the shape grid items
    fadeAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(600 + i * 100),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Shape</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Detected Shape */}
        <Animated.View style={[styles.mainCard, { opacity: mainOpacity, transform: [{ scale: mainScale }] }]}>
          <LinearGradient colors={['rgba(108,92,231,0.15)', 'rgba(108,92,231,0.05)']} style={styles.shapeVisual}>
            <Svg width={120} height={120} viewBox="0 0 100 100">
              <Path d={shapeData.svg} fill="none" stroke={COLORS.accent} strokeWidth={2} />
              {/* Feature dots */}
              <SvgCircle cx="38" cy="38" r="2" fill={COLORS.accentLight} />
              <SvgCircle cx="62" cy="38" r="2" fill={COLORS.accentLight} />
              <SvgCircle cx="50" cy="55" r="1.5" fill={COLORS.accentLight} />
              <SvgCircle cx="50" cy="68" r="1" fill={COLORS.accentLight} />
            </Svg>
          </LinearGradient>
          <Text style={styles.shapeLabel}>YOUR FACE SHAPE</Text>
          <Text style={styles.shapeName}>{shapeData.name}</Text>
          <Text style={styles.shapeDesc}>{shapeData.description}</Text>
        </Animated.View>

        {/* Strengths */}
        <Animated.View style={{ opacity: detailsOpacity, transform: [{ translateY: detailsTranslate }] }}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          {shapeData.strengths.map((str, i) => (
            <View key={i} style={styles.strengthRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.scoreHigh} />
              <Text style={styles.strengthText}>{str}</Text>
            </View>
          ))}

          {/* Style Tips */}
          <Text style={styles.sectionTitle}>Style Tips for {shapeData.name} Face</Text>
          {shapeData.tips.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={styles.tipNum}>
                <Text style={styles.tipNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          {/* Celebrity Matches */}
          <Text style={styles.sectionTitle}>Celebrities with {shapeData.name} Faces</Text>
          <View style={styles.celebRow}>
            {shapeData.celebrities.map((name, i) => (
              <View key={i} style={styles.celebChip}>
                <Ionicons name="star" size={12} color={COLORS.gold} />
                <Text style={styles.celebName}>{name}</Text>
              </View>
            ))}
          </View>

          {/* All Shapes Grid */}
          <Text style={styles.sectionTitle}>All Face Shapes</Text>
          <View style={styles.shapesGrid}>
            {Object.entries(FACE_SHAPES).map(([key, shape], i) => {
              const isDetected = key === detectedShape;
              return (
                <Animated.View key={key} style={{ opacity: fadeAnims[i] }}>
                  <View style={[styles.shapeGridItem, isDetected && styles.shapeGridItemActive]}>
                    <Svg width={50} height={50} viewBox="0 0 100 100">
                      <Path d={shape.svg} fill="none" stroke={isDetected ? COLORS.accent : COLORS.textMuted} strokeWidth={2} />
                    </Svg>
                    <Text style={[styles.shapeGridLabel, isDetected && styles.shapeGridLabelActive]}>
                      {shape.name}
                    </Text>
                    {isDetected && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20 },
  mainCard: { alignItems: 'center', marginBottom: 24 },
  shapeVisual: {
    width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(108,92,231,0.2)',
  },
  shapeLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  shapeName: { color: COLORS.accent, fontSize: 32, fontWeight: '900', marginBottom: 8 },
  shapeDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 10 },
  strengthRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard,
    borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  strengthText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500', flex: 1 },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.bgCard,
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  tipNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  tipNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tipText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, flex: 1 },
  celebRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  celebChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgCard,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.goldDark,
  },
  celebName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  shapesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  shapeGridItem: {
    width: '100%', minWidth: 95, alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border, position: 'relative',
  },
  shapeGridItemActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(108,92,231,0.08)' },
  shapeGridLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  shapeGridLabelActive: { color: COLORS.accent },
  youBadge: {
    position: 'absolute', top: 6, right: 6, backgroundColor: COLORS.accent,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  youBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
});

export default FaceShapeScreen;
