import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR || "../data";
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "data.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    age_group TEXT NOT NULL,
    target_sounds TEXT NOT NULL
  )
`);

const participantColumns = db.prepare("PRAGMA table_info(participants)").all();
if (!participantColumns.some((column) => column.name === "user_id")) {
  db.exec("ALTER TABLE participants ADD COLUMN user_id INTEGER REFERENCES users(id)");
}
db.exec("UPDATE participants SET user_id = (SELECT MIN(id) FROM users) WHERE user_id IS NULL");

db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    uploaded_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY,
    upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    timestamp TEXT NOT NULL,
    exercise TEXT NOT NULL,
    result TEXT,
    confidence_score REAL NOT NULL,
    input_validity TEXT NOT NULL
  )
`);

export default db;
