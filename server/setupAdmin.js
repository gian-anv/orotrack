import bcrypt from "bcryptjs";
import db from "./db.js";

export default function setupAdmin() {
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
}
