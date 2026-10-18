import db from "../db.js";

// The role is read from the database rather than the token, so a role change
// takes effect on the next request instead of when the token expires.
export default function requireAdmin(req, res, next) {
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.user.userId);
  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}
