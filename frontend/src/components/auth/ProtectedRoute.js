// src/components/auth/ProtectedRoute.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Sesuaikan path ini jika perlu

// Komponen untuk menampilkan layar loading
const AuthLoadingScreen = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <span>Memverifikasi sesi Anda...</span>
    </div>
  );
};

function ProtectedRoute() {
  const { user, isAuthLoading } = useAuth();

  // 1. Jika proses pengecekan auth masih berjalan, tampilkan layar loading.
  // Ini adalah kunci untuk mengatasi masalah refresh.
  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  // 2. Setelah pengecekan selesai, periksa apakah ada user dan perannya adalah admin.
  const isAdmin =
    user && (user.peran === "admin" || user.peran === "superadmin");

  // 3. Jika user adalah admin, izinkan akses ke halaman yang diminta (yang ada di dalam <Outlet />).
  // Jika tidak, alihkan ke halaman home.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
