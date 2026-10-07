import express from "express";
import bcrypt from "bcryptjs";
import db from "./db.js";

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
