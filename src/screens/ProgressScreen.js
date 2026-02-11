import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor } from '../utils/theme';
import { getProgressData } from '../utils/history';
import { CATEGORY_INFO } from '../utils/faceAnalysis';

const ProgressScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await getProgressData();
    setProgress(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!progress ? (
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Not Enough Data</Text>
            <Text style={styles.emptyText}>Complete at least 2 scans to see your progress</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.scanBtn}
            >
              <Text style={styles.scanBtnText}>Take a Scan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Scans</Text>
              <Text style={styles.summaryValue}>{progress.totalScans}</Text>
            </View>

            {/* Category Progress */}
            <Text style={styles.sectionTitle}>Category Trends</Text>
            {Object.entries(progress.trends)
              .filter(([key]) => key !== 'overall')
              .map(([key, data]) => {
                const info = CATEGORY_INFO[key];
                if (!info) return null;
                const changeColor = data.change > 0 ? COLORS.scoreHigh : data.change < 0 ? COLORS.scoreLow : COLORS.textMuted;
                const changeIcon = data.change > 0 ? 'arrow-up' : data.change < 0 ? 'arrow-down' : 'remove';
                return (
                  <View key={key} style={styles.trendCard}>
                    <View style={styles.trendHeader}>
                      <Ionicons name={info.icon} size={18} color={getScoreColor(data.current)} />
                      <Text style={styles.trendLabel}>{info.label}</Text>
                      <View style={styles.trendChange}>
                        <Ionicons name={changeIcon} size={14} color={changeColor} />
                        <Text style={[styles.trendChangeText, { color: changeColor }]}>
                          {data.change > 0 ? '+' : ''}{data.change}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.trendBar}>
                      <View style={styles.trendBarTrack}>
                        <View style={[styles.trendBarPrev, { width: `${data.previous}%` }]} />
                        <View style={[styles.trendBarCurrent, { width: `${data.current}%`, backgroundColor: getScoreColor(data.current) }]} />
                      </View>
                      <View style={styles.trendValues}>
                        <Text style={styles.trendPrevValue}>{data.previous}</Text>
                        <Text style={[styles.trendCurrentValue, { color: getScoreColor(data.current) }]}>{data.current}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

            {/* Overall Trend */}
            {progress.trends.overall && (
              <View style={[styles.trendCard, styles.overallCard]}>
                <View style={styles.trendHeader}>
                  <Ionicons name="star" size={18} color={COLORS.accent} />
                  <Text style={styles.trendLabel}>Overall</Text>
                  <View style={styles.trendChange}>
                    <Ionicons
                      name={progress.trends.overall.change > 0 ? 'arrow-up' : progress.trends.overall.change < 0 ? 'arrow-down' : 'remove'}
                      size={14}
                      color={progress.trends.overall.change > 0 ? COLORS.scoreHigh : progress.trends.overall.change < 0 ? COLORS.scoreLow : COLORS.textMuted}
                    />
                    <Text style={[styles.trendChangeText, {
                      color: progress.trends.overall.change > 0 ? COLORS.scoreHigh : progress.trends.overall.change < 0 ? COLORS.scoreLow : COLORS.textMuted
                    }]}>
                      {progress.trends.overall.change > 0 ? '+' : ''}{progress.trends.overall.change}
                    </Text>
                  </View>
                </View>
                <View style={styles.overallScores}>
                  <View style={styles.overallScoreItem}>
                    <Text style={styles.overallScoreLabel}>First Scan</Text>
                    <Text style={styles.overallScoreValue}>{progress.trends.overall.previous}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textMuted} />
                  <View style={styles.overallScoreItem}>
                    <Text style={styles.overallScoreLabel}>Latest</Text>
                    <Text style={[styles.overallScoreValue, { color: getScoreColor(progress.trends.overall.current) }]}>
                      {progress.trends.overall.current}
                    </Text>
                  </View>
                </View>
              </View>
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
  proBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  scanBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  trendCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overallCard: {
    borderColor: COLORS.accent,
    marginTop: 10,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  trendLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendChangeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendBar: {},
  trendBarTrack: {
    height: 6,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 4,
  },
  trendBarPrev: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  trendBarCurrent: {
    height: '100%',
    borderRadius: 3,
  },
  trendValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendPrevValue: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  trendCurrentValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  overallScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  overallScoreItem: {
    alignItems: 'center',
  },
  overallScoreLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  overallScoreValue: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
});

export default ProgressScreen;
