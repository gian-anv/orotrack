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
      WHERE participants.user_id = ?
      ORDER BY uploads.uploaded_at DESC
    `)
    .all(req.user.userId);
  res.json(rows);
});

router.get("/:id/file", (req, res) => {
  const row = db
    .prepare(`
      SELECT uploads.original_name, uploads.stored_name
      FROM uploads
      JOIN participants ON participants.id = uploads.participant_id
      WHERE uploads.id = ? AND participants.user_id = ?
    `)
    .get(Number(req.params.id), req.user.userId);
  if (!row) return res.status(404).json({ message: "Upload not found" });

  const filePath = path.resolve(uploadDir, row.stored_name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "The original file is no longer on the server" });
  }
  res.download(filePath, row.original_name);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db
    .prepare(`
      SELECT uploads.stored_name
      FROM uploads
      JOIN participants ON participants.id = uploads.participant_id
      WHERE uploads.id = ? AND participants.user_id = ?
    `)
    .get(id, req.user.userId);
  if (!row) return res.status(404).json({ message: "Upload not found" });

  db.prepare("DELETE FROM uploads WHERE id = ?").run(id);
  fs.rmSync(path.resolve(uploadDir, row.stored_name), { force: true });
  res.json({ id });
});

router.post("/", upload.single("file"), (req, res) => {
  const participant = db
    .prepare("SELECT id FROM participants WHERE id = ? AND user_id = ?")
    .get(Number(req.body?.participant_id), req.user.userId);
  if (!req.file || !participant) {
    if (req.file) fs.unlinkSync(req.file.path);
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
    .run(participant.id, req.file.originalname, req.file.filename, rows.length, new Date().toISOString());

  const insertAttempt = db.prepare(
    "INSERT INTO attempts (upload_id, participant_id, timestamp, exercise, result, confidence_score, input_validity) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const row of rows) {
    insertAttempt.run(
      uploadResult.lastInsertRowid,
      participant.id,
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
