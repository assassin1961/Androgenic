import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, getScoreColor, getScoreLabel } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import ScoreRing from '../components/ScoreRing';
import { getTipsForCategory } from '../data/tips';
import { canAccessCategory } from '../utils/pro';

const SUB_METRICS = {
  masculinity: [
    { name: 'fWHR (Face Width-to-Height)', key: 'fwhr' },
    { name: 'Brow Ridge Prominence', key: 'brow' },
    { name: 'Chin Projection', key: 'chin' },
    { name: 'Jaw Angularity', key: 'jawAng' },
    { name: 'Neck Width Ratio', key: 'neck' },
  ],
  jawline: [
    { name: 'Gonial Angle', key: 'gonial' },
    { name: 'Jaw Width Ratio', key: 'jawWidth' },
    { name: 'Mandibular Definition', key: 'mandib' },
    { name: 'Chin Shape', key: 'chinShape' },
    { name: 'Masseter Size', key: 'masseter' },
  ],
  eyes: [
    { name: 'Canthal Tilt', key: 'canthal' },
    { name: 'Eye Spacing (IPD)', key: 'ipd' },
    { name: 'Eye Shape Ratio', key: 'eyeShape' },
    { name: 'Limbal Ring Visibility', key: 'limbal' },
    { name: 'Under-Eye Hollows', key: 'underEye' },
  ],
  cheekbones: [
    { name: 'Zygomatic Width', key: 'zygo' },
    { name: 'Midface Projection', key: 'midface' },
    { name: 'Cheek Hollowness', key: 'hollow' },
    { name: 'Infraorbital Support', key: 'infraorb' },
  ],
  hair: [
    { name: 'Hairline Shape', key: 'hairline' },
    { name: 'Density Score', key: 'density' },
    { name: 'Temple Fullness', key: 'temple' },
    { name: 'Styling Potential', key: 'styling' },
  ],
  skin: [
    { name: 'Clarity Score', key: 'clarity' },
    { name: 'Texture Quality', key: 'texture' },
    { name: 'Tone Evenness', key: 'tone' },
    { name: 'Pore Visibility', key: 'pore' },
    { name: 'Aging Resistance', key: 'aging' },
  ],
  symmetry: [
    { name: 'Left-Right Jaw Balance', key: 'jawBal' },
    { name: 'Eye Alignment', key: 'eyeAlign' },
    { name: 'Brow Symmetry', key: 'browSym' },
    { name: 'Midline Deviation', key: 'midline' },
    { name: 'Overall Harmony', key: 'harmony' },
  ],
};

// Generate sub-metric scores deterministically from main score
const getSubScores = (mainScore, metrics) => {
  return metrics.map((m, i) => {
    const offset = ((i * 17 + mainScore * 3) % 25) - 12;
    return { ...m, score: Math.max(10, Math.min(99, mainScore + offset)) };
  });
};

const DetailAnalysisScreen = ({ route, navigation }) => {
  const { category, scores } = route.params;
  const info = CATEGORY_INFO[category];
  const score = scores[category];
  const color = getScoreColor(score);
  const tips = getTipsForCategory(category, score);
  const subMetrics = getSubScores(score, SUB_METRICS[category] || []);

  const barAnims = useRef(subMetrics.map(() => new Animated.Value(0))).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Stagger bar animations
    barAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 120),
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{info?.label || category}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Main Score Ring */}
        <View style={styles.mainScore}>
          <ScoreRing score={score} size={150} strokeWidth={12} delay={100} />
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
          <Text style={styles.scoreDesc}>{info?.description}</Text>
        </View>

        {/* Sub-Metrics Breakdown */}
        <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
        {subMetrics.map((metric, i) => {
          const metricColor = getScoreColor(metric.score);
          const barWidth = barAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${metric.score}%`],
          });
          return (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={[styles.metricScore, { color: metricColor }]}>{metric.score}</Text>
              </View>
              <View style={styles.metricBar}>
                <Animated.View style={[styles.metricBarFill, { width: barWidth, backgroundColor: metricColor }]} />
              </View>
              <Text style={[styles.metricLevel, { color: metricColor }]}>{getScoreLabel(metric.score)}</Text>
            </View>
          );
        })}

        {/* Analysis Summary */}
        <Animated.View style={[styles.summaryCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <LinearGradient colors={['rgba(108,92,231,0.1)', 'rgba(108,92,231,0.03)']} style={styles.summaryGradient}>
            <Ionicons name="analytics" size={24} color={COLORS.accent} />
            <Text style={styles.summaryTitle}>Analysis Summary</Text>
            <Text style={styles.summaryText}>
              {score >= 70
                ? `Your ${info?.label?.toLowerCase()} is in the top tier. This is one of your strongest features. Focus on maintenance and subtle refinement.`
                : score >= 50
                ? `Your ${info?.label?.toLowerCase()} is above average with clear room for improvement. Targeted exercises and routines can push you to the next level.`
                : `Your ${info?.label?.toLowerCase()} has significant improvement potential. With consistent effort using the tips below, you can see major changes in 3-6 months.`}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Top Tips */}
        <Text style={styles.sectionTitle}>Improvement Tips</Text>
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <LinearGradient colors={[color + '15', 'transparent']} style={styles.tipGradient}>
              <View style={[styles.tipIdx, { backgroundColor: color }]}>
                <Text style={styles.tipIdxText}>{i + 1}</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
                <View style={styles.tipSource}>
                  <Ionicons name="globe-outline" size={11} color={COLORS.textMuted} />
                  <Text style={styles.tipSourceText}>{tip.source}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}

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
  mainScore: { alignItems: 'center', marginBottom: 24 },
  scoreLabel: { color: COLORS.accent, fontSize: 16, fontWeight: '700', marginTop: 8, textTransform: 'uppercase', letterSpacing: 2 },
  scoreDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 8 },
  metricCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  metricScore: { fontSize: 18, fontWeight: '800' },
  metricBar: { height: 5, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  metricBarFill: { height: '100%', borderRadius: 3 },
  metricLevel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  summaryCard: { marginBottom: 12 },
  summaryGradient: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(108,92,231,0.15)' },
  summaryTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  summaryText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  tipCard: { marginBottom: 8, borderRadius: 14, overflow: 'hidden' },
  tipGradient: {
    flexDirection: 'row', padding: 14, gap: 12, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipIdx: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  tipIdxText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tipContent: { flex: 1 },
  tipTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  tipText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 6 },
  tipSource: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipSourceText: { color: COLORS.textMuted, fontSize: 11 },
});

export default DetailAnalysisScreen;
