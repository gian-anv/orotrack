import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/:participantId", (req, res) => {
  const participantId = Number(req.params.participantId);
  const participant = db
    .prepare("SELECT id FROM participants WHERE id = ? AND user_id = ?")
    .get(participantId, req.user.userId);
  if (!participant) return res.status(404).json({ message: "Participant not found" });

  const exercise = req.query.exercise || null;

  const exercises = db
    .prepare("SELECT DISTINCT exercise FROM attempts WHERE participant_id = ? ORDER BY exercise")
    .all(participantId)
    .map((row) => row.exercise);

  const summary = db
    .prepare(`
      SELECT
        COUNT(DISTINCT upload_id) AS sessions,
        AVG(CASE
              WHEN input_validity != 'valid' THEN NULL
              WHEN result = 'correct' THEN 100.0
              ELSE 0
            END) AS average_score,
        AVG(CASE WHEN input_validity = 'valid' THEN 0 ELSE 100.0 END) AS invalid_rate
      FROM attempts
      WHERE participant_id = ? AND (? IS NULL OR exercise = ?)
    `)
    .get(participantId, exercise, exercise);

  const points = db
    .prepare(`
      SELECT
        date(timestamp) AS session_date,
        exercise,
        AVG(CASE WHEN result = 'correct' THEN 100.0 ELSE 0 END) AS average_score
      FROM attempts
      WHERE participant_id = ? AND input_validity = 'valid' AND (? IS NULL OR exercise = ?)
      GROUP BY session_date, exercise
      ORDER BY session_date, exercise
    `)
    .all(participantId, exercise, exercise);

  res.json({ exercises, summary, points });
});

export default router;
