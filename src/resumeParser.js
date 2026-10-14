// Extract plain text from an uploaded resume (PDF, DOCX, or TXT).

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(filename, buffer) {
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
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
