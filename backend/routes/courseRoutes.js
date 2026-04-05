const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Add course (Admin only)
router.post('/', authMiddleware, adminMiddleware, courseController.addCourse);

// Get all courses
router.get('/', courseController.getAllCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// Update course (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, courseController.updateCourse);

// Delete course (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, courseController.deleteCourse);

module.exports = router;
