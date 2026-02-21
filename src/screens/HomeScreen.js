import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/theme';
import { loadProState, getScansRemaining, isPro } from '../utils/pro';
import { loadStreakState, getStreakState, markDayActive, getCurrentLevel, getLevelProgress } from '../utils/streaks';

const { width } = Dimensions.get('window');
const COL3 = (width - 56) / 3;

const HomeScreen = ({ navigation }) => {
  const [ready, setReady] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([loadProState(), loadStreakState()]).then(() => {
      setStreakData(getStreakState());
      markDayActive().then(() => setStreakData(getStreakState()));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      Promise.all([loadProState(), loadStreakState()]).then(() => {
        setStreakData(getStreakState());
        setReady(true);
      });
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [ready]);

  const level = streakData ? getCurrentLevel() : null;
  const levelProgress = streakData ? getLevelProgress() : 0;

  const handleCamera = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  }, [navigation]);

  const handleUpload = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isPro() && getScansRemaining() <= 0) {
      navigation.navigate('Paywall');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Photo library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  }, [navigation]);

  if (!ready) return <View style={styles.container} />;

  const scansLeft = getScansRemaining();
  const pro = isPro();

  const FEATURES = [
    { icon: 'flame', text: 'Challenge', screen: 'Challenge', color: '#ff6b35' },
    { icon: 'today', text: 'Routine', screen: 'RoutineTab', color: '#00e676' },
    { icon: 'trophy', text: 'Achievements', screen: 'Achievements', color: '#FFD700' },
    { icon: 'analytics', text: 'Insights', screen: 'WeeklyInsights', color: '#0066ff' },
    { icon: 'barbell', text: 'Workouts', screen: 'Workout', color: '#ff5252' },
    { icon: 'water', text: 'Water', screen: 'WaterTracker', color: '#00b4d8' },
    { icon: 'bag', text: 'Products', screen: 'Products', color: '#ffab40' },
    { icon: 'podium', text: 'Ranks', screen: 'LeaderboardTab', color: '#FFD700' },
    { icon: 'body', text: 'Body Fat', screen: 'BodyFat', color: '#4d94ff' },
    { icon: 'color-palette', text: 'Skin Tone', screen: 'SkinTone', color: '#ff6090' },
    { icon: 'book', text: 'Guides', screen: 'Guides', color: '#1de9b6' },
    { icon: 'sparkles', text: 'Glow-Up', screen: 'GlowUpSimulator', color: '#00e5ff' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>ANDROGENIC</Text>
            <Text style={styles.tagline}>AI Face Analysis</Text>
          </View>
          <View style={styles.headerRight}>
            {streakData && streakData.currentStreak > 0 && (
              <TouchableOpacity style={styles.streakChip} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
                <Ionicons name="flame" size={14} color="#ff6b35" />
                <Text style={styles.streakNum}>{streakData.currentStreak}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
        >
          {/* Level Bar */}
          {streakData && (
            <TouchableOpacity style={styles.levelBar} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
              <View style={styles.levelLeft}>
                <Text style={styles.levelLabel}>
                  Lv.{level?.level || 1}
                </Text>
                <Text style={[styles.levelName, level && { color: level.color }]}>
                  {level?.name || 'Newbie'}
                </Text>
              </View>
              <View style={styles.xpBarOuter}>
                <View style={[styles.xpBarInner, { width: `${Math.max(levelProgress * 100, 3)}%` }]} />
              </View>
              <Text style={styles.xpText}>{streakData.totalXP} XP</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          {/* Scan CTA */}
          <View style={styles.scanSection}>
            <View style={styles.scanIconWrap}>
              <LinearGradient colors={['#0055dd', '#0088ff']} style={styles.scanIconBg}>
                <Ionicons name="scan" size={32} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.scanTitle}>Analyze Your Face</Text>
            <Text style={styles.scanSub}>
              AI scoring across 7 categories{'\n'}with personalized improvement tips
            </Text>

            <View style={styles.scanButtons}>
              <TouchableOpacity onPress={handleCamera} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={['#0055dd', '#0077ff']} style={styles.scanBtn}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.scanBtnText}>Take Selfie</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpload} activeOpacity={0.85} style={styles.uploadBtn}>
                <Ionicons name="image-outline" size={20} color={COLORS.accentLight} />
              </TouchableOpacity>
            </View>

            {!pro && (
              <View style={styles.scansRow}>
                <View style={styles.scansDots}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.scanDot, i < scansLeft && styles.scanDotActive]} />
                  ))}
                </View>
                <Text style={styles.scansLabel}>
                  {scansLeft} free scan{scansLeft !== 1 ? 's' : ''} left
                </Text>
              </View>
            )}
          </View>

          {/* PRO Upgrade */}
          {!pro && (
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
              <LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.proBanner}>
                <Ionicons name="diamond" size={16} color="#000" />
                <Text style={styles.proBannerText}>Unlock Unlimited Scans</Text>
                <View style={styles.proBannerArrow}>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Features Grid - 3 columns */}
          <Text style={styles.sectionTitle}>Tools</Text>
          <View style={styles.grid}>
            {FEATURES.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={styles.gridItem}
                onPress={() => navigation.navigate(f.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.gridIcon, { backgroundColor: f.color + '15' }]}>
                  <Ionicons name={f.icon} size={20} color={f.color} />
                </View>
                <Text style={styles.gridText} numberOfLines={1}>{f.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Links */}
          {!pro && (
            <>
              <Text style={styles.sectionTitle}>PRO Features</Text>
              {[
                { icon: 'sparkles', title: 'Glow-Up Simulator', sub: 'See your potential transformation', screen: 'GlowUpSimulator', color: '#00e5ff' },
                { icon: 'document-text', title: 'Glow-Up Report', sub: 'Detailed analysis breakdown', screen: 'GlowUpReport', color: '#00e676' },
                { icon: 'images', title: 'Transformations', sub: 'Before & after tracking', screen: 'BeforeAfter', color: '#ffab40' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.proCard} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
                  <View style={[styles.proCardIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.proCardInfo}>
                    <Text style={styles.proCardTitle}>{item.title}</Text>
                    <Text style={styles.proCardSub}>{item.sub}</Text>
                  </View>
                  <View style={styles.proPill}>
                    <Text style={styles.proPillText}>PRO</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2.5,
  },
  tagline: {
    fontSize: 9,
    color: '#0077ff',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,107,53,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  streakNum: {
    color: '#ff6b35',
    fontSize: 13,
    fontWeight: '800',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Level Bar
  levelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  levelName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  xpBarOuter: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    backgroundColor: '#0066ff',
    borderRadius: 2,
  },
  xpText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

  // Scan Section
  scanSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  scanIconWrap: {
    marginBottom: 16,
  },
  scanIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.accentGlow,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  scanSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  scanButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  scansDots: {
    flexDirection: 'row',
    gap: 4,
  },
  scanDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  scanDotActive: {
    backgroundColor: '#0066ff',
  },
  scansLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },

  // PRO Banner
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  proBannerText: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  proBannerArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // 3-col Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  gridItem: {
    width: COL3,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // PRO Cards
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  proCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proCardInfo: {
    flex: 1,
  },
  proCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  proCardSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  proPill: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  proPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
