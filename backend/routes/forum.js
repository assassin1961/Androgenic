const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ---- Forum schema ----
db.exec(`
  CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'General',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS forum_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS forum_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
  CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at);
  CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
`);

// GET /api/forum/posts
router.get('/posts', authenticate, (req, res) => {
  try {
    const { category, sort } = req.query;
    const orderBy = sort === 'new' ? 'p.created_at DESC' : 'p.upvotes DESC';

    let sql = `
      SELECT p.*, u.display_name,
        EXISTS(SELECT 1 FROM forum_upvotes WHERE post_id = p.id AND user_id = ?) AS user_upvoted
      FROM forum_posts p
      JOIN users u ON u.id = p.user_id
    `;
    const params = [req.userId];

    if (category) {
      sql += ' WHERE p.category = ?';
      params.push(category);
    }

    sql += ` ORDER BY ${orderBy}`;

    const posts = db.prepare(sql).all(...params);
    res.json({ posts });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forum/posts
router.post('/posts', authenticate, (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const result = db.prepare(
      'INSERT INTO forum_posts (user_id, title, body, category) VALUES (?, ?, ?, ?)'
    ).run(req.userId, title, body, category || 'General');

    const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forum/posts/:id/upvote
router.post('/posts/:id/upvote', authenticate, (req, res) => {
  try {
    const postId = req.params.id;
    const existing = db.prepare(
      'SELECT id FROM forum_upvotes WHERE post_id = ? AND user_id = ?'
    ).get(postId, req.userId);

    if (existing) {
      db.prepare('DELETE FROM forum_upvotes WHERE id = ?').run(existing.id);
      db.prepare('UPDATE forum_posts SET upvotes = upvotes - 1 WHERE id = ?').run(postId);
    } else {
      db.prepare('INSERT INTO forum_upvotes (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
      db.prepare('UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = ?').run(postId);
    }

    const post = db.prepare('SELECT upvotes FROM forum_posts WHERE id = ?').get(postId);
    res.json({ upvotes: post.upvotes, userUpvoted: !existing });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/forum/posts/:id/comments
router.get('/posts/:id/comments', authenticate, (req, res) => {
  try {
    const comments = db.prepare(`
      SELECT c.*, u.display_name
      FROM forum_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

    res.json({ comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forum/posts/:id/comments
router.post('/posts/:id/comments', authenticate, (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const postId = req.params.id;
    const result = db.prepare(
      'INSERT INTO forum_comments (post_id, user_id, body) VALUES (?, ?, ?)'
    ).run(postId, req.userId, body);

    db.prepare('UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = ?').run(postId);

    const comment = db.prepare('SELECT * FROM forum_comments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ comment });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/forum/posts/:id
router.delete('/posts/:id', authenticate, (req, res) => {
  try {
    const post = db.prepare('SELECT user_id FROM forum_posts WHERE id = ?').get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    db.prepare('DELETE FROM forum_posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
