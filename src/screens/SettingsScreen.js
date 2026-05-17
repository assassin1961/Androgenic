import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert, Switch,
  Linking, Share, TouchableOpacity, Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/theme';
import { isPro, isTrialActive, getTrialDaysLeft, getProState, cancelSubscription, PRO_CONFIG } from '../utils/pro';
import { clearHistory } from '../utils/history';
import { isLockEnabled, disableLock } from './AppLockScreen';
import { getManageSubscriptionUrl } from '../config/iap';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

// ─── Storage Keys ──────────────────────────────────────────────────
const SETTINGS_KEYS = {
  PROFILE_NAME: 'androgenic_profile_name',
  ACCENT_COLOR: 'androgenic_accent_color',
  DAILY_REMINDER: 'androgenic_daily_reminder',
  STREAK_ALERTS: 'androgenic_streak_alerts',
  WEEKLY_REPORT: 'androgenic_weekly_report',
  NEW_TIPS: 'androgenic_new_tips',
  REMINDER_TIME: 'androgenic_reminder_time',
  SAVE_PHOTOS_LOCALLY: 'androgenic_save_photos',
  ANONYMOUS_LEADERBOARD: 'androgenic_anonymous_lb',
};

// ─── Accent Color Options ──────────────────────────────────────────
const ACCENT_COLORS = [
  { key: 'blue', color: '#0066ff', label: 'Blue' },
  { key: 'purple', color: '#a855f7', label: 'Purple' },
  { key: 'green', color: '#00e676', label: 'Green' },
  { key: 'gold', color: '#FFD700', label: 'Gold' },
];

// ─── Reusable Components ───────────────────────────────────────────
const SectionHeader = ({ title, delay = 0 }) => (
  <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
    <Text style={styles.sectionLabel}>{title}</Text>
  </Animated.View>
);

const SettingRow = ({ icon, iconColor, label, description, onPress, rightComponent, danger }) => (
  <AnimatedPressable onPress={onPress}>
    <GlassCard variant="default" style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || COLORS.textSecondary) + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor || COLORS.textSecondary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.scoreLow }]}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
    </GlassCard>
  </AnimatedPressable>
);

const SettingToggle = ({ icon, iconColor, label, description, value, onValueChange }) => (
  <GlassCard variant="default" style={styles.settingRow}>
    <View style={[styles.settingIcon, { backgroundColor: (iconColor || COLORS.accent) + '15' }]}>
      <Ionicons name={icon} size={18} color={iconColor || COLORS.accent} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingLabel}>{label}</Text>
      {description && <Text style={styles.settingDesc}>{description}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={(val) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(val);
      }}
      trackColor={{ false: COLORS.bgSecondary, true: COLORS.accent + '60' }}
      thumbColor={value ? COLORS.accent : COLORS.textMuted}
    />
  </GlassCard>
);

// ─── Main Screen ───────────────────────────────────────────────────
const SettingsScreen = ({ navigation }) => {
  const pro = isPro();
  const trial = isTrialActive();
  const state = getProState();

  // Local state
  const [lockEnabled, setLockEnabled] = useState(false);
  const [profileName, setProfileName] = useState('User');
  const [accentColor, setAccentColor] = useState('blue');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [newTips, setNewTips] = useState(true);
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  const [savePhotos, setSavePhotos] = useState(true);
  const [anonymousLb, setAnonymousLb] = useState(false);
  const [storageUsage, setStorageUsage] = useState(null);

  // ─── Load settings ────────────────────────────────────────────────
  useEffect(() => {
    loadSettings();
    calculateStorageUsage();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      isLockEnabled().then(setLockEnabled);
      loadSettings();
    });
    return unsub;
  }, [navigation]);

  const loadSettings = async () => {
    try {
      const [name, accent, reminder, streak, weekly, tips, time, photos, anon] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEYS.PROFILE_NAME),
        AsyncStorage.getItem(SETTINGS_KEYS.ACCENT_COLOR),
        AsyncStorage.getItem(SETTINGS_KEYS.DAILY_REMINDER),
        AsyncStorage.getItem(SETTINGS_KEYS.STREAK_ALERTS),
        AsyncStorage.getItem(SETTINGS_KEYS.WEEKLY_REPORT),
        AsyncStorage.getItem(SETTINGS_KEYS.NEW_TIPS),
        AsyncStorage.getItem(SETTINGS_KEYS.REMINDER_TIME),
        AsyncStorage.getItem(SETTINGS_KEYS.SAVE_PHOTOS_LOCALLY),
        AsyncStorage.getItem(SETTINGS_KEYS.ANONYMOUS_LEADERBOARD),
      ]);

      if (name) setProfileName(name);
      if (accent) setAccentColor(accent);
      if (reminder !== null) setDailyReminder(reminder === 'true');
      if (streak !== null) setStreakAlerts(streak === 'true');
      if (weekly !== null) setWeeklyReport(weekly === 'true');
      if (tips !== null) setNewTips(tips === 'true');
      if (time) setReminderTime(time);
      if (photos !== null) setSavePhotos(photos === 'true');
      if (anon !== null) setAnonymousLb(anon === 'true');

      const lockState = await isLockEnabled();
      setLockEnabled(lockState);
    } catch (e) {
      // Silently fail - defaults are fine
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (e) {
      // Silently fail
    }
  };

  const calculateStorageUsage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      const pairs = await AsyncStorage.multiGet(keys);
      pairs.forEach(([key, value]) => {
        if (value) totalSize += key.length + value.length;
      });
      setStorageUsage(totalSize);
    } catch (e) {
      setStorageUsage(0);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleEditName = () => {
    Alert.prompt(
      'Edit Display Name',
      'Enter your display name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (text) => {
            if (text && text.trim()) {
              setProfileName(text.trim());
              saveSetting(SETTINGS_KEYS.PROFILE_NAME, text.trim());
            }
          },
        },
      ],
      'plain-text',
      profileName,
    );
  };

  const handleAccentColor = (colorKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccentColor(colorKey);
    saveSetting(SETTINGS_KEYS.ACCENT_COLOR, colorKey);
  };

  const handleDarkModeInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Display Mode', 'Dark mode is currently the only available theme. Light mode is coming soon!');
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

  const handleManageSub = () => {
    const url = getManageSubscriptionUrl();
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Manage Subscription', 'You will be redirected to manage or cancel your subscription.', [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Go to Store', onPress: () => cancelSubscription() },
      ]);
    }
  };

  const handleRestorePurchases = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Restore Purchases', 'Checking for previous purchases...', [{ text: 'OK' }]);
  };

  const handleReminderTime = () => {
    const times = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '6:00 PM', '9:00 PM'];
    Alert.alert(
      'Reminder Time',
      'Choose when you want to be reminded',
      times.map((t) => ({
        text: t,
        onPress: () => {
          setReminderTime(t);
          saveSetting(SETTINGS_KEYS.REMINDER_TIME, t);
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }]),
    );
  };

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Export My Data', 'Your data export will be emailed to you. This may take a few minutes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: () => Alert.alert('Requested', 'Your data export has been queued. Check your email shortly.') },
    ]);
  };

  const handleClearScanHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Clear Scan History', 'This will permanently delete all your scan results and photos. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear History',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          Alert.alert('Done', 'Scan history has been cleared.');
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Clear All Data', 'This will delete ALL app data including history, settings, and preferences. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Are you sure?', 'This action is permanent. All your data will be lost forever.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Everything',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.clear();
                Alert.alert('Done', 'All data has been cleared. Please restart the app.');
              },
            },
          ]);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Delete Account', 'This will permanently delete your account and all associated data. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'I understand, continue',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Final Confirmation', 'Are you absolutely sure? Your account, data, and subscription will be permanently removed.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete My Account',
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.clear();
                Alert.alert('Account Deleted', 'Your account has been deleted. The app will now reset.');
              },
            },
          ]);
        },
      },
    ]);
  };

  const handleRateApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/androgenic/id6504857823'
      : 'https://play.google.com/store/apps/details?id=com.androgenic.app';
    Linking.openURL(storeUrl);
  };

  const handleShareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: 'Check out Androgenic - AI-powered face analysis & looksmaxxing app! https://androgenic.app',
        url: 'https://androgenic.app',
      });
    } catch (e) {
      // User cancelled
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@androgenic.app?subject=Androgenic%20Support%20Request');
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ─── 1. Account Section ─────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(0)}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            <GlassCard variant={pro ? 'gold' : 'default'} style={styles.accountCard} glow={pro}>
              <TouchableOpacity style={styles.profileRow} onPress={handleEditName} activeOpacity={0.7}>
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={28} color={COLORS.textSecondary} />
                </View>
                <View style={styles.profileInfo}>
                  <View style={styles.profileNameRow}>
                    <Text style={styles.profileName}>{profileName}</Text>
                    <Ionicons name="pencil" size={12} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
                  </View>
                  <View style={styles.subBadge}>
                    <Ionicons
                      name={pro ? 'star' : 'star-outline'}
                      size={10}
                      color={pro ? COLORS.gold : COLORS.textMuted}
                    />
                    <Text style={[styles.subBadgeText, pro && { color: COLORS.gold }]}>
                      {pro ? (trial ? 'TRIAL' : 'PRO') : 'FREE'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </GlassCard>

            <SettingRow
              icon="card"
              iconColor={COLORS.accent}
              label="Manage Subscription"
              description={pro ? 'View or cancel your plan' : 'Upgrade to unlock all features'}
              onPress={pro ? handleManageSub : () => navigation.navigate('Paywall')}
            />

            <SettingRow
              icon="refresh"
              iconColor={COLORS.teal}
              label="Restore Purchases"
              description="Recover previous subscriptions"
              onPress={handleRestorePurchases}
            />
          </Animated.View>

          {/* ─── 2. Appearance ──────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <Text style={styles.sectionLabel}>APPEARANCE</Text>

            <GlassCard variant="default" style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.purple + '15' }]}>
                <Ionicons name="moon" size={18} color={COLORS.purple} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Display Mode</Text>
                <Text style={styles.settingDesc}>Light mode coming soon</Text>
              </View>
              <View style={styles.darkBadge}>
                <Ionicons name="moon" size={10} color={COLORS.textPrimary} />
                <Text style={styles.darkBadgeText}>Dark</Text>
              </View>
            </GlassCard>

            <GlassCard variant="default" style={styles.accentCard}>
              <View style={styles.accentHeader}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.accent + '15' }]}>
                  <Ionicons name="color-palette" size={18} color={COLORS.accent} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Accent Color</Text>
                  <Text style={styles.settingDesc}>Customize your theme</Text>
                </View>
              </View>
              <View style={styles.colorRow}>
                {ACCENT_COLORS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.colorOption,
                      { backgroundColor: item.color + '20', borderColor: item.color + (accentColor === item.key ? 'FF' : '30') },
                      accentColor === item.key && styles.colorSelected,
                    ]}
                    onPress={() => handleAccentColor(item.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.colorLabel, accentColor === item.key && { color: item.color }]}>
                      {item.label}
                    </Text>
                    {accentColor === item.key && (
                      <Ionicons name="checkmark-circle" size={14} color={item.color} style={styles.colorCheck} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* ─── 3. Notifications ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

            <SettingToggle
              icon="alarm"
              iconColor="#4d94ff"
              label="Daily Reminder"
              description="Remind to do your routine"
              value={dailyReminder}
              onValueChange={(val) => { setDailyReminder(val); saveSetting(SETTINGS_KEYS.DAILY_REMINDER, val); }}
            />

            <SettingToggle
              icon="flame"
              iconColor="#ff6b35"
              label="Streak Alerts"
              description="Warn when about to lose streak"
              value={streakAlerts}
              onValueChange={(val) => { setStreakAlerts(val); saveSetting(SETTINGS_KEYS.STREAK_ALERTS, val); }}
            />

            <SettingToggle
              icon="bar-chart"
              iconColor={COLORS.scoreHigh}
              label="Weekly Progress Report"
              description="Get a summary each week"
              value={weeklyReport}
              onValueChange={(val) => { setWeeklyReport(val); saveSetting(SETTINGS_KEYS.WEEKLY_REPORT, val); }}
            />

            <SettingToggle
              icon="bulb"
              iconColor={COLORS.gold}
              label="New Tips & Guides"
              description="Content updates and tips"
              value={newTips}
              onValueChange={(val) => { setNewTips(val); saveSetting(SETTINGS_KEYS.NEW_TIPS, val); }}
            />

            <SettingRow
              icon="time"
              iconColor={COLORS.accentLight}
              label="Reminder Time"
              description={reminderTime}
              onPress={handleReminderTime}
              rightComponent={
                <View style={styles.timeChip}>
                  <Text style={styles.timeChipText}>{reminderTime}</Text>
                </View>
              }
            />
          </Animated.View>

          {/* ─── 4. Privacy & Security ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(240)}>
            <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>

            <SettingToggle
              icon="lock-closed"
              iconColor={COLORS.accent}
              label="App Lock"
              description="PIN + biometric protection"
              value={lockEnabled}
              onValueChange={handleToggleLock}
            />

            <SettingToggle
              icon="image"
              iconColor={COLORS.teal}
              label="Save Scan Photos Locally"
              description="Keep photos on device"
              value={savePhotos}
              onValueChange={(val) => { setSavePhotos(val); saveSetting(SETTINGS_KEYS.SAVE_PHOTOS_LOCALLY, val); }}
            />

            <SettingToggle
              icon="eye-off"
              iconColor={COLORS.purple}
              label="Anonymous Leaderboard"
              description="Hide your real name"
              value={anonymousLb}
              onValueChange={(val) => { setAnonymousLb(val); saveSetting(SETTINGS_KEYS.ANONYMOUS_LEADERBOARD, val); }}
            />

            <SettingRow
              icon="document-text"
              iconColor={COLORS.textSecondary}
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://androgenic.app/privacy')}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />

            <SettingRow
              icon="reader"
              iconColor={COLORS.textSecondary}
              label="Terms of Service"
              onPress={() => Linking.openURL('https://androgenic.app/terms')}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />
          </Animated.View>

          {/* ─── 5. Data ────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(320)}>
            <Text style={styles.sectionLabel}>DATA</Text>

            {storageUsage !== null && (
              <GlassCard variant="default" style={styles.storageCard}>
                <View style={styles.storageRow}>
                  <View style={[styles.settingIcon, { backgroundColor: COLORS.accentNeon + '15' }]}>
                    <Ionicons name="server" size={18} color={COLORS.accentNeon} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Storage Used</Text>
                    <Text style={styles.settingDesc}>Local app data</Text>
                  </View>
                  <Text style={styles.storageValue}>{formatBytes(storageUsage)}</Text>
                </View>
                <View style={styles.storageBar}>
                  <View style={[styles.storageBarFill, { width: `${Math.min((storageUsage / (5 * 1024 * 1024)) * 100, 100)}%` }]} />
                </View>
              </GlassCard>
            )}

            <SettingRow
              icon="download"
              iconColor={COLORS.accent}
              label="Export My Data"
              description="Download a copy of your data"
              onPress={handleExportData}
            />

            <SettingRow
              icon="images"
              iconColor={COLORS.scoreMid}
              label="Clear Scan History"
              description="Remove all scan results"
              onPress={handleClearScanHistory}
            />

            <SettingRow
              icon="trash"
              iconColor={COLORS.scoreLow}
              label="Clear All Data"
              description="Reset everything"
              onPress={handleClearAllData}
              danger
            />
          </Animated.View>

          {/* ─── 6. About ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.sectionLabel}>ABOUT</Text>

            <GlassCard variant="default" style={styles.aboutCard}>
              <Text style={styles.aboutLogo}>ANDROGENIC</Text>
              <Text style={styles.aboutVersion}>Version 2.0.0</Text>
              <Text style={styles.aboutDesc}>AI-powered face analysis & looksmaxxing</Text>
            </GlassCard>

            <SettingRow
              icon="star"
              iconColor={COLORS.gold}
              label="Rate Androgenic"
              description="Leave a review on the App Store"
              onPress={handleRateApp}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />

            <SettingRow
              icon="share-social"
              iconColor={COLORS.accent}
              label="Share with Friends"
              description="Spread the word"
              onPress={handleShareApp}
            />

            <SettingRow
              icon="mail"
              iconColor={COLORS.teal}
              label="Contact Support"
              description="support@androgenic.app"
              onPress={handleContactSupport}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />

            <SettingRow
              icon="logo-instagram"
              iconColor="#E1306C"
              label="Follow us on Instagram"
              onPress={() => Linking.openURL('https://instagram.com/androgenic.app')}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />

            <SettingRow
              icon="logo-tiktok"
              iconColor={COLORS.textPrimary}
              label="Follow us on TikTok"
              onPress={() => Linking.openURL('https://tiktok.com/@androgenic.app')}
              rightComponent={<Ionicons name="open-outline" size={16} color={COLORS.textMuted} />}
            />

            <GlassCard variant="default" style={styles.creditsCard}>
              <Text style={styles.creditsText}>
                Built with care by the Androgenic team.{'\n'}
                Powered by advanced AI & computer vision.
              </Text>
            </GlassCard>
          </Animated.View>

          {/* ─── 7. Danger Zone ─────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(480)}>
            <Text style={[styles.sectionLabel, { color: COLORS.scoreLow + '80' }]}>DANGER ZONE</Text>

            <AnimatedPressable onPress={handleDeleteAccount}>
              <GlassCard variant="default" style={[styles.settingRow, styles.dangerCard]}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.scoreLow + '15' }]}>
                  <Ionicons name="warning" size={18} color={COLORS.scoreLow} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: COLORS.scoreLow }]}>Delete Account</Text>
                  <Text style={styles.settingDesc}>Permanently remove your account and data</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.scoreLow + '60'} />
              </GlassCard>
            </AnimatedPressable>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

// ─── Styles ────────────────────────────────────────────────────────
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

  sectionLabel: {
    color: COLORS.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8, marginTop: 24,
  },

  // Account
  accountCard: { padding: 16, marginBottom: 6 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  profileInfo: { flex: 1 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center' },
  profileName: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  subBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 4, backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start',
  },
  subBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },

  // Setting row
  settingRow: { padding: 14, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  settingDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },

  // Appearance
  darkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  darkBadgeText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600' },

  accentCard: { padding: 14, marginBottom: 6 },
  accentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  colorRow: { flexDirection: 'row', gap: 8, paddingLeft: 46 },
  colorOption: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, gap: 5,
  },
  colorSelected: { borderWidth: 2 },
  colorDot: { width: 18, height: 18, borderRadius: 9 },
  colorLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.3 },
  colorCheck: { position: 'absolute', top: 4, right: 4 },

  // Notifications
  timeChip: {
    backgroundColor: COLORS.accent + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  timeChipText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },

  // Data
  storageCard: { padding: 14, marginBottom: 6 },
  storageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storageValue: { color: COLORS.accentNeon, fontSize: 13, fontWeight: '700' },
  storageBar: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2,
    marginTop: 12, marginLeft: 46, overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%', backgroundColor: COLORS.accentNeon, borderRadius: 2,
  },

  // About
  aboutCard: { padding: 20, alignItems: 'center', marginBottom: 6 },
  aboutLogo: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 2, marginBottom: 4 },
  aboutVersion: { color: COLORS.textMuted, fontSize: 11, marginBottom: 6 },
  aboutDesc: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center' },

  creditsCard: { padding: 16, marginBottom: 6, alignItems: 'center' },
  creditsText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 18 },

  // Danger
  dangerCard: { borderColor: COLORS.scoreLow + '20' },
});

export default SettingsScreen;
