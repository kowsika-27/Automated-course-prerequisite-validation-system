const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get eligible students for a course (Admin only)
router.get('/eligible/:courseId', authMiddleware, adminMiddleware, reportController.getEligibleStudents);

// Get not eligible students for a course (Admin only)
router.get('/not-eligible/:courseId', authMiddleware, adminMiddleware, reportController.getNotEligibleStudents);

// Get course-wise eligibility report (Admin only)
router.get('/course-report/all', authMiddleware, adminMiddleware, reportController.getCourseWiseReport);

// Get dashboard statistics
router.get('/stats', authMiddleware, reportController.getDashboardStats);

module.exports = router;
