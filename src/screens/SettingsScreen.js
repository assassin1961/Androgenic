import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert, Switch, Linking,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isPro, isTrialActive, getTrialDaysLeft, getProState, cancelSubscription, PRO_CONFIG } from '../utils/pro';
import { clearHistory } from '../utils/history';
import { isLockEnabled, disableLock } from './AppLockScreen';
import { getManageSubscriptionUrl } from '../config/iap';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';

const MenuItem = ({ icon, label, color, onPress, rightIcon, rightColor, badge }) => (
  <AnimatedPressable onPress={onPress}>
    <GlassCard variant="default" style={styles.menuItem}>
      <View style={[styles.menuIcon, { backgroundColor: (color || COLORS.textSecondary) + '15' }]}>
        <Ionicons name={icon} size={18} color={color || COLORS.textSecondary} />
      </View>
      <Text style={[styles.menuText, rightColor && { color: rightColor }]}>{label}</Text>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      )}
      <Ionicons name={rightIcon || 'chevron-forward'} size={16} color={COLORS.textMuted} />
    </GlassCard>
  </AnimatedPressable>
);

const SettingsScreen = ({ navigation }) => {
  const pro = isPro();
  const trial = isTrialActive();
  const state = getProState();
  const [lockEnabled, setLockEnabled] = useState(false);

  useEffect(() => { isLockEnabled().then(setLockEnabled); }, []);
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => isLockEnabled().then(setLockEnabled));
    return unsub;
  }, [navigation]);

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Clear All Data', 'This will delete your history and reset all settings. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearHistory(); Alert.alert('Done', 'All data has been cleared.'); } },
    ]);
  };

  const handleManageSub = () => {
    Alert.alert('Manage Subscription', 'You will be redirected to Google Play to manage or cancel your subscription.', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Go to Play Store', onPress: () => cancelSubscription() },
    ]);
  };

  const handleToggleLock = async (val) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (val) {
      navigation.navigate('AppLock', { isSetup: true });
    } else {
      Alert.alert('Disable App Lock', 'Remove PIN protection?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disable', style: 'destructive', onPress: async () => { await disableLock(); setLockEnabled(false); } },
      ]);
    }
  };

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Subscription */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
            <GlassCard variant={pro ? 'gold' : 'default'} style={styles.subCard} glow={pro}>
              <View style={styles.statusRow}>
                <View style={[styles.statusIcon, { backgroundColor: (pro ? COLORS.gold : COLORS.textMuted) + '15' }]}>
                  <Ionicons name={pro ? 'star' : 'star-outline'} size={22} color={pro ? COLORS.gold : COLORS.textMuted} />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>{pro ? (trial ? 'Free Trial' : 'PRO Active') : 'Free Plan'}</Text>
                  <Text style={styles.statusDetail}>
                    {trial ? `${getTrialDaysLeft()} days remaining`
                      : pro ? `${state.plan ? state.plan.charAt(0).toUpperCase() + state.plan.slice(1) : ''} plan`
                      : `${PRO_CONFIG.freeScansPerDay} scans/day`}
                  </Text>
                </View>
              </View>
              {!pro && (
                <GlassButton title="Upgrade to PRO" icon="diamond" onPress={() => navigation.navigate('Paywall')} variant="gold" style={{ marginTop: 10 }} />
              )}
              {pro && !trial && (
                <GlassButton title="Manage Subscription" onPress={handleManageSub} variant="ghost" size="sm" style={{ marginTop: 10 }} />
              )}
            </GlassCard>
          </Animated.View>

          {/* Security */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <Text style={styles.sectionLabel}>SECURITY</Text>
            <GlassCard variant="default" style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.accent + '15' }]}>
                  <Ionicons name="lock-closed" size={16} color={COLORS.accent} />
                </View>
                <View style={styles.toggleInfo}>
                  <Text style={styles.menuText}>App Lock</Text>
                  <Text style={styles.toggleDesc}>PIN + biometric protection</Text>
                </View>
                <Switch
                  value={lockEnabled}
                  onValueChange={handleToggleLock}
                  trackColor={{ false: COLORS.bgSecondary, true: COLORS.accent + '60' }}
                  thumbColor={lockEnabled ? COLORS.accent : COLORS.textMuted}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* New Features */}
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <Text style={styles.sectionLabel}>NEW FEATURES</Text>
            <MenuItem icon="flask" label="Skincare Analyzer" color={COLORS.purple} onPress={() => navigation.navigate('SkincareAnalyzer')} badge={{ text: 'NEW', color: COLORS.purple }} />
            <MenuItem icon="scan" label="Face Symmetry Tool" color={COLORS.accentNeon} onPress={() => navigation.navigate('FaceSymmetry')} badge={{ text: 'NEW', color: COLORS.accentNeon }} />
            <MenuItem icon="nutrition" label="Meal Plans" color={COLORS.scoreHigh} onPress={() => navigation.navigate('MealPlan')} badge={{ text: 'NEW', color: COLORS.scoreHigh }} />
            <MenuItem icon="moon" label="Sleep Tracker" color="#4d94ff" onPress={() => navigation.navigate('SleepTracker')} badge={{ text: 'NEW', color: '#4d94ff' }} />
            <MenuItem icon="share-social" label="Share Cards" color={COLORS.accent} onPress={() => navigation.navigate('ShareTemplates')} badge={{ text: 'NEW', color: COLORS.accent }} />
            <MenuItem icon="gift" label="Refer Friends" color={COLORS.gold} onPress={() => navigation.navigate('Referral')} badge={{ text: 'NEW', color: COLORS.gold }} />
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.duration(400).delay(240)}>
            <Text style={styles.sectionLabel}>FEATURES</Text>
            <MenuItem icon="time" label="History" color="#4d94ff" onPress={() => navigation.navigate('History')} />
            {pro && <MenuItem icon="trending-up" label="Progress" color={COLORS.scoreHigh} onPress={() => navigation.navigate('Progress')} />}
            <MenuItem icon="git-branch" label="Progress Timeline" color={COLORS.accent} onPress={() => navigation.navigate('ProgressTimeline')} />
            <MenuItem icon="flame" label="Streaks & Stats" color="#ff6b35" onPress={() => navigation.navigate('StreakCalendar')} />
            <MenuItem icon="barbell" label="Workouts" color="#ff5252" onPress={() => navigation.navigate('Workout')} />
            <MenuItem icon="water" label="Water Tracker" color="#00b4d8" onPress={() => navigation.navigate('WaterTracker')} />
            <MenuItem icon="flame" label="30-Day Challenge" color="#ff6b35" onPress={() => navigation.navigate('Challenge')} />
            <MenuItem icon="book" label="Guides & Tutorials" color="#1de9b6" onPress={() => navigation.navigate('Guides')} />
          </Animated.View>

          {/* Data & Privacy */}
          <Animated.View entering={FadeInDown.duration(400).delay(320)}>
            <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
            <MenuItem icon="shield-checkmark" label="Privacy & Data Management" color={COLORS.accent} onPress={() => navigation.navigate('Privacy')} />
            <MenuItem icon="trash" label="Clear All Data" color={COLORS.scoreLow} rightColor={COLORS.scoreLow} onPress={handleClearData} />
          </Animated.View>

          {/* Legal */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.sectionLabel}>LEGAL</Text>
            <MenuItem icon="document-text" label="Privacy Policy" onPress={() => Linking.openURL('https://androgenic.app/privacy')} rightIcon="open-outline" />
            <MenuItem icon="reader" label="Terms of Service" onPress={() => Linking.openURL('https://androgenic.app/terms')} rightIcon="open-outline" />
            <MenuItem
              icon="card"
              label={isPro() ? 'Manage Subscription' : 'Upgrade to PRO'}
              onPress={() => isPro() ? Linking.openURL(getManageSubscriptionUrl()) : navigation.navigate('Paywall')}
              rightIcon={isPro() ? 'open-outline' : 'chevron-forward'}
            />
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.duration(400).delay(480)}>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <GlassCard variant="default" style={styles.aboutCard}>
              <Text style={styles.aboutLogo}>ANDROGENIC</Text>
              <Text style={styles.aboutVersion}>Version 1.1.0</Text>
              <Text style={styles.aboutDesc}>AI-powered face analysis & looksmaxxing</Text>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 20 },

  subCard: { padding: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusInfo: { flex: 1 },
  statusTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  statusDetail: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },

  toggleCard: { padding: 14, marginBottom: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleInfo: { flex: 1 },
  toggleDesc: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },

  menuItem: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginRight: 4 },
  badgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },

  aboutCard: { padding: 20, alignItems: 'center' },
  aboutLogo: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 2, marginBottom: 4 },
  aboutVersion: { color: COLORS.textMuted, fontSize: 11, marginBottom: 6 },
  aboutDesc: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center' },
});

export default SettingsScreen;
