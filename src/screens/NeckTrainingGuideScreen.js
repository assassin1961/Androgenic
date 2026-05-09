import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const SECTIONS = [
  {
    title: 'Why Neck Size Matters for Facial Aesthetics',
    icon: 'resize-outline',
    color: '#ff4757',
    content: `A thick neck is one of the most underrated looksmaxxing tools. It frames your face, makes your jaw look wider, creates masculine proportions, and signals high testosterone. A 16-17" neck completely transforms how your face is perceived — the same face on a thin vs thick neck looks like two different people.`,
    keyPoints: [
      'Thick neck makes jaw appear wider by contrast',
      'Neck-to-head ratio is a subconscious masculinity marker',
      'Strong neck improves posture which improves jawline visibility',
      'Neck training increases trap development which broadens shoulder appearance',
      'Visible sternocleidomastoid muscles signal fitness',
      'Thick neck reduces perceived face fat by improving jaw-to-neck angle',
    ],
  },
  {
    title: 'Beginner Neck Training Program',
    icon: 'barbell-outline',
    color: '#00d26a',
    content: `Start here if you've never trained neck before. Focus on building baseline strength before adding serious resistance.`,
    steps: [
      { step: 1, title: 'Neck Curls', desc: 'Lie face up on bench, chin to chest, 3x20 bodyweight first 2 weeks. Focus on controlled movement and building the mind-muscle connection.' },
      { step: 2, title: 'Neck Extensions', desc: 'Lie face down, extend head up, 3x20 bodyweight. This targets the posterior neck muscles and builds foundational strength.' },
      { step: 3, title: 'Lateral Neck Flexion', desc: 'Lie on side, raise head sideways, 3x15 each side. Develops the lateral neck muscles for balanced thickness.' },
      { step: 4, title: 'Neck Rotations', desc: 'Slow controlled rotation, 10 each direction, builds stability. Keep movements smooth and never force range of motion.' },
      { step: 5, title: 'Isometric Holds', desc: 'Push head against hand in all 4 directions, hold 10sec each. Great for building initial strength without risk of injury.' },
      { step: 6, title: 'Training Frequency', desc: 'Do this routine 3x/week with 1 rest day between sessions. Consistency is key — never skip sessions during the foundational phase.' },
    ],
  },
  {
    title: 'Advanced Neck Hypertrophy',
    icon: 'trophy-outline',
    color: '#0066ff',
    content: `Once you've built baseline strength (4+ weeks), progress to weighted exercises for serious neck growth.`,
    steps: [
      { step: 1, title: 'Weighted Neck Curls', desc: '4x12-15 with plate on forehead, progressive overload weekly. Start light and add 2.5lbs each week for steady gains.' },
      { step: 2, title: 'Weighted Neck Extensions', desc: '4x12-15 with plate on back of head, use towel for padding. Control the eccentric portion for maximum hypertrophy.' },
      { step: 3, title: 'Neck Harness Work', desc: 'The best tool for neck hypertrophy, 4x15-20. Allows precise loading and is the most comfortable way to progressively overload.' },
      { step: 4, title: 'Plate-Loaded Lateral Flexion', desc: '3x15 each side with plate against temple. Essential for building neck width that frames the jaw from the front.' },
      { step: 5, title: 'Band Resisted Rotations', desc: 'Loop band around head, rotate against resistance. Builds rotational strength and targets deep stabilizer muscles.' },
      { step: 6, title: 'Jeff Nippard Protocol', desc: '4 exercises, 4 sets each, 2-3x/week, add 2.5lbs weekly. This evidence-based approach ensures consistent progressive overload.' },
    ],
  },
  {
    title: 'Common Neck Training Mistakes',
    icon: 'close-circle-outline',
    color: '#ff5252',
    content: `Neck training done wrong can cause injury. Avoid these critical mistakes.`,
    mistakes: [
      { wrong: 'Using too much weight too soon', right: 'Start bodyweight and add 2.5lbs/week max. Neck muscles are small and injury-prone — patience prevents setbacks.' },
      { wrong: 'Jerky/fast movements', right: 'Slow controlled reps, 3 sec up, 3 sec down, never bounce. Momentum removes tension from the target muscles.' },
      { wrong: 'Training neck daily', right: '3x/week max with rest days. Muscles need 48h to recover and grow — overtraining leads to chronic tightness and pain.' },
      { wrong: 'Only training flexion (front)', right: 'Train all 4 directions equally to prevent imbalances and maintain posture. Neglecting any direction creates dysfunction.' },
      { wrong: 'Skipping warm-up', right: '2 minutes of gentle neck circles and stretches before every session. Cold neck muscles are extremely vulnerable to strains.' },
      { wrong: 'Bridging exercises', right: 'Bridges put dangerous compression on cervical spine. Use curls and harness instead for safe, effective hypertrophy.' },
    ],
  },
  {
    title: 'Neck Stretching & Recovery',
    icon: 'medkit-outline',
    color: '#00e5ff',
    content: `Proper recovery is essential — tight neck muscles cause headaches, poor posture, and limit growth.`,
    steps: [
      { step: 1, title: 'Upper Trap Stretch', desc: 'Tilt ear to shoulder, gently pull with hand, 30 sec each side. Release slowly and breathe deeply throughout.' },
      { step: 2, title: 'Levator Scapulae Stretch', desc: 'Look down at armpit, pull head gently, 30 sec each. This targets the muscle most responsible for neck stiffness.' },
      { step: 3, title: 'SCM Stretch', desc: 'Tilt head back and rotate, 20 sec each side. The sternocleidomastoid is a key aesthetic muscle that needs mobility work.' },
      { step: 4, title: 'Chin Tucks for Posture', desc: 'Retract chin creating double chin, hold 10 sec, 15 reps. Strengthens deep neck flexors and corrects forward head posture.' },
      { step: 5, title: 'Self-Massage', desc: 'Tennis ball against wall on neck/trap junction, roll 2 min each side. Breaks up adhesions and increases blood flow for faster recovery.' },
    ],
  },
  {
    title: 'Neck Growth Timeline',
    icon: 'trending-up',
    color: '#4d94ff',
    content: `Realistic expectations for neck hypertrophy:`,
    timeline: [
      { period: 'Week 1-3', result: 'Building neuromuscular connection, strength gains without visible size. Your neck will feel stronger and more engaged during daily activities.' },
      { period: 'Month 1-2', result: 'First 0.5" of growth, neck starts feeling more solid. Shirts may begin to feel tighter around the collar area.' },
      { period: 'Month 3-4', result: '1" growth typical, visibly thicker neck noticeable in photos. Others start commenting on the change in your appearance.' },
      { period: 'Month 6', result: '1.5-2" growth, significant jaw-framing effect, face looks more masculine. The neck now creates a powerful base that enhances all facial features.' },
      { period: 'Month 12', result: '2-3" growth possible, completely transformed facial framing, head-to-neck ratio optimized. You look like a different person in before/after comparisons.' },
    ],
  },
];

const NeckTrainingGuideScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(0);

  const toggleSection = (idx) => {
    Haptics.selectionAsync();
    setExpandedSection(expandedSection === idx ? -1 : idx);
  };

  return (
    <GlassBackground variant="purple">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Neck Training Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="body-outline" size={30} color="#ff4757" />
              </View>
              <Text style={styles.heroTitle}>Neck Training for Aesthetics</Text>
              <Text style={styles.heroSubtitle}>Frame your face with a powerful neck</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>15 min</Text></View>
                <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>Beginner-Advanced</Text></View>
                <View style={styles.metaPill}><Ionicons name="layers-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>6 Sections</Text></View>
              </View>
            </GlassCard>
          </Animated.View>

          {SECTIONS.map((section, idx) => (
            <Animated.View key={idx} entering={FadeInRight.duration(300).delay(100 + idx * 50)}>
              <AnimatedPressable
                onPress={() => toggleSection(idx)}
                style={[styles.sectionHeader, expandedSection === idx && styles.sectionHeaderActive]}
              >
                <View style={[styles.sectionIconBg, { backgroundColor: section.color + '15' }]}>
                  <Ionicons name={section.icon} size={18} color={section.color} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons name={expandedSection === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </AnimatedPressable>

              {expandedSection === idx && (
                <GlassCard style={styles.sectionBody}>
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
                          <LinearGradient colors={[section.color, section.color + '80']} style={styles.stepNumber}>
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
                        <GlassCard key={mi} style={styles.mistakeCard}>
                          <View style={styles.mistakeRow}>
                            <Ionicons name="close-circle" size={16} color="#ff5252" />
                            <Text style={styles.mistakeWrong}>{m.wrong}</Text>
                          </View>
                          <View style={styles.mistakeRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#00e676" />
                            <Text style={styles.mistakeRight}>{m.right}</Text>
                          </View>
                        </GlassCard>
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
                </GlassCard>
              )}
            </Animated.View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hero: { padding: 22, marginBottom: 20, alignItems: 'center' },
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,71,87,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  metaText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 2, borderWidth: 1, borderColor: COLORS.borderLight, gap: 10 },
  sectionHeaderActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  sectionIconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  sectionBody: { borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 16, marginBottom: 8 },
  contentText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 14 },
  pointsList: { gap: 8 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  pointText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
  stepsList: { gap: 10 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  stepDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
  mistakesList: { gap: 8 },
  mistakeCard: { padding: 12, gap: 6 },
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mistakeWrong: { flex: 1, fontSize: 12, color: '#ff5252', lineHeight: 17 },
  mistakeRight: { flex: 1, fontSize: 12, color: '#00e676', lineHeight: 17 },
  timelineList: { gap: 0 },
  timelineItem: { flexDirection: 'row', position: 'relative', minHeight: 60 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { position: 'absolute', left: 9, top: 22, bottom: -2, width: 2, backgroundColor: COLORS.borderLight },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelinePeriod: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  timelineResult: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});

export default NeckTrainingGuideScreen;
