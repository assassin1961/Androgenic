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
`);

module.exports = db;
