import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "node:path";
import db from "./db.js";
import requireAuth from "./requireAuth.js";
import participantsRouter from "./routes/participants.js";
import uploadsRouter from "./routes/uploads.js";
import attemptsRouter from "./routes/attempts.js";
import requireAdmin from "./requireAdmin.js";
import usersRouter from "./routes/users.js";

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
    db.prepare("UPDATE users SET email = ?, password_hash = ?, role = 'admin', name = 'Administrator' WHERE id = ?").run(adminEmail, hash, admin.id);
  } else {
    db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES ('Administrator', ?, ?, 'admin')").run(adminEmail, hash);
  }
  console.log(`Admin account is ${adminEmail}`);
}

function createToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
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

  res.json({ token: createToken(user) });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email, role: req.user.role });
});

app.use("/api/participants", requireAuth, participantsRouter);
app.use("/api/uploads", requireAuth, uploadsRouter);
app.use("/api/attempts", requireAuth, attemptsRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);

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
