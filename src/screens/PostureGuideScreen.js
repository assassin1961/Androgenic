import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const POSTURE_ISSUES = [
  {
    name: 'Forward Head Posture',
    icon: 'phone-portrait-outline',
    color: '#ff6b35',
    desc: 'Head sits forward of shoulders. The #1 posture issue in the modern world. For every inch forward, 10 extra lbs of stress on the cervical spine.',
    faceEffects: [
      'Hides jawline by pushing soft tissue forward',
      'Creates appearance of double chin even at low body fat',
      'Prevents proper tongue posture (mewing)',
      'Can cause asymmetric facial development over years',
    ],
    fixes: [
      'Chin tucks: 3 sets × 15 reps daily',
      'Wall angels: 3 sets × 10 reps',
      'Monitor at eye level',
      'Phone held at eye level (not lap)',
    ],
  },
  {
    name: 'Rounded Shoulders',
    icon: 'trending-down-outline',
    color: '#7c6cf0',
    desc: 'Shoulders roll forward and inward. Caused by excessive sitting, chest-dominant training, and device use.',
    faceEffects: [
      'Makes neck appear shorter',
      'Reduces perceived jaw-to-shoulder ratio',
      'Creates a less confident appearance',
      'Often accompanies forward head posture',
    ],
    fixes: [
      'Face pulls: 3 sets × 15 reps',
      'Band pull-aparts: 3 sets × 20',
      'Doorway chest stretch: 30 sec × 3',
      'Strengthen mid/lower traps',
    ],
  },
  {
    name: 'Anterior Pelvic Tilt',
    icon: 'body-outline',
    color: '#00e5ff',
    desc: 'Pelvis tilts forward creating exaggerated lower back curve. Affects whole body alignment chain up to the neck and face.',
    faceEffects: [
      'Cascading effect: APT → kyphosis → forward head',
      'Indirectly worsens jawline appearance',
      'Signals poor physical fitness to observers',
    ],
    fixes: [
      'Hip flexor stretches: 60 sec × 2 each side',
      'Glute bridges: 3 sets × 15',
      'Dead bugs: 3 sets × 10 each side',
      'Standing awareness: squeeze glutes, tuck pelvis',
    ],
  },
];

const EXERCISES = [
  {
    name: 'Chin Tucks',
    target: 'Forward head posture',
    sets: '3 × 15 reps',
    color: '#ff6b35',
    steps: ['Stand against wall, back of head touching', 'Pull chin straight back (make a double chin)', 'Hold 3 seconds', 'Release slowly', 'Keep eyes level, don\'t tilt head'],
  },
  {
    name: 'Wall Angels',
    target: 'Rounded shoulders, thoracic spine',
    sets: '3 × 10 reps',
    color: '#7c6cf0',
    steps: ['Stand with back flat against wall', 'Arms in "goalpost" position against wall', 'Slide arms up overhead keeping contact with wall', 'Slide back down slowly', 'Keep lower back pressed to wall'],
  },
  {
    name: 'Neck Retraction Hold',
    target: 'Deep neck flexors',
    sets: '5 × 10 sec holds',
    color: '#00e676',
    steps: ['Lie face-up on floor', 'Gently press back of head into floor', 'Tuck chin slightly (not lifting head)', 'You should feel deep front neck muscles engage', 'Hold 10 seconds, rest 5 seconds'],
  },
  {
    name: 'Face Pulls',
    target: 'Rear delts, mid traps, external rotators',
    sets: '3 × 15 reps',
    color: '#00e5ff',
    steps: ['Cable or band at face height', 'Pull toward face, splitting hands apart', 'End position: hands beside ears, elbows high', 'Squeeze shoulder blades together', 'Control the return — 2 sec eccentric'],
  },
  {
    name: 'Thoracic Extension',
    target: 'Upper back mobility',
    sets: '2 × 10 reps',
    color: '#ffab40',
    steps: ['Sit in chair, hands behind head', 'Arch upper back over chair back', 'Hold extension 2 seconds', 'Return to neutral', 'Focus on upper back, not lower back'],
  },
  {
    name: 'Doorway Chest Stretch',
    target: 'Tight pectorals',
    sets: '3 × 30 seconds each side',
    color: '#ff6090',
    steps: ['Stand in doorway, arm at 90° on frame', 'Step forward through doorway', 'Feel stretch across chest and front shoulder', 'Hold 30 seconds, breathe deeply', 'Repeat at different arm angles'],
  },
];

const DAILY_CHECKLIST = [
  { item: 'Chin tuck check every hour', icon: 'alarm-outline' },
  { item: 'Ears aligned over shoulders', icon: 'body-outline' },
  { item: 'Shoulders back and down', icon: 'arrow-down-outline' },
  { item: 'Screen at eye level', icon: 'laptop-outline' },
  { item: 'Standing desk 50% of work time', icon: 'resize-outline' },
  { item: 'Tongue on palate (mewing)', icon: 'fitness-outline' },
  { item: 'Movement break every 30 min', icon: 'walk-outline' },
  { item: '5-min posture routine AM & PM', icon: 'time-outline' },
];

const PostureGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedIssue, setExpandedIssue] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState(-1);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Posture Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(29,233,182,0.15)', 'rgba(29,233,182,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(29,233,182,0.2)' }]}>
              <Ionicons name="body-outline" size={32} color="#1de9b6" />
            </View>
            <Text style={styles.heroTitle}>Posture & Alignment</Text>
            <Text style={styles.heroSubtitle}>Perfect posture instantly improves jawline appearance, neck aesthetics, and overall attractiveness</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#1de9b6" /><Text style={styles.metaText}>9 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color="#1de9b6" /><Text style={styles.metaText}>Beginner</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Key Stat */}
        <View style={styles.statBanner}>
          <Text style={styles.statNumber}>87%</Text>
          <Text style={styles.statText}>of looksmaxxers underestimate how much posture affects perceived jawline definition</Text>
        </View>

        {/* Posture Issues */}
        <Text style={styles.sectionTitle}>Common Issues</Text>
        {POSTURE_ISSUES.map((issue, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.issueCard, expandedIssue === idx && styles.issueCardActive]}
              onPress={() => setExpandedIssue(expandedIssue === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.issueIcon, { backgroundColor: issue.color + '18' }]}>
                <Ionicons name={issue.icon} size={20} color={issue.color} />
              </View>
              <Text style={styles.issueName}>{issue.name}</Text>
              <Ionicons name={expandedIssue === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedIssue === idx && (
              <View style={styles.issueExpanded}>
                <Text style={styles.issueDesc}>{issue.desc}</Text>
                <Text style={styles.subLabel}>Impact on Face:</Text>
                {issue.faceEffects.map((e, ei) => (
                  <View key={ei} style={styles.effectRow}>
                    <Ionicons name="alert-circle" size={13} color="#ff5252" />
                    <Text style={styles.effectText}>{e}</Text>
                  </View>
                ))}
                <Text style={[styles.subLabel, { marginTop: 10 }]}>Fixes:</Text>
                {issue.fixes.map((f, fi) => (
                  <View key={fi} style={styles.effectRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#00e676" />
                    <Text style={styles.effectText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Exercises */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Corrective Exercises</Text>
        {EXERCISES.map((ex, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.exCard, expandedExercise === idx && styles.exCardActive]}
              onPress={() => setExpandedExercise(expandedExercise === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.exColor, { backgroundColor: ex.color }]} />
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exTarget}>{ex.target}</Text>
              </View>
              <View style={styles.exSets}><Text style={styles.exSetsText}>{ex.sets}</Text></View>
            </TouchableOpacity>
            {expandedExercise === idx && (
              <View style={styles.exExpanded}>
                {ex.steps.map((step, si) => (
                  <View key={si} style={styles.stepRow}>
                    <LinearGradient colors={GRADIENTS.accent} style={styles.stepDot}>
                      <Text style={styles.stepDotText}>{si + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Daily Checklist */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Daily Checklist</Text>
        {DAILY_CHECKLIST.map((item, idx) => (
          <View key={idx} style={styles.checkItem}>
            <View style={styles.checkBox}>
              <Ionicons name={item.icon} size={16} color={COLORS.accent} />
            </View>
            <Text style={styles.checkText}>{item.item}</Text>
          </View>
        ))}

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
  statBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 20, gap: 14, borderWidth: 1, borderColor: COLORS.accent + '30' },
  statNumber: { fontSize: 32, fontWeight: '900', color: COLORS.accent },
  statText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  issueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  issueCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  issueIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  issueName: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  issueExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  issueDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  subLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  effectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  effectText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  exCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  exCardActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  exColor: { width: 4, height: 36, borderRadius: 2 },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  exTarget: { fontSize: 11, color: COLORS.textMuted },
  exSets: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  exSetsText: { fontSize: 10, color: COLORS.accent, fontWeight: '700' },
  exExpanded: { backgroundColor: COLORS.bgCard, padding: 16, marginBottom: 10, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepDotText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  stepText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  checkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  checkBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.accentGlow, justifyContent: 'center', alignItems: 'center' },
  checkText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
});

export default PostureGuideScreen;
