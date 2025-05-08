// src/api/index.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
});

export const register = (userData) => API.post('/accounts/register', userData);
export const verifyOtp = (data) => API.post('/accounts/verify-otp', data);
export const login = (credentials) => API.post('/accounts/login', credentials);
export const getProfile = (token) =>
  API.get('/accounts/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateProfile = (token, data) =>
  API.put('/accounts/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const changePassword = (token, data) =>
  API.put('/accounts/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
