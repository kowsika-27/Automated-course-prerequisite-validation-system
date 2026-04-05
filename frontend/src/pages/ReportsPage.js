import React, { useState, useEffect, useCallback } from 'react';
import { reportService, courseService } from '../services/api';
import './ReportsPage.css';

function ReportsPage({ user }) {
  const [activeTab, setActiveTab] = useState('course-report');
  const [courseReport, setCourseReport] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [notEligibleStudents, setNotEligibleStudents] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const loadInitialData = useCallback(async () => {
    try {
      const coursesRes = await courseService.getAllCourses();
      setCourses(coursesRes.data);
      
      const reportRes = await reportService.getCourseWiseReport(token);
      setCourseReport(reportRes.data);
      
      const logsRes = await reportService.getAllEligibilityLogs(token);
      setAllLogs(logsRes.data);
    } catch (err) {
      setError('Failed to load reports');
    }
  }, [token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleLoadCourseDetails = async (courseId) => {
    try {
      const eligibleRes = await reportService.getEligibleStudents(courseId, token);
      const notEligibleRes = await reportService.getNotEligibleStudents(courseId, token);
      
      setEligibleStudents(eligibleRes.data);
      setNotEligibleStudents(notEligibleRes.data);
    } catch (err) {
      setError('Failed to load course details');
    }
  };

  return (
    <div className="reports-page">
      <h1>Admin Reports</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'course-report' ? 'active' : ''}
          onClick={() => setActiveTab('course-report')}
        >
          Course-wise Report
        </button>
        <button
          className={activeTab === 'course-details' ? 'active' : ''}
          onClick={() => setActiveTab('course-details')}
        >
          Course Details
        </button>
        <button
          className={activeTab === 'all-logs' ? 'active' : ''}
          onClick={() => setActiveTab('all-logs')}
        >
          All Eligibility Logs
        </button>
      </div>

      {activeTab === 'course-report' && (
        <div className="tab-content">
          <h2>Course-wise Eligibility Report</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Eligible Students</th>
                <th>Not Eligible Students</th>
                <th>Total Checked</th>
              </tr>
            </thead>
            <tbody>
              {courseReport.length > 0 ? (
                courseReport.map(report => (
                  <tr key={report.courseId}>
                    <td>{report.courseId}</td>
                    <td>{report.courseName}</td>
                    <td className="eligible">{report.eligibleCount}</td>
                    <td className="not-eligible">{report.notEligibleCount}</td>
                    <td>{report.totalChecked}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'course-details' && (
        <div className="tab-content">
          <h2>Course Details</h2>
          <div className="course-selector">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                if (e.target.value) handleLoadCourseDetails(e.target.value);
              }}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseId} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              <h3>Eligible Students</h3>
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.length > 0 ? (
                    eligibleStudents.map(log => (
                      <tr key={log._id}>
                        <td>{log.studentId?.name}</td>
                        <td>{log.studentId?.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2">No eligible students</td></tr>
                  )}
                </tbody>
              </table>

              <h3>Not Eligible Students</h3>
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Missing Prerequisites</th>
                  </tr>
                </thead>
                <tbody>
                  {notEligibleStudents.length > 0 ? (
                    notEligibleStudents.map(log => (
                      <tr key={log._id}>
                        <td>{log.studentId?.name}</td>
                        <td>{log.studentId?.email}</td>
                        <td>
                          {log.missingPrerequisites?.map(course => course.courseName).join(', ')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">All students are eligible</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {activeTab === 'all-logs' && (
        <div className="tab-content">
          <h2>All Eligibility Check Logs</h2>
          <table className="logs-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Result</th>
                <th>Check Date</th>
              </tr>
            </thead>
            <tbody>
              {allLogs.length > 0 ? (
                allLogs.map(log => (
                  <tr key={log._id}>
                    <td>{log.studentId?.name}</td>
                    <td>{log.courseId?.courseName}</td>
                    <td className={log.isEligible ? 'eligible' : 'not-eligible'}>
                      {log.isEligible ? 'Eligible' : 'Not Eligible'}
                    </td>
                    <td>{new Date(log.checkDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4">No logs available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
