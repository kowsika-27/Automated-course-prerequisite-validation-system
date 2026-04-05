import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Auth Service
export const authService = {
  register: (name, email, password, role) =>
    axios.post(`${API_BASE}/auth/register`, { name, email, password, role }),
  
  login: (email, password) =>
    axios.post(`${API_BASE}/auth/login`, { email, password }),
  
  getProfile: (token) =>
    axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getUsers: (token) =>
    axios.get(`${API_BASE}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Course Service
export const courseService = {
  addCourse: (courseData, token) =>
    axios.post(`${API_BASE}/courses`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getAllCourses: () =>
    axios.get(`${API_BASE}/courses`),
  
  getCourseById: (id) =>
    axios.get(`${API_BASE}/courses/${id}`),
  
  updateCourse: (id, courseData, token) =>
    axios.put(`${API_BASE}/courses/${id}`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  deleteCourse: (id, token) =>
    axios.delete(`${API_BASE}/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Prerequisite Service
export const prerequisiteService = {
  setPrerequisite: (data, token) =>
    axios.post(`${API_BASE}/prerequisites`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getPrerequisites: (courseId) =>
    axios.get(`${API_BASE}/prerequisites/course/${courseId}`),
  
  getAllPrerequisites: () =>
    axios.get(`${API_BASE}/prerequisites`),
  
  deletePrerequisite: (id, token) =>
    axios.delete(`${API_BASE}/prerequisites/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Student Course Service
export const studentCourseService = {
  addCompletedCourse: (courseData, token) =>
    axios.post(`${API_BASE}/student-courses`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getStudentCourses: (token) =>
    axios.get(`${API_BASE}/student-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getStudentsByCourse: (courseId) =>
    axios.get(`${API_BASE}/student-courses/course/${courseId}`),
  
  removeCompletedCourse: (id, token) =>
    axios.delete(`${API_BASE}/student-courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Validation Service
export const validationService = {
  checkEligibility: (courseData, token) =>
    axios.post(`${API_BASE}/validation/check`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getEligibilityHistory: (token) =>
    axios.get(`${API_BASE}/validation/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Report Service
export const reportService = {
  getEligibleStudents: (courseId, token) =>
    axios.get(`${API_BASE}/reports/eligible/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getNotEligibleStudents: (courseId, token) =>
    axios.get(`${API_BASE}/reports/not-eligible/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getCourseWiseReport: (token) =>
    axios.get(`${API_BASE}/reports/course-report/all`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getDashboardStats: (token) =>
    axios.get(`${API_BASE}/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getAllEligibilityLogs: (token) =>
    axios.get(`${API_BASE}/reports/logs/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Announcement Service
export const announcementService = {
  createAnnouncement: (announcementData, token) =>
    axios.post(`${API_BASE}/announcements`, announcementData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getAllAnnouncements: () =>
    axios.get(`${API_BASE}/announcements`),
  
  updateAnnouncement: (id, announcementData, token) =>
    axios.put(`${API_BASE}/announcements/${id}`, announcementData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  deleteAnnouncement: (id, token) =>
    axios.delete(`${API_BASE}/announcements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};
