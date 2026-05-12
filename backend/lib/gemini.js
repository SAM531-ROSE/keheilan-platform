const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel(modelName = 'gemini-2.5-flash') 
{  return genAI.getGenerativeModel({ model: modelName });
}

module.exports = { getModel };