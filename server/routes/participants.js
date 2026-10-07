import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM participants ORDER BY code").all();
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM participants WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ message: "Participant not found" });
  res.json(row);
});

router.post("/", (req, res) => {
  const { code, age_group, target_sounds } = req.body || {};
  if (!code || !age_group || !target_sounds) {
    return res.status(400).json({ message: "Code, age group, and target sounds are required" });
  }
  const result = db
    .prepare("INSERT INTO participants (code, age_group, target_sounds) VALUES (?, ?, ?)")
    .run(code, age_group, target_sounds);
  const row = db.prepare("SELECT * FROM participants WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { code, age_group, target_sounds } = req.body || {};
  if (!code || !age_group || !target_sounds) {
    return res.status(400).json({ message: "Code, age group, and target sounds are required" });
  }
  const result = db
    .prepare("UPDATE participants SET code = ?, age_group = ?, target_sounds = ? WHERE id = ?")
    .run(code, age_group, target_sounds, id);
  if (result.changes === 0) return res.status(404).json({ message: "Participant not found" });
  const row = db.prepare("SELECT * FROM participants WHERE id = ?").get(id);
  res.json(row);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM participants WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ message: "Participant not found" });
  res.json({ id });
});

export default router;
