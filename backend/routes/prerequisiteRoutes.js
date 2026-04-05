const express = require('express');
const router = express.Router();
const prerequisiteController = require('../controllers/prerequisiteController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Set prerequisite (Admin only)
router.post('/', authMiddleware, adminMiddleware, prerequisiteController.setPrerequisite);

// Get prerequisites for a course
router.get('/course/:courseId', prerequisiteController.getPrerequisites);

// Get all prerequisites
router.get('/', prerequisiteController.getAllPrerequisites);

// Delete prerequisite (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, prerequisiteController.deletePrerequisite);

module.exports = router;
