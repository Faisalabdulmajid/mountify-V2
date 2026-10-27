// file: /pages/admin/profil/KelolaProfil.js
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- PERUBAHAN 1: Impor useAuth dari context ---
import { useAuth } from "../../../contexts/AuthContext";

// Impor komponen-komponen anak
import InformasiProfilForm from "./components/InformasiProfilForm";
import UbahPasswordForm from "./components/UbahPasswordForm";
import FotoProfilForm from "./components/FotoProfilForm";
import "./KelolaProfil.css";

function KelolaProfil() {
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- PERUBAHAN 2: Dapatkan fungsi updateUser dari context ---
  const { updateUser } = useAuth();

  // Fungsi untuk me-refresh data user setelah ada perubahan
  const refreshUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserData(data);

        // --- PERUBAHAN 3: Panggil updateUser untuk update state global ---
        updateUser(data);
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
        const API_BASE_URL = process.env.REACT_APP_API_URL;
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
    <div className="kelola-profil-container">
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
          {/* --- PERUBAHAN 4: Tambahkan prop onUpdateSuccess --- */}
          <InformasiProfilForm
            initialData={currentUserData}
            onUpdateSuccess={refreshUserData}
          />

          {/* Me-render komponen form ubah password */}
          <UbahPasswordForm />
        </div>
        <div className="profil-side-column">
          {/* Me-render komponen form foto profil */}
          <FotoProfilForm
            initialAvatar={currentUserData.url_foto_profil}
            onUpdateSuccess={refreshUserData}
          />
        </div>
      </div>
    </div>
  );
}

export default KelolaProfil;
