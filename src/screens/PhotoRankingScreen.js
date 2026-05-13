import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image, Dimensions, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, GRADIENTS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

const PHOTO_SLOT_SIZE = (width - 60) / 2;
const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

const ANALYSIS_STEPS = [
  'Analyzing lighting...',
  'Measuring facial angles...',
  'Evaluating expressions...',
  'Comparing aesthetics...',
];

const BEST_FOR_LABELS = [
  'Best for: Dating Profile',
  'Best for: Social Media',
  'Best for: Professional',
  'Best for: Casual',
  'Best for: LinkedIn',
  'Best for: Group Photos',
];

const generatePhotoScores = (photos) => {
  const scored = photos.map((photo, index) => {
    const isFirst = index === 0;
    const baseScore = isFirst
      ? Math.floor(Math.random() * 11) + 85 // 85-95 for best
      : Math.floor(Math.random() * 26) + 60; // 60-85 for others

    return {
      ...photo,
      overallScore: baseScore,
      lightingScore: Math.floor(Math.random() * 5) + 6, // 6-10
      angleScore: Math.floor(Math.random() * 5) + 6,
      expressionScore: Math.floor(Math.random() * 5) + 6,
      clarityScore: Math.floor(Math.random() * 5) + 6,
    };
  });

  scored.sort((a, b) => b.overallScore - a.overallScore);
  return scored.map((photo, index) => ({
    ...photo,
    rank: index + 1,
  }));
};

const getBestForLabel = (photo) => {
  const scores = {
    lighting: photo.lightingScore,
    angle: photo.angleScore,
    expression: photo.expressionScore,
    clarity: photo.clarityScore,
  };
  const highest = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );
  switch (highest) {
    case 'lighting': return 'Best for: Social Media';
    case 'angle': return 'Best for: Dating Profile';
    case 'expression': return 'Best for: Professional';
    case 'clarity': return 'Best for: LinkedIn';
    default: return 'Best for: Social Media';
  }
};

const getMedalEmoji = (rank) => {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return `#${rank}`;
};

const getRankGradient = (rank) => {
  if (rank === 1) return ['#FFD700', '#FFA500'];
  if (rank === 2) return ['#C0C0C0', '#A0A0A0'];
  if (rank === 3) return ['#CD7F32', '#A0522D'];
  return [COLORS.bgCard, COLORS.bgSecondary];
};

// ─── Upload Phase ────────────────────────────────────────────────────
const UploadPhase = ({ photos, onAddPhoto, onRemovePhoto, onStartAnalysis }) => (
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    {/* Hero Section */}
    <Animated.View entering={FadeInDown.duration(500).delay(100)}>
      <GlassCard variant="gold" style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconRow}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.heroIcon}>
              <Ionicons name="images-outline" size={28} color="#000" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Photo Ranking</Text>
          <Text style={styles.heroSubtitle}>
            Upload 2-6 photos to find your best look. Our AI analyzes lighting, angles, expression, and overall aesthetics to rank your photos.
          </Text>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={12} color="#000" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>

    {/* Photo Grid */}
    <Animated.View entering={FadeInDown.duration(500).delay(250)}>
      <Text style={styles.sectionTitle}>
        Your Photos ({photos.length}/{MAX_PHOTOS})
      </Text>
      <View style={styles.photoGrid}>
        {/* Filled slots */}
        {photos.map((photo, index) => (
          <Animated.View
            key={photo.id}
            entering={ZoomIn.duration(300).delay(index * 80)}
          >
            <GlassCard style={styles.photoSlot}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
              <AnimatedPressable
                style={styles.removeBtn}
                onPress={() => onRemovePhoto(photo.id)}
              >
                <View style={styles.removeBtnInner}>
                  <Ionicons name="close" size={16} color="#fff" />
                </View>
              </AnimatedPressable>
              <View style={styles.photoIndex}>
                <Text style={styles.photoIndexText}>{index + 1}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        {/* Empty slots */}
        {photos.length < MAX_PHOTOS && (
          <AnimatedPressable onPress={onAddPhoto}>
            <View style={[styles.photoSlot, styles.emptySlot]}>
              <Ionicons name="add" size={36} color={COLORS.textTertiary} />
              <Text style={styles.emptySlotText}>Add Photo</Text>
            </View>
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>

    {/* Add Photo Button */}
    {photos.length < MAX_PHOTOS && (
      <Animated.View entering={FadeInDown.duration(500).delay(350)}>
        <GlassButton
          title="Add Photo"
          icon="image-outline"
          variant="secondary"
          onPress={onAddPhoto}
          style={styles.addPhotoBtn}
        />
      </Animated.View>
    )}

    {/* CTA */}
    <Animated.View entering={FadeInDown.duration(500).delay(450)}>
      <AnimatedPressable
        onPress={onStartAnalysis}
        disabled={photos.length < MIN_PHOTOS}
      >
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.ctaButton,
            photos.length < MIN_PHOTOS && styles.ctaDisabled,
          ]}
        >
          <Ionicons name="analytics-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>Rank My Photos</Text>
        </LinearGradient>
      </AnimatedPressable>
      {photos.length < MIN_PHOTOS && (
        <Text style={styles.ctaHint}>
          Add at least {MIN_PHOTOS - photos.length} more photo{MIN_PHOTOS - photos.length !== 1 ? 's' : ''} to continue
        </Text>
      )}
    </Animated.View>

    <View style={{ height: 40 }} />
  </ScrollView>
);

// ─── Analyzing Phase ─────────────────────────────────────────────────
const AnalyzingPhase = ({ photos, analysisStep }) => (
  <View style={styles.analyzingContainer}>
    <Animated.View entering={FadeInDown.duration(600)}>
      <Text style={styles.analyzingTitle}>Analyzing Your Photos</Text>
      <Text style={styles.analyzingSubtitle}>
        Please wait while our AI evaluates each photo...
      </Text>
    </Animated.View>

    {/* Photos Row */}
    <Animated.View
      entering={FadeInDown.duration(500).delay(200)}
      style={styles.analyzingPhotosRow}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {photos.map((photo, index) => (
          <Animated.View
            key={photo.id}
            entering={ZoomIn.duration(400).delay(index * 100)}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.analyzingThumbnail}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>

    {/* Progress */}
    <Animated.View
      entering={FadeInDown.duration(500).delay(400)}
      style={styles.progressContainer}
    >
      <GlassCard style={styles.progressCard}>
        <Text style={styles.analysisStepText}>
          {ANALYSIS_STEPS[analysisStep] || ANALYSIS_STEPS[0]}
        </Text>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarFill,
              { width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressPercent}>
          {Math.round(((analysisStep + 1) / ANALYSIS_STEPS.length) * 100)}%
        </Text>
      </GlassCard>
    </Animated.View>
  </View>
);

// ─── Results Phase ───────────────────────────────────────────────────
const ResultsPhase = ({ rankedPhotos, onReset, navigation }) => {
  const bestPhoto = rankedPhotos[0];

  const tips = [
    'Your best angle is slightly to the left',
    `Natural lighting in Photo 1 significantly boosted your score`,
    'Try smiling more in photos — expression scored highest in your top photo',
    'Higher resolution photos tend to score better for clarity',
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Best Photo Hero */}
      <Animated.View entering={FadeInDown.duration(600).delay(100)}>
        <GlassCard variant="gold" glow style={styles.bestPhotoCard}>
          <View style={styles.bestPhotoHeader}>
            <Text style={styles.crownEmoji}>{'\u{1F451}'}</Text>
            <LinearGradient
              colors={GRADIENTS.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bestBadge}
            >
              <Ionicons name="trophy" size={14} color="#000" />
              <Text style={styles.bestBadgeText}>Best Photo</Text>
            </LinearGradient>
          </View>
          <Image
            source={{ uri: bestPhoto.uri }}
            style={styles.bestPhotoImage}
          />
          <View style={styles.bestPhotoScoreRow}>
            <Text style={styles.bestPhotoScore}>{bestPhoto.overallScore}</Text>
            <Text style={styles.bestPhotoScoreLabel}>/100</Text>
          </View>

          {/* Score Breakdown */}
          <View style={styles.breakdownGrid}>
            {[
              { label: 'Lighting', score: bestPhoto.lightingScore, icon: 'sunny-outline' },
              { label: 'Angle', score: bestPhoto.angleScore, icon: 'resize-outline' },
              { label: 'Expression', score: bestPhoto.expressionScore, icon: 'happy-outline' },
              { label: 'Clarity', score: bestPhoto.clarityScore, icon: 'eye-outline' },
            ].map((metric, i) => (
              <Animated.View
                key={metric.label}
                entering={FadeInRight.duration(400).delay(300 + i * 100)}
                style={styles.breakdownItem}
              >
                <Ionicons name={metric.icon} size={16} color={COLORS.gold} />
                <Text style={styles.breakdownLabel}>{metric.label}</Text>
                <Text style={styles.breakdownScore}>{metric.score}/10</Text>
              </Animated.View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      {/* Full Ranking */}
      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <Text style={styles.sectionTitle}>Full Ranking</Text>
        {rankedPhotos.map((photo, index) => (
          <Animated.View
            key={photo.id}
            entering={FadeInDown.duration(400).delay(600 + index * 100)}
          >
            <GlassCard
              variant={photo.rank === 1 ? 'gold' : 'default'}
              style={styles.rankCard}
            >
              <View style={styles.rankRow}>
                {/* Rank Badge */}
                <LinearGradient
                  colors={getRankGradient(photo.rank)}
                  style={styles.rankBadge}
                >
                  <Text style={styles.rankBadgeText}>
                    {photo.rank <= 3 ? getMedalEmoji(photo.rank) : photo.rank}
                  </Text>
                </LinearGradient>

                {/* Photo Thumbnail */}
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.rankThumbnail}
                />

                {/* Score & Details */}
                <View style={styles.rankDetails}>
                  <View style={styles.rankScoreRow}>
                    <Text style={styles.rankScore}>{photo.overallScore}</Text>
                    <Text style={styles.rankScoreMax}>/100</Text>
                  </View>

                  {/* Mini Breakdown Bars */}
                  <View style={styles.miniBreakdown}>
                    {[
                      { label: 'LGT', value: photo.lightingScore },
                      { label: 'ANG', value: photo.angleScore },
                      { label: 'EXP', value: photo.expressionScore },
                      { label: 'CLR', value: photo.clarityScore },
                    ].map((m) => (
                      <View key={m.label} style={styles.miniBarRow}>
                        <Text style={styles.miniBarLabel}>{m.label}</Text>
                        <View style={styles.miniBarBg}>
                          <View
                            style={[
                              styles.miniBarFill,
                              {
                                width: `${m.value * 10}%`,
                                backgroundColor:
                                  m.value >= 8
                                    ? COLORS.scoreHigh
                                    : m.value >= 6
                                    ? COLORS.scoreMid
                                    : COLORS.scoreLow,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Best For Label */}
                  <View style={styles.bestForBadge}>
                    <Ionicons name="checkmark-circle" size={10} color={COLORS.accent} />
                    <Text style={styles.bestForText}>{getBestForLabel(photo)}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Tips Section */}
      <Animated.View entering={FadeInDown.duration(500).delay(900)}>
        <Text style={styles.sectionTitle}>Analysis Tips</Text>
        <GlassCard variant="accent" style={styles.tipsCard}>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={16} color={COLORS.accentLight} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.duration(500).delay(1000)}>
        <View style={styles.actionsContainer}>
          <GlassButton
            title="Save Ranking"
            icon="download-outline"
            variant="primary"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Saved', 'Your photo ranking has been saved.');
            }}
            style={styles.actionBtn}
          />
          <GlassButton
            title="Rank More Photos"
            icon="refresh-outline"
            variant="secondary"
            onPress={onReset}
            style={styles.actionBtn}
          />
          <GlassButton
            title="Back"
            icon="arrow-back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
        </View>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────
const PhotoRankingScreen = ({ navigation }) => {
  const [phase, setPhase] = useState('upload');
  const [photos, setPhotos] = useState([]);
  const [rankedPhotos, setRankedPhotos] = useState([]);
  const [analysisStep, setAnalysisStep] = useState(0);

  const addPhoto = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum Reached', `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const asset = result.assets[0];
        setPhotos((prev) => [
          ...prev,
          { uri: asset.uri, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  }, [photos.length]);

  const removePhoto = useCallback((id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const startAnalysis = useCallback(() => {
    if (photos.length < MIN_PHOTOS) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('analyzing');
    setAnalysisStep(0);

    // Simulate analysis progress
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        // Generate results and transition
        const ranked = generatePhotoScores(photos);
        setRankedPhotos(ranked);
        setPhase('results');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setAnalysisStep(step);
      }
    }, 750);
  }, [photos]);

  const resetToUpload = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('upload');
    setPhotos([]);
    setRankedPhotos([]);
    setAnalysisStep(0);
  }, []);

  return (
    <GlassBackground variant="gold">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <GlassCard style={styles.backBtnCard} borderRadius={20}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </GlassCard>
          </AnimatedPressable>
          <Text style={styles.headerTitle}>
            {phase === 'results' ? 'Results' : 'Photo Ranking'}
          </Text>
          <View style={styles.headerProBadge}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.headerProGrad}>
              <Text style={styles.headerProText}>PRO</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Phase Content */}
        {phase === 'upload' && (
          <UploadPhase
            photos={photos}
            onAddPhoto={addPhoto}
            onRemovePhoto={removePhoto}
            onStartAnalysis={startAnalysis}
          />
        )}
        {phase === 'analyzing' && (
          <AnalyzingPhase photos={photos} analysisStep={analysisStep} />
        )}
        {phase === 'results' && (
          <ResultsPhase
            rankedPhotos={rankedPhotos}
            onReset={resetToUpload}
            navigation={navigation}
          />
        )}
      </SafeAreaView>
    </GlassBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {},
  backBtnCard: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerProBadge: {},
  headerProGrad: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerProText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },

  // Hero
  heroCard: {
    marginBottom: 24,
  },
  heroContent: {
    padding: 20,
    alignItems: 'center',
  },
  heroIconRow: {
    marginBottom: 14,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },

  // Photo Grid
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoSlot: {
    width: PHOTO_SLOT_SIZE,
    height: PHOTO_SLOT_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    backgroundColor: COLORS.bgGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlotText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontWeight: '600',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
  },
  removeBtnInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndex: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  // Add Photo Button
  addPhotoBtn: {
    marginBottom: 16,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  ctaHint: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // Analyzing Phase
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  analyzingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  analyzingPhotosRow: {
    marginBottom: 32,
  },
  analyzingThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  progressContainer: {
    width: '100%',
  },
  progressCard: {
    padding: 20,
    alignItems: 'center',
  },
  analysisStepText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accentLight,
    marginBottom: 14,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.bgCard,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Results — Best Photo
  bestPhotoCard: {
    marginBottom: 24,
  },
  bestPhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  crownEmoji: {
    fontSize: 28,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  bestPhotoImage: {
    width: width - 44,
    height: width - 44,
    borderRadius: 14,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  bestPhotoScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  bestPhotoScore: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.gold,
  },
  bestPhotoScoreLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 16,
    marginTop: 8,
    gap: 8,
  },
  breakdownItem: {
    alignItems: 'center',
    width: '22%',
    gap: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Rank Card
  rankCard: {
    marginBottom: 10,
    padding: 12,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  rankThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rankDetails: {
    flex: 1,
  },
  rankScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  rankScore: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rankScoreMax: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 2,
  },

  // Mini Breakdown Bars
  miniBreakdown: {
    gap: 3,
    marginBottom: 6,
  },
  miniBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBarLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textTertiary,
    width: 24,
  },
  miniBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Best For Badge
  bestForBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,102,255,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bestForText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Tips Section
  tipsCard: {
    padding: 16,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Actions
  actionsContainer: {
    gap: 10,
  },
  actionBtn: {
    marginBottom: 0,
  },
});

export default PhotoRankingScreen;
