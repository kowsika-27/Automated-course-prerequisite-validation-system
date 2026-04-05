const Course = require('../models/Course');

// Add new course (Admin only)
exports.addCourse = async (req, res) => {
  try {
    const { courseId, courseName, description, credits, duration } = req.body;

    // Check if course already exists
    let course = await Course.findOne({ courseId });
    if (course) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    course = new Course({
      courseId,
      courseName,
      description,
      credits,
      duration,
      createdBy: req.user.id
    });

    await course.save();

    res.json({ message: 'Course added successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update course (Admin only)
exports.updateCourse = async (req, res) => {
  try {
    const { courseName, description, credits, duration } = req.body;
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseName) course.courseName = courseName;
    if (description) course.description = description;
    if (credits) course.credits = credits;
    if (duration) course.duration = duration;

    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete course (Admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
