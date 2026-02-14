import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, GLASS } from '../utils/theme';

const SLEEP_EFFECTS = [
  { area: 'Dark Circles', icon: 'eye-outline', color: '#7c6cf0', desc: 'Sleep deprivation causes blood pooling under thin undereye skin. 7-9hrs reduces puffiness and discoloration.' },
  { area: 'Skin Repair', icon: 'sparkles-outline', color: '#00e676', desc: 'Growth hormone peaks during deep sleep (stage 3-4), driving collagen production and cellular repair.' },
  { area: 'Facial Bloating', icon: 'water-outline', color: '#00e5ff', desc: 'Poor sleep disrupts cortisol and aldosterone, causing water retention and puffy face.' },
  { area: 'Acne & Breakouts', icon: 'alert-circle-outline', color: '#ff6b35', desc: 'Sleep deprivation spikes cortisol → increased sebum production → more breakouts.' },
  { area: 'Aging', icon: 'hourglass-outline', color: '#ff6090', desc: 'One study found poor sleepers showed 2x more signs of aging than good sleepers. Telomere shortening accelerates.' },
  { area: 'Attractiveness', icon: 'heart-outline', color: '#ff5252', desc: 'Research shows sleep-deprived faces are rated significantly less attractive and less healthy by others.' },
];

const SLEEP_PROTOCOL = [
  { time: '6:00 PM', action: 'Last caffeine cutoff (8hr rule)', icon: 'cafe-outline', color: '#ffab40' },
  { time: '8:00 PM', action: 'Dim lights, enable blue light filter on devices', icon: 'bulb-outline', color: '#a89afa' },
  { time: '9:00 PM', action: 'No more food — 2-3hr gap before sleep aids digestion', icon: 'restaurant-outline', color: '#ff6b35' },
  { time: '9:30 PM', action: 'Bedroom to 65-68°F (18-20°C) — cool room is critical', icon: 'thermometer-outline', color: '#00e5ff' },
  { time: '10:00 PM', action: 'Magnesium glycinate (400mg) + screens off', icon: 'medical-outline', color: '#00e676' },
  { time: '10:15 PM', action: 'Mouth tape applied, sleep position set (back sleeping ideal)', icon: 'bandage-outline', color: '#7c6cf0' },
  { time: '10:30 PM', action: 'Lights out — room pitch black', icon: 'moon-outline', color: '#1de9b6' },
  { time: '6:00 AM', action: 'Wake at same time daily — 10 min morning sunlight', icon: 'sunny-outline', color: '#ffab40' },
];

const SLEEP_POSITION = [
  { position: 'Back Sleeping', rating: 'Best', color: '#00e676', pros: ['No facial compression', 'Symmetric development', 'Less wrinkles', 'Best for mewing'], cons: ['Can worsen snoring', 'Takes practice to maintain'] },
  { position: 'Side Sleeping', rating: 'Okay', color: '#ffab40', pros: ['Natural for most people', 'Good for breathing'], cons: ['Compresses one side of face', 'Can cause asymmetry over time', 'Pillow wrinkles'] },
  { position: 'Stomach Sleeping', rating: 'Worst', color: '#ff5252', pros: ['May reduce snoring'], cons: ['Maximum facial compression', 'Neck strain', 'Accelerates wrinkles', 'Disrupts tongue posture'] },
];

const SUPPLEMENTS_SLEEP = [
  { name: 'Magnesium Glycinate', dose: '400mg', when: '30-60min before bed', effect: 'Relaxes muscles, calms nervous system. Most people are deficient.' },
  { name: 'L-Theanine', dose: '200mg', when: '30min before bed', effect: 'Promotes alpha brain waves. Non-drowsy calm. Improves sleep quality.' },
  { name: 'Glycine', dose: '3g', when: 'Before bed', effect: 'Lowers core body temperature. Improves deep sleep duration.' },
  { name: 'Mouth Tape', dose: 'N/A', when: 'At bedtime', effect: 'Forces nasal breathing during sleep. Supports mewing posture. Start with small strip.' },
];

const SleepGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, GLASS.card]}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(168,154,250,0.15)', 'rgba(168,154,250,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(168,154,250,0.2)' }]}>
              <Ionicons name="moon-outline" size={32} color="#a89afa" />
            </View>
            <Text style={styles.heroTitle}>Sleep Optimization</Text>
            <Text style={styles.heroSubtitle}>Sleep is the most underrated looksmaxxing tool. Your face literally rebuilds itself while you sleep.</Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}><Ionicons name="time-outline" size={12} color="#a89afa" /><Text style={styles.metaText}>8 min</Text></View>
              <View style={styles.metaPill}><Ionicons name="school-outline" size={12} color="#a89afa" /><Text style={styles.metaText}>Beginner</Text></View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* How Sleep Affects Your Face */}
        <Text style={styles.sectionTitle}>How Sleep Affects Your Face</Text>
        {SLEEP_EFFECTS.map((item, idx) => (
          <View key={idx} style={styles.effectCard}>
            <View style={[styles.effectIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <View style={styles.effectContent}>
              <Text style={styles.effectArea}>{item.area}</Text>
              <Text style={styles.effectDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {/* Evening Protocol */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Evening Protocol</Text>
        {SLEEP_PROTOCOL.map((item, idx) => (
          <View key={idx} style={styles.protocolRow}>
            <View style={[styles.protocolTime, { backgroundColor: item.color + '18' }]}>
              <Text style={[styles.protocolTimeText, { color: item.color }]}>{item.time}</Text>
            </View>
            <View style={styles.protocolLine}>
              <View style={[styles.protocolDot, { backgroundColor: item.color }]} />
              {idx < SLEEP_PROTOCOL.length - 1 && <View style={styles.protocolConnector} />}
            </View>
            <View style={styles.protocolContent}>
              <Text style={styles.protocolAction}>{item.action}</Text>
            </View>
          </View>
        ))}

        {/* Sleep Position */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sleep Position</Text>
        {SLEEP_POSITION.map((pos, idx) => (
          <View key={idx} style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionName}>{pos.position}</Text>
              <View style={[styles.ratingBadge, { backgroundColor: pos.color + '20' }]}>
                <Text style={[styles.ratingBadgeText, { color: pos.color }]}>{pos.rating}</Text>
              </View>
            </View>
            <View style={styles.prosConsRow}>
              <View style={styles.prosCol}>
                {pos.pros.map((p, pi) => (
                  <View key={pi} style={styles.proConRow}>
                    <Ionicons name="checkmark" size={13} color="#00e676" />
                    <Text style={styles.proConText}>{p}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.consCol}>
                {pos.cons.map((c, ci) => (
                  <View key={ci} style={styles.proConRow}>
                    <Ionicons name="close" size={13} color="#ff5252" />
                    <Text style={styles.proConText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Supplements */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sleep Supplements</Text>
        {SUPPLEMENTS_SLEEP.map((s, idx) => (
          <View key={idx} style={styles.suppCard}>
            <View style={styles.suppHeader}>
              <Text style={styles.suppName}>{s.name}</Text>
              <View style={styles.suppDose}><Text style={styles.suppDoseText}>{s.dose}</Text></View>
            </View>
            <Text style={styles.suppWhen}>Take: {s.when}</Text>
            <Text style={styles.suppEffect}>{s.effect}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, alignItems: 'center' },
  heroIconBg: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  effectCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  effectIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  effectContent: { flex: 1 },
  effectArea: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  effectDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  protocolRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 48, marginBottom: 2 },
  protocolTime: { width: 70, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center' },
  protocolTimeText: { fontSize: 11, fontWeight: '700' },
  protocolLine: { alignItems: 'center', width: 20, paddingTop: 4 },
  protocolDot: { width: 10, height: 10, borderRadius: 5 },
  protocolConnector: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 2 },
  protocolContent: { flex: 1, paddingLeft: 8, paddingBottom: 12 },
  protocolAction: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  positionCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  positionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  positionName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  ratingBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  ratingBadgeText: { fontSize: 11, fontWeight: '700' },
  prosConsRow: { flexDirection: 'row', gap: 12 },
  prosCol: { flex: 1 },
  consCol: { flex: 1 },
  proConRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, paddingVertical: 2 },
  proConText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  suppCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  suppHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  suppName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  suppDose: { backgroundColor: COLORS.accentGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  suppDoseText: { fontSize: 10, color: COLORS.accent, fontWeight: '700' },
  suppWhen: { fontSize: 12, color: COLORS.accent, marginBottom: 4 },
  suppEffect: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
});

export default SleepGuideScreen;
