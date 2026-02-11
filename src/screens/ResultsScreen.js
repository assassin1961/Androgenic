import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, getScoreColor, getScoreLabel } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { isPro, canAccessCategory, getCelebrityMatch, computeFacialRatios, getMaxTipsForCategory } from '../utils/pro';
import { getTipsForCategory, getOverallTips } from '../data/tips';
import ScoreCard from '../components/ScoreCard';
import ScoreRing from '../components/ScoreRing';

const ResultsScreen = ({ route, navigation }) => {
  const { scores, imageUri } = route.params;
  const pro = isPro();
  const celebrity = pro ? getCelebrityMatch(scores) : null;
  const ratios = pro ? computeFacialRatios(scores) : null;
  const overallColor = getScoreColor(scores.overall);

  const categories = ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Share', { scores })} style={styles.tipsBtn}>
              <Ionicons name="share-social-outline" size={20} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tips', { scores })} style={styles.tipsBtn}>
              <Ionicons name="bulb-outline" size={22} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.overallSection}>
          <View style={styles.overallRingRow}>
            <Image source={{ uri: imageUri }} style={styles.resultPhoto} />
            <ScoreRing score={scores.overall} size={130} strokeWidth={10} label={`${scores.overallRating}/10`} delay={200} />
          </View>
          <Text style={styles.overallDescription}>
            {scores.overallRating >= 8 ? "You're in the top tier. Elite facial aesthetics." :
             scores.overallRating >= 6 ? "Above average. Strong features with room to optimize." :
             scores.overallRating >= 4 ? "Average range. Good foundation with improvement potential." :
             "Below average. Significant looksmaxxing potential ahead."}
          </Text>
        </View>

        {/* Celebrity Match (PRO) */}
        {pro && celebrity && (
          <View style={styles.celebrityCard}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.celebrityGradient}>
              <Text style={styles.celebrityEmoji}>{celebrity.image}</Text>
              <View style={styles.celebrityInfo}>
                <Text style={styles.celebrityLabel}>Celebrity Match</Text>
                <Text style={styles.celebrityName}>{celebrity.name}</Text>
                <Text style={styles.celebrityMatch}>{celebrity.matchPercent}% Match</Text>
              </View>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Non-pro celebrity teaser */}
        {!pro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <View style={styles.celebrityTeaser}>
              <Ionicons name="star" size={20} color={COLORS.gold} />
              <Text style={styles.teaserText}>See your celebrity look-alike match</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Score Cards Grid */}
        <Text style={styles.sectionTitle}>Category Scores</Text>
        <View style={styles.scoreGrid}>
          {categories.map((cat) => {
            const info = CATEGORY_INFO[cat];
            const locked = !canAccessCategory(cat);
            return (
              <ScoreCard
                key={cat}
                category={cat}
                label={info.label}
                score={scores[cat]}
                icon={info.icon}
                locked={locked}
                onPress={() => {
                  if (locked) {
                    navigation.navigate('Paywall');
                  } else {
                    navigation.navigate('Tips', { scores, focusCategory: cat });
                  }
                }}
              />
            );
          })}
        </View>

        {/* Facial Ratios (PRO) */}
        {pro && ratios && (
          <View style={styles.ratiosSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Facial Ratios</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            {ratios.map((ratio, i) => (
              <View key={i} style={styles.ratioRow}>
                <View style={styles.ratioLeft}>
                  <Text style={styles.ratioName}>{ratio.name}</Text>
                  <Text style={styles.ratioIdeal}>Ideal: {ratio.ideal}</Text>
                </View>
                <View style={styles.ratioRight}>
                  <Text style={styles.ratioValue}>{ratio.value}</Text>
                  <Text style={[styles.ratioRating, {
                    color: ratio.rating === 'Excellent' || ratio.rating === 'Good' || ratio.rating === 'High' || ratio.rating === 'Ideal' || ratio.rating === 'Strong' || ratio.rating === 'Wide' || ratio.rating === 'Positive'
                      ? COLORS.scoreHigh : COLORS.scoreMid
                  }]}>{ratio.rating}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsPreview}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tips', { scores })}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {getOverallTips(scores.overall).slice(0, 2).map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Ionicons name="bulb" size={18} color={COLORS.accent} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText} numberOfLines={2}>{tip.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {pro && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Progress')}
              >
                <Ionicons name="trending-up" size={20} color={COLORS.accent} />
                <Text style={styles.actionBtnText}>Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Plan', { scores })}
              >
                <Ionicons name="clipboard-outline" size={20} color={COLORS.accent} />
                <Text style={styles.actionBtnText}>Plan</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Compare')}
          >
            <Ionicons name="git-compare-outline" size={20} color={COLORS.accent} />
            <Text style={styles.actionBtnText}>Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="refresh" size={20} color={COLORS.accent} />
            <Text style={styles.actionBtnText}>New Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Pro Upsell */}
        {!pro && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.accent} style={styles.upsellCard}>
              <Ionicons name="lock-open" size={24} color="#fff" />
              <Text style={styles.upsellTitle}>Unlock Full Analysis</Text>
              <Text style={styles.upsellText}>
                Get all 7 categories, celebrity matching, facial ratios, progress tracking & more
              </Text>
              <View style={styles.upsellBtn}>
                <Text style={styles.upsellBtnText}>Start Free Trial</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerRight: {
    flexDirection: 'row',
    gap: 6,
  },
  tipsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  overallRingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  resultPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  overallDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  celebrityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  celebrityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  celebrityEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  celebrityName: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  celebrityMatch: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  celebrityTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.goldDark,
    gap: 10,
  },
  teaserText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  proBadgeSm: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ratiosSection: {
    marginBottom: 20,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  ratioLeft: {},
  ratioName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  ratioIdeal: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  ratioRight: {
    alignItems: 'flex-end',
  },
  ratioValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  ratioRating: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tipsPreview: {
    marginBottom: 20,
  },
  seeAllLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  upsellCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  upsellTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 8,
  },
  upsellText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  upsellBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  upsellBtnText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ResultsScreen;
