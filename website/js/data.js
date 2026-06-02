/**
 * Androgenic Web — local data layer
 * Sync localStorage wrappers for history, gamification (XP / levels /
 * streaks / achievements). Designed for the static web app.
 */

/* ---------------- History ---------------- */
const HISTORY_KEY = 'androgenic_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveToHistory(scores, imageUri) {
  const history = getHistory();
  const entry = { id: Date.now().toString(), date: new Date().toISOString(), scores, imageUri };
  history.unshift(entry);
  const max = (typeof isPro === 'function' && isPro()) ? 100 : 3;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, max)));
  return entry;
}
function clearHistory() { localStorage.removeItem(HISTORY_KEY); }

/* ---------------- Gamification ---------------- */
const STREAK_KEY = 'androgenic_streaks';

const LEVELS = [
  { level: 1,  name: 'Newbie',    xpRequired: 0,    color: '#8e8ea0' },
  { level: 2,  name: 'Beginner',  xpRequired: 100,  color: '#00b4d8' },
  { level: 3,  name: 'Committed', xpRequired: 300,  color: '#00e676' },
  { level: 4,  name: 'Dedicated', xpRequired: 600,  color: '#0055dd' },
  { level: 5,  name: 'Warrior',   xpRequired: 1000, color: '#ff6b35' },
  { level: 6,  name: 'Elite',     xpRequired: 1500, color: '#ff4757' },
  { level: 7,  name: 'Champion',  xpRequired: 2200, color: '#3388ff' },
  { level: 8,  name: 'Legend',    xpRequired: 3000, color: '#FFD700' },
  { level: 9,  name: 'Ascended',  xpRequired: 4000, color: '#ff6090' },
  { level: 10, name: 'Godlike',   xpRequired: 5500, color: '#00e5ff' },
];

const ACHIEVEMENTS = [
  { id: 'first_scan',   name: 'First Glance',   desc: 'Complete your first face scan',     icon: '📸', xp: 25 },
  { id: 'five_scans',   name: 'Selfie Addict',  desc: 'Complete 5 face scans',             icon: '🖼️', xp: 50 },
  { id: 'ten_scans',    name: 'Mirror Master',  desc: 'Complete 10 face scans',            icon: '✨', xp: 100 },
  { id: 'streak_3',     name: 'Triple Threat',  desc: 'Maintain a 3-day streak',           icon: '🔥', xp: 30 },
  { id: 'streak_7',     name: 'Week Warrior',   desc: 'Maintain a 7-day streak',           icon: '🔥', xp: 75 },
  { id: 'streak_30',    name: 'Monthly Machine',desc: 'Maintain a 30-day streak',          icon: '🏆', xp: 300 },
  { id: 'routine_done', name: 'All In',         desc: 'Complete all daily routine tasks',  icon: '✅', xp: 40 },
  { id: 'score_70',     name: 'Above Average',  desc: 'Get an overall score of 70+',       icon: '📈', xp: 50 },
  { id: 'score_80',     name: 'Top Tier',       desc: 'Get an overall score of 80+',       icon: '⭐', xp: 100 },
  { id: 'score_90',     name: 'Model Status',   desc: 'Get an overall score of 90+',       icon: '💎', xp: 250 },
  { id: 'improve_5',    name: 'Glow Up',        desc: 'Improve your overall score by 5+',  icon: '🚀', xp: 75 },
  { id: 'pro_member',   name: 'VIP',            desc: 'Become a PRO member',               icon: '🛡️', xp: 100 },
];

function defaultStreak() {
  return { totalXP: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null,
           totalScans: 0, unlockedAchievements: {}, dailyXPHistory: [] };
}
function getStreakState() {
  try { return Object.assign(defaultStreak(), JSON.parse(localStorage.getItem(STREAK_KEY)) || {}); }
  catch { return defaultStreak(); }
}
function saveStreakState(s) { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); }

function markDayActive(s) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (s.lastActiveDate === today) return [];
  s.currentStreak = (s.lastActiveDate === yesterday) ? s.currentStreak + 1 : 1;
  s.lastActiveDate = today;
  s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
  const unlocked = [];
  if (s.currentStreak >= 3)  unlocked.push('streak_3');
  if (s.currentStreak >= 7)  unlocked.push('streak_7');
  if (s.currentStreak >= 30) unlocked.push('streak_30');
  return unlocked;
}
function addXP(s, amount, source) {
  s.totalXP += amount;
  const today = new Date().toDateString();
  const existing = s.dailyXPHistory.find(d => d.date === today);
  if (existing) existing.xp += amount;
  else s.dailyXPHistory.unshift({ date: today, xp: amount, source });
  s.dailyXPHistory = s.dailyXPHistory.slice(0, 30);
}
function unlockAchievement(s, id) {
  if (s.unlockedAchievements[id]) return false;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return false;
  s.unlockedAchievements[id] = Date.now();
  s.totalXP += a.xp;
  return true;
}
/** Records a scan, returns { state, newAchievements:[achievement], xpGained } */
function recordScan(overall100) {
  const s = getStreakState();
  const before = s.totalXP;
  const newly = [];
  s.totalScans++;
  markDayActive(s).forEach(id => { if (unlockAchievement(s, id)) newly.push(id); });
  addXP(s, 20, 'scan');
  const checks = [];
  if (s.totalScans === 1) checks.push('first_scan');
  if (s.totalScans >= 5)  checks.push('five_scans');
  if (s.totalScans >= 10) checks.push('ten_scans');
  if (overall100 >= 70) checks.push('score_70');
  if (overall100 >= 80) checks.push('score_80');
  if (overall100 >= 90) checks.push('score_90');
  checks.forEach(id => { if (unlockAchievement(s, id)) newly.push(id); });
  saveStreakState(s);
  return {
    state: s,
    newAchievements: newly.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean),
    xpGained: s.totalXP - before,
  };
}
function getCurrentLevel(s) {
  const xp = (s || getStreakState()).totalXP;
  let cur = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xpRequired) cur = l; else break; }
  return cur;
}
function getLevelProgress(s) {
  s = s || getStreakState();
  const cur = getCurrentLevel(s);
  const idx = LEVELS.findIndex(l => l.level === cur.level);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  if (!next) return { pct: 1, next: null, cur };
  const have = s.totalXP - cur.xpRequired;
  const need = next.xpRequired - cur.xpRequired;
  return { pct: Math.min(have / need, 1), next, cur, have, need };
}
