import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../utils/theme';
import { isLoggedIn, getWorkout as apiGetWorkout, toggleWorkout as apiToggleWorkout } from '../services/api';

const WORKOUT_KEY = 'androgenic_workouts';

const PROGRAMS = {
  facial: {
    title: 'Facial Exercises',
    icon: 'happy-outline',
    color: '#a29bfe',
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

const WorkoutScreen = ({ navigation }) => {
  const [activeProgram, setActiveProgram] = useState('facial');
  const [completedExercises, setCompleted] = useState({});
  const cardAnims = useRef([...Array(15)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    animateCards();
  }, [activeProgram]);

  const animateCards = () => {
    cardAnims.forEach((a) => a.setValue(0));
    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 70),
        Animated.spring(anim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  };

  const loadState = async () => {
    // Try backend first
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

  const getDifficultyColor = (d) => {
    if (d === 'Advanced') return COLORS.scoreLow;
    if (d === 'Intermediate') return COLORS.scoreMid;
    return COLORS.scoreHigh;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workouts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Program Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
          {Object.entries(PROGRAMS).map(([key, prog]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveProgram(key)}
              style={[styles.progTab, activeProgram === key && { borderColor: prog.color, backgroundColor: prog.color + '15' }]}
            >
              <Ionicons name={prog.icon} size={18} color={activeProgram === key ? prog.color : COLORS.textMuted} />
              <Text style={[styles.progTabText, activeProgram === key && { color: prog.color }]}>{prog.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Program Header */}
        <View style={styles.progHeader}>
          <View>
            <Text style={styles.progTitle}>{program.title}</Text>
            <Text style={styles.progDesc}>{program.desc}</Text>
          </View>
          <View style={styles.progProgress}>
            <Text style={[styles.progCount, { color: program.color }]}>{completedCount}/{program.exercises.length}</Text>
          </View>
        </View>

        {/* Exercises */}
        {program.exercises.map((ex, i) => {
          const done = completedExercises[ex.name];
          const animIdx = Math.min(i, cardAnims.length - 1);
          return (
            <Animated.View key={ex.name} style={{
              opacity: cardAnims[animIdx],
              transform: [{ translateY: cardAnims[animIdx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}>
              <TouchableOpacity
                style={[styles.exCard, done && styles.exCardDone]}
                onPress={() => toggleExercise(ex.name)}
                activeOpacity={0.7}
              >
                <View style={styles.exTop}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={done ? COLORS.scoreHigh : COLORS.textMuted}
                  />
                  <View style={styles.exInfo}>
                    <Text style={[styles.exName, done && styles.exNameDone]}>{ex.name}</Text>
                    <Text style={styles.exMuscle}>{ex.muscle}</Text>
                  </View>
                  <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(ex.difficulty) + '20' }]}>
                    <Text style={[styles.diffText, { color: getDifficultyColor(ex.difficulty) }]}>{ex.difficulty}</Text>
                  </View>
                </View>
                <View style={styles.exStats}>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>Sets</Text>
                    <Text style={styles.exStatValue}>{ex.sets}</Text>
                  </View>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>Reps</Text>
                    <Text style={styles.exStatValue}>{ex.reps}</Text>
                  </View>
                  <View style={styles.exStat}>
                    <Text style={styles.exStatLabel}>Rest</Text>
                    <Text style={styles.exStatValue}>{ex.rest}</Text>
                  </View>
                </View>
                <Text style={styles.exInstructions}>{ex.instructions}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

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
  tabScroll: { maxHeight: 48, marginBottom: 16 },
  tabRow: { gap: 8 },
  progTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  progTabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  progHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  progTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  progDesc: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  progProgress: {},
  progCount: { fontSize: 20, fontWeight: '800' },
  exCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  exCardDone: { opacity: 0.6, borderColor: COLORS.scoreHigh + '30' },
  exTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  exInfo: { flex: 1 },
  exName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  exNameDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  exMuscle: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontWeight: '700' },
  exStats: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  exStat: {},
  exStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  exStatValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  exInstructions: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
});

export default WorkoutScreen;
