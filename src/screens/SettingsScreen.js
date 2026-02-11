import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { isPro, isTrialActive, getTrialDaysLeft, getProState, cancelSubscription, PRO_CONFIG } from '../utils/pro';
import { clearHistory } from '../utils/history';

const SettingsScreen = ({ navigation }) => {
  const pro = isPro();
  const trial = isTrialActive();
  const state = getProState();

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will delete your history and reset all settings. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          Alert.alert('Done', 'All data has been cleared.');
        },
      },
    ]);
  };

  const handleCancelSub = () => {
    Alert.alert('Cancel Subscription', 'Are you sure you want to cancel PRO?', [
      { text: 'Keep PRO', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: async () => {
          await cancelSubscription();
          Alert.alert('Cancelled', 'Your PRO subscription has been cancelled.');
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Ionicons name={pro ? 'star' : 'star-outline'} size={24} color={pro ? COLORS.gold : COLORS.textMuted} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {pro ? (trial ? 'Free Trial' : 'PRO Active') : 'Free Plan'}
                </Text>
                <Text style={styles.statusDetail}>
                  {trial
                    ? `${getTrialDaysLeft()} days remaining`
                    : pro
                    ? `${state.plan ? state.plan.charAt(0).toUpperCase() + state.plan.slice(1) : ''} plan`
                    : `${PRO_CONFIG.freeScansPerDay} scans/day • 3 categories`}
                </Text>
              </View>
            </View>
            {!pro && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Paywall')}
                style={styles.upgradeBtn}
              >
                <Text style={styles.upgradeBtnText}>Upgrade to PRO</Text>
              </TouchableOpacity>
            )}
            {pro && !trial && (
              <TouchableOpacity onPress={handleCancelSub} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FEATURES</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>History</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          {pro && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Progress')}
              >
                <Ionicons name="trending-up" size={20} color={COLORS.textSecondary} />
                <Text style={styles.menuText}>Progress</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={20} color={COLORS.scoreLow} />
            <Text style={[styles.menuText, { color: COLORS.scoreLow }]}>Clear All Data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutLogo}>ANDROGENIC</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDesc}>AI-powered face analysis and looksmaxxing guide</Text>
          </View>
        </View>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  statusDetail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.scoreLow,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.scoreLow,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  aboutVersion: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  aboutDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default SettingsScreen;
