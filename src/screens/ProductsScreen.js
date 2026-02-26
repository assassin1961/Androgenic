import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Linking, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { PRODUCTS, getToolRecommendations } from '../data/products';

const { width } = Dimensions.get('window');
const STORE_URL = 'https://androgenicpeptides.lovable.app';

const PEPTIDE_PRODUCTS = [
  { name: 'BPC-157', desc: 'Accelerates tissue repair, gut healing, and recovery. The most researched peptide for healing.', category: 'Recovery', icon: 'shield-checkmark', color: '#00e676', tag: 'Best Seller' },
  { name: 'GHK-Cu', desc: 'Copper peptide for skin rejuvenation, collagen synthesis, and anti-aging. Proven for facial aesthetics.', category: 'Skin', icon: 'sparkles', color: '#0066ff', tag: 'Top Rated' },
  { name: 'TB-500', desc: 'Promotes cell migration and repair. Synergizes with BPC-157 for enhanced healing.', category: 'Recovery', icon: 'fitness', color: '#ff6b35' },
  { name: 'CJC-1295 / Ipamorelin', desc: 'Growth hormone releasing stack. Improves skin quality, body composition, and sleep.', category: 'Growth', icon: 'trending-up', color: '#4d94ff', tag: 'Popular' },
  { name: 'PT-141', desc: 'Melanocortin agonist for enhanced confidence and social signaling.', category: 'Performance', icon: 'flash', color: '#ff6090' },
  { name: 'Epithalon', desc: 'Telomerase activator for cellular anti-aging. Promotes longevity and skin youth.', category: 'Anti-Aging', icon: 'hourglass', color: '#FFD700', tag: 'Premium' },
  { name: 'Melanotan II', desc: 'Melanocortin peptide for enhanced skin tone and complexion without UV exposure.', category: 'Skin', icon: 'sunny', color: '#ffab40' },
  { name: 'Thymosin Alpha-1', desc: 'Immune modulator that supports overall health and faster recovery from training.', category: 'Health', icon: 'heart', color: '#00b4d8' },
  { name: 'DSIP', desc: 'Delta sleep-inducing peptide. Optimizes deep sleep for maximum HGH release and facial repair.', category: 'Sleep', icon: 'moon', color: '#7c4dff' },
  { name: 'Collagen Peptides Stack', desc: 'Bioavailable collagen peptides types I, II, III for skin elasticity, joints, and facial volume.', category: 'Skin', icon: 'water', color: '#1de9b6', tag: 'Essential' },
];

const TABS = [
  { key: 'store', label: 'Peptides', icon: 'flask-outline' },
  { key: 'skin', label: 'Skin', icon: 'water-outline' },
  { key: 'jawline', label: 'Jaw', icon: 'square-outline' },
  { key: 'eyes', label: 'Eyes', icon: 'eye-outline' },
  { key: 'hair', label: 'Hair', icon: 'leaf-outline' },
  { key: 'tools', label: 'Tools', icon: 'construct-outline' },
];

const ProductsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('store');
  const sectionFades = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const cardAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animateCards();
    sectionFades.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 1, duration: 400, delay: i * 100, useNativeDriver: true }).start();
    });
  }, [activeTab]);

  const animateCards = () => {
    cardAnims.forEach((a) => a.setValue(0));
    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 1, duration: 300, delay: i * 50, useNativeDriver: true }).start();
    });
  };

  const openStore = () => Linking.openURL(STORE_URL);
  const openProduct = (name) => Linking.openURL(`${STORE_URL}#${name.toLowerCase().replace(/\s+/g, '-')}`);

  const renderPeptideStore = () => (
    <>
      {/* Hero Banner */}
      <Animated.View style={{ opacity: sectionFades[0] }}>
        <TouchableOpacity onPress={openStore} activeOpacity={0.85}>
          <LinearGradient
            colors={['#0044cc', '#0066ff', '#0088ff']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroIconWrap}>
              <Ionicons name="flask" size={32} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>ANDROGENIC PEPTIDES</Text>
            <Text style={styles.heroSub}>Premium research peptides for peak performance, recovery, and aesthetics</Text>
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Visit Store</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>99%</Text>
                <Text style={styles.heroStatLabel}>Purity</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>Lab</Text>
                <Text style={styles.heroStatLabel}>Tested</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>Fast</Text>
                <Text style={styles.heroStatLabel}>Shipping</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Peptide Categories Quick Nav */}
      <Animated.View style={{ opacity: sectionFades[1] }}>
        <Text style={styles.sectionTitle}>For Looksmaxxers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {['Skin', 'Recovery', 'Growth', 'Anti-Aging', 'Sleep', 'Performance'].map((cat, i) => (
            <TouchableOpacity key={cat} style={styles.catChip} onPress={openStore} activeOpacity={0.7}>
              <Text style={styles.catChipText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Peptide Products */}
      <Animated.View style={{ opacity: sectionFades[2] }}>
        <Text style={styles.sectionTitle}>Featured Peptides</Text>
        {PEPTIDE_PRODUCTS.map((p, i) => {
          const animIdx = Math.min(i, cardAnims.length - 1);
          return (
            <Animated.View key={p.name} style={{ opacity: cardAnims[animIdx] }}>
              <TouchableOpacity
                style={styles.peptideCard}
                onPress={() => openProduct(p.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.peptideIcon, { backgroundColor: p.color + '18' }]}>
                  <Ionicons name={p.icon} size={20} color={p.color} />
                </View>
                <View style={styles.peptideInfo}>
                  <View style={styles.peptideNameRow}>
                    <Text style={styles.peptideName}>{p.name}</Text>
                    {p.tag && (
                      <View style={[styles.peptideTag, { backgroundColor: p.color + '20', borderColor: p.color + '40' }]}>
                        <Text style={[styles.peptideTagText, { color: p.color }]}>{p.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.peptideCat}>{p.category}</Text>
                  <Text style={styles.peptideDesc} numberOfLines={2}>{p.desc}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={{ opacity: sectionFades[3] }}>
        <TouchableOpacity onPress={openStore} activeOpacity={0.85}>
          <LinearGradient colors={['#0055dd', '#0077ff']} style={styles.bottomCta}>
            <Ionicons name="storefront" size={20} color="#fff" />
            <Text style={styles.bottomCtaText}>Browse Full Catalog</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.bottomDisclaimer}>
          Peptides are sold for research purposes only. Always consult a healthcare professional.
        </Text>
      </Animated.View>
    </>
  );

  const renderProducts = () => {
    if (activeTab === 'tools') {
      return getToolRecommendations().map((product, i) => renderProductCard(product, i));
    }
    const catProducts = PRODUCTS[activeTab];
    if (!catProducts) return null;

    let idx = 0;
    return Object.entries(catProducts).map(([subcat, products]) => (
      <View key={subcat}>
        <Text style={styles.subcatTitle}>{subcat.charAt(0).toUpperCase() + subcat.slice(1)}</Text>
        {products.map((product) => renderProductCard(product, idx++))}
      </View>
    ));
  };

  const renderProductCard = (product, index) => {
    const animIdx = Math.min(index, cardAnims.length - 1);
    return (
      <Animated.View
        key={product.name}
        style={[styles.productCard, { opacity: cardAnims[animIdx] }]}
      >
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.productMeta}>
              <Text style={styles.productPrice}>{product.price}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color={COLORS.gold} />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.productWhy}>{product.why}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products & Store</Text>
        <TouchableOpacity onPress={openStore} style={styles.storeBtn}>
          <Ionicons name="storefront" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'store' ? renderPeptideStore() : (
          <>
            <Text style={styles.disclaimer}>
              Products recommended based on looksmax.org community favorites.
            </Text>
            {renderProducts()}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  storeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066ff', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  tabScroll: { maxHeight: 44, marginBottom: 4 },
  tabContainer: { paddingHorizontal: 20, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  // Hero Banner
  heroBanner: { borderRadius: 18, padding: 22, marginBottom: 20, alignItems: 'center' },
  heroIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2, marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 19, marginBottom: 16, maxWidth: 280 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginBottom: 16 },
  heroCtaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '500', marginTop: 1 },
  heroStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Category chips
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.3 },
  catRow: { gap: 8, marginBottom: 20 },
  catChip: { backgroundColor: COLORS.bgCard, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  catChipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },

  // Peptide Cards
  peptideCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  peptideIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  peptideInfo: { flex: 1 },
  peptideNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  peptideName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  peptideTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  peptideTagText: { fontSize: 9, fontWeight: '700' },
  peptideCat: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500', marginBottom: 3 },
  peptideDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },

  // Bottom CTA
  bottomCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  bottomCtaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomDisclaimer: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },

  // Existing product styles
  disclaimer: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic', marginBottom: 12 },
  subcatTitle: {
    color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginTop: 12, marginBottom: 8,
  },
  productCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  productHeader: { flexDirection: 'row', marginBottom: 6 },
  productInfo: { flex: 1 },
  productName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productPrice: { color: COLORS.scoreHigh, fontSize: 14, fontWeight: '700' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },
  productWhy: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
});

export default ProductsScreen;
