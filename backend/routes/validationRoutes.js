const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validationController');
const { authMiddleware } = require('../middleware/auth');

// Check eligibility for a course
router.post('/check', authMiddleware, validationController.checkEligibility);

// Get eligibility history
router.get('/history', authMiddleware, validationController.getEligibilityHistory);

module.exports = router;
