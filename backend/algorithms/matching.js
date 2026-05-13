function calculateCompatibility(farm, investorProfile) {
  let score = 0;
  const ratio = investorProfile.budget / (farm.min_investment || 1000);
  if (ratio >= 3) score += 25;
  else if (ratio >= 2) score += 18;
  else if (ratio >= 1) score += 10;
  else score += 0;

  const diff = Math.abs(investorProfile.horizonMonths - (farm.lock_up_months || 12));
  if (diff <= 3) score += 25;
  else if (diff <= 6) score += 18;
  else if (diff <= 12) score += 10;
  else score += 0;

  const riskScore = farm.risk_score || 50;
  if (investorProfile.riskTolerance === 'low' && riskScore < 30) score += 25;
  else if (investorProfile.riskTolerance === 'medium' && riskScore < 60) score += 25;
  else if (investorProfile.riskTolerance === 'high') score += 25;
  else score += 10;

  const sus = farm.sustainability_score || 50;
  if (sus >= 80) score += 15;
  else if (sus >= 60) score += 10;
  else if (sus >= 40) score += 5;
  if (investorProfile.preferredCountry && farm.country === investorProfile.preferredCountry) score += 10;
  else score += 5;

  const annualReturn = 0.09;
  const years = (farm.lock_up_months || 12) / 12;
  const estimatedReturn = Math.round(investorProfile.budget * annualReturn * years);
  return { farmId: farm.id, farmName: farm.name, compatibilityScore: Math.min(score, 100), estimatedReturn };
}

function rankFarms(farms, investorProfile) {
  return farms
    .map(farm => calculateCompatibility(farm, investorProfile))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

module.exports = { rankFarms };
