import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPro, PRO_CONFIG } from './pro';
import { isLoggedIn, uploadScan, getScanHistory, getScanProgress, clearScanHistory } from '../services/api';

const HISTORY_KEY = 'androgenic_history';

export const saveToHistory = async (scores, imageUri) => {
  try {
    // Save locally first (always works offline)
    const history = await getLocalHistory();
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      scores,
      imageUri,
    };
    history.unshift(entry);
    const maxEntries = isPro() ? 100 : PRO_CONFIG.freeHistoryLimit;
    const trimmed = history.slice(0, maxEntries);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));

    // Also upload to backend if logged in
    if (isLoggedIn()) {
      try {
        await uploadScan(imageUri, scores);
      } catch (e) {
        console.warn('Backend scan upload failed (saved locally):', e);
      }
    }

    return entry;
  } catch (e) {
    console.warn('Failed to save history', e);
    return null;
  }
};

const getLocalHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getHistory = async () => {
  // Try backend first if logged in
  if (isLoggedIn()) {
    try {
      const data = await getScanHistory();
      if (data.scans && data.scans.length > 0) {
        return data.scans.map((s) => ({
          id: s.id.toString(),
          date: s.created_at,
          scores: typeof s.scores === 'string' ? JSON.parse(s.scores) : s.scores,
          imageUri: s.image_url || s.imageUri,
        }));
      }
    } catch (e) {
      console.warn('Backend history fetch failed, using local:', e);
    }
  }
  return getLocalHistory();
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    if (isLoggedIn()) {
      try { await clearScanHistory(); } catch {}
    }
  } catch (e) {
    console.warn('Failed to clear history', e);
  }
};

export const getProgressData = async () => {
  // Try backend first if logged in
  if (isLoggedIn()) {
    try {
      const data = await getScanProgress();
      if (data && data.totalScans >= 2) return data;
    } catch (e) {
      console.warn('Backend progress fetch failed, using local:', e);
    }
  }

  const history = await getLocalHistory();
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
