import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';

const SECTIONS = [
  {
    title: 'Skin Supplements',
    icon: 'sparkles-outline',
    color: '#00e676',
    items: [
      { name: 'Vitamin C', dose: '500-1000mg/day', desc: 'Boosts collagen synthesis and brightens skin from inside. Take in the morning for antioxidant protection.' },
      { name: 'Collagen Peptides', dose: '10-15g/day', desc: 'Type I & III collagen directly supports skin elasticity, hydration, and wound healing. Mix into coffee or smoothies.' },
      { name: 'Zinc', dose: '15-30mg/day', desc: 'Controls oil production, reduces acne, and speeds skin repair. Take with food to avoid nausea.' },
      { name: 'Omega-3 (Fish Oil)', dose: '2-3g EPA+DHA/day', desc: 'Reduces inflammation, improves skin moisture, and provides a natural glow. Choose molecularly distilled brands.' },
    ],
  },
  {
    title: 'Hair Supplements',
    icon: 'brush-outline',
    color: '#ffab40',
    items: [
      { name: 'Biotin', dose: '5000mcg/day', desc: 'Supports keratin production for stronger, thicker hair. Results take 3-6 months of consistent use.' },
      { name: 'Saw Palmetto', dose: '320mg/day', desc: 'Natural DHT blocker that may help slow hair thinning. Works best when started early.' },
      { name: 'Iron', dose: '18mg/day (if deficient)', desc: 'Iron deficiency is a common cause of hair loss. Get blood work before supplementing — excess iron is harmful.' },
      { name: 'Vitamin D', dose: '2000-4000IU/day', desc: 'Stimulates hair follicles and promotes growth cycles. Most people are deficient, especially in winter.' },
    ],
  },
  {
    title: 'Bone & Jaw',
    icon: 'fitness-outline',
    color: '#00e5ff',
    items: [
      { name: 'Vitamin K2 (MK-7)', dose: '100-200mcg/day', desc: 'Directs calcium into bones and teeth rather than soft tissue. Essential partner for vitamin D.' },
      { name: 'Calcium', dose: '500-1000mg/day', desc: 'Supports bone density including facial bones. Get from food first; supplement only if diet falls short.' },
      { name: 'Magnesium Glycinate', dose: '400mg/day', desc: 'Needed for calcium absorption and bone mineralization. Also improves sleep quality and reduces stress.' },
      { name: 'Boron', dose: '3-6mg/day', desc: 'Trace mineral that supports bone metabolism and may boost free testosterone levels. Often overlooked.' },
    ],
  },
  {
    title: 'Anti-Aging',
    icon: 'hourglass-outline',
    color: '#ff6090',
    items: [
      { name: 'NMN', dose: '250-500mg/day', desc: 'Nicotinamide mononucleotide boosts NAD+ levels, supporting cellular energy and DNA repair for youthful skin.' },
      { name: 'Resveratrol', dose: '250-500mg/day', desc: 'Potent polyphenol that activates sirtuins. Take with fat for better absorption. Found in red wine grapes.' },
      { name: 'CoQ10', dose: '100-200mg/day', desc: 'Coenzyme Q10 protects against oxidative damage and supports mitochondrial function. Ubiquinol form absorbs better.' },
      { name: 'Astaxanthin', dose: '4-12mg/day', desc: '6000x stronger antioxidant than vitamin C. Provides natural UV protection and reduces fine lines.' },
    ],
  },
  {
    title: 'Testosterone Support',
    icon: 'trending-up-outline',
    color: '#ff6b35',
    items: [
      { name: 'Ashwagandha (KSM-66)', dose: '600mg/day', desc: 'Adaptogen shown to increase testosterone by 15-17% in studies. Also reduces cortisol and stress.' },
      { name: 'Tongkat Ali', dose: '200-400mg/day', desc: 'Eurycoma longifolia supports free testosterone by reducing SHBG. Standardized extract recommended.' },
      { name: 'Vitamin D3', dose: '4000-5000IU/day', desc: 'Men with adequate vitamin D have significantly higher testosterone. Pair with K2 for proper calcium routing.' },
      { name: 'Zinc', dose: '30mg/day', desc: 'Critical for testosterone production. Zinc deficiency directly lowers T levels. ZMA form is popular for athletes.' },
    ],
  },
  {
    title: 'Hydration & Detox',
    icon: 'water-outline',
    color: '#4d94ff',
    items: [
      { name: 'Electrolytes', dose: 'Daily with water', desc: 'Sodium, potassium, and magnesium balance hydration at the cellular level. Crucial for skin plumpness.' },
      { name: 'Green Tea Extract', dose: '250-500mg/day', desc: 'EGCG catechins reduce sebum production, fight free radicals, and improve skin clarity.' },
      { name: 'Milk Thistle', dose: '250mg/day', desc: 'Silymarin supports liver detoxification which directly impacts skin clarity and reduces breakouts.' },
    ],
  },
];

const STACKS = [
  {
    level: 'Beginner Stack',
    color: '#00e676',
    items: ['Vitamin D3 + K2', 'Omega-3 Fish Oil', 'Magnesium Glycinate', 'Collagen Peptides', 'Zinc'],
  },
  {
    level: 'Advanced Stack',
    color: '#ff6b35',
    items: ['Everything in Beginner +', 'Ashwagandha KSM-66', 'NMN or Resveratrol', 'Astaxanthin', 'Tongkat Ali', 'Green Tea Extract', 'Boron'],
  },
];

const SupplementsGuideScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedSection, setExpandedSection] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplements Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['rgba(0,230,118,0.15)', 'rgba(0,230,118,0.03)']} style={styles.hero}>
            <View style={[styles.heroIconBg, { backgroundColor: 'rgba(0,230,118,0.2)' }]}>
              <Ionicons name="flask-outline" size={32} color="#00e676" />
            </View>
            <Text style={styles.heroTitle}>Supplements for Aesthetics</Text>
            <Text style={styles.heroSubtitle}>
              Targeted supplementation to support skin quality, hair health, bone structure, and overall facial aesthetics
            </Text>
            <View style={styles.heroMeta}>
              <View style={styles.metaPill}>
                <Ionicons name="flask-outline" size={12} color="#00e676" />
                <Text style={styles.metaText}>6 Categories</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="layers-outline" size={12} color="#00e676" />
                <Text style={styles.metaText}>2 Stacks</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Supplement Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.sectionHeader, expandedSection === idx && styles.sectionHeaderActive]}
              onPress={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionIcon, { backgroundColor: section.color + '18' }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons name={expandedSection === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedSection === idx && (
              <View style={styles.sectionBody}>
                {section.items.map((item, ii) => (
                  <View key={ii} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={[styles.doseBadge, { backgroundColor: section.color + '18' }]}>
                        <Text style={[styles.doseText, { color: section.color }]}>{item.dose}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Supplement Stacks */}
        <Text style={styles.stackSectionTitle}>Supplement Stack</Text>
        {STACKS.map((stack, idx) => (
          <View key={idx} style={styles.stackCard}>
            <View style={styles.stackHeader}>
              <LinearGradient colors={[stack.color, stack.color + 'aa']} style={styles.stackBadge}>
                <Text style={styles.stackBadgeText}>{idx === 0 ? 'I' : 'II'}</Text>
              </LinearGradient>
              <Text style={styles.stackLevel}>{stack.level}</Text>
            </View>
            {stack.items.map((item, ii) => (
              <View key={ii} style={styles.stackItemRow}>
                <Ionicons name="checkmark" size={14} color={stack.color} />
                <Text style={styles.stackItemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="warning-outline" size={18} color="#ffab40" />
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            Consult a healthcare professional before starting any supplement regimen. Supplements are not a replacement for a balanced diet. Individual needs vary based on health conditions, medications, and deficiencies. Always get blood work done to identify actual deficiencies before supplementing.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  hero: { padding: 24, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, alignItems: 'center' },
  heroIconBg: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgCard, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  metaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  sectionHeaderActive: { borderColor: COLORS.accent + '40', marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  sectionBody: { backgroundColor: COLORS.bgCard, padding: 12, marginBottom: 8, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.accent + '40' },
  itemCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 10, padding: 12, marginBottom: 6 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  doseBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  doseText: { fontSize: 10, fontWeight: '700' },
  itemDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  stackSectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 20, marginBottom: 12 },
  stackCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  stackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  stackBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stackBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  stackLevel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  stackItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  stackItemText: { fontSize: 13, color: COLORS.textSecondary },
  disclaimerCard: { backgroundColor: 'rgba(255,171,64,0.08)', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,171,64,0.2)' },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  disclaimerTitle: { fontSize: 14, fontWeight: '700', color: '#ffab40' },
  disclaimerText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});

export default SupplementsGuideScreen;
