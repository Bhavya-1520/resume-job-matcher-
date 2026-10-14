// Shared Express app used by both the local server (server.js) and the
// Vercel serverless function (api/index.js).

require("dotenv").config();

const path = require("path");
const express = require("express");
const multer = require("multer");

const { extractText } = require("./resumeParser");
const { extractSkills } = require("./skillExtractor");
const { searchJobs, JobSearchError } = require("./jobSearch");

const app = express();
const MAX_FILE_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
});

// Allow the browser to call the API (handles CORS preflight on mobile).
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve the frontend from /public.
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/match", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file was uploaded." });
    }

    const location = (req.body.location || "").trim();

    // 1. Extract text from the resume.
    let text;
    try {
      text = await extractText(req.file.originalname, req.file.buffer);
    } catch (e) {
      return res.status(e.statusCode || 400).json({ error: e.message });
    }

    if (!text.trim()) {
      return res.status(400).json({
        error:
          "Could not read any text from the resume. If it's a scanned PDF " +
          "(image only), please upload a text-based PDF or DOCX.",
      });
    }

    // 2. Extract skills.
    const skills = extractSkills(text);
    if (skills.length === 0) {
      return res.json({
        skills: [],
        jobs: [],
        message: "No recognizable skills were found in the resume.",
      });
    }

    // 3. Search jobs.
    try {
      const jobs = await searchJobs(skills, location);
      const message =
        jobs.length === 0
          ? "No matching jobs found right now. Try again later or tweak your resume."
          : "";
      return res.json({ skills, jobs, message });
    } catch (e) {
      if (e instanceof JobSearchError) {
        return res.json({ skills, jobs: [], message: e.message });
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Something went wrong: " + e.message });
  }
});

// Multer errors (e.g., file too large) land here.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: `File too large (max ${MAX_FILE_MB} MB).` });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

module.exports = app;
