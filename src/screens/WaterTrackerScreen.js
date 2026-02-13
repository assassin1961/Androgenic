import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { COLORS, GRADIENTS } from '../utils/theme';

const WATER_KEY = 'androgenic_water';
const DAILY_GOAL = 3000; // ml
const GLASS_SIZE = 250; // ml per glass

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WaterTrackerScreen = ({ navigation }) => {
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const dropAnim = useRef(new Animated.Value(-30)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;

  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    loadData();
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const pct = Math.min(intake / DAILY_GOAL, 1);
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [intake]);

  const loadData = async () => {
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

      // Update or add today's entry
      const todayIdx = hist.findIndex((h) => h.date === today);
      if (todayIdx >= 0) {
        hist[todayIdx].intake = newIntake;
      } else {
        hist.unshift({ date: today, intake: newIntake });
      }

      await AsyncStorage.setItem(WATER_KEY, JSON.stringify({
        date: today,
        intake: newIntake,
        history: hist.slice(0, 30),
      }));
      setHistory(hist.slice(0, 30));
    } catch {}
  };

  const addWater = (ml) => {
    const newIntake = Math.min(intake + ml, 5000);
    setIntake(newIntake);
    saveData(newIntake);

    // Drop animation
    dropOpacity.setValue(1);
    dropAnim.setValue(-30);
    Animated.parallel([
      Animated.timing(dropAnim, { toValue: 30, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(dropOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();

    // Splash
    Animated.sequence([
      Animated.timing(splashScale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.spring(splashScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const removeWater = () => {
    const newIntake = Math.max(intake - GLASS_SIZE, 0);
    setIntake(newIntake);
    saveData(newIntake);
  };

  const pct = Math.round((intake / DAILY_GOAL) * 100);
  const glassesCount = Math.floor(intake / GLASS_SIZE);
  const remaining = Math.max(DAILY_GOAL - intake, 0);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  // Weekly summary
  const last7 = history.slice(0, 7);
  const avgIntake = last7.length > 0
    ? Math.round(last7.reduce((s, h) => s + h.intake, 0) / last7.length)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Tracker</Text>
        <Ionicons name="water" size={22} color="#00b4d8" />
      </View>

      <View style={styles.mainContent}>
        {/* Progress Ring */}
        <Animated.View style={[styles.ringContainer, { transform: [{ scale: splashScale }, { translateY: waveTranslate }] }]}>
          <Svg width={size} height={size}>
            <Defs>
              <SvgGrad id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#00b4d8" />
                <Stop offset="1" stopColor="#0077b6" />
              </SvgGrad>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={COLORS.bgCard} strokeWidth={strokeWidth} fill="none" />
            <AnimatedCircle
              cx={size / 2} cy={size / 2} r={radius}
              stroke="url(#waterGrad)" strokeWidth={strokeWidth} fill="none"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.ringInner}>
            {/* Animated drop */}
            <Animated.View style={{ opacity: dropOpacity, transform: [{ translateY: dropAnim }] }}>
              <Ionicons name="water" size={20} color="#00b4d8" />
            </Animated.View>
            <Text style={styles.ringAmount}>{intake}</Text>
            <Text style={styles.ringUnit}>ml / {DAILY_GOAL}ml</Text>
            <Text style={styles.ringPct}>{Math.min(pct, 100)}%</Text>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={18} color="#00b4d8" />
            <Text style={styles.statValue}>{glassesCount}</Text>
            <Text style={styles.statLabel}>Glasses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={18} color={pct >= 100 ? COLORS.scoreHigh : COLORS.textMuted} />
            <Text style={styles.statValue}>{remaining}ml</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="analytics-outline" size={18} color="#a29bfe" />
            <Text style={styles.statValue}>{avgIntake}ml</Text>
            <Text style={styles.statLabel}>7d Avg</Text>
          </View>
        </View>

        {/* Add Buttons */}
        <View style={styles.addRow}>
          {[150, 250, 500, 750].map((ml) => (
            <TouchableOpacity key={ml} style={styles.addBtn} onPress={() => addWater(ml)} activeOpacity={0.7}>
              <Text style={styles.addBtnText}>+{ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={removeWater} style={styles.undoBtn}>
          <Ionicons name="arrow-undo-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.undoBtnText}>Undo last</Text>
        </TouchableOpacity>

        {/* Weekly bar chart */}
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
                    backgroundColor: dayPct >= 1 ? '#00b4d8' : dayPct > 0 ? '#00b4d860' : COLORS.bgCard,
                  }]} />
                </View>
                <Text style={[styles.weekLabel, isToday && styles.weekLabelToday]}>{day}</Text>
              </View>
            );
          })}
        </View>

        {/* Benefit Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color="#00b4d8" />
          <Text style={styles.tipText}>
            {pct >= 100
              ? 'Goal reached! Proper hydration reduces facial bloating and improves skin clarity.'
              : pct >= 50
              ? 'Halfway there! Water flushes toxins that cause breakouts and dull skin.'
              : 'Hydration is the #1 free looksmax hack. It reduces puffiness and improves skin glow.'}
          </Text>
        </View>
      </View>
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
  mainContent: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  ringContainer: { position: 'relative', marginBottom: 20 },
  ringInner: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ringAmount: { fontSize: 42, fontWeight: '900', color: COLORS.textPrimary },
  ringUnit: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  ringPct: { color: '#00b4d8', fontSize: 14, fontWeight: '700', marginTop: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, width: '100%',
    justifyContent: 'space-around', alignItems: 'center',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  addRow: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center' },
  addBtn: {
    backgroundColor: 'rgba(0,180,216,0.12)', borderWidth: 1, borderColor: 'rgba(0,180,216,0.3)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18,
  },
  addBtnText: { color: '#00b4d8', fontSize: 15, fontWeight: '700' },
  undoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  undoBtnText: { color: COLORS.textMuted, fontSize: 12 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 10 },
  weekChart: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%', justifyContent: 'space-around' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekBarBg: { width: 24, height: 60, backgroundColor: COLORS.bgCard, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  weekBarFill: { width: '100%', borderRadius: 6 },
  weekLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  weekLabelToday: { color: '#00b4d8' },
  tipCard: {
    flexDirection: 'row', gap: 10, backgroundColor: 'rgba(0,180,216,0.08)', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: 'rgba(0,180,216,0.15)', width: '100%',
  },
  tipText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, flex: 1 },
});

export default WaterTrackerScreen;
