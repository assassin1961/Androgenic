const noop = async () => {};

export const initIAP = noop;
export const endIAP = () => {};
export const fetchProducts = async () => ({});
export const getLocalizedPrice = () => null;
export const getCachedProducts = () => ({});
export const purchaseSubscriptionProduct = noop;
export const purchaseLifetimeProduct = noop;
export const restorePurchases = async () => ({ isPro: false, plan: null });
export const refreshPurchaseState = async () => ({ isPro: false, plan: null });
export const getPurchaseState = () => ({ isPro: false, plan: null });
export const planIdToProductId = () => null;
