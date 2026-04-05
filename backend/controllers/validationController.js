const Prerequisite = require('../models/Prerequisite');
const StudentCourse = require('../models/StudentCourse');
const Course = require('../models/Course');
const EligibilityLog = require('../models/EligibilityLog');

// Check if student is eligible for a course
exports.checkEligibility = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Get prerequisites for the course
    const prerequisites = await Prerequisite.find({ courseId })
      .select('prerequisiteCourseId');

    const requiredCourseIds = prerequisites.map(p => p.prerequisiteCourseId.toString());

    // Get student's completed courses
    const completedCourses = await StudentCourse.find({ studentId })
      .select('courseId');

    const completedCourseIds = completedCourses.map(c => c.courseId.toString());

    // Find missing prerequisites
    const missingPrerequisites = requiredCourseIds.filter(
      courseId => !completedCourseIds.includes(courseId)
    );

    const isEligible = missingPrerequisites.length === 0;

    // Log the eligibility check
    await EligibilityLog.create({
      studentId,
      courseId,
      isEligible,
      missingPrerequisites: missingPrerequisites
    });

    // Get all prerequisite course details
    const allPrerequisiteDetails = await Course.find({
      _id: { $in: requiredCourseIds }
    }).select('courseId courseName');

    // Mark completion status
    const prerequisitesWithStatus = allPrerequisiteDetails.map(course => ({
      ...course.toObject(),
      completed: completedCourseIds.includes(course._id.toString())
    }));

    // Get missing course details
    let missingCourseDetails = [];
    if (missingPrerequisites.length > 0) {
      missingCourseDetails = await Course.find({
        _id: { $in: missingPrerequisites }
      }).select('courseId courseName');
    }

    res.json({
      isEligible,
      message: isEligible ? 'Eligible' : 'Not Eligible',
      missingPrerequisites: missingCourseDetails,
      allPrerequisites: prerequisitesWithStatus
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get eligibility history for a student
exports.getEligibilityHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const history = await EligibilityLog.find({ studentId })
      .populate('courseId', 'courseId courseName')
      .populate('missingPrerequisites', 'courseId courseName')
      .sort({ checkDate: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
