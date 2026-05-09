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
    title: 'Why Collagen Is Your Face\'s Foundation',
    icon: 'layers-outline',
    color: '#ff6090',
    content: `Collagen makes up 80% of skin structure. After age 20, you lose ~1% per year. Loss leads to sagging, wrinkles, hollow under-eyes, and thin skin that reveals dark circles. Rebuilding collagen = younger, tighter face.`,
    keyPoints: [
      'Collagen production peaks in your late teens and declines ~1% annually after 20 — by 40, you\'ve lost 20% of your facial collagen',
      'Type I collagen provides structural strength and firmness, while Type III supports skin elasticity and hydration — both decline with age',
      'UV radiation breaks down collagen fibers through MMP enzymes, destroying more collagen in a single sunburn than months of natural aging',
      'Facial fat pads sit on a collagen scaffold — as collagen degrades, fat pads descend and deflate, creating nasolabial folds and hollow cheeks',
      'Collagen is directly responsible for skin thickness and elasticity — thicker skin hides blood vessels, reduces dark circles, and resists wrinkle formation',
      'Men lose collagen slower than women (~1% vs ~2% post-30) due to testosterone, but still need active protection since male skin is more prone to UV damage from less sunscreen use',
    ],
  },
  {
    title: 'Collagen Rebuilding Protocol',
    icon: 'construct-outline',
    color: '#00d26a',
    content: `A multi-angle approach to rebuilding facial collagen through proven topicals, supplements, and lifestyle interventions:`,
    steps: [
      { step: 1, title: 'Retinol/Tretinoin Nightly', desc: 'The gold standard collagen stimulator. Tretinoin increases collagen I and III production by stimulating fibroblasts. Start at 0.025% and build tolerance over 3 months. Apply pea-sized amount to dry skin 20 minutes after washing.' },
      { step: 2, title: 'Vitamin C Serum Morning', desc: 'Essential cofactor for collagen synthesis — without vitamin C, your body literally cannot produce collagen. Use 15-20% L-Ascorbic Acid serum every morning under sunscreen for maximum collagen support and antioxidant protection.' },
      { step: 3, title: 'Daily SPF 50 Sunscreen', desc: 'UV radiation destroys collagen 10x faster than natural aging through MMP enzyme activation. Apply SPF 50+ broad spectrum every single day, rain or shine. Reapply every 2 hours when outdoors. This is the #1 anti-aging step.' },
      { step: 4, title: 'Collagen Peptides Supplement 15g/Day', desc: 'Provides the glycine, proline, and hydroxyproline building blocks your body needs for collagen synthesis. Hydrolyzed collagen peptides are absorbed and delivered to the dermis. Mix into coffee, smoothies, or water daily.' },
      { step: 5, title: 'Red Light Therapy 10 Min Daily', desc: 'Red light (630-660nm) and near-infrared (810-850nm) wavelengths penetrate the skin and stimulate fibroblast collagen production. Use a quality LED panel 6-12 inches from face for 10 minutes daily. Clinically proven to improve skin texture and firmness.' },
      { step: 6, title: 'Bone Broth or Glycine Supplement 5g/Day', desc: 'Glycine is the most abundant amino acid in collagen, making up every third residue. Bone broth provides glycine, proline, and minerals in a bioavailable form. Alternatively, supplement with 5g glycine powder before bed — also improves sleep quality.' },
    ],
  },
  {
    title: 'Anti-Aging Skincare Stack',
    icon: 'sparkles-outline',
    color: '#7c4dff',
    content: `The exact products and routine for maximum anti-aging results, ranked by scientific evidence and real-world effectiveness:`,
    supplements: [
      { name: 'Tretinoin', dose: '0.025-0.05% nightly', evidence: 'The only FDA-approved topical proven to reverse photoaging and rebuild collagen. Increases epidermal thickness, stimulates new collagen deposition, and improves skin texture within 12 weeks.', rating: 'A+' },
      { name: 'Vitamin C (L-Ascorbic Acid)', dose: '15-20%', evidence: 'Boosts collagen synthesis up to 8x, provides potent antioxidant protection against UV and pollution damage, brightens skin tone, and fades hyperpigmentation. Apply every morning.', rating: 'A+' },
      { name: 'Niacinamide', dose: '5% serum', evidence: 'Improves skin barrier function, visibly reduces pore size, controls oil production, and evens skin tone. Well-tolerated by all skin types and layers well with other actives.', rating: 'A' },
      { name: 'Hyaluronic Acid', dose: '2% serum on damp skin', evidence: 'Holds 1000x its weight in water, providing instant plumping and hydration. Multi-molecular weight formulas penetrate multiple skin layers. Always apply to damp skin.', rating: 'A' },
      { name: 'Peptide Complex', dose: 'Matrixyl/copper peptides', evidence: 'Signal peptides like Matrixyl (palmitoyl pentapeptide-4) tell fibroblasts to produce more collagen. Copper peptides aid wound healing and remodeling. Use as complement to retinol.', rating: 'B+' },
      { name: 'SPF 50 Sunscreen', dose: 'Daily, rain or shine', evidence: 'Prevents 90% of visible aging including wrinkles, dark spots, and collagen breakdown. Broad spectrum UVA/UVB protection is the single most impactful anti-aging product you can use.', rating: 'A+' },
    ],
  },
  {
    title: 'Face-Aging Accelerators to Avoid',
    icon: 'close-circle-outline',
    color: '#ff5252',
    content: `These habits age your face years faster than normal. Eliminating them is just as important as your anti-aging routine:`,
    mistakes: [
      { wrong: 'Unprotected sun exposure', right: 'Wear SPF 50 daily without exception. UV radiation causes 90% of visible skin aging, breaking down collagen and elastin fibers while causing hyperpigmentation and DNA damage.' },
      { wrong: 'Smoking or vaping', right: 'Nicotine constricts blood vessels, reducing blood flow and collagen production by up to 40%. Repetitive facial expressions from smoking also create deep wrinkles around the mouth and eyes.' },
      { wrong: 'High sugar diet', right: 'Sugar causes glycation — a process where glucose molecules attach to collagen fibers, cross-linking and stiffening them. Glycated collagen becomes brittle, yellow, and unable to repair. Limit added sugars to under 25g/day.' },
      { wrong: 'Sleeping on your face', right: 'Sleep on your back or use a silk pillowcase to prevent compression wrinkles. Side and stomach sleeping presses your face into the pillow for 6-8 hours, creating permanent creases over time.' },
      { wrong: 'Hot showers on face', right: 'Use lukewarm water on your face. Hot water strips natural oils, weakens the skin barrier, increases redness, and can trigger inflammation that accelerates collagen breakdown.' },
      { wrong: 'Neglecting neck and hands', right: 'Age shows on the neck and hands first because the skin is thinner and gets less care. Extend your entire skincare routine — cleanser, retinol, vitamin C, SPF — to your neck, chest, and hands.' },
    ],
  },
  {
    title: 'Facial Massage & Lymphatic Drainage',
    icon: 'hand-left-outline',
    color: '#00e5ff',
    content: `Stimulate blood flow and collagen production through targeted facial massage techniques that also reduce puffiness and improve contour:`,
    steps: [
      { step: 1, title: 'Gua Sha Technique', desc: 'Using a gua sha stone or your knuckles, apply firm upward strokes along the jawline from chin to ear. Repeat 5-10 strokes per side. This promotes blood circulation, reduces tension, and stimulates collagen remodeling. Spend 3 minutes on this area.' },
      { step: 2, title: 'Under-Eye Lymphatic Drainage', desc: 'Using your ring finger (lightest pressure), gently tap from the inner corner of the eye outward along the orbital bone. This moves stagnant lymph fluid that causes puffiness and dark circles. Never drag or pull the delicate under-eye skin.' },
      { step: 3, title: 'Forehead Smoothing', desc: 'Place both hands flat on your forehead and apply firm upward strokes from eyebrows to hairline. This relaxes the frontalis muscle, prevents horizontal forehead lines, and increases blood flow to promote collagen production in this area.' },
      { step: 4, title: 'Cheekbone Sculpting', desc: 'Using knuckles or a gua sha tool, perform upward diagonal strokes from the corner of the mouth toward the temple along the cheekbone. This lifts the midface, defines cheekbones, and reduces nasolabial fold depth over time.' },
      { step: 5, title: 'Neck Drainage', desc: 'Using flat palms, apply gentle downward strokes from the jawline down to the collarbone. This moves lymph fluid toward the lymph nodes for drainage, reducing facial puffiness and double chin appearance. Always stroke downward on the neck.' },
    ],
  },
  {
    title: 'Age-Defying Results Timeline',
    icon: 'time-outline',
    color: '#4d94ff',
    content: `What to expect when following the full collagen rebuilding protocol consistently. Patience is key — collagen remodeling is a slow but powerful process:`,
    timeline: [
      { period: 'Week 1-2', result: 'Skin feels smoother and more hydrated from hyaluronic acid and moisturizer. You may experience initial retinol purging — mild flaking and sensitivity as skin cell turnover accelerates. This is normal and temporary.' },
      { period: 'Month 1-2', result: 'Visible improvement in skin texture and overall tone. Pores appear smaller from niacinamide. Skin looks brighter and more even from vitamin C. The retinol purge subsides and skin starts to glow.' },
      { period: 'Month 3-4', result: 'Fine lines begin noticeably softening as new collagen is deposited in the dermis. Skin feels firmer and thicker to the touch. Under-eye area looks less hollow. Facial massage results become apparent with better contour.' },
      { period: 'Month 6', result: 'Significant anti-aging results are visible. Skin is measurably firmer, wrinkles are reduced, and complexion is dramatically improved. People start commenting that you look younger and more refreshed.' },
      { period: 'Month 12', result: 'Maximum collagen rebuilding achieved with consistent protocol adherence. Face looks 3-5 years younger with tighter skin, stronger bone structure visibility, and youthful elasticity. Maintain the routine for lasting results.' },
    ],
  },
];

const CollagenGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Collagen Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="flower-outline" size={30} color="#ff6090" />
              </View>
              <Text style={styles.heroTitle}>Collagen & Anti-Aging</Text>
              <Text style={styles.heroSubtitle}>Turn back the clock on facial aging</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>16 min read</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,96,144,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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

export default CollagenGuideScreen;
