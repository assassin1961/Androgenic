import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

// ─── Face Pairs Data ─────────────────────────────────────────────────
const FACE_PAIRS = [
  // Pair 1 — Easy (large score gap)
  {
    a: { id: 'f1a', gender: 'M', age: 26, features: 'Strong jawline, deep-set eyes, high cheekbones, symmetrical face', score: 8.4, emoji: '👨', ethnicity: 'European' },
    b: { id: 'f1b', gender: 'M', age: 31, features: 'Rounded jaw, narrow-set eyes, flat midface, slight asymmetry', score: 5.2, emoji: '🧔', ethnicity: 'European' },
  },
  // Pair 2 — Medium
  {
    a: { id: 'f2a', gender: 'F', age: 24, features: 'Almond eyes, defined brow ridge, full lips, clear skin', score: 8.1, emoji: '👩', ethnicity: 'East Asian' },
    b: { id: 'f2b', gender: 'F', age: 22, features: 'Round eyes, soft brow, thin lips, smooth complexion', score: 6.8, emoji: '👧', ethnicity: 'East Asian' },
  },
  // Pair 3 — Hard (close scores)
  {
    a: { id: 'f3a', gender: 'M', age: 28, features: 'Wide cheekbones, pronounced gonial angle, hunter eyes, forward growth', score: 7.9, emoji: '👨', ethnicity: 'African' },
    b: { id: 'f3b', gender: 'M', age: 27, features: 'Defined zygomatic arch, strong brow ridge, balanced thirds, lean face', score: 7.6, emoji: '🧑', ethnicity: 'African' },
  },
  // Pair 4 — Easy
  {
    a: { id: 'f4a', gender: 'F', age: 23, features: 'V-shaped jaw, large eyes, button nose, youthful proportions', score: 8.7, emoji: '👩', ethnicity: 'South Asian' },
    b: { id: 'f4b', gender: 'F', age: 29, features: 'Square jaw, average eye spacing, wide nose bridge, mature look', score: 5.9, emoji: '👩', ethnicity: 'South Asian' },
  },
  // Pair 5 — Medium
  {
    a: { id: 'f5a', gender: 'M', age: 25, features: 'Chiseled mandible, positive canthal tilt, compact midface', score: 8.2, emoji: '👨', ethnicity: 'Latin American' },
    b: { id: 'f5b', gender: 'M', age: 30, features: 'Defined chin, neutral canthal tilt, balanced proportions', score: 7.0, emoji: '🧑', ethnicity: 'Latin American' },
  },
  // Pair 6 — Hard
  {
    a: { id: 'f6a', gender: 'F', age: 26, features: 'High brow, upturned nose, full cheeks, heart-shaped face', score: 7.5, emoji: '👩', ethnicity: 'Middle Eastern' },
    b: { id: 'f6b', gender: 'F', age: 25, features: 'Arched brows, straight nose, defined cheekbones, oval face', score: 7.3, emoji: '👩', ethnicity: 'Middle Eastern' },
  },
  // Pair 7 — Easy
  {
    a: { id: 'f7a', gender: 'M', age: 24, features: 'Square jaw, hooded eyes, prominent chin, lean physique', score: 8.5, emoji: '👨', ethnicity: 'European' },
    b: { id: 'f7b', gender: 'M', age: 34, features: 'Receding jaw, droopy eyelids, weak chin, rounded face', score: 4.8, emoji: '🧔', ethnicity: 'European' },
  },
  // Pair 8 — Medium
  {
    a: { id: 'f8a', gender: 'F', age: 21, features: 'Fox eyes, sculpted brows, high nasal bridge, radiant skin', score: 8.0, emoji: '👩', ethnicity: 'East Asian' },
    b: { id: 'f8b', gender: 'F', age: 27, features: 'Doe eyes, natural brows, small nose, porcelain skin', score: 6.9, emoji: '👧', ethnicity: 'East Asian' },
  },
  // Pair 9 — Hard
  {
    a: { id: 'f9a', gender: 'M', age: 29, features: 'Angular face, deep brow ridge, sharp nose, balanced facial thirds', score: 7.7, emoji: '🧑', ethnicity: 'South Asian' },
    b: { id: 'f9b', gender: 'M', age: 26, features: 'Oval face, moderate brow ridge, aquiline nose, even proportions', score: 7.4, emoji: '👨', ethnicity: 'South Asian' },
  },
  // Pair 10 — Easy
  {
    a: { id: 'f10a', gender: 'F', age: 22, features: 'Defined jawline, large almond eyes, small upturned nose, glowing skin', score: 8.9, emoji: '👩', ethnicity: 'African' },
    b: { id: 'f10b', gender: 'F', age: 30, features: 'Soft jawline, round eyes, broad nose, even skin tone', score: 6.1, emoji: '👩', ethnicity: 'African' },
  },
  // Pair 11 — Medium
  {
    a: { id: 'f11a', gender: 'M', age: 27, features: 'Broad shoulders, sharp mandible, positive canthal tilt, hollow cheeks', score: 8.3, emoji: '👨', ethnicity: 'Middle Eastern' },
    b: { id: 'f11b', gender: 'M', age: 25, features: 'Athletic build, angular jaw, neutral canthal tilt, lean face', score: 7.1, emoji: '🧑', ethnicity: 'Middle Eastern' },
  },
  // Pair 12 — Hard
  {
    a: { id: 'f12a', gender: 'F', age: 25, features: 'Cat eyes, sculpted cheekbones, narrow nose, pouty lips', score: 8.0, emoji: '👩', ethnicity: 'Latin American' },
    b: { id: 'f12b', gender: 'F', age: 23, features: 'Round eyes, high cheekbones, petite nose, full lips', score: 7.8, emoji: '👧', ethnicity: 'Latin American' },
  },
  // Pair 13 — Easy
  {
    a: { id: 'f13a', gender: 'M', age: 23, features: 'Model-tier jawline, intense eyes, ramus length, forward maxilla', score: 9.1, emoji: '👨', ethnicity: 'European' },
    b: { id: 'f13b', gender: 'M', age: 32, features: 'Average jaw definition, mild under-eye hollows, recessed chin', score: 5.5, emoji: '🧔', ethnicity: 'European' },
  },
  // Pair 14 — Medium
  {
    a: { id: 'f14a', gender: 'F', age: 20, features: 'Youthful glow, defined nasolabial folds, bright eyes, slim nose', score: 7.8, emoji: '👧', ethnicity: 'South Asian' },
    b: { id: 'f14b', gender: 'F', age: 28, features: 'Mature elegance, soft features, warm eyes, balanced face', score: 6.5, emoji: '👩', ethnicity: 'South Asian' },
  },
  // Pair 15 — Hard
  {
    a: { id: 'f15a', gender: 'M', age: 26, features: 'Prominent zygomatic bones, deep-set eyes, strong ramus, lean', score: 8.1, emoji: '🧑', ethnicity: 'African' },
    b: { id: 'f15b', gender: 'M', age: 28, features: 'Wide zygomatic arch, almond eyes, defined gonial angle, fit', score: 7.9, emoji: '👨', ethnicity: 'African' },
  },
];

// ─── Component ───────────────────────────────────────────────────────
const CalibrationScreen = ({ navigation }) => {
  const [phase, setPhase] = useState('intro');
  const [currentPair, setCurrentPair] = useState(0);
  const [selections, setSelections] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);

  const scaleA = useSharedValue(1);
  const scaleB = useSharedValue(1);
  const glowA = useSharedValue(0);
  const glowB = useSharedValue(0);

  const animatedStyleA = useAnimatedStyle(() => ({
    transform: [{ scale: scaleA.value }],
    shadowColor: COLORS.accent,
    shadowOpacity: glowA.value,
    shadowRadius: 20,
    elevation: glowA.value > 0 ? 12 : 0,
  }));

  const animatedStyleB = useAnimatedStyle(() => ({
    transform: [{ scale: scaleB.value }],
    shadowColor: COLORS.accent,
    shadowOpacity: glowB.value,
    shadowRadius: 20,
    elevation: glowB.value > 0 ? 12 : 0,
  }));

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartTime(Date.now());
    setPhase('comparing');
  }, []);

  const handleSelect = useCallback((side) => {
    if (selectedSide !== null) return;
    setSelectedSide(side);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const pair = FACE_PAIRS[currentPair];
    const selectedFace = side === 'a' ? pair.a : pair.b;

    if (side === 'a') {
      scaleA.value = withSequence(
        withSpring(1.08, { damping: 8, stiffness: 200 }),
        withSpring(1.03, { damping: 12, stiffness: 180 }),
      );
      glowA.value = withTiming(0.6, { duration: 300 });
      scaleB.value = withTiming(0.92, { duration: 300 });
      glowB.value = withTiming(0, { duration: 200 });
    } else {
      scaleB.value = withSequence(
        withSpring(1.08, { damping: 8, stiffness: 200 }),
        withSpring(1.03, { damping: 12, stiffness: 180 }),
      );
      glowB.value = withTiming(0.6, { duration: 300 });
      scaleA.value = withTiming(0.92, { duration: 300 });
      glowA.value = withTiming(0, { duration: 200 });
    }

    setSelections((prev) => [...prev, selectedFace.id]);

    setTimeout(() => {
      scaleA.value = withSpring(1, { damping: 14, stiffness: 160 });
      scaleB.value = withSpring(1, { damping: 14, stiffness: 160 });
      glowA.value = withTiming(0, { duration: 200 });
      glowB.value = withTiming(0, { duration: 200 });
      setSelectedSide(null);

      if (currentPair < FACE_PAIRS.length - 1) {
        setCurrentPair((prev) => prev + 1);
      } else {
        setPhase('complete');
      }
    }, 600);
  }, [currentPair, selectedSide, scaleA, scaleB, glowA, glowB]);

  const handleSkip = useCallback(() => {
    Haptics.selectionAsync();
    setSelections((prev) => [...prev, null]);
    if (currentPair < FACE_PAIRS.length - 1) {
      setCurrentPair((prev) => prev + 1);
    } else {
      setPhase('complete');
    }
  }, [currentPair]);

  const handleRecalibrate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('intro');
    setCurrentPair(0);
    setSelections([]);
    setStartTime(null);
    setSelectedSide(null);
  }, []);

  // Calculate accuracy — "correct" = picked the face with the higher hidden score
  const calculateAccuracy = () => {
    let correct = 0;
    let answered = 0;
    selections.forEach((selectedId, i) => {
      if (!selectedId) return;
      answered++;
      const pair = FACE_PAIRS[i];
      const higherScoreFace = pair.a.score >= pair.b.score ? pair.a : pair.b;
      if (selectedId === higherScoreFace.id) correct++;
    });
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
  };

  const getElapsedTime = () => {
    if (!startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = ((currentPair + (phase === 'complete' ? 1 : 0)) / FACE_PAIRS.length) * 100;

  // ─── Intro Phase ─────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <GlassBackground variant="blue">
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />

          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Calibration</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.introIconWrap}>
              <LinearGradient colors={GRADIENTS.glassAccent} style={styles.introIconBg}>
                <Ionicons name="analytics-outline" size={48} color={COLORS.accent} />
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Text style={styles.introTitle}>Calibrate Your Model</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)}>
              <Text style={styles.introDesc}>
                Help train our AI by comparing faces. Your choices calibrate the scoring model for more accurate results.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(400)}>
              <GlassCard style={styles.introStatsCard}>
                <View style={styles.introStatRow}>
                  <View style={styles.introStatItem}>
                    <View style={styles.introStatIcon}>
                      <Ionicons name="git-compare-outline" size={20} color={COLORS.accent} />
                    </View>
                    <Text style={styles.introStatValue}>15</Text>
                    <Text style={styles.introStatLabel}>Comparisons</Text>
                  </View>
                  <View style={styles.introStatDivider} />
                  <View style={styles.introStatItem}>
                    <View style={styles.introStatIcon}>
                      <Ionicons name="time-outline" size={20} color={COLORS.accent} />
                    </View>
                    <Text style={styles.introStatValue}>~2 min</Text>
                    <Text style={styles.introStatLabel}>Estimated</Text>
                  </View>
                  <View style={styles.introStatDivider} />
                  <View style={styles.introStatItem}>
                    <View style={styles.introStatIcon}>
                      <Ionicons name="sparkles-outline" size={20} color={COLORS.accent} />
                    </View>
                    <Text style={styles.introStatValue}>+15%</Text>
                    <Text style={styles.introStatLabel}>Accuracy</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(500)}>
              <GlassCard variant="light" style={styles.introInfoCard}>
                <View style={styles.introInfoRow}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.introInfoText}>
                    You will see two face profiles side by side. Tap the one you find more attractive. There are no wrong answers — your preferences help personalize the analysis.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.introCTAWrap}>
              <AnimatedPressable onPress={handleStart} style={styles.introCTA}>
                <LinearGradient
                  colors={GRADIENTS.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.introCTAGrad}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.introCTAText}>Start Calibration</Text>
                </LinearGradient>
              </AnimatedPressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </GlassBackground>
    );
  }

  // ─── Comparing Phase ────────────────────────────────────────────
  if (phase === 'comparing') {
    const pair = FACE_PAIRS[currentPair];

    return (
      <GlassBackground variant="blue">
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Header with progress */}
          <View style={styles.compHeader}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <View style={styles.compHeaderCenter}>
              <Text style={styles.compHeaderTitle}>{currentPair + 1}/{FACE_PAIRS.length} Comparisons</Text>
            </View>
            <AnimatedPressable onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </AnimatedPressable>
          </View>

          {/* Progress bar */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.max(progressPct, 2)}%` }]}
              />
            </View>
          </Animated.View>

          {/* Instruction */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.compInstruction}>Which face is more attractive?</Text>
          </Animated.View>

          {/* Face cards */}
          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.cardsRow} key={`pair-${currentPair}`}>
            {/* Face A */}
            <Animated.View style={[styles.cardWrap, animatedStyleA]}>
              <AnimatedPressable
                onPress={() => handleSelect('a')}
                disabled={selectedSide !== null}
                scaleDown={0.97}
              >
                <GlassCard
                  variant={selectedSide === 'a' ? 'accent' : 'default'}
                  glow={selectedSide === 'a'}
                  style={styles.faceCard}
                >
                  <Text style={styles.faceEmoji}>{pair.a.emoji}</Text>
                  <Text style={styles.faceLabel}>Face A</Text>

                  <View style={styles.pillsRow}>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{pair.a.age}y</Text>
                    </View>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{pair.a.gender === 'M' ? 'Male' : 'Female'}</Text>
                    </View>
                  </View>
                  <View style={styles.pillsRow}>
                    <View style={[styles.pill, styles.pillWide]}>
                      <Text style={styles.pillText}>{pair.a.ethnicity}</Text>
                    </View>
                  </View>

                  <Text style={styles.featureText}>{pair.a.features}</Text>

                  <View style={styles.tapHint}>
                    <Ionicons name="finger-print-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.tapHintText}>Tap to select</Text>
                  </View>

                  {selectedSide === 'a' && (
                    <Animated.View entering={ZoomIn.duration(300)} style={styles.selectedBadge}>
                      <LinearGradient colors={GRADIENTS.accent} style={styles.selectedBadgeGrad}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </LinearGradient>
                    </Animated.View>
                  )}
                </GlassCard>
              </AnimatedPressable>
            </Animated.View>

            {/* VS divider */}
            <View style={styles.vsDivider}>
              <View style={styles.vsLine} />
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.vsLine} />
            </View>

            {/* Face B */}
            <Animated.View style={[styles.cardWrap, animatedStyleB]}>
              <AnimatedPressable
                onPress={() => handleSelect('b')}
                disabled={selectedSide !== null}
                scaleDown={0.97}
              >
                <GlassCard
                  variant={selectedSide === 'b' ? 'accent' : 'default'}
                  glow={selectedSide === 'b'}
                  style={styles.faceCard}
                >
                  <Text style={styles.faceEmoji}>{pair.b.emoji}</Text>
                  <Text style={styles.faceLabel}>Face B</Text>

                  <View style={styles.pillsRow}>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{pair.b.age}y</Text>
                    </View>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{pair.b.gender === 'M' ? 'Male' : 'Female'}</Text>
                    </View>
                  </View>
                  <View style={styles.pillsRow}>
                    <View style={[styles.pill, styles.pillWide]}>
                      <Text style={styles.pillText}>{pair.b.ethnicity}</Text>
                    </View>
                  </View>

                  <Text style={styles.featureText}>{pair.b.features}</Text>

                  <View style={styles.tapHint}>
                    <Ionicons name="finger-print-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.tapHintText}>Tap to select</Text>
                  </View>

                  {selectedSide === 'b' && (
                    <Animated.View entering={ZoomIn.duration(300)} style={styles.selectedBadge}>
                      <LinearGradient colors={GRADIENTS.accent} style={styles.selectedBadgeGrad}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </LinearGradient>
                    </Animated.View>
                  )}
                </GlassCard>
              </AnimatedPressable>
            </Animated.View>
          </Animated.View>

          {/* Bottom hint */}
          <Animated.View entering={FadeIn.duration(400).delay(500)} style={styles.bottomHint}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.bottomHintText}>All data is anonymized and used only for model training</Text>
          </Animated.View>
        </SafeAreaView>
      </GlassBackground>
    );
  }

  // ─── Complete Phase ─────────────────────────────────────────────
  const accuracy = calculateAccuracy();
  const elapsedTime = getElapsedTime();
  const answered = selections.filter(Boolean).length;

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <ScrollView contentContainerStyle={styles.completeScroll} showsVerticalScrollIndicator={false}>
          {/* Checkmark */}
          <Animated.View entering={ZoomIn.duration(600).delay(100)} style={styles.checkWrap}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.checkCircle}>
              <Ionicons name="checkmark-sharp" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Text style={styles.completeTitle}>Calibration Complete!</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <Text style={styles.completeDesc}>
              Your model is now calibrated for more accurate face analysis
            </Text>
          </Animated.View>

          {/* Accuracy ring */}
          <Animated.View entering={ZoomIn.duration(500).delay(500)}>
            <GlassCard variant="accent" glow style={styles.accuracyCard}>
              <Text style={styles.accuracyLabel}>ACCURACY</Text>
              <Text style={styles.accuracyValue}>{accuracy}%</Text>
              <View style={styles.accuracyBar}>
                <LinearGradient
                  colors={accuracy >= 70 ? ['#00e676', '#00c853'] : accuracy >= 40 ? ['#ffab40', '#ff9100'] : ['#ff5252', '#d50000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.accuracyBarFill, { width: `${Math.max(accuracy, 2)}%` }]}
                />
              </View>
              <Text style={styles.accuracyHint}>
                {accuracy >= 80 ? 'Excellent perception — your model is highly tuned' :
                 accuracy >= 60 ? 'Good calibration — your model is well adjusted' :
                 'Unique perspective — your preferences are noted'}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)}>
            <GlassCard style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="git-compare-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.statValue}>{answered}</Text>
                  <Text style={styles.statLabel}>Comparisons</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="timer-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.statValue}>{elapsedTime}</Text>
                  <Text style={styles.statLabel}>Time Taken</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.statValue}>{accuracy}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* CTAs */}
          <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.completeCTAs}>
            <AnimatedPressable onPress={() => navigation.navigate('Home')} style={styles.primaryCTA}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryCTAGrad}
              >
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text style={styles.primaryCTAText}>Start Face Scan</Text>
              </LinearGradient>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleRecalibrate} style={styles.secondaryCTA}>
              <Ionicons name="refresh-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.secondaryCTAText}>Recalibrate</Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ── Intro ──────────────────────────────────────────────────────
  introScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  introIconWrap: {
    marginBottom: 24,
  },
  introIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  introDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  introStatsCard: {
    padding: 20,
    marginBottom: 16,
    width: '100%',
  },
  introStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  introStatItem: {
    alignItems: 'center',
  },
  introStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,102,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  introStatValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  introStatLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  introStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  introInfoCard: {
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  introInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  introInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  introCTAWrap: {
    width: '100%',
  },
  introCTA: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  introCTAGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  introCTAText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Comparing ──────────────────────────────────────────────────
  compHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  compHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  compHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  progressWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compInstruction: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.2,
  },

  // Face cards
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    flex: 1,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
  faceCard: {
    padding: 16,
    alignItems: 'center',
  },
  faceEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  faceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pillWide: {
    paddingHorizontal: 14,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  tapHintText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  selectedBadgeGrad: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // VS divider
  vsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  vsLine: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  vsText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Bottom hint
  bottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 20,
    paddingTop: 12,
  },
  bottomHintText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },

  // ── Complete ───────────────────────────────────────────────────
  completeScroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  checkWrap: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  completeDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },

  // Accuracy card
  accuracyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  accuracyLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  accuracyValue: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  accuracyBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  accuracyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  accuracyHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },

  // Stats card
  statsCard: {
    padding: 20,
    marginBottom: 28,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // CTAs
  completeCTAs: {
    width: '100%',
    gap: 12,
  },
  primaryCTA: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryCTAGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryCTAText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  secondaryCTAText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CalibrationScreen;
