import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ReportsPage from './pages/ReportsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && (
          <nav className="navbar">
            <div className="navbar-container">
              <div className="navbar-logo">
                <span>📚 Course Prerequisite Validation System</span>
              </div>
              <div className="navbar-menu">
                <span className="user-info">{user.name} ({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          {!user ? (
            <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          ) : user.role === 'admin' ? (
            <>
              <Route path="/admin" element={<AdminDashboard user={user} />} />
              <Route path="/reports" element={<ReportsPage user={user} />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          ) : (
            <>
              <Route path="/student" element={<StudentDashboard user={user} />} />
              <Route path="*" element={<Navigate to="/student" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
