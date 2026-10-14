const form = document.getElementById("upload-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const summarySection = document.getElementById("summary-section");
const summaryEl = document.getElementById("resume-summary");
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

  const file = fileInput.files[0];
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

  // Vercel serverless functions reject request bodies larger than ~4.5 MB,
  // which shows up as a confusing "Failed to fetch". Catch it early.
  const MAX_MB = 4;
  if (file.size > MAX_MB * 1024 * 1024) {
    showStatus(
      `Your file "${file.name}" is ${sizeMb} MB, which is too large ` +
        `(max ${MAX_MB} MB). Save/export your resume as a plain text (.txt) ` +
        "or a lighter PDF and upload that.",
      true
    );
    return;
  }

  setLoading(true);
  hide(summarySection);
  hide(jobsSection);
  showStatus(
    `<span class="spinner"></span> Uploading "${file.name}" (${sizeMb} MB) and searching jobs...`,
    false
  );

  try {
    // Read the file as base64 and send it as JSON. This avoids multipart
    // form-data, which some mobile browsers handle unreliably.
    const base64 = await fileToBase64(file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const resp = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        location: document.getElementById("location").value,
        data: base64,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Read as text first so we can show something useful even if it's not JSON.
    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      showStatus(
        `Server returned an unexpected response (status ${resp.status}). ` +
          (text ? text.slice(0, 200) : "No details."),
        true
      );
      return;
    }

    if (!resp.ok) {
      showStatus(data.error || `Something went wrong (status ${resp.status}).`, true);
      return;
    }

    renderSummary(data.skills || [], data.experience, data.location);

    if (data.message) {
      showStatus(data.message, true);
    } else {
      hide(statusEl);
    }

    renderJobs(data.jobs || []);
  } catch (err) {
    if (err.name === "AbortError") {
      showStatus(
        "The request took too long and timed out. Try again, or use a smaller resume file.",
        true
      );
    } else {
      showStatus(
        "Network error: " +
          err.message +
          ". If you're on an office/corporate WiFi, try mobile data (4G/5G) instead.",
        true
      );
    }
  } finally {
    setLoading(false);
  }
});

function renderSummary(skills, experience, location) {
  // Build the summary line (experience + location).
  const parts = [];
  if (experience != null) {
    parts.push(`Experience: <strong>${experience}+ years</strong>`);
  } else {
    parts.push("Experience: <strong>not detected</strong>");
  }
  parts.push(
    location
      ? `Location: <strong>${escapeHtml(location)}</strong>`
      : "Location: <strong>not detected</strong>"
  );
  summaryEl.innerHTML = parts.join(" &nbsp;·&nbsp; ");

  // Skills chips.
  skillsEl.innerHTML = "";
  for (const s of skills) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = s;
    skillsEl.appendChild(chip);
  }

  show(summarySection);
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

    const salary = job.salaryText ? escapeHtml(job.salaryText) : "";

    // Build badges: skills matched, experience fit, location match.
    const badges = [];
    if (job.matchedSkills.length) {
      badges.push(
        `<span class="badge badge-skill">★ ${job.matchedSkills.length} skill${job.matchedSkills.length > 1 ? "s" : ""} matched</span>`
      );
    }
    if (job.requiredYears != null) {
      const fitClass =
        job.experienceFit === "meets"
          ? "badge-good"
          : job.experienceFit === "below"
          ? "badge-warn"
          : "badge-neutral";
      const fitText =
        job.experienceFit === "meets"
          ? `✓ You meet the ${job.requiredYears}+ yrs required`
          : job.experienceFit === "close"
          ? `~ Needs ${job.requiredYears}+ yrs (close)`
          : job.experienceFit === "below"
          ? `! Needs ${job.requiredYears}+ yrs`
          : `Needs ${job.requiredYears}+ yrs`;
      badges.push(`<span class="badge ${fitClass}">${fitText}</span>`);
    }
    if (job.locationMatch) {
      badges.push(`<span class="badge badge-loc">📍 Location match</span>`);
    }

    card.innerHTML = `
      <div class="badges">${badges.join("")}</div>
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

// Read a File into a base64 string (without the data: URL prefix).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
