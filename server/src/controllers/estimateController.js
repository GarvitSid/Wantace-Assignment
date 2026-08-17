const Config = require('../models/Config');
const Lead = require('../models/Lead');
const { calculateEstimate } = require('../services/calculator');

const submitEstimate = async (req, res) => {
  try {
    const { name, phone, email, answers } = req.body;

    // Basic input validation
    if (!name || !phone || !email || !answers) {
      return res.status(400).json({ error: 'Contact information and answers are required.' });
    }

    // 1. Fetch the LIVE configuration at the moment of submission
    const liveConfig = await Config.findOne().sort({ config_version: -1 });
    
    if (!liveConfig) {
      return res.status(500).json({ error: 'System configuration error.' });
    }

    // 2. Calculate the estimate using the server-side engine
    // (This will automatically throw an error if the answers are invalid)
    const { estimate_low, estimate_high } = calculateEstimate(liveConfig, answers);

    // 3. Persist the Lead with the historical config_version
    await Lead.create({
      name,
      phone,
      email,
      answers,
      config_version: liveConfig.config_version,
      estimate_low,
      estimate_high
    });

    // 4. Return only the final numbers to the client
    res.status(200).json({
      estimate_low,
      estimate_high
    });

  } catch (error) {
    console.error('Estimate error:', error.message);
    // Catch validation errors thrown by our calculator (e.g., missing roof_area)
    res.status(400).json({ error: error.message || 'Unable to calculate estimate.' });
  }
};

module.exports = { submitEstimate };