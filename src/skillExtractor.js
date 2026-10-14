// Extract skills from resume text using an offline, word-boundary matcher.
// Free, no API key, no external calls.

const { SKILLS } = require("./skillsDb");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkills(text) {
  const found = [];
  const seen = new Set();

  for (const skill of SKILLS) {
    // Word-boundary-ish match that tolerates symbols like C++, C#, .NET, Node.js
    const pattern = new RegExp(
      `(?<![A-Za-z0-9+#.])${escapeRegex(skill)}(?![A-Za-z0-9+#])`,
      "i"
    );
    if (pattern.test(text)) {
      const key = skill.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        found.push(skill);
      }
    }
  }

  return found;
}

module.exports = { extractSkills };
