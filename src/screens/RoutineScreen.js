import React, { useState, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isLoggedIn, getRoutine as apiGetRoutine, toggleRoutine as apiToggleRoutine } from '../services/api';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const ROUTINE_KEY = 'androgenic_routine';

const ROUTINES = {
  morning: {
    title: 'Morning Routine',
    icon: 'sunny-outline',
    color: '#f5a623',
    tasks: [
      { id: 'am1', text: 'Splash cold water on face (30 sec)', category: 'skin', time: '1 min' },
      { id: 'am2', text: 'Apply Vitamin C serum', category: 'skin', time: '1 min' },
      { id: 'am3', text: 'Moisturizer + SPF 50', category: 'skin', time: '2 min' },
      { id: 'am4', text: 'Mewing check - tongue on palate', category: 'jawline', time: '30 sec' },
      { id: 'am5', text: 'Chin tucks (10 reps)', category: 'jawline', time: '2 min' },
      { id: 'am6', text: 'Style hair', category: 'hair', time: '5 min' },
      { id: 'am7', text: 'Groom eyebrows', category: 'masculinity', time: '2 min' },
      { id: 'am8', text: 'Eye drops for brightness', category: 'eyes', time: '30 sec' },
    ],
  },
  afternoon: {
    title: 'Afternoon Habits',
    icon: 'fitness-outline',
    color: '#00d26a',
    tasks: [
      { id: 'pm1', text: 'Chew mastic gum (30 min)', category: 'jawline', time: '30 min' },
      { id: 'pm2', text: 'Drink 1L water', category: 'skin', time: '—' },
      { id: 'pm3', text: 'Posture check - shoulders back', category: 'symmetry', time: '30 sec' },
      { id: 'pm4', text: 'Gym / workout session', category: 'masculinity', time: '60 min' },
      { id: 'pm5', text: 'Facial exercises (cheek lifts)', category: 'cheekbones', time: '5 min' },
      { id: 'pm6', text: 'Neck curls (3 sets of 15)', category: 'masculinity', time: '10 min' },
    ],
  },
  evening: {
    title: 'Evening Routine',
    icon: 'moon-outline',
    color: '#0055dd',
    tasks: [
      { id: 'ev1', text: 'Oil cleanser → Gel cleanser', category: 'skin', time: '3 min' },
      { id: 'ev2', text: 'Apply retinol serum', category: 'skin', time: '1 min' },
      { id: 'ev3', text: 'Eye cream (caffeine)', category: 'eyes', time: '1 min' },
      { id: 'ev4', text: 'Moisturizer', category: 'skin', time: '1 min' },
      { id: 'ev5', text: 'Scalp massage (5 min)', category: 'hair', time: '5 min' },
      { id: 'ev6', text: 'Mewing practice - tongue posture hold', category: 'jawline', time: '5 min' },
      { id: 'ev7', text: 'Sleep on back with cervical pillow', category: 'symmetry', time: '—' },
    ],
  },
};

const TaskRow = memo(({ task, completed, routineColor, onToggle, index }) => (
  <Animated.View entering={FadeInRight.duration(250).delay(index * 40)}>
    <AnimatedPressable onPress={onToggle}>
      <GlassCard style={[styles.taskCard, completed && styles.taskCardDone]}>
        <Ionicons
          name={completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={completed ? COLORS.scoreHigh : COLORS.textMuted}
        />
        <View style={styles.taskInfo}>
          <Text style={[styles.taskText, completed && styles.taskTextDone]}>{task.text}</Text>
          <View style={styles.taskMeta}>
            <View style={[styles.taskCatBadge, { backgroundColor: routineColor + '18' }]}>
              <Text style={[styles.taskCatText, { color: routineColor }]}>{task.category}</Text>
            </View>
            <Text style={styles.taskTime}>{task.time}</Text>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

const RoutineScreen = ({ navigation }) => {
  const [completedTasks, setCompletedTasks] = useState({});
  const [activeTab, setActiveTab] = useState('morning');

  useEffect(() => {
    loadRoutineState();
  }, []);

  const loadRoutineState = async () => {
    if (isLoggedIn()) {
      try {
        const data = await apiGetRoutine();
        if (data && data.tasks) {
          setCompletedTasks(data.tasks || {});
          await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify({ date: new Date().toDateString(), tasks: data.tasks }));
          return;
        }
      } catch {}
    }
    try {
      const data = await AsyncStorage.getItem(ROUTINE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date !== new Date().toDateString()) {
          setCompletedTasks({});
        } else {
          setCompletedTasks(parsed.tasks || {});
        }
      }
    } catch {}
  };

  const saveRoutineState = async (tasks) => {
    try {
      await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify({
        date: new Date().toDateString(),
        tasks,
      }));
    } catch {}
  };

  const toggleTask = async (taskId) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(updated);
    saveRoutineState(updated);
    Haptics.impactAsync(updated[taskId] ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (isLoggedIn()) {
      try { await apiToggleRoutine(taskId); } catch {}
    }
  };

  const routine = ROUTINES[activeTab];
  const completedCount = routine.tasks.filter((t) => completedTasks[t.id]).length;
  const totalCount = routine.tasks.length;
  const allTasks = [...ROUTINES.morning.tasks, ...ROUTINES.afternoon.tasks, ...ROUTINES.evening.tasks];
  const totalCompleted = allTasks.filter((t) => completedTasks[t.id]).length;
  const totalAll = allTasks.length;
  const dayPercent = Math.round((totalCompleted / totalAll) * 100);

  return (
    <GlassBackground variant="blue">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Daily Routine</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Day Progress */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard variant="accent" style={styles.dayProgress}>
              <View style={styles.dayProgressHeader}>
                <Text style={styles.dayProgressTitle}>Today's Progress</Text>
                <Text style={styles.dayProgressPercent}>{dayPercent}%</Text>
              </View>
              <View style={styles.dayProgressBar}>
                <LinearGradient
                  colors={GRADIENTS.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.dayProgressFill, { width: `${Math.max(dayPercent, 2)}%` }]}
                />
              </View>
              <Text style={styles.dayProgressLabel}>{totalCompleted}/{totalAll} tasks completed</Text>
            </GlassCard>
          </Animated.View>

          {/* Streak Hint */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <GlassCard style={styles.streakRow}>
              <Ionicons name="flame" size={18} color="#ff6b35" />
              <Text style={styles.streakText}>Keep going! Complete all tasks for a streak bonus.</Text>
            </GlassCard>
          </Animated.View>

          {/* Tab Selector */}
          <Animated.View entering={FadeInDown.duration(300).delay(140)}>
            <View style={styles.tabs}>
              {Object.entries(ROUTINES).map(([key, val]) => (
                <AnimatedPressable
                  key={key}
                  onPress={() => { Haptics.selectionAsync(); setActiveTab(key); }}
                  style={[styles.tab, activeTab === key && { backgroundColor: val.color + '18', borderColor: val.color }]}
                >
                  <Ionicons name={val.icon} size={16} color={activeTab === key ? val.color : COLORS.textMuted} />
                  <Text style={[styles.tabText, activeTab === key && { color: val.color }]}>
                    {val.title.split(' ')[0]}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </Animated.View>

          {/* Section Header */}
          <Animated.View entering={FadeInDown.duration(300).delay(200)}>
            <View style={styles.sectionHeader}>
              <Ionicons name={routine.icon} size={20} color={routine.color} />
              <Text style={styles.sectionTitle}>{routine.title}</Text>
              <Text style={[styles.sectionCount, { color: routine.color }]}>{completedCount}/{totalCount}</Text>
            </View>
          </Animated.View>

          {/* Tasks */}
          {routine.tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              completed={completedTasks[task.id]}
              routineColor={routine.color}
              onToggle={() => toggleTask(task.id)}
              index={i}
            />
          ))}

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
  scroll: { paddingHorizontal: 20 },
  dayProgress: { padding: 16, marginBottom: 12 },
  dayProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayProgressTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  dayProgressPercent: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
  dayProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  dayProgressFill: { height: '100%', borderRadius: 3 },
  dayProgressLabel: { color: COLORS.textMuted, fontSize: 11 },
  streakRow: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 14, gap: 8 },
  streakText: { color: COLORS.textSecondary, fontSize: 12, flex: 1 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: COLORS.borderLight, gap: 6,
  },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  sectionCount: { fontSize: 14, fontWeight: '600' },
  taskCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, marginBottom: 6, gap: 10 },
  taskCardDone: { opacity: 0.6 },
  taskInfo: { flex: 1 },
  taskText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 19, marginBottom: 6 },
  taskTextDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskCatBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  taskCatText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskTime: { color: COLORS.textMuted, fontSize: 10 },
});

export default RoutineScreen;
