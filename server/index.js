import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "node:path";
import db from "./db.js";
import requireAuth from "./requireAuth.js";
import participantsRouter from "./routes/participants.js";
import uploadsRouter from "./routes/uploads.js";
import attemptsRouter from "./routes/attempts.js";

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;

app.use(express.json());

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (adminEmail && adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  const admin = db.prepare("SELECT id FROM users ORDER BY id LIMIT 1").get();
  if (admin) {
    db.prepare("UPDATE users SET email = ?, password_hash = ? WHERE id = ?").run(adminEmail, hash, admin.id);
  } else {
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(adminEmail, hash);
  }
  console.log(`Admin account is ${adminEmail}`);
}

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

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email });
});

app.use("/api/participants", requireAuth, participantsRouter);
app.use("/api/uploads", requireAuth, uploadsRouter);
app.use("/api/attempts", requireAuth, attemptsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

const clientDist = path.join(import.meta.dirname, "../client/dist");
app.use(express.static(clientDist));

app.use((req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
