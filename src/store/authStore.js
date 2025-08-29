// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/axios';

const useAuthStore = create(
  // `persist` middleware yordamida state localStorage ga avtomatik saqlanadi
  persist(
    (set, get) => ({
      // --- STATE ---
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // --- ACTIONS ---
      // Tokenlar va foydalanuvchini state ga saqlash
      login: (tokens) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
      },

      // Tizimdan chiqish
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      // Foydalanuvchi ma'lumotlarini olish va saqlash
      fetchUser: async () => {
        try {
          const response = await apiClient.get('/users/me/');
          set({ user: response.data });
        } catch (error) {
          console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error);
          // Agar xatolik 401 bo'lsa (token eskirgan), tizimdan chiqaramiz
          if (error.response && error.response.status === 401) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage dagi kalit so'z
    }
  )
);

export default useAuthStore;