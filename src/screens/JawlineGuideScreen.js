import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const EXERCISES = [
  {
    name: 'Jaw Clench & Release',
    difficulty: 'Beginner',
    sets: '3 sets × 15 reps',
    muscles: 'Masseter',
    icon: 'ellipse-outline',
    color: '#00e676',
    instructions: [
      'Clench your jaw firmly (not painfully) for 3 seconds',
      'Slowly release over 2 seconds',
      'Rest 1 second between reps',
      'Focus on feeling the masseter muscle contract',
    ],
  },
  {
    name: 'Chin Lifts',
    difficulty: 'Beginner',
    sets: '3 sets × 10 reps',
    muscles: 'Platysma, digastric',
    icon: 'arrow-up-outline',
    color: '#0066ff',
    instructions: [
      'Tilt head back looking at ceiling',
      'Push lower jaw forward until stretch felt under chin',
      'Hold 5 seconds at peak contraction',
      'Return slowly to neutral',
    ],
  },
  {
    name: 'Tongue Press',
    difficulty: 'Beginner',
    sets: '4 sets × 10 reps',
    muscles: 'Mylohyoid, suprahyoids',
    icon: 'resize-outline',
    color: '#00e5ff',
    instructions: [
      'Press tongue firmly against roof of mouth',
      'Hold for 5 seconds with maximum force',
      'Release and relax for 3 seconds',
      'This also trains proper mewing posture',
    ],
  },
  {
    name: 'Neck Curls',
    difficulty: 'Intermediate',
    sets: '3 sets × 12 reps',
    muscles: 'SCM, platysma',
    icon: 'trending-up',
    color: '#ffab40',
    instructions: [
      'Lie face-up on bed with head hanging off edge',
      'Curl chin toward chest (like an ab crunch for your neck)',
      'Hold 2 seconds at top',
      'Lower slowly over 3 seconds',
      'Start bodyweight only, add 2.5lb plate when easy',
    ],
  },
  {
    name: 'Lateral Jaw Movement',
    difficulty: 'Intermediate',
    sets: '2 sets × 10 each side',
    muscles: 'Lateral pterygoid',
    icon: 'swap-horizontal-outline',
    color: '#ff6090',
    instructions: [
      'Move jaw slowly to the right as far as comfortable',
      'Hold 3 seconds',
      'Return to center',
      'Repeat to the left side',
      'Keep movements controlled, never force',
    ],
  },
  {
    name: 'Resistance Jaw Opening',
    difficulty: 'Advanced',
    sets: '3 sets × 8 reps',
    muscles: 'Full jaw complex',
    icon: 'fitness-outline',
    color: '#ff6b35',
    instructions: [
      'Place fist under chin',
      'Open jaw against the resistance of your fist',
      'Hold open for 5 seconds against resistance',
      'Close slowly over 3 seconds',
      'Progressively increase fist pressure over weeks',
    ],
  },
];

const TOOLS = [
  { name: 'Mastic Gum', desc: 'Natural tree resin 10x harder than regular gum. Builds masseter muscle. Chew 30 min/day alternating sides.', rating: 'Essential', color: '#00e676', price: '$' },
  { name: 'Falim Gum', desc: 'Turkish sugar-free gum. Softer than mastic but still challenging. Good stepping stone.', rating: 'Great', color: '#0066ff', price: '$' },
  { name: 'Jawzrsize', desc: 'Silicone resistance tool for jaw. Multiple resistance levels. 20 min sessions.', rating: 'Optional', color: '#ffab40', price: '$$' },
  { name: 'Gua Sha Stone', desc: 'Jade/rose quartz scraping tool. Reduces facial bloat, improves lymphatic drainage. Use with oil.', rating: 'Great', color: '#00e5ff', price: '$' },
  { name: 'Ice Roller', desc: 'Reduces morning puffiness, tightens skin temporarily. Use for 5 min each morning.', rating: 'Good', color: '#4d94ff', price: '$' },
  { name: 'TENS/EMS Device', desc: 'Electrical muscle stimulation for jaw. Advanced users only. Research thoroughly before use.', rating: 'Advanced', color: '#ff6090', price: '$$$' },
];

const WEEKLY_PLAN = [
  { day: 'Mon', focus: 'Jaw Clench + Chin Lifts + 30min Gum', intensity: 'Moderate' },
  { day: 'Tue', focus: 'Tongue Press + Neck Curls', intensity: 'High' },
  { day: 'Wed', focus: 'Rest + Gua Sha + Ice Roller', intensity: 'Recovery' },
  { day: 'Thu', focus: 'Jaw Clench + Resistance Opening + 30min Gum', intensity: 'High' },
  { day: 'Fri', focus: 'Chin Lifts + Lateral Movement + Neck Curls', intensity: 'Moderate' },
  { day: 'Sat', focus: 'Full routine (light) + 30min Gum', intensity: 'Light' },
  { day: 'Sun', focus: 'Complete Rest', intensity: 'Rest' },
];

const JawlineGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedExercise, setExpandedExercise] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jawline Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(255,107,53,0.2)' }]}>
              <Ionicons name="shield-outline" size={32} color="#ff6b35" />
            </View>
            <Text style={styles.heroTitle}>Jawline Sculpting</Text>
            <Text style={styles.heroSubtitle}>Build a chiseled, defined jawline through targeted exercises, tools, and techniques</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#ff6b35" /><Text style={styles.metaText}>14 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="barbell-outline" size={12} color="#ff6b35" /><Text style={styles.metaText}>6 Exercises</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        {EXERCISES.map((ex, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.exerciseCard, expandedExercise === idx && styles.exerciseCardActive]}
              onPress={() => setExpandedExercise(expandedExercise === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.exIconBg, { backgroundColor: ex.color + '18' }]}>
                <Ionicons name={ex.icon} size={20} color={ex.color} />
              </View>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{ex.name}</Text>
                <View style={styles.exMeta}>
                  <Text style={styles.exSets}>{ex.sets}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: ex.color + '20' }]}>
                    <Text style={[styles.diffText, { color: ex.color }]}>{ex.difficulty}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name={expandedExercise === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedExercise === idx && (
              <View style={styles.exExpanded}>
                <Text style={styles.exMuscles}>Target: {ex.muscles}</Text>
                {ex.instructions.map((inst, ii) => (
                  <View key={ii} style={styles.instRow}>
                    <LinearGradient colors={GRADIENTS.accent} style={styles.instDot}>
                      <Text style={styles.instDotText}>{ii + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.instText}>{inst}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Tools */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Tools & Equipment</Text>
        {TOOLS.map((tool, idx) => (
          <View key={idx} style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <View style={[styles.toolDot, { backgroundColor: tool.color }]} />
              <Text style={styles.toolName}>{tool.name}</Text>
              <View style={[styles.ratingBadge, { backgroundColor: tool.color + '20' }]}>
                <Text style={[styles.ratingText, { color: tool.color }]}>{tool.rating}</Text>
              </View>
              <Text style={styles.priceText}>{tool.price}</Text>
            </View>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
          </View>
        ))}

        {/* Weekly Plan */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Weekly Training Plan</Text>
        {WEEKLY_PLAN.map((day, idx) => (
          <View key={idx} style={styles.dayRow}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>{day.day}</Text>
            </View>
            <View style={styles.dayContent}>
              <Text style={styles.dayFocus}>{day.focus}</Text>
            </View>
            <View style={[styles.intensityBadge, {
              backgroundColor: day.intensity === 'High' ? '#ff525220' :
                day.intensity === 'Moderate' ? '#ffab4020' :
                day.intensity === 'Rest' ? '#55556620' : '#00e67620'
            }]}>
              <Text style={[styles.intensityText, {
                color: day.intensity === 'High' ? '#ff5252' :
                  day.intensity === 'Moderate' ? '#ffab40' :
                  day.intensity === 'Rest' ? '#555566' : '#00e676'
              }]}>{day.intensity}</Text>
            </View>
          </View>
        ))}

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#ffab40" />
          <Text style={styles.warningText}>
            Stop immediately if you feel pain (discomfort is normal, pain is not). TMJ issues require professional evaluation. Start with beginner exercises and progress slowly.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, alignItems: 'center' },
  heroIconBg: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  exerciseCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  exIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  exInfo: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exSets: { fontSize: 12, color: COLORS.textMuted },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  diffText: { fontSize: 10, fontWeight: '700' },
  exExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  exMuscles: { fontSize: 12, color: COLORS.accent, fontWeight: '600', marginBottom: 10 },
  instRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  instDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  instDotText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  instText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  toolCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  toolHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  toolDot: { width: 8, height: 8, borderRadius: 4 },
  toolName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '700' },
  priceText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700' },
  toolDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  dayRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  dayBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 12, fontWeight: '800', color: COLORS.accent },
  dayContent: { flex: 1 },
  dayFocus: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  intensityText: { fontSize: 10, fontWeight: '700' },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,171,64,0.08)', borderRadius: 14, padding: 14, marginTop: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,171,64,0.2)' },
  warningText: { flex: 1, fontSize: 13, color: '#ffab40', lineHeight: 19 },
});

export default JawlineGuideScreen;
