import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, TextInput, FlatList,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const INGREDIENT_DB = {
  retinol: { rating: 'A+', score: 95, category: 'Anti-Aging', desc: 'Gold standard for skin renewal. Boosts collagen, reduces wrinkles, improves texture.', faceImpact: 'Jawline definition, skin tightness, reduced aging', color: '#00e676' },
  niacinamide: { rating: 'A+', score: 92, category: 'Brightening', desc: 'Reduces pores, controls oil, evens skin tone. Great for facial aesthetics.', faceImpact: 'Even skin tone, smaller pores, clearer complexion', color: '#00e676' },
  'hyaluronic acid': { rating: 'A', score: 88, category: 'Hydration', desc: 'Holds 1000x its weight in water. Plumps skin and reduces fine lines.', faceImpact: 'Plumper skin, reduced under-eye hollows, hydrated glow', color: '#00e676' },
  'salicylic acid': { rating: 'A', score: 85, category: 'Exfoliant', desc: 'BHA that unclogs pores and treats acne. Essential for clear skin.', faceImpact: 'Clearer jawline, reduced acne scarring, refined texture', color: '#00e676' },
  'vitamin c': { rating: 'A', score: 90, category: 'Antioxidant', desc: 'Brightens, protects from UV damage, boosts collagen synthesis.', faceImpact: 'Brighter complexion, reduced dark spots, youthful glow', color: '#00e676' },
  'glycolic acid': { rating: 'A-', score: 82, category: 'Exfoliant', desc: 'AHA that resurfaces skin, improving tone and texture over time.', faceImpact: 'Smoother skin texture, reduced scarring, even tone', color: '#00e676' },
  peptides: { rating: 'A', score: 87, category: 'Anti-Aging', desc: 'Signal skin to produce more collagen. Firms and tightens over time.', faceImpact: 'Firmer jawline, tighter skin, reduced sagging', color: '#00e676' },
  ceramides: { rating: 'A-', score: 80, category: 'Barrier', desc: 'Restore skin barrier. Essential for moisture retention and protection.', faceImpact: 'Healthier skin barrier, reduced irritation, smoother texture', color: '#00e676' },
  'azelaic acid': { rating: 'A-', score: 83, category: 'Treatment', desc: 'Targets redness, hyperpigmentation, and mild acne. Gentle yet effective.', faceImpact: 'Reduced redness, even skin tone, clearer complexion', color: '#00e676' },
  'benzoyl peroxide': { rating: 'B+', score: 75, category: 'Acne', desc: 'Kills acne bacteria effectively. Can be drying — use with moisturizer.', faceImpact: 'Clearer skin, reduced breakouts, improved confidence', color: '#ffab40' },
  fragrance: { rating: 'D', score: 25, category: 'Irritant', desc: 'Common irritant and allergen. Offers zero skin benefit. Avoid if possible.', faceImpact: 'Can cause redness, irritation, barrier damage', color: '#ff5252' },
  alcohol: { rating: 'D', score: 20, category: 'Irritant', desc: 'Drying alcohol strips natural oils and damages the skin barrier.', faceImpact: 'Dehydration, accelerated aging, barrier disruption', color: '#ff5252' },
  'mineral oil': { rating: 'C', score: 45, category: 'Occlusive', desc: 'Cheap filler. Not harmful but can clog pores on acne-prone skin.', faceImpact: 'Potential pore clogging, minimal benefit', color: '#ffab40' },
  'sodium lauryl sulfate': { rating: 'D-', score: 15, category: 'Irritant', desc: 'Harsh surfactant that strips skin. Avoid in facial products.', faceImpact: 'Barrier damage, dryness, irritation', color: '#ff5252' },
  zinc: { rating: 'A-', score: 82, category: 'Protection', desc: 'Anti-inflammatory and UV protectant. Great for acne-prone skin.', faceImpact: 'Reduced inflammation, sun protection, clearer skin', color: '#00e676' },
  spf: { rating: 'A+', score: 98, category: 'Protection', desc: 'THE most important skincare ingredient. Prevents 90% of visible aging.', faceImpact: 'Prevents wrinkles, dark spots, maintains youthful appearance', color: '#00e676' },
  'tea tree': { rating: 'B', score: 65, category: 'Natural', desc: 'Natural antibacterial. Mild acne treatment but can irritate sensitive skin.', faceImpact: 'Spot treatment for acne, mild antiseptic', color: '#ffab40' },
  caffeine: { rating: 'B+', score: 72, category: 'Depuffing', desc: 'Reduces puffiness and dark circles. Best used around the eye area.', faceImpact: 'Reduced under-eye bags, less puffiness, brighter eyes', color: '#ffab40' },
  squalane: { rating: 'A-', score: 80, category: 'Hydration', desc: 'Lightweight oil that mimics skin sebum. Non-comedogenic and deeply moisturizing.', faceImpact: 'Balanced hydration, improved texture, natural glow', color: '#00e676' },
  bakuchiol: { rating: 'B+', score: 76, category: 'Anti-Aging', desc: 'Natural retinol alternative. Gentler but still effective for anti-aging.', faceImpact: 'Mild anti-aging, suitable for sensitive skin types', color: '#ffab40' },
};

const POPULAR_PRODUCTS = [
  { name: 'CeraVe Moisturizing Cream', ingredients: ['ceramides', 'hyaluronic acid', 'niacinamide'], avgScore: 87, icon: 'water' },
  { name: 'The Ordinary Niacinamide 10%', ingredients: ['niacinamide', 'zinc'], avgScore: 87, icon: 'flask' },
  { name: 'Paula\'s Choice 2% BHA', ingredients: ['salicylic acid', 'niacinamide'], avgScore: 89, icon: 'sparkles' },
  { name: 'Tretinoin 0.05%', ingredients: ['retinol', 'vitamin c'], avgScore: 93, icon: 'diamond' },
  { name: 'La Roche-Posay SPF 50', ingredients: ['spf', 'niacinamide', 'hyaluronic acid'], avgScore: 93, icon: 'sunny' },
  { name: 'Drunk Elephant C-Firma', ingredients: ['vitamin c', 'vitamin c'], avgScore: 90, icon: 'flash' },
];

const IngredientRow = memo(({ name, data, index }) => (
  <Animated.View entering={FadeInRight.duration(300).delay(index * 60)}>
    <GlassCard variant="default" style={styles.ingredientCard}>
      <View style={styles.ingredientHeader}>
        <View style={[styles.ratingBadge, { backgroundColor: data.color + '20', borderColor: data.color + '40' }]}>
          <Text style={[styles.ratingText, { color: data.color }]}>{data.rating}</Text>
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{name}</Text>
          <Text style={styles.ingredientCategory}>{data.category}</Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color: data.color }]}>{data.score}</Text>
        </View>
      </View>
      <Text style={styles.ingredientDesc}>{data.desc}</Text>
      <View style={styles.faceImpactRow}>
        <Ionicons name="person" size={12} color={COLORS.accent} />
        <Text style={styles.faceImpactText}>{data.faceImpact}</Text>
      </View>
    </GlassCard>
  </Animated.View>
));

const SkincareAnalyzerScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const analyzeIngredients = useCallback((text) => {
    if (!text.trim()) {
      setResults([]);
      setOverallScore(null);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const words = text.toLowerCase().split(/[,;\n]+/).map(w => w.trim()).filter(Boolean);
    const found = [];

    for (const word of words) {
      for (const [key, data] of Object.entries(INGREDIENT_DB)) {
        if (word.includes(key) || key.includes(word)) {
          if (!found.find(f => f.name === key)) {
            found.push({ name: key, ...data });
          }
        }
      }
    }

    setResults(found);
    if (found.length > 0) {
      const avg = Math.round(found.reduce((a, b) => a + b.score, 0) / found.length);
      setOverallScore(avg);
    } else {
      setOverallScore(null);
    }
  }, []);

  const selectProduct = useCallback((product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProduct(product);
    const text = product.ingredients.join(', ');
    setSearchText(text);
    analyzeIngredients(text);
  }, [analyzeIngredients]);

  const getScoreGrade = (score) => {
    if (score >= 85) return { grade: 'Excellent', color: COLORS.scoreHigh, icon: 'checkmark-circle' };
    if (score >= 70) return { grade: 'Good', color: '#ffab40', icon: 'thumbs-up' };
    if (score >= 50) return { grade: 'Okay', color: '#ffab40', icon: 'remove-circle' };
    return { grade: 'Poor', color: COLORS.scoreLow, icon: 'warning' };
  };

  const pro = isPro();

  return (
    <GlassBackground variant="purple">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Skincare Analyzer</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <GlassCard variant="accent" style={styles.heroCard}>
              <LinearGradient colors={['rgba(168,85,247,0.15)', 'rgba(0,102,255,0.10)']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <Ionicons name="flask" size={28} color={COLORS.purple} />
              <Text style={styles.heroTitle}>AI Ingredient Analysis</Text>
              <Text style={styles.heroSub}>Paste your product ingredients or search below to get face-impact ratings</Text>
            </GlassCard>
          </Animated.View>

          {/* Search Input */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <GlassCard variant="default" style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Paste ingredients or search..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchText}
                  onChangeText={(t) => { setSearchText(t); analyzeIngredients(t); }}
                  multiline
                />
              </View>
              {searchText.length > 0 && (
                <AnimatedPressable
                  onPress={() => { setSearchText(''); setResults([]); setOverallScore(null); setSelectedProduct(null); }}
                  style={styles.clearBtn}
                >
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </AnimatedPressable>
              )}
            </GlassCard>
          </Animated.View>

          {/* Overall Score */}
          {overallScore !== null && (
            <Animated.View entering={ZoomIn.duration(300)}>
              <GlassCard variant={overallScore >= 70 ? 'accent' : 'default'} style={styles.overallCard} glow={overallScore >= 85}>
                <View style={styles.overallRow}>
                  <View style={[styles.overallCircle, { borderColor: getScoreGrade(overallScore).color }]}>
                    <Text style={[styles.overallScore, { color: getScoreGrade(overallScore).color }]}>{overallScore}</Text>
                  </View>
                  <View style={styles.overallInfo}>
                    <Text style={styles.overallGrade}>{getScoreGrade(overallScore).grade}</Text>
                    <Text style={styles.overallLabel}>{results.length} ingredients analyzed</Text>
                    {selectedProduct && (
                      <Text style={styles.overallProduct}>{selectedProduct.name}</Text>
                    )}
                  </View>
                  <Ionicons name={getScoreGrade(overallScore).icon} size={24} color={getScoreGrade(overallScore).color} />
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Results */}
          {results.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Ingredient Breakdown</Text>
              {results.map((item, i) => (
                <IngredientRow key={item.name} name={item.name} data={item} index={i} />
              ))}
            </View>
          )}

          {/* Popular Products */}
          {results.length === 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(160)}>
              <Text style={styles.sectionTitle}>Popular Products</Text>
              {POPULAR_PRODUCTS.map((product, i) => (
                <Animated.View key={i} entering={FadeInDown.duration(300).delay(200 + i * 60)}>
                  <AnimatedPressable onPress={() => selectProduct(product)}>
                    <GlassCard variant="default" style={styles.productCard}>
                      <View style={[styles.productIcon, { backgroundColor: COLORS.accent + '15' }]}>
                        <Ionicons name={product.icon} size={18} color={COLORS.accent} />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productIngredients}>{product.ingredients.join(' · ')}</Text>
                      </View>
                      <View style={[styles.productScore, { backgroundColor: getScoreGrade(product.avgScore).color + '20' }]}>
                        <Text style={[styles.productScoreText, { color: getScoreGrade(product.avgScore).color }]}>{product.avgScore}</Text>
                      </View>
                    </GlassCard>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Pro Upsell */}
          {!pro && (
            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <AnimatedPressable onPress={() => navigation.navigate('Paywall')}>
                <LinearGradient colors={GRADIENTS.gold} style={styles.proBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="diamond" size={16} color="#000" />
                  <Text style={styles.proBannerText}>PRO: Scan any barcode for instant analysis</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
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

  heroCard: { padding: 20, alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 10, marginBottom: 4 },
  heroSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },

  searchCard: { padding: 14, marginBottom: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, minHeight: 40, textAlignVertical: 'top' },
  clearBtn: { position: 'absolute', top: 14, right: 14 },

  overallCard: { padding: 16, marginBottom: 16 },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  overallCircle: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overallScore: { fontSize: 20, fontWeight: '900' },
  overallInfo: { flex: 1 },
  overallGrade: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  overallLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  overallProduct: { fontSize: 10, color: COLORS.accent, fontWeight: '600', marginTop: 2 },

  resultsSection: { marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.3 },

  ingredientCard: { padding: 14, marginBottom: 8 },
  ingredientHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  ratingBadge: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  ratingText: { fontSize: 13, fontWeight: '900' },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textTransform: 'capitalize' },
  ingredientCategory: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 1 },
  scoreCircle: { alignItems: 'center' },
  scoreText: { fontSize: 16, fontWeight: '900' },
  ingredientDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 8 },
  faceImpactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,102,255,0.08)', borderRadius: 8, padding: 8 },
  faceImpactText: { fontSize: 11, color: COLORS.accentLight, flex: 1, lineHeight: 15 },

  productCard: { padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  productIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  productIngredients: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textTransform: 'capitalize' },
  productScore: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  productScoreText: { fontSize: 14, fontWeight: '800' },

  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 12 },
  proBannerText: { flex: 1, color: '#000', fontSize: 12, fontWeight: '700' },
});

export default SkincareAnalyzerScreen;
