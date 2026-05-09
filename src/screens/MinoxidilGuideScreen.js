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
    title: 'How Minoxidil Works for Facial Hair',
    icon: 'flask-outline',
    color: '#e17055',
    content: `Minoxidil is a vasodilator originally developed to treat high blood pressure. It works by widening blood vessels and opening potassium channels, which significantly increases blood flow to hair follicles. This enhanced circulation delivers more oxygen and nutrients to dormant follicles, stimulating them to enter the active growth phase.\n\nFor facial hair, minoxidil converts vellus hairs (thin, barely visible peach fuzz) into terminal hairs (thick, dark, permanent beard hairs). While FDA-approved only for scalp hair loss, it has been widely used off-label for beard enhancement with remarkable success rates across thousands of documented cases.`,
    keyPoints: [
      'Minoxidil is a potassium channel opener and vasodilator that increases blood flow to hair follicles, stimulating dormant follicles into active growth',
      'Results typically begin appearing at 3-4 months with significant progress at 6-12 months — patience and consistency are essential',
      'Available in liquid (5%) and foam (5%) formulations — foam dries faster and causes less skin irritation, liquid is cheaper and may absorb better',
      'Common side effects include dry skin, initial shedding, headaches, and unwanted body hair growth — most are manageable and temporary',
      'Combining minoxidil with dermarolling (microneedling) can dramatically increase absorption and effectiveness by up to 10x',
      'Gains become permanent once vellus hairs fully convert to terminal hairs, typically after 1-2 years of consistent use',
    ],
  },
  {
    title: 'Beard Growth Protocol',
    icon: 'checkmark-done-outline',
    color: '#00d26a',
    content: `Follow this step-by-step application protocol twice daily for optimal results. Consistency is the single most important factor in beard growth success with minoxidil:`,
    steps: [
      { step: 1, title: 'Clean Face First', desc: 'Wash your face with a gentle cleanser and pat dry completely. Clean skin ensures maximum absorption and prevents bacteria from being pushed into pores. Avoid harsh exfoliants before application.' },
      { step: 2, title: 'Apply 1ml to Beard Area', desc: 'Use the dropper or pump to measure exactly 1ml of minoxidil. More is not better — exceeding 1ml per application increases side effects without improving results. Apply directly to the areas where you want beard growth.' },
      { step: 3, title: 'Spread Evenly with Fingertips', desc: 'Use clean fingertips to spread the solution evenly across your entire beard area including cheeks, jawline, chin, and mustache zone. Ensure thin, even coverage rather than concentrated spots.' },
      { step: 4, title: 'Leave On for 4+ Hours', desc: 'Allow minoxidil to fully absorb for a minimum of 4 hours before washing your face or applying other products. The longer it stays on, the more is absorbed into the follicles. Ideal absorption window is 4-6 hours.' },
      { step: 5, title: 'Apply 2x Daily (Morning & Evening)', desc: 'Apply once in the morning after your skincare routine and once in the evening. Space applications 8-12 hours apart for consistent blood levels. Missing applications significantly reduces effectiveness.' },
      { step: 6, title: 'Track Progress Monthly with Photos', desc: 'Take standardized progress photos in the same lighting and angle every month. Growth is gradual and difficult to notice day-to-day. Monthly comparison photos are the best way to stay motivated and track real progress.' },
    ],
  },
  {
    title: 'Dermarolling for Beard Enhancement',
    icon: 'construct-outline',
    color: '#0066ff',
    content: `Microneedling (dermarolling) creates thousands of micro-channels in the skin that can boost minoxidil absorption by up to 10x. It also triggers the wound healing response, releasing growth factors and increasing collagen production that further stimulate hair follicle activity:`,
    steps: [
      { step: 1, title: 'Choose a 0.5mm Dermaroller', desc: 'A 0.5mm needle length is the optimal balance between effectiveness and safety for facial use. Shorter needles are less effective, and longer needles increase risk of scarring and infection without additional beard growth benefit.' },
      { step: 2, title: 'Sanitize Before Use', desc: 'Soak your dermaroller in 70% isopropyl alcohol for 5-10 minutes before every session. Never use a dirty or dull roller. Replace your dermaroller every 3-4 months as needles dull with use.' },
      { step: 3, title: 'Roll in 4 Directions, 10 Passes Each', desc: 'Roll horizontally, vertically, and both diagonals across your beard area. Apply firm but gentle pressure — you should see mild redness but not bleeding. Cover the entire area you want beard growth.' },
      { step: 4, title: 'Wait 24 Hours Before Applying Minoxidil', desc: 'Do NOT apply minoxidil to freshly dermarolled skin. The micro-channels increase systemic absorption which amplifies side effects. Wait a full 24 hours for the skin to close before resuming minoxidil application.' },
      { step: 5, title: 'Roll 1-2x Per Week', desc: 'Dermaroll once or twice per week maximum. Your skin needs time to heal between sessions. More frequent rolling damages the skin barrier and can cause irritation, scarring, and reduced effectiveness.' },
    ],
  },
  {
    title: 'Side Effects & Safety',
    icon: 'shield-checkmark-outline',
    color: '#ff5252',
    content: `Minoxidil is generally safe when used correctly, but being aware of potential side effects and common mistakes will help you get the best results while minimizing risks:`,
    mistakes: [
      { wrong: 'Applying too much per application', right: 'Stick to exactly 1ml per application. More does not equal faster growth — it only increases side effects like dizziness, headaches, and unwanted body hair.' },
      { wrong: 'Applying to broken or irritated skin', right: 'Wait for your skin to fully heal before applying minoxidil. Open wounds, cuts, or active acne allow excessive systemic absorption and can cause adverse reactions.' },
      { wrong: 'Panicking at initial shedding phase', right: 'Shedding is completely normal during the first 2-4 weeks. Minoxidil pushes weak hairs out to make room for stronger terminal hairs. This is actually a sign it is working.' },
      { wrong: 'Skipping moisturizer in your routine', right: 'Use a good moisturizer daily as minoxidil significantly dries out the skin. Apply moisturizer after the 4-hour absorption window to keep skin healthy and prevent flaking.' },
      { wrong: 'Applying right before bed on your pillow', right: 'Apply at least 4 hours before bed to allow full absorption. Minoxidil transferring to your pillow reduces effectiveness and can cause unwanted hair growth or irritation on other skin.' },
      { wrong: 'Stopping abruptly at 6 months of use', right: 'Continue for 12-24 months until your gains are fully terminal. Stopping too early means vellus and transitional hairs will fall out. Only taper off once hairs are thick and dark.' },
    ],
  },
  {
    title: 'Results Timeline',
    icon: 'calendar-outline',
    color: '#4d94ff',
    content: `Understanding the typical progression timeline helps set realistic expectations and keeps you consistent through the process. Individual results vary based on genetics, age, and consistency:`,
    timeline: [
      { period: 'Month 1-2: Initial Shedding Phase', result: 'Existing vellus hairs may thin and shed as follicles reset their growth cycle. This is normal and expected. Skin may feel drier than usual. No visible new growth yet — stay consistent and trust the process.' },
      { period: 'Month 3-4: New Vellus Hairs Appearing', result: 'New vellus hairs (peach fuzz) begin appearing in previously bare areas. These are thin, light-colored, and barely visible. This is the first real sign of progress. Coverage starts expanding beyond your natural beard pattern.' },
      { period: 'Month 5-6: Vellus Converting to Transitional', result: 'Early vellus hairs begin converting to transitional hairs — slightly thicker and darker. Coverage is visibly increasing. Some areas may develop faster than others. The beard starts taking recognizable shape.' },
      { period: 'Month 7-9: Significant Density Improvement', result: 'Significant density improvement becomes obvious. Dark terminal hairs are filling in across the beard area. Transitional hairs continue thickening. Friends and family start noticing the change. Beard trims become necessary.' },
      { period: 'Month 10-12: Near-Full Coverage', result: 'Near-full coverage achieved for most users. Thick terminal hairs dominate the beard area. Remaining thin spots continue filling. This is where many see their best results and the beard looks genuinely full and natural.' },
      { period: 'Month 12-24: Gains Lock In Permanently', result: 'Remaining gains lock in as all transitional hairs complete conversion to terminal. You can begin slowly tapering off minoxidil — reduce to once daily, then every other day, then stop. Terminal hairs are permanent and will not fall out.' },
    ],
  },
  {
    title: 'Supplement Stack for Beard Growth',
    icon: 'nutrition-outline',
    color: '#ffab40',
    content: `These supplements work synergistically with minoxidil to maximize beard growth potential. They support hair follicle health, androgen receptor activity, and provide the raw materials needed for hair production:`,
    supplements: [
      { name: 'Biotin', dose: '5,000-10,000 mcg/day', evidence: 'Supports keratin production, the primary structural protein in hair. Deficiency causes brittle, slow-growing hair. Water-soluble so excess is excreted — safe at higher doses. Take consistently for 3+ months.', rating: 'B+' },
      { name: 'L-Carnitine L-Tartrate', dose: '2g/day', evidence: 'Upregulates androgen receptors in hair follicles, making them more responsive to testosterone and DHT. Studies show it increases hair growth factor activity. Take with food for best absorption.', rating: 'A' },
      { name: 'Collagen Peptides', dose: '10-15g/day', evidence: 'Provides amino acids (proline, glycine, hydroxyproline) that serve as building blocks for hair structure and skin health. Supports the dermal layer where follicles are rooted. Mix into coffee or smoothies.', rating: 'B+' },
      { name: 'Castor Oil (Topical)', dose: 'Apply to beard area at night', evidence: 'Rich in ricinoleic acid which improves blood circulation to follicles and has anti-inflammatory properties. Improves hair thickness and luster. Apply on minoxidil off-days or after absorption window.', rating: 'B' },
      { name: 'Peppermint Oil (Topical)', dose: '3% solution applied topically', evidence: 'Shown to increase hair growth comparable to minoxidil 2% in mouse studies. Increases IGF-1 growth factor and promotes anagen phase. Dilute in carrier oil — never apply pure essential oil directly to skin.', rating: 'B+' },
    ],
  },
];

const MinoxidilGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Minoxidil Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="color-wand-outline" size={30} color="#e17055" />
              </View>
              <Text style={styles.heroTitle}>Minoxidil & Beard Growth</Text>
              <Text style={styles.heroSubtitle}>The complete facial hair enhancement protocol</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>18 min</Text></View>
                <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>Intermediate</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(225,112,85,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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

export default MinoxidilGuideScreen;
