import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM participants WHERE user_id = ? ORDER BY code")
    .all(req.user.userId);
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM participants WHERE id = ? AND user_id = ?")
    .get(Number(req.params.id), req.user.userId);
  if (!row) return res.status(404).json({ message: "Participant not found" });
  res.json(row);
});

router.post("/", (req, res) => {
  const { code, age_group, target_sounds } = req.body || {};
  if (!code || !age_group || !target_sounds) {
    return res.status(400).json({ message: "Code, age group, and target sounds are required" });
  }
  if (db.prepare("SELECT id FROM participants WHERE code = ?").get(code)) {
    return res.status(409).json({ message: "That code is already in use. Pick a different one." });
  }
  const result = db
    .prepare("INSERT INTO participants (code, age_group, target_sounds, user_id) VALUES (?, ?, ?, ?)")
    .run(code, age_group, target_sounds, req.user.userId);
  const row = db.prepare("SELECT * FROM participants WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { code, age_group, target_sounds } = req.body || {};
  if (!code || !age_group || !target_sounds) {
    return res.status(400).json({ message: "Code, age group, and target sounds are required" });
  }
  if (db.prepare("SELECT id FROM participants WHERE code = ? AND id != ?").get(code, id)) {
    return res.status(409).json({ message: "That code is already in use. Pick a different one." });
  }
  const result = db
    .prepare("UPDATE participants SET code = ?, age_group = ?, target_sounds = ? WHERE id = ? AND user_id = ?")
    .run(code, age_group, target_sounds, id, req.user.userId);
  if (result.changes === 0) return res.status(404).json({ message: "Participant not found" });
  const row = db.prepare("SELECT * FROM participants WHERE id = ?").get(id);
  res.json(row);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db
    .prepare("DELETE FROM participants WHERE id = ? AND user_id = ?")
    .run(id, req.user.userId);
  if (result.changes === 0) return res.status(404).json({ message: "Participant not found" });
  res.json({ id });
});

export default router;
