import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, getScoreColor, getScoreLabel } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_ASPECT_RATIO = 1.4; // Tall card for social
const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT_RATIO;

const TEMPLATE_STORAGE_KEY = 'androgenic_last_template';
const SHARED_COUNT_KEY = 'androgenic_shared_count';

// ─── Gold palette ────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#FFD700';
const GOLD_DARK = '#B8960F';
const GOLD_DIM = 'rgba(212,175,55,0.5)';
const GOLD_GLOW = 'rgba(212,175,55,0.25)';
const GOLD_FAINT = 'rgba(212,175,55,0.10)';

// ─── Background color options ────────────────────────────────────────
const BG_OPTIONS = [
  { id: 'black', label: 'Pure Black', colors: ['#000000', '#000000'] },
  { id: 'darkGold', label: 'Dark Gold', colors: ['#0d0a00', '#1a1400'] },
  { id: 'midnight', label: 'Midnight', colors: ['#000814', '#001d3d'] },
  { id: 'purple', label: 'Dark Purple', colors: ['#0a0010', '#1a0030'] },
];

// ─── Score tier helpers ──────────────────────────────────────────────
const getTierLabel = (score) => {
  if (score >= 9) return 'ELITE';
  if (score >= 8) return 'MODEL TIER';
  if (score >= 7) return 'ABOVE AVERAGE';
  if (score >= 6) return 'ABOVE AVERAGE';
  if (score >= 5) return 'AVERAGE';
  if (score >= 4) return 'AVERAGE';
  return 'BELOW AVERAGE';
};

const getTierColor = (score) => {
  if (score >= 8) return '#34C759';
  if (score >= 6) return '#4A90D9';
  if (score >= 4) return '#FF9500';
  return '#FF3B30';
};

const getPercentile = (score) => {
  if (score >= 9.5) return 'Top 1%';
  if (score >= 9) return 'Top 3%';
  if (score >= 8.5) return 'Top 5%';
  if (score >= 8) return 'Top 10%';
  if (score >= 7.5) return 'Top 15%';
  if (score >= 7) return 'Top 18%';
  if (score >= 6.5) return 'Top 25%';
  if (score >= 6) return 'Top 35%';
  if (score >= 5) return 'Top 50%';
  if (score >= 4) return 'Top 65%';
  return 'Top 80%';
};

// ─── Normalize scores ────────────────────────────────────────────────
// Scores from the analysis can be 0-100 or 0-10. We normalize to 0-10 scale.
const normalizeScore = (val) => {
  if (val === undefined || val === null) return 0;
  if (val > 10) return Math.round(val / 10 * 10) / 10; // 0-100 -> 0-10 with 1 decimal
  return Math.round(val * 10) / 10;
};

// ─── Category definitions ────────────────────────────────────────────
const CATEGORIES = [
  { key: 'jawline', label: 'JAW' },
  { key: 'skin', label: 'SKIN' },
  { key: 'eyes', label: 'EYES' },
  { key: 'symmetry', label: 'SYM' },
  { key: 'cheekbones', label: 'CHEEK' },
  { key: 'masculinity', label: 'MASC' },
];

// ─── TEMPLATE COMPONENTS ─────────────────────────────────────────────

// Template 1: Rating Card (FIFA-style, default)
const RatingCardTemplate = ({ scores, imageUri, overallScore, bgColors, showPhoto, showScores, showPercentile }) => {
  const tierColor = getTierColor(overallScore);
  return (
    <View style={[templateStyles.cardBase, { backgroundColor: bgColors[0] }]}>
      <LinearGradient colors={bgColors} style={templateStyles.cardGradient}>
        {/* Gold border */}
        <View style={templateStyles.ratingBorder}>
          {/* Brand */}
          <Text style={templateStyles.brandTextSmall}>ANDROGENIC</Text>

          {/* Photo with gold ring */}
          {showPhoto && (
            <View style={templateStyles.ratingPhotoContainer}>
              <View style={templateStyles.ratingPhotoRing}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={templateStyles.ratingPhoto} />
                ) : (
                  <View style={[templateStyles.ratingPhoto, templateStyles.ratingPhotoPlaceholder]}>
                    <Ionicons name="person" size={36} color={GOLD_DIM} />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Main score */}
          <Text style={[templateStyles.ratingScore, { color: tierColor }]}>
            {overallScore.toFixed(1)}
          </Text>

          {/* Tier label */}
          <Text style={templateStyles.ratingTierLabel}>
            {getTierLabel(overallScore)}
          </Text>

          {/* Mini scores row */}
          {showScores && (
            <View style={templateStyles.ratingMiniRow}>
              {CATEGORIES.map((cat, i) => {
                const val = normalizeScore(scores[cat.key]);
                return (
                  <View key={cat.key} style={templateStyles.ratingMiniItem}>
                    <Text style={templateStyles.ratingMiniLabel}>{cat.label}</Text>
                    <Text style={[templateStyles.ratingMiniValue, { color: getTierColor(val) }]}>
                      {val.toFixed(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Percentile */}
          {showPercentile && (
            <Text style={templateStyles.ratingPercentile}>{getPercentile(overallScore)}</Text>
          )}

          {/* Watermark */}
          <Text style={templateStyles.watermark}>androgenic.app</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Template 2: Minimal
const MinimalTemplate = ({ overallScore, bgColors }) => {
  const tierColor = getTierColor(overallScore);
  return (
    <View style={[templateStyles.cardBase, { backgroundColor: bgColors[0] }]}>
      <LinearGradient colors={bgColors} style={templateStyles.cardGradient}>
        <View style={templateStyles.minimalBorder}>
          <Text style={templateStyles.minimalBrand}>ANDROGENIC</Text>
          <Text style={[templateStyles.minimalScore, { color: tierColor }]}>
            {overallScore.toFixed(1)}
          </Text>
          <View style={templateStyles.minimalDivider} />
          <Text style={templateStyles.minimalTier}>{getTierLabel(overallScore)}</Text>
          <Text style={templateStyles.watermark}>androgenic.app</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Template 3: Full Stats
const FullStatsTemplate = ({ scores, imageUri, overallScore, bgColors, showPhoto }) => {
  const tierColor = getTierColor(overallScore);
  return (
    <View style={[templateStyles.cardBase, { backgroundColor: bgColors[0] }]}>
      <LinearGradient colors={bgColors} style={templateStyles.cardGradient}>
        <View style={templateStyles.statsBorder}>
          <Text style={templateStyles.brandTextSmall}>ANDROGENIC</Text>

          {/* Top row: photo + score */}
          <View style={templateStyles.statsTopRow}>
            {showPhoto && imageUri ? (
              <View style={templateStyles.statsPhotoWrap}>
                <Image source={{ uri: imageUri }} style={templateStyles.statsPhoto} />
              </View>
            ) : showPhoto ? (
              <View style={[templateStyles.statsPhotoWrap, templateStyles.statsPhotoPlaceholder]}>
                <Ionicons name="person" size={28} color={GOLD_DIM} />
              </View>
            ) : null}
            <View style={templateStyles.statsScoreWrap}>
              <Text style={[templateStyles.statsScoreNum, { color: tierColor }]}>
                {overallScore.toFixed(1)}
              </Text>
              <Text style={templateStyles.statsTierLabel}>{getTierLabel(overallScore)}</Text>
            </View>
          </View>

          {/* Category bars */}
          <View style={templateStyles.statsBarsContainer}>
            {CATEGORIES.map((cat) => {
              const val = normalizeScore(scores[cat.key]);
              const pct = Math.min(val / 10 * 100, 100);
              return (
                <View key={cat.key} style={templateStyles.statsBarRow}>
                  <Text style={templateStyles.statsBarLabel}>{cat.label}</Text>
                  <View style={templateStyles.statsBarTrack}>
                    <View
                      style={[
                        templateStyles.statsBarFill,
                        { width: `${pct}%`, backgroundColor: getTierColor(val) },
                      ]}
                    />
                  </View>
                  <Text style={[templateStyles.statsBarValue, { color: getTierColor(val) }]}>
                    {val.toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Face shape + potential teaser */}
          <View style={templateStyles.statsFooterRow}>
            <View style={templateStyles.statsBadge}>
              <Text style={templateStyles.statsBadgeText}>FACE ANALYSIS</Text>
            </View>
            <Text style={templateStyles.statsPotential}>Potential: ???</Text>
          </View>

          <Text style={templateStyles.watermark}>androgenic.app</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Template 4: Comparison (Before/After)
const ComparisonTemplate = ({ scores, overallScore, bgColors }) => {
  const tierColor = getTierColor(overallScore);
  // Simulate a "before" score lower than current
  const beforeScore = Math.max(1, overallScore - (1.2 + Math.random() * 0.8));
  const improvement = overallScore - beforeScore;
  return (
    <View style={[templateStyles.cardBase, { backgroundColor: bgColors[0] }]}>
      <LinearGradient colors={bgColors} style={templateStyles.cardGradient}>
        <View style={templateStyles.compBorder}>
          <Text style={templateStyles.brandTextSmall}>ANDROGENIC</Text>

          <View style={templateStyles.compDurationBadge}>
            <Text style={templateStyles.compDurationText}>3 MONTHS</Text>
          </View>

          <View style={templateStyles.compScoreRow}>
            {/* Before */}
            <View style={templateStyles.compScoreBlock}>
              <Text style={templateStyles.compLabel}>BEFORE</Text>
              <Text style={[templateStyles.compScoreNum, { color: getTierColor(beforeScore) }]}>
                {beforeScore.toFixed(1)}
              </Text>
            </View>

            {/* Arrow */}
            <View style={templateStyles.compArrowWrap}>
              <Ionicons name="arrow-forward" size={28} color={GOLD} />
              <Text style={templateStyles.compArrowDelta}>+{improvement.toFixed(1)}</Text>
            </View>

            {/* After */}
            <View style={templateStyles.compScoreBlock}>
              <Text style={templateStyles.compLabel}>AFTER</Text>
              <Text style={[templateStyles.compScoreNum, { color: tierColor }]}>
                {overallScore.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text style={templateStyles.compTier}>{getTierLabel(overallScore)}</Text>
          <Text style={templateStyles.watermark}>androgenic.app</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Template 5: Dark Gold (Premium)
const DarkGoldTemplate = ({ scores, imageUri, overallScore, bgColors, showPhoto, showScores }) => {
  const tierColor = getTierColor(overallScore);
  return (
    <View style={[templateStyles.cardBase, { backgroundColor: bgColors[0] }]}>
      <LinearGradient colors={bgColors} style={templateStyles.cardGradient}>
        {/* Thick gold gradient border effect */}
        <View style={templateStyles.darkGoldOuterBorder}>
          <LinearGradient
            colors={[GOLD_DARK, GOLD_LIGHT, GOLD, GOLD_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={templateStyles.darkGoldGradientBorder}
          >
            <View style={templateStyles.darkGoldInner}>
              <Text style={templateStyles.brandTextSmall}>ANDROGENIC</Text>

              {/* Photo with gold glow */}
              {showPhoto && (
                <View style={templateStyles.darkGoldPhotoContainer}>
                  <View style={templateStyles.darkGoldPhotoGlow}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={templateStyles.darkGoldPhoto} />
                    ) : (
                      <View style={[templateStyles.darkGoldPhoto, templateStyles.darkGoldPhotoPlaceholder]}>
                        <Ionicons name="person" size={36} color={GOLD_DIM} />
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Score */}
              <Text style={[templateStyles.darkGoldScore, { color: GOLD_LIGHT }]}>
                {overallScore.toFixed(1)}
              </Text>
              <Text style={templateStyles.darkGoldTier}>{getTierLabel(overallScore)}</Text>

              {/* Mini scores */}
              {showScores && (
                <View style={templateStyles.darkGoldMiniRow}>
                  {CATEGORIES.slice(0, 3).map((cat) => {
                    const val = normalizeScore(scores[cat.key]);
                    return (
                      <View key={cat.key} style={templateStyles.darkGoldMiniItem}>
                        <Text style={templateStyles.darkGoldMiniLabel}>{cat.label}</Text>
                        <Text style={[templateStyles.darkGoldMiniVal, { color: GOLD_LIGHT }]}>
                          {val.toFixed(1)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <Text style={templateStyles.watermarkGold}>androgenic.app</Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
};

// ─── TEMPLATE DEFINITIONS ────────────────────────────────────────────
const TEMPLATES = [
  { id: 'rating', label: 'Rating', icon: 'star' },
  { id: 'minimal', label: 'Minimal', icon: 'remove' },
  { id: 'fullStats', label: 'Full Stats', icon: 'stats-chart' },
  { id: 'comparison', label: 'Compare', icon: 'git-compare' },
  { id: 'darkGold', label: 'Dark Gold', icon: 'diamond' },
];

// ─── MAIN SCREEN COMPONENT ──────────────────────────────────────────
const ShareCardScreen = ({ route, navigation }) => {
  const { scores, imageUri, previousScores } = route.params || {};
  const viewShotRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State
  const [selectedTemplate, setSelectedTemplate] = useState('rating');
  const [showPhoto, setShowPhoto] = useState(true);
  const [showScores, setShowScores] = useState(true);
  const [showPercentile, setShowPercentile] = useState(true);
  const [selectedBg, setSelectedBg] = useState(BG_OPTIONS[0]);
  const [sharedCount, setSharedCount] = useState(12847);

  // Compute overall score (0-10 scale)
  const overallScore = scores
    ? normalizeScore(scores.overallRating || scores.overall)
    : 7.4;

  // Load saved template preference
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const saved = await AsyncStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (saved && TEMPLATES.find((t) => t.id === saved)) {
          setSelectedTemplate(saved);
        }
        const count = await AsyncStorage.getItem(SHARED_COUNT_KEY);
        if (count) setSharedCount(parseInt(count, 10));
      } catch {}
    };
    loadPrefs();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Save template preference when changed
  const handleTemplateChange = useCallback(
    (templateId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTemplate(templateId);
      AsyncStorage.setItem(TEMPLATE_STORAGE_KEY, templateId).catch(() => {});
    },
    [],
  );

  // Increment shared counter
  const incrementSharedCount = useCallback(async () => {
    const next = sharedCount + 1;
    setSharedCount(next);
    try {
      await AsyncStorage.setItem(SHARED_COUNT_KEY, String(next));
    } catch {}
  }, [sharedCount]);

  // ─── Share handlers ──────────────────────────────────────────────
  const captureCard = async () => {
    if (!viewShotRef.current) return null;
    try {
      return await viewShotRef.current.capture();
    } catch {
      return null;
    }
  };

  const handleSaveToRoll = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const uri = await captureCard();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture card.');
        return;
      }
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        await incrementSharedCount();
        Alert.alert('Saved!', 'Card saved to your camera roll.');
      } else {
        Alert.alert('Permission Required', 'Please allow photo library access to save cards.');
      }
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const handleNativeShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureCard();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture card.');
        return;
      }
      if (Platform.OS === 'web') {
        Alert.alert('Share', 'Sharing is not supported on web. Please save the image instead.');
        return;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Androgenic score',
        });
        await incrementSharedCount();
      } else {
        Alert.alert('Unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const handleInstagramShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureCard();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture card.');
        return;
      }
      // Save first, then prompt user to open Instagram
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        await incrementSharedCount();
        Alert.alert(
          'Ready for Instagram!',
          'Card saved to your camera roll. Open Instagram Stories and select it from your gallery.',
          [{ text: 'Got it', style: 'default' }],
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to prepare for Instagram. Please try again.');
    }
  };

  const handleCopyImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const uri = await captureCard();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture card.');
        return;
      }
      // On mobile, use share sheet as clipboard for images
      if (Platform.OS === 'web') {
        Alert.alert('Info', 'Please use Save to Camera Roll instead.');
        return;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
        await incrementSharedCount();
      }
    } catch {
      Alert.alert('Error', 'Failed to copy. Please try again.');
    }
  };

  // ─── Render card template ───────────────────────────────────────
  const renderCard = () => {
    const props = {
      scores: scores || {},
      imageUri,
      overallScore,
      bgColors: selectedBg.colors,
      showPhoto,
      showScores,
      showPercentile,
    };

    switch (selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'fullStats':
        return <FullStatsTemplate {...props} />;
      case 'comparison':
        return <ComparisonTemplate {...props} />;
      case 'darkGold':
        return <DarkGoldTemplate {...props} />;
      case 'rating':
      default:
        return <RatingCardTemplate {...props} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Share Card</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ─── Card Preview ──────────────────────────────────────── */}
        <View style={styles.previewContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          >
            {renderCard()}
          </ViewShot>
        </View>

        {/* ─── Template Selector ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Template</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateScrollContent}
          style={styles.templateScroll}
        >
          {TEMPLATES.map((tmpl) => {
            const isActive = selectedTemplate === tmpl.id;
            return (
              <TouchableOpacity
                key={tmpl.id}
                style={[styles.templateThumb, isActive && styles.templateThumbActive]}
                onPress={() => handleTemplateChange(tmpl.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.templateThumbInner, isActive && styles.templateThumbInnerActive]}>
                  <Ionicons
                    name={tmpl.icon}
                    size={20}
                    color={isActive ? GOLD_LIGHT : COLORS.textTertiary}
                  />
                </View>
                <Text style={[styles.templateLabel, isActive && styles.templateLabelActive]}>
                  {tmpl.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Customization Toggles ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>Customize</Text>
        <View style={styles.togglesContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Photo</Text>
            <Switch
              value={showPhoto}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                setShowPhoto(val);
              }}
              trackColor={{ false: '#333', true: GOLD_GLOW }}
              thumbColor={showPhoto ? GOLD : '#888'}
            />
          </View>
          <View style={styles.toggleDivider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Scores</Text>
            <Switch
              value={showScores}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                setShowScores(val);
              }}
              trackColor={{ false: '#333', true: GOLD_GLOW }}
              thumbColor={showScores ? GOLD : '#888'}
            />
          </View>
          <View style={styles.toggleDivider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Percentile</Text>
            <Switch
              value={showPercentile}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                setShowPercentile(val);
              }}
              trackColor={{ false: '#333', true: GOLD_GLOW }}
              thumbColor={showPercentile ? GOLD : '#888'}
            />
          </View>
        </View>

        {/* ─── Background Color Picker ───────────────────────────── */}
        <Text style={styles.sectionLabel}>Background</Text>
        <View style={styles.bgPickerRow}>
          {BG_OPTIONS.map((bg) => {
            const isActive = selectedBg.id === bg.id;
            return (
              <TouchableOpacity
                key={bg.id}
                style={[styles.bgOption, isActive && styles.bgOptionActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedBg(bg);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient colors={bg.colors} style={styles.bgOptionSwatch} />
                <Text style={[styles.bgOptionLabel, isActive && styles.bgOptionLabelActive]}>
                  {bg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Share Buttons ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Share</Text>
        <View style={styles.shareButtonsContainer}>
          {/* Primary: Save to Camera Roll */}
          <TouchableOpacity onPress={handleSaveToRoll} activeOpacity={0.8} style={styles.primaryShareBtn}>
            <LinearGradient
              colors={[GOLD_DARK, GOLD, GOLD_LIGHT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryShareGradient}
            >
              <Ionicons name="download-outline" size={20} color="#000" />
              <Text style={styles.primaryShareText}>Save to Camera Roll</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary row */}
          <View style={styles.secondaryShareRow}>
            <TouchableOpacity
              onPress={handleNativeShare}
              style={styles.secondaryShareBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color={GOLD} />
              <Text style={styles.secondaryShareText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInstagramShare}
              style={styles.secondaryShareBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-instagram" size={20} color={GOLD} />
              <Text style={styles.secondaryShareText}>Stories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopyImage}
              style={styles.secondaryShareBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={20} color={GOLD} />
              <Text style={styles.secondaryShareText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Social Proof ──────────────────────────────────────── */}
        <View style={styles.socialProofContainer}>
          <Ionicons name="flame" size={16} color={GOLD} />
          <Text style={styles.socialProofText}>
            {sharedCount.toLocaleString()} cards shared this week
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// ─── TEMPLATE STYLES ─────────────────────────────────────────────────
const templateStyles = StyleSheet.create({
  // ── Shared base ──
  cardBase: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
    paddingVertical: 0,
  },
  brandTextSmall: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 6,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 12,
  },
  watermark: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.20)',
    textAlign: 'center',
    marginTop: 16,
  },
  watermarkGold: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: GOLD_DIM,
    textAlign: 'center',
    marginTop: 16,
  },

  // ── Template 1: Rating Card ──
  ratingBorder: {
    margin: 2,
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ratingPhotoContainer: {
    marginBottom: 14,
    alignItems: 'center',
  },
  ratingPhotoRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  ratingPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  ratingPhotoPlaceholder: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -2,
  },
  ratingTierLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingMiniRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 12,
  },
  ratingMiniItem: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: (CARD_WIDTH - 60) / 6 - 4,
  },
  ratingMiniLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 2,
  },
  ratingMiniValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  ratingPercentile: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.30)',
    textAlign: 'center',
    marginBottom: -4,
  },

  // ── Template 2: Minimal ──
  minimalBorder: {
    margin: 2,
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalBrand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 8,
    color: GOLD,
    marginBottom: 20,
  },
  minimalScore: {
    fontSize: 96,
    fontWeight: '900',
    letterSpacing: -4,
    textAlign: 'center',
  },
  minimalDivider: {
    width: 40,
    height: 2,
    backgroundColor: GOLD_DIM,
    marginVertical: 16,
    borderRadius: 1,
  },
  minimalTier: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    color: GOLD,
    textAlign: 'center',
  },

  // ── Template 3: Full Stats ──
  statsBorder: {
    margin: 2,
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  statsPhotoWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: GOLD_DIM,
    overflow: 'hidden',
  },
  statsPhoto: {
    width: '100%',
    height: '100%',
  },
  statsPhotoPlaceholder: {
    backgroundColor: GOLD_FAINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsScoreWrap: {
    flex: 1,
  },
  statsScoreNum: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statsTierLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: GOLD,
    marginTop: -2,
  },
  statsBarsContainer: {
    gap: 8,
    marginBottom: 14,
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsBarLabel: {
    width: 40,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.40)',
  },
  statsBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statsBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsBarValue: {
    width: 28,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  statsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsBadge: {
    backgroundColor: GOLD_FAINT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  statsBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: GOLD,
  },
  statsPotential: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 1,
  },

  // ── Template 4: Comparison ──
  compBorder: {
    margin: 2,
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  compDurationBadge: {
    backgroundColor: GOLD_FAINT,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 24,
  },
  compDurationText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: GOLD,
  },
  compScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  compScoreBlock: {
    alignItems: 'center',
    flex: 1,
  },
  compLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },
  compScoreNum: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  compArrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  compArrowDelta: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34C759',
  },
  compTier: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: GOLD,
    textAlign: 'center',
  },

  // ── Template 5: Dark Gold ──
  darkGoldOuterBorder: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  darkGoldGradientBorder: {
    padding: 3,
    borderRadius: 14,
  },
  darkGoldInner: {
    backgroundColor: '#000',
    borderRadius: 11,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  darkGoldPhotoContainer: {
    marginBottom: 14,
  },
  darkGoldPhotoGlow: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  darkGoldPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  darkGoldPhotoPlaceholder: {
    backgroundColor: GOLD_FAINT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkGoldScore: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: 4,
  },
  darkGoldTier: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: GOLD,
    textAlign: 'center',
    marginBottom: 16,
  },
  darkGoldMiniRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 4,
  },
  darkGoldMiniItem: {
    alignItems: 'center',
    gap: 2,
  },
  darkGoldMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: GOLD_DIM,
  },
  darkGoldMiniVal: {
    fontSize: 16,
    fontWeight: '800',
  },
});

// ─── SCREEN STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },

  // ── Preview ──
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
    // Subtle shadow behind card
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 6,
  },

  // ── Section Label ──
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // ── Template Selector ──
  templateScroll: {
    marginBottom: 24,
  },
  templateScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  templateThumb: {
    alignItems: 'center',
    gap: 6,
  },
  templateThumbActive: {},
  templateThumbInner: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateThumbInnerActive: {
    borderColor: GOLD,
    backgroundColor: GOLD_FAINT,
  },
  templateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  templateLabelActive: {
    color: GOLD,
  },

  // ── Toggles ──
  togglesContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 16,
  },

  // ── Background Picker ──
  bgPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  bgOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bgOptionActive: {},
  bgOptionSwatch: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  bgOptionLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  bgOptionLabelActive: {
    color: GOLD,
  },

  // ── Share Buttons ──
  shareButtonsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  primaryShareBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryShareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryShareText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.3,
  },
  secondaryShareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.20)',
  },
  secondaryShareText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
  },

  // ── Social Proof ──
  socialProofContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    opacity: 0.6,
  },
  socialProofText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default ShareCardScreen;
