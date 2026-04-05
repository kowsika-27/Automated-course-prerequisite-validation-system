const EligibilityLog = require('../models/EligibilityLog');
const StudentCourse = require('../models/StudentCourse');
const Course = require('../models/Course');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEnrollments = await StudentCourse.countDocuments();

    res.json({
      totalCourses,
      totalStudents,
      totalEnrollments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get eligible students for a course
exports.getEligibleStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const eligibleLogs = await EligibilityLog.find({
      courseId,
      isEligible: true
    })
      .populate('studentId', 'name email')
      .sort({ checkDate: -1 });

    res.json(eligibleLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get not eligible students for a course
exports.getNotEligibleStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const notEligibleLogs = await EligibilityLog.find({
      courseId,
      isEligible: false
    })
      .populate('studentId', 'name email')
      .populate('missingPrerequisites', 'courseId courseName')
      .sort({ checkDate: -1 });

    res.json(notEligibleLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get course-wise eligibility report
exports.getCourseWiseReport = async (req, res) => {
  try {
    const courses = await Course.find().select('_id courseId courseName');

    const report = [];

    for (const course of courses) {
      const eligibleCount = await EligibilityLog.countDocuments({
        courseId: course._id,
        isEligible: true
      });

      const notEligibleCount = await EligibilityLog.countDocuments({
        courseId: course._id,
        isEligible: false
      });

      report.push({
        courseId: course.courseId,
        courseName: course.courseName,
        eligibleCount,
        notEligibleCount,
        totalChecked: eligibleCount + notEligibleCount
      });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all eligibility logs
exports.getAllEligibilityLogs = async (req, res) => {
  try {
    const logs = await EligibilityLog.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'courseId courseName')
      .populate('missingPrerequisites', 'courseId courseName')
      .sort({ checkDate: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
