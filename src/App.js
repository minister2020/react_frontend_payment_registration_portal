import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailPage from './components/EmailPage';
import PaymentPage from './components/PaymentPage';
import RegistrationPage from './components/RegistrationPage';
import PaymentCallback from './components/PaymentCallback';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <div className="app-container">
              <Routes>
                <Route path="/" element={<EmailPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

