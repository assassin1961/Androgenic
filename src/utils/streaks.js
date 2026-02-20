import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'androgenic_streaks';

export const LEVELS = [
  { level: 1, name: 'Newbie', xpRequired: 0, color: '#8e8ea0' },
  { level: 2, name: 'Beginner', xpRequired: 100, color: '#00b4d8' },
  { level: 3, name: 'Committed', xpRequired: 300, color: '#00e676' },
  { level: 4, name: 'Dedicated', xpRequired: 600, color: '#6c5ce7' },
  { level: 5, name: 'Warrior', xpRequired: 1000, color: '#ff6b35' },
  { level: 6, name: 'Elite', xpRequired: 1500, color: '#ff4757' },
  { level: 7, name: 'Champion', xpRequired: 2200, color: '#a29bfe' },
  { level: 8, name: 'Legend', xpRequired: 3000, color: '#FFD700' },
  { level: 9, name: 'Ascended', xpRequired: 4000, color: '#ff6090' },
  { level: 10, name: 'Godlike', xpRequired: 5500, color: '#00e5ff' },
];

export const ACHIEVEMENTS = [
  { id: 'first_scan', name: 'First Glance', desc: 'Complete your first face scan', icon: 'camera-outline', color: '#00b4d8', xp: 25 },
  { id: 'five_scans', name: 'Selfie Addict', desc: 'Complete 5 face scans', icon: 'images-outline', color: '#6c5ce7', xp: 50 },
  { id: 'ten_scans', name: 'Mirror Master', desc: 'Complete 10 face scans', icon: 'sparkles-outline', color: '#ff6090', xp: 100 },
  { id: 'streak_3', name: 'Triple Threat', desc: 'Maintain a 3-day streak', icon: 'flame-outline', color: '#ff6b35', xp: 30 },
  { id: 'streak_7', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: 'flame', color: '#ff4757', xp: 75 },
  { id: 'streak_30', name: 'Monthly Machine', desc: 'Maintain a 30-day streak', icon: 'trophy', color: '#FFD700', xp: 300 },
  { id: 'water_goal', name: 'Hydration Hero', desc: 'Hit your daily water goal', icon: 'water', color: '#00b4d8', xp: 15 },
  { id: 'water_week', name: 'Aqua King', desc: 'Hit water goal 7 days in a row', icon: 'water-outline', color: '#0077b6', xp: 100 },
  { id: 'routine_complete', name: 'All In', desc: 'Complete all daily routine tasks', icon: 'checkmark-done', color: '#00e676', xp: 40 },
  { id: 'workout_done', name: 'Beast Mode', desc: 'Complete a full workout program', icon: 'barbell', color: '#ff4757', xp: 50 },
  { id: 'challenge_start', name: 'Challenger', desc: 'Start the 30-day challenge', icon: 'flag-outline', color: '#a29bfe', xp: 20 },
  { id: 'challenge_half', name: 'Halfway There', desc: 'Complete 15 challenge days', icon: 'ribbon-outline', color: '#ffab40', xp: 150 },
  { id: 'challenge_done', name: 'Transformed', desc: 'Complete all 30 challenge days', icon: 'medal-outline', color: '#FFD700', xp: 500 },
  { id: 'score_70', name: 'Above Average', desc: 'Get an overall score of 70+', icon: 'trending-up', color: '#00e676', xp: 50 },
  { id: 'score_80', name: 'Top Tier', desc: 'Get an overall score of 80+', icon: 'star', color: '#ffab40', xp: 100 },
  { id: 'score_90', name: 'Model Status', desc: 'Get an overall score of 90+', icon: 'diamond', color: '#FFD700', xp: 250 },
  { id: 'improve_5', name: 'Glow Up', desc: 'Improve your overall score by 5+', icon: 'arrow-up-circle', color: '#00e676', xp: 75 },
  { id: 'improve_10', name: 'Major Glow Up', desc: 'Improve your overall score by 10+', icon: 'rocket', color: '#6c5ce7', xp: 200 },
  { id: 'pro_member', name: 'VIP', desc: 'Become a PRO member', icon: 'shield-checkmark', color: '#FFD700', xp: 100 },
  { id: 'night_owl', name: 'Night Owl', desc: 'Complete a routine after 10 PM', icon: 'moon', color: '#6c5ce7', xp: 25 },
];

const defaultStreakState = () => ({
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalScans: 0,
  unlockedAchievements: {},
  dailyXPHistory: [],
});

let streakState = null;

export const loadStreakState = async () => {
  try {
    const data = await AsyncStorage.getItem(STREAK_KEY);
    streakState = data ? JSON.parse(data) : defaultStreakState();
  } catch {
    streakState = defaultStreakState();
  }
  // Update streak on load
  updateDailyStreak();
  return streakState;
};

const saveStreakState = async () => {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakState));
  } catch {}
};

const updateDailyStreak = () => {
  if (!streakState) return;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (streakState.lastActiveDate === today) return;
  if (streakState.lastActiveDate === yesterday) {
    // Consecutive day
    streakState.currentStreak++;
  } else if (streakState.lastActiveDate !== today) {
    // Streak broken
    streakState.currentStreak = streakState.lastActiveDate ? 0 : 0;
  }
};

export const markDayActive = async () => {
  if (!streakState) await loadStreakState();
  const today = new Date().toDateString();

  if (streakState.lastActiveDate === today) return streakState;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (streakState.lastActiveDate === yesterday) {
    streakState.currentStreak++;
  } else {
    streakState.currentStreak = 1;
  }

  streakState.lastActiveDate = today;
  if (streakState.currentStreak > streakState.longestStreak) {
    streakState.longestStreak = streakState.currentStreak;
  }

  // Check streak achievements
  if (streakState.currentStreak >= 3) await unlockAchievement('streak_3');
  if (streakState.currentStreak >= 7) await unlockAchievement('streak_7');
  if (streakState.currentStreak >= 30) await unlockAchievement('streak_30');

  await saveStreakState();
  return streakState;
};

export const addXP = async (amount, source) => {
  if (!streakState) await loadStreakState();
  streakState.totalXP += amount;

  const today = new Date().toDateString();
  const existing = streakState.dailyXPHistory.find((d) => d.date === today);
  if (existing) {
    existing.xp += amount;
  } else {
    streakState.dailyXPHistory.unshift({ date: today, xp: amount, source });
  }
  streakState.dailyXPHistory = streakState.dailyXPHistory.slice(0, 30);

  await saveStreakState();
  return streakState.totalXP;
};

export const unlockAchievement = async (achievementId) => {
  if (!streakState) await loadStreakState();
  if (streakState.unlockedAchievements[achievementId]) return false;

  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  streakState.unlockedAchievements[achievementId] = Date.now();
  streakState.totalXP += achievement.xp;
  await saveStreakState();
  return true;
};

export const recordScan = async (overallScore) => {
  if (!streakState) await loadStreakState();
  streakState.totalScans++;

  await markDayActive();
  await addXP(20, 'scan');

  if (streakState.totalScans === 1) await unlockAchievement('first_scan');
  if (streakState.totalScans >= 5) await unlockAchievement('five_scans');
  if (streakState.totalScans >= 10) await unlockAchievement('ten_scans');
  if (overallScore >= 70) await unlockAchievement('score_70');
  if (overallScore >= 80) await unlockAchievement('score_80');
  if (overallScore >= 90) await unlockAchievement('score_90');

  await saveStreakState();
};

export const getStreakState = () => streakState || defaultStreakState();

export const getCurrentLevel = () => {
  const xp = streakState?.totalXP || 0;
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) currentLevel = level;
    else break;
  }
  return currentLevel;
};

export const getNextLevel = () => {
  const current = getCurrentLevel();
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

export const getLevelProgress = () => {
  const xp = streakState?.totalXP || 0;
  const current = getCurrentLevel();
  const next = getNextLevel();
  if (!next) return 1;
  const currentXP = xp - current.xpRequired;
  const neededXP = next.xpRequired - current.xpRequired;
  return Math.min(currentXP / neededXP, 1);
};

export const getUnlockedCount = () => {
  return Object.keys(streakState?.unlockedAchievements || {}).length;
};
