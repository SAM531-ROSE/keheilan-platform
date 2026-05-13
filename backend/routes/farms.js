const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { calculateRiskScore, getRiskLabel } = require('../algorithms/riskScore');
const { rankFarms } = require('../algorithms/matching');
const { validateHarvest } = require('../algorithms/harvestCheck');
const { generateWithFallback } = require('../lib/gemini');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('farms').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/matches', async (req, res) => {
  const { budget, horizonMonths, riskTolerance, preferredCountry, investmentModel } = req.query;
  const { data: farms, error } = await supabase.from('farms').select('*').eq('status', 'approved');
  if (error) return res.status(500).json({ error: error.message });
  const investorProfile = {
    budget: parseFloat(budget) || 1000,
    horizonMonths: parseInt(horizonMonths) || 12,
    riskTolerance: riskTolerance || 'medium',
    preferredCountry: preferredCountry || null,
    investmentModel: investmentModel || null
  };
  res.json(rankFarms(farms, investorProfile));
});

router.post('/harvest-validate', async (req, res) => {
  try {
    const { farm_id, yield_kg, price_per_kg, harvest_date } = req.body;
    const { data: farm, error } = await supabase.from('farms').select('*').eq('id', farm_id).single();
    if (error) return res.status(404).json({ error: 'Farm not found' });

    const report = { yield_kg, price_per_kg, harvest_date };

    const prompt = 'You are an agricultural harvest validation expert. Validate this harvest report and check if the numbers are realistic. Farm: ' + JSON.stringify(farm) + '. Harvest report: ' + JSON.stringify(report) + '. Respond ONLY in JSON: {valid,score,flags,status,reasoning}. score is 0-100. status must be approved, manual_review, or rejected. flags is an array of issues found.';

    const fallback = () => JSON.stringify(validateHarvest(report, farm));

    const result = await generateWithFallback(prompt, fallback);
    let text = result.data;
    const validation = JSON.parse(text);

    await supabase.from('harvest_reports').insert({
      farm_id, yield_kg, price_per_kg, harvest_date,
      ai_validation_score: validation.score,
      ai_flags: Array.isArray(validation.flags) ? validation.flags.join(' | ') : validation.flags,
      status: validation.status
    });

    res.json({ ...validation, source: result.source });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('farms').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Farm not found' });
  res.json(data);
});

router.post('/:id/risk-score', async (req, res) => {
  const { investorBudget, investorHorizonMonths } = req.body;
  const { data: farm, error } = await supabase.from('farms').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Farm not found' });
  const score = calculateRiskScore(farm, investorBudget, investorHorizonMonths);
  const risk = getRiskLabel(score);
  res.json({ farmId: req.params.id, score, ...risk });
});

module.exports = router;