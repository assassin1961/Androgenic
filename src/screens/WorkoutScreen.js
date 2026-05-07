import React, { useState, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../utils/theme';
import { isLoggedIn, getWorkout as apiGetWorkout, toggleWorkout as apiToggleWorkout } from '../services/api';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedPressable from '../components/AnimatedPressable';

const WORKOUT_KEY = 'androgenic_workouts';

const PROGRAMS = {
  facial: {
    title: 'Facial Exercises',
    icon: 'happy-outline',
    color: '#3388ff',
    desc: 'Target facial muscles for better definition',
    exercises: [
      { name: 'Mewing Hold', sets: '3', reps: '60 sec', rest: '30s', muscle: 'Maxilla/Palate', instructions: 'Press tongue flat against roof of mouth. Teeth lightly together, lips sealed. Hold for 60 seconds.', difficulty: 'Beginner' },
      { name: 'Jaw Clenches', sets: '3', reps: '20', rest: '30s', muscle: 'Masseter', instructions: 'Clench jaw firmly for 2 seconds, release. Focus on feeling the masseter muscle contract.', difficulty: 'Beginner' },
      { name: 'Chin Tucks', sets: '3', reps: '15', rest: '20s', muscle: 'Jaw/Neck', instructions: 'Pull chin straight back creating a double chin. Hold 3 seconds. Straightens forward head posture.', difficulty: 'Beginner' },
      { name: 'Cheek Lifts', sets: '3', reps: '15', rest: '20s', muscle: 'Zygomaticus', instructions: 'Smile wide, press fingertips on cheeks, lift cheeks toward eyes. Hold 2 seconds each rep.', difficulty: 'Intermediate' },
      { name: 'Brow Raises', sets: '3', reps: '20', rest: '20s', muscle: 'Frontalis', instructions: 'Raise eyebrows as high as possible, hold 2 seconds. Strengthens the brow area.', difficulty: 'Beginner' },
      { name: 'Neck Curls', sets: '3', reps: '15', rest: '45s', muscle: 'SCM/Neck', instructions: 'Lie face up on bench, head hanging off edge. Curl chin to chest. Use weight plate for progression.', difficulty: 'Advanced' },
      { name: 'Side Neck Flexion', sets: '2', reps: '12/side', rest: '30s', muscle: 'Lateral Neck', instructions: 'Tilt head to shoulder against hand resistance. Builds neck width for masculine appearance.', difficulty: 'Intermediate' },
    ],
  },
  body: {
    title: 'Aesthetic Body',
    icon: 'barbell-outline',
    color: '#ff4757',
    desc: 'Compound lifts for masculine physique',
    exercises: [
      { name: 'Bench Press', sets: '4', reps: '8-12', rest: '90s', muscle: 'Chest/Delts/Tris', instructions: 'Wide grip, control the descent, explosive push. Builds upper body width.', difficulty: 'Intermediate' },
      { name: 'Overhead Press', sets: '4', reps: '8-10', rest: '90s', muscle: 'Shoulders', instructions: 'Standing, press bar overhead. Builds the V-taper shoulder width.', difficulty: 'Intermediate' },
      { name: 'Pull-Ups', sets: '4', reps: 'AMRAP', rest: '90s', muscle: 'Back/Biceps', instructions: 'Wide grip, pull chest to bar. The #1 back builder for V-taper.', difficulty: 'Intermediate' },
      { name: 'Barbell Rows', sets: '4', reps: '8-12', rest: '90s', muscle: 'Back/Rear Delts', instructions: 'Bent over, pull bar to lower chest. Thickens the back.', difficulty: 'Intermediate' },
      { name: 'Squats', sets: '4', reps: '8-10', rest: '120s', muscle: 'Legs/Core', instructions: 'Back squat below parallel. Releases testosterone for overall growth.', difficulty: 'Intermediate' },
      { name: 'Deadlift', sets: '3', reps: '5-8', rest: '150s', muscle: 'Full Body', instructions: 'Hip hinge, bar close to body. The king of mass builders.', difficulty: 'Advanced' },
      { name: 'Face Pulls', sets: '3', reps: '15-20', rest: '45s', muscle: 'Rear Delts/Traps', instructions: 'Cable at face height, pull to ears with external rotation. Fixes posture.', difficulty: 'Beginner' },
      { name: 'Lateral Raises', sets: '4', reps: '12-15', rest: '45s', muscle: 'Side Delts', instructions: 'Light weight, raise to shoulder height. Builds shoulder width for V-taper.', difficulty: 'Beginner' },
    ],
  },
  posture: {
    title: 'Posture Correction',
    icon: 'body-outline',
    color: '#00d26a',
    desc: 'Fix forward head & rounded shoulders',
    exercises: [
      { name: 'Wall Angels', sets: '3', reps: '12', rest: '30s', muscle: 'Shoulders/Back', instructions: 'Back flat against wall, arms in W position. Slide arms up to Y and back down.', difficulty: 'Beginner' },
      { name: 'Thoracic Extension', sets: '3', reps: '10', rest: '30s', muscle: 'Upper Back', instructions: 'Foam roller under upper back, arms overhead. Extend back over roller.', difficulty: 'Beginner' },
      { name: 'Band Pull-Aparts', sets: '3', reps: '20', rest: '20s', muscle: 'Rear Delts', instructions: 'Resistance band at chest height, pull apart until arms are straight out to sides.', difficulty: 'Beginner' },
      { name: 'Dead Hangs', sets: '3', reps: '30-60s', rest: '30s', muscle: 'Spine/Shoulders', instructions: 'Hang from pull-up bar with relaxed shoulders. Decompresses spine.', difficulty: 'Beginner' },
      { name: 'Cat-Cow Stretch', sets: '2', reps: '10', rest: '15s', muscle: 'Spine', instructions: 'On all fours, arch back up (cat), then dip belly down (cow). Mobilizes spine.', difficulty: 'Beginner' },
      { name: 'Pec Stretch', sets: '2', reps: '30s/side', rest: '—', muscle: 'Chest', instructions: 'Arm on doorframe at 90°, step through until you feel stretch in pec.', difficulty: 'Beginner' },
    ],
  },
};

const getDifficultyColor = (d) => {
  if (d === 'Advanced') return '#ff4757';
  if (d === 'Intermediate') return '#f5a623';
  return '#00d26a';
};

const ExerciseCard = memo(({ exercise, done, onToggle, index }) => (
  <Animated.View entering={FadeInRight.duration(250).delay(index * 50)}>
    <AnimatedPressable onPress={onToggle}>
      <GlassCard style={[styles.exCard, done && styles.exCardDone]}>
        <View style={styles.exTop}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={done ? COLORS.scoreHigh : COLORS.textMuted}
          />
          <View style={styles.exInfo}>
            <Text style={[styles.exName, done && styles.exNameDone]}>{exercise.name}</Text>
            <Text style={styles.exMuscle}>{exercise.muscle}</Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) + '18' }]}>
            <Text style={[styles.diffText, { color: getDifficultyColor(exercise.difficulty) }]}>{exercise.difficulty}</Text>
          </View>
        </View>
        <View style={styles.exStats}>
          <View style={styles.exStat}>
            <Text style={styles.exStatLabel}>Sets</Text>
            <Text style={styles.exStatValue}>{exercise.sets}</Text>
          </View>
          <View style={styles.exStat}>
            <Text style={styles.exStatLabel}>Reps</Text>
            <Text style={styles.exStatValue}>{exercise.reps}</Text>
          </View>
          <View style={styles.exStat}>
            <Text style={styles.exStatLabel}>Rest</Text>
            <Text style={styles.exStatValue}>{exercise.rest}</Text>
          </View>
        </View>
        <Text style={styles.exInstructions}>{exercise.instructions}</Text>
      </GlassCard>
    </AnimatedPressable>
  </Animated.View>
));

const WorkoutScreen = ({ navigation }) => {
  const [activeProgram, setActiveProgram] = useState('facial');
  const [completedExercises, setCompleted] = useState({});

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    if (isLoggedIn()) {
      try {
        const data = await apiGetWorkout();
        if (data && data.completed) {
          setCompleted(data.completed || {});
          await AsyncStorage.setItem(WORKOUT_KEY, JSON.stringify({ date: new Date().toDateString(), completed: data.completed }));
          return;
        }
      } catch {}
    }
    try {
      const data = await AsyncStorage.getItem(WORKOUT_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === new Date().toDateString()) {
          setCompleted(parsed.completed || {});
        }
      }
    } catch {}
  };

  const toggleExercise = async (name) => {
    const updated = { ...completedExercises };
    updated[name] = !updated[name];
    setCompleted(updated);
    Haptics.impactAsync(updated[name] ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem(WORKOUT_KEY, JSON.stringify({
        date: new Date().toDateString(),
        completed: updated,
      }));
    } catch {}
    if (isLoggedIn()) {
      try { await apiToggleWorkout(name); } catch {}
    }
  };

  const program = PROGRAMS[activeProgram];
  const completedCount = program.exercises.filter((e) => completedExercises[e.name]).length;

  return (
    <GlassBackground variant="purple">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Workouts</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Program Tabs */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
              {Object.entries(PROGRAMS).map(([key, prog]) => (
                <AnimatedPressable
                  key={key}
                  onPress={() => { Haptics.selectionAsync(); setActiveProgram(key); }}
                  style={[styles.progTab, activeProgram === key && { borderColor: prog.color, backgroundColor: prog.color + '12' }]}
                >
                  <Ionicons name={prog.icon} size={16} color={activeProgram === key ? prog.color : COLORS.textMuted} />
                  <Text style={[styles.progTabText, activeProgram === key && { color: prog.color }]}>{prog.title}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Program Header */}
          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <View style={styles.progHeader}>
              <View>
                <Text style={styles.progTitle}>{program.title}</Text>
                <Text style={styles.progDesc}>{program.desc}</Text>
              </View>
              <Text style={[styles.progCount, { color: program.color }]}>{completedCount}/{program.exercises.length}</Text>
            </View>
          </Animated.View>

          {/* Exercises */}
          {program.exercises.map((ex, i) => (
            <ExerciseCard
              key={ex.name}
              exercise={ex}
              done={completedExercises[ex.name]}
              onToggle={() => toggleExercise(ex.name)}
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
  tabScroll: { maxHeight: 48, marginBottom: 16 },
  tabRow: { gap: 8 },
  progTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  progTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  progTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  progDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  progCount: { fontSize: 18, fontWeight: '800' },
  exCard: { padding: 16, marginBottom: 8 },
  exCardDone: { opacity: 0.6 },
  exTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  exInfo: { flex: 1 },
  exName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  exNameDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  exMuscle: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 9, fontWeight: '700' },
  exStats: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  exStat: {},
  exStatLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600' },
  exStatValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  exInstructions: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
});

export default WorkoutScreen;
