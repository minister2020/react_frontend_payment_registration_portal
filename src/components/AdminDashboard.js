import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRegistrations, getRegistrationStats, getZones } from '../services/api';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    zoneId: '',
    startDate: '',
    endDate: '',
  });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  useEffect(() => {
    loadZones();
    loadStats();
  }, []);

  useEffect(() => {
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.zoneId, filters.startDate, filters.endDate]);

  const loadZones = async () => {
    try {
      const response = await getZones();
      setZones(response.data);
    } catch (err) {
      console.error('Failed to load zones', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getRegistrationStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const zoneId = filters.zoneId ? parseInt(filters.zoneId) : null;
      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;
      const response = await getAllRegistrations(zoneId, startDate, endDate);
      setRegistrations(response.data);
    } catch (err) {
      setError('Failed to load registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      zoneId: '',
      startDate: '',
      endDate: '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return '₦' + amount.toLocaleString();
  };

  const username = localStorage.getItem('username') || 'Admin';

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', marginRight: '10px' }}>
            ← Back to Registration
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}>Welcome, {username}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>Admin Dashboard - Registration Management</h1>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="stat-card" style={{ background: '#667eea', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Registrations</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.totalRegistrations}</p>
          </div>
          <div className="stat-card" style={{ background: '#764ba2', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Payments</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.totalPayments}</p>
          </div>
          <div className="stat-card" style={{ background: '#f093fb', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <label htmlFor="zoneId">Zone</label>
            <select
              id="zoneId"
              name="zoneId"
              value={filters.zoneId}
              onChange={handleFilterChange}
            >
              <option value="">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={clearFilters} style={{ width: 'auto', marginRight: '10px' }}>
          Clear Filters
        </button>
        <button className="btn btn-primary" onClick={loadRegistrations} style={{ width: 'auto' }}>
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Registrations Table */}
      <div className="card">
        <h2>Registrations ({registrations.length})</h2>
        {loading ? (
          <div className="loading">
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <p>No registrations found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Child Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Age</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Zone</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Parent Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Parent Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px' }}>{reg.childName}</td>
                    <td style={{ padding: '12px' }}>{reg.age}</td>
                    <td style={{ padding: '12px' }}>{reg.zoneName}</td>
                    <td style={{ padding: '12px' }}>{reg.parentName}</td>
                    <td style={{ padding: '12px' }}>{reg.parentPhone}</td>
                    <td style={{ padding: '12px' }}>{reg.paymentEmail}</td>
                    <td style={{ padding: '12px' }}>{formatCurrency(reg.totalAmount)}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: reg.paymentStatus === 'SUCCESS' ? '#27ae60' : '#e74c3c',
                          color: 'white',
                          fontSize: '12px',
                        }}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(reg.createdAt)}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => setSelectedRegistration(reg)}
                        style={{ padding: '6px 12px', fontSize: '14px', width: 'auto' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRegistration(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <h2>Registration Details</h2>
            <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                <strong>first Time Attending Camp:</strong> {selectedRegistration.firstTimeAttendingCamp}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Child Name:</strong> {selectedRegistration.childName}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Age:</strong> {selectedRegistration.age}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Location:</strong> {selectedRegistration.location}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Zone:</strong> {selectedRegistration.zoneName}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Address:</strong> {selectedRegistration.address}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Parent Name:</strong> {selectedRegistration.parentName}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Parent Phone:</strong> {selectedRegistration.parentPhone}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Email:</strong> {selectedRegistration.paymentEmail}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Allergy:</strong> {selectedRegistration.allergy}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Payment Reference:</strong> {selectedRegistration.paymentReference}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Payment Status:</strong>{' '}
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: selectedRegistration.paymentStatus === 'SUCCESS' ? '#27ae60' : '#e74c3c',
                    color: 'white',
                  }}
                >
                  {selectedRegistration.paymentStatus}
                </span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Total Amount:</strong> {formatCurrency(selectedRegistration.totalAmount)}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Registration Date:</strong> {formatDate(selectedRegistration.createdAt)}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Payment Date:</strong> {formatDate(selectedRegistration.paymentCreatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

