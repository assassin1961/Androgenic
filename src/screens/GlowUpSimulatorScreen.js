import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, Easing, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS, getScoreColor } from '../utils/theme';
import { isPro } from '../utils/pro';

const { width } = Dimensions.get('window');

const IMPROVEMENT_AREAS = [
  {
    id: 'jawline', label: 'Jawline', icon: 'fitness-outline', color: '#ff6b35',
    tips: ['Mewing 2+ hours/day', 'Chew mastic gum 1hr/day', 'Lose body fat to 12-15%', 'Neck curls 3x/week'],
    potentialGain: 12, timeline: '6-12 months',
  },
  {
    id: 'skin', label: 'Skin', icon: 'leaf-outline', color: '#00e676',
    tips: ['Tretinoin 0.05% nightly', 'SPF 50 daily', 'Vitamin C serum AM', 'Cut dairy & sugar'],
    potentialGain: 18, timeline: '3-6 months',
  },
  {
    id: 'eyes', label: 'Eye Area', icon: 'eye-outline', color: '#6c5ce7',
    tips: ['8+ hours sleep on back', 'Cold compress 5min/day', 'Caffeine eye cream PM', 'Stay hydrated 3L/day'],
    potentialGain: 8, timeline: '1-3 months',
  },
  {
    id: 'hair', label: 'Hair', icon: 'cut-outline', color: '#ffd93d',
    tips: ['Find ideal face-shape cut', 'Minoxidil if thinning', 'Biotin + zinc supplement', 'Scalp massage 5min/day'],
    potentialGain: 15, timeline: '3-6 months',
  },
  {
    id: 'symmetry', label: 'Symmetry', icon: 'git-compare-outline', color: '#00b4d8',
    tips: ['Sleep on back only', 'Chew evenly both sides', 'Posture correction daily', 'Facial yoga exercises'],
    potentialGain: 6, timeline: '6-12 months',
  },
  {
    id: 'cheekbones', label: 'Cheekbones', icon: 'diamond-outline', color: '#ff6090',
    tips: ['Hard mewing technique', 'Face fat reduction', 'Cheekbone exercises 3x/day', 'Gua sha massage'],
    potentialGain: 10, timeline: '6-18 months',
  },
  {
    id: 'masculinity', label: 'Masculinity', icon: 'shield-outline', color: '#ff4757',
    tips: ['Compound lifts 4x/week', 'Optimize testosterone naturally', 'Grow strategic facial hair', 'Build traps & neck'],
    potentialGain: 14, timeline: '3-12 months',
  },
];

const GlowUpSimulatorScreen = ({ route, navigation }) => {
  const scores = route.params?.scores || {};
  const imageUri = route.params?.imageUri;
  const pro = isPro();

  const [selectedArea, setSelectedArea] = useState(null);
  const [simulatorPhase, setSimulatorPhase] = useState('idle'); // idle, scanning, reveal
  const [projectedScores, setProjectedScores] = useState(null);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const progressAnims = useRef(IMPROVEMENT_AREAS.map(() => new Animated.Value(0))).current;
  const heroScale = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(IMPROVEMENT_AREAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrance animations
    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(200 + i * 80),
        Animated.spring(anim, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const runSimulation = () => {
    if (!pro) {
      navigation.navigate('Paywall');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSimulatorPhase('scanning');

    // Scanning animation
    Animated.sequence([
      Animated.timing(heroScale, { toValue: 1.05, duration: 300, useNativeDriver: true }),
      Animated.timing(scanAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(heroScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // Calculate projected scores
      const projected = {};
      let totalGain = 0;
      Object.keys(scores).forEach((key) => {
        if (key === 'overallRating' || key === 'overall') {
          return;
        }
        const area = IMPROVEMENT_AREAS.find((a) => a.id === key);
        const gain = area ? Math.min(area.potentialGain, 100 - scores[key]) : 0;
        projected[key] = Math.min(100, scores[key] + gain);
        totalGain += gain;
      });
      // Compute projected overall
      const cats = Object.keys(projected);
      projected.overall = Math.round(cats.reduce((s, k) => s + projected[k], 0) / cats.length);
      projected.overallRating = Math.round(projected.overall / 10);

      setProjectedScores(projected);
      setSimulatorPhase('reveal');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reveal animation
      Animated.timing(revealAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

      // Animate progress bars
      progressAnims.forEach((anim, i) => {
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        ]).start();
      });
    });
  };

  const overallCurrent = scores.overall || 50;
  const overallProjected = projectedScores?.overall || overallCurrent;
  const overallGain = overallProjected - overallCurrent;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glow-Up Simulator</Text>
        {!pro && (
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
        )}
        {pro && <View style={{ width: 40 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View style={[styles.photoContainer, { transform: [{ scale: heroScale }] }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.heroPhoto} />
            ) : (
              <LinearGradient colors={GRADIENTS.accent} style={styles.heroPhoto}>
                <Ionicons name="person" size={40} color="#fff" />
              </LinearGradient>
            )}
            <Animated.View style={[styles.photoGlow, { opacity: glowPulse }]} />
            {simulatorPhase === 'scanning' && (
              <Animated.View style={[styles.scanOverlay, {
                opacity: scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.8, 0] }),
              }]}>
                <LinearGradient colors={['rgba(124,108,240,0)', 'rgba(124,108,240,0.5)', 'rgba(124,108,240,0)']} style={styles.scanLine} />
              </Animated.View>
            )}
          </Animated.View>

          {/* Score comparison */}
          <View style={styles.scoreComparison}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Current</Text>
              <Text style={[styles.scoreNum, { color: getScoreColor(overallCurrent) }]}>{overallCurrent}</Text>
            </View>
            {simulatorPhase === 'reveal' && (
              <Animated.View style={[styles.scoreArrowBox, { opacity: revealAnim }]}>
                <Ionicons name="arrow-forward" size={24} color={COLORS.accent} />
              </Animated.View>
            )}
            {simulatorPhase === 'reveal' && (
              <Animated.View style={[styles.scoreBox, { opacity: revealAnim }]}>
                <Text style={styles.scoreLabel}>Potential</Text>
                <Text style={[styles.scoreNum, { color: '#00e676' }]}>{overallProjected}</Text>
                <Text style={styles.scoreGain}>+{overallGain} pts</Text>
              </Animated.View>
            )}
            {simulatorPhase !== 'reveal' && (
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Potential</Text>
                <Text style={[styles.scoreNum, { color: COLORS.textMuted }]}>?</Text>
              </View>
            )}
          </View>
        </View>

        {/* Run Simulation Button */}
        {simulatorPhase === 'idle' && (
          <TouchableOpacity onPress={runSimulation} activeOpacity={0.85}>
            <LinearGradient colors={pro ? GRADIENTS.accent : GRADIENTS.gold} style={styles.simulateBtn}>
              <Ionicons name={pro ? 'sparkles' : 'lock-closed'} size={20} color={pro ? '#fff' : '#000'} />
              <Text style={[styles.simulateBtnText, !pro && { color: '#000' }]}>
                {pro ? 'Simulate My Glow-Up' : 'Unlock Glow-Up Simulator'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {simulatorPhase === 'scanning' && (
          <View style={styles.scanningBox}>
            <Animated.View style={[styles.scanProgress, {
              width: scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}>
              <LinearGradient colors={GRADIENTS.accent} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </Animated.View>
            <Text style={styles.scanningText}>Analyzing improvement potential...</Text>
          </View>
        )}

        {/* Improvement Areas */}
        <Text style={styles.sectionTitle}>
          {simulatorPhase === 'reveal' ? 'Your Improvement Roadmap' : 'Analysis Categories'}
        </Text>

        {IMPROVEMENT_AREAS.map((area, i) => {
          const current = scores[area.id] || 50;
          const projected = projectedScores?.[area.id] || current;
          const gain = projected - current;

          return (
            <Animated.View key={area.id} style={{
              opacity: cardAnims[i],
              transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}>
              <TouchableOpacity
                style={[styles.areaCard, selectedArea === area.id && styles.areaCardActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedArea(selectedArea === area.id ? null : area.id);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.areaTop}>
                  <View style={[styles.areaIcon, { backgroundColor: area.color + '20' }]}>
                    <Ionicons name={area.icon} size={20} color={area.color} />
                  </View>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaLabel}>{area.label}</Text>
                    <View style={styles.areaScores}>
                      <Text style={[styles.areaCurrent, { color: getScoreColor(current) }]}>{current}</Text>
                      {simulatorPhase === 'reveal' && (
                        <Animated.View style={[styles.areaGainRow, { opacity: revealAnim }]}>
                          <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
                          <Text style={[styles.areaProjected, { color: getScoreColor(projected) }]}>{projected}</Text>
                          <View style={[styles.gainPill, { backgroundColor: '#00e676' + '20' }]}>
                            <Text style={styles.gainPillText}>+{gain}</Text>
                          </View>
                        </Animated.View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.areaTimeline}>{area.timeline}</Text>
                </View>

                {/* Progress bar */}
                {simulatorPhase === 'reveal' && (
                  <View style={styles.areaBarContainer}>
                    <View style={[styles.areaBarCurrent, { width: `${current}%`, backgroundColor: getScoreColor(current) + '50' }]} />
                    <Animated.View style={[styles.areaBarProjected, {
                      width: progressAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [`${current}%`, `${projected}%`],
                      }),
                      backgroundColor: getScoreColor(projected),
                    }]} />
                  </View>
                )}

                {/* Expanded tips */}
                {selectedArea === area.id && (
                  <View style={styles.areaTips}>
                    <Text style={styles.areaTipsTitle}>How to Improve</Text>
                    {area.tips.map((tip, j) => (
                      <View key={j} style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={16} color={area.color} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                    <View style={styles.tipMeta}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.tipMetaText}>Expected timeline: {area.timeline}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Bottom CTA */}
        {simulatorPhase === 'reveal' && (
          <Animated.View style={{ opacity: revealAnim }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Plan', { scores })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={GRADIENTS.accent} style={styles.planCta}>
                <Ionicons name="rocket-outline" size={22} color="#fff" />
                <View>
                  <Text style={styles.planCtaTitle}>Start Your 12-Week Plan</Text>
                  <Text style={styles.planCtaSubtitle}>Personalized based on your weakest areas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

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
  proBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proBadgeText: { color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  scroll: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', marginBottom: 24 },
  photoContainer: { marginBottom: 20, position: 'relative' },
  heroPhoto: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  photoGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.accentGlow, top: -10, left: -10, zIndex: -1 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 60, overflow: 'hidden', justifyContent: 'center' },
  scanLine: { width: '100%', height: 30 },
  scoreComparison: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreBox: { alignItems: 'center', minWidth: 80 },
  scoreLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  scoreNum: { fontSize: 36, fontWeight: '900' },
  scoreGain: { color: '#00e676', fontSize: 14, fontWeight: '700', marginTop: 2 },
  scoreArrowBox: { paddingHorizontal: 8 },
  simulateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10, marginBottom: 24, ...SHADOWS.accentGlow },
  simulateBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  scanningBox: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 24, overflow: 'hidden' },
  scanProgress: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  scanningText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  areaCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  areaCardActive: { borderColor: COLORS.accent + '60' },
  areaTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  areaIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  areaInfo: { flex: 1 },
  areaLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  areaScores: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  areaCurrent: { fontSize: 18, fontWeight: '800' },
  areaGainRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  areaProjected: { fontSize: 18, fontWeight: '800' },
  gainPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  gainPillText: { color: '#00e676', fontSize: 11, fontWeight: '800' },
  areaTimeline: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  areaBarContainer: { height: 4, backgroundColor: COLORS.bgSecondary, borderRadius: 2, marginTop: 12, overflow: 'hidden', position: 'relative' },
  areaBarCurrent: { height: '100%', borderRadius: 2, position: 'absolute' },
  areaBarProjected: { height: '100%', borderRadius: 2, position: 'absolute' },
  areaTips: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  areaTipsTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '500' },
  tipMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, opacity: 0.6 },
  tipMetaText: { color: COLORS.textMuted, fontSize: 11 },
  planCta: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 12, marginTop: 8, ...SHADOWS.accentGlow },
  planCtaTitle: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  planCtaSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
});

export default GlowUpSimulatorScreen;
