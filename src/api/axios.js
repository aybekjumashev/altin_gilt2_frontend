
import axios from 'axios';
import useAuthStore from '../store/authStore'; // Zustand store'ni import qilamiz

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.altingilt.store/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});



apiClient.interceptors.request.use(
  (config) => {

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);




apiClient.interceptors.response.use(

  (response) => response,


  async (error) => {
    const originalRequest = error.config;


    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Qaytadan urinmaslik uchun belgi qo'yamiz

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {

          useAuthStore.getState().logout();
          window.location.href = '/login'; // Login sahifasiga yo'naltirish
          return Promise.reject(error);
        }






        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newTokens = {
          access: response.data.access,
          refresh: refreshToken, // Ba'zi backendlar yangi refresh token ham qaytaradi
        };


        useAuthStore.getState().login(newTokens);


        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access}`;


        return apiClient(originalRequest);

      } catch (refreshError) {

        console.error("Refresh token yaroqsiz:", refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);


export default apiClient;