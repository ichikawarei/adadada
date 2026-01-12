const Database = require("better-sqlite3");

// settings.db がなければ自動作成される
const db = new Database("settings.db");

// サーバごとの設定テーブル
db.prepare(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'add'
  )
`).run();

// ★ migration（既存DB用）
const columns = db.prepare(`PRAGMA table_info(guild_settings)`).all();
const hasMode = columns.some(col => col.name === "mode");

if (!hasMode) {
  db.prepare(`
    ALTER TABLE guild_settings
    ADD COLUMN mode TEXT NOT NULL DEFAULT 'add'
  `).run();
  console.log("DB migrated: mode column added");
}

console.log("SQLite DB ready");

module.exports = db;
