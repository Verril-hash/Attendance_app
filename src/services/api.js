// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const validateToken = (email) => api.post('/api/auth/login', { email });
export const getClasses = () => api.get('/api/classes');
export const createClass = (data) => api.post('/api/classes', data);
export const getStudents = (classId) => api.get(`/api/students/${classId}`);
export const addStudent = (classId, data) => api.post(`/api/students/${classId}`, data);
export const saveAttendance = (classId, data) => api.post(`/api/attendance/${classId}`, data);
export const deleteClass = (classId) => api.delete(`/api/classes/${classId}`);
export const getAnalytics = (classId) => api.get(`/api/analytics/${classId}`);

export default api;