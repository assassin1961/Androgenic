import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getScoreColor } from '../utils/theme';
import { generateImprovementPlan, togglePlanTask, isTaskCompleted } from '../utils/pro';

const PlanScreen = ({ route, navigation }) => {
  const { scores } = route.params;
  const [plan, setPlan] = useState([]);
  const [taskStates, setTaskStates] = useState({});
  const [expandedPhase, setExpandedPhase] = useState(0);

  useEffect(() => {
    const phases = generateImprovementPlan(scores);
    setPlan(phases);

    // Load task states
    const states = {};
    phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        states[task.id] = isTaskCompleted(task.id);
      });
    });
    setTaskStates(states);
  }, []);

  const handleToggleTask = async (taskId) => {
    const newState = await togglePlanTask(taskId);
    setTaskStates((prev) => ({ ...prev, [taskId]: newState }));
  };

  const getPhaseProgress = (phase) => {
    const completed = phase.tasks.filter((t) => taskStates[t.id]).length;
    return { completed, total: phase.tasks.length, percent: Math.round((completed / phase.tasks.length) * 100) };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Improvement Plan</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>12-Week Personalized Plan</Text>
        <Text style={styles.description}>
          Based on your analysis results, here's a targeted improvement plan focusing on your weakest areas.
        </Text>

        {plan.map((phase, phaseIndex) => {
          const progress = getPhaseProgress(phase);
          const isExpanded = expandedPhase === phaseIndex;

          return (
            <View key={phaseIndex} style={styles.phaseCard}>
              <TouchableOpacity
                onPress={() => setExpandedPhase(isExpanded ? -1 : phaseIndex)}
                style={styles.phaseHeader}
              >
                <View style={styles.phaseNumber}>
                  <Text style={styles.phaseNumberText}>{phaseIndex + 1}</Text>
                </View>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <Text style={styles.phaseWeeks}>{phase.weeks}</Text>
                </View>
                <View style={styles.phaseProgress}>
                  <Text style={styles.phasePercent}>{progress.percent}%</Text>
                  <Text style={styles.phaseCount}>{progress.completed}/{progress.total}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
              </View>

              {isExpanded && (
                <View style={styles.phaseTasks}>
                  <Text style={styles.phaseDesc}>{phase.description}</Text>
                  {phase.tasks.map((task) => {
                    const completed = taskStates[task.id];
                    return (
                      <TouchableOpacity
                        key={task.id}
                        style={[styles.taskRow, completed && styles.taskCompleted]}
                        onPress={() => handleToggleTask(task.id)}
                      >
                        <Ionicons
                          name={completed ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={completed ? COLORS.scoreHigh : COLORS.textMuted}
                        />
                        <View style={styles.taskInfo}>
                          <Text style={[styles.taskText, completed && styles.taskTextCompleted]}>
                            {task.text}
                          </Text>
                          <View style={[styles.taskCategory, { backgroundColor: getScoreColor(scores[task.category] || 50) + '20' }]}>
                            <Text style={[styles.taskCategoryText, { color: getScoreColor(scores[task.category] || 50) }]}>
                              {task.category}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  phaseCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  phaseWeeks: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  phaseProgress: {
    alignItems: 'flex-end',
  },
  phasePercent: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  phaseCount: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  phaseTasks: {
    padding: 16,
    paddingTop: 12,
  },
  phaseDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  taskCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  taskCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PlanScreen;
