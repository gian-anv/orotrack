import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Wrong email or password" });
  }

  res.json({ token: createToken(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(req.user.userId);
  if (!user) return res.status(401).json({ message: "Not logged in" });
  res.json({ userId: user.id, email: user.email, role: user.role });
});

export default router;
