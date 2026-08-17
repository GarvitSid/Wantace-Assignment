const express = require('express');
const router = express.Router();

const { getActiveConfig } = require('../controllers/configController');
const { submitEstimate } = require('../controllers/estimateController');

// GET /api/config -> Returns public config
router.get('/config', getActiveConfig);

// POST /api/estimate -> Submits answers and returns price
router.post('/estimate', submitEstimate);

module.exports = router;