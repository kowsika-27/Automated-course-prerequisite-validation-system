import React, { useState, useEffect } from 'react';
import { courseService, prerequisiteService, reportService, authService, studentCourseService, announcementService } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    courseId: '',
    courseName: '',
    description: '',
    credits: 3,
    duration: '6 weeks'
  });
  const [editForm, setEditForm] = useState({
    id: '',
    courseId: '',
    courseName: '',
    description: '',
    credits: 3,
    duration: '6 weeks'
  });
  const [prerequisiteForm, setPrerequisiteForm] = useState({
    courseId: '',
    prerequisiteId: ''
  });
  const [prerequisites, setPrerequisites] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [dependencyView, setDependencyView] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [recentlyAddedCourses, setRecentlyAddedCourses] = useState([]);

  const buildDependencyTree = () => {
    const tree = {};

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

    setDependencyView(result);
  };

  useEffect(() => {
    if (prerequisites.length > 0 && courses.length > 0) {
      buildDependencyTree();
    }
  }, [prerequisites, courses]); // eslint-disable-line react-hooks/exhaustive-deps

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadCourses();
    loadStats();
    loadPrerequisites();
    loadStudents();
    loadAnnouncements();
    loadRecentlyAddedCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const loadCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
    }
  };

  const loadStats = async () => {
    try {
      const response = await reportService.getDashboardStats(token);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadPrerequisites = async () => {
    try {
      const response = await prerequisiteService.getAllPrerequisites();
      setPrerequisites(response.data);
    } catch (err) {
      console.error('Failed to load prerequisites:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await authService.getUsers(token);
      setStudents(response.data.filter(user => user.role === 'student'));
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await announcementService.getAllAnnouncements();
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  };

  const loadRecentlyAddedCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      // Sort by creation date and take the 5 most recent
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentlyAddedCourses(sorted.slice(0, 5));
    } catch (err) {
      console.error('Failed to load recently added courses:', err);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await courseService.addCourse(courseForm, token);
      setMessage('Course added successfully');
      setCourseForm({ courseId: '', courseName: '', description: '', credits: 3 });
      loadCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await courseService.deleteCourse(id, token);
        setMessage('Course deleted successfully');
        loadCourses();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course._id);
    setEditForm({
      id: course._id,
      courseId: course.courseId,
      courseName: course.courseName,
      description: course.description || '',
      credits: course.credits
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await courseService.updateCourse(editForm.id, {
        courseName: editForm.courseName,
        description: editForm.description,
        credits: editForm.credits,
        duration: editForm.duration
      }, token);
      setMessage('Course updated successfully');
      setEditingCourse(null);
      loadCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setEditForm({
      id: '',
      courseId: '',
      courseName: '',
      description: '',
      credits: 3,
      duration: '6 weeks'
    });
  };

  const handleSetPrerequisite = async (e) => {
    e.preventDefault();
    try {
      await prerequisiteService.setPrerequisite({
        courseId: prerequisiteForm.courseId,
        prerequisiteCourseId: prerequisiteForm.prerequisiteId
      }, token);
      setMessage('Prerequisite set successfully');
      setPrerequisiteForm({ courseId: '', prerequisiteId: '' });
      loadPrerequisites();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set prerequisite');
    }
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

  const handleViewEnrollments = async (courseId) => {
    try {
      const response = await studentCourseService.getStudentsByCourse(courseId);
      setEnrolledStudents(response.data);
      setSelectedCourse(courseId);
    } catch (err) {
      setError('Failed to load enrolled students');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(announcementForm, token);
      setMessage('Announcement created successfully');
      setAnnouncementForm({ title: '', content: '' });
      loadAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content
    });
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await announcementService.updateAnnouncement(editingAnnouncement._id, announcementForm, token);
      setMessage('Announcement updated successfully');
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', content: '' });
      loadAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.deleteAnnouncement(id, token);
        setMessage('Announcement deleted successfully');
        loadAnnouncements();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete announcement');
      }
    }
  };

  const cancelAnnouncementEdit = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '' });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <div>
            <div className="box">
              <h2>Add New Course</h2>
              <form onSubmit={handleAddCourse}>
                <input type="text" placeholder="Course ID" value={courseForm.courseId} onChange={(e) => setCourseForm({...courseForm, courseId: e.target.value})} required />
                <input type="text" placeholder="Course Name" value={courseForm.courseName} onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})} required />
                <input type="text" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} />
                <input type="number" placeholder="Credits" value={courseForm.credits} onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})} />
                <input type="text" placeholder="Duration (e.g., 6 weeks)" value={courseForm.duration} onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})} />
                <button type="submit">Add Course</button>
              </form>
            </div>
          </div>
        );
      default:
        return <div>Tab content coming soon...</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Courses</h3>
          <p>{stats.totalCourses}</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Enrollments</h3>
          <p>{stats.totalEnrollments}</p>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>Course Management</button>
        <button className={activeTab === 'prerequisites' ? 'active' : ''} onClick={() => setActiveTab('prerequisites')}>Prerequisites</button>
        <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>Students</button>
        <button className={activeTab === 'enrollments' ? 'active' : ''} onClick={() => setActiveTab('enrollments')}>Enrollments</button>
        <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>Announcements</button>
        <button className={activeTab === 'recent' ? 'active' : ''} onClick={() => setActiveTab('recent')}>Recently Added</button>
      </div>

      <div className="tab-content">
          {activeTab === 'courses' && (
            <div>
              <div className="box">
                <h2>Add New Course</h2>
                <form onSubmit={handleAddCourse}>
                  <input type="text" placeholder="Course ID" value={courseForm.courseId} onChange={(e) => setCourseForm({...courseForm, courseId: e.target.value})} required />
                  <input type="text" placeholder="Course Name" value={courseForm.courseName} onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})} required />
                  <input type="text" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} />
                  <input type="number" placeholder="Credits" value={courseForm.credits} onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})} />
                  <input type="text" placeholder="Duration (e.g., 6 weeks)" value={courseForm.duration} onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})} />
                  <button type="submit">Add Course</button>
                </form>
              </div>

              <div className="box">
                <h2>All Courses</h2>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>Course ID</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course._id}>
                        <td>{course.courseId}</td>
                        <td>{course.courseName}</td>
                        <td>{course.credits}</td>
                        <td>{course.duration}</td>
                        <td>
                          <button className="edit-btn" onClick={() => handleEditCourse(course)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editingCourse && (
                <div className="box">
                  <h2>Edit Course</h2>
                  <form onSubmit={handleUpdateCourse}>
                    <input type="text" placeholder="Course ID" value={editForm.courseId} disabled />
                    <input type="text" placeholder="Course Name" value={editForm.courseName} onChange={(e) => setEditForm({...editForm, courseName: e.target.value})} required />
                    <input type="text" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                    <input type="number" placeholder="Credits" value={editForm.credits} onChange={(e) => setEditForm({...editForm, credits: e.target.value})} />
                    <input type="text" placeholder="Duration (e.g., 6 weeks)" value={editForm.duration} onChange={(e) => setEditForm({...editForm, duration: e.target.value})} />
                    <button type="submit">Update Course</button>
                    <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prerequisites' && (
            <div>
              <div className="box">
                <h2>Set Course Prerequisite</h2>
                <form onSubmit={handleSetPrerequisite}>
                  <select value={prerequisiteForm.courseId} onChange={(e) => setPrerequisiteForm({...prerequisiteForm, courseId: e.target.value})} required>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.courseName}</option>
                    ))}
                  </select>
                  <select value={prerequisiteForm.prerequisiteId} onChange={(e) => setPrerequisiteForm({...prerequisiteForm, prerequisiteId: e.target.value})} required>
                    <option value="">Select Prerequisite</option>
                    {courses.filter(c => c._id !== prerequisiteForm.courseId).map(course => (
                      <option key={course._id} value={course._id}>{course.courseName}</option>
                    ))}
                  </select>
                  <button type="submit">Set Prerequisite</button>
                </form>
              </div>
              <div className="box">
                <h2>Course Dependency View</h2>
                <div className="dependency-tree">
                  {dependencyView.map((root, index) => (
                    <div key={index} className="dependency-root">
                      {renderDependencyNode(root)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
          <div className="box">
            <h2>All Students</h2>
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="box">
            <h2>Course Enrollments</h2>
            <select value={selectedCourse} onChange={(e) => handleViewEnrollments(e.target.value)}>
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.courseName}</option>
              ))}
            </select>
            {selectedCourse && enrolledStudents.length > 0 && (
              <div className="enrollment-list">
                <h3>Students Enrolled in {courses.find(c => c._id === selectedCourse)?.courseName}</h3>
                <ol>
                  {enrolledStudents.map((enrollment, index) => (
                    <li key={enrollment._id}>{enrollment.studentId?.name} ({enrollment.studentId?.email})</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="box">
            <h2>Announcements Management</h2>
            <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleAddAnnouncement} className="form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content:</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  rows="4"
                  required
                />
              </div>
              <button type="submit">{editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}</button>
              {editingAnnouncement && (
                <button type="button" onClick={cancelAnnouncementEdit} className="cancel-btn">Cancel</button>
              )}
            </form>

            <div className="announcements-list">
              <h3>Existing Announcements</h3>
              {announcements.length === 0 ? (
                <p>No announcements yet.</p>
              ) : (
                announcements.map(announcement => (
                  <div key={announcement._id} className="announcement-item">
                    <h4>{announcement.title}</h4>
                    <p>{announcement.content}</p>
                    <small>Created: {new Date(announcement.createdAt).toLocaleDateString()}</small>
                    <div className="announcement-actions">
                      <button onClick={() => handleEditAnnouncement(announcement)}>Edit</button>
                      <button onClick={() => handleDeleteAnnouncement(announcement._id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="box">
            <h2>Recently Added Courses</h2>
            {recentlyAddedCourses.length === 0 ? (
              <p>No courses added yet.</p>
            ) : (

              <div className="recent-courses-list">
                {recentlyAddedCourses.map(course => (
                  <div key={course._id} className="recent-course-item">
                    <h3>{course.courseName}</h3>
                    <p><strong>Course ID:</strong> {course.courseId}</p>
                    <p><strong>Description:</strong> {course.description}</p>
                    <p><strong>Credits:</strong> {course.credits}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <small>Added: {new Date(course.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;