// Search for jobs using FREE, no-registration job APIs and rank them
// against resume skills, experience, and location. Uses global fetch (Node 18+).
//
// Sources (no API key required):
//   - Remotive   https://remotive.com/api/remote-jobs
//   - Arbeitnow  https://www.arbeitnow.com/api/job-board-api
//
// Note: these are mostly remote / tech roles and are more global than
// India-specific. They don't require any signup or credit card.

const { extractRequiredYears } = require("./resumeAnalyzer");
const { classifyJob } = require("./skillExtractor");
const { fetchIndiaJobs } = require("./indiaJobs");

const UA =
  "Mozilla/5.0 (compatible; ResumeJobMatcher/1.0; +https://github.com)";

class JobSearchError extends Error {}

// opts: { location, experience } — experience is the candidate's years (number|null)
// Returns { jobs, scope } where scope is "india" or "international".
async function searchJobs(skills, opts = {}, limit = 30) {
  if (!skills || skills.length === 0) {
    throw new JobSearchError("No skills were detected in the resume.");
  }

  const location = (opts.location || "").trim().toLowerCase();
  const experience = typeof opts.experience === "number" ? opts.experience : null;
  const field = opts.field || null; // the resume's detected category

  // 1. Prefer India jobs (company career boards).
  let indiaRaw = [];
  try {
    indiaRaw = await fetchIndiaJobs();
  } catch {
    indiaRaw = [];
  }

  let indiaScored = indiaRaw
    .map((job) => scoreJob(job, skills, location, experience))
    .filter((job) => job.matchScore > 0 && inField(job, field));
  indiaScored.sort((a, b) => b.matchScore - a.matchScore);

  if (indiaScored.length > 0) {
    return { jobs: indiaScored.slice(0, limit), scope: "india" };
  }

  // 2. Fall back to international sources only if no India matches found.
  const settled = await Promise.allSettled([
    fetchRemotive(skills),
    fetchArbeitnow(),
  ]);

  let raw = [];
  for (const r of settled) {
    if (r.status === "fulfilled") raw = raw.concat(r.value);
  }

  if (raw.length === 0 && indiaRaw.length === 0) {
    throw new JobSearchError(
      "Could not reach the job sources. If you're on an office network, it " +
        "may be blocking job sites. Try a personal network, or deploy the app " +
        "online (see README) so requests come from the host, not your laptop."
    );
  }

  const scored = raw
    .map((job) => scoreJob(job, skills, location, experience))
    .filter((job) => job.matchScore > 0 && inField(job, field));
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return { jobs: scored.slice(0, limit), scope: "international" };
}

// Keep a job only if it belongs to the resume's field. If we can't confidently
// classify the job, we keep it (better to show than to wrongly drop).
function inField(job, field) {
  if (!field) return true;
  const jobField = classifyJob(`${job.title} ${job.description}`);
  if (!jobField) return true;
  return jobField === field;
}

async function fetchRemotive(skills) {
  const term = encodeURIComponent(skills[0] || "");
  const url = `https://remotive.com/api/remote-jobs?limit=50&search=${term}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) throw new Error("Remotive " + resp.status);
  const data = await resp.json();
  return (data.jobs || []).map((j) => ({
    title: j.title || "",
    company: j.company_name || "Unknown",
    location: j.candidate_required_location || "Remote",
    url: j.url || "",
    description: stripHtml(j.description || ""),
    salary: j.salary || "",
    source: "Remotive",
  }));
}

async function fetchArbeitnow() {
  const url = "https://www.arbeitnow.com/api/job-board-api";
  const resp = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) throw new Error("Arbeitnow " + resp.status);
  const data = await resp.json();
  return (data.data || []).map((j) => ({
    title: j.title || "",
    company: j.company_name || "Unknown",
    location: j.location || (j.remote ? "Remote" : ""),
    url: j.url || "",
    description: stripHtml(j.description || ""),
    salary: "",
    source: "Arbeitnow",
  }));
}

function scoreJob(job, skills, loc, experience) {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  const matched = skills.filter((s) => haystack.includes(s.toLowerCase()));

  let score = matched.length;

  // Location: boost if the resume/requested location appears in the job.
  let locationMatch = false;
  if (loc && job.location && job.location.toLowerCase().includes(loc)) {
    score += 3;
    locationMatch = true;
  }

  // Experience: compare candidate years to the job's required years.
  const requiredYears = extractRequiredYears(job.description);
  let experienceFit = "unknown";
  if (experience != null && requiredYears != null) {
    if (experience >= requiredYears) {
      experienceFit = "meets"; // candidate qualifies
      score += 2;
    } else if (experience >= requiredYears - 1) {
      experienceFit = "close"; // within a year
      score += 1;
    } else {
      experienceFit = "below";
    }
  }

  return {
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    salaryText: job.salary || "",
    source: job.source,
    description:
      job.description.slice(0, 300) +
      (job.description.length > 300 ? "..." : ""),
    matchedSkills: matched,
    matchScore: score,
    requiredYears,
    experienceFit,
    locationMatch,
  };
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { searchJobs, JobSearchError };
