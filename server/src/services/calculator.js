/**
 * Calculates the low and high estimate bounds based on the active config and user answers.
 * Throws an error if required inputs are missing or invalid.
 */
const calculateEstimate = (config, answers) => {
  const { questions, modifiers } = config;
  
  // 1. Strict Validation on Roof Area
  const roofArea = Number(answers['roof_area']);
  if (!roofArea || isNaN(roofArea)) {
    throw new Error('Valid roof_area is required for calculation.');
  }

  // Helper function to find the selected option for a specific question
  const getSelectedOption = (questionKey) => {
    const q = questions.find(item => item.key === questionKey);
    if (!q || !q.options) return null;
    
    const selectedValue = answers[questionKey];
    if (!selectedValue) return null; // Missing answer

    return q.options.find(opt => opt.value === selectedValue) || null;
  };

  // 2. Extract Options
  const materialOpt = getSelectedOption('material');
  const pitchOpt = getSelectedOption('pitch');
  const layersOpt = getSelectedOption('layers');
  const storiesOpt = getSelectedOption('stories');

  // Strict Validation on Required Enums
  if (!materialOpt) throw new Error('Valid material selection is required.');
  if (!pitchOpt) throw new Error('Valid pitch selection is required.');
  if (!layersOpt) throw new Error('Valid layers selection is required.');
  if (!storiesOpt) throw new Error('Valid stories selection is required.');

  // 3. Extract Rates safely
  const ratePerSqft = Number(materialOpt.rate_per_sqft || 0);
  const pitchMult = Number(pitchOpt.multiplier || 1.0);
  const tearOffPerSqft = Number(layersOpt.tear_off_per_sqft || 0);
  const storiesMult = Number(storiesOpt.multiplier || 1.0);

  // Extract Modifiers safely
  const wasteFactor = Number(modifiers.waste_factor || 0.10);
  const permitFee = Number(modifiers.permit_flat_fee || 350);
  
  // The DB stores spread as a whole number (e.g., 12 for 12%)
  const spreadPct = Number(modifiers.range_spread_pct || 12) / 100;

  // 4. Execute the Formula
  const baseMaterialCost = roofArea * ratePerSqft * (1 + wasteFactor);
  const tearOffCost = roofArea * tearOffPerSqft;
  
  const subtotal = (baseMaterialCost + tearOffCost) * pitchMult * storiesMult;
  const midPointEstimate = subtotal + permitFee;

  // 5. Calculate Bounds and Round to nearest whole dollar
  const estimateLow = Math.round(midPointEstimate * (1 - spreadPct));
  const estimateHigh = Math.round(midPointEstimate * (1 + spreadPct));

  return {
    estimate_low: estimateLow,
    estimate_high: estimateHigh
  };
};

module.exports = { calculateEstimate };