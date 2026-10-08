import express from "express";
import path from "node:path";
import setupAdmin from "./setupAdmin.js";
import requireAuth from "./middleware/requireAuth.js";
import requireAdmin from "./middleware/requireAdmin.js";
import authRouter from "./routes/auth.js";
import participantsRouter from "./routes/participants.js";
import uploadsRouter from "./routes/uploads.js";
import attemptsRouter from "./routes/attempts.js";
import usersRouter from "./routes/users.js";
import trendsRouter from "./routes/trends.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

setupAdmin();

app.use("/api", authRouter);
app.use("/api/participants", requireAuth, participantsRouter);
app.use("/api/uploads", requireAuth, uploadsRouter);
app.use("/api/attempts", requireAuth, attemptsRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);
app.use("/api/trends", requireAuth, trendsRouter);

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
