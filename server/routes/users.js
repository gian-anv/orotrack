import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(`
      SELECT id, name, email, role,
        (SELECT COUNT(*) FROM participants WHERE participants.user_id = users.id) AS participant_count
      FROM users
      ORDER BY id
    `)
    .all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Enter a name, an email, and a password of at least 8 characters" });
  }
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')")
    .run(name, email, hash);
  const row = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.put("/:id/password", (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "The new password needs at least 8 characters" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: "User not found" });
  res.json({ id: Number(req.params.id) });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") {
    return res.status(400).json({ message: "The admin account can't be deleted" });
  }
  db.prepare("DELETE FROM participants WHERE user_id = ?").run(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.json({ id });
});

export default router;
