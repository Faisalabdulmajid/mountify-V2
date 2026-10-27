// file: /pages/public/Profil/HalamanProfilSaya.js

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Impor komponen dari lokasi bersama yang baru
import InformasiProfilForm from "../../../components/profil/InformasiProfilForm";
import UbahPasswordForm from "../../../components/profil/UbahPasswordForm";
import FotoProfilForm from "../../../components/profil/FotoProfilForm";

// Impor CSS baru untuk halaman ini
import "./HalamanProfilSaya.css";

function HalamanProfilSaya() {
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk me-refresh data user setelah ada perubahan
  const refreshUserData = async () => {
    const token = localStorage.getItem("token");
    try {
  const API_BASE_URL = "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserData(data);
      } else {
        throw new Error("Gagal memuat ulang data pengguna.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesi tidak valid. Silakan login kembali.");
        setIsLoading(false);
        return;
      }
      try {
  const API_BASE_URL = "http://localhost:5000";
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserData(data);
        } else {
          toast.error("Gagal mengambil data profil.");
        }
      } catch (error) {
        toast.error("Gagal terhubung ke server.");
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  if (isLoading) {
    return <div className="loading-container">Memuat data profil...</div>;
  }

  if (!currentUserData) {
    return (
      <div className="loading-container">
        Gagal memuat data. Coba muat ulang halaman.
      </div>
    );
  }

  return (
    // Gunakan class CSS baru
    <div className="halaman-profil-saya-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        hideProgressBar={false}
      />
      <header className="page-header-profil">
        <h1>Profil Saya</h1>
        <p>Kelola informasi akun, password, dan foto profil Anda.</p>
      </header>
      <div className="profil-content-grid">
        <div className="profil-main-column">
          <InformasiProfilForm
            initialData={currentUserData}
            onUpdateSuccess={refreshUserData}
          />
          <UbahPasswordForm />
        </div>
        <div className="profil-side-column">
          <FotoProfilForm
            initialAvatar={currentUserData.url_foto_profil}
            onUpdateSuccess={refreshUserData}
          />
        </div>
      </div>
    </div>
  );
}

export default HalamanProfilSaya;
