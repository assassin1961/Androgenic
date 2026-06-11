const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── Photo uploads (shared multer config with scans) ──────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname) || '.jpg'}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only jpg, png, webp images allowed'), ok);
  },
});

const photosFor = (userId) =>
  db.prepare('SELECT id, url, position FROM dating_photos WHERE user_id = ? ORDER BY position ASC, id ASC').all(userId);

const FREE_LIKES_PER_WINDOW = 5;
const LIKE_WINDOW_MS = 12 * 3600000;
const FREE_INSTANT_CHATS_PER_DAY = 1;

// ── Helpers ──────────────────────────────────────────────────────────

const parseProfile = (row) => row && ({
  id: row.user_id,
  name: row.name,
  age: row.age,
  gender: row.gender,
  city: row.city,
  distance: row.distance,
  job: row.job,
  bio: row.bio,
  height: row.height,
  intention: row.intention,
  sect: row.sect,
  prayerLevel: row.prayer_level,
  ethnicity: row.ethnicity,
  halalDiet: row.halal_diet,
  interests: JSON.parse(row.interests || '[]'),
  values: JSON.parse(row.values || '[]'),
  languages: JSON.parse(row.languages || '["English"]'),
  prompts: JSON.parse(row.prompts || '[]'),
  waliEnabled: !!row.wali_enabled,
  photoPrivacy: !!row.photo_privacy,
  verified: !!row.selfie_verified,
  gold: !!row.is_gold,
  online: !!row.online,
  photos: photosFor(row.user_id).map((p) => p.url),
});

const getProfile = (userId) =>
  parseProfile(db.prepare('SELECT * FROM dating_profiles WHERE user_id = ?').get(userId));

// Server-side butterfly scoring — mirror of src/muzz/butterfly.js
function scoreMatch(me, person) {
  let score = 50;
  const reasons = [];

  const sharedInterests = (me.interests || []).filter((i) => (person.interests || []).includes(i));
  if (sharedInterests.length) {
    score += sharedInterests.length * 7;
    reasons.push(`You both love ${sharedInterests.slice(0, 2).join(' & ').toLowerCase()}`);
  }
  const sharedValues = (me.values || []).filter((v) => (person.values || []).includes(v));
  if (sharedValues.length) {
    score += sharedValues.length * 6;
    reasons.push(`Aligned on being ${sharedValues[0].toLowerCase()}`);
  }
  if (me.intention && person.intention === me.intention) {
    score += 12;
    reasons.push(`Both here for ${person.intention.toLowerCase()}`);
  } else if (
    (me.intention === 'Marriage' && person.intention === 'Long-term') ||
    (me.intention === 'Long-term' && person.intention === 'Marriage')
  ) {
    score += 5;
  }
  if (me.sect && person.sect && me.sect !== 'Prefer not to say' && person.sect === me.sect) {
    score += 8;
    reasons.push(`Both ${person.sect}`);
  }
  const levels = ['Never prays', 'Sometimes prays', 'Usually prays', 'Always prays'];
  const a = levels.indexOf(me.prayerLevel), b = levels.indexOf(person.prayerLevel);
  if (a >= 0 && b >= 0) {
    const gap = Math.abs(a - b);
    if (gap === 0) { score += 7; reasons.push(`Matched in practice — ${person.prayerLevel.toLowerCase()}`); }
    else if (gap === 1) score += 3;
    else score -= 4;
  }
  if (me.halalDiet === 'Always halal' && person.halalDiet === 'Always halal') score += 3;
  if (person.distance <= 5) { score += 8; reasons.push(`Only ${person.distance} miles away`); }
  else if (person.distance <= 12) { score += 4; reasons.push(`Close by in ${person.city}`); }
  else score -= 3;
  if (person.verified) score += 4;
  const sharedLang = (me.languages || []).filter((l) => (person.languages || []).includes(l) && l !== 'English');
  if (sharedLang.length) { score += 5; reasons.push(`You both speak ${sharedLang[0]}`); }

  let seed = 0;
  const k = String(me.id) + ':' + String(person.id);
  for (let i = 0; i < k.length; i++) seed = (seed * 31 + k.charCodeAt(i)) >>> 0;
  score += (seed % 11) - 3;

  score = Math.max(2, Math.min(99, Math.round(score)));
  if (!reasons.length) reasons.push(`A fresh face the butterfly thinks you'll click with`);
  return { score, reasons };
}

const getLimits = (userId) => {
  let row = db.prepare('SELECT * FROM dating_limits WHERE user_id = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO dating_limits (user_id) VALUES (?)').run(userId);
    row = db.prepare('SELECT * FROM dating_limits WHERE user_id = ?').get(userId);
  }
  return row;
};

const likesRemaining = (userId, isGold) => {
  if (isGold) return Infinity;
  const lim = getLimits(userId);
  if (Date.now() - lim.like_window_start > LIKE_WINDOW_MS) return FREE_LIKES_PER_WINDOW;
  return Math.max(0, FREE_LIKES_PER_WINDOW - lim.likes_in_window);
};

const findMatch = (a, b) =>
  db.prepare(
    'SELECT * FROM dating_matches WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)'
  ).get(a, b, b, a);

const createMatch = (a, b, source = 'like') => {
  const existing = findMatch(a, b);
  if (existing) return existing;
  const r = db.prepare('INSERT INTO dating_matches (user_a, user_b, source) VALUES (?, ?, ?)').run(a, b, source);
  return db.prepare('SELECT * FROM dating_matches WHERE id = ?').get(r.lastInsertRowid);
};

// ── Profile ──────────────────────────────────────────────────────────

// GET /api/dating/profile — my dating profile
router.get('/profile', authenticate, (req, res) => {
  try {
    const profile = getProfile(req.userId);
    if (!profile) return res.status(404).json({ error: 'No dating profile yet' });
    res.json({ profile, likesRemaining: likesRemaining(req.userId, profile.gold) === Infinity ? -1 : likesRemaining(req.userId, profile.gold) });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/dating/profile — create or update my dating profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const p = req.body || {};
    if (!p.name || !p.age || !p.gender) {
      return res.status(400).json({ error: 'name, age and gender are required' });
    }
    db.prepare(`
      INSERT INTO dating_profiles
        (user_id, name, age, gender, city, distance, job, bio, height, intention,
         sect, prayer_level, ethnicity, halal_diet, interests, "values", languages,
         prompts, wali_enabled, photo_privacy, selfie_verified, is_gold, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name=excluded.name, age=excluded.age, gender=excluded.gender,
        city=excluded.city, distance=excluded.distance, job=excluded.job,
        bio=excluded.bio, height=excluded.height, intention=excluded.intention,
        sect=excluded.sect, prayer_level=excluded.prayer_level,
        ethnicity=excluded.ethnicity, halal_diet=excluded.halal_diet,
        interests=excluded.interests, "values"=excluded."values",
        languages=excluded.languages, prompts=excluded.prompts,
        wali_enabled=excluded.wali_enabled, photo_privacy=excluded.photo_privacy,
        selfie_verified=excluded.selfie_verified, is_gold=excluded.is_gold,
        updated_at=excluded.updated_at
    `).run(
      req.userId, p.name, p.age, p.gender, p.city || '', p.distance || 0,
      p.job || '', p.bio || '', p.height || '', p.intention || 'Marriage',
      p.sect || 'Prefer not to say', p.prayerLevel || 'Prefer not to say',
      p.ethnicity || 'Other', p.halalDiet || 'Mostly halal',
      JSON.stringify(p.interests || []), JSON.stringify(p.values || []),
      JSON.stringify(p.languages || ['English']), JSON.stringify(p.prompts || []),
      p.waliEnabled ? 1 : 0, p.photoPrivacy ? 1 : 0,
      p.selfieVerified ? 1 : 0, p.gold ? 1 : 0, Date.now()
    );
    res.json({ profile: getProfile(req.userId) });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Discovery & butterfly ────────────────────────────────────────────

// GET /api/dating/discover — candidates ranked by butterfly compatibility
router.get('/discover', authenticate, (req, res) => {
  try {
    const me = getProfile(req.userId);
    if (!me) return res.status(400).json({ error: 'Create your profile first' });
    const rows = db.prepare(`
      SELECT p.* FROM dating_profiles p
      WHERE p.user_id != ?
        AND p.gender != ?
        AND p.user_id NOT IN (SELECT target_id FROM dating_swipes WHERE user_id = ?)
        AND p.user_id NOT IN (SELECT blocked_id FROM dating_blocks WHERE user_id = ?)
    `).all(req.userId, me.gender, req.userId, req.userId);
    const ranked = rows
      .map(parseProfile)
      .map((person) => ({ person, ...scoreMatch(me, person) }))
      .sort((x, y) => y.score - x.score);
    const lim = getLimits(req.userId);
    res.json({
      candidates: ranked,
      likesRemaining: me.gold ? -1 : likesRemaining(req.userId, false),
      boostActive: lim.boost_until > Date.now(),
      boostUntil: lim.boost_until,
      superLikes: me.gold ? -1 : lim.super_likes,
    });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dating/butterfly/pick — the butterfly's current top pick
router.get('/butterfly/pick', authenticate, (req, res) => {
  try {
    const me = getProfile(req.userId);
    if (!me) return res.status(400).json({ error: 'Create your profile first' });
    const rows = db.prepare(`
      SELECT p.* FROM dating_profiles p
      WHERE p.user_id != ? AND p.gender != ?
        AND p.user_id NOT IN (SELECT target_id FROM dating_swipes WHERE user_id = ?)
    `).all(req.userId, me.gender, req.userId);
    const ranked = rows.map(parseProfile).map((person) => ({ person, ...scoreMatch(me, person) }))
      .sort((x, y) => y.score - x.score);
    if (!ranked.length) return res.json({ pick: null });
    res.json({ pick: ranked[0] });
  } catch (err) {
    console.error('Butterfly pick error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/swipe { targetId, action } → { match, matchId? }
router.post('/swipe', authenticate, (req, res) => {
  try {
    const { targetId, action } = req.body || {};
    if (!targetId || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ error: 'targetId and action (like|pass) required' });
    }
    const me = getProfile(req.userId);
    if (!me) return res.status(400).json({ error: 'Create your profile first' });

    if (action === 'like') {
      const remaining = likesRemaining(req.userId, me.gold);
      if (remaining <= 0) return res.status(429).json({ error: 'Like limit reached', upgradeRequired: true });
      if (!me.gold) {
        const lim = getLimits(req.userId);
        const expired = Date.now() - lim.like_window_start > LIKE_WINDOW_MS;
        db.prepare(
          'UPDATE dating_limits SET like_window_start = ?, likes_in_window = ? WHERE user_id = ?'
        ).run(expired ? Date.now() : lim.like_window_start, expired ? 1 : lim.likes_in_window + 1, req.userId);
      }
    }

    db.prepare(`
      INSERT INTO dating_swipes (user_id, target_id, action) VALUES (?, ?, ?)
      ON CONFLICT(user_id, target_id) DO UPDATE SET action = excluded.action, created_at = excluded.created_at
    `).run(req.userId, targetId, action);

    let match = null;
    if (action === 'like') {
      const theirLike = db.prepare(
        "SELECT 1 FROM dating_swipes WHERE user_id = ? AND target_id = ? AND action = 'like'"
      ).get(targetId, req.userId);
      const targetIsBot = db.prepare('SELECT is_bot FROM dating_profiles WHERE user_id = ?').get(targetId);
      // Bots always like back so the demo flow works end-to-end
      if (theirLike || (targetIsBot && targetIsBot.is_bot)) {
        match = createMatch(req.userId, targetId, 'like');
      }
    }
    res.json({ match: !!match, matchId: match ? match.id : null });
  } catch (err) {
    console.error('Swipe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/instant-chat { targetId } → opens a chat without matching
router.post('/instant-chat', authenticate, (req, res) => {
  try {
    const { targetId } = req.body || {};
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    const me = getProfile(req.userId);
    if (!me) return res.status(400).json({ error: 'Create your profile first' });

    const today = new Date().toDateString();
    const lim = getLimits(req.userId);
    const used = lim.instant_chat_day === today ? lim.instant_chats_used : 0;
    if (!me.gold && used >= FREE_INSTANT_CHATS_PER_DAY) {
      return res.status(429).json({ error: 'Daily Instant Chat used', upgradeRequired: true });
    }
    db.prepare(
      'UPDATE dating_limits SET instant_chat_day = ?, instant_chats_used = ? WHERE user_id = ?'
    ).run(today, used + 1, req.userId);
    const match = createMatch(req.userId, targetId, 'instant');
    res.json({ match: true, matchId: match.id });
  } catch (err) {
    console.error('Instant chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dating/likes-you — people who liked me (Gold sees them; free gets count)
router.get('/likes-you', authenticate, (req, res) => {
  try {
    const me = getProfile(req.userId);
    const rows = db.prepare(`
      SELECT p.* FROM dating_swipes s
      JOIN dating_profiles p ON p.user_id = s.user_id
      WHERE s.target_id = ? AND s.action = 'like'
        AND s.user_id NOT IN (
          SELECT CASE WHEN user_a = ? THEN user_b ELSE user_a END
          FROM dating_matches WHERE user_a = ? OR user_b = ?
        )
    `).all(req.userId, req.userId, req.userId, req.userId);
    const people = rows.map(parseProfile);
    res.json({
      count: people.length,
      people: me && me.gold ? people : people.map((p) => ({ id: p.id, name: p.name, verified: p.verified })),
    });
  } catch (err) {
    console.error('Likes-you error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Matches & chat ───────────────────────────────────────────────────

// GET /api/dating/matches
router.get('/matches', authenticate, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM dating_matches WHERE user_a = ? OR user_b = ? ORDER BY created_at DESC'
    ).all(req.userId, req.userId);
    const matches = rows.map((m) => {
      const otherId = m.user_a === req.userId ? m.user_b : m.user_a;
      const last = db.prepare(
        'SELECT * FROM dating_messages WHERE match_id = ? ORDER BY created_at DESC LIMIT 1'
      ).get(m.id);
      const unread = db.prepare(
        'SELECT COUNT(*) AS n FROM dating_messages WHERE match_id = ? AND sender_id != ? AND read_at IS NULL'
      ).get(m.id, req.userId).n;
      return {
        matchId: m.id,
        createdAt: m.created_at,
        source: m.source,
        person: getProfile(otherId),
        lastMessage: last ? { body: last.body, senderId: last.sender_id, ts: last.created_at } : null,
        unread,
      };
    }).filter((m) => m.person);
    res.json({ matches });
  } catch (err) {
    console.error('Matches error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dating/matches/:id/messages
router.get('/matches/:id/messages', authenticate, (req, res) => {
  try {
    const m = db.prepare('SELECT * FROM dating_matches WHERE id = ?').get(req.params.id);
    if (!m || (m.user_a !== req.userId && m.user_b !== req.userId)) {
      return res.status(404).json({ error: 'Match not found' });
    }
    db.prepare(
      'UPDATE dating_messages SET read_at = ? WHERE match_id = ? AND sender_id != ? AND read_at IS NULL'
    ).run(Date.now(), m.id, req.userId);
    const messages = db.prepare(
      'SELECT id, sender_id AS senderId, body, read_at AS readAt, created_at AS ts FROM dating_messages WHERE match_id = ? ORDER BY created_at ASC'
    ).all(m.id);
    res.json({ messages });
  } catch (err) {
    console.error('Messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/matches/:id/messages { body }
router.post('/matches/:id/messages', authenticate, (req, res) => {
  try {
    const { body } = req.body || {};
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body required' });
    const m = db.prepare('SELECT * FROM dating_matches WHERE id = ?').get(req.params.id);
    if (!m || (m.user_a !== req.userId && m.user_b !== req.userId)) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const r = db.prepare(
      'INSERT INTO dating_messages (match_id, sender_id, body) VALUES (?, ?, ?)'
    ).run(m.id, req.userId, body.trim());
    res.status(201).json({
      message: { id: r.lastInsertRowid, senderId: req.userId, body: body.trim(), ts: Date.now() },
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Social feed ──────────────────────────────────────────────────────

// GET /api/dating/social/posts
router.get('/social/posts', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT po.*, pr.name AS author_name, pr.selfie_verified AS author_verified,
        (SELECT COUNT(*) FROM dating_post_likes WHERE post_id = po.id) AS likes,
        (SELECT COUNT(*) FROM dating_post_comments WHERE post_id = po.id) AS comments,
        EXISTS(SELECT 1 FROM dating_post_likes WHERE post_id = po.id AND user_id = ?) AS liked
      FROM dating_posts po
      JOIN dating_profiles pr ON pr.user_id = po.user_id
      ORDER BY po.created_at DESC LIMIT 100
    `).all(req.userId);
    res.json({
      posts: rows.map((r) => ({
        id: r.id, authorId: r.user_id, authorName: r.author_name,
        verified: !!r.author_verified, text: r.body, tag: r.tag,
        imageSeed: r.image_seed, likes: r.likes, comments: r.comments,
        liked: !!r.liked, ts: r.created_at,
      })),
    });
  } catch (err) {
    console.error('Posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/social/posts { body, tag, imageSeed }
router.post('/social/posts', authenticate, (req, res) => {
  try {
    const { body, tag, imageSeed } = req.body || {};
    if (!body || !body.trim()) return res.status(400).json({ error: 'Post body required' });
    const r = db.prepare(
      'INSERT INTO dating_posts (user_id, body, tag, image_seed) VALUES (?, ?, ?, ?)'
    ).run(req.userId, body.trim(), tag || 'Life', imageSeed || null);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/social/posts/:id/like — toggle
router.post('/social/posts/:id/like', authenticate, (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT 1 FROM dating_post_likes WHERE post_id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (existing) {
      db.prepare('DELETE FROM dating_post_likes WHERE post_id = ? AND user_id = ?').run(req.params.id, req.userId);
    } else {
      db.prepare('INSERT INTO dating_post_likes (post_id, user_id) VALUES (?, ?)').run(req.params.id, req.userId);
    }
    res.json({ liked: !existing });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET/POST /api/dating/social/posts/:id/comments
router.get('/social/posts/:id/comments', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.id, c.body, c.created_at AS ts, p.name
      FROM dating_post_comments c JOIN dating_profiles p ON p.user_id = c.user_id
      WHERE c.post_id = ? ORDER BY c.created_at ASC
    `).all(req.params.id);
    res.json({ comments: rows });
  } catch (err) {
    console.error('Comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/social/posts/:id/comments', authenticate, (req, res) => {
  try {
    const { body } = req.body || {};
    if (!body || !body.trim()) return res.status(400).json({ error: 'Comment body required' });
    const r = db.prepare(
      'INSERT INTO dating_post_comments (post_id, user_id, body) VALUES (?, ?, ?)'
    ).run(req.params.id, req.userId, body.trim());
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Photos ───────────────────────────────────────────────────────────

// POST /api/dating/photos — multipart "image" → adds a profile photo
router.post('/photos', authenticate, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file required' });
    const url = `/uploads/${req.file.filename}`;
    const pos = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM dating_photos WHERE user_id = ?').get(req.userId).p;
    const r = db.prepare('INSERT INTO dating_photos (user_id, url, position) VALUES (?, ?, ?)').run(req.userId, url, pos);
    res.status(201).json({ id: r.lastInsertRowid, url, photos: photosFor(req.userId) });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/dating/photos/:id
router.delete('/photos/:id', authenticate, (req, res) => {
  try {
    db.prepare('DELETE FROM dating_photos WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ photos: photosFor(req.userId) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Message reactions ────────────────────────────────────────────────

// POST /api/dating/messages/:id/react { emoji }  (empty emoji clears)
router.post('/messages/:id/react', authenticate, (req, res) => {
  try {
    const { emoji } = req.body || {};
    const msg = db.prepare('SELECT * FROM dating_messages WHERE id = ?').get(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    const m = db.prepare('SELECT * FROM dating_matches WHERE id = ?').get(msg.match_id);
    if (!m || (m.user_a !== req.userId && m.user_b !== req.userId)) {
      return res.status(403).json({ error: 'Not your conversation' });
    }
    if (!emoji) {
      db.prepare('DELETE FROM dating_reactions WHERE message_id = ? AND user_id = ?').run(req.params.id, req.userId);
    } else {
      db.prepare(`
        INSERT INTO dating_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)
        ON CONFLICT(message_id, user_id) DO UPDATE SET emoji = excluded.emoji
      `).run(req.params.id, req.userId, emoji);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('React error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Boost · Super Like · Roses ───────────────────────────────────────

// POST /api/dating/boost — activate a 30-minute boost
router.post('/boost', authenticate, (req, res) => {
  try {
    const until = Date.now() + 30 * 60000;
    getLimits(req.userId);
    db.prepare('UPDATE dating_limits SET boost_until = ? WHERE user_id = ?').run(until, req.userId);
    res.json({ boostUntil: until });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dating/super-like { targetId, note }
router.post('/super-like', authenticate, (req, res) => {
  try {
    const { targetId, note } = req.body || {};
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    const me = getProfile(req.userId);
    const lim = getLimits(req.userId);
    if (!me.gold && lim.super_likes <= 0) {
      return res.status(429).json({ error: 'Out of Super Likes', upgradeRequired: true });
    }
    if (!me.gold) {
      db.prepare('UPDATE dating_limits SET super_likes = super_likes - 1 WHERE user_id = ?').run(req.userId);
    }
    db.prepare(`
      INSERT INTO dating_swipes (user_id, target_id, action, is_super, note) VALUES (?, ?, 'like', 1, ?)
      ON CONFLICT(user_id, target_id) DO UPDATE SET action = 'like', is_super = 1, note = excluded.note
    `).run(req.userId, targetId, note || null);
    // Super likes are very likely to match in the demo (bots always match)
    const targetIsBot = db.prepare('SELECT is_bot FROM dating_profiles WHERE user_id = ?').get(targetId);
    const theirLike = db.prepare("SELECT 1 FROM dating_swipes WHERE user_id = ? AND target_id = ? AND action = 'like'").get(targetId, req.userId);
    let match = null;
    if (theirLike || (targetIsBot && targetIsBot.is_bot)) match = createMatch(req.userId, targetId, 'super');
    res.json({ match: !!match, matchId: match ? match.id : null, superLikesLeft: me.gold ? -1 : Math.max(0, lim.super_likes - 1) });
  } catch (err) {
    console.error('Super like error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Safety: block & report ───────────────────────────────────────────

// POST /api/dating/block { targetId, reason }
router.post('/block', authenticate, (req, res) => {
  try {
    const { targetId, reason } = req.body || {};
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    db.prepare(`
      INSERT INTO dating_blocks (user_id, blocked_id, reason) VALUES (?, ?, ?)
      ON CONFLICT(user_id, blocked_id) DO UPDATE SET reason = excluded.reason
    `).run(req.userId, targetId, reason || null);
    // Remove any match between the two
    db.prepare('DELETE FROM dating_matches WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)')
      .run(req.userId, targetId, targetId, req.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
