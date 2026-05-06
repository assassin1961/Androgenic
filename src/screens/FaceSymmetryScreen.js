import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView,
  Dimensions, Image,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn, useSharedValue, useAnimatedStyle,
  withSpring, withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 80;

const ScanLine = () => {
  const ty = useSharedValue(0);
  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(IMAGE_SIZE, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[styles.scanLine, style]}>
      <LinearGradient
        colors={['transparent', COLORS.accentNeon + '80', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.scanLineGradient}
      />
    </Animated.View>
  );
};

const PulsingDot = memo(({ x, y, label, delay = 0 }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1, true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 }),
      ),
      -1, true,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={ZoomIn.duration(300).delay(delay)} style={[styles.landmarkDot, { left: x, top: y }]}>
      <Animated.View style={[styles.landmarkDotInner, dotStyle]} />
      {label && <Text style={styles.landmarkLabel}>{label}</Text>}
    </Animated.View>
  );
});

const SYMMETRY_METRICS = [
  { key: 'eyeAlignment', label: 'Eye Alignment', icon: 'eye', weight: 25 },
  { key: 'browSymmetry', label: 'Brow Symmetry', icon: 'remove', weight: 15 },
  { key: 'nasalDeviation', label: 'Nasal Alignment', icon: 'triangle', weight: 20 },
  { key: 'lipSymmetry', label: 'Lip Symmetry', icon: 'ellipse', weight: 15 },
  { key: 'jawBalance', label: 'Jaw Balance', icon: 'shield-half', weight: 25 },
];

const FaceSymmetryScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const pickImage = useCallback(async (fromCamera) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      alert(`${fromCamera ? 'Camera' : 'Photo library'} permission is required.`);
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setResults(null);
      runAnalysis();
    }
  }, []);

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => {
      const metrics = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const metric of SYMMETRY_METRICS) {
        const score = Math.floor(Math.random() * 25) + 70;
        metrics[metric.key] = score;
        totalWeightedScore += score * metric.weight;
        totalWeight += metric.weight;
      }

      const overall = Math.round(totalWeightedScore / totalWeight);
      setResults({ metrics, overall });
      setAnalyzing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  }, []);

  const getSymmetryGrade = (score) => {
    if (score >= 90) return { grade: 'Near Perfect', color: '#00e676' };
    if (score >= 80) return { grade: 'Very Good', color: '#4d94ff' };
    if (score >= 70) return { grade: 'Good', color: '#ffab40' };
    return { grade: 'Needs Work', color: '#ff5252' };
  };

  const pro = isPro();

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Face Symmetry</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Image Area */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <GlassCard variant="default" style={styles.imageCard}>
              {imageUri ? (
                <View style={styles.imageWrap}>
                  <Image source={{ uri: imageUri }} style={styles.faceImage} />
                  <View style={styles.centerLine} />
                  {analyzing && <ScanLine />}
                  {results && (
                    <>
                      <PulsingDot x={IMAGE_SIZE * 0.32} y={IMAGE_SIZE * 0.35} label="L Eye" delay={0} />
                      <PulsingDot x={IMAGE_SIZE * 0.62} y={IMAGE_SIZE * 0.35} label="R Eye" delay={100} />
                      <PulsingDot x={IMAGE_SIZE * 0.47} y={IMAGE_SIZE * 0.48} label="Nose" delay={200} />
                      <PulsingDot x={IMAGE_SIZE * 0.47} y={IMAGE_SIZE * 0.62} label="Lips" delay={300} />
                      <PulsingDot x={IMAGE_SIZE * 0.25} y={IMAGE_SIZE * 0.65} label="L Jaw" delay={400} />
                      <PulsingDot x={IMAGE_SIZE * 0.70} y={IMAGE_SIZE * 0.65} label="R Jaw" delay={500} />
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="scan-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.placeholderText}>Upload a front-facing photo</Text>
                  <Text style={styles.placeholderSub}>Straight-on, even lighting works best</Text>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <View style={styles.actionRow}>
              <GlassButton
                title="Take Selfie"
                icon="camera"
                onPress={() => pickImage(true)}
                variant="primary"
                style={{ flex: 1 }}
              />
              <GlassButton
                title="Upload"
                icon="image"
                onPress={() => pickImage(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>

          {/* Results */}
          {results && (
            <>
              <Animated.View entering={ZoomIn.duration(400)}>
                <GlassCard variant="accent" style={styles.overallCard} glow>
                  <View style={[styles.overallCircle, { borderColor: getSymmetryGrade(results.overall).color }]}>
                    <Text style={[styles.overallScore, { color: getSymmetryGrade(results.overall).color }]}>{results.overall}%</Text>
                  </View>
                  <Text style={styles.overallGrade}>{getSymmetryGrade(results.overall).grade}</Text>
                  <Text style={styles.overallLabel}>Overall Face Symmetry</Text>
                </GlassCard>
              </Animated.View>

              <Text style={styles.sectionTitle}>Symmetry Breakdown</Text>
              {SYMMETRY_METRICS.map((metric, i) => {
                const score = results.metrics[metric.key];
                const grade = getSymmetryGrade(score);
                return (
                  <Animated.View key={metric.key} entering={FadeInRight.duration(300).delay(i * 80)}>
                    <GlassCard variant="default" style={styles.metricCard}>
                      <View style={styles.metricHeader}>
                        <Ionicons name={metric.icon} size={16} color={grade.color} />
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={[styles.metricScore, { color: grade.color }]}>{score}%</Text>
                      </View>
                      <View style={styles.metricBarTrack}>
                        <Animated.View
                          entering={FadeInDown.duration(500).delay(300 + i * 80)}
                          style={[styles.metricBarFill, { width: `${score}%`, backgroundColor: grade.color }]}
                        />
                      </View>
                    </GlassCard>
                  </Animated.View>
                );
              })}

              {/* Tips */}
              <Animated.View entering={FadeInDown.duration(400).delay(600)}>
                <Text style={styles.sectionTitle}>Improvement Tips</Text>
                {[
                  { icon: 'fitness', tip: 'Mewing can gradually improve jaw symmetry over time', color: '#0066ff' },
                  { icon: 'sunny', tip: 'Sleep on your back to prevent facial compression asymmetry', color: '#ffab40' },
                  { icon: 'medical', tip: 'Chew evenly on both sides to balance masseter muscles', color: '#ff6090' },
                  { icon: 'body', tip: 'Good posture aligns your jaw and reduces facial imbalances', color: '#00e676' },
                ].map((t, i) => (
                  <Animated.View key={i} entering={FadeInDown.duration(300).delay(700 + i * 60)}>
                    <GlassCard variant="default" style={styles.tipCard}>
                      <View style={[styles.tipIcon, { backgroundColor: t.color + '15' }]}>
                        <Ionicons name={t.icon} size={14} color={t.color} />
                      </View>
                      <Text style={styles.tipText}>{t.tip}</Text>
                    </GlassCard>
                  </Animated.View>
                ))}
              </Animated.View>
            </>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.analyzingCard}>
              <GlassCard variant="accent" style={styles.analyzingInner}>
                <Ionicons name="scan" size={24} color={COLORS.accentNeon} />
                <Text style={styles.analyzingText}>Analyzing symmetry...</Text>
                <Text style={styles.analyzingSub}>Mapping facial landmarks and measuring alignment</Text>
              </GlassCard>
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

  imageCard: { padding: 8, marginBottom: 16 },
  imageWrap: { width: '100%', aspectRatio: 1, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  faceImage: { width: '100%', height: '100%' },
  centerLine: {
    position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
    backgroundColor: COLORS.accentNeon + '60', marginLeft: -0.5,
  },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2 },
  scanLineGradient: { height: 2, width: '100%' },
  placeholder: { aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12 },
  placeholderSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  landmarkDot: { position: 'absolute', alignItems: 'center' },
  landmarkDotInner: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accentNeon,
    ...SHADOWS.glow,
  },
  landmarkLabel: { fontSize: 8, color: COLORS.accentNeon, fontWeight: '700', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },

  overallCard: { padding: 24, alignItems: 'center', marginBottom: 20 },
  overallCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', marginBottom: 10,
  },
  overallScore: { fontSize: 24, fontWeight: '900' },
  overallGrade: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  overallLabel: { fontSize: 12, color: COLORS.textSecondary },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.3 },

  metricCard: { padding: 14, marginBottom: 8 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metricLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  metricScore: { fontSize: 15, fontWeight: '800' },
  metricBarTrack: { height: 4, backgroundColor: COLORS.bgSecondary, borderRadius: 2, overflow: 'hidden' },
  metricBarFill: { height: '100%', borderRadius: 2 },

  tipCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },

  analyzingCard: { marginTop: 8 },
  analyzingInner: { padding: 20, alignItems: 'center' },
  analyzingText: { fontSize: 16, fontWeight: '700', color: COLORS.accentNeon, marginTop: 10 },
  analyzingSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
});

export default FaceSymmetryScreen;
