// Vercel serverless entry point. Exports the Express app so Vercel can
// route all /api/* requests through it.
//
// Locally you can still run `npm.cmd start` which uses server.js.

const app = require("../src/app");

module.exports = app;
