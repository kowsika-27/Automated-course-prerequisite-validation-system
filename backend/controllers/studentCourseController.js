const StudentCourse = require('../models/StudentCourse');
const Course = require('../models/Course');

// Add completed course for student
exports.addCompletedCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student has already completed this course
    const existingCourse = await StudentCourse.findOne({
      studentId,
      courseId
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course already added' });
    }

    const studentCourse = new StudentCourse({
      studentId,
      courseId
    });

    await studentCourse.save();

    res.json({ message: 'Course added successfully', studentCourse });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all completed courses for a student
exports.getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const studentCourses = await StudentCourse.find({ studentId })
      .populate('courseId', 'courseId courseName description credits');

    // Filter out courses where courseId is null (orphaned records)
    const validCourses = studentCourses.filter(sc => sc.courseId !== null);

    res.json(validCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all students for a specific course
exports.getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const studentCourses = await StudentCourse.find({ courseId })
      .populate('studentId', 'name email');

    res.json(studentCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove course from student's completed list
exports.removeCompletedCourse = async (req, res) => {
  try {
    const studentCourse = await StudentCourse.findByIdAndDelete(req.params.id);

    if (!studentCourse) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Course removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
