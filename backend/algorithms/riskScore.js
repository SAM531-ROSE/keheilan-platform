function calculateRiskScore(farm, investorBudget, investorHorizonMonths) {
  let score = 0;
  const sustainability = farm.sustainability_score || 50;
  score += (100 - sustainability) * 0.3;
  const minInvestment = farm.min_investment || 1000;
  const ratio = investorBudget / minInvestment;
  if (ratio < 1.5) score += 35;
  else if (ratio < 2) score += 25;
  else if (ratio < 3) score += 15;
  else score += 5;
  const farmLockUp = farm.lock_up_months || 12;
  const horizonDiff = Math.abs(investorHorizonMonths - farmLockUp);
  if (horizonDiff <= 3) score += 5;
  else if (horizonDiff <= 12) score += 10;
  else score += 15;
  const years = farm.operator_experience_years || 0;
  if (years > 5) score += 4;
  else if (years >= 2) score += 10;
  else score += 20;
  return Math.round(Math.min(score, 100));
}
function getRiskLabel(score) {
  if (score < 30) return { label: "LOW", color: "green" };
  if (score < 60) return { label: "MEDIUM", color: "orange" };
  return { label: "HIGH", color: "red" };
}
module.exports = { calculateRiskScore, getRiskLabel };