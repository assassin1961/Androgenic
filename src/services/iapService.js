import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  getSubscriptions,
  getProducts,
  requestSubscription,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
} from 'react-native-iap';
import { SUBSCRIPTION_IDS, ONE_TIME_IDS, IAP_PRODUCTS } from '../config/iap';

const IAP_CACHE_KEY = 'androgenic_iap_cache';

let purchaseUpdateSub = null;
let purchaseErrorSub = null;
let isConnected = false;
let cachedProducts = {};
let currentPurchaseState = null;
let _onPurchaseSuccess = null;
let _onPurchaseError = null;

// ---- Connection ----

export const initIAP = async () => {
  try {
    await initConnection();
    isConnected = true;

    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }

    purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        await finishTransaction({ purchase, isConsumable: false });

        const planId = productIdToPlanId(purchase.productId);
        currentPurchaseState = {
          isPro: true,
          plan: planId,
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          purchaseTime: purchase.transactionDate,
          isLifetime: purchase.productId === IAP_PRODUCTS.LIFETIME,
        };
        await savePurchaseCache(currentPurchaseState);

        if (_onPurchaseSuccess) {
          _onPurchaseSuccess(currentPurchaseState);
          _onPurchaseSuccess = null;
        }
      }
    });

    purchaseErrorSub = purchaseErrorListener((error) => {
      if (error.code !== 'E_USER_CANCELLED' && _onPurchaseError) {
        _onPurchaseError(error);
      }
      if (error.code === 'E_USER_CANCELLED' && _onPurchaseError) {
        _onPurchaseError({ ...error, cancelled: true });
      }
      _onPurchaseError = null;
    });

    currentPurchaseState = await loadPurchaseCache();
    refreshPurchaseState();

    return true;
  } catch (err) {
    console.warn('IAP init error:', err);
    currentPurchaseState = await loadPurchaseCache();
    return false;
  }
};

export const endIAP = () => {
  if (purchaseUpdateSub) {
    purchaseUpdateSub.remove();
    purchaseUpdateSub = null;
  }
  if (purchaseErrorSub) {
    purchaseErrorSub.remove();
    purchaseErrorSub = null;
  }
  if (isConnected) {
    endConnection();
    isConnected = false;
  }
};

// ---- Product Fetching ----

export const fetchProducts = async () => {
  if (!isConnected) return {};

  try {
    const [subs, products] = await Promise.all([
      getSubscriptions({ skus: SUBSCRIPTION_IDS }),
      getProducts({ skus: ONE_TIME_IDS }),
    ]);

    cachedProducts = {};
    [...subs, ...products].forEach((p) => {
      cachedProducts[p.productId] = p;
    });

    return cachedProducts;
  } catch (err) {
    console.warn('Failed to fetch products:', err);
    return {};
  }
};

export const getLocalizedPrice = (productId) => {
  const product = cachedProducts[productId];
  if (!product) return null;

  if (product.subscriptionOfferDetails?.length > 0) {
    const phases = product.subscriptionOfferDetails[0].pricingPhases?.pricingPhaseList;
    if (phases?.length > 0) {
      const recurring = phases[phases.length - 1];
      return recurring.formattedPrice;
    }
  }

  if (product.oneTimePurchaseOfferDetails) {
    return product.oneTimePurchaseOfferDetails.formattedPrice;
  }

  return null;
};

export const getCachedProducts = () => cachedProducts;

// ---- Purchasing ----

export const purchaseSubscriptionProduct = async (productId, onSuccess, onError) => {
  if (!isConnected) {
    onError?.(new Error('IAP not connected'));
    return;
  }

  _onPurchaseSuccess = onSuccess;
  _onPurchaseError = onError;

  const product = cachedProducts[productId];
  if (!product) {
    onError?.(new Error('Product not found: ' + productId));
    return;
  }

  if (product.subscriptionOfferDetails?.length > 0) {
    const offerToken = product.subscriptionOfferDetails[0].offerToken;
    await requestSubscription({
      sku: productId,
      subscriptionOffers: [{ sku: productId, offerToken }],
    });
  } else {
    await requestPurchase({ skus: [productId] });
  }
};

export const purchaseLifetimeProduct = async (onSuccess, onError) => {
  if (!isConnected) {
    onError?.(new Error('IAP not connected'));
    return;
  }
  _onPurchaseSuccess = onSuccess;
  _onPurchaseError = onError;
  await requestPurchase({ skus: [IAP_PRODUCTS.LIFETIME] });
};

// ---- Restore ----

export const restorePurchases = async () => {
  if (!isConnected) return null;

  const purchases = await getAvailablePurchases();
  if (purchases.length === 0) return null;

  let best = null;
  for (const p of purchases) {
    if (!best || p.transactionDate > best.transactionDate) {
      best = p;
    }
  }

  if (best) {
    const planId = productIdToPlanId(best.productId);
    currentPurchaseState = {
      isPro: true,
      plan: planId,
      productId: best.productId,
      purchaseToken: best.purchaseToken,
      purchaseTime: best.transactionDate,
      isLifetime: best.productId === IAP_PRODUCTS.LIFETIME,
    };
    await savePurchaseCache(currentPurchaseState);
    return currentPurchaseState;
  }

  return null;
};

// ---- State ----

export const refreshPurchaseState = async () => {
  if (!isConnected) return currentPurchaseState;

  try {
    const purchases = await getAvailablePurchases();
    if (purchases.length > 0) {
      let best = null;
      for (const p of purchases) {
        if (!best || p.transactionDate > best.transactionDate) {
          best = p;
        }
      }
      if (best) {
        const planId = productIdToPlanId(best.productId);
        currentPurchaseState = {
          isPro: true,
          plan: planId,
          productId: best.productId,
          purchaseToken: best.purchaseToken,
          purchaseTime: best.transactionDate,
          isLifetime: best.productId === IAP_PRODUCTS.LIFETIME,
        };
        await savePurchaseCache(currentPurchaseState);
        return currentPurchaseState;
      }
    }

    if (currentPurchaseState?.isLifetime) {
      return currentPurchaseState;
    }

    currentPurchaseState = { isPro: false, plan: null };
    await savePurchaseCache(currentPurchaseState);
    return currentPurchaseState;
  } catch (err) {
    console.warn('Failed to refresh purchase state:', err);
    return currentPurchaseState;
  }
};

export const getPurchaseState = () => currentPurchaseState || { isPro: false, plan: null };

// ---- Cache ----

const savePurchaseCache = async (state) => {
  try {
    await AsyncStorage.setItem(IAP_CACHE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save IAP cache:', e);
  }
};

const loadPurchaseCache = async () => {
  try {
    const data = await AsyncStorage.getItem(IAP_CACHE_KEY);
    return data ? JSON.parse(data) : { isPro: false, plan: null };
  } catch {
    return { isPro: false, plan: null };
  }
};

// ---- Utilities ----

const productIdToPlanId = (productId) => {
  switch (productId) {
    case IAP_PRODUCTS.WEEKLY: return 'weekly';
    case IAP_PRODUCTS.MONTHLY: return 'monthly';
    case IAP_PRODUCTS.YEARLY: return 'yearly';
    case IAP_PRODUCTS.LIFETIME: return 'lifetime';
    default: return null;
  }
};

export const planIdToProductId = (planId) => {
  switch (planId) {
    case 'weekly': return IAP_PRODUCTS.WEEKLY;
    case 'monthly': return IAP_PRODUCTS.MONTHLY;
    case 'yearly': return IAP_PRODUCTS.YEARLY;
    case 'lifetime': return IAP_PRODUCTS.LIFETIME;
    default: return null;
  }
};
