// Search for jobs using FREE, no-registration job APIs and rank them
// against resume skills. Uses the built-in global fetch (Node 18+).
//
// Sources (no API key required):
//   - Remotive   https://remotive.com/api/remote-jobs
//   - Arbeitnow  https://www.arbeitnow.com/api/job-board-api
//
// Note: these are mostly remote / tech roles and are more global than
// India-specific. They don't require any signup or credit card.

const UA =
  "Mozilla/5.0 (compatible; ResumeJobMatcher/1.0; +https://github.com)";

class JobSearchError extends Error {}

async function searchJobs(skills, location = "", limit = 30) {
  if (!skills || skills.length === 0) {
    throw new JobSearchError("No skills were detected in the resume.");
  }

  const settled = await Promise.allSettled([
    fetchRemotive(skills),
    fetchArbeitnow(),
  ]);

  let raw = [];
  for (const r of settled) {
    if (r.status === "fulfilled") raw = raw.concat(r.value);
  }

  if (raw.length === 0) {
    throw new JobSearchError(
      "Could not reach the job sources. If you're on an office network, it " +
        "may be blocking job sites. Try a personal network, or deploy the app " +
        "online (see README) so requests come from the host, not your laptop."
    );
  }

  // Score every job by skill + location overlap, keep ones that match.
  const loc = location.trim().toLowerCase();
  const scored = raw
    .map((job) => scoreJob(job, skills, loc))
    .filter((job) => job.matchScore > 0);

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

async function fetchRemotive(skills) {
  // Remotive supports a search term; use the top skill to narrow results.
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

function scoreJob(job, skills, loc) {
  const haystack = `${job.title} ${job.description}`.toLowerCase();
  const matched = skills.filter((s) => haystack.includes(s.toLowerCase()));
  let score = matched.length;

  // Small boost if the requested location appears in the job location.
  if (loc && job.location && job.location.toLowerCase().includes(loc)) {
    score += 2;
  }

  return {
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    salaryMin: null,
    salaryMax: null,
    salaryText: job.salary || "",
    source: job.source,
    description:
      job.description.slice(0, 300) +
      (job.description.length > 300 ? "..." : ""),
    matchedSkills: matched,
    matchScore: score,
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
