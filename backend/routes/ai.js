// backend/routes/ai.js
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const fs       = require('fs');
const { getModel } = require('../lib/gemini');
const supabase = require('../lib/supabase');
const upload   = multer({ dest: 'uploads/' });

// F4 - KYC
router.post('/kyc', upload.single('document'), async (req, res) => {
  try {
    const { fullName, idNumber } = req.body;
    const filePath    = req.file.path;
    const imageData   = fs.readFileSync(filePath);
    const base64Image = imageData.toString('base64');
    const mimeType    = req.file.mimetype;
    const model  = getModel();
    const prompt = `You are a KYC verification assistant. Analyze this ID document image and extract:
1. Full name on the document
2. ID number on the document
3. Document type (passport, national ID, driving license)
4. Expiry date if visible
Then verify if these match what the user submitted:
- User submitted name: ${fullName}
- User submitted ID number: ${idNumber}
Respond in this exact JSON format:
{"extractedName":"...","extractedId":"...","documentType":"...","expiryDate":"...","nameMatch":true,"idMatch":true,"verified":true,"confidence":0,"reason":"..."}`;
    const result = await model.generateContent([prompt, { inlineData: { data: base64Image, mimeType } }]);
    let text = result.response.text().trim();
    text = text.replace(/```json/g,'').replace(/```/g,'');
    const parsed = JSON.parse(text);
    fs.unlinkSync(filePath);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F5 - Due Diligence with Gemini AI
router.post('/summarise', async (req, res) => {
  try {
    const { farm_id } = req.body;
    const { data: farm, error } = await supabase
      .from('farms').select('*').eq('id', farm_id).single();
    if (error) return res.status(404).json({ error: 'Farm not found' });
    const model  = getModel();
    const prompt = `You are an agricultural investment analyst. Analyze this farm and generate a professional due diligence report.
Farm Data:
- Name: ${farm.name}
- Location: ${farm.location}, ${farm.country}
- Crop: ${farm.crop_type}
- Size: ${farm.size_ha} hectares
- Risk Score: ${farm.risk_score}/100
- Sustainability Score: ${farm.sustainability_score}/100
- Operator Experience: ${farm.operator_experience_years} years
- Minimum Investment: $${farm.min_investment}
- Lock-up Period: ${farm.lock_up_months} months
- Investment Model: ${farm.investment_model}
Respond in this exact JSON format:
{"summary":"...","riskAssessment":"...","operatorProfile":"...","sustainability":"...","marketOutlook":"...","investmentModel":"...","recommendation":"RECOMMENDED or PROCEED WITH CAUTION or HIGH RISK","investmentScore":0,"reason":"..."}`;
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json/g,'').replace(/```/g,'');
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // POST /api/ai/search
router.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  // Use local algorithm — no AI API needed
  const { parseSearchQuery } = require('../algorithms/naturalSearch');
  const filters = parseSearchQuery(query);

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