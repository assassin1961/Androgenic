import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { PRODUCTS, getToolRecommendations } from '../data/products';

const TABS = [
  { key: 'skin', label: 'Skin', icon: 'water-outline' },
  { key: 'jawline', label: 'Jaw', icon: 'square-outline' },
  { key: 'eyes', label: 'Eyes', icon: 'eye-outline' },
  { key: 'hair', label: 'Hair', icon: 'leaf-outline' },
  { key: 'tools', label: 'Tools', icon: 'construct-outline' },
];

const ProductsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('skin');
  const cardAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animateCards();
  }, [activeTab]);

  const animateCards = () => {
    cardAnims.forEach((a) => a.setValue(0));
    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 60),
        Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  };

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
        style={[styles.productCard, {
          opacity: cardAnims[animIdx],
          transform: [{ translateY: cardAnims[animIdx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}
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
        <Text style={styles.headerTitle}>Recommended Products</Text>
        <View style={{ width: 40 }} />
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
        <Text style={styles.disclaimer}>
          Products recommended based on looksmax.org community favorites. Not sponsored.
        </Text>
        {renderProducts()}
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
  scroll: { paddingHorizontal: 20 },
  disclaimer: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic', marginBottom: 12, marginTop: 8 },
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
