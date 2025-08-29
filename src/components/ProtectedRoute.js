// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Agar foydalanuvchi tizimga kirgan bo'lsa, ichki komponentlarni (masalan, ProfilePage) ko'rsatamiz
  // Outlet - bu joyda ichki route'lar render bo'ladi
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;