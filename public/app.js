const form = document.getElementById("upload-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const skillsSection = document.getElementById("skills-section");
const skillsEl = document.getElementById("skills");
const jobsSection = document.getElementById("jobs-section");
const jobsEl = document.getElementById("jobs");
const jobsHeading = document.getElementById("jobs-heading");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  if (!fileInput.files.length) {
    showStatus("Please choose a resume file first.", true);
    return;
  }

  const formData = new FormData();
  formData.append("resume", fileInput.files[0]);
  formData.append("location", document.getElementById("location").value);

  setLoading(true);
  hide(skillsSection);
  hide(jobsSection);
  showStatus('<span class="spinner"></span> Reading your resume and searching jobs...', false);

  try {
    const resp = await fetch("/api/match", { method: "POST", body: formData });
    const data = await resp.json();

    if (!resp.ok) {
      showStatus(data.error || "Something went wrong.", true);
      return;
    }

    renderSkills(data.skills || []);

    if (data.message) {
      showStatus(data.message, true);
    } else {
      hide(statusEl);
    }

    renderJobs(data.jobs || []);
  } catch (err) {
    showStatus("Network error: " + err.message, true);
  } finally {
    setLoading(false);
  }
});

function renderSkills(skills) {
  skillsEl.innerHTML = "";
  if (!skills.length) {
    hide(skillsSection);
    return;
  }
  for (const s of skills) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = s;
    skillsEl.appendChild(chip);
  }
  show(skillsSection);
}

function renderJobs(jobs) {
  jobsEl.innerHTML = "";
  if (!jobs.length) {
    hide(jobsSection);
    return;
  }

  jobsHeading.textContent = `Matching jobs (${jobs.length})`;

  for (const job of jobs) {
    const card = document.createElement("div");
    card.className = "job";

    const salary = formatSalary(job.salaryMin, job.salaryMax);
    const matchLine =
      job.matchScore > 0
        ? `<span class="match">★ ${job.matchScore} skill${job.matchScore > 1 ? "s" : ""} matched</span>`
        : "";

    card.innerHTML = `
      ${matchLine}
      <h3><a href="${escapeAttr(job.url)}" target="_blank" rel="noopener">${escapeHtml(job.title)}</a></h3>
      <div class="meta">
        ${escapeHtml(job.company)}${job.location ? " · " + escapeHtml(job.location) : ""}${salary ? " · " + salary : ""}
      </div>
      <div class="desc">${escapeHtml(job.description)}</div>
      <div class="job-skills">
        ${job.matchedSkills.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("")}
      </div>
    `;
    jobsEl.appendChild(card);
  }

  show(jobsSection);
}

function formatSalary(min, max) {
  if (!min && !max) return "";
  const fmt = (n) => Math.round(n).toLocaleString();
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min || max);
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "Searching..." : "Find Jobs";
}

function showStatus(html, isError) {
  statusEl.innerHTML = html;
  statusEl.classList.toggle("error", !!isError);
  show(statusEl);
}

function show(el) {
  el.hidden = false;
}
function hide(el) {
  el.hidden = true;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}
