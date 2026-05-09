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
    title: 'The Algorithm Advantage',
    icon: 'trending-up',
    color: '#ff6090',
    content: `Dating apps use ELO/desirability scores that determine who sees your profile. Your first 48 hours on a platform are critical — the algorithm shows you to more people initially. If your photos and bio are optimized, you get more right swipes, which boosts your ELO, which shows you to more attractive people. It's a compounding loop. The same person with an optimized vs unoptimized profile can get 5-10x more matches.`,
    keyPoints: [
      'First 48 hours on any app are crucial — your profile gets boosted',
      'Being selective (not swiping right on everyone) signals high value to the algorithm',
      'Daily app usage keeps your profile visible in the stack',
      'Photo order matters — your first photo determines 90% of swipe decisions',
      'Verified profiles get 30% more visibility on most platforms',
      'Deleting and remaking your account resets your ELO score',
    ],
  },
  {
    title: 'Profile Photo Stack Formula',
    icon: 'images-outline',
    color: '#0066ff',
    content: `The exact photo order proven to maximize matches:`,
    steps: [
      { step: 1, title: 'Photo 1 — Clear Headshot', desc: 'Clear headshot/shoulders, natural light, slight smile or confident neutral. This is your billboard.' },
      { step: 2, title: 'Photo 2 — Full Body Social', desc: 'Full body in a social setting, well-dressed, good posture. Shows your build.' },
      { step: 3, title: 'Photo 3 — Action/Hobby Shot', desc: 'Doing something cool or interesting. Conversation starter.' },
      { step: 4, title: 'Photo 4 — Social Proof', desc: 'You with friends looking like you belong. Crop to feature you prominently.' },
      { step: 5, title: 'Photo 5 — Wild Card', desc: 'Pet photo, travel photo, or dressy event photo. Shows range.' },
      { step: 6, title: 'Photo 6 — Optional Personality', desc: 'Funny/personality photo or another strong angle. Never a low-quality filler.' },
    ],
  },
  {
    title: 'Bio That Converts',
    icon: 'create-outline',
    color: '#00d26a',
    content: `Your bio is a sales pitch — short, intriguing, and designed to start conversations:`,
    steps: [
      { step: 1, title: 'Keep It Under 150 Characters', desc: 'Brevity signals confidence. Long bios signal insecurity.' },
      { step: 2, title: 'Lead With a Hook', desc: 'Humor, bold statement, or intriguing fact about yourself.' },
      { step: 3, title: 'Include a Conversation Starter', desc: '"Ask me about..." or a unique interest that invites questions.' },
      { step: 4, title: 'Show Don\'t Tell', desc: '"6\'1 | chef | rock climber" beats "I\'m tall and like to cook and do outdoor stuff."' },
      { step: 5, title: 'No Negatives', desc: 'Never list what you don\'t want. Focus entirely on positive energy.' },
    ],
  },
  {
    title: 'Platform-Specific Strategies',
    icon: 'apps-outline',
    color: '#ffd740',
    content: `Each platform has different demographics and expectations:`,
    keyPoints: [
      'Tinder — photo-first platform, lead with your strongest visual, bio matters less',
      'Hinge — prompt answers are key, be specific and funny not generic, shows personality',
      'Bumble — women message first so make your profile inviting and non-intimidating',
      'Instagram — curate your grid as a lifestyle portfolio, story highlights show your world',
      'Social circle — optimize your real-life social media to attract through existing networks',
      'LinkedIn-dating crossover — professional photos that are attractive signal success and ambition',
    ],
  },
  {
    title: 'Common Profile Killers',
    icon: 'close-circle-outline',
    color: '#ff5252',
    content: `These mistakes are costing you matches every day:`,
    mistakes: [
      { wrong: 'Group photos where you can\'t be identified', right: 'Always be the clear focus — if using group photos you should stand out' },
      { wrong: 'Gym selfies/mirror pics', right: 'Have someone photograph you at the gym naturally — mirror selfies look low-effort' },
      { wrong: 'Listing height only if tall', right: 'Include height regardless — transparency builds trust, own it confidently' },
      { wrong: 'Generic bio "just ask" or "looking for my person"', right: 'Specific interests and humor show personality' },
      { wrong: 'All selfies', right: 'Mix of candid, posed, and activity shots taken by others shows you have a life' },
      { wrong: 'Photos older than 1 year', right: 'Use recent photos that look like current you — catfishing destroys trust immediately' },
    ],
  },
  {
    title: 'Profile Optimization Checklist',
    icon: 'checkbox-outline',
    color: '#7c4dff',
    content: `Run through this checklist before going live:`,
    keyPoints: [
      'First photo is a clear high-quality headshot',
      'At least one full-body photo included',
      'Photos taken in different locations and outfits',
      'No more than one selfie in the stack',
      'At least one social/group photo',
      'Bio is under 150 characters',
      'Bio includes a conversation starter or hook',
      'No negative statements or demands in bio',
      'Photos are from the last 6 months',
      'At least one photo shows a hobby or interest',
      'Profile is verified if platform allows it',
      'Asked a female friend to review before going live',
    ],
  },
];

const DatingProfileGuideScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>Dating Profile Guide</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="gold" style={styles.hero}>
              <View style={styles.heroIconBg}>
                <Ionicons name="heart-circle-outline" size={30} color="#ff6090" />
              </View>
              <Text style={styles.heroTitle}>Dating & Social Profile</Text>
              <Text style={styles.heroSubtitle}>Maximize your digital first impression</Text>
              <View style={styles.heroMeta}>
                <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color={COLORS.gold} /><Text style={styles.metaText}>15 min</Text></View>
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
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#000' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  stepDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
  mistakesList: { gap: 8 },
  mistakeCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 12, gap: 6 },
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mistakeWrong: { flex: 1, fontSize: 13, color: '#ff5252', lineHeight: 18 },
  mistakeRight: { flex: 1, fontSize: 13, color: '#00e676', lineHeight: 18 },
});

export default DatingProfileGuideScreen;
