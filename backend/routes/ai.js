// backend/routes/ai.js  — F4: KYC Document Screening
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const fs      = require('fs');
const { getModel } = require('../lib/gemini');
const supabase = require('../lib/supabase');
const upload = multer({ dest: 'uploads/' });

// POST /api/ai/kyc
router.post('/kyc', upload.single('document'), async (req, res) => {
  try {
    const { fullName, idNumber } = req.body;
    const filePath = req.file.path;

    // Read the uploaded image as base64
    const imageData   = fs.readFileSync(filePath);
    const base64Image = imageData.toString('base64');
    const mimeType    = req.file.mimetype;

    const model  = getModel();
    const prompt = `
You are a KYC verification assistant. Analyze this ID document image and extract:
1. Full name on the document
2. ID number on the document
3. Document type (passport, national ID, driving license)
4. Expiry date if visible

Then verify if these match what the user submitted:
- User submitted name: ${fullName}
- User submitted ID number: ${idNumber}

Respond in this exact JSON format:
{
  "extractedName": "...",
  "extractedId": "...",
  "documentType": "...",
  "expiryDate": "...",
  "nameMatch": true/false,
  "idMatch": true/false,
  "verified": true/false,
  "confidence": 0-100,
  "reason": "explanation"
}
`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } }
    ]);

    // Clean and parse response
    let text = result.response.text().trim();
    text = text.replace(/```json/g,'').replace(/```/g,'');
    const parsed = JSON.parse(text);

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/search
router.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  // Use algorithm to parse the query
  const { parseSearchQuery } = require('../algorithms/naturalSearch');
  const filters = parseSearchQuery(query);

  // Build database query
  let q = supabase.from('farms').select('*').eq('status', 'approved');

  if (filters.crop_type) q = q.eq('crop_type', filters.crop_type);
  if (filters.country) q = q.eq('country', filters.country);
  if (filters.max_risk_score) q = q.lte('risk_score', filters.max_risk_score);
  if (filters.max_min_investment) q = q.lte('min_investment', filters.max_min_investment);

  const { data: farms, error } = await q;

  if (error) return res.status(500).json({ error });

  res.json({ filters, farms });
});

module.exports = router;