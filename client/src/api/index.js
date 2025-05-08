import axios from 'axios';

   console.log('Initializing axios API client');
   const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:9000/accounts').replace(/\/+$/, '');
   const API = axios.create({
     baseURL,
     timeout: 10000,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   API.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('token');
       console.log('API Request:', config.method.toUpperCase(), config.url, {
         data: config.data,
         hasToken: !!token,
       });
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => {
       console.error('API Request error:', error);
       return Promise.reject(error);
     }
   );

   API.interceptors.response.use(
     (response) => {
       console.log('API Response:', response.config.url, response.data);
       return response.data;
     },
     (error) => {
       console.error('API Response error:', {
         url: error.config?.url,
         status: error.response?.status,
         message: error.message,
         data: error.response?.data,
       });
       if (error.code === 'ERR_NETWORK') {
         return Promise.reject('Unable to connect to the server. Please try again later.');
       }
       if (error.response?.status === 401) {
         console.warn('Unauthorized, clearing token');
         localStorage.removeItem('token');
         if (window.location.pathname !== '/login') {
           window.location.href = '/login';
         }
         return Promise.reject('Session expired. Please log in again.');
       }
       if (error.response?.status === 400) {
         if (error.response.data.error) {
           return Promise.reject(error.response.data.error.message);
         }
         return Promise.reject('Invalid request.');
       }
       if (error.response?.status === 404) {
         return Promise.reject('Requested resource not found. Please check the server configuration.');
       }
       return Promise.reject(error.response?.data?.error?.message || 'An error occurred');
     }
   );

   export const register = async (userData) => API.post('/register', userData);
   export const verifyOtp = async (data) => API.post('/verify-otp', data);
   export const resendOtp = async (data) => API.post('/resend-otp', data);
   export const login = async (credentials) => API.post('/login', credentials);
   export const googleLogin = () => {
     console.log('Initiating Google OAuth redirect');
     window.location.href = `${baseURL}/google`;
   };
   export const getProfile = async () => API.get('/profile');
   export const updateProfile = async (data) => API.put('/profile', data);
   export const changePassword = async (data) => API.put('/change-password', data);
   export const resetPasswordRequest = async (data) => API.post('/reset-password-request', data);
   export const resetPassword = async (data) => API.post('/reset-password', data);
   export const getUsers = async () => API.get('/users');