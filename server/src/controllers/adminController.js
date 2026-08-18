const Config = require('../models/Config');
const Lead = require('../models/Lead');

const getLeads = async (req, res) => {
  try {
    // Sort leads by recency as requested in the brief
    const leads = await Lead.find().sort({ captured_at: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

const getAdminConfig = async (req, res) => {
  try {
    // Unlike the public route, this returns EVERYTHING including rates and hidden questions
    const config = await Config.findOne().sort({ config_version: -1 });
    if (!config) return res.status(404).json({ error: 'Configuration not found' });
    
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching admin config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
};

const updateConfig = async (req, res) => {
  try {
    const newConfigData = req.body;

    // 1. Find current latest version to increment it
    const currentConfig = await Config.findOne().sort({ config_version: -1 });
    const currentVersion = currentConfig ? currentConfig.config_version : 0;

    // 2. Strip MongoDB-specific immutable fields from the incoming payload
    delete newConfigData._id;
    delete newConfigData.createdAt;
    delete newConfigData.updatedAt;
    delete newConfigData.__v;

    // 3. Increment the version to maintain historical lead integrity
    newConfigData.config_version = currentVersion + 1;

    // 4. Save as a new snapshot
    const newConfig = await Config.create(newConfigData);

    res.status(201).json({ message: 'Configuration successfully updated', config: newConfig });
  } catch (error) {
    console.error('Failed to update config:', error);
    res.status(500).json({ error: 'Failed to save new configuration version' });
  }
};

module.exports = { getLeads, getAdminConfig, updateConfig };