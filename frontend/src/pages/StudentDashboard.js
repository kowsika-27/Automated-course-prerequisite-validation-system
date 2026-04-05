import React, { useState, useEffect, useCallback } from 'react';
import { studentCourseService, courseService, validationService, prerequisiteService } from '../services/api';
import './StudentDashboard.css';

function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('available-courses');
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedEligibilityCourse, setSelectedEligibilityCourse] = useState('');

  const token = localStorage.getItem('token');

  const loadCourses = useCallback(async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
    }
  }, []);

  const loadEnrolledCourses = useCallback(async () => {
    try {
      const response = await studentCourseService.getStudentCourses(token);
      setEnrolledCourses(response.data);
    } catch (err) {
      setError('Failed to load enrolled courses');
    }
  }, [token]);

  const loadPrerequisites = useCallback(async () => {
    try {
      const response = await prerequisiteService.getAllPrerequisites();
      setPrerequisites(response.data);
    } catch (err) {
      setError('Failed to load prerequisites');
    }
  }, []);

  const loadNotifications = useCallback(() => {
    // Generate notifications based on completed courses and available unlocks
    const completedCourseIds = enrolledCourses.map(ec => ec.courseId._id);
    const newNotifications = [];

    // Check for newly unlocked courses
    courses.forEach(course => {
      if (!completedCourseIds.includes(course._id)) {
        const coursePrereqs = prerequisites.filter(p => p.courseId._id === course._id);
        const hasAllPrereqs = coursePrereqs.every(p => completedCourseIds.includes(p.prerequisiteCourseId._id));
        
        if (coursePrereqs.length > 0 && hasAllPrereqs) {
          newNotifications.push({
            id: `unlock-${course._id}`,
            type: 'unlock',
            message: `${course.courseName} is now unlocked!`,
            course: course
          });
        }
      }
    });

    // Add completion notifications
    enrolledCourses.forEach(course => {
      newNotifications.push({
        id: `complete-${course._id}`,
        type: 'completion',
        message: `You completed ${course.courseId.courseName}`,
        course: course.courseId,
        date: course.completedDate
      });
    });

    setNotifications(newNotifications);
  }, [courses, enrolledCourses, prerequisites]);

  const generateRecommendations = useCallback(() => {
    const completedCourseIds = enrolledCourses.map(ec => ec.courseId._id);
    const recommendations = [];

    // Simple recommendation logic: suggest courses that have prerequisites the student has completed
    courses.forEach(course => {
      if (!completedCourseIds.includes(course._id)) {
        const coursePrereqs = prerequisites.filter(p => p.courseId._id === course._id);
        const hasSomePrereqs = coursePrereqs.some(p => completedCourseIds.includes(p.prerequisiteCourseId._id));
        
        if (hasSomePrereqs && recommendations.length < 3) {
          recommendations.push(course);
        }
      }
    });

    setRecommendedCourses(recommendations);
  }, [courses, enrolledCourses, prerequisites]);

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
    loadPrerequisites();
  }, [loadCourses, loadEnrolledCourses, loadPrerequisites]);

  useEffect(() => {
    if (courses.length > 0 && enrolledCourses.length > 0 && prerequisites.length > 0) {
      loadNotifications();
      generateRecommendations();
    }
  }, [courses, enrolledCourses, prerequisites, loadNotifications, generateRecommendations]);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const handleEnrollCourse = async (courseId) => {
    try {
      await studentCourseService.addCompletedCourse({ courseId }, token);
      setMessage('Successfully enrolled in course');
      loadEnrolledCourses();
      loadCourses(); // Reload courses to update availability
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const handleCheckEligibility = async () => {
    if (!selectedEligibilityCourse) {
      setError('Please select a course to check eligibility');
      return;
    }
    try {
      const response = await validationService.checkEligibility({ courseId: selectedEligibilityCourse }, token);
      setEligibilityResult(response.data);
      setError('');
    } catch (err) {
      setError('Failed to check eligibility');
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.courseId._id === courseId);
  };

  const isEligible = (course) => {
    if (isEnrolled(course._id)) return false;
    
    // Check if all prerequisites are completed
    const coursePrereqs = prerequisites.filter(p => p.courseId._id === course._id);
    if (coursePrereqs.length === 0) return true; // No prerequisites
    
    const completedCourseIds = enrolledCourses.map(ec => ec.courseId._id);
    return coursePrereqs.every(p => completedCourseIds.includes(p.prerequisiteCourseId._id));
  };

  const getCoursePrerequisites = (courseId) => {
    return prerequisites
      .filter(p => p.courseId._id === courseId)
      .map(p => p.prerequisiteCourseId);
  };

  const getFilteredCourses = () => {
    return filteredCourses.filter(course => {
      const enrolled = isEnrolled(course._id);
      const eligible = isEligible(course);
      
      switch (courseFilter) {
        case 'available':
          return !enrolled && eligible;
        case 'enrolled':
          return enrolled;
        case 'completed':
          return enrolled;
        case 'locked':
          return !enrolled && !eligible;
        default:
          return true;
      }
    });
  };

  const handleViewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleCloseCourseDetails = () => {
    setSelectedCourse(null);
    setShowCourseDetails(false);
  };

  const getTotalCredits = () => {
    return enrolledCourses.reduce((total, course) => total + course.courseId.credits, 0);
  };

  const buildDependencyTree = () => {
    const tree = {};
    // eslint-disable-next-line no-unused-vars
    const visited = new Set();

    // Build adjacency list
    prerequisites.forEach(prereq => {
      if (!tree[prereq.prerequisiteCourseId?._id]) {
        tree[prereq.prerequisiteCourseId?._id] = { course: prereq.prerequisiteCourseId, children: [] };
      }
      if (!tree[prereq.courseId?._id]) {
        tree[prereq.courseId?._id] = { course: prereq.courseId, children: [] };
      }
      tree[prereq.prerequisiteCourseId?._id].children.push(tree[prereq.courseId?._id]);
    });

    // Find root nodes (courses that are not prerequisites for anything)
    const allCourseIds = new Set(courses.map(c => c._id));
    const prereqIds = new Set(prerequisites.map(p => p.courseId?._id));
    const rootIds = [...allCourseIds].filter(id => !prereqIds.has(id));

    const result = [];
    rootIds.forEach(id => {
      if (tree[id]) {
        result.push(tree[id]);
      }
    });

    return result;
  };

  const renderLearningPath = (node) => {
    return (
      <div className="learning-path-tree">
        <div className={`learning-node ${isEnrolled(node.course._id) ? 'completed' : isEligible(node.course) ? 'available' : 'locked'}`}>
          <div className="node-content">
            <h4>{node.course.courseName}</h4>
            <p>{node.course.courseId}</p>
            {isEnrolled(node.course._id) && <span className="node-status completed">✓ Completed</span>}
            {!isEnrolled(node.course._id) && isEligible(node.course) && <span className="node-status available">Available</span>}
            {!isEnrolled(node.course._id) && !isEligible(node.course) && <span className="node-status locked">🔒 Locked</span>}
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="node-children">
            <div className="path-connector">↓</div>
            <div className="children-container">
              {node.children.map(child => (
                <div key={child.course._id} className="child-wrapper">
                  {renderLearningPath(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDependencyNode = (node, level = 0) => {
    return (
      <div key={node.course._id} className="dependency-node" style={{ marginLeft: level * 40 }}>
        <div className="dependency-course">{node.course.courseName}</div>
        {node.children && node.children.length > 0 && (
          <div className="dependency-children">
            <div className="dependency-arrow">↓</div>
            {node.children.map(child => renderDependencyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome, {user.name}</p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'available-courses' ? 'active' : ''}
          onClick={() => setActiveTab('available-courses')}
        >
          Available Courses
        </button>
        <button
          className={activeTab === 'my-courses' ? 'active' : ''}
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses
        </button>
        <button
          className={activeTab === 'progress' ? 'active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
        <button
          className={activeTab === 'dependencies' ? 'active' : ''}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </button>
        <button
          className={activeTab === 'recommendations' ? 'active' : ''}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={activeTab === 'check-eligibility' ? 'active' : ''}
          onClick={() => setActiveTab('check-eligibility')}
        >
          Check Eligibility
        </button>
        <button
          className={activeTab === 'learning-path' ? 'active' : ''}
          onClick={() => setActiveTab('learning-path')}
        >
          Learning Path
        </button>
      </div>

      {activeTab === 'available-courses' && (
        <div className="tab-content">
          <h2>Available Courses</h2>
          
          {/* Course Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search courses by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Course Filter */}
          <div className="filter-container">
            <label htmlFor="course-filter">Filter Courses:</label>
            <select 
              id="course-filter"
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Courses</option>
              <option value="available">Available</option>
              <option value="enrolled">Enrolled</option>
              <option value="locked">Locked</option>
            </select>
          </div>

          <div className="course-grid">
            {getFilteredCourses().map(course => {
              const enrolled = isEnrolled(course._id);
              const eligible = isEligible(course);
              const coursePrereqs = getCoursePrerequisites(course._id);
              
              return (
                <div key={course._id} className={`course-card ${enrolled ? 'enrolled' : eligible ? 'available' : 'locked'}`}>
                  <div className="course-header">
                    <h3>{course.courseId} - {course.courseName}</h3>
                    {enrolled && <span className="status enrolled-status">Enrolled</span>}
                    {!enrolled && !eligible && <span className="status locked-status">🔒 Locked</span>}
                    {!enrolled && eligible && <span className="status available-status">Available</span>}
                  </div>
                  <p>{course.description}</p>
                  <p><strong>Credits:</strong> {course.credits}</p>
                  
                  <div className="course-actions">
                    <button 
                      className="details-btn"
                      onClick={() => handleViewCourseDetails(course)}
                    >
                      View Details
                    </button>
                    
                    {!enrolled && eligible && (
                      <button 
                        className="enroll-btn"
                        onClick={() => handleEnrollCourse(course._id)}
                      >
                        Enroll
                      </button>
                    )}
                    
                    {!enrolled && !eligible && (
                      <div className="locked-info">
                        <p><strong>Prerequisites Required:</strong></p>
                        <ul>
                          {coursePrereqs.map(prereq => (
                            <li key={prereq._id} className={enrolledCourses.some(ec => ec.courseId._id === prereq._id) ? 'completed' : 'missing'}>
                              {prereq.courseName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {eligibilityResult && (
            <div className={`eligibility-result ${eligibilityResult.isEligible ? 'eligible' : 'not-eligible'}`}>
              <h3>{eligibilityResult.message}</h3>
              {!eligibilityResult.isEligible && eligibilityResult.missingPrerequisites.length > 0 && (
                <div>
                  <p>Missing Prerequisites:</p>
                  <ul>
                    {eligibilityResult.missingPrerequisites.map(course => (
                      <li key={course._id}>{course.courseName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-courses' && (
        <div className="tab-content">
          <h2>My Enrolled Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="course-grid">
              {enrolledCourses.map(course => (
                <div key={course._id} className="course-card enrolled">
                  <div className="course-header">
                    <h3>{course.courseId.courseId} - {course.courseId.courseName}</h3>
                    <span className="status completed-status">Completed</span>
                  </div>
                  <p>{course.courseId.description}</p>
                  <p><strong>Credits:</strong> {course.courseId.credits}</p>
                  <p><strong>Completed:</strong> {new Date(course.completedDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't enrolled in any courses yet.</p>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="tab-content">
          <h2>Course Progress</h2>
          
          {/* Progress Summary */}
          <div className="progress-summary">
            <div className="summary-card">
              <h3>Total Courses Completed</h3>
              <p className="summary-number">{enrolledCourses.length}</p>
            </div>
            <div className="summary-card">
              <h3>Total Credits Earned</h3>
              <p className="summary-number">{getTotalCredits()}</p>
            </div>
          </div>
          
          {enrolledCourses.length > 0 ? (
            <div className="progress-container">
              {enrolledCourses.map(course => (
                <div key={course._id} className="progress-item">
                  <div className="progress-header">
                    <h3>{course.courseId.courseName}</h3>
                    <span className="progress-percentage">100%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                  <p>Completed on {new Date(course.completedDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No progress to show. Enroll in courses to track your progress.</p>
          )}
        </div>
      )}

      {activeTab === 'dependencies' && (
        <div className="tab-content">
          <h2>Course Dependencies</h2>
          <div className="dependency-visualization">
            {buildDependencyTree().map((root, index) => (
              <div key={index} className="dependency-root">
                {renderDependencyNode(root)}
              </div>
            ))}
            {buildDependencyTree().length === 0 && (
              <p>No course dependencies have been set up yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="tab-content">
          <h2>Recommended Courses</h2>
          {recommendedCourses.length > 0 ? (
            <div className="course-grid">
              {recommendedCourses.map(course => (
                <div key={course._id} className="course-card recommended">
                  <div className="course-header">
                    <h3>{course.courseId} - {course.courseName}</h3>
                    <span className="status recommended-status">Recommended</span>
                  </div>
                  <p>{course.description}</p>
                  <p><strong>Credits:</strong> {course.credits}</p>
                  
                  <div className="course-actions">
                    <button 
                      className="details-btn"
                      onClick={() => handleViewCourseDetails(course)}
                    >
                      View Details
                    </button>
                    {isEligible(course) && (
                      <button 
                        className="enroll-btn"
                        onClick={() => handleEnrollCourse(course._id)}
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No course recommendations available at this time. Complete more courses to get personalized recommendations.</p>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="tab-content">
          <h2>Notifications</h2>
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-icon">
                    {notification.type === 'completion' ? '✔' : '🔓'}
                  </div>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    {notification.date && (
                      <small>{new Date(notification.date).toLocaleDateString()}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No notifications at this time.</p>
          )}
        </div>
      )}

      {activeTab === 'check-eligibility' && (
        <div className="tab-content">
          <h2>Check Course Eligibility</h2>
          
          <div className="eligibility-check-container">
            <div className="eligibility-form">
              <label htmlFor="course-select">Select Course:</label>
              <select
                id="course-select"
                value={selectedEligibilityCourse}
                onChange={(e) => {
                  setSelectedEligibilityCourse(e.target.value);
                  setEligibilityResult(null); // Clear previous result
                  setError(''); // Clear any errors
                }}
                className="course-select"
              >
                <option value="">-- Select a Course --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.courseId} - {course.courseName}
                  </option>
                ))}
              </select>
              
              <button 
                className="check-eligibility-btn"
                onClick={handleCheckEligibility}
                disabled={!selectedEligibilityCourse}
              >
                Check Eligibility
              </button>
            </div>
            
            {eligibilityResult && (
              <div className={`eligibility-result ${eligibilityResult.isEligible ? 'eligible' : 'not-eligible'}`}>
                <h3>Eligibility Status: {eligibilityResult.isEligible ? 'Eligible ✅' : 'Not Eligible ❌'}</h3>
                
                {eligibilityResult.allPrerequisites && eligibilityResult.allPrerequisites.length > 0 && (
                  <div className="prerequisites-status">
                    <h4>Required Prerequisites:</h4>
                    <ul className="prerequisites-list">
                      {eligibilityResult.allPrerequisites.map(course => (
                        <li key={course._id} className={course.completed ? 'completed' : 'missing'}>
                          {course.completed ? '✔' : '❌'} {course.courseName} ({course.courseId})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {eligibilityResult.isEligible ? (
                  <div>
                    <p>You have completed all required prerequisites.</p>
                    <p>You can enroll in this course.</p>
                  </div>
                ) : (
                  <div>
                    <p>You must complete the missing prerequisites listed above.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'learning-path' && (
        <div className="tab-content">
          <h2>Learning Path</h2>
          <div className="learning-path-container">
            {buildDependencyTree().map((root, index) => (
              <div key={index} className="learning-path">
                {renderLearningPath(root)}
              </div>
            ))}
            {buildDependencyTree().length === 0 && (
              <p>No course dependencies have been set up yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseCourseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCourse.courseName}</h2>
              <button className="close-btn" onClick={handleCloseCourseDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="course-detail-section">
                <h3>Course Information</h3>
                <p><strong>Course ID:</strong> {selectedCourse.courseId}</p>
                <p><strong>Description:</strong> {selectedCourse.description}</p>
                <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                <p><strong>Instructor:</strong> {selectedCourse.createdBy?.name || 'TBD'}</p>
              </div>
              
              <div className="course-detail-section">
                <h3>Prerequisites</h3>
                {getCoursePrerequisites(selectedCourse._id).length > 0 ? (
                  <ul className="prerequisites-list">
                    {getCoursePrerequisites(selectedCourse._id).map(prereq => (
                      <li key={prereq._id} className={enrolledCourses.some(ec => ec.courseId._id === prereq._id) ? 'completed' : 'pending'}>
                        {prereq.courseName}
                        {enrolledCourses.some(ec => ec.courseId._id === prereq._id) && <span className="completed-badge">✓</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No prerequisites required</p>
                )}
              </div>
              
              <div className="course-detail-actions">
                {isEligible(selectedCourse) && !isEnrolled(selectedCourse._id) && (
                  <button 
                    className="enroll-btn"
                    onClick={() => {
                      handleEnrollCourse(selectedCourse._id);
                      handleCloseCourseDetails();
                    }}
                  >
                    Enroll in Course
                  </button>
                )}
                {!isEligible(selectedCourse) && !isEnrolled(selectedCourse._id) && (
                  <div className="locked-message">
                    <p>🔒 This course is locked. Complete the required prerequisites first.</p>
                  </div>
                )}
                {isEnrolled(selectedCourse._id) && (
                  <div className="enrolled-message">
                    <p>✓ You are already enrolled in this course</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
