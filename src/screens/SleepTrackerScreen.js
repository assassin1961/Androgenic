import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInRight, ZoomIn, useSharedValue, useAnimatedStyle,
  withSpring, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPressable from '../components/AnimatedPressable';
import { COLORS, GRADIENTS, SHADOWS, RADIUS } from '../utils/theme';

const { width } = Dimensions.get('window');
const SLEEP_KEY = 'androgenic_sleep_tracker';

const SLEEP_TIPS = [
  { icon: 'moon', tip: 'Sleep 7-9 hours for optimal facial recovery and reduced puffiness', color: '#4d94ff' },
  { icon: 'snow', tip: 'Cool room (65-68°F) promotes deeper sleep and better skin repair', color: '#00e5ff' },
  { icon: 'phone-portrait', tip: 'No screens 1 hour before bed — blue light disrupts melatonin', color: '#ff6090' },
  { icon: 'water', tip: 'Stop fluids 2 hours before sleep to prevent morning face bloat', color: '#00b4d8' },
  { icon: 'bed', tip: 'Sleep on your back to prevent facial compression and wrinkles', color: '#a855f7' },
  { icon: 'time', tip: 'Consistent sleep/wake times regulate circadian rhythm for skin repair', color: '#ffab40' },
];

const FACE_IMPACT = [
  { condition: 'Under-eye bags', hours: '<6h', severity: 'high', icon: 'eye', color: '#ff5252' },
  { condition: 'Facial puffiness', hours: '<7h', severity: 'medium', icon: 'water', color: '#ffab40' },
  { condition: 'Dull skin tone', hours: '<7h', severity: 'medium', icon: 'sunny', color: '#ffab40' },
  { condition: 'Accelerated aging', hours: '<6h', severity: 'high', icon: 'hourglass', color: '#ff5252' },
  { condition: 'Slow wound healing', hours: '<7h', severity: 'medium', icon: 'medkit', color: '#ffab40' },
  { condition: 'Increased acne', hours: '<6h', severity: 'high', icon: 'alert-circle', color: '#ff5252' },
];

const SleepQualityRing = memo(({ score }) => {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1, false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const color = score >= 80 ? '#00e676' : score >= 60 ? '#ffab40' : '#ff5252';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';

  return (
    <View style={styles.ringContainer}>
      <Animated.View style={[styles.ringOuter, ringStyle]}>
        <LinearGradient
          colors={[color, color + '40', color]}
          style={styles.ringGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={styles.ringInner}>
        <Text style={[styles.ringScore, { color }]}>{score}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
      </View>
    </View>
  );
});

const SleepTrackerScreen = ({ navigation }) => {
  const [sleepData, setSleepData] = useState({
    hours: 7.5,
    quality: 75,
    weekLog: [],
  });
  const [selectedHours, setSelectedHours] = useState(7.5);

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    try {
      const data = await AsyncStorage.getItem(SLEEP_KEY);
      if (data) setSleepData(JSON.parse(data));
    } catch {}
  };

  const saveSleepData = async (data) => {
    try {
      await AsyncStorage.setItem(SLEEP_KEY, JSON.stringify(data));
    } catch {}
  };

  const logSleep = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const quality = Math.min(100, Math.max(20, Math.round(selectedHours * 12 + (Math.random() * 10 - 5))));
    const today = new Date().toDateString();
    const newLog = [
      { date: today, hours: selectedHours, quality },
      ...sleepData.weekLog.filter(e => e.date !== today),
    ].slice(0, 7);

    const newData = { hours: selectedHours, quality, weekLog: newLog };
    setSleepData(newData);
    await saveSleepData(newData);
  }, [selectedHours, sleepData]);

  const adjustHours = useCallback((delta) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHours(prev => Math.max(3, Math.min(12, Math.round((prev + delta) * 2) / 2)));
  }, []);

  const getFaceImpactScore = (hours) => {
    if (hours >= 8) return { score: 95, label: 'Optimal', color: '#00e676' };
    if (hours >= 7) return { score: 80, label: 'Good', color: '#4d94ff' };
    if (hours >= 6) return { score: 55, label: 'Suboptimal', color: '#ffab40' };
    return { score: 30, label: 'Poor', color: '#ff5252' };
  };

  const faceImpact = getFaceImpactScore(selectedHours);

  return (
    <GlassBackground variant="night">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Sleep Tracker</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sleep Quality Ring */}
          <Animated.View entering={ZoomIn.duration(500)}>
            <GlassCard variant="default" style={styles.qualityCard}>
              <SleepQualityRing score={sleepData.quality} />
              <Text style={styles.qualityTitle}>Sleep Quality Score</Text>
              <Text style={styles.qualitySub}>Based on duration, consistency & timing</Text>
            </GlassCard>
          </Animated.View>

          {/* Hours Selector */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <GlassCard variant="default" style={styles.hoursCard}>
              <Text style={styles.hoursTitle}>Log Tonight's Sleep</Text>
              <View style={styles.hoursRow}>
                <AnimatedPressable onPress={() => adjustHours(-0.5)} style={styles.hourBtn}>
                  <Ionicons name="remove" size={22} color={COLORS.textPrimary} />
                </AnimatedPressable>
                <View style={styles.hoursDisplay}>
                  <Text style={styles.hoursNum}>{selectedHours}</Text>
                  <Text style={styles.hoursUnit}>hours</Text>
                </View>
                <AnimatedPressable onPress={() => adjustHours(0.5)} style={styles.hourBtn}>
                  <Ionicons name="add" size={22} color={COLORS.textPrimary} />
                </AnimatedPressable>
              </View>

              {/* Face Impact Preview */}
              <View style={[styles.impactBadge, { backgroundColor: faceImpact.color + '15' }]}>
                <Ionicons name="person" size={14} color={faceImpact.color} />
                <Text style={[styles.impactText, { color: faceImpact.color }]}>
                  Face Impact: {faceImpact.label} ({faceImpact.score}/100)
                </Text>
              </View>

              <GlassButton
                title="Log Sleep"
                icon="moon"
                onPress={logSleep}
                variant="primary"
                style={{ marginTop: 12 }}
              />
            </GlassCard>
          </Animated.View>

          {/* Week Overview */}
          {sleepData.weekLog.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <GlassCard variant="default" style={styles.weekCard}>
                <View style={styles.weekBars}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const log = sleepData.weekLog[i];
                    const h = log ? Math.max((log.hours / 10) * 80, 8) : 8;
                    const c = log ? (log.hours >= 7 ? '#00e676' : log.hours >= 6 ? '#ffab40' : '#ff5252') : COLORS.border;
                    return (
                      <View key={day} style={styles.weekBarCol}>
                        <View style={[styles.weekBar, { height: h, backgroundColor: c }]} />
                        <Text style={styles.weekBarLabel}>{day}</Text>
                        {log && <Text style={styles.weekBarValue}>{log.hours}h</Text>}
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Face Impact Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={styles.sectionTitle}>Sleep & Face Impact</Text>
            {FACE_IMPACT.map((item, i) => (
              <Animated.View key={i} entering={FadeInRight.duration(300).delay(350 + i * 50)}>
                <GlassCard variant="default" style={styles.impactCard}>
                  <View style={[styles.impactIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={14} color={item.color} />
                  </View>
                  <View style={styles.impactInfo}>
                    <Text style={styles.impactName}>{item.condition}</Text>
                    <Text style={styles.impactHours}>Risk when sleeping {item.hours}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.severityText, { color: item.color }]}>{item.severity}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Text style={styles.sectionTitle}>Sleep Optimization Tips</Text>
            {SLEEP_TIPS.map((tip, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(300).delay(550 + i * 50)}>
                <GlassCard variant="default" style={styles.tipCard}>
                  <View style={[styles.tipIcon, { backgroundColor: tip.color + '15' }]}>
                    <Ionicons name={tip.icon} size={14} color={tip.color} />
                  </View>
                  <Text style={styles.tipText}>{tip.tip}</Text>
                </GlassCard>
              </Animated.View>
            ))}
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

  qualityCard: { padding: 24, alignItems: 'center', marginBottom: 16 },
  ringContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  ringOuter: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 3,
    borderColor: 'transparent',
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject, borderRadius: 60, opacity: 0.6,
  },
  ringInner: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(10,10,24,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  ringScore: { fontSize: 28, fontWeight: '900' },
  ringLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  qualityTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  qualitySub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  hoursCard: { padding: 20, marginBottom: 16 },
  hoursTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  hourBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  hoursDisplay: { alignItems: 'center' },
  hoursNum: { fontSize: 36, fontWeight: '900', color: COLORS.textPrimary },
  hoursUnit: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  impactBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 12,
  },
  impactText: { fontSize: 12, fontWeight: '700' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },

  weekCard: { padding: 16, marginBottom: 16 },
  weekBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  weekBarCol: { alignItems: 'center', flex: 1 },
  weekBar: { width: 16, borderRadius: 4, minHeight: 8 },
  weekBarLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', marginTop: 4 },
  weekBarValue: { fontSize: 8, color: COLORS.textSecondary, fontWeight: '700', marginTop: 1 },

  impactCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  impactIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  impactInfo: { flex: 1 },
  impactName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  impactHours: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  tipCard: { padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
});

export default SleepTrackerScreen;
