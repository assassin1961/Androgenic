import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const SECTIONS = [
  {
    title: 'What is Mewing?',
    icon: 'information-circle-outline',
    color: '#0066ff',
    content: `Mewing is a tongue posture technique named after British orthodontist Dr. John Mew. It involves resting your entire tongue flat against the roof of your mouth (palate) while keeping your lips sealed and teeth gently together.\n\nThe theory is that proper tongue posture, maintained consistently over time, can influence facial bone development, improve jawline definition, and enhance overall facial aesthetics.`,
    keyPoints: [
      'Named after Dr. John Mew — orthodontist and orthotropics pioneer',
      'Involves full tongue-to-palate contact',
      'Works through consistent daily practice',
      'Results are more pronounced in younger individuals',
    ],
  },
  {
    title: 'The Correct Technique',
    icon: 'checkmark-circle-outline',
    color: '#00e676',
    content: `Mastering the correct mewing technique is crucial. Many beginners only press the tip of their tongue to the palate, but proper mewing requires the entire tongue — including the posterior third — to maintain contact.`,
    steps: [
      { step: 1, title: 'Close Your Mouth', desc: 'Keep your lips gently sealed without pressing them together. Breathe through your nose.' },
      { step: 2, title: 'Teeth Position', desc: 'Rest your molars lightly together or very slightly apart. Do not clench.' },
      { step: 3, title: 'Tongue Tip', desc: 'Place the tip of your tongue just behind your upper front teeth on the incisive papilla (the bumpy ridge).' },
      { step: 4, title: 'Flatten the Tongue', desc: 'Spread the middle portion of your tongue flat against the hard palate.' },
      { step: 5, title: 'Posterior Push', desc: 'This is the most critical and difficult part — push the BACK of your tongue up against the soft palate. You should feel slight pressure.' },
      { step: 6, title: 'Swallow Test', desc: 'Swallow while maintaining the position. Your tongue should naturally push up during swallowing — try to hold that position.' },
    ],
  },
  {
    title: 'Common Mistakes',
    icon: 'close-circle-outline',
    color: '#ff5252',
    content: `Avoid these frequent errors that can slow your progress or cause discomfort:`,
    mistakes: [
      { wrong: 'Only pressing tongue tip', right: 'Entire tongue including the back third against palate' },
      { wrong: 'Mouth breathing', right: 'Nasal breathing at all times, even during sleep' },
      { wrong: 'Clenching teeth tightly', right: 'Light molar contact or slight gap' },
      { wrong: 'Pressing too hard', right: 'Gentle, sustained pressure — not forceful' },
      { wrong: 'Inconsistent practice', right: 'Mewing should become your default tongue position 24/7' },
      { wrong: 'Expecting quick results', right: 'Significant changes take 6-24 months of consistent practice' },
    ],
  },
  {
    title: 'Beginner Exercises',
    icon: 'barbell-outline',
    color: '#ffab40',
    content: `These exercises help develop the muscle memory needed for proper mewing:`,
    exercises: [
      { name: 'Chin Tuck', duration: '10 reps × 3 sets', desc: 'Pull your chin straight back creating a "double chin." This aligns your cervical spine and helps engage the posterior tongue.' },
      { name: 'Tongue Sweep', duration: '5 reps', desc: 'Run your tongue from the tip along the entire palate to the soft palate and back. Builds awareness of palate geography.' },
      { name: 'Suction Hold', duration: '30 seconds × 5', desc: 'Create suction by pressing your tongue to the palate and trying to pull it down without breaking the seal. Strengthens tongue muscles.' },
      { name: 'Swallow & Hold', duration: '10 reps', desc: 'Take a sip of water, swallow, and freeze your tongue in the post-swallow position. This is the ideal mewing posture.' },
      { name: 'Cheek Suck', duration: '20 seconds × 3', desc: 'Suck your cheeks in while keeping tongue on palate. Trains buccinator muscle hollowing.' },
    ],
  },
  {
    title: 'Advanced Techniques',
    icon: 'rocket-outline',
    color: '#00e5ff',
    content: `Once you\'ve mastered the basics (2-4 weeks), incorporate these advanced methods:`,
    keyPoints: [
      'Hard Mewing: Applying firmer (but not excessive) pressure for defined periods (30-60 min sessions)',
      'McKenzie chin tuck while mewing for maximum cervical and tongue engagement',
      'Thumb pull technique: Place thumb under chin to feel posterior tongue engagement',
      'Sleep taping: Mouth tape during sleep to enforce nasal breathing (start with small strips)',
      'Chewing hard gum (mastic/falim) on alternating sides, 30 min daily for masseter hypertrophy',
    ],
  },
  {
    title: 'Expected Timeline',
    icon: 'calendar-outline',
    color: '#4d94ff',
    content: `Results vary by age, genetics, and consistency. Here\'s a general progression:`,
    timeline: [
      { period: 'Week 1-2', result: 'Tongue soreness, difficulty maintaining position, increased awareness' },
      { period: 'Month 1-2', result: 'Mewing becomes more natural, nasal breathing improves, slight jawline tightening' },
      { period: 'Month 3-6', result: 'Noticeable reduction in facial bloat, improved chin projection, sharper profile' },
      { period: 'Month 6-12', result: 'Visible midface and jawline improvements, better cheekbone prominence' },
      { period: 'Year 1-2+', result: 'Structural changes in younger individuals, maxilla upswing, wider palate' },
    ],
  },
];

const MewingGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedSection, setExpandedSection] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const toggleSection = (idx) => {
    setExpandedSection(expandedSection === idx ? -1 : idx);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mewing Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.03)']} style={styles.hero}>
            <View style={styles.heroIconBg}>
              <Ionicons name="fitness-outline" size={32} color="#0066ff" />
            </View>
            <Text style={styles.heroTitle}>Master the Mewing Technique</Text>
            <Text style={styles.heroSubtitle}>The foundation of facial development and looksmaxxing</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>12 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>Beginner</Text></View>
              <View style={styles.metaPill}><Ionicons name="layers-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>6 Sections</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <Animated.View key={idx} style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.sectionHeader, expandedSection === idx && styles.sectionHeaderActive]}
              onPress={() => toggleSection(idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionIconBg, { backgroundColor: section.color + '18' }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons
                name={expandedSection === idx ? 'chevron-up' : 'chevron-down'}
                size={20} color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {expandedSection === idx && (
              <View style={styles.sectionBody}>
                <Text style={styles.contentText}>{section.content}</Text>

                {section.keyPoints && (
                  <View style={styles.pointsList}>
                    {section.keyPoints.map((point, pi) => (
                      <View key={pi} style={styles.pointRow}>
                        <View style={[styles.pointDot, { backgroundColor: section.color }]} />
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {section.steps && (
                  <View style={styles.stepsList}>
                    {section.steps.map((step) => (
                      <View key={step.step} style={styles.stepCard}>
                        <LinearGradient colors={GRADIENTS.accent} style={styles.stepNumber}>
                          <Text style={styles.stepNumText}>{step.step}</Text>
                        </LinearGradient>
                        <View style={styles.stepContent}>
                          <Text style={styles.stepTitle}>{step.title}</Text>
                          <Text style={styles.stepDesc}>{step.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {section.mistakes && (
                  <View style={styles.mistakesList}>
                    {section.mistakes.map((m, mi) => (
                      <View key={mi} style={styles.mistakeCard}>
                        <View style={styles.mistakeRow}>
                          <Ionicons name="close-circle" size={16} color="#ff5252" />
                          <Text style={styles.mistakeWrong}>{m.wrong}</Text>
                        </View>
                        <View style={styles.mistakeRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#00e676" />
                          <Text style={styles.mistakeRight}>{m.right}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {section.exercises && (
                  <View style={styles.exercisesList}>
                    {section.exercises.map((ex, ei) => (
                      <View key={ei} style={styles.exerciseCard}>
                        <View style={styles.exerciseHeader}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <View style={styles.durationPill}>
                            <Text style={styles.durationText}>{ex.duration}</Text>
                          </View>
                        </View>
                        <Text style={styles.exerciseDesc}>{ex.desc}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {section.timeline && (
                  <View style={styles.timelineList}>
                    {section.timeline.map((t, ti) => (
                      <View key={ti} style={styles.timelineItem}>
                        <View style={styles.timelineDot}>
                          <View style={[styles.timelineDotInner, { backgroundColor: section.color }]} />
                        </View>
                        {ti < section.timeline.length - 1 && <View style={styles.timelineLine} />}
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelinePeriod}>{t.period}</Text>
                          <Text style={styles.timelineResult}>{t.result}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
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
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, alignItems: 'center' },
  heroIconBg: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(0,102,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14,
    padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  sectionHeaderActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  sectionIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  sectionBody: {
    backgroundColor: COLORS.bgCard, borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40',
  },
  contentText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 14 },
  pointsList: { gap: 8 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  pointText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  stepsList: { gap: 10 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  stepDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  mistakesList: { gap: 8 },
  mistakeCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 12, gap: 6 },
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mistakeWrong: { flex: 1, fontSize: 13, color: '#ff5252', lineHeight: 18 },
  mistakeRight: { flex: 1, fontSize: 13, color: '#00e676', lineHeight: 18 },
  exercisesList: { gap: 8 },
  exerciseCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 14 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  exerciseName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  durationPill: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durationText: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  exerciseDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  timelineList: { gap: 0 },
  timelineItem: { flexDirection: 'row', position: 'relative', minHeight: 60 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { position: 'absolute', left: 9, top: 22, bottom: -2, width: 2, backgroundColor: COLORS.border },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelinePeriod: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  timelineResult: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
});

export default MewingGuideScreen;
