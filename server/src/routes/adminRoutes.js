const express = require('express');
const router = express.Router();

const { login } = require('../controllers/authController');
const { getLeads, getAdminConfig, updateConfig } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

// --- Auth Routes ---
// POST /api/auth/login
router.post('/auth/login', login);

// --- Protected Admin Routes ---
// GET /api/admin/leads
router.get('/admin/leads', verifyToken, getLeads);

// GET /api/admin/config
router.get('/admin/config', verifyToken, getAdminConfig);

// PUT /api/admin/config
router.put('/admin/config', verifyToken, updateConfig);

module.exports = router;