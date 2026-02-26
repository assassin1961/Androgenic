const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ---- Schema ----
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);
`);

// GET /api/chat/history
router.get('/history', authenticate, (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 1000);
    const messages = db.prepare(
      'SELECT id, role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?'
    ).all(req.userId, limit);

    res.json({ messages });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chat/message
router.post('/message', authenticate, (req, res) => {
  try {
    const { role, content } = req.body;

    if (!role || !['user', 'ai'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "user" or "ai"' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = db.prepare(
      'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
    ).run(req.userId, role, content.trim());

    res.status(201).json({
      message: {
        id: result.lastInsertRowid,
        role,
        content: content.trim(),
        created_at: Date.now(),
      },
    });
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/chat/history
router.delete('/history', authenticate, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.userId);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/stats
router.get('/stats', authenticate, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) AS userMessages,
        SUM(CASE WHEN role = 'ai' THEN 1 ELSE 0 END) AS aiMessages
      FROM chat_messages WHERE user_id = ?
    `).get(req.userId);

    res.json({ stats });
  } catch (err) {
    console.error('Chat stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
