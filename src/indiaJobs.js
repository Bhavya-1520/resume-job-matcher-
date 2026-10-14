// India-focused job source using free, keyless Greenhouse job board APIs.
// These are the official career boards of Indian tech companies, so the
// listings are genuine India jobs (Bangalore, Hyderabad, Mumbai, etc.).
//
// Endpoint shape:
//   https://boards-api.greenhouse.io/v1/boards/<board>/jobs?content=true
//
// No API key, no signup. Fetched from the server (Vercel), so corporate
// network blocks on the user's device don't matter.

const UA =
  "Mozilla/5.0 (compatible; ResumeJobMatcher/1.0; +https://github.com)";

// Greenhouse board tokens for companies that hire heavily in India.
const GREENHOUSE_BOARDS = [
  "razorpaysoftwareprivatelimited", // Razorpay
  "postman",
  "hasura",
  "browserstack",
  "sprinklr",
  "innovaccer",
  "mindtickle",
  "whatfix",
  "chargebee",
  "druva",
  "gupshup",
  "cleartax",
  "netradyne",
  "sprinto",
  "zeta",
];

const INDIA_RE =
  /\b(india|bangalore|bengaluru|hyderabad|mumbai|pune|delhi|new delhi|gurgaon|gurugram|noida|chennai|kolkata|ahmedabad|jaipur|kochi|coimbatore|chandigarh|indore|remote - india|remote, india)\b/i;

// Fetch India jobs from all boards in parallel. Returns normalized jobs.
async function fetchIndiaJobs() {
  const settled = await Promise.allSettled(
    GREENHOUSE_BOARDS.map((board) => fetchBoard(board))
  );

  let jobs = [];
  for (const r of settled) {
    if (r.status === "fulfilled") jobs = jobs.concat(r.value);
  }
  return jobs;
}

async function fetchBoard(board) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
  const resp = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) throw new Error(`${board} ${resp.status}`);
  const data = await resp.json();
  const jobs = data.jobs || [];

  return jobs
    .filter((j) => INDIA_RE.test((j.location && j.location.name) || ""))
    .map((j) => ({
      title: j.title || "",
      company: prettyBoard(board),
      location: (j.location && j.location.name) || "India",
      url: j.absolute_url || "",
      description: stripHtml(decodeEntities(j.content || "")),
      salary: "",
      source: "Company careers (India)",
    }));
}

function prettyBoard(board) {
  const map = {
    razorpaysoftwareprivatelimited: "Razorpay",
    postman: "Postman",
    hasura: "Hasura",
    browserstack: "BrowserStack",
    sprinklr: "Sprinklr",
    innovaccer: "Innovaccer",
    mindtickle: "Mindtickle",
    whatfix: "Whatfix",
    chargebee: "Chargebee",
    druva: "Druva",
    gupshup: "Gupshup",
    cleartax: "ClearTax",
    netradyne: "Netradyne",
    sprinto: "Sprinto",
    zeta: "Zeta",
  };
  return map[board] || board;
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { fetchIndiaJobs };
