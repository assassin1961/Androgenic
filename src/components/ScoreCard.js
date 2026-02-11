import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor, getScoreLabel } from '../utils/theme';

const ScoreCard = ({ category, label, score, icon, locked, onPress }) => {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.locked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {locked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={24} color={COLORS.gold} />
          <Text style={styles.proText}>PRO</Text>
        </View>
      )}
      <View style={[styles.content, locked && styles.blurred]}>
        <View style={styles.header}>
          <Ionicons name={icon} size={20} color={locked ? COLORS.textMuted : color} />
          <Text style={[styles.label, locked && styles.mutedText]}>{label}</Text>
        </View>
        <Text style={[styles.score, { color: locked ? COLORS.textMuted : color }]}>
          {locked ? '??' : score}
        </Text>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: locked ? '50%' : `${score}%`,
                backgroundColor: locked ? COLORS.textMuted : color,
              },
            ]}
          />
        </View>
        <Text style={[styles.levelLabel, { color: locked ? COLORS.textMuted : color }]}>
          {locked ? 'Locked' : scoreLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  locked: {
    borderColor: COLORS.goldDark,
    opacity: 0.85,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  proText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  content: {
    zIndex: 1,
  },
  blurred: {
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  mutedText: {
    color: COLORS.textMuted,
  },
  score: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  barContainer: {
    height: 4,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ScoreCard;
