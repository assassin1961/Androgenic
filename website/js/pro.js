/**
 * Androgenic - Pro Subscription & Feature Gating System
 * Manages free trial, subscription tiers, and feature access
 */

// ============================================
// SUBSCRIPTION CONSTANTS
// ============================================

const PRO_CONFIG = {
    FREE_SCANS_LIMIT: 3,
    FREE_HISTORY_LIMIT: 3,
    FREE_TIPS_PER_CATEGORY: 1,
    TRIAL_DURATION_DAYS: 3,
    FREE_CATEGORIES: ['masculinity', 'jawline', 'eyes'],
    PRO_CATEGORIES: ['cheekbones', 'hair', 'skin', 'symmetry'],
    ALL_CATEGORIES: ['masculinity', 'jawline', 'eyes', 'cheekbones', 'hair', 'skin', 'symmetry'],
    PLANS: {
        weekly: {
            id: 'weekly',
            name: 'Weekly',
            price: '$4.99',
            priceNum: 4.99,
            period: 'week',
            badge: '',
            savings: null
        },
        monthly: {
            id: 'monthly',
            name: 'Monthly',
            price: '$9.99',
            priceNum: 9.99,
            period: 'month',
            badge: 'MOST POPULAR',
            savings: '50% off weekly'
        },
        yearly: {
            id: 'yearly',
            name: 'Yearly',
            price: '$39.99',
            priceNum: 39.99,
            period: 'year',
            badge: 'BEST VALUE',
            savings: '85% off weekly'
        },
        lifetime: {
            id: 'lifetime',
            name: 'Lifetime',
            price: '$79.99',
            priceNum: 79.99,
            period: 'forever',
            badge: 'ONE TIME',
            savings: 'Pay once, own forever'
        }
    }
};

// ============================================
// SUBSCRIPTION STATE
// ============================================

function getProState() {
    try {
        const stored = localStorage.getItem('androgenic_pro');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
        isPro: false,
        plan: null,
        trialStarted: null,
        trialUsed: false,
        purchaseDate: null,
        scansUsed: 0,
        lastScanReset: new Date().toDateString()
    };
}

function saveProState(state) {
    try {
        localStorage.setItem('androgenic_pro', JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save pro state');
    }
}

// ============================================
// ACCESS CONTROL
// ============================================

function isPro() {
    const state = getProState();
    if (state.isPro) return true;
    if (state.trialStarted && !isTrialExpired()) return true;
    return false;
}

function isTrialActive() {
    const state = getProState();
    if (!state.trialStarted) return false;
    return !isTrialExpired();
}

function isTrialExpired() {
    const state = getProState();
    if (!state.trialStarted) return true;
    const started = new Date(state.trialStarted);
    const now = new Date();
    const diffDays = (now - started) / (1000 * 60 * 60 * 24);
    return diffDays >= PRO_CONFIG.TRIAL_DURATION_DAYS;
}

function getTrialDaysRemaining() {
    const state = getProState();
    if (!state.trialStarted) return 0;
    const started = new Date(state.trialStarted);
    const now = new Date();
    const diffDays = (now - started) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(PRO_CONFIG.TRIAL_DURATION_DAYS - diffDays));
}

function getScansRemaining() {
    const state = getProState();
    // Reset daily counter
    const today = new Date().toDateString();
    if (state.lastScanReset !== today) {
        state.scansUsed = 0;
        state.lastScanReset = today;
        saveProState(state);
    }
    if (isPro()) return Infinity;
    return Math.max(0, PRO_CONFIG.FREE_SCANS_LIMIT - state.scansUsed);
}

function useScan() {
    const state = getProState();
    const today = new Date().toDateString();
    if (state.lastScanReset !== today) {
        state.scansUsed = 0;
        state.lastScanReset = today;
    }
    state.scansUsed++;
    saveProState(state);
}

function canAccessCategory(categoryKey) {
    if (isPro()) return true;
    return PRO_CONFIG.FREE_CATEGORIES.includes(categoryKey);
}

function canAccessFeature(featureName) {
    if (isPro()) return true;
    // Free features
    const freeFeatures = ['basic_analysis', 'basic_share'];
    return freeFeatures.includes(featureName);
}

function getMaxTipsForCategory(categoryKey) {
    if (isPro()) return Infinity;
    if (!PRO_CONFIG.FREE_CATEGORIES.includes(categoryKey)) return 0;
    return PRO_CONFIG.FREE_TIPS_PER_CATEGORY;
}

function getMaxHistory() {
    if (isPro()) return 50;
    return PRO_CONFIG.FREE_HISTORY_LIMIT;
}

// ============================================
// TRIAL MANAGEMENT
// ============================================

function startFreeTrial() {
    const state = getProState();
    if (state.trialUsed) return false;
    state.trialStarted = new Date().toISOString();
    state.trialUsed = true;
    saveProState(state);
    return true;
}

function hasUsedTrial() {
    return getProState().trialUsed;
}

// ============================================
// PURCHASE (simulated client-side for demo)
// ============================================

function purchasePlan(planId) {
    const plan = PRO_CONFIG.PLANS[planId];
    if (!plan) return false;

    const state = getProState();
    state.isPro = true;
    state.plan = planId;
    state.purchaseDate = new Date().toISOString();
    saveProState(state);
    return true;
}

function restorePurchase() {
    const state = getProState();
    if (state.purchaseDate) {
        state.isPro = true;
        saveProState(state);
        return true;
    }
    return false;
}

function cancelSubscription() {
    const state = getProState();
    state.isPro = false;
    state.plan = null;
    saveProState(state);
}

function getCurrentPlan() {
    const state = getProState();
    if (!state.isPro || !state.plan) return null;
    return PRO_CONFIG.PLANS[state.plan] || null;
}

// ============================================
// CELEBRITY MATCH DATABASE (PRO FEATURE)
// ============================================

const CELEBRITY_MATCHES = [
    { name: 'Henry Cavill', score: 9.5, traits: 'Strong jawline, hunter eyes, masculine structure', img: 'HC' },
    { name: 'Brad Pitt', score: 9.3, traits: 'Perfect symmetry, balanced features, strong cheekbones', img: 'BP' },
    { name: 'Chris Hemsworth', score: 9.4, traits: 'Wide jaw, strong brow, masculine proportions', img: 'CH' },
    { name: 'David Gandy', score: 9.2, traits: 'Model proportions, defined jawline, sharp features', img: 'DG' },
    { name: 'Ian Somerhalder', score: 8.8, traits: 'Striking eyes, balanced midface, angular jaw', img: 'IS' },
    { name: 'Matt Bomer', score: 9.0, traits: 'High symmetry, strong eye area, clean features', img: 'MB' },
    { name: 'Zayn Malik', score: 8.5, traits: 'Sharp cheekbones, defined jawline, good eye area', img: 'ZM' },
    { name: 'Timothee Chalamet', score: 8.0, traits: 'Harmonious features, good bone structure, unique appeal', img: 'TC' },
    { name: 'Chris Evans', score: 9.1, traits: 'Broad jaw, masculine proportions, wide face', img: 'CE' },
    { name: 'Tom Hardy', score: 8.7, traits: 'Strong masculine features, thick neck, prominent brow', img: 'TH' },
    { name: 'Idris Elba', score: 8.9, traits: 'Balanced proportions, strong jaw, masculine frame', img: 'IE' },
    { name: 'Jason Momoa', score: 8.6, traits: 'Wide structure, strong jawline, dominant features', img: 'JM' }
];

function getCelebrityMatch(scores) {
    // Find closest match based on score similarity
    const userOverall = scores.overall;
    let bestMatch = CELEBRITY_MATCHES[0];
    let bestDiff = Infinity;

    CELEBRITY_MATCHES.forEach(celeb => {
        const diff = Math.abs(celeb.score - userOverall);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestMatch = celeb;
        }
    });

    // Also get a secondary match based on dominant trait
    const dominantTrait = getDominantTrait(scores);
    let traitMatch = CELEBRITY_MATCHES.find(c =>
        c.traits.toLowerCase().includes(dominantTrait)
    ) || bestMatch;

    return {
        primary: bestMatch,
        secondary: traitMatch === bestMatch ? CELEBRITY_MATCHES[Math.floor(Math.random() * CELEBRITY_MATCHES.length)] : traitMatch,
        matchPercentage: Math.max(60, Math.round(100 - bestDiff * 15))
    };
}

function getDominantTrait(scores) {
    const traits = {
        jawline: scores.jawline,
        eyes: scores.eyes,
        cheekbones: scores.cheekbones,
        masculinity: scores.masculinity
    };
    const max = Object.entries(traits).reduce((a, b) => a[1] > b[1] ? a : b);
    const traitMap = {
        jawline: 'jaw',
        eyes: 'eye',
        cheekbones: 'cheekbone',
        masculinity: 'masculine'
    };
    return traitMap[max[0]] || 'jaw';
}

// ============================================
// FACIAL RATIOS (PRO FEATURE)
// ============================================

const GOLDEN_RATIO = 1.618;

const FACIAL_RATIOS = {
    goldenRatio: {
        name: 'Golden Ratio',
        ideal: GOLDEN_RATIO,
        description: 'The divine proportion found in the most attractive faces',
        emoji: '🏛️'
    },
    faceThirds: {
        name: 'Face Thirds',
        ideal: 1.0,
        description: 'Balance between upper, middle, and lower face thirds',
        emoji: '📏'
    },
    facialIndex: {
        name: 'Facial Index',
        ideal: 1.35,
        description: 'Face height to width ratio (mesoprosopic ideal)',
        emoji: '📐'
    },
    jawFaceRatio: {
        name: 'Jaw-Face Ratio',
        ideal: 0.78,
        description: 'Jaw width relative to total face width',
        emoji: '🦴'
    },
    eyeSpacing: {
        name: 'Eye Spacing',
        ideal: 0.44,
        description: 'Interpupillary distance to face width ratio',
        emoji: '👁️'
    },
    noseWidth: {
        name: 'Nose Proportion',
        ideal: 0.26,
        description: 'Nose width to face width ratio',
        emoji: '👃'
    },
    lipRatio: {
        name: 'Lip Ratio',
        ideal: 1.6,
        description: 'Lower lip to upper lip volume ratio',
        emoji: '👄'
    },
    fWHR: {
        name: 'fWHR',
        ideal: 1.9,
        description: 'Facial width-to-height ratio (masculinity indicator)',
        emoji: '💪'
    }
};

function computeFacialRatios(scores) {
    // Generate realistic ratios based on scores
    const ratios = {};
    const overallQuality = scores.overall / 10;

    for (const [key, config] of Object.entries(FACIAL_RATIOS)) {
        const deviation = (1 - overallQuality) * 0.3;
        const noise = (Math.random() - 0.5) * deviation;
        const actual = config.ideal * (1 + noise);
        const closeness = 1 - Math.abs(actual - config.ideal) / config.ideal;
        const rating = Math.max(1, Math.min(10, Math.round(closeness * 10)));

        ratios[key] = {
            ...config,
            actual: parseFloat(actual.toFixed(3)),
            rating: rating,
            closeness: Math.round(closeness * 100)
        };
    }

    return ratios;
}

// ============================================
// PROGRESS TRACKING (PRO FEATURE)
// ============================================

function getProgressData() {
    const history = getHistory();
    if (history.length < 2) return null;

    const entries = history.slice(0, 10).reverse();
    const categories = PRO_CONFIG.ALL_CATEGORIES;

    const progress = {
        entries: entries.map(e => ({
            date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            overall: e.scores.overall,
            scores: e.scores
        })),
        trends: {}
    };

    // Calculate trends
    const latest = entries[entries.length - 1].scores;
    const earliest = entries[0].scores;

    categories.forEach(cat => {
        const diff = (latest[cat] || 0) - (earliest[cat] || 0);
        progress.trends[cat] = {
            change: Math.round(diff),
            direction: diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable'
        };
    });

    const overallDiff = latest.overall - earliest.overall;
    progress.trends.overall = {
        change: parseFloat(overallDiff.toFixed(1)),
        direction: overallDiff > 0.2 ? 'up' : overallDiff < -0.2 ? 'down' : 'stable'
    };

    return progress;
}

// ============================================
// IMPROVEMENT PLAN (PRO FEATURE)
// ============================================

function generateImprovementPlan(scores) {
    const categories = [
        { key: 'masculinity', emoji: '💪', name: 'Masculinity' },
        { key: 'jawline', emoji: '🦴', name: 'Jawline' },
        { key: 'eyes', emoji: '👀', name: 'Eyes' },
        { key: 'cheekbones', emoji: '🧬', name: 'Cheekbones' },
        { key: 'hair', emoji: '💇', name: 'Hair' },
        { key: 'skin', emoji: '✨', name: 'Skin' },
        { key: 'symmetry', emoji: '📐', name: 'Symmetry' }
    ];

    // Sort by lowest score first
    const sorted = categories
        .map(c => ({ ...c, score: scores[c.key] }))
        .sort((a, b) => a.score - b.score);

    const plan = {
        priority: sorted.slice(0, 3).map(c => c.key),
        phases: [],
        estimatedTimeWeeks: 12,
        weeklyChecklist: []
    };

    // Phase 1: Quick wins (Week 1-2)
    plan.phases.push({
        name: 'Quick Wins',
        weeks: '1-2',
        tasks: [
            { task: 'Start basic skincare routine (cleanser + moisturizer + SPF)', category: 'skin', done: false },
            { task: 'Begin mewing - proper tongue posture 24/7', category: 'jawline', done: false },
            { task: 'Fix sleep schedule to 7-9 hours per night', category: 'eyes', done: false },
            { task: 'Reduce sodium intake to minimize facial bloat', category: 'jawline', done: false },
            { task: 'Get a haircut that suits your face shape', category: 'hair', done: false }
        ]
    });

    // Phase 2: Building habits (Week 3-6)
    plan.phases.push({
        name: 'Building Habits',
        weeks: '3-6',
        tasks: [
            { task: 'Start chewing falim gum 30 min daily for jaw definition', category: 'jawline', done: false },
            { task: 'Add retinol/tretinoin to nighttime skincare', category: 'skin', done: false },
            { task: 'Begin resistance training 3-4x per week', category: 'masculinity', done: false },
            { task: 'Practice sleeping on your back for symmetry', category: 'symmetry', done: false },
            { task: 'Optimize protein intake (1g per lb bodyweight)', category: 'masculinity', done: false },
            { task: 'Start using quality hair products', category: 'hair', done: false }
        ]
    });

    // Phase 3: Advanced (Week 7-12)
    plan.phases.push({
        name: 'Advanced Optimization',
        weeks: '7-12',
        tasks: [
            { task: 'Target 10-15% body fat for maximum facial definition', category: 'jawline', done: false },
            { task: 'Add neck training 3x/week for masculine frame', category: 'masculinity', done: false },
            { task: 'Upgrade to mastic gum for advanced jaw training', category: 'jawline', done: false },
            { task: 'Add vitamin C serum + niacinamide to skincare', category: 'skin', done: false },
            { task: 'Fine-tune eyebrow grooming', category: 'eyes', done: false },
            { task: 'Re-analyze face to track progress', category: 'overall', done: false }
        ]
    });

    // Weekly checklist
    plan.weeklyChecklist = [
        { task: 'Mew consistently throughout the day', emoji: '👅' },
        { task: 'Complete skincare AM + PM routine', emoji: '🧴' },
        { task: 'Hit the gym 3-4 sessions', emoji: '🏋️' },
        { task: 'Chew gum for jaw development', emoji: '🦴' },
        { task: 'Get 7-9 hours of quality sleep', emoji: '😴' },
        { task: 'Drink 3+ liters of water', emoji: '💧' },
        { task: 'Eat high protein, low sodium', emoji: '🥩' }
    ];

    return plan;
}

// ============================================
// EXPORT PRO HELPERS
// ============================================

function getProBadgeHTML() {
    return '<span class="pro-badge">PRO</span>';
}

function getLockIconHTML() {
    return `<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`;
}
