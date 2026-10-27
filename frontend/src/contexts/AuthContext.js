// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Buat Context
const AuthContext = createContext(null);

// 2. Buat Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  // State baru untuk menandakan proses pengecekan auth sedang berjalan
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Fungsi ini hanya berjalan sekali saat aplikasi pertama kali dimuat
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Gagal memuat data auth dari localStorage:", error);
      // Jika terjadi error, pastikan state kembali bersih
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      // Tandai bahwa proses pengecekan auth telah selesai
      setIsAuthLoading(false);
    }
  }, []);

  // Fungsi untuk login
  const login = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
  };

  // Fungsi untuk logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Fungsi untuk memperbarui data user (misal: setelah edit profil)
  const updateUser = (newUserData) => {
    const updatedUserForStorage = {
      id: newUserData.id || newUserData.id_user,
      nama_lengkap: newUserData.nama_lengkap,
      email: newUserData.email,
      peran: newUserData.peran || newUserData.role,
      url_foto_profil: newUserData.url_foto_profil,
    };
    localStorage.setItem("user", JSON.stringify(updatedUserForStorage));
    setUser(updatedUserForStorage);
  };

  // Nilai yang akan diberikan ke semua komponen di bawahnya
  const value = { user, token, isAuthLoading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Buat Custom Hook untuk menggunakan context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
