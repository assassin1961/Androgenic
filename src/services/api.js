import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__
  ? 'http://10.0.2.2:3000/api' // Android emulator → localhost
  : 'https://api.androgenic.app/api'; // Production URL

const TOKEN_KEY = 'androgenic_auth_token';
const USER_KEY = 'androgenic_auth_user';

let authToken = null;
let currentUser = null;
let onAuthChange = null;

// ---- Token Management ----

export const loadToken = async () => {
  try {
    authToken = await AsyncStorage.getItem(TOKEN_KEY);
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) currentUser = JSON.parse(userData);
    return authToken;
  } catch {
    return null;
  }
};

const saveToken = async (token, user) => {
  authToken = token;
  currentUser = user;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  if (onAuthChange) onAuthChange(true, user);
};

const clearToken = async () => {
  authToken = null;
  currentUser = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  if (onAuthChange) onAuthChange(false, null);
};

export const getToken = () => authToken;
export const getUser = () => currentUser;
export const isLoggedIn = () => !!authToken;
export const setOnAuthChange = (cb) => { onAuthChange = cb; };

// ---- HTTP Client ----

const request = async (method, path, body, isFormData = false) => {
  const headers = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, config);
  const data = await res.json();

  if (res.status === 401) {
    await clearToken();
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
};

// ---- Auth API ----

export const register = async (email, password, displayName) => {
  const data = await request('POST', '/auth/register', { email, password, displayName });
  await saveToken(data.token, data.user);
  return data;
};

export const login = async (email, password) => {
  const data = await request('POST', '/auth/login', { email, password });
  await saveToken(data.token, data.user);
  return data;
};

export const getProfile = async () => {
  return request('GET', '/auth/me');
};

export const logout = async () => {
  await clearToken();
};

export const deleteAccount = async () => {
  await request('DELETE', '/auth/account');
  await clearToken();
};

// ---- Subscription API ----

export const verifyPurchase = async (productId, purchaseToken, plan, isLifetime) => {
  return request('POST', '/subscriptions/verify', { productId, purchaseToken, plan, isLifetime });
};

export const getSubscriptionStatus = async () => {
  return request('GET', '/subscriptions/status');
};

export const restoreServerPurchases = async (purchases) => {
  return request('POST', '/subscriptions/restore', { purchases });
};

// ---- Scans API ----

export const uploadScan = async (imageUri, scores) => {
  const formData = new FormData();
  if (imageUri) {
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    });
  }
  formData.append('scores', JSON.stringify(scores));
  return request('POST', '/scans', formData, true);
};

export const getScanHistory = async () => {
  return request('GET', '/scans');
};

export const getScanProgress = async () => {
  return request('GET', '/scans/progress');
};

export const getScansRemaining = async () => {
  return request('GET', '/scans/remaining');
};

export const clearScanHistory = async () => {
  return request('DELETE', '/scans');
};

// ---- User Data API ----

export const getTasks = async () => {
  return request('GET', '/userdata/tasks');
};

export const toggleTask = async (taskId) => {
  return request('POST', `/userdata/tasks/${taskId}/toggle`);
};

export const getChallenge = async () => {
  return request('GET', '/userdata/challenge');
};

export const startChallenge = async () => {
  return request('POST', '/userdata/challenge/start');
};

export const toggleChallengeDay = async (day) => {
  return request('POST', `/userdata/challenge/day/${day}`);
};

export const getWater = async () => {
  return request('GET', '/userdata/water');
};

export const addWater = async (amount) => {
  return request('POST', '/userdata/water/add', { amount });
};

export const getRoutine = async () => {
  return request('GET', '/userdata/routine');
};

export const toggleRoutine = async (taskId) => {
  return request('POST', '/userdata/routine/toggle', { taskId });
};

export const getWorkout = async () => {
  return request('GET', '/userdata/workout');
};

export const toggleWorkout = async (exerciseId) => {
  return request('POST', '/userdata/workout/toggle', { exerciseId });
};

// ---- Health Check ----

export const healthCheck = async () => {
  return request('GET', '/health');
};
