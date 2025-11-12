import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../index.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      
      if (response.data && response.data.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('isAdmin', response.data.isAdmin);
        
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="login-subtitle">Please enter your credentials to access the admin portal</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          {/* <p>Default credentials: admin / admin123</p> */}
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Please change the default password after first login
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

