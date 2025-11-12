import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EmailPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Store email in sessionStorage and navigate to payment page
    sessionStorage.setItem('userEmail', email);
    navigate('/payment');
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <Link to="/admin/login" style={{ color: '#667eea', textDecoration: 'none' }}>
          Admin Login →
        </Link>
      </div>
      <h1>Welcome to Registration Portal</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
};

export default EmailPage;
