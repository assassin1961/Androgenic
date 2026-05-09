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
    title: 'The Science Behind Face Exercises',
    icon: 'fitness-outline',
    color: '#ff6b35',
    content: `Facial muscles can be strengthened like any other muscle. A Northwestern University study showed 20 weeks of facial exercises made participants look 3 years younger. The 43 muscles in your face respond to progressive overload just like gym muscles — bigger facial muscles = more defined features.`,
    keyPoints: [
      'Your face has 43 individual muscles that can all be trained and strengthened',
      'Facial muscles are directly attached to the skin, unlike most body muscles which attach bone-to-bone',
      'Hypertrophy of facial muscles pushes skin outward, creating sharper definition and reducing sagging',
      'Cheek muscles (zygomaticus major/minor) lift the midface when strengthened, creating higher cheekbone appearance',
      'Jaw muscles (masseter/temporalis) widen the lower third of the face for a more masculine look',
      'Consistent training is required — minimum 20+ minutes daily for visible results over 8-20 weeks',
    ],
  },
  {
    title: 'Jawline Chewing Protocol',
    icon: 'shield-outline',
    color: '#0066ff',
    content: `Masseter and temporalis hypertrophy for a wider, more defined jaw. The chewing muscles are the strongest muscles in the face and respond well to resistance training.`,
    steps: [
      { step: 1, title: 'Start with Regular Gum', desc: 'Chew regular gum for 30 minutes per day during the first 2 weeks to condition the jaw muscles and TMJ joint before adding resistance.' },
      { step: 2, title: 'Progress to Mastic Gum or Jawliner', desc: 'Switch to mastic gum or a Jawliner device for increased resistance. These provide 10-15x more resistance than regular gum, driving real hypertrophy.' },
      { step: 3, title: 'Chew Evenly on Both Sides', desc: 'Alternate 15 minutes on each side to ensure symmetrical masseter development. Uneven chewing creates asymmetry over time.' },
      { step: 4, title: 'Add Chin Tucks While Chewing', desc: 'Pull your chin back toward your spine while chewing to engage the deep neck flexors simultaneously. This combo maximizes jaw-to-neck definition.' },
      { step: 5, title: 'Jaw Clenching Isometrics', desc: 'Clench your jaw firmly for 10 seconds, release for 5 seconds, repeat for 10 reps. This targets the deep masseter fibers that chewing alone misses.' },
      { step: 6, title: 'Rest Days Are Essential', desc: 'Take 1 day off per week to prevent TMJ issues and allow muscle recovery. Overtraining the jaw can cause clicking, pain, and joint dysfunction.' },
    ],
  },
  {
    title: 'Cheekbone & Midface Exercises',
    icon: 'happy-outline',
    color: '#e17055',
    content: `Build the zygomaticus and buccinator muscles for higher, more defined cheekbones. These muscles directly control the midface area and respond quickly to training.`,
    steps: [
      { step: 1, title: 'Cheek Lifts', desc: 'Smile as wide as possible while keeping your eyes open, hold for 10 seconds, then release. Perform 15 reps. Focus on lifting the cheeks toward your eyes.' },
      { step: 2, title: 'Fish Face', desc: 'Suck your cheeks in between your teeth, then try to smile in this position. Hold for 10 seconds, release, and repeat for 15 reps. Targets the buccinator.' },
      { step: 3, title: 'Cheek Puffs', desc: 'Fill your mouth with air and transfer the air from cheek to cheek, 20 times total. This works the buccinator and orbicularis oris for fuller, more defined cheeks.' },
      { step: 4, title: 'O-Shape Exercise', desc: 'Make an O shape with your mouth, then try to smile with your upper lip over your teeth. Hold 5 seconds, release, and repeat for 15 reps. Targets the upper cheek muscles.' },
      { step: 5, title: 'Mewing + Cheek Exercise Combo', desc: 'Maintain proper tongue posture (mewing) while performing cheek lifts. This dual engagement strengthens the midface from both inside and outside simultaneously.' },
    ],
  },
  {
    title: 'Under-Eye & Forehead Training',
    icon: 'eye-outline',
    color: '#4d94ff',
    content: `Reduce under-eye hollowness and forehead lines through targeted muscle work. The orbicularis oculi and frontalis muscles can be strengthened to create a more youthful, defined upper face.`,
    steps: [
      { step: 1, title: 'Eye Squeezes', desc: 'Close your eyes tightly for 5 seconds, then open them as wide as possible for 5 seconds. Repeat for 20 reps. Strengthens the orbicularis oculi ring muscle.' },
      { step: 2, title: 'Brow Raises', desc: 'Raise your eyebrows as high as possible, hold for 10 seconds, then slowly lower. Perform 15 reps. Strengthens the frontalis muscle and lifts the brow area.' },
      { step: 3, title: 'Forehead Smoothing', desc: 'Place your fingers firmly on your forehead and try to raise your brows against the resistance. This isometric contraction builds the frontalis without deepening forehead lines.' },
      { step: 4, title: 'Lower Eyelid Lifts', desc: 'Look upward, then try to lift your lower eyelids as if squinting from below. Hold for 5 seconds, release, and repeat for 15 reps. Reduces under-eye hollowness.' },
      { step: 5, title: 'Eye Circles', desc: 'Look up, then slowly rotate your eyes right, down, left in a full circle. Perform 10 circles in each direction. Strengthens all muscles surrounding the eye socket.' },
    ],
  },
  {
    title: 'Neck & Chin Sculpting',
    icon: 'body-outline',
    color: '#00d26a',
    content: `Eliminate double chin and create a strong neck-to-jaw angle. The platysma, digastric, and sternocleidomastoid muscles define the cervical-mandibular junction — one of the most important areas for facial aesthetics.`,
    steps: [
      { step: 1, title: 'Chin Lifts', desc: 'Tilt your head back, push your lower jaw forward until you feel a stretch under the chin. Hold for 10 seconds, return to neutral, and repeat for 15 reps.' },
      { step: 2, title: 'Tongue Press', desc: 'Press your tongue firmly to the roof of your mouth, then tilt your head back while maintaining the tongue press. Hold for 10 seconds. Targets the submental muscles.' },
      { step: 3, title: 'Neck Curls', desc: 'Lie face up with your head hanging off the edge of a bed. Curl your chin to your chest against gravity. Perform 3 sets of 15 reps. The most effective neck exercise.' },
      { step: 4, title: 'Platysma Stretch', desc: 'Pull the corners of your mouth down tightly and hold for 10 seconds. You should feel your neck muscles tighten visibly. This combats platysmal banding and turkey neck.' },
      { step: 5, title: 'Head Turns', desc: 'Perform slow, controlled turns from left to right against hand resistance placed on the side of your head. This builds the sternocleidomastoid for a thicker, more defined neck.' },
      { step: 6, title: 'Neck Flexion/Extension', desc: 'Nod yes and no against hand resistance placed on your forehead and the back of your head. Perform 3 sets of 10 each direction. Builds 360-degree neck strength.' },
    ],
  },
  {
    title: 'Weekly Face Exercise Schedule',
    icon: 'calendar-outline',
    color: '#7c4dff',
    content: `Structured program for maximum results without overtraining. Just like gym training, facial muscles need a split routine to allow recovery while maintaining consistent stimulus.`,
    timeline: [
      { period: 'Monday: Jawline Focus', result: 'Chewing protocol + jaw clenches. Full masseter and temporalis workout with both dynamic chewing and isometric holds. Total session: 25 minutes.' },
      { period: 'Tuesday: Cheekbone Day', result: 'All midface exercises + mewing holds. Cheek lifts, fish face, cheek puffs, O-shape, and sustained mewing practice. Total session: 20 minutes.' },
      { period: 'Wednesday: Eyes & Forehead', result: 'Eye squeezes, brow raises, forehead smoothing against resistance, lower eyelid lifts, and eye circles. Total session: 15 minutes.' },
      { period: 'Thursday: Neck & Chin', result: 'All neck exercises + chin lifts. Neck curls, platysma stretch, head turns, and flexion/extension work. Total session: 25 minutes.' },
      { period: 'Friday: Full Face', result: 'One set of everything — a comprehensive full-face session hitting every muscle group. Great for maintaining weekly volume. Total session: 30 minutes.' },
      { period: 'Saturday: Active Recovery', result: 'Gua sha massage + mewing only. Light facial massage to promote blood flow and reduce tension without adding training stress. Total session: 10 minutes.' },
      { period: 'Sunday: Rest', result: 'Let muscles recover completely. Focus on mewing posture only — proper tongue placement throughout the day. No active exercises.' },
    ],
  },
];

const FaceExercisesGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Face Exercises Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="barbell-outline" size={30} color="#ff6b35" />
              </View>
              <Text style={styles.heroTitle}>Face Exercises & Facial Yoga</Text>
              <Text style={styles.heroSubtitle}>Build facial muscle definition naturally</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>22 min read</Text></View>
                <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>All Levels</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,107,53,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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
  timelineList: { gap: 0 },
  timelineItem: { flexDirection: 'row', position: 'relative', minHeight: 60 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { position: 'absolute', left: 9, top: 22, bottom: -2, width: 2, backgroundColor: COLORS.borderLight },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelinePeriod: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  timelineResult: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});

export default FaceExercisesGuideScreen;
