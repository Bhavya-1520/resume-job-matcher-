// Shared Express app used by both the local server (server.js) and the
// Vercel serverless function (api/index.js).

require("dotenv").config();

const path = require("path");
const express = require("express");

const { extractText } = require("./resumeParser");
const { extractSkills } = require("./skillExtractor");
const { extractExperience, extractLocation } = require("./resumeAnalyzer");
const { searchJobs, JobSearchError } = require("./jobSearch");

const app = express();

// Accept JSON bodies with a base64-encoded resume (works reliably on mobile,
// unlike multipart form-data).
app.use(express.json({ limit: "6mb" }));

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

app.post("/api/match", async (req, res) => {
  try {
    const { filename, data, location: loc } = req.body || {};

    if (!data || !filename) {
      return res.status(400).json({ error: "No resume file was uploaded." });
    }

    const buffer = Buffer.from(data, "base64");
    const location = (loc || "").trim();

    // 1. Extract text from the resume.
    let text;
    try {
      text = await extractText(filename, buffer);
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

    // 2. Extract skills, experience, and location from the resume.
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const resumeLocation = extractLocation(text);

    // Use the typed location if given, otherwise fall back to the resume's.
    const effectiveLocation = location || resumeLocation;

    if (skills.length === 0) {
      return res.json({
        skills: [],
        experience,
        location: effectiveLocation,
        jobs: [],
        message: "No recognizable skills were found in the resume.",
      });
    }

    // 3. Search jobs using skills + experience + location.
    try {
      const jobs = await searchJobs(skills, {
        location: effectiveLocation,
        experience,
      });
      const message =
        jobs.length === 0
          ? "No matching jobs found right now. Try again later or tweak your resume."
          : "";
      return res.json({
        skills,
        experience,
        location: effectiveLocation,
        jobs,
        message,
      });
    } catch (e) {
      if (e instanceof JobSearchError) {
        return res.json({
          skills,
          experience,
          location: effectiveLocation,
          jobs: [],
          message: e.message,
        });
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

// Catch body-parser errors (e.g., payload too large) and anything else.
app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(400).json({ error: "File too large (max ~4 MB)." });
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

module.exports = app;
