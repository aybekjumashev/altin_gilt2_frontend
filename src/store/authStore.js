
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/axios';

const useAuthStore = create(

  persist(
    (set, get) => ({

      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,



      login: (tokens) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
      },


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


      fetchUser: async () => {
        try {
          const response = await apiClient.get('/users/me/');
          set({ user: response.data });
        } catch (error) {
          console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error);

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