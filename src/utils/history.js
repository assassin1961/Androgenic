import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPro, PRO_CONFIG } from './pro';

const HISTORY_KEY = 'androgenic_history';

export const saveToHistory = async (scores, imageUri) => {
  try {
    const history = await getHistory();
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      scores,
      imageUri,
    };
    history.unshift(entry);
    // Limit storage
    const maxEntries = isPro() ? 100 : PRO_CONFIG.freeHistoryLimit;
    const trimmed = history.slice(0, maxEntries);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return entry;
  } catch (e) {
    console.warn('Failed to save history', e);
    return null;
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear history', e);
  }
};

export const getProgressData = async () => {
  const history = await getHistory();
  if (history.length < 2) return null;

  const latest = history[0].scores;
  const oldest = history[history.length - 1].scores;

  const trends = {};
  Object.keys(latest).forEach((key) => {
    if (key !== 'overallRating') {
      trends[key] = {
        current: latest[key],
        previous: oldest[key],
        change: latest[key] - oldest[key],
      };
    }
  });

  return {
    totalScans: history.length,
    trends,
    history: history.slice(0, 10),
  };
};
