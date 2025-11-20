import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRegistrations, getRegistrationStats, getZones } from '../services/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(registrations.length / pageSize));

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  // Load zones & stats once
  useEffect(() => {
    loadZones();
    loadStats();
    // loadRegistrations will run from the other effect below (which runs on mount because filters are initialized)
  }, []);

  // Load registrations whenever filters change (and on mount)
  useEffect(() => {
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.zoneId, filters.startDate, filters.endDate]);

  // Ensure currentPage is clamped when registrations length changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [registrations.length, totalPages, currentPage]);

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
      const response = await getAllRegistrations(zoneId, filters.startDate || null, filters.endDate || null);
      setRegistrations(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1); // reset to first page on new data/filter
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
    if (amount === null || amount === undefined) return '-';
    // If amount is string/number, ensure formatting
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (Number.isNaN(num)) return amount;
    return '₦' + num.toLocaleString();
  };

  const username = localStorage.getItem('username') || 'Admin';

  // Pagination logic (slice the data to display)
  const paginatedData = registrations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export ALL registrations to Excel
  const exportAllToExcel = () => {
    if (!registrations || registrations.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      registrations.map((reg) => ({
        FirstTimer: reg.firstTimeAttendingCamp,
        ChildName: reg.childName,
        Age: reg.age,
        Zone: reg.zoneName,
        ParentName: reg.parentName,
        ParentPhone: reg.parentPhone,
        Email: reg.paymentEmail,
        TotalAmount: reg.totalAmount,
        PaymentStatus: reg.paymentStatus,
        CreatedAt: formatDate(reg.createdAt),
        PaymentDate: formatDate(reg.paymentCreatedAt),
        Address: reg.address,
        TcCenter: reg.tcCenter,
        Allergy: reg.allergy,
        PaymentReference: reg.paymentReference,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Registrations_${Date.now()}.xlsx`);
  };

  return (
    <div
      style={{
        padding: '20px',
        width: '100%',           
        boxSizing: 'border-box',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', background: 'rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>
          ← Back to Registration
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}>Welcome, {username}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <h1 style={{ color: 'white', marginBottom: '30px' }}>Admin Dashboard - Registration Management</h1>

      {/* STATISTICS */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#667eea', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Registrations</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalRegistrations}</p>
          </div>

          <div style={{ background: '#764ba2', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Payments</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.totalPayments}</p>
          </div>

          <div style={{ background: '#f093fb', color: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={{ width: '100%', padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <h2>Filters</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Zone</label>
            <select name="zoneId" value={filters.zoneId} onChange={handleFilterChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }}>
              <option value="">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Start Date</label>
            <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label>End Date</label>
            <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={clearFilters} style={{ padding: '8px 14px' }}>
            Clear Filters
          </button>

          <button className="btn btn-primary" onClick={loadRegistrations} style={{ padding: '8px 14px' }}>
            Refresh
          </button>

          <button className="btn btn-success" onClick={exportAllToExcel} style={{ padding: '8px 14px', background: 'green', color: 'white', border: 'none' }}>
            Export All to Excel
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* TABLE */}
      <div style={{ width: '100%', padding: '20px', background: 'white', borderRadius: '8px', boxSizing: 'border-box', overflowX: 'auto' }}>
        <h2>Registrations ({registrations.length})</h2>

        {loading ? (
          <div style={{ padding: '10px 0' }}>Loading...</div>
        ) : paginatedData.length === 0 ? (
          <div style={{ padding: '10px 0' }}>No registrations found.</div>
        ) : (
          <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>First Timer</th>
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
              {paginatedData.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{reg.firstTimeAttendingCamp}</td>
                  <td style={{ padding: '12px' }}>{reg.childName}</td>
                  <td style={{ padding: '12px' }}>{reg.age}</td>
                  <td style={{ padding: '12px' }}>{reg.zoneName}</td>
                  <td style={{ padding: '12px' }}>{reg.parentName}</td>
                  <td style={{ padding: '12px' }}>{reg.parentPhone}</td>
                  <td style={{ padding: '12px' }}>{reg.paymentEmail}</td>
                  <td style={{ padding: '12px' }}>{formatCurrency(reg.totalAmount)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: reg.paymentStatus === 'SUCCESS' ? 'green' : 'red', color: 'white', padding: '4px 6px', borderRadius: '4px' }}>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{formatDate(reg.createdAt)}</td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-primary" onClick={() => setSelectedRegistration(reg)} style={{ padding: '6px 12px' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ padding: '8px 16px', marginRight: '10px' }}
          >
            Prev
          </button>

          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            Page {registrations.length === 0 ? 0 : currentPage} of {registrations.length === 0 ? 0 : totalPages}
          </span>

          <button
            disabled={currentPage === totalPages || registrations.length === 0}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px', marginLeft: '10px' }}
          >
            Next
          </button>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedRegistration && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '95%',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRegistration(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'red',
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

            <div style={{ marginTop: '15px' }}>
              <p><strong>First Timer:</strong> {selectedRegistration.firstTimeAttendingCamp}</p>
              <p><strong>Child Name:</strong> {selectedRegistration.childName}</p>
              <p><strong>Age:</strong> {selectedRegistration.age}</p>
              <p><strong>Zone:</strong> {selectedRegistration.zoneName}</p>
              <p><strong>TC Center:</strong> {selectedRegistration.tcCenter}</p>
              <p><strong>Address:</strong> {selectedRegistration.address}</p>
              <p><strong>Parent Name:</strong> {selectedRegistration.parentName}</p>
              <p><strong>Parent Phone:</strong> {selectedRegistration.parentPhone}</p>
              <p><strong>Email:</strong> {selectedRegistration.paymentEmail}</p>
              <p><strong>Allergy:</strong> {selectedRegistration.allergy}</p>
              <p><strong>Payment Reference:</strong> {selectedRegistration.paymentReference}</p>
              <p><strong>Status:</strong> {selectedRegistration.paymentStatus}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(selectedRegistration.totalAmount)}</p>
              <p><strong>Registered On:</strong> {formatDate(selectedRegistration.createdAt)}</p>
              <p><strong>Payment Date:</strong> {formatDate(selectedRegistration.paymentCreatedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
