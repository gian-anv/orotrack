import express from "express";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const app = express();
const port = process.env.PORT || 3000;

const dataDir = process.env.DATA_DIR || "../data";
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "data.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY,
    visited_at TEXT NOT NULL
  )
`);

app.get("/", (req, res) => {
  db.prepare("INSERT INTO visits (visited_at) VALUES (?)").run(new Date().toISOString());
  const row = db.prepare("SELECT COUNT(*) AS total FROM visits").get();
  res.send(`Hello from Session Review. Visits so far: ${row.total}`);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
