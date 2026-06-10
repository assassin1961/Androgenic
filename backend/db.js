const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'androgenic.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---- Schema ----

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    purchase_token TEXT,
    purchase_time INTEGER,
    expires_at INTEGER,
    is_active INTEGER DEFAULT 1,
    is_lifetime INTEGER DEFAULT 0,
    platform TEXT DEFAULT 'android',
    receipt_data TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path TEXT,
    scores TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS daily_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scan_date TEXT NOT NULL,
    scan_count INTEGER DEFAULT 0,
    UNIQUE(user_id, scan_date)
  );

  CREATE TABLE IF NOT EXISTS plan_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at INTEGER,
    UNIQUE(user_id, task_id)
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date INTEGER NOT NULL,
    completed_days TEXT DEFAULT '{}',
    streak INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date TEXT NOT NULL,
    intake_ml INTEGER DEFAULT 0,
    UNIQUE(user_id, log_date)
  );

  CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_date TEXT NOT NULL,
    tasks TEXT DEFAULT '{}',
    UNIQUE(user_id, routine_date)
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_date TEXT NOT NULL,
    completed TEXT DEFAULT '{}',
    UNIQUE(user_id, workout_date)
  );

  CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
  CREATE INDEX IF NOT EXISTS idx_scans_date ON scans(created_at);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_daily_scans_user_date ON daily_scans(user_id, scan_date);

  -- ── Dating app (Butterfly) ─────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS dating_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    city TEXT DEFAULT '',
    distance REAL DEFAULT 0,
    job TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    height TEXT DEFAULT '',
    intention TEXT DEFAULT 'Marriage',
    sect TEXT DEFAULT 'Prefer not to say',
    prayer_level TEXT DEFAULT 'Prefer not to say',
    ethnicity TEXT DEFAULT 'Other',
    halal_diet TEXT DEFAULT 'Mostly halal',
    interests TEXT DEFAULT '[]',
    "values" TEXT DEFAULT '[]',
    languages TEXT DEFAULT '["English"]',
    prompts TEXT DEFAULT '[]',
    wali_enabled INTEGER DEFAULT 0,
    photo_privacy INTEGER DEFAULT 0,
    selfie_verified INTEGER DEFAULT 0,
    is_gold INTEGER DEFAULT 0,
    is_bot INTEGER DEFAULT 0,
    online INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS dating_swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like','pass')),
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    UNIQUE(user_id, target_id)
  );

  CREATE TABLE IF NOT EXISTS dating_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source TEXT DEFAULT 'like',
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    UNIQUE(user_a, user_b)
  );

  CREATE TABLE IF NOT EXISTS dating_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES dating_matches(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    read_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS dating_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    tag TEXT DEFAULT 'Life',
    image_seed TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS dating_post_likes (
    post_id INTEGER NOT NULL REFERENCES dating_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS dating_post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES dating_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS dating_limits (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    like_window_start INTEGER DEFAULT 0,
    likes_in_window INTEGER DEFAULT 0,
    instant_chat_day TEXT DEFAULT '',
    instant_chats_used INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_dating_swipes_user ON dating_swipes(user_id);
  CREATE INDEX IF NOT EXISTS idx_dating_swipes_target ON dating_swipes(target_id, action);
  CREATE INDEX IF NOT EXISTS idx_dating_matches_a ON dating_matches(user_a);
  CREATE INDEX IF NOT EXISTS idx_dating_matches_b ON dating_matches(user_b);
  CREATE INDEX IF NOT EXISTS idx_dating_messages_match ON dating_messages(match_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_dating_posts_date ON dating_posts(created_at);
`);

module.exports = db;
