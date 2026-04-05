const Prerequisite = require('../models/Prerequisite');
const Course = require('../models/Course');

// Set prerequisite for a course (Admin only)
exports.setPrerequisite = async (req, res) => {
  try {
    const { courseId, prerequisiteCourseId } = req.body;

    // Validate courses exist
    const course = await Course.findById(courseId);
    const prereqCourse = await Course.findById(prerequisiteCourseId);

    if (!course || !prereqCourse) {
      return res.status(404).json({ message: 'One or both courses not found' });
    }

    // Check if prerequisite already exists
    const existingPrereq = await Prerequisite.findOne({
      courseId,
      prerequisiteCourseId
    });

    if (existingPrereq) {
      return res.status(400).json({ message: 'Prerequisite already exists' });
    }

    const prerequisite = new Prerequisite({
      courseId,
      prerequisiteCourseId,
      createdBy: req.user.id
    });

    await prerequisite.save();

    res.json({ message: 'Prerequisite set successfully', prerequisite });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get prerequisites for a course
exports.getPrerequisites = async (req, res) => {
  try {
    const prerequisites = await Prerequisite.find({ courseId: req.params.courseId })
      .populate('courseId', 'courseName courseId')
      .populate('prerequisiteCourseId', 'courseName courseId');

    res.json(prerequisites);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all prerequisite mappings
exports.getAllPrerequisites = async (req, res) => {
  try {
    const prerequisites = await Prerequisite.find()
      .populate('courseId', 'courseName courseId')
      .populate('prerequisiteCourseId', 'courseName courseId');

    // Filter out prerequisites where courseId or prerequisiteCourseId is null (orphaned records)
    const validPrerequisites = prerequisites.filter(p => p.courseId !== null && p.prerequisiteCourseId !== null);

    res.json(validPrerequisites);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete prerequisite (Admin only)
exports.deletePrerequisite = async (req, res) => {
  try {
    const prerequisite = await Prerequisite.findByIdAndDelete(req.params.id);

    if (!prerequisite) {
      return res.status(404).json({ message: 'Prerequisite not found' });
    }

    res.json({ message: 'Prerequisite deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
