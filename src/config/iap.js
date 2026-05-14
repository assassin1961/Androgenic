import { Platform } from 'react-native';

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

// All product IDs as array (for store queries)
export const ALL_PRODUCT_IDS = Object.values(IAP_PRODUCTS);
export const SUBSCRIPTION_IDS = [IAP_PRODUCTS.WEEKLY, IAP_PRODUCTS.MONTHLY, IAP_PRODUCTS.YEARLY];
export const ONE_TIME_IDS = [IAP_PRODUCTS.LIFETIME];

// Subscription group name (App Store Connect) / Base plan (Google Play)
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
  'pro_guides',
  'statistical_report',
  'demographic_insights',
  'photo_ranking',
];

// Platform-specific subscription management URLs
export const getManageSubscriptionUrl = () => {
  if (Platform.OS === 'ios') {
    return 'https://apps.apple.com/account/subscriptions';
  }
  return 'https://play.google.com/store/account/subscriptions?package=com.androgenic.faceanalysis';
};

// Google Play Billing config
export const GOOGLE_PLAY_CONFIG = {
  // Base plan IDs for Google Play subscriptions (must match Play Console)
  basePlans: {
    weekly: 'weekly-base-plan',
    monthly: 'monthly-base-plan',
    yearly: 'yearly-base-plan',
  },
  // Offer IDs for free trials
  offers: {
    freeTrial: 'free-trial-3-day',
  },
};
