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
    title: 'Why Photos Make or Break You',
    icon: 'camera-outline',
    color: '#ff6090',
    content: `In the digital age, you're judged by your photos more than in person. Dating apps, social media, professional profiles — your photo IS your first impression. Studies show that camera angle alone can change perceived attractiveness by 2-3 points on a 10 scale. A 6 can look like a 4 or an 8 depending on how the photo is taken. This guide will ensure you always look your best.`,
    keyPoints: [
      'Photos taken from below make faces look wider and less attractive',
      'Slight above angle is universally flattering for jaw and eyes',
      'Natural light is 10x more flattering than artificial',
      'Focal length distortion from phone cameras can warp your face',
      'Left side of face is statistically considered more attractive by 56% of people',
      'Genuine micro-expressions are more attractive than posed smiles',
    ],
  },
  {
    title: 'The Perfect Angle Blueprint',
    icon: 'crop-outline',
    color: '#0066ff',
    content: `Master these angles and never take a bad photo again`,
    steps: [
      { step: 1, title: 'Camera Slightly Above Eye Level', desc: 'Hold phone at forehead height, look up slightly. This elongates jaw and slims face.' },
      { step: 2, title: 'Chin Down and Forward', desc: 'Push jaw slightly forward, tilt chin 5° down. Sharpens jawline dramatically.' },
      { step: 3, title: '3/4 Turn', desc: 'Turn head 20-30° to one side. Shows jaw depth and cheekbone projection.' },
      { step: 4, title: 'Body Angle', desc: 'Angle body 30-45° from camera, face slightly turned toward camera, one shoulder closer.' },
      { step: 5, title: 'Slight Head Tilt', desc: '5-10° tilt toward camera. Creates engagement and asymmetry interest.' },
      { step: 6, title: 'The Hero Shot', desc: 'From slightly below chin level, face tilted up. Creates powerful dominant look for profile pics.' },
    ],
  },
  {
    title: 'Lighting Mastery',
    icon: 'sunny-outline',
    color: '#ffd740',
    content: `Lighting is the single most important factor in photo quality`,
    steps: [
      { step: 1, title: 'Golden Hour', desc: 'Shoot 30 min before sunset for warm, directional light that sculpts facial features.' },
      { step: 2, title: 'Window Light', desc: 'Stand 3 feet from a large window with indirect light, position face at 45° to window.' },
      { step: 3, title: 'Loop Lighting', desc: 'Main light source at 45° angle and slightly above. Creates sculpted shadow on jaw.' },
      { step: 4, title: 'Rembrandt Lighting', desc: 'Position light so triangle of light forms on shadowed cheek. Ultra-dramatic and masculine.' },
      { step: 5, title: 'Avoid Overhead Lighting', desc: 'Creates dark under-eye shadows and nose shadow. Always use front/side light.' },
      { step: 6, title: 'Ring Light Positioning', desc: 'Place slightly above eye level. Creates catchlights in eyes and even illumination.' },
    ],
  },
  {
    title: 'Dating App Photo Strategy',
    icon: 'heart-outline',
    color: '#ff5252',
    content: `Specific strategies for maximum dating app performance`,
    steps: [
      { step: 1, title: 'Lead Photo', desc: 'Clear face shot with natural light, slight smile, good background, no sunglasses.' },
      { step: 2, title: 'Full Body Shot', desc: 'Well-fitted clothes, good posture, taken by someone else not selfie.' },
      { step: 3, title: 'Activity Photo', desc: 'Doing something interesting (hiking, cooking, playing instrument). Shows personality.' },
      { step: 4, title: 'Social Photo', desc: 'With friends, cropped to focus on you. Signals social proof.' },
      { step: 5, title: 'Pet Photo', desc: 'If you have one, instant conversation starter and warmth signal.' },
      { step: 6, title: 'Travel/Adventure', desc: 'Interesting location, good outfit. Shows you have a life.' },
    ],
  },
  {
    title: 'Phone Camera Hacks',
    icon: 'phone-portrait-outline',
    color: '#00d26a',
    content: `Technical settings and tricks for better photos on any phone`,
    keyPoints: [
      'Use back camera not front — front camera distorts face up to 30% wider at arm\'s length',
      'Use 2x optical zoom and step back — eliminates wide-angle distortion, makes face proportions accurate',
      'Turn on portrait mode — background blur makes you the focus and looks professional',
      'Clean your lens — dirty lens creates haze that makes skin look worse',
      'Use timer + prop phone — allows better angles than selfie and both hands free',
      'Edit subtly — slight increase in contrast and warmth, never over-filter',
    ],
  },
  {
    title: 'Photo Editing Do\'s and Don\'ts',
    icon: 'color-filter-outline',
    color: '#7c4dff',
    content: `Enhance your photos without looking fake`,
    mistakes: [
      { wrong: 'Heavy Facetune/smoothing', right: 'Only minor blemish removal, keep skin texture natural' },
      { wrong: 'Extreme contrast/saturation', right: 'Subtle warmth increase (+5-10) and slight contrast boost' },
      { wrong: 'Changing face shape/jaw', right: 'If it doesn\'t look like you in person it will backfire' },
      { wrong: 'Using preset filters', right: 'Manual adjustments to exposure, shadows, and highlights only' },
      { wrong: 'Whitening teeth too much', right: 'Slight whitening looks natural, paper-white looks fake' },
      { wrong: 'Posting only heavily edited photos', right: 'Mix of casual and polished photos builds trust and authenticity' },
    ],
  },
];

const PhotoGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Photo & Angles Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="camera-outline" size={30} color="#ff6090" />
              </View>
              <Text style={styles.heroTitle}>Photo & Angles Mastery</Text>
              <Text style={styles.heroSubtitle}>Never take a bad photo again</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.accent} /><Text style={styles.metaText}>16 min</Text></View>
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
  mistakesList: { gap: 8 },
  mistakeCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 12, gap: 6 },
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mistakeWrong: { flex: 1, fontSize: 13, color: '#ff5252', lineHeight: 18 },
  mistakeRight: { flex: 1, fontSize: 13, color: '#00e676', lineHeight: 18 },
});

export default PhotoGuideScreen;
