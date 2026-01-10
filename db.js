const Database = require("better-sqlite3");

// settings.db がなければ自動作成される
const db = new Database("settings.db");

// サーバごとの設定テーブル
db.prepare(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    role_id TEXT NOT NULL
  )
`).run();

console.log("SQLite DB ready");

module.exports = db;
