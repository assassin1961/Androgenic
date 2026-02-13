import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, GRADIENTS } from '../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BF_RANGES = {
  male: [
    { min: 3, max: 5, label: 'Essential', color: '#e74c3c', desc: 'Competition bodybuilder level. Not sustainable long-term.' },
    { min: 6, max: 13, label: 'Athletic', color: '#2ecc71', desc: 'Visible abs, facial definition maximized. Ideal for aesthetics.' },
    { min: 14, max: 17, label: 'Fit', color: '#27ae60', desc: 'Some ab definition, good jawline visibility. Healthy range.' },
    { min: 18, max: 24, label: 'Average', color: '#f39c12', desc: 'Soft midsection, some face bloat. Room for improvement.' },
    { min: 25, max: 40, label: 'Above Average', color: '#e74c3c', desc: 'Significant fat storage, face appears round/puffy.' },
  ],
};

const FACE_IMPACT = [
  { bf: '8-12%', effect: 'Maximum jawline definition, hollow cheeks, visible cheekbones', score: 95 },
  { bf: '13-15%', effect: 'Good definition, slight softness, still aesthetic', score: 78 },
  { bf: '16-19%', effect: 'Moderate definition, jaw less sharp, some face bloat', score: 60 },
  { bf: '20-25%', effect: 'Rounded face, jawline hidden, double chin possible', score: 40 },
  { bf: '25%+', effect: 'Significant face bloat, features obscured', score: 22 },
];

const CUT_TIPS = [
  { title: 'Caloric Deficit', text: '500 cal/day deficit = 1 lb/week fat loss. Track everything.', icon: 'restaurant-outline' },
  { title: 'High Protein', text: '1g per lb bodyweight. Preserves muscle while cutting.', icon: 'nutrition-outline' },
  { title: 'Strength Training', text: 'Lift heavy 3-4x/week. Muscle retention is key to aesthetics.', icon: 'barbell-outline' },
  { title: 'Cardio', text: '150 min/week moderate or 75 min HIIT. Walking is underrated.', icon: 'walk-outline' },
  { title: 'Sleep', text: '7-9 hours. Poor sleep increases cortisol and face bloat.', icon: 'moon-outline' },
  { title: 'Water Intake', text: '1 gallon/day minimum. Reduces water retention and puffiness.', icon: 'water-outline' },
  { title: 'Sodium Control', text: 'Under 2300mg/day. Excess sodium causes face puffiness.', icon: 'alert-circle-outline' },
  { title: 'Alcohol', text: 'Minimize or eliminate. Causes bloating, poor sleep, high calories.', icon: 'wine-outline' },
];

const BodyFatScreen = ({ navigation }) => {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const calculate = () => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(height);
    if (!w || !n || !h || w <= n) return;

    // US Navy method (male)
    const bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    const clamped = Math.max(3, Math.min(45, Math.round(bf * 10) / 10));

    const range = BF_RANGES.male.find(r => clamped >= r.min && clamped <= r.max) || BF_RANGES.male[BF_RANGES.male.length - 1];
    const faceImpact = FACE_IMPACT.find(f => {
      const [lo] = f.bf.replace('%+', '-99').replace('%', '').split('-').map(Number);
      return clamped >= lo;
    }) || FACE_IMPACT[FACE_IMPACT.length - 1];

    setResult({ bf: clamped, range, faceImpact });

    ringAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(ringAnim, { toValue: clamped / 45, duration: 1200, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const ringSize = 160;
  const strokeWidth = 14;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Fat Estimator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          US Navy method estimate. Lower body fat = sharper facial definition and better aesthetics.
        </Text>

        {/* Input Fields */}
        <View style={styles.inputGrid}>
          {[
            { label: 'Height (in)', value: height, setter: setHeight, icon: 'resize-outline' },
            { label: 'Weight (lbs)', value: weight, setter: setWeight, icon: 'scale-outline' },
            { label: 'Waist (in)', value: waist, setter: setWaist, icon: 'ellipse-outline' },
            { label: 'Neck (in)', value: neck, setter: setNeck, icon: 'body-outline' },
          ].map((field) => (
            <View key={field.label} style={styles.inputCard}>
              <Ionicons name={field.icon} size={18} color={COLORS.textMuted} />
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={field.value}
                onChangeText={field.setter}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                maxLength={5}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={calculate} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.accent} style={styles.calcBtn}>
            <Ionicons name="calculator" size={20} color="#fff" />
            <Text style={styles.calcBtnText}>Calculate</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Ring */}
            <View style={styles.resultSection}>
              <View style={styles.ringContainer}>
                <Svg width={ringSize} height={ringSize}>
                  <Circle
                    cx={ringSize / 2} cy={ringSize / 2} r={radius}
                    stroke={COLORS.bgSecondary} strokeWidth={strokeWidth} fill="none"
                  />
                  <AnimatedCircle
                    cx={ringSize / 2} cy={ringSize / 2} r={radius}
                    stroke={result.range.color} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [circumference, circumference * (1 - result.bf / 45)],
                    })}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${ringSize / 2}, ${ringSize / 2}`}
                  />
                </Svg>
                <View style={styles.ringCenter}>
                  <Text style={[styles.bfValue, { color: result.range.color }]}>{result.bf}%</Text>
                  <Text style={styles.bfLabel}>{result.range.label}</Text>
                </View>
              </View>
              <Text style={styles.rangeDesc}>{result.range.desc}</Text>
            </View>

            {/* Face Impact */}
            <Text style={styles.sectionTitle}>Impact on Facial Aesthetics</Text>
            <View style={styles.impactCard}>
              <Ionicons name="happy-outline" size={22} color={result.faceImpact.score >= 60 ? COLORS.scoreHigh : COLORS.scoreMid} />
              <View style={styles.impactInfo}>
                <Text style={styles.impactBf}>At {result.bf}% body fat:</Text>
                <Text style={styles.impactText}>{result.faceImpact.effect}</Text>
                <View style={styles.impactBar}>
                  <Animated.View style={[styles.impactBarFill, {
                    width: `${result.faceImpact.score}%`,
                    backgroundColor: result.faceImpact.score >= 70 ? COLORS.scoreHigh : result.faceImpact.score >= 45 ? COLORS.scoreMid : COLORS.scoreLow,
                  }]} />
                </View>
                <Text style={styles.impactScore}>Face Definition Score: {result.faceImpact.score}/100</Text>
              </View>
            </View>

            {/* BF Ranges Reference */}
            <Text style={styles.sectionTitle}>Body Fat Ranges (Male)</Text>
            {BF_RANGES.male.map((r) => (
              <View key={r.label} style={[styles.rangeRow, result.range.label === r.label && styles.rangeRowActive]}>
                <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
                <Text style={styles.rangeName}>{r.min}-{r.max}%</Text>
                <Text style={[styles.rangeLabel, { color: r.color }]}>{r.label}</Text>
                {result.range.label === r.label && (
                  <Ionicons name="arrow-back" size={14} color={COLORS.accent} />
                )}
              </View>
            ))}

            {/* Face Impact Table */}
            <Text style={styles.sectionTitle}>BF% vs Face Definition</Text>
            {FACE_IMPACT.map((f, i) => (
              <View key={i} style={styles.faceRow}>
                <Text style={styles.faceBf}>{f.bf}</Text>
                <View style={styles.faceBar}>
                  <View style={[styles.faceBarFill, {
                    width: `${f.score}%`,
                    backgroundColor: f.score >= 70 ? COLORS.scoreHigh : f.score >= 45 ? COLORS.scoreMid : COLORS.scoreLow,
                  }]} />
                </View>
                <Text style={styles.faceScore}>{f.score}</Text>
              </View>
            ))}

            {/* Cutting Tips */}
            <Text style={styles.sectionTitle}>How to Cut Body Fat</Text>
            {CUT_TIPS.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <Ionicons name={tip.icon} size={18} color={COLORS.accent} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              </View>
            ))}
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
  scroll: { paddingHorizontal: 20 },
  intro: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  inputCard: {
    width: '48%', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 4,
  },
  inputLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  input: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', paddingVertical: 2 },
  calcBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8, marginBottom: 20,
  },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultSection: { alignItems: 'center', marginBottom: 20 },
  ringContainer: { position: 'relative', width: 160, height: 160, marginBottom: 12 },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  bfValue: { fontSize: 32, fontWeight: '900' },
  bfLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  rangeDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 16 },
  impactCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14,
    gap: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  impactInfo: { flex: 1 },
  impactBf: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  impactText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  impactBar: { height: 6, backgroundColor: COLORS.bgSecondary, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  impactBarFill: { height: '100%', borderRadius: 3 },
  impactScore: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  rangeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 10, padding: 12, marginBottom: 4, gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rangeRowActive: { borderColor: COLORS.accent },
  rangeDot: { width: 10, height: 10, borderRadius: 5 },
  rangeName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', width: 60 },
  rangeLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  faceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
  },
  faceBf: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', width: 40 },
  faceBar: { flex: 1, height: 8, backgroundColor: COLORS.bgSecondary, borderRadius: 4, overflow: 'hidden' },
  faceBarFill: { height: '100%', borderRadius: 4 },
  faceScore: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', width: 30, textAlign: 'right' },
  tipCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12,
    gap: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  tipIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent + '15', justifyContent: 'center', alignItems: 'center' },
  tipContent: { flex: 1 },
  tipTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  tipText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
});

export default BodyFatScreen;
