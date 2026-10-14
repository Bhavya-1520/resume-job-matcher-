# Resume Job Matcher

Upload your resume, the app reads your skills, and shows matching jobs.

- **No API keys, no signup, no credit card** — uses free, open job APIs
  (Remotive + Arbeitnow).
- **No OpenAI / paid AI** — skill extraction runs on the server.
- Deploy to **Vercel** to get a public link you can open on your phone from any
  network (including office WiFi).

## Why deploy it online?

On an office network, job sites are often blocked, so running the app on your
work laptop can't fetch jobs. When you deploy to Vercel, the job requests come
from **Vercel's servers**, not your laptop — so the office firewall doesn't
affect it. You just open a normal web link on your phone.

## Deploy to Vercel (recommended)

You can do all of this from your phone or any browser.

### 1. Put the code on GitHub

1. Create a free account at https://github.com (if you don't have one).
2. Create a new empty repository, e.g. `resume-job-matcher`.
3. Upload this project's files to it. Easiest from the laptop terminal:

   ```powershell
   git init
   git add .
   git commit -m "Resume job matcher"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/resume-job-matcher.git
   git push -u origin main
   ```

   (If `git` isn't installed, GitHub's website also lets you drag-and-drop files
   into a new repo.)

### 2. Deploy on Vercel

1. Go to https://vercel.com and sign in with your GitHub account (free).
2. Click **Add New → Project**.
3. Import your `resume-job-matcher` repo.
4. Leave all settings as default and click **Deploy**.
5. After ~1 minute you'll get a public URL like
   `https://resume-job-matcher.vercel.app`.

### 3. Open it on your phone

Just open that Vercel URL in your phone's browser. Upload your resume, tap
**Find Jobs**, and you'll see matching jobs. Works on any network.

## Run locally (optional)

This laptop blocks the PowerShell `npm` script, so use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd start
```

Then open http://localhost:3000. Note: on an office network the job fetch may be
blocked locally — that's expected, and exactly why deploying online helps.

## Project structure

```
server.js            Local dev server (uses src/app.js)
vercel.json          Vercel routing config
api/index.js         Vercel serverless entry (uses src/app.js)
src/
  app.js             The Express app (shared by local + Vercel)
  resumeParser.js    Extracts text from PDF/DOCX/TXT
  skillsDb.js        List of known skills
  skillExtractor.js  Finds skills in the resume text
  jobSearch.js       Calls free job APIs and ranks results
public/
  index.html         The web page
  styles.css         Styling
  app.js             Frontend logic
```

## Notes and limits

- **Scanned/image PDFs** won't work — the app needs text-based resumes.
- The free job sources (Remotive, Arbeitnow) lean toward **remote / tech roles**
  and are more global than India-specific. You'll see fewer local listings and
  more remote ones.
- Edit `src/skillsDb.js` to add your own skills/keywords and improve detection.
- LinkedIn / Naukri direct access is intentionally not included — they block
  scraping and have no free public API.
