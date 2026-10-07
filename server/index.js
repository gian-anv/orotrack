import express from "express";
import bcrypt from "bcryptjs";
import db from "./db.js";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;

app.use(express.json());

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (adminEmail && adminPassword) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(adminEmail, hash);
    console.log(`Created user ${adminEmail}`);
  }
}

app.get("/", (req, res) => {
  const row = db.prepare("SELECT COUNT(*) AS total FROM users").get();
  res.send(`Hello from Session Review. Users: ${row.total}`);
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Wrong email or password" });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });
  res.json({ token });
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Not logged in" });
  }
}

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
