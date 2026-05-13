const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs2 = require('fs');
const { getModel, generateWithFallback } = require('../lib/gemini');
const supabase = require('../lib/supabase');
const { parseSearchQuery, applyFilters } = require('../algorithms/naturalSearch');
const upload = multer({ dest: 'uploads/' });

router.post('/kyc', upload.single('document'), async (req, res) => {
  try {
    const { fullName, idNumber } = req.body;
    const imageData = fs2.readFileSync(req.file.path);
    const base64Image = imageData.toString('base64');
    const mimeType = req.file.mimetype;
    const model = getModel();
    const prompt = 'You are a KYC assistant. Verify: name: ' + fullName + ', ID: ' + idNumber + '. Respond ONLY in JSON: {extractedName,extractedId,documentType,expiryDate,nameMatch,idMatch,verified,confidence,reason}';
    const result = await model.generateContent([prompt, { inlineData: { data: base64Image, mimeType } }]);
    let text = result.response.text().trim();
    fs2.unlinkSync(req.file.path);
    res.json(JSON.parse(text));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/summarise', async (req, res) => {
  try {
    const { farm_id } = req.body;
    const { data: farm, error } = await supabase.from('farms').select('*').eq('id', farm_id).single();
    if (error) return res.status(404).json({ error: 'Farm not found' });
    const prompt = 'You are an agricultural investment analyst. Analyze this farm and provide due diligence. Farm: ' + JSON.stringify(farm) + '. Respond ONLY in JSON: {summary,riskAssessment,operatorProfile,marketOutlook,recommendation,investmentScore}';
    const fallback = () => {
      const riskScore = farm.risk_score || 50;
      const sus = farm.sustainability_score || 50;
      let recommendation, investmentScore;
      if (riskScore < 34 && sus >= 70)      { recommendation = 'RECOMMENDED';          investmentScore = 85; }
      else if (riskScore < 67 && sus >= 50) { recommendation = 'PROCEED WITH CAUTION'; investmentScore = 65; }
      else                                  { recommendation = 'HIGH RISK';            investmentScore = 40; }
      return JSON.stringify({
        summary: farm.name + ' is a ' + farm.crop_type + ' farm in ' + farm.location,
        riskAssessment: 'Risk score: ' + riskScore + '/100',
        operatorProfile: 'Experience: ' + (farm.operator_experience_years || 0) + ' years',
        marketOutlook: 'Crop: ' + farm.crop_type,
        recommendation,
        investmentScore
      });
    };
    const result = await generateWithFallback(prompt, fallback);
    let text = result.data;
    res.json({ ...JSON.parse(text), source: result.source });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const prompt = 'Parse this farm search query into filters. Query: ' + query + '. Respond ONLY in JSON: {crop_type,country,investment_model,max_risk_score,min_risk_score,max_min_investment,min_min_investment}. investment_model must be fractional, operations, hybrid, or null.';
    const fallback = () => JSON.stringify(parseSearchQuery(query));
    const result = await generateWithFallback(prompt, fallback);
    const filters = JSON.parse(result.data);
    const { data: farms, error } = await supabase.from('farms').select('*').eq('status', 'approved');
    if (error) return res.status(500).json({ error: error.message });
    const filtered = applyFilters(farms, filters);
    res.json({ query, source: result.source, filtersDetected: filters, totalFound: filtered.length, farms: filtered });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;