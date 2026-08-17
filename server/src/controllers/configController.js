const Config = require('../models/Config');

const getActiveConfig = async (req, res) => {
  try {
    // Fetch the latest active configuration (highest config_version)
    const config = await Config.findOne().sort({ config_version: -1 });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Filter for active questions only
    const activeQuestions = config.questions.filter(q => q.active);

    // SECURITY BOUNDARY: Strip proprietary rates/multipliers from the options
    // The frontend only needs 'label' and 'value' to render the form.
    const safeQuestions = activeQuestions.map(q => {
      const safeOptions = q.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
      
      return {
        key: q.key,
        label: q.label,
        type: q.type,
        unit: q.unit,
        required: q.required,
        min: q.min,
        max: q.max,
        options: safeOptions
      };
    });

    res.status(200).json({
      business: config.business,
      questions: safeQuestions
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to load estimator configuration' });
  }
};

module.exports = { getActiveConfig };