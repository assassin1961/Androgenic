import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'androgenic_pro';

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
  if (!proState) return false;
  if (proState.isPro) return true;
  if (proState.trialStart) {
    const elapsed = Date.now() - proState.trialStart;
    const trialMs = PRO_CONFIG.trialDays * 24 * 60 * 60 * 1000;
    return elapsed < trialMs;
  }
  return false;
};

export const isTrialActive = () => {
  if (!proState || !proState.trialStart) return false;
  const elapsed = Date.now() - proState.trialStart;
  const trialMs = PRO_CONFIG.trialDays * 24 * 60 * 60 * 1000;
  return elapsed < trialMs && !proState.isPro;
};

export const getTrialDaysLeft = () => {
  if (!proState || !proState.trialStart) return 0;
  const elapsed = Date.now() - proState.trialStart;
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

export const startFreeTrial = async () => {
  if (!proState) await loadProState();
  proState.trialStart = Date.now();
  proState.trialUsed = true;
  await saveProState();
  return true;
};

export const purchasePlan = async (planId) => {
  if (!proState) await loadProState();
  proState.isPro = true;
  proState.plan = planId;
  proState.purchaseDate = Date.now();
  await saveProState();
  return true;
};

export const cancelSubscription = async () => {
  if (!proState) await loadProState();
  proState.isPro = false;
  proState.plan = null;
  await saveProState();
};

export const hasUsedTrial = () => {
  return proState?.trialUsed || false;
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
  return proState.planTasks[taskId];
};

export const isTaskCompleted = (taskId) => {
  return proState?.planTasks?.[taskId] || false;
};
