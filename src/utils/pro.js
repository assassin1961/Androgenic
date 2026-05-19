import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import {
  initIAP,
  endIAP,
  fetchProducts,
  getPurchaseState,
  refreshPurchaseState,
  purchaseSubscriptionProduct,
  purchaseLifetimeProduct,
  restorePurchases as iapRestore,
  planIdToProductId,
  getLocalizedPrice,
} from '../services/iapService';
import { getManageSubscriptionUrl } from '../config/iap';
import { isLoggedIn, restoreServerPurchases, getSubscriptionStatus } from '../services/api';

const STORAGE_KEY = 'androgenic_pro';

// --- New storage keys ---
const SCAN_COUNT_KEY = 'androgenic_total_scans_used';
const TRIAL_USED_KEY = 'androgenic_trial_used';
const TRIAL_START_KEY = 'androgenic_trial_start';
const PAYWALL_HITS_KEY = 'androgenic_paywall_hits';
const AI_CHAT_MESSAGES_KEY = 'androgenic_ai_chat_messages';
const INVITE_COUNT_KEY = 'androgenic_invite_count';
const DISCOUNT_OFFER_KEY = 'androgenic_discount_offer';

// --- Constants ---
export const SCAN_LIMIT = 3;
export const FREE_CATEGORIES = ['jawline', 'skin'];
export const INVITES_NEEDED = 3;

const FREE_GUIDES_LIMIT = 4;
const FREE_AI_CHAT_MESSAGES = 10;
const FREE_HAIRSTYLE_RECOMMENDATIONS = 2;
const FREE_SUPPLEMENTS = 3;
const FREE_SHARE_TEMPLATE = 'Minimal';
const DISCOUNT_PERCENT = 40;
const DISCOUNT_WINDOW_HOURS = 24;
const PAYWALL_HITS_FOR_DISCOUNT = 3;

export const PRO_CONFIG = {
  freeScansPerDay: 3,
  freeHistoryLimit: 3,
  freeTipsPerCategory: 1,
  trialDays: 3,
  freeCategories: ['masculinity', 'jawline', 'eyes'],
  proCategories: ['cheekbones', 'hair', 'skin', 'symmetry'],
  allCategories: ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'],
  plans: [
    { id: 'weekly', label: 'Weekly', price: '$4.99', period: '/week', savings: null },
    { id: 'monthly', label: 'Monthly', price: '$9.99', period: '/month', savings: 'Save 50%', popular: true },
    { id: 'yearly', label: 'Yearly', price: '$39.99', period: '/year', savings: 'Save 85%' },
    { id: 'lifetime', label: 'Lifetime', price: '$79.99', period: 'one-time', savings: 'Best Value' },
  ],
  proFeatures: [
    'Unlimited face scans',
    'All 7 analysis categories',
    'Celebrity look-alike matching',
    'Facial ratio analysis',
    'Progress tracking over time',
    '12-week improvement plan',
    'Unlimited tips & recommendations',
    'Unlimited history',
    '23+ expert looksmaxxing guides',
    'Testosterone optimization protocol',
    'Lean face & de-bloating system',
    'Style & fragrance masterclass',
    'Minoxidil & beard growth guide',
    'Collagen & anti-aging protocol',
    'Face exercises & facial yoga',
    'Neck training for aesthetics',
    'Cold exposure & ice face method',
    'Mindset & confidence mastery',
    'Photo angles & lighting guide',
    'Dating profile optimization',
    'Statistical report & bell curve',
    'Demographic perception breakdown',
    'AI photo ranking system',
    'Model calibration engine',
  ],
};

let proState = null;

const defaultState = () => ({
  isPro: false,
  plan: null,
  trialStart: null,
  trialUsed: false,
  purchaseDate: null,
  scansToday: 0,
  scanDate: null,
  planTasks: {},
});

export const loadProState = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    proState = data ? JSON.parse(data) : defaultState();
  } catch {
    proState = defaultState();
  }

  // Initialize real IAP and fetch store products
  await initIAP();
  await fetchProducts();

  // Update plan prices with real store prices
  PRO_CONFIG.plans.forEach((plan) => {
    const productId = planIdToProductId(plan.id);
    const realPrice = getLocalizedPrice(productId);
    if (realPrice) {
      plan.price = realPrice;
    }
  });

  // Sync pro status from IAP
  const purchaseState = getPurchaseState();
  if (purchaseState?.isPro) {
    proState.isPro = true;
    proState.plan = purchaseState.plan;
  }

  // Also check backend subscription status if logged in
  if (isLoggedIn()) {
    try {
      const subStatus = await getSubscriptionStatus();
      if (subStatus?.isPro) {
        proState.isPro = true;
        proState.plan = subStatus.plan || proState.plan;
      }
    } catch {}
  }

  return proState;
};

const saveProState = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(proState));
  } catch (e) {
    console.warn('Failed to save pro state', e);
  }
};

export const getProState = () => proState || defaultState();

export const isPro = () => {
  // Check real IAP state first
  const purchaseState = getPurchaseState();
  if (purchaseState?.isPro) return true;

  // Fallback to local cache for offline
  if (proState?.isPro) return true;

  return false;
};

export const isTrialActive = () => {
  // With Google Play, trial is part of the subscription offer.
  // Approximate: if subscription is active and purchased < trialDays ago
  const purchaseState = getPurchaseState();
  if (!purchaseState?.isPro || purchaseState?.isLifetime) return false;
  if (!purchaseState?.purchaseTime) return false;

  const elapsed = Date.now() - purchaseState.purchaseTime;
  const trialMs = PRO_CONFIG.trialDays * 24 * 60 * 60 * 1000;
  return elapsed < trialMs;
};

export const getTrialDaysLeft = () => {
  const purchaseState = getPurchaseState();
  if (!purchaseState?.isPro || !purchaseState?.purchaseTime) return 0;
  if (purchaseState?.isLifetime) return 0;

  const elapsed = Date.now() - purchaseState.purchaseTime;
  const trialMs = PRO_CONFIG.trialDays * 24 * 60 * 60 * 1000;
  const remaining = trialMs - elapsed;
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
};

export const getScansRemaining = () => {
  if (isPro()) return Infinity;
  if (!proState) return PRO_CONFIG.freeScansPerDay;
  const today = new Date().toDateString();
  if (proState.scanDate !== today) return PRO_CONFIG.freeScansPerDay;
  return Math.max(0, PRO_CONFIG.freeScansPerDay - proState.scansToday);
};

export const useScan = async () => {
  if (!proState) await loadProState();
  const today = new Date().toDateString();
  if (proState.scanDate !== today) {
    proState.scanDate = today;
    proState.scansToday = 0;
  }
  proState.scansToday++;
  await saveProState();
};

export const canAccessCategory = (category) => {
  if (isPro()) return true;
  return PRO_CONFIG.freeCategories.includes(category);
};

export const getMaxTipsForCategory = () => {
  if (isPro()) return Infinity;
  return PRO_CONFIG.freeTipsPerCategory;
};

export const purchasePlan = async (planId) => {
  const productId = planIdToProductId(planId);
  if (!productId) throw new Error('Unknown plan: ' + planId);

  return new Promise((resolve, reject) => {
    const onSuccess = async (state) => {
      if (!proState) await loadProState();
      proState.isPro = true;
      proState.plan = planId;
      proState.purchaseDate = Date.now();
      await saveProState();
      resolve(state);
    };
    const onError = (error) => {
      if (error.cancelled || error.code === 'E_USER_CANCELLED') {
        reject(new Error('CANCELLED'));
      } else {
        reject(error);
      }
    };

    if (planId === 'lifetime') {
      purchaseLifetimeProduct(onSuccess, onError);
    } else {
      purchaseSubscriptionProduct(productId, onSuccess, onError);
    }
  });
};

export const startFreeTrial = async () => {
  // Google Play handles free trial as part of subscription offer.
  // Starting a trial = subscribing to monthly (trial configured in Play Console).
  return purchasePlan('monthly');
};

export const cancelSubscription = async () => {
  // Google Play doesn't allow programmatic cancellation.
  // Redirect user to Play Store subscription management.
  await Linking.openURL(getManageSubscriptionUrl());
};

export const hasUsedTrial = () => {
  // Google Play tracks trial eligibility per account.
  const purchaseState = getPurchaseState();
  if (purchaseState?.isPro) return true;
  return proState?.trialUsed || false;
};

export const restorePurchases = async () => {
  const result = await iapRestore();
  if (result) {
    if (!proState) proState = defaultState();
    proState.isPro = true;
    proState.plan = result.plan;
    proState.purchaseDate = result.purchaseTime;
    await saveProState();

    // Also restore on backend
    if (isLoggedIn() && result.purchaseToken) {
      try {
        await restoreServerPurchases([{
          productId: result.productId,
          purchaseToken: result.purchaseToken,
        }]);
      } catch {}
    }
  }
  return result;
};

// Celebrity match database
const CELEBRITIES = [
  { name: 'Brad Pitt', score: 92, traits: { jawline: 90, eyes: 85, symmetry: 95 }, image: '🎬' },
  { name: 'Henry Cavill', score: 95, traits: { jawline: 95, masculinity: 98, cheekbones: 88 }, image: '🦸' },
  { name: 'Chris Hemsworth', score: 91, traits: { jawline: 88, masculinity: 95, hair: 90 }, image: '⚡' },
  { name: 'Timothée Chalamet', score: 85, traits: { eyes: 92, symmetry: 88, cheekbones: 90 }, image: '🎭' },
  { name: 'David Beckham', score: 89, traits: { jawline: 85, symmetry: 90, skin: 88 }, image: '⚽' },
  { name: 'Zayn Malik', score: 90, traits: { eyes: 95, jawline: 82, cheekbones: 92 }, image: '🎤' },
  { name: 'Ian Somerhalder', score: 88, traits: { eyes: 96, jawline: 80, symmetry: 85 }, image: '🧛' },
  { name: 'Matt Bomer', score: 93, traits: { symmetry: 97, eyes: 90, jawline: 85 }, image: '👤' },
  { name: 'Sean O\'Pry', score: 96, traits: { symmetry: 98, jawline: 92, cheekbones: 95 }, image: '📸' },
  { name: 'Lucky Blue Smith', score: 87, traits: { eyes: 93, hair: 95, skin: 90 }, image: '💎' },
  { name: 'Jon Kortajarena', score: 90, traits: { jawline: 95, cheekbones: 90, eyes: 82 }, image: '🌟' },
  { name: 'Francisco Lachowski', score: 97, traits: { symmetry: 99, jawline: 93, eyes: 91 }, image: '👑' },
];

export const getCelebrityMatch = (scores) => {
  let bestMatch = CELEBRITIES[0];
  let bestScore = 0;

  CELEBRITIES.forEach((celeb) => {
    let matchScore = 0;
    let count = 0;
    Object.keys(celeb.traits).forEach((trait) => {
      if (scores[trait] !== undefined) {
        const diff = Math.abs(scores[trait] - celeb.traits[trait]);
        matchScore += Math.max(0, 100 - diff * 2);
        count++;
      }
    });
    const avg = count > 0 ? matchScore / count : 0;
    if (avg > bestScore) {
      bestScore = avg;
      bestMatch = celeb;
    }
  });

  return { ...bestMatch, matchPercent: Math.round(bestScore) };
};

// Facial ratios
export const computeFacialRatios = (scores) => {
  const overall = scores.overall || 50;
  const base = overall / 100;
  return [
    { name: 'Golden Ratio', value: (1.5 + base * 0.25).toFixed(3), ideal: '1.618', rating: base > 0.6 ? 'Good' : 'Fair' },
    { name: 'fWHR', value: (1.7 + base * 0.2).toFixed(2), ideal: '1.80-2.00', rating: base > 0.7 ? 'Excellent' : 'Average' },
    { name: 'Jaw-Face Ratio', value: (0.7 + base * 0.15).toFixed(2), ideal: '0.80+', rating: scores.jawline > 60 ? 'Strong' : 'Average' },
    { name: 'Eye Spacing', value: (0.42 + base * 0.06).toFixed(2), ideal: '0.45-0.47', rating: scores.eyes > 60 ? 'Ideal' : 'Average' },
    { name: 'Midface Ratio', value: (0.95 + base * 0.1).toFixed(2), ideal: '1.00', rating: base > 0.5 ? 'Good' : 'Long' },
    { name: 'Canthal Tilt', value: `${(2 + base * 6).toFixed(1)}°`, ideal: '4-8°', rating: scores.eyes > 65 ? 'Positive' : 'Neutral' },
    { name: 'Bigonial Width', value: (0.75 + base * 0.1).toFixed(2), ideal: '0.80+', rating: scores.jawline > 65 ? 'Wide' : 'Narrow' },
    { name: 'Symmetry Index', value: (85 + base * 14).toFixed(1), ideal: '95+', rating: scores.symmetry > 70 ? 'High' : 'Moderate' },
  ];
};

// Improvement plan
export const generateImprovementPlan = (scores) => {
  const weakest = Object.entries(scores)
    .filter(([k]) => k !== 'overall')
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([k]) => k);

  const phases = [
    {
      title: 'Foundation',
      weeks: 'Weeks 1-4',
      description: 'Build essential habits and start basic improvements',
      tasks: [
        { id: 'p1t1', text: 'Start a consistent skincare routine (cleanser, moisturizer, SPF)', category: 'skin' },
        { id: 'p1t2', text: 'Begin mewing exercises (proper tongue posture)', category: 'jawline' },
        { id: 'p1t3', text: 'Drink 3L of water daily for skin hydration', category: 'skin' },
        { id: 'p1t4', text: 'Start chewing mastic gum 30min/day', category: 'jawline' },
        { id: 'p1t5', text: 'Get 7-9 hours of sleep on your back', category: 'symmetry' },
        { id: 'p1t6', text: 'Cut out processed sugar and dairy', category: 'skin' },
      ],
    },
    {
      title: 'Optimization',
      weeks: 'Weeks 5-8',
      description: 'Build on habits and add targeted improvements',
      tasks: [
        { id: 'p2t1', text: 'Add retinol to evening skincare routine', category: 'skin' },
        { id: 'p2t2', text: 'Start facial exercises for cheekbone definition', category: 'cheekbones' },
        { id: 'p2t3', text: 'Get a haircut that complements your face shape', category: 'hair' },
        { id: 'p2t4', text: 'Begin minoxidil for beard/hair if needed', category: 'hair' },
        { id: 'p2t5', text: 'Practice proper posture daily', category: 'symmetry' },
        { id: 'p2t6', text: 'Add eye area treatments (caffeine serum)', category: 'eyes' },
      ],
    },
    {
      title: 'Advanced',
      weeks: 'Weeks 9-12',
      description: 'Fine-tune and maximize your results',
      tasks: [
        { id: 'p3t1', text: 'Evaluate results and adjust routine', category: 'overall' },
        { id: 'p3t2', text: 'Consider professional treatments if needed', category: 'skin' },
        { id: 'p3t3', text: 'Optimize grooming (brows, facial hair styling)', category: 'masculinity' },
        { id: 'p3t4', text: 'Advanced mewing: hard mewing sessions', category: 'jawline' },
        { id: 'p3t5', text: 'Focus on weakest areas with targeted routines', category: weakest[0] || 'overall' },
        { id: 'p3t6', text: 'Take progress photos and compare', category: 'overall' },
      ],
    },
  ];

  return phases;
};

// Plan task completion
export const togglePlanTask = async (taskId) => {
  if (!proState) await loadProState();
  if (!proState.planTasks) proState.planTasks = {};
  proState.planTasks[taskId] = !proState.planTasks[taskId];
  await saveProState();
  // Sync with backend
  if (isLoggedIn()) {
    try {
      const { toggleTask: apiToggleTask } = require('../services/api');
      await apiToggleTask(taskId);
    } catch {}
  }
  return proState.planTasks[taskId];
};

export const isTaskCompleted = (taskId) => {
  return proState?.planTasks?.[taskId] || false;
};


// =============================================================================
// CONVERSION OPTIMIZATION FEATURES
// =============================================================================

// ---------------------------------------------------------------------------
// 1. HARD SCAN LIMIT (total, not per-day)
// ---------------------------------------------------------------------------

/**
 * Returns the number of free scans remaining (lifetime total, not daily).
 * Pro users get Infinity.
 */
export const getTotalScansRemaining = async () => {
  if (isPro()) return Infinity;
  try {
    const used = await AsyncStorage.getItem(SCAN_COUNT_KEY);
    const count = used ? parseInt(used, 10) : 0;
    return Math.max(0, SCAN_LIMIT - count);
  } catch {
    return SCAN_LIMIT;
  }
};

/**
 * Decrements the lifetime scan counter. Returns false if no scans remain
 * (user must subscribe). Pro users always return true.
 */
export const useTotalScan = async () => {
  if (isPro()) return true;
  try {
    const used = await AsyncStorage.getItem(SCAN_COUNT_KEY);
    const count = used ? parseInt(used, 10) : 0;
    if (count >= SCAN_LIMIT) return false;
    await AsyncStorage.setItem(SCAN_COUNT_KEY, String(count + 1));
    return true;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// 2. RESULTS GATING
// ---------------------------------------------------------------------------

const ALL_RESULT_CATEGORIES = ['jawline', 'skin', 'eyes', 'cheekbones', 'hair', 'symmetry'];

/**
 * Returns the list of category keys visible to the current user.
 * Free users only see jawline and skin; PRO sees all 6.
 */
export const getVisibleCategories = () => {
  if (isPro()) return [...ALL_RESULT_CATEGORIES];
  return [...FREE_CATEGORIES];
};

/**
 * Returns true if the given result category is locked for the current user.
 */
export const isResultLocked = (category) => {
  if (isPro()) return false;
  return !FREE_CATEGORIES.includes(category);
};

// ---------------------------------------------------------------------------
// 3. GRANULAR FEATURE ACCESS LEVELS
// ---------------------------------------------------------------------------

/**
 * Returns 'full', 'limited', or 'locked' for the given feature.
 *
 * Feature rules for free users:
 *   guides      - first 4 visible, rest locked            -> 'limited'
 *   ai_chat     - 10 messages then locked                 -> 'limited' | 'locked'
 *   share_cards - only "Minimal" template free             -> 'limited'
 *   hairstyle   - 2 recommendations free, rest locked      -> 'limited'
 *   supplements - 3 supplements free, rest locked           -> 'limited'
 *   *           - anything else is locked                   -> 'locked'
 *
 * Pro users always get 'full'.
 */
export const getFeatureAccess = async (featureName) => {
  if (isPro()) return 'full';

  switch (featureName) {
    case 'guides':
      return 'limited';
    case 'ai_chat': {
      const msgs = await _getAIChatMessageCount();
      return msgs < FREE_AI_CHAT_MESSAGES ? 'limited' : 'locked';
    }
    case 'share_cards':
      return 'limited';
    case 'hairstyle':
      return 'limited';
    case 'supplements':
      return 'limited';
    default:
      return 'locked';
  }
};

/**
 * Returns the concrete free-tier limits for each feature so UI can render
 * counts like "2 of 8 hairstyles" etc.
 */
export const getFeatureLimits = () => ({
  guides: FREE_GUIDES_LIMIT,
  ai_chat: FREE_AI_CHAT_MESSAGES,
  hairstyle: FREE_HAIRSTYLE_RECOMMENDATIONS,
  supplements: FREE_SUPPLEMENTS,
  share_cards_free_template: FREE_SHARE_TEMPLATE,
});

// --- AI chat message tracking (internal) ---

const _getAIChatMessageCount = async () => {
  try {
    const val = await AsyncStorage.getItem(AI_CHAT_MESSAGES_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * Increments the AI chat message count for free users.
 * Returns the new count.
 */
export const incrementAIChatMessage = async () => {
  const count = await _getAIChatMessageCount();
  const next = count + 1;
  await AsyncStorage.setItem(AI_CHAT_MESSAGES_KEY, String(next));
  return next;
};

/**
 * Returns remaining AI chat messages for free users. Pro gets Infinity.
 */
export const getAIChatMessagesRemaining = async () => {
  if (isPro()) return Infinity;
  const count = await _getAIChatMessageCount();
  return Math.max(0, FREE_AI_CHAT_MESSAGES - count);
};

/**
 * Returns true if the share-card template name is available for free users.
 */
export const isShareTemplateAvailable = (templateName) => {
  if (isPro()) return true;
  return templateName === FREE_SHARE_TEMPLATE;
};

/**
 * Filters a list of items to what the free user can see based on feature.
 * Pro users get the full list unchanged.
 */
export const applyFeatureLimit = (featureName, items) => {
  if (isPro()) return items;
  const limitMap = {
    guides: FREE_GUIDES_LIMIT,
    hairstyle: FREE_HAIRSTYLE_RECOMMENDATIONS,
    supplements: FREE_SUPPLEMENTS,
  };
  const limit = limitMap[featureName];
  if (limit != null && Array.isArray(items)) {
    return items.slice(0, limit);
  }
  return items;
};

// ---------------------------------------------------------------------------
// 4. TRIAL TRACKING
// ---------------------------------------------------------------------------

/**
 * Marks that the user has consumed their free-trial opportunity (persisted).
 */
export const setTrialUsed = async () => {
  await AsyncStorage.setItem(TRIAL_USED_KEY, 'true');
  await AsyncStorage.setItem(TRIAL_START_KEY, String(Date.now()));
  if (proState) {
    proState.trialUsed = true;
    proState.trialStart = Date.now();
    await saveProState();
  }
};

/**
 * Returns the number of trial days remaining for an actively trialing user.
 * Returns 0 if no trial is active or trial has expired.
 */
export const getTrialDaysRemaining = async () => {
  // Prefer IAP-based check first (covers Google Play managed trials)
  const iapDays = getTrialDaysLeft();
  if (iapDays > 0) return iapDays;

  // Fallback: locally-tracked trial start
  try {
    const startStr = await AsyncStorage.getItem(TRIAL_START_KEY);
    if (!startStr) return 0;
    const start = parseInt(startStr, 10);
    const elapsed = Date.now() - start;
    const trialMs = PRO_CONFIG.trialDays * 24 * 60 * 60 * 1000;
    const remaining = trialMs - elapsed;
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  } catch {
    return 0;
  }
};

/**
 * Returns true if the user had a trial and it has expired.
 */
export const isTrialExpired = async () => {
  const used = await AsyncStorage.getItem(TRIAL_USED_KEY);
  if (used !== 'true') return false;
  const remaining = await getTrialDaysRemaining();
  return remaining <= 0 && !isPro();
};

// ---------------------------------------------------------------------------
// 5. CONVERSION EVENT TRACKING (paywall analytics)
// ---------------------------------------------------------------------------

/**
 * Internal helper: read the paywall-hits array from storage.
 */
const _getPaywallHits = async () => {
  try {
    const raw = await AsyncStorage.getItem(PAYWALL_HITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const _savePaywallHits = async (hits) => {
  try {
    await AsyncStorage.setItem(PAYWALL_HITS_KEY, JSON.stringify(hits));
  } catch {}
};

/**
 * Records that the user saw a paywall from a given source/feature.
 * @param {string} source - identifier like 'scan', 'guides', 'ai_chat', etc.
 */
export const trackPaywallHit = async (source) => {
  const hits = await _getPaywallHits();
  hits.push({ source, timestamp: Date.now() });
  await _savePaywallHits(hits);
};

/**
 * Returns the total number of times the user has seen any paywall.
 */
export const getPaywallHitCount = async () => {
  const hits = await _getPaywallHits();
  return hits.length;
};

/**
 * Returns the feature/source that the user has been blocked on the most.
 * Returns null if no hits recorded.
 */
export const getMostBlockedFeature = async () => {
  const hits = await _getPaywallHits();
  if (hits.length === 0) return null;

  const counts = {};
  hits.forEach(({ source }) => {
    counts[source] = (counts[source] || 0) + 1;
  });

  let maxSource = null;
  let maxCount = 0;
  Object.entries(counts).forEach(([source, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxSource = source;
    }
  });
  return maxSource;
};

// ---------------------------------------------------------------------------
// 6. SMART OFFER / DISCOUNT SYSTEM
// ---------------------------------------------------------------------------

/**
 * Returns true if the user qualifies for a discount offer.
 * Criteria: 3+ paywall hits (shows interest) and not already pro.
 */
export const shouldShowDiscount = async () => {
  if (isPro()) return false;
  const hitCount = await getPaywallHitCount();
  return hitCount >= PAYWALL_HITS_FOR_DISCOUNT;
};

/**
 * Creates (or retrieves) a time-limited discount offer.
 * The offer window is 24 hours from first generation.
 * Returns { discountPercent, expiresAt, code }.
 */
export const getDiscountOffer = async () => {
  try {
    const raw = await AsyncStorage.getItem(DISCOUNT_OFFER_KEY);
    if (raw) {
      const offer = JSON.parse(raw);
      // Return existing offer even if expired so UI can show "expired" state
      return offer;
    }
  } catch {}

  // Generate a new offer
  const offer = {
    discountPercent: DISCOUNT_PERCENT,
    expiresAt: Date.now() + DISCOUNT_WINDOW_HOURS * 60 * 60 * 1000,
    code: `PRO${DISCOUNT_PERCENT}-${Date.now().toString(36).toUpperCase()}`,
    createdAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(DISCOUNT_OFFER_KEY, JSON.stringify(offer));
  } catch {}

  return offer;
};

/**
 * Returns true if the current discount offer has expired.
 */
export const isOfferExpired = async () => {
  try {
    const raw = await AsyncStorage.getItem(DISCOUNT_OFFER_KEY);
    if (!raw) return true; // no offer exists
    const offer = JSON.parse(raw);
    return Date.now() > offer.expiresAt;
  } catch {
    return true;
  }
};

// ---------------------------------------------------------------------------
// 7. SOCIAL UNLOCK / INVITE TRACKING
// ---------------------------------------------------------------------------

/**
 * Returns the number of successful invites the user has made.
 */
export const getInviteCount = async () => {
  try {
    const val = await AsyncStorage.getItem(INVITE_COUNT_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * Records a new successful invite. Returns the updated count.
 */
export const addInvite = async () => {
  const current = await getInviteCount();
  const next = current + 1;
  await AsyncStorage.setItem(INVITE_COUNT_KEY, String(next));
  return next;
};

/**
 * Returns true if the user has sent enough invites to unlock PRO via referrals.
 */
export const hasUnlockedViaInvites = async () => {
  const count = await getInviteCount();
  return count >= INVITES_NEEDED;
};
