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
    title: 'How Cold Transforms Your Face',
    icon: 'snow-outline',
    color: '#00b0ff',
    content: `Cold exposure is a secret weapon for facial aesthetics. It reduces facial inflammation and puffiness, tightens skin by boosting collagen production, increases blood flow creating a healthy glow, activates brown fat for a leaner face, and triggers norepinephrine release (200-300% increase) which reduces facial bloating. Ice-cold water on your face is one of the simplest, most effective looksmaxxing tools.`,
    keyPoints: [
      'Cold increases norepinephrine 200-300% — a powerful anti-inflammatory',
      'Cold water tightens pores and reduces puffiness within minutes',
      'Consistent cold exposure increases collagen density and skin thickness',
      'Cold showers boost testosterone by reducing scrotal temperature',
      'Ice face baths can reduce dark circles by constricting blood vessels',
      'Cold-adapted skin becomes more resilient and ages slower',
    ],
  },
  {
    title: 'Morning Ice Face Protocol',
    icon: 'water-outline',
    color: '#00e5ff',
    content: `The single most effective daily practice for reducing facial bloating and tightening skin:`,
    steps: [
      { step: 1, title: 'Prepare the Ice Bowl', desc: 'Fill a large bowl with water and 15-20 ice cubes.' },
      { step: 2, title: 'Let It Chill', desc: 'Wait 2-3 minutes for the water to reach near-freezing temperature.' },
      { step: 3, title: 'First Submersion', desc: 'Submerge face for 15 seconds, breathe through mouth, come up for 10 seconds.' },
      { step: 4, title: 'Repeat Dips', desc: 'Repeat 3-5 times total, working up to 30-second holds.' },
      { step: 5, title: 'Post-Dip Care', desc: 'Pat dry gently, apply vitamin C serum while pores are tight.' },
      { step: 6, title: 'Stay Consistent', desc: 'Do this every morning — results are visible within the first week.' },
    ],
  },
  {
    title: 'Cold Shower Protocol',
    icon: 'thermometer-outline',
    color: '#4d94ff',
    content: `Full-body cold exposure for hormonal and metabolic benefits:`,
    steps: [
      { step: 1, title: 'Week 1-2: Introduction', desc: 'End regular shower with 30 second cold blast, gradually lower temperature.' },
      { step: 2, title: 'Week 3-4: Extension', desc: 'Extend cold finish to 1-2 minutes, focus on breathing steadily.' },
      { step: 3, title: 'Month 2: Contrast Method', desc: 'Start with 1 minute cold, warm middle, finish 2 minutes cold.' },
      { step: 4, title: 'Month 3+: Full Cold', desc: 'Full cold showers 3-5 minutes, or contrast (hot-cold-hot-cold).' },
      { step: 5, title: 'Advanced: Ice Baths', desc: '5-10 minute cold showers or ice baths at 50-59°F (10-15°C) once weekly.' },
    ],
  },
  {
    title: 'De-Puffing & Inflammation Reduction',
    icon: 'bandage-outline',
    color: '#00d26a',
    content: `Targeted cold techniques for specific facial concerns:`,
    steps: [
      { step: 1, title: 'Ice Roller for Under-Eyes', desc: 'Roll from inner to outer corner, 2 minutes each side.' },
      { step: 2, title: 'Frozen Spoon Technique', desc: 'Keep 2 spoons in freezer, press under eyes for 5 minutes.' },
      { step: 3, title: 'Cold Jade Roller', desc: 'Store gua sha or jade roller in freezer, use on jawline and cheeks.' },
      { step: 4, title: 'Cryo Globe Massage', desc: 'Roll on forehead and cheeks for lymphatic drainage.' },
      { step: 5, title: 'Cold Green Tea Bags', desc: 'Freeze used tea bags, place on eyes 10 minutes for caffeine + cold benefit.' },
      { step: 6, title: 'Post-Workout Face Ice', desc: 'Apply cold right after exercise to prevent exercise-induced facial flushing.' },
    ],
  },
  {
    title: 'Cold Exposure & Hormones',
    icon: 'pulse-outline',
    color: '#ff6b35',
    content: `The hormonal cascade triggered by cold exposure:`,
    keyPoints: [
      'Norepinephrine increases 200-300% — reduces inflammation everywhere including face',
      'Dopamine increases 250% — improves mood and motivation for looksmaxxing consistency',
      'Testosterone increases when cold is applied to lower body',
      'Cortisol initially spikes but chronic cold adaptation lowers baseline cortisol',
      'Growth hormone secretion increases with cold exposure',
      'Brown fat activation increases metabolism helping maintain low body fat for a lean face',
    ],
  },
  {
    title: '30-Day Cold Exposure Challenge',
    icon: 'trophy-outline',
    color: '#ffd740',
    content: `Progressive protocol from beginner to advanced:`,
    timeline: [
      { period: 'Days 1-5', result: 'Splash cold water on face morning and night. 30 second cold shower finish.' },
      { period: 'Days 6-10', result: 'Ice bowl face dips 3x15 seconds. 1 minute cold shower finish.' },
      { period: 'Days 11-15', result: 'Ice bowl 3x20 seconds. 2 minute cold shower finish.' },
      { period: 'Days 16-20', result: 'Ice bowl 5x15 seconds. 3 minute cold shower. Add ice roller routine.' },
      { period: 'Week 4', result: 'Full cold showers 5 minutes. Ice face daily. Visible reduction in puffiness.' },
      { period: 'Maintenance', result: 'Daily ice face + cold shower becomes automatic. Face stays lean and tight.' },
    ],
  },
];

const ColdExposureGuideScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(0);

  const toggleSection = (idx) => {
    Haptics.selectionAsync();
    setExpandedSection(expandedSection === idx ? -1 : idx);
  };

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.headerTitle}>Cold Exposure Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,176,255,0.15)' }]}>
                <Ionicons name="snow-outline" size={30} color="#00b0ff" />
              </View>
              <Text style={styles.heroTitle}>Cold Exposure & Ice Face</Text>
              <Text style={styles.heroSubtitle}>De-puff, tighten, and transform your face</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>14 min read</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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

export default ColdExposureGuideScreen;
