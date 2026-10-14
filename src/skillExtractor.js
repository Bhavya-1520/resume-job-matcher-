// Extract skills from resume text and detect the professional field (category).
// Free, no API key, no external calls.

const { CATEGORIES, SKILLS } = require("./skillsDb");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function skillMatches(skill, text) {
  const pattern = new RegExp(
    `(?<![A-Za-z0-9+#.])${escapeRegex(skill)}(?![A-Za-z0-9+#])`,
    "i"
  );
  return pattern.test(text);
}

// Returns the de-duplicated list of skills found in the resume.
function extractSkills(text) {
  const found = [];
  const seen = new Set();
  for (const skill of SKILLS) {
    if (skillMatches(skill, text)) {
      const key = skill.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        found.push(skill);
      }
    }
  }
  return found;
}

// Detects which professional field the resume belongs to by counting how many
// skills from each category appear. Returns the top category name, or null.
function detectField(text) {
  let best = null;
  let bestCount = 0;
  const counts = {};

  for (const [category, skills] of Object.entries(CATEGORIES)) {
    let count = 0;
    for (const skill of skills) {
      if (skillMatches(skill, text)) count++;
    }
    counts[category] = count;
    if (count > bestCount) {
      bestCount = count;
      best = category;
    }
  }

  return { field: bestCount > 0 ? best : null, counts };
}

// Classify a job (by its title + description) into the best-fitting category,
// by counting category skill hits. Returns the category name or null.
function classifyJob(text) {
  let best = null;
  let bestCount = 0;
  for (const [category, skills] of Object.entries(CATEGORIES)) {
    let count = 0;
    for (const skill of skills) {
      if (skillMatches(skill, text)) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = category;
    }
  }
  return best;
}

module.exports = { extractSkills, detectField, classifyJob };
