// src/api/axios.js
import axios from 'axios';

// .env faylidan API manzilini olamiz
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Bu "interceptor" har bir so'rov yuborilishidan oldin ishlaydi
apiClient.interceptors.request.use(
  (config) => {
    // localStorage dan accessToken ni olamiz
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Agar token mavjud bo'lsa, uni headerga qo'shamiz
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;