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
    title: 'Why Mindset Is 50% of Attractiveness',
    icon: 'bulb-outline',
    color: '#ffd740',
    content: `Studies from UCLA show that confidence, body language, and presence contribute as much to perceived attractiveness as physical features. Two men with identical face scores can be perceived completely differently based on how they carry themselves. Your mindset shapes your posture, facial expressions, eye contact, and voice — all subconscious attractiveness signals.`,
    keyPoints: [
      'Confident body language makes faces rated 40% more attractive in studies',
      'Facial expressions at rest (resting face) are shaped by habitual mental states',
      'Chronic stress/anxiety creates tension in facial muscles causing premature aging',
      'Positive self-image improves posture which improves jawline visibility',
      'Social status perception is 70% behavioral not physical',
      'Men who rate themselves higher attract more regardless of objective score',
    ],
  },
  {
    title: 'Rewiring Your Self-Image',
    icon: 'refresh-outline',
    color: '#00e676',
    content: `How to genuinely change how you see yourself — not fake confidence, real internal transformation`,
    steps: [
      { step: 1, title: 'Stop Comparing to Genetic Outliers', desc: 'Compare to yesterday\'s version of you. Scrolling through social media and comparing yourself to the top 0.1% of genetics is a recipe for destroyed self-image. Your only competition is who you were yesterday.' },
      { step: 2, title: 'Daily Mirror Work', desc: 'Look yourself in the eyes for 2 minutes and list 3 things you like. This rewires your brain\'s self-perception over time. It feels uncomfortable at first — that discomfort is the growth.' },
      { step: 3, title: 'Reframe Flaws as Features', desc: 'Strong nose = distinguished. Wide jaw = masculine. What you see as flaws, others may see as defining features. The most attractive people aren\'t flawless — they own their unique look.' },
      { step: 4, title: 'Track Your Progress Weekly', desc: 'Photo evidence of improvement builds real confidence. Take consistent lighting/angle photos weekly. When you see tangible progress, your self-belief becomes evidence-based, not delusional.' },
      { step: 5, title: 'Set Micro-Goals', desc: 'Each small win compounds into genuine self-belief. Don\'t aim for a complete transformation overnight. Hit one skincare goal, one posture goal, one fitness goal per week. Stack wins.' },
      { step: 6, title: 'Eliminate Negative Self-Talk', desc: 'Catch and replace every negative thought about your appearance. When you think "my jaw is weak," replace it with "my jaw is improving every day with mewing and exercise." Your brain believes what you repeatedly tell it.' },
    ],
  },
  {
    title: 'Body Language That Signals Dominance',
    icon: 'man-outline',
    color: '#0066ff',
    content: `Physical cues that subconsciously signal high value`,
    steps: [
      { step: 1, title: 'Open Posture', desc: 'Shoulders back, chest out, take up space, never cross arms. Closed-off body language signals insecurity and low status. Open posture signals you\'re comfortable and confident in any environment.' },
      { step: 2, title: 'Slow Movements', desc: 'High-status people move deliberately, never rushed or fidgety. Quick, jerky movements signal anxiety and low confidence. Move 20% slower than feels natural — it projects calm authority.' },
      { step: 3, title: 'Strong Eye Contact', desc: 'Hold 3-5 seconds, break by looking to the side not down. Looking down when breaking eye contact signals submission. Looking to the side signals confidence. Practice holding eye contact 1 second longer than comfortable.' },
      { step: 4, title: 'Head Position', desc: 'Slight chin-up tilt, never look down, creates stronger jawline appearance. A downward head position hides your jawline and signals low confidence. Chin parallel to ground or slightly up is the power position.' },
      { step: 5, title: 'Hands Visible', desc: 'Keep hands out of pockets, gesture when speaking, shows openness. Hidden hands trigger subconscious distrust in others. Visible, relaxed hands with purposeful gestures signal confidence and honesty.' },
      { step: 6, title: 'Vocal Tonality', desc: 'Speak from diaphragm, slower pace, deeper tone, end sentences going down not up. Ending sentences with upward inflection sounds like you\'re asking for approval. Downward inflection sounds like a statement of authority.' },
    ],
  },
  {
    title: 'Social Proof & Status Signaling',
    icon: 'people-outline',
    color: '#ff6b35',
    content: `How to naturally increase your perceived social status`,
    keyPoints: [
      'Be the connector — introduce people to each other at social events',
      'Lead group decisions — "let\'s go here" not "where should we go?"',
      'Curate your social media — quality photos with good lighting angles and style',
      'Be known for something — develop a skill or knowledge area people come to you for',
      'Pre-selection — being seen with attractive people increases your perceived value',
      'Abundance mentality — never appear desperate or try too hard',
    ],
  },
  {
    title: 'Facial Expression Mastery',
    icon: 'happy-outline',
    color: '#e17055',
    content: `Your resting face and expressions massively impact how attractive you're perceived`,
    steps: [
      { step: 1, title: 'Relaxed Resting Face', desc: 'Unclench jaw, slightly part lips, soft eyes, no forehead tension. Most people carry tension in their face without realizing it. A relaxed face looks more attractive and approachable than a tense one.' },
      { step: 2, title: 'The Subtle Smile', desc: 'Slight upward curl at mouth corners, more attractive than neutral or full smile. Studies show a subtle, closed-mouth smile is rated more attractive than a big grin or a neutral expression. It signals warmth without trying too hard.' },
      { step: 3, title: 'Squinch Technique', desc: 'Slightly squint lower eyelids for photos, creates confident smoldering look. Pioneered by photographer Peter Hurley, the squinch narrows the eyes slightly from below, creating a confident, intense look that photographs extremely well.' },
      { step: 4, title: 'Eyebrow Flash', desc: 'Brief eyebrow raise when greeting someone, universal sign of friendliness. This micro-expression is recognized across all cultures as a sign of recognition and openness. It makes people feel acknowledged and creates instant rapport.' },
      { step: 5, title: 'Mirror Training', desc: 'Practice these expressions daily until they become your natural default. Spend 5 minutes each morning in front of a mirror cycling through these expressions. Within 30 days, the best expressions become your unconscious default.' },
    ],
  },
  {
    title: '90-Day Confidence Transformation',
    icon: 'rocket-outline',
    color: '#7c4dff',
    content: `Structured program for real, lasting confidence`,
    timeline: [
      { period: 'Days 1-30: Foundation', result: 'Daily mirror work, posture checks every hour, eliminate one negative self-talk pattern per week. Build the base habits that everything else rests on. Track compliance daily.' },
      { period: 'Days 31-60: Social Expansion', result: 'Start 1 conversation with a stranger daily, hold eye contact 1 second longer, practice vocal tonality. Push your comfort zone gradually — each small social win builds momentum.' },
      { period: 'Days 61-75: Challenge Zone', result: 'Cold approach 3 people per week, lead group activities, post a confident photo online. This phase is where real transformation happens — you prove to yourself that rejection isn\'t fatal.' },
      { period: 'Days 76-85: Integration', result: 'Confidence becomes habitual, positive body language is default, resting face is relaxed and attractive. You stop thinking about these behaviors — they become who you are.' },
      { period: 'Days 86-90: Assessment', result: 'Retake face scan, compare posture photos, journal transformation. Document your before/after — not just physical changes but how you feel, carry yourself, and interact with others.' },
    ],
  },
];

const MindsetGuideScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(0);

  const toggleSection = (idx) => {
    Haptics.selectionAsync();
    setExpandedSection(expandedSection === idx ? -1 : idx);
  };

  return (
    <GlassBackground variant="gold">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Mindset Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="gold" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="rocket-outline" size={30} color="#ffd740" />
              </View>
              <Text style={styles.heroTitle}>Mindset & Confidence</Text>
              <Text style={styles.heroSubtitle}>The invisible factor that changes everything</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.gold} /><Text style={styles.metaText}>17 min</Text></View>
                <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.gold} /><Text style={styles.metaText}>All Levels</Text></View>
                <View style={styles.metaPill}><Ionicons name="layers-outline" size={12} color={COLORS.gold} /><Text style={styles.metaText}>6 Sections</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,215,64,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#000' },
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

export default MindsetGuideScreen;
