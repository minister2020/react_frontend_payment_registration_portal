import axios from 'axios';

const API_BASE_URL = 'https://javabackendpaymentregistrationportal-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {'Content-Type':'application/json'},
  withCredentials: true, 
});

// Handle 401 responses (unauthorized)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // 🚫 Do NOT send token for login endpoint
    if (token && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export const getZones = () => {
  return api.get('/zones');
};

export const initializePayment = (paymentData) => {
  return api.post('/payments/initialize', paymentData);
};

export const verifyPayment = (reference) => {
  return api.get(`/payments/verify/${reference}`);
};

export const getPayment = (reference) => {
  return api.get(`/payments/${reference}`);
};

export const createRegistration = (registrationData) => {
  return api.post('/registrations', registrationData);
};

export const getRegistrationsByPayment = (paymentReference) => {
  return api.get(`/registrations/payment/${paymentReference}`);
};

// Admin APIs
export const getAllRegistrations = (zoneId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (zoneId) params.append('zoneId', zoneId);
  if (startDate) {
    // Convert to ISO format with timezone
    const date = new Date(startDate);
    params.append('startDate', date.toISOString());
  }
  if (endDate) {
    // Convert to ISO format with timezone
    const date = new Date(endDate);
    params.append('endDate', date.toISOString());
  }
  const queryString = params.toString();
  return api.get(`/admin/registrations${queryString ? '?' + queryString : ''}`);
};

export const getRegistrationStats = () => {
  return api.get('/admin/registrations/stats');
};

// Auth APIs
export const login = (credentials) => {
  localStorage.removeItem('token');  // ensure no stale token
  return api.post('/auth/login', credentials);
};


export default api;

