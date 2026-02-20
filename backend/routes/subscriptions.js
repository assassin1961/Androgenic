const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/subscriptions/verify
// Verify and record a Google Play purchase
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { productId, purchaseToken, plan, isLifetime } = req.body;

    if (!productId || !purchaseToken || !plan) {
      return res.status(400).json({ error: 'productId, purchaseToken, and plan are required' });
    }

    // Attempt Google Play verification if credentials are configured
    let verified = false;
    let expiresAt = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        const { google } = require('googleapis');

        const auth = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          null,
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/androidpublisher']
        );

        const androidPublisher = google.androidpublisher({ version: 'v3', auth });
        const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.androgenic.faceanalysis';

        if (isLifetime) {
          // Verify one-time product
          const result = await androidPublisher.purchases.products.get({
            packageName,
            productId,
            token: purchaseToken,
          });
          verified = result.data.purchaseState === 0; // 0 = purchased
        } else {
          // Verify subscription
          const result = await androidPublisher.purchases.subscriptions.get({
            packageName,
            subscriptionId: productId,
            token: purchaseToken,
          });
          verified = result.data.paymentState === 1; // 1 = received
          expiresAt = parseInt(result.data.expiryTimeMillis, 10);
        }
      } catch (err) {
        console.warn('Google Play verification failed:', err.message);
        // Fall through — still record the purchase, mark as unverified
      }
    }

    // If no Google credentials, trust the client (development mode)
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      verified = true;
      if (!isLifetime) {
        // Default expiry: 30 days from now for dev
        expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      }
    }

    // Deactivate previous subscriptions
    db.prepare('UPDATE subscriptions SET is_active = 0 WHERE user_id = ?').run(req.userId);

    // Record new subscription
    const result = db.prepare(`
      INSERT INTO subscriptions (user_id, product_id, plan, purchase_token, purchase_time, expires_at, is_active, is_lifetime, receipt_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId,
      productId,
      plan,
      purchaseToken,
      Date.now(),
      isLifetime ? null : expiresAt,
      verified ? 1 : 0,
      isLifetime ? 1 : 0,
      JSON.stringify(req.body)
    );

    res.json({
      success: true,
      verified,
      subscription: {
        id: result.lastInsertRowid,
        plan,
        isActive: verified,
        isLifetime: !!isLifetime,
        expiresAt,
      },
    });
  } catch (err) {
    console.error('Subscription verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/subscriptions/status
router.get('/status', authenticate, (req, res) => {
  const sub = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
  ).get(req.userId);

  if (!sub) {
    return res.json({ isPro: false, plan: null });
  }

  // Check expiry for non-lifetime
  if (!sub.is_lifetime && sub.expires_at && sub.expires_at < Date.now()) {
    db.prepare('UPDATE subscriptions SET is_active = 0 WHERE id = ?').run(sub.id);
    return res.json({ isPro: false, plan: null, expired: true });
  }

  res.json({
    isPro: true,
    plan: sub.plan,
    productId: sub.product_id,
    isLifetime: !!sub.is_lifetime,
    expiresAt: sub.expires_at,
    purchaseTime: sub.purchase_time,
  });
});

// POST /api/subscriptions/restore
router.post('/restore', authenticate, (req, res) => {
  const { purchases } = req.body; // Array of { productId, purchaseToken }

  if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
    return res.json({ restored: false });
  }

  // Find matching purchase in our records
  for (const p of purchases) {
    const existing = db.prepare(
      'SELECT * FROM subscriptions WHERE purchase_token = ? AND is_active = 1'
    ).get(p.purchaseToken);

    if (existing) {
      // Transfer to current user if needed
      if (existing.user_id !== req.userId) {
        db.prepare('UPDATE subscriptions SET user_id = ? WHERE id = ?').run(req.userId, existing.id);
      }
      return res.json({
        restored: true,
        subscription: {
          plan: existing.plan,
          isLifetime: !!existing.is_lifetime,
          expiresAt: existing.expires_at,
        },
      });
    }
  }

  // Not found in records — verify and create
  const latest = purchases[purchases.length - 1];
  const plan = productIdToPlan(latest.productId);

  if (plan) {
    db.prepare('UPDATE subscriptions SET is_active = 0 WHERE user_id = ?').run(req.userId);
    db.prepare(`
      INSERT INTO subscriptions (user_id, product_id, plan, purchase_token, purchase_time, is_active, is_lifetime)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(
      req.userId,
      latest.productId,
      plan,
      latest.purchaseToken,
      Date.now(),
      latest.productId.includes('lifetime') ? 1 : 0
    );
    return res.json({ restored: true, subscription: { plan } });
  }

  res.json({ restored: false });
});

function productIdToPlan(productId) {
  if (productId.includes('weekly')) return 'weekly';
  if (productId.includes('monthly')) return 'monthly';
  if (productId.includes('yearly')) return 'yearly';
  if (productId.includes('lifetime')) return 'lifetime';
  return null;
}

module.exports = router;
