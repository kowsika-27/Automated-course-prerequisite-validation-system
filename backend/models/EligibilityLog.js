const mongoose = require('mongoose');

const eligibilityLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  isEligible: {
    type: Boolean,
    required: true
  },
  missingPrerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  checkDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EligibilityLog', eligibilityLogSchema);
