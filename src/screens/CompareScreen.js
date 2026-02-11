import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor } from '../utils/theme';
import { CATEGORY_INFO } from '../utils/faceAnalysis';
import { getHistory } from '../utils/history';

const CompareScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([null, null]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
    if (data.length >= 2) {
      setSelected([data[data.length - 1], data[0]]); // oldest vs newest
    }
  };

  const selectEntry = (index, entry) => {
    const updated = [...selected];
    updated[index] = entry;
    setSelected(updated);
  };

  const [entry1, entry2] = selected;
  const categories = ['overall', 'masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'];

  if (history.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="git-compare-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Need More Scans</Text>
          <Text style={styles.emptyText}>Complete at least 2 scans to compare results side by side</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>Take a Scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo Selectors */}
        <View style={styles.photoRow}>
          {[0, 1].map((idx) => {
            const entry = selected[idx];
            return (
              <View key={idx} style={styles.photoSelector}>
                <Text style={styles.photoLabel}>{idx === 0 ? 'Before' : 'After'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {history.map((h) => {
                    const isSelected = entry?.id === h.id;
                    return (
                      <TouchableOpacity
                        key={h.id}
                        onPress={() => selectEntry(idx, h)}
                        style={[styles.photoThumb, isSelected && styles.photoThumbSelected]}
                      >
                        <Image source={{ uri: h.imageUri }} style={styles.thumbImg} />
                        {isSelected && (
                          <View style={styles.thumbCheck}>
                            <Ionicons name="checkmark" size={10} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {entry && (
                  <Text style={styles.photoDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Comparison */}
        {entry1 && entry2 && (
          <>
            <View style={styles.vsRow}>
              <View style={styles.vsPhotoContainer}>
                <Image source={{ uri: entry1.imageUri }} style={styles.vsPhoto} />
                <Text style={[styles.vsScore, { color: getScoreColor(entry1.scores.overall) }]}>
                  {entry1.scores.overallRating}/10
                </Text>
              </View>
              <View style={styles.vsIcon}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.vsPhotoContainer}>
                <Image source={{ uri: entry2.imageUri }} style={styles.vsPhoto} />
                <Text style={[styles.vsScore, { color: getScoreColor(entry2.scores.overall) }]}>
                  {entry2.scores.overallRating}/10
                </Text>
              </View>
            </View>

            {/* Category Comparison Bars */}
            <Text style={styles.sectionTitle}>Score Comparison</Text>
            {categories.map((cat) => {
              const s1 = entry1.scores[cat] || 0;
              const s2 = entry2.scores[cat] || 0;
              const diff = s2 - s1;
              const label = cat === 'overall' ? 'Overall' : CATEGORY_INFO[cat]?.label || cat;
              return (
                <View key={cat} style={styles.compareRow}>
                  <Text style={styles.compareCat}>{label}</Text>
                  <View style={styles.compareValues}>
                    <Text style={[styles.compareVal, { color: getScoreColor(s1) }]}>{s1}</Text>
                    <View style={styles.compareBarContainer}>
                      <View style={styles.compareBarBg}>
                        <View style={[styles.compareBar1, { width: `${s1}%`, backgroundColor: getScoreColor(s1) + '60' }]} />
                      </View>
                      <View style={[styles.compareBarBg, { marginTop: 3 }]}>
                        <View style={[styles.compareBar2, { width: `${s2}%`, backgroundColor: getScoreColor(s2) }]} />
                      </View>
                    </View>
                    <Text style={[styles.compareVal, { color: getScoreColor(s2) }]}>{s2}</Text>
                  </View>
                  <View style={styles.compareDiff}>
                    <Ionicons
                      name={diff > 0 ? 'arrow-up' : diff < 0 ? 'arrow-down' : 'remove'}
                      size={12}
                      color={diff > 0 ? COLORS.scoreHigh : diff < 0 ? COLORS.scoreLow : COLORS.textMuted}
                    />
                    <Text style={[styles.compareDiffText, {
                      color: diff > 0 ? COLORS.scoreHigh : diff < 0 ? COLORS.scoreLow : COLORS.textMuted,
                    }]}>
                      {diff > 0 ? '+' : ''}{diff}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
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
  scroll: {
    paddingHorizontal: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoSelector: {
    flex: 1,
  },
  photoLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  photoScroll: {
    maxHeight: 52,
  },
  photoThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  photoThumbSelected: {
    borderColor: COLORS.accent,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  vsPhotoContainer: {
    alignItems: 'center',
  },
  vsPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  vsScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  vsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vsText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  compareRow: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compareCat: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  compareValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareVal: {
    fontSize: 14,
    fontWeight: '800',
    width: 28,
    textAlign: 'center',
  },
  compareBarContainer: {
    flex: 1,
  },
  compareBarBg: {
    height: 4,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compareBar1: {
    height: '100%',
    borderRadius: 2,
  },
  compareBar2: {
    height: '100%',
    borderRadius: 2,
  },
  compareDiff: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  compareDiffText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CompareScreen;
