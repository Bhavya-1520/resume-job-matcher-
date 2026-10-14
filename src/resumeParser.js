// Extract plain text from an uploaded resume (PDF, DOCX, or TXT).

// Require the inner implementation directly. The pdf-parse index file has a
// debug block that tries to read a local test PDF when required at the top
// level, which can crash on serverless hosts like Vercel. The lib path avoids
// that entirely.
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const mammoth = require("mammoth");

async function extractText(filename, buffer) {
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    try {
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (e) {
      const err = new Error(
        "Could not read this PDF. It may be a scanned/image PDF or an " +
          "unusual format. Try exporting your resume as a text-based PDF, " +
          "DOCX, or TXT. (" + e.message + ")"
      );
      err.statusCode = 400;
      throw err;
    }
  }

  if (name.endsWith(".docx")) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (e) {
      const err = new Error("Could not read this DOCX file. (" + e.message + ")");
      err.statusCode = 400;
      throw err;
    }
  }

  if (name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  const err = new Error(
    "Unsupported file type. Please upload a PDF, DOCX, or TXT resume."
  );
  err.statusCode = 400;
  throw err;
}

module.exports = { extractText };
