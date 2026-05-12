const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { calculateRiskScore, getRiskLabel } = require('../algorithms/riskScore');
const { rankFarms } = require('../algorithms/matching');
const { validateHarvest } = require('../algorithms/harvestCheck');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('farms').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/matches', async (req, res) => {
  const { budget, horizonMonths, riskTolerance, preferredCountry } = req.query;
  const { data: farms, error } = await supabase.from('farms').select('*').eq('status', 'approved');
  if (error) return res.status(500).json({ error: error.message });
  const investorProfile = {
    budget: parseFloat(budget) || 1000,
    horizonMonths: parseInt(horizonMonths) || 12,
    riskTolerance: riskTolerance || 'medium',
    preferredCountry: preferredCountry || null
  };
  res.json(rankFarms(farms, investorProfile));
});

router.post('/harvest-validate', async (req, res) => {
  const { farm_id, yield_kg, price_per_kg, harvest_date } = req.body;
  const { data: farm, error } = await supabase.from('farms').select('*').eq('id', farm_id).single();
  if (error) return res.status(404).json({ error: 'Farm not found' });
  const result = validateHarvest({ yield_kg, price_per_kg, harvest_date }, farm);
  await supabase.from('harvest_reports').insert({
    farm_id, yield_kg, price_per_kg, harvest_date,
    ai_validation_score: result.score,
    ai_flags: result.flags.join(' | '),
    status: result.status
  });
  res.json(result);
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
// POST /api/farms/match

router.post('/match', async (req, res) => {
  const { budget, horizonMonths, riskTolerance, preferredCountry } = req.body;

  const { data: farms, error } = await supabase
    .from('farms')
    .select('*')
    .eq('status', 'approved');

  if (error) return res.status(500).json({ error });

  const investorProfile = { budget, horizonMonths, riskTolerance, preferredCountry };
  const matches = rankFarms(farms, investorProfile);

  res.json({ matches });
});


// POST /api/farms/harvest/validate
router.post('/harvest/validate', async (req, res) => {
  const { farm_id, yield_kg, price_per_kg, harvest_date } = req.body;

  const { data: farm } = await supabase
    .from('farms').select('*').eq('id', farm_id).single();

  if (!farm) return res.status(404).json({ error: 'Farm not found' });

  const report = { yield_kg, price_per_kg, harvest_date };
  const result = validateHarvest(report, farm);

  await supabase.from('harvest_reports').insert({
    farm_id, yield_kg, price_per_kg, harvest_date,
    ai_validation_score: result.score,
    status: result.status
  });

  res.json(result);
});
module.exports = router;
