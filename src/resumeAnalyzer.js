// Extract years of experience and location from resume text.
// Rule-based ("AI-like") extraction. No external API needed.

// Common Indian cities + a few global hubs. Extend as needed.
const KNOWN_LOCATIONS = [
  "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune",
  "Delhi", "New Delhi", "Gurgaon", "Gurugram", "Noida", "Kolkata",
  "Ahmedabad", "Jaipur", "Kochi", "Coimbatore", "Chandigarh",
  "Indore", "Nagpur", "Visakhapatnam", "Vizag", "Thiruvananthapuram",
  "Remote",
  "London", "New York", "San Francisco", "Berlin", "Amsterdam",
  "Toronto", "Singapore", "Dublin", "Sydney",
];

// Pull a years-of-experience estimate from the resume.
function extractExperience(text) {
  const t = text.replace(/\s+/g, " ");

  // 1. Direct phrases: "4 years of experience", "4+ yrs experience", etc.
  const phrase = t.match(
    /(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i
  );
  if (phrase) {
    return Math.round(parseFloat(phrase[1]));
  }

  // 2. Infer from a date range like "2019 - Present" or "2018 to 2024".
  const years = estimateFromDateRanges(t);
  if (years != null) return years;

  return null; // unknown
}

function estimateFromDateRanges(t) {
  const currentYear = new Date().getFullYear();
  // Match things like 2018-2022, 2019 – Present, Jan 2020 to 2024
  const rangeRe =
    /(20\d{2})\s*(?:-|–|—|to)\s*(present|current|now|20\d{2})/gi;
  let m;
  let earliest = null;
  let latest = null;
  while ((m = rangeRe.exec(t)) !== null) {
    const start = parseInt(m[1], 10);
    const endRaw = m[2].toLowerCase();
    const end = /^20\d{2}$/.test(endRaw) ? parseInt(endRaw, 10) : currentYear;
    if (start >= 1980 && start <= currentYear) {
      earliest = earliest == null ? start : Math.min(earliest, start);
      latest = latest == null ? end : Math.max(latest, end);
    }
  }
  if (earliest != null && latest != null && latest >= earliest) {
    const span = latest - earliest;
    if (span >= 0 && span <= 50) return span;
  }
  return null;
}

// Pull the first known location mentioned in the resume.
function extractLocation(text) {
  for (const loc of KNOWN_LOCATIONS) {
    const re = new RegExp(`\\b${loc}\\b`, "i");
    if (re.test(text)) {
      // Normalize a couple of aliases.
      if (/^bengaluru$/i.test(loc)) return "Bangalore";
      if (/^vizag$/i.test(loc)) return "Visakhapatnam";
      return loc;
    }
  }
  return "";
}

// Find the required years of experience mentioned in a job description.
function extractRequiredYears(description) {
  if (!description) return null;
  const m = description.match(
    /(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i
  );
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 0 && n <= 40) return n;
  }
  return null;
}

module.exports = {
  extractExperience,
  extractLocation,
  extractRequiredYears,
};
