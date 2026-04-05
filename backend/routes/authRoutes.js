const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get profile (requires auth)
router.get('/profile', authMiddleware, authController.getProfile);

// Get all users (Admin only)
router.get('/users', authMiddleware, authController.getUsers);

module.exports = router;
