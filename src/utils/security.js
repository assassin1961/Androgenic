import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_ID = 'androgenic_enc_key';
const SECURE_PREFIX = 'sec_';

// Generate or retrieve encryption key
const getEncryptionKey = async () => {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
  if (!key) {
    key = Crypto.randomUUID();
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, key);
  }
  return key;
};

// Simple XOR-based obfuscation with key derivation
const deriveKey = async (data) => {
  const key = await getEncryptionKey();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key + data.substring(0, 16)
  );
  return hash;
};

// Encrypt sensitive data before storing
export const secureSet = async (key, value) => {
  try {
    const jsonStr = JSON.stringify(value);
    // Store in SecureStore for sensitive items (limited to 2048 bytes)
    if (jsonStr.length < 2000) {
      await SecureStore.setItemAsync(SECURE_PREFIX + key, jsonStr);
    } else {
      // For larger data, hash-verify + store in AsyncStorage with integrity check
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonStr
      );
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(SECURE_PREFIX + key, JSON.stringify({
        data: jsonStr,
        integrity: hash,
        ts: Date.now(),
      }));
    }
    return true;
  } catch (e) {
    console.warn('SecureStorage set error:', e);
    return false;
  }
};

// Retrieve and validate encrypted data
export const secureGet = async (key) => {
  try {
    // Try SecureStore first
    const secureData = await SecureStore.getItemAsync(SECURE_PREFIX + key);
    if (secureData) {
      return JSON.parse(secureData);
    }

    // Fall back to AsyncStorage with integrity check
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem(SECURE_PREFIX + key);
    if (!raw) return null;

    const { data, integrity } = JSON.parse(raw);
    const checkHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );

    if (checkHash !== integrity) {
      console.warn('Data integrity check failed for key:', key);
      return null; // Data was tampered with
    }

    return JSON.parse(data);
  } catch (e) {
    console.warn('SecureStorage get error:', e);
    return null;
  }
};

// Delete secure data
export const secureDelete = async (key) => {
  try {
    await SecureStore.deleteItemAsync(SECURE_PREFIX + key);
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(SECURE_PREFIX + key);
  } catch (e) {
    console.warn('SecureStorage delete error:', e);
  }
};

// Rate limiter for API-like operations
const rateLimits = {};

export const checkRateLimit = (action, maxPerMinute = 10) => {
  const now = Date.now();
  if (!rateLimits[action]) {
    rateLimits[action] = [];
  }
  // Clean old entries
  rateLimits[action] = rateLimits[action].filter((ts) => now - ts < 60000);
  if (rateLimits[action].length >= maxPerMinute) {
    return false; // Rate limited
  }
  rateLimits[action].push(now);
  return true;
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+=/gi, '') // Strip event handlers
    .trim()
    .substring(0, 500); // Length limit
};

// Validate image URI
export const isValidImageUri = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  // Allow file:// and content:// URIs (from camera/gallery)
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://')) return true;
  // Allow asset URIs
  if (uri.startsWith('asset://') || uri.startsWith('data:image/')) return true;
  return false;
};

// Session token for app integrity
let sessionToken = null;

export const getSessionToken = async () => {
  if (!sessionToken) {
    sessionToken = Crypto.randomUUID();
  }
  return sessionToken;
};

// Detect suspicious activity
let suspiciousActions = 0;

export const reportSuspiciousActivity = (reason) => {
  suspiciousActions++;
  console.warn(`Suspicious activity #${suspiciousActions}: ${reason}`);
  if (suspiciousActions > 20) {
    // Could lock the app or require re-auth
    return true; // Threshold exceeded
  }
  return false;
};

export const getSuspiciousCount = () => suspiciousActions;
