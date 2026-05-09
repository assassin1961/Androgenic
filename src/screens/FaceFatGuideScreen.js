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
    title: 'Why Facial Leanness Is Everything',
    icon: 'diamond-outline',
    color: '#00e5ff',
    content: `Your bone structure is already there — it's just hidden under subcutaneous fat. Getting a lean face is the single most transformative change you can make. A lean face reveals your jawline, cheekbones, and facial hollows that create the sculpted look.\n\nEven if you have average bone structure, a lean face at 12% body fat will look dramatically better than great bone structure buried under 25% body fat. This is why face leanness is the #1 priority in lookmaxxing.`,
    keyPoints: [
      'Face fat is the LAST place men lose fat — you need to get genuinely lean (12-15% BF)',
      'Buccal fat pads (cheek fat) diminish naturally from ages 20-30 but can be accelerated',
      'Facial water retention accounts for 30-40% of facial "puffiness" — often mistaken for fat',
      'A 10-pound fat loss can change your face more than any skincare routine ever will',
      'Malar fat pads above cheekbones thin out, revealing zygomatic arch projection',
      'Submental fat (double chin area) dramatically obscures jawline definition',
    ],
  },
  {
    title: 'The Lean Face Diet Protocol',
    icon: 'nutrition-outline',
    color: '#00d26a',
    content: `This isn't a crash diet — it's a strategic caloric deficit optimized for facial fat loss while preserving muscle mass that supports facial structure:`,
    steps: [
      { step: 1, title: 'Calculate Your Deficit', desc: 'Find your TDEE (Total Daily Energy Expenditure) and eat 300-500 calories below it. Aggressive deficits (>700 cal) cause cortisol spikes that increase facial bloating — the opposite of what you want.' },
      { step: 2, title: 'High Protein (1g per lb bodyweight)', desc: 'Protein preserves lean mass during a cut. Lean face needs muscle to "hang on" — otherwise you get a gaunt, sunken look. Chicken, fish, eggs, Greek yogurt, whey protein.' },
      { step: 3, title: 'Sodium Cycle (Low 5 days, Normal 2)', desc: 'Keep sodium under 1500mg for 5 days to reduce facial water retention, then eat normally for 2 days. This prevents your body from upregulating aldosterone (water-retaining hormone).' },
      { step: 4, title: 'Eliminate Inflammatory Foods', desc: 'Dairy, gluten, excess sugar, and alcohol all cause facial inflammation and water retention in most people. Cut them for 3 weeks and compare face photos. The difference is dramatic.' },
      { step: 5, title: 'Strategic Carb Timing', desc: 'Eat carbs primarily around workouts. Keep evening meals low-carb and high-protein. Carbs cause glycogen storage which holds water — less glycogen before bed = leaner face in the morning.' },
      { step: 6, title: 'Hydrate Aggressively (1 gallon/day)', desc: 'Counterintuitively, drinking MORE water reduces water retention. Your body stops holding water when it knows more is coming. Add electrolytes (potassium, magnesium) for optimal cellular hydration.' },
    ],
  },
  {
    title: 'Facial Fat Burning Exercises',
    icon: 'fitness-outline',
    color: '#ff6b35',
    content: `You cannot spot-reduce fat, but these exercises optimize the muscles and circulation in your face while the diet handles actual fat loss:`,
    exercises: [
      { name: 'Jaw Clenches + Gum Chewing', duration: '30 min daily', desc: 'Builds masseter muscle which fills out the jaw angle area. When you lose facial fat, the masseter creates that angular, masculine jaw look. Use mastic or falim gum.' },
      { name: 'Chin Lifts', duration: '3×20 reps', desc: 'Tilt head back, push jaw forward, feel stretch under chin. Tightens the submental area and reduces the appearance of a double chin. Do morning and evening.' },
      { name: 'Fish Face Hold', duration: '5×30 sec', desc: 'Suck cheeks in and hold. Engages buccinator muscles and creates temporary hollowing. Over time, facial muscles adapt to this more "sucked in" position.' },
      { name: 'Tongue Press', duration: '3×60 sec', desc: 'Press tongue hard against roof of mouth. Engages the floor of the mouth and submental muscles. Creates upward facial lifting force.' },
      { name: 'Neck Curls', duration: '3×15 reps', desc: 'Lie on bench, curl chin to chest with weight plate on forehead (start light). A thick neck frames the jaw and makes the face appear leaner by contrast.' },
      { name: 'Gua Sha Massage', duration: '10 min daily', desc: 'Not an exercise but critical — use a gua sha stone to drain lymphatic fluid from the face. Reduces puffiness by 30%+ in minutes. Stroke upward and outward.' },
    ],
  },
  {
    title: 'Rapid De-Bloating Strategies',
    icon: 'water-outline',
    color: '#4d94ff',
    content: `These techniques can make your face look significantly leaner within 24-48 hours by reducing water retention and inflammation:`,
    keyPoints: [
      'Cold Shower Face Blast: End every shower with 60 seconds of cold water on your face. Constricts blood vessels, reduces puffiness, tightens skin. Visible results immediately.',
      'Sleep Elevated: Use 2 pillows or elevate bed head by 6 inches. Gravity prevents fluid from pooling in your face overnight. Wake up with a significantly leaner face.',
      'Eliminate Alcohol Completely: One night of drinking causes 48-72 hours of facial bloating. Alcohol dehydrates cells while retaining water subcutaneously. The puffiest faces belong to drinkers.',
      'Morning Ice Rolling: Keep a stainless steel roller in the freezer. Roll face for 5 minutes every morning. Reduces morning puffiness by stimulating lymphatic drainage.',
      'Potassium Loading: Eat bananas, avocados, sweet potatoes. Potassium counteracts sodium-induced water retention. Most men consume way too much sodium and not enough potassium.',
      'Intermittent Fasting (16:8): Eating window of 8 hours. During the 16-hour fast, your body depletes glycogen stores and sheds subcutaneous water. Morning fasted face is always your leanest.',
      'Sauna Sessions (3×15 min/week): Sweating in a sauna reduces water weight and improves circulation. Your face will look noticeably more defined after each session.',
    ],
  },
  {
    title: 'Body Fat % Visual Guide',
    icon: 'body-outline',
    color: '#ff6090',
    content: `Here's what each body fat percentage range looks like on your face specifically:`,
    timeline: [
      { period: '25%+ Body Fat', result: 'Face appears round and soft. Jawline is completely hidden. Double chin present. Cheeks are full. No visible bone structure. This is where most men start.' },
      { period: '20-25% Body Fat', result: 'Slight jawline visible from certain angles. Face still round. Submental fat starting to reduce. Beginning to see some facial structure emerge.' },
      { period: '15-20% Body Fat', result: 'Jawline becoming defined. Cheekbones starting to show. Face looks "normal" to "good." Most men look good here. Facial hollows beginning to appear.' },
      { period: '12-15% Body Fat', result: 'The sweet spot. Jawline is sharp, cheekbones pop, facial hollows are visible. Face looks masculine and angular. Most male models sit in this range.' },
      { period: '10-12% Body Fat', result: 'Razor-sharp facial definition. Every bone structure detail is visible. Skin looks tight over bone. This requires disciplined eating but the facial aesthetics are peak.' },
      { period: '<10% Body Fat', result: 'Extremely lean. Face can start looking gaunt if muscle mass is low. Only sustainable short-term for most. Cheek hollows become very pronounced. Not always the best look.' },
    ],
  },
  {
    title: 'The 30-Day Lean Face Challenge',
    icon: 'trophy-outline',
    color: '#FFD700',
    content: `Follow this exact protocol for 30 days and take comparison photos. Most men see dramatic facial changes:`,
    steps: [
      { step: 1, title: 'Days 1-7: Elimination Phase', desc: 'Cut alcohol, dairy, gluten, processed sugar, and excess sodium completely. Drink 1 gallon of water daily. Start morning cold showers and ice rolling. Take day 1 front and side photos.' },
      { step: 2, title: 'Days 8-14: Deficit Phase', desc: 'Begin 400-calorie deficit. 1g protein per lb bodyweight. Low-carb evenings. Add gua sha massage morning and evening. Start chewing mastic gum 30min daily.' },
      { step: 3, title: 'Days 15-21: Optimization Phase', desc: 'Add intermittent fasting (16:8). Sodium cycling begins (low 5, normal 2). Sleep elevated. Add facial exercises (jaw clenches, chin lifts, fish face). Take progress photo.' },
      { step: 4, title: 'Days 22-30: Peak Phase', desc: 'Continue all protocols. Add 3 sauna sessions. Increase water to 1.25 gallons. Final 3 days: very low sodium + increased potassium for maximum water shedding. Take final comparison photo.' },
    ],
  },
];

const FaceFatGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Face Fat Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="diamond-outline" size={30} color="#00e5ff" />
              </View>
              <Text style={styles.heroTitle}>Face Fat Reduction</Text>
              <Text style={styles.heroSubtitle}>Reveal your bone structure and sculpt a lean, angular face</Text>
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

                  {section.exercises && (
                    <View style={styles.exercisesList}>
                      {section.exercises.map((ex, ei) => (
                        <GlassCard key={ei} style={styles.exerciseCard}>
                          <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <View style={styles.durationPill}><Text style={styles.durationText}>{ex.duration}</Text></View>
                          </View>
                          <Text style={styles.exerciseDesc}>{ex.desc}</Text>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(0,229,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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
  exercisesList: { gap: 8 },
  exerciseCard: { padding: 14 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  exerciseName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  durationPill: { backgroundColor: 'rgba(0,102,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durationText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
  exerciseDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
  timelineList: { gap: 0 },
  timelineItem: { flexDirection: 'row', position: 'relative', minHeight: 60 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { position: 'absolute', left: 9, top: 22, bottom: -2, width: 2, backgroundColor: COLORS.borderLight },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelinePeriod: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  timelineResult: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});

export default FaceFatGuideScreen;
