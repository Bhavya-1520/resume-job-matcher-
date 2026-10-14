// Local development server. On Vercel, api/index.js is used instead.

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  Resume Job Matcher running at http://localhost:${PORT}\n`);
});
