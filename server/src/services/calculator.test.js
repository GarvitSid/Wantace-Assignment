const assert = require('assert');
const { calculateEstimate } = require('./calculator');

// Reconstruct the mock config from Version 3
const mockConfig = {
  questions: [
    { key: "material", options: [{ value: "asphalt_arch", rate_per_sqft: 5.90 }] },
    { key: "pitch", options: [{ value: "medium", multiplier: 1.12 }] },
    { key: "layers", options: [{ value: "1", tear_off_per_sqft: 1.15 }] },
    { key: "stories", options: [{ value: "2", multiplier: 1.08 }] }
  ],
  modifiers: { waste_factor: 0.10, permit_flat_fee: 350, range_spread_pct: 12 }
};

// Ana Ruiz's answers (from the seed data)
const mockAnswers = {
  roof_area: 2100,
  material: "asphalt_arch",
  pitch: "medium",
  layers: "1",
  stories: "2"
};

try {
  console.log('Running calculator tests...');
  
  const result = calculateEstimate(mockConfig, mockAnswers);
  
  // Based on our manual math:
  // Material: 2100 * 5.90 * 1.10 = 13629
  // Tear-off: 2100 * 1.15 = 2415
  // Subtotal: (13629 + 2415) * 1.12 * 1.08 = 19406.8224
  // Midpoint: 19406.8224 + 350 = 19756.8224
  // Low: 19756.8224 * 0.88 = 17386.00 (rounded)
  // High: 19756.8224 * 1.12 = 22127.64 (rounded to 22128)
  
  assert.strictEqual(result.estimate_low, 17386, `Expected low 17386, got ${result.estimate_low}`);
  assert.strictEqual(result.estimate_high, 22128, `Expected high 22128, got ${result.estimate_high}`);
  
  console.log('✅ Success: Core arithmetic is correct.');

  // Test failure on missing data
  try {
    calculateEstimate(mockConfig, { ...mockAnswers, roof_area: undefined });
    console.error('❌ Failed: Calculator should throw on missing roof_area');
  } catch (e) {
    console.log('✅ Success: Calculator correctly rejects missing roof_area.');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
}