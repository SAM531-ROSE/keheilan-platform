//algorithms/naturalSearch.js

function parseSearchQuery(query) {
  const filters = {
    crop_type: null,
    country: null,
    max_risk_score: null,
    max_min_investment: null,
  };
  const q = query.toLowerCase();
  // Crop detection
  const crops = ['wheat', 'corn', 'rice', 'tomato', 'cotton'];
  crops.forEach(crop => {
    if (q.includes(crop)) filters.crop_type = crop;
  });
  // Risk detection
  if (q.includes('low risk')) filters.max_risk_score = 33;
  else if (q.includes('medium risk')) filters.max_risk_score = 66;
  // Budget detection
  const budgetMatch = q.match(/\$?([\d,]+)/);
  if (budgetMatch) {
    filters.max_min_investment = Number(budgetMatch[1].replace(',', ''));
  }
  // Country detection
  const countries = ['egypt', 'kenya', 'nigeria', 'morocco', 'ethiopia'];
  countries.forEach(c => {
    if (q.includes(c)) filters.country = c;
  });

  return filters;
}


function applyFilters(farms, filters) {
  return farms.filter(farm => {
    if (filters.crop_type && farm.crop_type?.toLowerCase() !== filters.crop_type) return false;
    if (filters.country && farm.country?.toLowerCase() !== filters.country) return false;
    if (filters.investment_model && farm.investment_model?.toLowerCase() !== filters.investment_model) return false;
    if (filters.max_risk_score !== null && farm.risk_score > filters.max_risk_score) return false;
    if (filters.min_risk_score !== null && farm.risk_score < filters.min_risk_score) return false;
    if (filters.max_min_investment !== null && farm.min_investment > filters.max_min_investment) return false;
    if (filters.min_min_investment !== null && farm.min_investment < filters.min_min_investment) return false;
    return true;
  });
}
module.exports = { parseSearchQuery, applyFilters };
