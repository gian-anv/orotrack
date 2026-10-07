import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import db from "../db.js";

const uploadDir = path.join(process.env.DATA_DIR || "../data", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir, limits: { fileSize: 10 * 1024 * 1024 } });

const REQUIRED_COLUMNS = ["timestamp", "exercise", "result", "confidence_score", "input_validity"];

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(`
      SELECT uploads.*, participants.code AS participant_code
      FROM uploads
      JOIN participants ON participants.id = uploads.participant_id
      ORDER BY uploads.uploaded_at DESC
    `)
    .all();
  res.json(rows);
});

router.post("/", upload.single("file"), (req, res) => {
  const participantId = Number(req.body.participant_id);
  if (!req.file || !participantId) {
    return res.status(400).json({ message: "A participant and a CSV file are required" });
  }

  const text = fs.readFileSync(req.file.path, "utf8");
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line !== "");
  const header = (lines[0] || "").split(",");

  const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
  if (missing.length > 0 || lines.length < 2) {
    fs.unlinkSync(req.file.path);
    const reason = missing.length > 0 ? `Missing column: ${missing.join(", ")}` : "The file has no data rows";
    return res.status(400).json({ message: reason });
  }

  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    header.forEach((column, index) => {
      row[column] = cells[index];
    });
    return row;
  });

  const uploadResult = db
    .prepare("INSERT INTO uploads (participant_id, original_name, stored_name, row_count, uploaded_at) VALUES (?, ?, ?, ?, ?)")
    .run(participantId, req.file.originalname, req.file.filename, rows.length, new Date().toISOString());

  const insertAttempt = db.prepare(
    "INSERT INTO attempts (upload_id, participant_id, timestamp, exercise, result, confidence_score, input_validity) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const row of rows) {
    insertAttempt.run(
      uploadResult.lastInsertRowid,
      participantId,
      row.timestamp,
      row.exercise,
      row.result || null,
      Number(row.confidence_score),
      row.input_validity
    );
  }

  res.status(201).json({ id: uploadResult.lastInsertRowid, row_count: rows.length });
});

export default router;
