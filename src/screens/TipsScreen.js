import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { canAccessCategory, getMaxTipsForCategory, isPro } from '../utils/pro';
import { getTipsForCategory, getOverallTips } from '../data/tips';

const TipsScreen = ({ route, navigation }) => {
  const { scores, focusCategory } = route.params;
  const [activeCategory, setActiveCategory] = useState(focusCategory || 'overall');
  const pro = isPro();
  const maxTips = getMaxTipsForCategory();

  const categories = ['overall', 'masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'];

  const getTips = () => {
    if (activeCategory === 'overall') {
      return getOverallTips(scores.overall);
    }
    return getTipsForCategory(activeCategory, scores[activeCategory] || 50);
  };

  const tips = getTips();
  const locked = activeCategory !== 'overall' && !canAccessCategory(activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tips & Recommendations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const isLocked = cat !== 'overall' && !canAccessCategory(cat);
          const label = cat === 'overall' ? 'Overall' : CATEGORY_INFO[cat]?.label || cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                if (isLocked) {
                  navigation.navigate('Paywall');
                } else {
                  setActiveCategory(cat);
                }
              }}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              {isLocked && <Ionicons name="lock-closed" size={10} color={COLORS.gold} style={{ marginRight: 4 }} />}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
              </Text>
              {cat !== 'overall' && !isLocked && (
                <View style={[styles.scoreDot, { backgroundColor: getScoreColor(scores[cat] || 50) }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Category Score */}
      {activeCategory !== 'overall' && !locked && (
        <View style={styles.categoryScore}>
          <Text style={styles.categoryScoreLabel}>
            {CATEGORY_INFO[activeCategory]?.label} Score
          </Text>
          <Text style={[styles.categoryScoreValue, { color: getScoreColor(scores[activeCategory]) }]}>
            {scores[activeCategory]}
          </Text>
          <Text style={styles.categoryDesc}>
            {CATEGORY_INFO[activeCategory]?.description}
          </Text>
        </View>
      )}

      {/* Tips List */}
      <ScrollView style={styles.tipsList} contentContainerStyle={styles.tipsContent}>
        {locked ? (
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={48} color={COLORS.gold} />
            <Text style={styles.lockedTitle}>PRO Feature</Text>
            <Text style={styles.lockedText}>
              Unlock tips for {CATEGORY_INFO[activeCategory]?.label} with Androgenic PRO
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              style={styles.unlockBtn}
            >
              <Text style={styles.unlockBtnText}>Unlock PRO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {tips.slice(0, pro ? tips.length : maxTips).map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                  <View style={styles.tipSource}>
                    <Ionicons name="globe-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.tipSourceText}>{tip.source}</Text>
                  </View>
                </View>
              </View>
            ))}

            {!pro && tips.length > maxTips && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Paywall')}
                style={styles.moreTipsCard}
              >
                <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
                <Text style={styles.moreTipsText}>
                  +{tips.length - maxTips} more tips with PRO
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  tabContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  categoryScore: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  categoryScoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryScoreValue: {
    fontSize: 40,
    fontWeight: '900',
  },
  categoryDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  tipsList: {
    flex: 1,
  },
  tipsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  tipSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipSourceText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  lockedTitle: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  lockedText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  unlockBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  unlockBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  moreTipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.goldDark,
    gap: 8,
  },
  moreTipsText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TipsScreen;
