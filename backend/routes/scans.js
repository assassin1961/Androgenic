const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only jpg, png, webp images allowed'));
  },
});

const FREE_SCANS_PER_DAY = 3;
const FREE_HISTORY_LIMIT = 3;
const PRO_HISTORY_LIMIT = 500;

// POST /api/scans — Record a new scan
router.post('/', authenticate, upload.single('image'), (req, res) => {
  try {
    const { scores } = req.body;
    if (!scores) {
      return res.status(400).json({ error: 'Scores are required' });
    }

    const parsedScores = typeof scores === 'string' ? JSON.parse(scores) : scores;

    // Check daily scan limit for free users
    const isPro = checkPro(req.userId);
    if (!isPro) {
      const today = new Date().toISOString().split('T')[0];
      const daily = db.prepare(
        'SELECT scan_count FROM daily_scans WHERE user_id = ? AND scan_date = ?'
      ).get(req.userId, today);

      if (daily && daily.scan_count >= FREE_SCANS_PER_DAY) {
        return res.status(429).json({
          error: 'Daily scan limit reached',
          scansRemaining: 0,
          upgradeRequired: true,
        });
      }

      // Increment or create daily counter
      db.prepare(`
        INSERT INTO daily_scans (user_id, scan_date, scan_count) VALUES (?, ?, 1)
        ON CONFLICT(user_id, scan_date) DO UPDATE SET scan_count = scan_count + 1
      `).run(req.userId, today);
    }

    const imagePath = req.file ? req.file.filename : null;

    const result = db.prepare(
      'INSERT INTO scans (user_id, image_path, scores) VALUES (?, ?, ?)'
    ).run(req.userId, imagePath, JSON.stringify(parsedScores));

    // Enforce history limit for free users
    if (!isPro) {
      const count = db.prepare('SELECT COUNT(*) as count FROM scans WHERE user_id = ?').get(req.userId);
      if (count.count > FREE_HISTORY_LIMIT) {
        db.prepare(`
          DELETE FROM scans WHERE user_id = ? AND id NOT IN (
            SELECT id FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
          )
        `).run(req.userId, req.userId, FREE_HISTORY_LIMIT);
      }
    }

    // Get remaining scans
    const today = new Date().toISOString().split('T')[0];
    const dailyAfter = db.prepare(
      'SELECT scan_count FROM daily_scans WHERE user_id = ? AND scan_date = ?'
    ).get(req.userId, today);

    res.status(201).json({
      id: result.lastInsertRowid,
      scores: parsedScores,
      imagePath,
      scansRemaining: isPro ? Infinity : FREE_SCANS_PER_DAY - (dailyAfter?.scan_count || 0),
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error('Scan create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/scans — Get scan history
router.get('/', authenticate, (req, res) => {
  const isPro = checkPro(req.userId);
  const limit = isPro ? PRO_HISTORY_LIMIT : FREE_HISTORY_LIMIT;

  const scans = db.prepare(
    'SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(req.userId, limit);

  const formatted = scans.map((s) => ({
    id: s.id,
    scores: JSON.parse(s.scores),
    imagePath: s.image_path,
    createdAt: s.created_at,
  }));

  res.json({ scans: formatted, total: scans.length, limit });
});

// GET /api/scans/progress — Get progress data
router.get('/progress', authenticate, (req, res) => {
  const scans = db.prepare(
    'SELECT scores, created_at FROM scans WHERE user_id = ? ORDER BY created_at ASC'
  ).all(req.userId);

  if (scans.length < 2) {
    return res.json({ progress: null, message: 'Need at least 2 scans for progress' });
  }

  const oldest = JSON.parse(scans[0].scores);
  const latest = JSON.parse(scans[scans.length - 1].scores);

  const changes = {};
  for (const key of Object.keys(latest)) {
    if (oldest[key] !== undefined) {
      changes[key] = {
        from: oldest[key],
        to: latest[key],
        change: latest[key] - oldest[key],
      };
    }
  }

  res.json({
    progress: changes,
    totalScans: scans.length,
    firstScanAt: scans[0].created_at,
    lastScanAt: scans[scans.length - 1].created_at,
  });
});

// GET /api/scans/remaining — Get scans remaining today
router.get('/remaining', authenticate, (req, res) => {
  const isPro = checkPro(req.userId);
  if (isPro) {
    return res.json({ remaining: Infinity, isPro: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const daily = db.prepare(
    'SELECT scan_count FROM daily_scans WHERE user_id = ? AND scan_date = ?'
  ).get(req.userId, today);

  const used = daily?.scan_count || 0;
  res.json({ remaining: Math.max(0, FREE_SCANS_PER_DAY - used), used, limit: FREE_SCANS_PER_DAY });
});

// DELETE /api/scans — Clear all history
router.delete('/', authenticate, (req, res) => {
  db.prepare('DELETE FROM scans WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

function checkPro(userId) {
  const sub = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
  ).get(userId);

  if (!sub) return false;
  if (sub.is_lifetime) return true;
  if (sub.expires_at && sub.expires_at < Date.now()) return false;
  return true;
}

module.exports = router;
