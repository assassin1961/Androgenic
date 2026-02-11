import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isPro, isTrialActive, getTrialDaysLeft, getScansRemaining } from '../utils/pro';

const ProBanner = ({ onUpgrade }) => {
  if (isPro() && !isTrialActive()) return null;

  if (isTrialActive()) {
    const daysLeft = getTrialDaysLeft();
    return (
      <TouchableOpacity onPress={onUpgrade} activeOpacity={0.8}>
        <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trialBanner}>
          <Ionicons name="time-outline" size={16} color="#000" />
          <Text style={styles.trialText}>
            Trial: {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </Text>
          <Text style={styles.upgradeLink}>Upgrade</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const scansLeft = getScansRemaining();
  return (
    <View>
      <TouchableOpacity onPress={onUpgrade} activeOpacity={0.8}>
        <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
          <Ionicons name="star" size={16} color="#fff" />
          <Text style={styles.bannerText}>Unlock All Features</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <View style={styles.scansCounter}>
        <Text style={styles.scansText}>
          {scansLeft} scan{scansLeft !== 1 ? 's' : ''} remaining today
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  trialText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  upgradeLink: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  scansCounter: {
    alignItems: 'center',
    marginBottom: 4,
  },
  scansText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});

export default ProBanner;
