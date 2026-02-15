// In-App Purchase Product IDs
// These must match the products configured in App Store Connect and Google Play Console

export const IAP_PRODUCTS = {
  // Auto-renewable subscriptions
  WEEKLY: 'com.androgenic.faceanalysis.pro.weekly',
  MONTHLY: 'com.androgenic.faceanalysis.pro.monthly',
  YEARLY: 'com.androgenic.faceanalysis.pro.yearly',

  // Non-consumable (lifetime)
  LIFETIME: 'com.androgenic.faceanalysis.pro.lifetime',
};

// Subscription group name (App Store Connect)
export const SUBSCRIPTION_GROUP = 'Androgenic PRO';

// Product details for display (fallback if store fetch fails)
export const PRODUCT_DETAILS = {
  [IAP_PRODUCTS.WEEKLY]: {
    title: 'Weekly',
    price: '$4.99',
    period: '/week',
    trialDays: 3,
  },
  [IAP_PRODUCTS.MONTHLY]: {
    title: 'Monthly',
    price: '$9.99',
    period: '/month',
    trialDays: 3,
    popular: true,
  },
  [IAP_PRODUCTS.YEARLY]: {
    title: 'Yearly',
    price: '$39.99',
    period: '/year',
    trialDays: 3,
    savings: 'Save 85%',
  },
  [IAP_PRODUCTS.LIFETIME]: {
    title: 'Lifetime',
    price: '$79.99',
    period: 'one-time',
    savings: 'Best Value',
  },
};

// Entitlements granted by PRO subscription
export const PRO_ENTITLEMENTS = [
  'unlimited_scans',
  'all_categories',
  'celebrity_matching',
  'facial_ratios',
  'progress_tracking',
  'improvement_plan',
  'ai_recommendations',
  'glow_up_report',
  'transformations',
  'unlimited_tips',
  'unlimited_history',
];
