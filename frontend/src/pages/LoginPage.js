import React, { useState } from 'react';
import { authService } from '../services/api';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isLogin) {
        const response = await authService.login(email, password);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      } else {
        const response = await authService.register(name, email, password, role);
        setMessage(response.data.message);
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'An error occurred');
      } else {
        setError('Unable to connect to the server. Please check if the backend is running.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="login-card">
          <h2>Course Prerequisite System</h2>
          <h3>{isLogin ? 'Login' : 'Register'}</h3>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isLogin ? (
              <button type="submit">Login</button>
            ) : (
              <div className="form-group">
                <label htmlFor="role">Register as</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit">Register</button>
              </div>
            )}
          </form>

          {!isLogin && <hr />}

          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
