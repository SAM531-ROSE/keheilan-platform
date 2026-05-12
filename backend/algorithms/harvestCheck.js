const CROP_BENCHMARKS = {
  wheat:   { yieldPerHa: { min: 1500, max: 5000 }, pricePerKg: { min: 0.15, max: 0.45 }, months: [5,6,7] },
  corn:    { yieldPerHa: { min: 3000, max: 9000 }, pricePerKg: { min: 0.12, max: 0.30 }, months: [8,9,10] },
  rice:    { yieldPerHa: { min: 2000, max: 7000 }, pricePerKg: { min: 0.20, max: 0.55 }, months: [9,10,11] },
  cotton:  { yieldPerHa: { min: 500,  max: 2500 }, pricePerKg: { min: 1.00, max: 2.50 }, months: [10,11,12] },
  soybean: { yieldPerHa: { min: 1500, max: 4000 }, pricePerKg: { min: 0.30, max: 0.70 }, months: [9,10,11] },
};
function validateHarvest(report, farm) {
  const crop = (farm.crop_type || "").toLowerCase();
  const benchmark = CROP_BENCHMARKS[crop];
  const flags = [];
  let score = 100;
  if (!benchmark) {
    return { valid: true, score: 70, flags: ["No benchmark for this crop"], status: "manual_review" };
  }
  const yieldPerHa = report.yield_kg / (farm.size_ha || 1);
  if (yieldPerHa < benchmark.yieldPerHa.min) {
    flags.push("Yield too low: " + yieldPerHa.toFixed(0) + " kg/ha");
    score -= 35;
  } else if (yieldPerHa > benchmark.yieldPerHa.max * 1.4) {
    flags.push("Yield suspiciously high: " + yieldPerHa.toFixed(0) + " kg/ha");
    score -= 30;
  }
  const price = report.price_per_kg;
  if (price < benchmark.pricePerKg.min || price > benchmark.pricePerKg.max * 1.5) {
    flags.push("Price out of range: " + price + "/kg");
    score -= 35;
  }
  const harvestMonth = new Date(report.harvest_date).getMonth() + 1;
  if (!benchmark.months.includes(harvestMonth)) {
    flags.push("Harvest date out of season (expected months: " + benchmark.months.join(", ") + ")");
    score -= 30;
  }
  const finalScore = Math.max(score, 0);
  return {
    valid: finalScore >= 60,
    score: finalScore,
    flags,
    status: finalScore >= 80 ? "approved" : finalScore >= 60 ? "manual_review" : "rejected"
  };
}
module.exports = { validateHarvest };