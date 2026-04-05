const express = require('express');
const router = express.Router();
const studentCourseController = require('../controllers/studentCourseController');
const { authMiddleware } = require('../middleware/auth');

// Add completed course
router.post('/', authMiddleware, studentCourseController.addCompletedCourse);

// Get student's completed courses
router.get('/', authMiddleware, studentCourseController.getStudentCourses);

// Get students who completed a course
router.get('/course/:courseId', studentCourseController.getStudentsByCourse);

// Remove course from student
router.delete('/:id', authMiddleware, studentCourseController.removeCompletedCourse);

module.exports = router;
