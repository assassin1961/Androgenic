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
    title: 'Why Testosterone Matters for Your Face',
    icon: 'trending-up',
    color: '#ff4757',
    content: `Testosterone is the master hormone behind masculine facial development. During puberty, testosterone drives forward growth of the jaw, brow ridge prominence, cheekbone projection, and facial bone density. Even after puberty, optimizing your T levels can significantly impact facial fat distribution, skin quality, and overall masculine appearance.\n\nStudies show men with higher testosterone have wider jaws, more prominent brow ridges, and lower body fat percentages — all key indicators of facial attractiveness.`,
    keyPoints: [
      'Testosterone drives mandibular (jaw) growth and width during development',
      'Higher T correlates with lower facial fat, revealing bone structure',
      'T improves collagen synthesis for tighter, thicker skin',
      'DHT (testosterone metabolite) drives beard growth and body hair',
      'Optimized T levels reduce facial bloating from water retention',
      'Low T is linked to higher cortisol, which causes puffy/aged appearance',
    ],
  },
  {
    title: 'Natural T Optimization Protocol',
    icon: 'flask-outline',
    color: '#00d26a',
    content: `Before considering any supplements, these lifestyle factors form the foundation. Research shows these changes alone can increase testosterone 20-40% in men with suboptimal levels:`,
    steps: [
      { step: 1, title: 'Sleep 7-9 Hours in Complete Darkness', desc: 'Testosterone is produced primarily during REM sleep. Men sleeping 5 hours have 10-15% lower T than those sleeping 8 hours. Blackout curtains, no screens 1hr before bed, room temp 65-68°F.' },
      { step: 2, title: 'Heavy Compound Lifts 3-4x/Week', desc: 'Squats, deadlifts, bench press, and overhead press trigger the highest testosterone response. Focus on progressive overload — heavier weights over time. Minimum 3 sets of 5-8 reps.' },
      { step: 3, title: 'Eat Adequate Healthy Fats (25-35% of Calories)', desc: 'Testosterone is synthesized from cholesterol. Eat eggs (whole), avocados, olive oil, nuts, and fatty fish daily. Very low fat diets tank T levels by 12-15%.' },
      { step: 4, title: 'Minimize Chronic Stress', desc: 'Cortisol and testosterone have an inverse relationship. Chronic stress keeps cortisol high, suppressing T. Meditation, cold exposure, and time in nature directly lower cortisol.' },
      { step: 5, title: 'Get 20 Minutes of Direct Sunlight Daily', desc: 'Vitamin D from sunlight is a testosterone precursor. Studies show men with sufficient vitamin D have significantly higher T. Expose arms, legs, and face without sunscreen for 15-20 min.' },
      { step: 6, title: 'Maintain 12-18% Body Fat', desc: 'Both excess body fat and extremely low body fat reduce testosterone. The aromatase enzyme in fat cells converts T to estrogen. Getting lean reveals your bone structure AND optimizes hormones.' },
    ],
  },
  {
    title: 'T-Boosting Supplement Stack',
    icon: 'nutrition-outline',
    color: '#ffab40',
    content: `These are evidence-based supplements with multiple clinical studies supporting their effects on testosterone. Always consult a doctor before starting any supplement regimen:`,
    supplements: [
      { name: 'Vitamin D3', dose: '4,000-5,000 IU/day', evidence: 'Men deficient in D had 20% lower T. Supplementation restored levels. Take with vitamin K2 for absorption.', rating: 'A+' },
      { name: 'Zinc', dose: '30-45mg/day (zinc picolinate)', evidence: 'Essential mineral for T synthesis. 6 weeks of supplementation increased T 24% in deficient men. Most men are mildly deficient.', rating: 'A' },
      { name: 'Magnesium', dose: '400-500mg/day (glycinate)', evidence: 'Involved in 300+ enzymatic reactions including T production. Take before bed — also improves sleep quality.', rating: 'A' },
      { name: 'Ashwagandha (KSM-66)', dose: '600mg/day', evidence: 'Reduces cortisol 27%, increased T 15-17% in clinical trials. Also improves strength, recovery, and stress resilience.', rating: 'A' },
      { name: 'Tongkat Ali', dose: '200-400mg/day (100:1 extract)', evidence: 'Malaysian herb that restored T levels in stressed men by 37%. Also increases free testosterone by lowering SHBG.', rating: 'B+' },
      { name: 'Boron', dose: '6-10mg/day', evidence: 'Increased free T by 25% and reduced estradiol by 39% in just one week. Cheap and underrated mineral.', rating: 'B+' },
      { name: 'Creatine Monohydrate', dose: '5g/day', evidence: 'Increases DHT (potent androgen) by 56% after loading. Also improves gym performance which further boosts T. Most researched supplement in existence.', rating: 'A' },
      { name: 'Omega-3 Fish Oil', dose: '2-3g EPA+DHA/day', evidence: 'Reduces inflammation and supports Leydig cell function (T-producing cells). Also improves skin quality and reduces facial redness.', rating: 'B' },
    ],
  },
  {
    title: 'T-Killing Habits to Eliminate',
    icon: 'close-circle-outline',
    color: '#ff5252',
    content: `These common behaviors actively suppress your testosterone. Eliminating them can be more impactful than any supplement:`,
    mistakes: [
      { wrong: 'Drinking alcohol regularly', right: 'Even 2-3 drinks suppress T for 24+ hours. Alcohol increases aromatase (T→estrogen conversion) and damages Leydig cells. Eliminate completely or limit to 1-2 drinks max on weekends.' },
      { wrong: 'Eating from plastic containers', right: 'BPA and phthalates in plastics are endocrine disruptors that mimic estrogen. Use glass/stainless steel containers. Never microwave plastic.' },
      { wrong: 'Chronic cardio (60+ min)', right: 'Long endurance exercise spikes cortisol and lowers T. Keep cardio sessions under 30 minutes. Opt for HIIT sprints instead — they boost growth hormone and T.' },
      { wrong: 'Seed oils in cooking', right: 'Soybean, canola, sunflower, and corn oils are high in omega-6 which promotes inflammation and may suppress T. Cook with olive oil, coconut oil, or butter/ghee.' },
      { wrong: 'Poor sleep hygiene', right: 'Blue light, caffeine after 2pm, inconsistent sleep times, and hot bedrooms all destroy sleep quality. Every hour of lost sleep drops T by ~5%.' },
      { wrong: 'Soy-heavy diet', right: 'While moderate soy is fine, high consumption of soy isoflavones (phytoestrogens) may reduce T and increase estrogen activity. Limit to 1-2 servings/week.' },
    ],
  },
  {
    title: 'How T Changes Your Face',
    icon: 'person-outline',
    color: '#0066ff',
    content: `Understanding exactly which facial features testosterone influences helps you track progress and set expectations:`,
    keyPoints: [
      'Jawline: T drives mandibular growth. Higher T = wider gonial angle, more prominent jaw. Combined with low body fat, the jawline becomes razor-sharp.',
      'Brow Ridge: Testosterone creates a more prominent supraorbital ridge (brow bone). This gives the "hunter eyes" look — deep-set eyes with prominent brows.',
      'Cheekbones: T promotes forward growth of the zygomatic arch. Combined with low facial fat, cheekbones become more prominent and defined.',
      'Facial Fat: T redistributes fat away from the face. Men with higher T have leaner faces, revealing underlying bone structure. This is the single biggest visual change.',
      'Skin Quality: T increases collagen production and skin thickness. Higher T men have firmer, more resilient skin that ages slower. DHT increases sebum production (requires good skincare).',
      'Beard Growth: DHT drives facial hair development. Optimized T/DHT means fuller, faster beard growth. Combine with minoxidil for maximum density.',
      'Neck Thickness: T drives muscle development in the neck/trap area. A thicker neck creates a more masculine frame for the face.',
    ],
  },
  {
    title: 'Testing & Tracking Your Levels',
    icon: 'analytics-outline',
    color: '#4d94ff',
    content: `You can't optimize what you don't measure. Here's how to properly test and interpret your testosterone levels:`,
    timeline: [
      { period: 'Get Baseline Blood Work', result: 'Order Total T, Free T, SHBG, Estradiol (E2), LH, FSH, and Prolactin. Test fasting between 7-9am when T peaks. Use services like Marek Health, LabCorp, or your doctor.' },
      { period: 'Understand Your Numbers', result: 'Total T: 300-1000 ng/dL (optimal >600). Free T: 9-30 pg/mL (optimal >15). SHBG: 20-50 nmol/L. E2: 20-40 pg/mL. If any are off, the protocol above will help.' },
      { period: 'Implement for 90 Days', result: 'Follow the Natural T Protocol consistently for 3 full months. Hormonal changes take time — don\'t expect overnight results. Take face scans weekly to track changes.' },
      { period: 'Retest at 90 Days', result: 'Get the same bloodwork panel. Compare results. Most men see 150-300 ng/dL improvement in Total T from lifestyle changes alone. Adjust protocol based on results.' },
      { period: 'Ongoing Optimization', result: 'Retest every 6 months. Continue the protocol. As T optimizes, you\'ll notice facial changes within 3-6 months: leaner face, sharper jaw, better skin, fuller beard. Track with Androgenic scans.' },
    ],
  },
];

const TestosteroneGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Testosterone Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="trending-up" size={30} color="#ff4757" />
              </View>
              <Text style={styles.heroTitle}>Testosterone Optimization</Text>
              <Text style={styles.heroSubtitle}>The hormonal blueprint for facial masculinity</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>20 min</Text></View>
                <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>Advanced</Text></View>
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

                  {section.supplements && (
                    <View style={styles.supplementsList}>
                      {section.supplements.map((supp, si) => (
                        <GlassCard key={si} style={styles.suppCard}>
                          <View style={styles.suppHeader}>
                            <Text style={styles.suppName}>{supp.name}</Text>
                            <View style={[styles.ratingBadge, { backgroundColor: supp.rating === 'A+' ? '#00d26a' : supp.rating === 'A' ? '#00e676' : '#ffab40' }]}>
                              <Text style={styles.ratingText}>{supp.rating}</Text>
                            </View>
                          </View>
                          <Text style={styles.suppDose}>Dose: {supp.dose}</Text>
                          <Text style={styles.suppEvidence}>{supp.evidence}</Text>
                        </GlassCard>
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
  supplementsList: { gap: 8 },
  suppCard: { padding: 14 },
  suppHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  suppName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 10, fontWeight: '800', color: '#000' },
  suppDose: { fontSize: 11, color: COLORS.accent, fontWeight: '600', marginBottom: 4 },
  suppEvidence: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
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

export default TestosteroneGuideScreen;
