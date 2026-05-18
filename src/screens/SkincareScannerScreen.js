import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  Dimensions, TextInput, Platform,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn, useSharedValue, useAnimatedProps,
  withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RECENT_SCANS_KEY = 'skincare_scanner_recent';
const MAX_RECENT = 5;

// ─── Ingredient Database (60+ ingredients) ─────────────────────────────

const INGREDIENT_DB = {
  // ── SAFE (green) ──────────────────────────────────────────────────
  'niacinamide': { safety: 'safe', description: 'Brightens skin, reduces pores', category: 'Vitamin' },
  'hyaluronic acid': { safety: 'safe', description: 'Deep hydration, plumps skin', category: 'Moisturizer' },
  'sodium hyaluronate': { safety: 'safe', description: 'Deep hydration, plumps skin', category: 'Moisturizer' },
  'ascorbic acid': { safety: 'safe', description: 'Antioxidant, brightens skin', category: 'Vitamin' },
  'vitamin c': { safety: 'safe', description: 'Antioxidant, brightens skin', category: 'Vitamin' },
  'retinol': { safety: 'safe', description: 'Anti-aging, cell turnover', category: 'Active' },
  'retinal': { safety: 'safe', description: 'Anti-aging, cell turnover', category: 'Active' },
  'retinyl palmitate': { safety: 'safe', description: 'Gentle retinoid, anti-aging', category: 'Active' },
  'salicylic acid': { safety: 'safe', description: 'Unclogs pores, fights acne', category: 'Exfoliant' },
  'glycerin': { safety: 'safe', description: 'Draws moisture to skin', category: 'Humectant' },
  'ceramide np': { safety: 'safe', description: 'Repairs skin barrier', category: 'Moisturizer' },
  'ceramide ap': { safety: 'safe', description: 'Repairs skin barrier', category: 'Moisturizer' },
  'ceramide eop': { safety: 'safe', description: 'Repairs skin barrier', category: 'Moisturizer' },
  'ceramides': { safety: 'safe', description: 'Repairs skin barrier', category: 'Moisturizer' },
  'squalane': { safety: 'safe', description: 'Lightweight moisture', category: 'Emollient' },
  'squalene': { safety: 'safe', description: 'Lightweight moisture', category: 'Emollient' },
  'aloe vera': { safety: 'safe', description: 'Soothing, anti-inflammatory', category: 'Botanical' },
  'aloe barbadensis leaf juice': { safety: 'safe', description: 'Soothing, anti-inflammatory', category: 'Botanical' },
  'green tea extract': { safety: 'safe', description: 'Antioxidant, calming', category: 'Botanical' },
  'camellia sinensis leaf extract': { safety: 'safe', description: 'Antioxidant, calming', category: 'Botanical' },
  'peptides': { safety: 'safe', description: 'Stimulates collagen production', category: 'Anti-aging' },
  'palmitoyl tripeptide-1': { safety: 'safe', description: 'Stimulates collagen production', category: 'Anti-aging' },
  'palmitoyl tetrapeptide-7': { safety: 'safe', description: 'Reduces inflammation, firms skin', category: 'Anti-aging' },
  'acetyl hexapeptide-8': { safety: 'safe', description: 'Reduces fine lines', category: 'Anti-aging' },
  'copper peptides': { safety: 'safe', description: 'Wound healing, anti-aging', category: 'Anti-aging' },
  'zinc oxide': { safety: 'safe', description: 'Physical UV protection', category: 'Sunscreen' },
  'titanium dioxide': { safety: 'safe', description: 'Physical UV protection', category: 'Sunscreen' },
  'panthenol': { safety: 'safe', description: 'Healing, moisturizing', category: 'Vitamin B5' },
  'allantoin': { safety: 'safe', description: 'Soothes and protects', category: 'Skin Protectant' },
  'centella asiatica': { safety: 'safe', description: 'Repairs, calms redness', category: 'Botanical' },
  'madecassoside': { safety: 'safe', description: 'Soothes, promotes healing', category: 'Botanical' },
  'asiaticoside': { safety: 'safe', description: 'Collagen synthesis, healing', category: 'Botanical' },
  'azelaic acid': { safety: 'safe', description: 'Evens tone, fights acne', category: 'Active' },
  'bakuchiol': { safety: 'safe', description: 'Natural retinol alternative', category: 'Botanical' },
  'tocopherol': { safety: 'safe', description: 'Antioxidant, moisturizing', category: 'Vitamin' },
  'vitamin e': { safety: 'safe', description: 'Antioxidant, moisturizing', category: 'Vitamin' },
  'tocopheryl acetate': { safety: 'safe', description: 'Antioxidant, moisturizing', category: 'Vitamin' },
  'jojoba oil': { safety: 'safe', description: 'Balances oil production', category: 'Oil' },
  'simmondsia chinensis seed oil': { safety: 'safe', description: 'Balances oil production', category: 'Oil' },
  'shea butter': { safety: 'safe', description: 'Rich moisturizer, barrier support', category: 'Emollient' },
  'butyrospermum parkii': { safety: 'safe', description: 'Rich moisturizer, barrier support', category: 'Emollient' },
  'dimethicone': { safety: 'safe', description: 'Smooths skin, locks in moisture', category: 'Silicone' },
  'cyclomethicone': { safety: 'safe', description: 'Lightweight silicone, smooth finish', category: 'Silicone' },
  'argan oil': { safety: 'safe', description: 'Nourishing, rich in vitamin E', category: 'Oil' },
  'rosehip oil': { safety: 'safe', description: 'Brightening, scar healing', category: 'Oil' },
  'rosa canina seed oil': { safety: 'safe', description: 'Brightening, scar healing', category: 'Oil' },
  'chamomile extract': { safety: 'safe', description: 'Calming, anti-inflammatory', category: 'Botanical' },
  'bisabolol': { safety: 'safe', description: 'Soothing, anti-irritant', category: 'Botanical' },
  'licorice root extract': { safety: 'safe', description: 'Brightening, anti-inflammatory', category: 'Botanical' },
  'glycyrrhiza glabra root extract': { safety: 'safe', description: 'Brightening, anti-inflammatory', category: 'Botanical' },
  'tranexamic acid': { safety: 'safe', description: 'Reduces hyperpigmentation', category: 'Active' },
  'ferulic acid': { safety: 'safe', description: 'Antioxidant, boosts vitamin C', category: 'Active' },
  'colloidal oatmeal': { safety: 'safe', description: 'Soothes irritated skin', category: 'Skin Protectant' },
  'avena sativa kernel extract': { safety: 'safe', description: 'Soothes irritated skin', category: 'Skin Protectant' },
  'water': { safety: 'safe', description: 'Solvent base', category: 'Base' },
  'aqua': { safety: 'safe', description: 'Solvent base', category: 'Base' },
  'glycolic acid': { safety: 'safe', description: 'AHA exfoliant, improves texture', category: 'Exfoliant' },
  'mandelic acid': { safety: 'safe', description: 'Gentle AHA, evens skin tone', category: 'Exfoliant' },
  'polyhydroxy acid': { safety: 'safe', description: 'Gentle exfoliant, hydrating', category: 'Exfoliant' },
  'gluconolactone': { safety: 'safe', description: 'PHA exfoliant, gentle hydrator', category: 'Exfoliant' },
  'snail mucin': { safety: 'safe', description: 'Healing, deeply hydrating', category: 'Moisturizer' },

  // ── CAUTION (yellow) ──────────────────────────────────────────────
  'benzoyl peroxide': { safety: 'caution', description: 'Fights acne but can dry/irritate', category: 'Acne Treatment' },
  'lactic acid': { safety: 'caution', description: 'Gentle exfoliant, can sensitize', category: 'Exfoliant' },
  'witch hazel': { safety: 'caution', description: 'Astringent, can be drying', category: 'Astringent' },
  'hamamelis virginiana': { safety: 'caution', description: 'Astringent, can be drying', category: 'Astringent' },
  'essential oils': { safety: 'caution', description: 'Can cause irritation/allergic reactions', category: 'Fragrance' },
  'alcohol denat': { safety: 'caution', description: 'Can be drying in high amounts', category: 'Solvent' },
  'denatured alcohol': { safety: 'caution', description: 'Can be drying in high amounts', category: 'Solvent' },
  'sd alcohol': { safety: 'caution', description: 'Can be drying in high amounts', category: 'Solvent' },
  'menthol': { safety: 'caution', description: 'Cooling but potentially irritating', category: 'Sensory' },
  'camphor': { safety: 'caution', description: 'Cooling sensation, can irritate', category: 'Sensory' },
  'citrus extracts': { safety: 'caution', description: 'Photosensitizing, can irritate', category: 'Botanical' },
  'citrus limon peel oil': { safety: 'caution', description: 'Photosensitizing, can irritate', category: 'Essential Oil' },
  'citrus aurantium dulcis peel oil': { safety: 'caution', description: 'Photosensitizing, can irritate', category: 'Essential Oil' },
  'sodium lauryl sulfate': { safety: 'caution', description: 'Effective cleanser but can strip skin', category: 'Surfactant' },
  'sls': { safety: 'caution', description: 'Effective cleanser but can strip skin', category: 'Surfactant' },
  'sodium laureth sulfate': { safety: 'caution', description: 'Milder than SLS but can still irritate', category: 'Surfactant' },
  'sles': { safety: 'caution', description: 'Milder than SLS but can still irritate', category: 'Surfactant' },
  'alpha arbutin': { safety: 'caution', description: 'Brightening, generally safe but patch test', category: 'Active' },
  'kojic acid': { safety: 'caution', description: 'Brightening, can sensitize', category: 'Active' },
  'tea tree oil': { safety: 'caution', description: 'Antibacterial, can irritate sensitive skin', category: 'Essential Oil' },
  'melaleuca alternifolia leaf oil': { safety: 'caution', description: 'Antibacterial, can irritate sensitive skin', category: 'Essential Oil' },
  'eucalyptus oil': { safety: 'caution', description: 'Antibacterial, potential irritant', category: 'Essential Oil' },
  'lavender oil': { safety: 'caution', description: 'Calming scent, possible sensitizer', category: 'Essential Oil' },
  'mineral oil': { safety: 'caution', description: 'Occlusive, may clog pores for some', category: 'Emollient' },
  'paraffinum liquidum': { safety: 'caution', description: 'Occlusive, may clog pores for some', category: 'Emollient' },
  'phenoxyethanol': { safety: 'caution', description: 'Common preservative, low risk', category: 'Preservative' },
  'ethylhexylglycerin': { safety: 'caution', description: 'Preservative booster, generally mild', category: 'Preservative' },

  // ── AVOID (red) ───────────────────────────────────────────────────
  'methylparaben': { safety: 'avoid', description: 'Potential endocrine disruptor', category: 'Preservative' },
  'propylparaben': { safety: 'avoid', description: 'Potential endocrine disruptor', category: 'Preservative' },
  'butylparaben': { safety: 'avoid', description: 'Potential endocrine disruptor', category: 'Preservative' },
  'ethylparaben': { safety: 'avoid', description: 'Potential endocrine disruptor', category: 'Preservative' },
  'paraben': { safety: 'avoid', description: 'Potential endocrine disruptor', category: 'Preservative' },
  'formaldehyde': { safety: 'avoid', description: 'Known irritant and carcinogen', category: 'Preservative' },
  'dmdm hydantoin': { safety: 'avoid', description: 'Formaldehyde releaser', category: 'Preservative' },
  'imidazolidinyl urea': { safety: 'avoid', description: 'Formaldehyde releaser', category: 'Preservative' },
  'diazolidinyl urea': { safety: 'avoid', description: 'Formaldehyde releaser', category: 'Preservative' },
  'quaternium-15': { safety: 'avoid', description: 'Formaldehyde releaser', category: 'Preservative' },
  'phthalates': { safety: 'avoid', description: 'Potential hormone disruptors', category: 'Plasticizer' },
  'diethyl phthalate': { safety: 'avoid', description: 'Potential hormone disruptor', category: 'Plasticizer' },
  'triclosan': { safety: 'avoid', description: 'Antibacterial linked to hormone issues', category: 'Antibacterial' },
  'oxybenzone': { safety: 'avoid', description: 'Chemical sunscreen, hormone concerns', category: 'Sunscreen' },
  'benzophenone-3': { safety: 'avoid', description: 'Chemical sunscreen, hormone concerns', category: 'Sunscreen' },
  'hydroquinone': { safety: 'avoid', description: 'Skin lightener, banned in many countries', category: 'Active' },
  'toluene': { safety: 'avoid', description: 'Solvent, potential toxin', category: 'Solvent' },
  'coal tar': { safety: 'avoid', description: 'Potential carcinogen', category: 'Colorant' },
  'mercury': { safety: 'avoid', description: 'Toxic metal found in some imports', category: 'Contaminant' },
  'thimerosal': { safety: 'avoid', description: 'Mercury-based preservative', category: 'Preservative' },
  'lead': { safety: 'avoid', description: 'Toxic metal, trace amounts in some products', category: 'Contaminant' },
  'lead acetate': { safety: 'avoid', description: 'Toxic lead compound', category: 'Contaminant' },
  'bha': { safety: 'avoid', description: 'Butylated hydroxyanisole, possible carcinogen', category: 'Preservative' },
  'bht': { safety: 'avoid', description: 'Butylated hydroxytoluene, potential irritant', category: 'Preservative' },
};

// ─── Popular Products ─────────────────────────────────────────────────

const POPULAR_PRODUCTS = [
  {
    name: 'CeraVe Moisturizing Cream',
    score: 92,
    icon: 'water',
    ingredients: 'Aqua, Glycerin, Cetearyl Alcohol, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid, Cholesterol, Dimethicone, Niacinamide, Panthenol',
  },
  {
    name: 'The Ordinary Niacinamide 10%',
    score: 95,
    icon: 'flask',
    ingredients: 'Aqua, Niacinamide, Zinc PCA, Glycerin, Dimethicone, Panthenol, Allantoin, Sodium Hyaluronate',
  },
  {
    name: 'Neutrogena Hydro Boost',
    score: 78,
    icon: 'cloud',
    ingredients: 'Aqua, Dimethicone, Glycerin, Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin, Fragrance',
  },
  {
    name: 'La Roche-Posay SPF 50',
    score: 88,
    icon: 'sunny',
    ingredients: 'Aqua, Titanium Dioxide, Niacinamide, Glycerin, Dimethicone, Panthenol, Tocopherol, Allantoin',
  },
  {
    name: "Paula's Choice 2% BHA",
    score: 90,
    icon: 'sparkles',
    ingredients: 'Aqua, Salicylic Acid, Green Tea Extract, Glycerin, Panthenol, Allantoin, Bisabolol',
  },
];

// ─── Analysis Logic ───────────────────────────────────────────────────

const fuzzyMatchIngredient = (text) => {
  const normalized = text.toLowerCase().trim();
  if (!normalized || normalized.length < 2) return null;

  // Direct match
  if (INGREDIENT_DB[normalized]) {
    return { key: normalized, ...INGREDIENT_DB[normalized] };
  }

  // Check if any DB key appears within the text or vice versa
  for (const [key, value] of Object.entries(INGREDIENT_DB)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { key, ...value };
    }
  }

  // Partial word matching for compound names
  const words = normalized.split(/\s+/);
  for (const [key, value] of Object.entries(INGREDIENT_DB)) {
    const keyWords = key.split(/\s+/);
    const matchCount = keyWords.filter(kw => words.some(w => w.includes(kw) || kw.includes(w)));
    if (matchCount.length > 0 && matchCount.length >= keyWords.length * 0.5) {
      return { key, ...value };
    }
  }

  return null;
};

const analyzeIngredients = (inputText) => {
  const raw = inputText.split(/,|\n/).map(s => s.trim()).filter(Boolean);
  const results = [];
  const seen = new Set();

  for (const item of raw) {
    const match = fuzzyMatchIngredient(item);
    if (match && !seen.has(match.key)) {
      seen.add(match.key);
      results.push({ name: item.trim(), ...match });
    } else if (!match) {
      results.push({
        name: item.trim(),
        key: item.toLowerCase().trim(),
        safety: 'unknown',
        description: 'Not in database',
        category: 'Unknown',
      });
    }
  }

  const safeCount = results.filter(r => r.safety === 'safe').length;
  const cautionCount = results.filter(r => r.safety === 'caution').length;
  const avoidCount = results.filter(r => r.safety === 'avoid').length;

  // Score: base 50, +2 per safe, -5 per caution, -15 per avoid, clamped 0-100
  const rawScore = 50 + (safeCount * 10) - (cautionCount * 5) - (avoidCount * 20);
  const score = Math.max(0, Math.min(100, rawScore));

  // Sort: avoid first, caution, unknown, safe
  const order = { avoid: 0, caution: 1, unknown: 2, safe: 3 };
  results.sort((a, b) => order[a.safety] - order[b.safety]);

  return { results, score, safeCount, cautionCount, avoidCount };
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Caution';
  return 'Avoid';
};

const getScoreColor = (score) => {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.blue;
  if (score >= 40) return COLORS.orange;
  return COLORS.red;
};

const getSafetyIcon = (safety) => {
  switch (safety) {
    case 'safe': return { symbol: '✅', color: COLORS.green };
    case 'caution': return { symbol: '⚠️', color: COLORS.orange };
    case 'avoid': return { symbol: '❌', color: COLORS.red };
    default: return { symbol: '❔', color: COLORS.textTertiary };
  }
};

const getSafetyLabel = (safety) => {
  switch (safety) {
    case 'safe': return 'Safe';
    case 'caution': return 'Caution';
    case 'avoid': return 'Avoid';
    default: return 'Unknown';
  }
};

// ─── Circular Progress Ring ──────────────────────────────────────────

const RING_SIZE = 140;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ScoreRing = memo(({ score, color }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.ringContainer}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
        {/* Background track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={COLORS.borderLight}
          strokeWidth={RING_STROKE}
          fill="transparent"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={color}
          strokeWidth={RING_STROKE}
          fill="transparent"
          strokeDasharray={RING_CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.ringInner}>
        <Text style={[styles.ringScore, { color }]}>{score}</Text>
        <Text style={[styles.ringLabel, { color }]}>{getScoreLabel(score)}</Text>
      </View>
    </View>
  );
});

// ─── Ingredient Row ──────────────────────────────────────────────────

const IngredientRow = memo(({ item, index }) => {
  const safetyInfo = getSafetyIcon(item.safety);
  const safetyLabel = getSafetyLabel(item.safety);

  const safetyColor =
    item.safety === 'safe' ? COLORS.green :
    item.safety === 'caution' ? COLORS.orange :
    item.safety === 'avoid' ? COLORS.red :
    COLORS.textTertiary;

  return (
    <Animated.View entering={FadeInRight.duration(300).delay(index * 40)}>
      <View style={styles.ingredientRow}>
        <View style={styles.ingredientLeft}>
          <Text style={styles.ingredientEmoji}>{safetyInfo.symbol}</Text>
          <View style={styles.ingredientTextBlock}>
            <View style={styles.ingredientNameRow}>
              <Text style={styles.ingredientName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.categoryTag, {
                backgroundColor: safetyColor + '15',
                borderColor: safetyColor + '30',
              }]}>
                <Text style={[styles.categoryTagText, { color: safetyColor }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <Text style={styles.ingredientDesc} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </View>
        <View style={[styles.safetyBadge, {
          backgroundColor: safetyColor + '15',
          borderColor: safetyColor + '30',
        }]}>
          <Text style={[styles.safetyBadgeText, { color: safetyColor }]}>
            {safetyLabel}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

// ─── Popular Product Card ────────────────────────────────────────────

const PopularProductCard = memo(({ product, onPress, index }) => {
  const scoreColor = getScoreColor(product.score);
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100 + index * 80)}>
      <AnimatedPressable onPress={onPress} style={styles.popularCard}>
        <GlassCard variant="default" style={styles.popularCardInner}>
          <View style={styles.popularTop}>
            <View style={[styles.popularIcon, { backgroundColor: scoreColor + '15' }]}>
              <Ionicons name={product.icon} size={20} color={scoreColor} />
            </View>
            <View style={[styles.popularScoreBadge, { backgroundColor: scoreColor + '15', borderColor: scoreColor + '30' }]}>
              <Text style={[styles.popularScoreText, { color: scoreColor }]}>{product.score}</Text>
            </View>
          </View>
          <Text style={styles.popularName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.popularTap}>Tap to analyze</Text>
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
});

// ─── Recent Scan Card ────────────────────────────────────────────────

const RecentScanCard = memo(({ scan, onPress, index }) => {
  const scoreColor = getScoreColor(scan.score);
  const preview = scan.input.length > 50 ? scan.input.substring(0, 50) + '...' : scan.input;
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
      <AnimatedPressable onPress={onPress}>
        <GlassCard variant="default" style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View style={styles.recentLeft}>
              <Ionicons name="time-outline" size={16} color={COLORS.textTertiary} />
              <Text style={styles.recentDate}>{scan.date}</Text>
            </View>
            <View style={[styles.recentScoreBadge, { backgroundColor: scoreColor + '15', borderColor: scoreColor + '30' }]}>
              <Text style={[styles.recentScoreText, { color: scoreColor }]}>{scan.score}/100</Text>
            </View>
          </View>
          <Text style={styles.recentPreview} numberOfLines={1}>{preview}</Text>
          <View style={styles.recentStats}>
            <Text style={[styles.recentStat, { color: COLORS.green }]}>{scan.safeCount} safe</Text>
            <Text style={styles.recentDot}>{'·'}</Text>
            <Text style={[styles.recentStat, { color: COLORS.orange }]}>{scan.cautionCount} caution</Text>
            <Text style={styles.recentDot}>{'·'}</Text>
            <Text style={[styles.recentStat, { color: COLORS.red }]}>{scan.avoidCount} avoid</Text>
          </View>
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────

const SkincareScannerScreen = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef(null);

  // Load recent scans
  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SCANS_KEY);
      if (data) setRecentScans(JSON.parse(data));
    } catch (e) { /* ignore */ }
  };

  const saveRecentScan = async (input, result) => {
    try {
      const newScan = {
        id: Date.now().toString(),
        input,
        score: result.score,
        safeCount: result.safeCount,
        cautionCount: result.cautionCount,
        avoidCount: result.avoidCount,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      const updated = [newScan, ...recentScans].slice(0, MAX_RECENT);
      setRecentScans(updated);
      await AsyncStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updated));
    } catch (e) { /* ignore */ }
  };

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsAnalyzing(true);

    // Simulate brief processing delay for feel
    setTimeout(() => {
      const result = analyzeIngredients(inputText);
      setAnalysisResult(result);
      saveRecentScan(inputText, result);
      setIsAnalyzing(false);

      // Scroll to results
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 350, animated: true });
      }, 200);
    }, 600);
  }, [inputText, recentScans]);

  const handlePopularProduct = useCallback((product) => {
    setInputText(product.ingredients);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleRecentScan = useCallback((scan) => {
    setInputText(scan.input);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleScanPhoto = useCallback(async () => {
    const pro = await isPro();
    if (!pro) {
      navigation.navigate('Paywall');
      return;
    }
    // Photo scanning would be implemented here
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [navigation]);

  const handleClear = useCallback(() => {
    setInputText('');
    setAnalysisResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GlassBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ingredient Scanner</Text>
            <Text style={styles.headerSubtitle}>Analyze product safety</Text>
          </View>
          {analysisResult && (
            <AnimatedPressable onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="refresh" size={20} color={COLORS.accent} />
            </AnimatedPressable>
          )}
        </Animated.View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Input Section ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard variant="default" style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Ionicons name="search" size={18} color={COLORS.accent} />
                <Text style={styles.inputLabel}>Paste Ingredient List</Text>
              </View>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Paste ingredient list here..."
                placeholderTextColor={COLORS.textMuted}
                textAlignVertical="top"
                selectionColor={COLORS.accent}
              />
              <View style={styles.inputActions}>
                <GlassButton
                  title={isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  icon={isAnalyzing ? 'hourglass' : 'scan'}
                  variant="gold"
                  size="lg"
                  onPress={handleAnalyze}
                  disabled={!inputText.trim() || isAnalyzing}
                  style={styles.analyzeBtn}
                />
                <GlassButton
                  title="Or scan from photo"
                  icon="camera"
                  variant="ghost"
                  size="sm"
                  onPress={handleScanPhoto}
                  style={styles.photoBtn}
                />
                <View style={styles.proBadgeRow}>
                  <Ionicons name="diamond" size={12} color={COLORS.accent} />
                  <Text style={styles.proLabel}>PRO Feature</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* ── Results Section ─────────────────────────────────────── */}
          {analysisResult && (
            <>
              {/* Overall Score Card */}
              <Animated.View entering={ZoomIn.duration(500).delay(100)}>
                <GlassCard variant="accent" glow style={styles.scoreCard}>
                  <Text style={styles.scoreCardTitle}>Overall Safety Score</Text>
                  <ScoreRing
                    score={analysisResult.score}
                    color={getScoreColor(analysisResult.score)}
                  />
                  <View style={styles.scoreSummary}>
                    <View style={styles.scoreStat}>
                      <View style={[styles.scoreStatDot, { backgroundColor: COLORS.green }]} />
                      <Text style={styles.scoreStatText}>{analysisResult.safeCount} Safe</Text>
                    </View>
                    <View style={styles.scoreStat}>
                      <View style={[styles.scoreStatDot, { backgroundColor: COLORS.orange }]} />
                      <Text style={styles.scoreStatText}>{analysisResult.cautionCount} Caution</Text>
                    </View>
                    <View style={styles.scoreStat}>
                      <View style={[styles.scoreStatDot, { backgroundColor: COLORS.red }]} />
                      <Text style={styles.scoreStatText}>{analysisResult.avoidCount} Avoid</Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>

              {/* Ingredient Breakdown */}
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Ingredient Breakdown</Text>
                  <Text style={styles.sectionCount}>
                    {analysisResult.results.length} detected
                  </Text>
                </View>
              </Animated.View>

              {analysisResult.results.map((item, index) => (
                <IngredientRow key={item.key + index} item={item} index={index} />
              ))}
            </>
          )}

          {/* ── Recent Scans ───────────────────────────────────────── */}
          {!analysisResult && recentScans.length > 0 && (
            <>
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Recent Scans</Text>
                </View>
              </Animated.View>
              {recentScans.map((scan, index) => (
                <RecentScanCard
                  key={scan.id}
                  scan={scan}
                  onPress={() => handleRecentScan(scan)}
                  index={index}
                />
              ))}
            </>
          )}

          {/* ── Popular Products ────────────────────────────────────── */}
          {!analysisResult && (
            <>
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Popular Products</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Tap to load ingredients and analyze
                </Text>
              </Animated.View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularScroll}
              >
                {POPULAR_PRODUCTS.map((product, index) => (
                  <PopularProductCard
                    key={product.name}
                    product={product}
                    onPress={() => handlePopularProduct(product)}
                    index={index}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* ── Tips Card ───────────────────────────────────────────── */}
          {!analysisResult && (
            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <GlassCard variant="default" style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb" size={18} color={COLORS.accent} />
                  <Text style={styles.tipsTitle}>How to Use</Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipNumber}>1</Text>
                  <Text style={styles.tipText}>
                    Find the ingredient list on your product packaging
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipNumber}>2</Text>
                  <Text style={styles.tipText}>
                    Copy and paste or type the ingredients separated by commas
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipNumber}>3</Text>
                  <Text style={styles.tipText}>
                    Tap Analyze for an instant safety breakdown
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input
  inputCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  textInput: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    minHeight: 100,
    maxHeight: 160,
  },
  inputActions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  analyzeBtn: {
    marginBottom: SPACING.xs,
  },
  photoBtn: {
    marginBottom: SPACING.xs,
  },
  proBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  proLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Score Card
  scoreCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  scoreCardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  scoreSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.lg,
  },
  scoreStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scoreStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreStatText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Ring
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringScore: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  ringLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    marginTop: -2,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.md,
    marginTop: -SPACING.sm,
  },

  // Ingredient Row
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ingredientLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ingredientEmoji: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  ingredientTextBlock: {
    flex: 1,
  },
  ingredientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  ingredientName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ingredientDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  safetyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginLeft: SPACING.sm,
  },
  safetyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Popular Products
  popularScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  popularCard: {
    width: 150,
  },
  popularCardInner: {
    padding: SPACING.md,
    height: 140,
    justifyContent: 'space-between',
  },
  popularTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  popularScoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  popularName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  popularTap: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
  },

  // Recent Scans
  recentCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  recentDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  recentScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  recentScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recentPreview: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  recentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  recentStat: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
  },
  recentDot: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },

  // Tips
  tipsCard: {
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    color: COLORS.accent,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default SkincareScannerScreen;
