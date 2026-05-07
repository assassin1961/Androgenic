import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/theme';
import { isLoggedIn, getWater as apiGetWater, addWater as apiAddWater } from '../services/api';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const WATER_KEY = 'androgenic_water';
const DAILY_GOAL = 3000;
const GLASS_SIZE = 250;

const WaterTrackerScreen = ({ navigation }) => {
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState([]);
  const splashScale = useSharedValue(1);
  const waveY = useSharedValue(0);

  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    loadData();
    waveY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000 }),
        withTiming(3, { duration: 2000 }),
      ),
      -1,
      true,
    );
  }, []);

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splashScale.value }, { translateY: waveY.value }],
  }));

  const loadData = async () => {
    if (isLoggedIn()) {
      try {
        const data = await apiGetWater();
        if (data) {
          setIntake(data.today || 0);
          setHistory(data.history || []);
          return;
        }
      } catch {}
    }
    try {
      const data = await AsyncStorage.getItem(WATER_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setIntake(parsed.intake);
        }
        setHistory(parsed.history || []);
      }
    } catch {}
  };

  const saveData = async (newIntake) => {
    try {
      const data = await AsyncStorage.getItem(WATER_KEY);
      const parsed = data ? JSON.parse(data) : { history: [] };
      const today = new Date().toDateString();
      const hist = parsed.history || [];
      const todayIdx = hist.findIndex((h) => h.date === today);
      if (todayIdx >= 0) {
        hist[todayIdx].intake = newIntake;
      } else {
        hist.unshift({ date: today, intake: newIntake });
      }
      await AsyncStorage.setItem(WATER_KEY, JSON.stringify({
        date: today, intake: newIntake, history: hist.slice(0, 30),
      }));
      setHistory(hist.slice(0, 30));
    } catch {}
  };

  const addWaterAmount = async (ml) => {
    const newIntake = Math.min(intake + ml, 5000);
    setIntake(newIntake);
    saveData(newIntake);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (newIntake >= DAILY_GOAL && intake < DAILY_GOAL) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (isLoggedIn()) {
      try { await apiAddWater(ml); } catch {}
    }
    splashScale.value = withSequence(
      withTiming(1.06, { duration: 150 }),
      withSpring(1, { damping: 6 }),
    );
  };

  const removeWater = () => {
    const newIntake = Math.max(intake - GLASS_SIZE, 0);
    setIntake(newIntake);
    saveData(newIntake);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pct = Math.round((intake / DAILY_GOAL) * 100);
  const glassesCount = Math.floor(intake / GLASS_SIZE);
  const remaining = Math.max(DAILY_GOAL - intake, 0);
  const progress = Math.min(intake / DAILY_GOAL, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const last7 = history.slice(0, 7);
  const avgIntake = last7.length > 0
    ? Math.round(last7.reduce((s, h) => s + h.intake, 0) / last7.length) : 0;

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Water Tracker</Text>
          <Ionicons name="water" size={20} color="#00b4d8" />
        </View>

        <View style={styles.mainContent}>
          {/* Progress Ring */}
          <Animated.View entering={FadeInDown.duration(600)} style={[styles.ringContainer, ringAnimStyle]}>
            <Svg width={size} height={size}>
              <Defs>
                <SvgGrad id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00b4d8" />
                  <Stop offset="1" stopColor="#0077b6" />
                </SvgGrad>
              </Defs>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
              <Circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke="url(#waterGrad)" strokeWidth={strokeWidth} fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View style={styles.ringInner}>
              <Ionicons name="water" size={20} color="#00b4d8" />
              <Text style={styles.ringAmount}>{intake}</Text>
              <Text style={styles.ringUnit}>ml / {DAILY_GOAL}ml</Text>
              <Text style={styles.ringPct}>{Math.min(pct, 100)}%</Text>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ width: '100%' }}>
            <View style={styles.statsRow}>
              <GlassCard style={styles.statCard}>
                <Ionicons name="water-outline" size={16} color="#00b4d8" />
                <Text style={styles.statValue}>{glassesCount}</Text>
                <Text style={styles.statLabel}>Glasses</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="flag-outline" size={16} color={pct >= 100 ? COLORS.scoreHigh : COLORS.textMuted} />
                <Text style={styles.statValue}>{remaining}ml</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Ionicons name="analytics-outline" size={16} color="#3388ff" />
                <Text style={styles.statValue}>{avgIntake}ml</Text>
                <Text style={styles.statLabel}>7d Avg</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Add Buttons */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <View style={styles.addRow}>
              {[150, 250, 500, 750].map((ml) => (
                <AnimatedPressable key={ml} style={styles.addBtn} onPress={() => addWaterAmount(ml)}>
                  <Text style={styles.addBtnText}>+{ml}ml</Text>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          <AnimatedPressable onPress={removeWater} style={styles.undoBtn}>
            <Ionicons name="arrow-undo-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.undoBtnText}>Undo last</Text>
          </AnimatedPressable>

          {/* Weekly bar chart */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ width: '100%' }}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weekChart}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const entry = last7[6 - i];
                const dayPct = entry ? Math.min(entry.intake / DAILY_GOAL, 1) : 0;
                const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                return (
                  <View key={i} style={styles.weekDay}>
                    <View style={styles.weekBarBg}>
                      <View style={[styles.weekBarFill, {
                        height: `${Math.max(dayPct * 100, 4)}%`,
                        backgroundColor: dayPct >= 1 ? '#00b4d8' : dayPct > 0 ? '#00b4d860' : 'rgba(255,255,255,0.04)',
                      }]} />
                    </View>
                    <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Benefit Tip */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={{ width: '100%' }}>
            <GlassCard style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={16} color="#00b4d8" />
              <Text style={styles.tipText}>
                {pct >= 100
                  ? 'Goal reached! Proper hydration reduces facial bloating and improves skin clarity.'
                  : pct >= 50
                  ? 'Halfway there! Water flushes toxins that cause breakouts and dull skin.'
                  : 'Hydration is the #1 free looksmax hack. It reduces puffiness and improves skin glow.'}
              </Text>
            </GlassCard>
          </Animated.View>
        </View>
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
  mainContent: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  ringContainer: { position: 'relative', marginBottom: 20 },
  ringInner: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ringAmount: { fontSize: 40, fontWeight: '900', color: COLORS.textPrimary },
  ringUnit: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500' },
  ringPct: { color: '#00b4d8', fontSize: 14, fontWeight: '700', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, width: '100%' },
  statCard: { flex: 1, alignItems: 'center', padding: 12, gap: 4 },
  statValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 10 },
  addRow: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center' },
  addBtn: {
    backgroundColor: 'rgba(0,180,216,0.1)', borderWidth: 1, borderColor: 'rgba(0,180,216,0.25)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18,
  },
  addBtnText: { color: '#00b4d8', fontSize: 14, fontWeight: '700' },
  undoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  undoBtnText: { color: COLORS.textMuted, fontSize: 11 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 10 },
  weekChart: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%', justifyContent: 'space-around' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekBarBg: {
    width: 24, height: 60, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6,
    overflow: 'hidden', justifyContent: 'flex-end',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  weekBarFill: { width: '100%', borderRadius: 6 },
  weekLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  weekLabelToday: { color: '#00b4d8' },
  tipCard: { flexDirection: 'row', gap: 10, padding: 14 },
  tipText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, flex: 1 },
});

export default WaterTrackerScreen;
