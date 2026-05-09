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
    title: 'What Is Soft Maxxing?',
    icon: 'sparkles-outline',
    color: '#FFD700',
    content: `Soft maxxing is optimizing your appearance through non-surgical, reversible methods. While hard maxxing involves bone structure and surgery, soft maxxing covers style, grooming, fragrance, body language, skin, and presentation.\n\nSoft maxxing is often underrated but can add 2-3 points to your overall attractiveness. A well-dressed, well-groomed man with average bone structure will outperform a man with great bone structure who doesn't groom or dress well. It's the highest ROI looksmaxxing strategy.`,
    keyPoints: [
      'Soft maxxing can improve perceived attractiveness by 2-3 points on a 10-point scale',
      'It\'s the fastest way to look better — results in days, not months',
      'Style, grooming, and scent account for 40-50% of first impressions',
      'Unlike hard maxxing, everything is reversible and adjustable',
      'Most men are operating at 40-60% of their potential in soft maxxing',
      'The "halo effect" — looking good in one area makes people rate you higher in all areas',
    ],
  },
  {
    title: 'Style Mastery: The 80/20 Wardrobe',
    icon: 'shirt-outline',
    color: '#4d94ff',
    content: `You don't need hundreds of outfits. You need 20 core pieces that work in any combination. Here's the essential masculine wardrobe:`,
    steps: [
      { step: 1, title: 'Fit Is King — Tailor Everything', desc: 'The #1 rule. A $30 shirt tailored to your body looks better than a $300 shirt that doesn\'t fit. Shoulders should hit your shoulder bone. Shirts should taper at the waist. No excess fabric anywhere.' },
      { step: 2, title: 'Neutral Base Colors', desc: 'Build your wardrobe around black, white, navy, grey, and olive. These colors never clash, always look sophisticated, and create effortless outfits. Add ONE accent color (burgundy, forest green, etc.).' },
      { step: 3, title: 'The Power Pieces', desc: 'Black leather jacket (instant edge). Well-fitted dark jeans (your daily armor). Clean white sneakers (goes with everything). Fitted black t-shirt (shows physique). Quality watch (signals status).' },
      { step: 4, title: 'Dress for Your Body Type', desc: 'Slim: avoid oversized. Layer to add visual width. Athletic: fitted shirts that show shoulders without being too tight. Bigger: structured fabrics, vertical patterns, dark colors, avoid logos.' },
      { step: 5, title: 'Shoe Game', desc: 'Women notice shoes first. Own: clean white sneakers, Chelsea boots (black), dress shoes (cap toe oxford), casual loafers. Keep them CLEAN. Dirty shoes ruin any outfit.' },
      { step: 6, title: 'Accessories That Elevate', desc: 'Silver chain (subtle, not chunky). Quality sunglasses (face-shape appropriate). Minimal bracelet. Clean watch. Ring (optional). These small details separate "tries hard" from "naturally stylish."' },
    ],
  },
  {
    title: 'Fragrance: The Invisible Accessory',
    icon: 'flask-outline',
    color: '#ff6090',
    content: `Scent is the most powerful and underused tool in attraction. Studies show fragrance can increase perceived attractiveness by up to 40%. Here's how to master it:`,
    keyPoints: [
      'Signature Scent Strategy: Own 3-4 fragrances. One for daily wear, one for evening/dates, one for formal occasions, one for summer. Rotate based on context.',
      'Application Points: Pulse points ONLY — wrists, neck, behind ears, inner elbows. 2-3 sprays maximum. You want people to discover your scent, not be overwhelmed by it.',
      'Starter Recommendations (Affordable): Versace Dylan Blue (versatile), Dior Sauvage (crowd-pleasing), Bleu de Chanel (sophisticated), YSL Y EDP (young/fresh).',
      'Advanced Picks (Premium): Creed Aventus (king of compliments), Tom Ford Tobacco Vanille (cold weather), Parfums de Marly Layton (evening), MFK Baccarat Rouge 540 (unique/polarizing).',
      'Layering Technique: Use matching shower gel + moisturizer as base layer. Your fragrance will last 2-3x longer and project better. Apply to moisturized skin, never dry skin.',
      'The Sillage Test: Spray, wait 30 minutes, ask someone if they can smell you from arm\'s length. If yes from further — too much. If no from arm\'s length — add one more spray.',
      'Season Matching: Light/citrus/aquatic for summer. Warm/spicy/woody for winter. Transitional scents (fresh spicy) for spring/fall. Wrong scent for the season is a common mistake.',
    ],
  },
  {
    title: 'Grooming: The Non-Negotiables',
    icon: 'cut-outline',
    color: '#00e676',
    content: `These grooming habits separate the top 10% of men from everyone else. None are optional:`,
    exercises: [
      { name: 'Haircut Every 3-4 Weeks', duration: 'Essential', desc: 'Find a barber who understands face shapes. Fade sides, textured top works for most face shapes. Ask for a style that adds height on top to elongate a round face, or width for long faces.' },
      { name: 'Eyebrow Maintenance', duration: 'Weekly', desc: 'Pluck stray hairs between brows and below the arch. Brush upward with a spoolie and trim what extends past your natural brow line. Well-groomed brows frame the entire face. Never over-pluck.' },
      { name: 'Nose & Ear Hair Removal', duration: 'Weekly', desc: 'Use a nose hair trimmer, not scissors. Any visible nose or ear hair is an instant grooming fail. Check in natural light — bathroom lighting hides these.' },
      { name: 'Teeth Whitening Protocol', duration: 'Ongoing', desc: 'White teeth are universally attractive. Use whitening strips (Crest 3D White) every 6 months, maintain with whitening toothpaste. Electric toothbrush + floss daily. Consider professional cleaning 2x/year.' },
      { name: 'Beard or Clean Shave (Pick One)', duration: 'Daily', desc: 'If you can grow a full beard: keep it at 5mm stubble for the "shadow" effect that defines the jawline. If patchy: clean shave is better than a bad beard. Define your neckline (2 fingers above Adam\'s apple).' },
      { name: 'Lip Care', duration: 'Daily', desc: 'Dry, chapped lips are an instant turn-off. Apply lip balm with SPF morning and night. Exfoliate lips gently 1x/week with a lip scrub. Hydrated lips make your entire face look healthier.' },
      { name: 'Hand & Nail Grooming', duration: 'Weekly', desc: 'Trim nails short and straight. Push back cuticles after showering. Moisturize hands daily. Clean under nails. People notice hands in every interaction — handshakes, gesturing, dining.' },
    ],
  },
  {
    title: 'Body Language & Presence',
    icon: 'walk-outline',
    color: '#ff6b35',
    content: `How you carry yourself accounts for 55% of first impressions (vs 7% from words and 38% from vocal tone). Master these:`,
    steps: [
      { step: 1, title: 'Posture: Stand Like You Own the Room', desc: 'Shoulders back and down, chest slightly open, chin parallel to ground. Imagine a string pulling the crown of your head upward. Good posture makes you look taller, leaner, and more confident instantly.' },
      { step: 2, title: 'Eye Contact: The 70/30 Rule', desc: 'Maintain eye contact 70% of the time when listening, 30% when speaking. Hold gaze 3-4 seconds before looking away sideways (never down — that signals submission). Practice in conversations daily.' },
      { step: 3, title: 'Walk With Purpose', desc: 'Slow, deliberate steps. Don\'t rush. Arms swinging naturally, shoulders back. Head up, looking forward not at your phone. A confident walk is immediately noticeable and attractive.' },
      { step: 4, title: 'Take Up Space', desc: 'Don\'t cross arms or shrink. Rest arms on armrests, widen your stance slightly when standing. Taking up appropriate space signals confidence and dominance without being aggressive.' },
      { step: 5, title: 'Slow Your Movements', desc: 'Quick, jerky movements signal anxiety. Move 20% slower than feels natural. Turn your whole body to face someone when they speak. Slow movements project calm authority.' },
      { step: 6, title: 'The Genuine Smile', desc: 'A real smile (Duchenne smile) engages the eyes and is the single most attractive facial expression. Practice in the mirror — crow\'s feet should appear. A forced smile only moves the mouth and looks fake.' },
    ],
  },
  {
    title: 'The Complete Soft Maxx Checklist',
    icon: 'checkmark-done-outline',
    color: '#1de9b6',
    content: `Run through this checklist before any important event, date, or whenever you want to look your absolute best:`,
    keyPoints: [
      'Hair: freshly styled, product applied, no flyaways, clean and healthy-looking',
      'Skin: moisturized, no visible acne/redness, SPF applied, concealer on dark circles if needed',
      'Brows: trimmed, no unibrow, clean arch line',
      'Facial hair: freshly groomed, neckline defined, even length',
      'Teeth: clean, flossed, breath fresh (carry mints)',
      'Fragrance: 2-3 sprays on pulse points, appropriate for the occasion',
      'Outfit: fitted correctly, wrinkle-free, color-coordinated, clean shoes',
      'Accessories: watch, chain, or bracelet — max 2-3 pieces total',
      'Nails: trimmed, clean, cuticles pushed back',
      'Posture: shoulders back, chin up, chest open',
      'Lips: moisturized, not chapped',
      'Confidence cue: before walking in, take 3 deep breaths and stand in a power pose for 30 seconds',
    ],
  },
];

const SoftMaxxingGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Soft Maxxing Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="gold" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="sparkles-outline" size={30} color="#FFD700" />
              </View>
              <Text style={styles.heroTitle}>Soft Maxxing Mastery</Text>
              <Text style={styles.heroSubtitle}>Style, fragrance, grooming & presence — the fastest path to looking elite</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.gold} /><Text style={styles.metaText}>22 min</Text></View>
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
  heroIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
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
  exercisesList: { gap: 8 },
  exerciseCard: { padding: 14 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  exerciseName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  durationPill: { backgroundColor: 'rgba(0,102,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durationText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
  exerciseDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
});

export default SoftMaxxingGuideScreen;
