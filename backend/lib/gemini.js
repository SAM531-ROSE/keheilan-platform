const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
function getModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}
async function generateWithFallback(prompt, fallbackFn) {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return { source: "gemini", data: result.response.text().trim() };
  } catch (err) {
    console.log("Gemini unavailable, using algorithm fallback");
    return { source: "algorithm", data: fallbackFn() };
  }
}
module.exports = { getModel, generateWithFallback };