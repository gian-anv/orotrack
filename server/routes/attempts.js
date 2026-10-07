import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(`
      SELECT attempts.*, participants.code AS participant_code
      FROM attempts
      JOIN participants ON participants.id = attempts.participant_id
      ORDER BY attempts.timestamp DESC
    `)
    .all();
  res.json(rows);
});

export default router;
