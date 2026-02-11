import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor } from '../utils/theme';
import { getHistory, clearHistory } from '../utils/history';
import { isPro, PRO_CONFIG } from '../utils/pro';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = () => {
    Alert.alert('Clear History', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  };

  const pro = isPro();
  const displayHistory = pro ? history : history.slice(0, PRO_CONFIG.freeHistoryLimit);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.scoreLow} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {displayHistory.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>Your scan results will appear here</Text>
          </View>
        ) : (
          displayHistory.map((entry, i) => {
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.historyCard}
                onPress={() => navigation.navigate('Results', { scores: entry.scores, imageUri: entry.imageUri })}
              >
                <Image source={{ uri: entry.imageUri }} style={styles.historyPhoto} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>{dateStr} at {timeStr}</Text>
                  <View style={styles.historyScores}>
                    <Text style={[styles.historyOverall, { color: getScoreColor(entry.scores.overall) }]}>
                      {entry.scores.overallRating}/10
                    </Text>
                    <Text style={styles.historyOverallLabel}>Overall</Text>
                  </View>
                  <View style={styles.miniScores}>
                    {['masculinity', 'jawline', 'eyes'].map((cat) => (
                      <View key={cat} style={styles.miniScore}>
                        <View style={[styles.miniDot, { backgroundColor: getScoreColor(entry.scores[cat]) }]} />
                        <Text style={styles.miniLabel}>{cat.slice(0, 3).toUpperCase()}</Text>
                        <Text style={[styles.miniValue, { color: getScoreColor(entry.scores[cat]) }]}>
                          {entry.scores[cat]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })
        )}

        {!pro && history.length > PRO_CONFIG.freeHistoryLimit && (
          <TouchableOpacity
            style={styles.proCard}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
            <Text style={styles.proCardText}>
              +{history.length - PRO_CONFIG.freeHistoryLimit} more entries with PRO
            </Text>
          </TouchableOpacity>
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
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  historyScores: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  historyOverall: {
    fontSize: 20,
    fontWeight: '800',
  },
  historyOverallLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  miniScores: {
    flexDirection: 'row',
    gap: 10,
  },
  miniScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  miniValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  proCard: {
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
  proCardText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HistoryScreen;
