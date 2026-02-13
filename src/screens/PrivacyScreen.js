import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from '../utils/theme';
import { clearHistory, getHistory } from '../utils/history';

const ANALYTICS_KEY = 'androgenic_analytics_enabled';
const CRASH_KEY = 'androgenic_crash_enabled';

const PrivacyScreen = ({ navigation }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashEnabled, setCrashEnabled] = useState(true);
  const [dataSize, setDataSize] = useState({ scans: 0, storage: '0 KB' });

  useEffect(() => {
    loadSettings();
    calculateDataSize();
  }, []);

  const loadSettings = async () => {
    try {
      const a = await AsyncStorage.getItem(ANALYTICS_KEY);
      const c = await AsyncStorage.getItem(CRASH_KEY);
      if (a !== null) setAnalyticsEnabled(a === 'true');
      if (c !== null) setCrashEnabled(c === 'true');
    } catch {}
  };

  const calculateDataSize = async () => {
    try {
      const history = await getHistory();
      const keys = await AsyncStorage.getAllKeys();
      const androKeys = keys.filter(k => k.startsWith('androgenic'));
      let totalSize = 0;
      for (const key of androKeys) {
        const val = await AsyncStorage.getItem(key);
        if (val) totalSize += val.length * 2; // rough byte estimate
      }
      const sizeStr = totalSize > 1048576
        ? `${(totalSize / 1048576).toFixed(1)} MB`
        : totalSize > 1024
        ? `${(totalSize / 1024).toFixed(0)} KB`
        : `${totalSize} B`;
      setDataSize({ scans: history.length, storage: sizeStr });
    } catch {
      setDataSize({ scans: 0, storage: '0 KB' });
    }
  };

  const toggleAnalytics = async (val) => {
    setAnalyticsEnabled(val);
    await AsyncStorage.setItem(ANALYTICS_KEY, String(val));
  };

  const toggleCrash = async (val) => {
    setCrashEnabled(val);
    await AsyncStorage.setItem(CRASH_KEY, String(val));
  };

  const handleExportData = async () => {
    try {
      const history = await getHistory();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalScans: history.length,
        scans: history.map(h => ({
          date: h.date,
          scores: h.scores,
        })),
      };
      Alert.alert(
        'Data Export',
        `Your data contains ${history.length} scan(s).\n\nExport data has been prepared. In a production app, this would be saved as a JSON file or shared.`,
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Could not export data.');
    }
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      'Delete Scan History',
      'This will permanently delete all your scan results. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            await calculateDataSize();
            Alert.alert('Deleted', 'All scan history has been removed.');
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete ALL App Data',
      'This will delete everything: history, settings, workout progress, routines, challenges, and all preferences. This CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const androKeys = keys.filter(k => k.startsWith('androgenic'));
              await AsyncStorage.multiRemove(androKeys);
              // Clear SecureStore items
              try {
                await SecureStore.deleteItemAsync('androgenic_pin');
                await SecureStore.deleteItemAsync('androgenic_lock_enabled');
                await SecureStore.deleteItemAsync('androgenic_enc_key');
              } catch {}
              await calculateDataSize();
              Alert.alert('Complete', 'All app data has been permanently deleted.');
            } catch {
              Alert.alert('Error', 'Could not delete all data.');
            }
          },
        },
      ]
    );
  };

  const handleRevokePermissions = () => {
    Alert.alert(
      'Revoke Permissions',
      'To revoke camera and photo library permissions, go to your device Settings > Privacy > Androgenic.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Data Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR DATA</Text>
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Ionicons name="scan-outline" size={20} color={COLORS.accent} />
                <Text style={styles.dataValue}>{dataSize.scans}</Text>
                <Text style={styles.dataLabel}>Scans</Text>
              </View>
              <View style={styles.dataDivider} />
              <View style={styles.dataItem}>
                <Ionicons name="server-outline" size={20} color={COLORS.accent} />
                <Text style={styles.dataValue}>{dataSize.storage}</Text>
                <Text style={styles.dataLabel}>Storage Used</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY CONTROLS</Text>
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <Ionicons name="analytics-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Usage Analytics</Text>
                <Text style={styles.toggleDesc}>Anonymous app usage data</Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={toggleAnalytics}
                trackColor={{ false: COLORS.bgSecondary, true: COLORS.accent + '60' }}
                thumbColor={analyticsEnabled ? COLORS.accent : COLORS.textMuted}
              />
            </View>
          </View>
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <Ionicons name="bug-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Crash Reports</Text>
                <Text style={styles.toggleDesc}>Help improve app stability</Text>
              </View>
              <Switch
                value={crashEnabled}
                onValueChange={toggleCrash}
                trackColor={{ false: COLORS.bgSecondary, true: COLORS.accent + '60' }}
                thumbColor={crashEnabled ? COLORS.accent : COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Data on Device */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA STORAGE</Text>
          <View style={styles.infoCard}>
            <Ionicons name="phone-portrait-outline" size={18} color={COLORS.scoreHigh} />
            <Text style={styles.infoText}>
              All your data is stored locally on your device. No photos or analysis data are uploaded to any server.
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.scoreHigh} />
            <Text style={styles.infoText}>
              Sensitive data (PINs, encryption keys) is stored in your device's secure enclave using expo-secure-store.
            </Text>
          </View>
        </View>

        {/* Data Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
            <Ionicons name="download-outline" size={20} color={COLORS.accent} />
            <Text style={styles.menuText}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleRevokePermissions}>
            <Ionicons name="key-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Manage Permissions</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteHistory}>
            <Ionicons name="trash-outline" size={20} color={COLORS.scoreMid} />
            <Text style={[styles.menuText, { color: COLORS.scoreMid }]}>Delete Scan History</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAllData}>
            <Ionicons name="nuclear-outline" size={20} color={COLORS.scoreLow} />
            <Text style={[styles.menuText, { color: COLORS.scoreLow }]}>Delete ALL App Data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={styles.legalCard}>
            <Text style={styles.legalText}>
              Androgenic processes all facial analysis on-device. No images are transmitted to external servers.
              Your scan results are stored locally using encrypted storage. We do not sell or share personal data.
              Product recommendations are community-sourced and not sponsored. This app is for entertainment
              and self-improvement purposes only.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  dataCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dataRow: { flexDirection: 'row', alignItems: 'center' },
  dataItem: { flex: 1, alignItems: 'center', gap: 4 },
  dataDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  dataValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
  dataLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  toggleCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleInfo: { flex: 1 },
  toggleTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  toggleDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  infoCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14,
    gap: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  infoText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: 12, padding: 14, marginBottom: 6, gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuText: { flex: 1, color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  legalCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  legalText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
});

export default PrivacyScreen;
