// file: /pages/admin/profil/FotoProfilForm.js (Final dengan Preview Modal)
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AvatarImage, getAvatarConfig } from "../../utils/avatarHelper";
import { useAuth } from "../../contexts/AuthContext";

function FotoProfilForm({ initialAvatar, onUpdateSuccess }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Ambil data user untuk nama

  // --- PERUBAHAN 1: State untuk mengontrol modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Perbaikan: gunakan getAvatarConfig untuk menangani semua jenis URL
    const config = getAvatarConfig(initialAvatar, user?.nama_lengkap);
    if (config.type === 'image') {
      setAvatarPreview(config.src);
    } else {
      setAvatarPreview(null); // Reset jika tidak ada avatar
    }
  }, [initialAvatar, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Tidak perlu set avatarPreview karena logika render sudah menangani ini
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      toast.warn("Silakan pilih file avatar terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("avatar", avatarFile);
  const API_BASE_URL = "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal memperbarui avatar.");

      toast.success(result.message);
      setAvatarFile(null);

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  // --- PERUBAHAN 2: Fungsi untuk membuka dan menutup modal ---
  const openModal = () => {
    if (avatarFile || avatarPreview) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {" "}
      {/* Menggunakan fragment agar bisa menampung form dan modal */}
      <form onSubmit={handleSubmit} className="profil-form-card">
        <h3 className="card-title">Foto Profil</h3>

        {/* --- PERUBAHAN 3: Struktur baru untuk avatar dan tombolnya --- */}
        <div className="avatar-section-wrapper">
          <div
            className="avatar-container"
            onClick={openModal}
            title="Klik untuk perbesar"
          >
            {/* Prioritas: 1. File baru yang dipilih, 2. Avatar dari database/Google, 3. Fallback */}
            {avatarFile ? (
              <img src={URL.createObjectURL(avatarFile)} alt="Preview Avatar Baru" className="avatar-image" />
            ) : avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Saat Ini" className="avatar-image" />
            ) : (
              <AvatarImage 
                avatarUrl={initialAvatar}
                userName={user?.nama_lengkap || "User"}
                className="avatar-placeholder"
                size="120px"
              />
            )}
          </div>
          <p className="avatar-instruction">
            {initialAvatar && initialAvatar.includes('googleusercontent.com') 
              ? "Avatar dari Google - Klik untuk perbesar atau unggah foto baru" 
              : "Klik foto untuk perbesar"}
          </p>

          <label htmlFor="avatar" className="btn-upload-label">
            <i className="bi bi-image"></i>
            {avatarFile ? avatarFile.name : "Pilih Foto Baru"}
          </label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-submit-profil"
          disabled={loading || !avatarFile}
        >
          {loading ? "Mengunggah..." : "Unggah Foto"}
        </button>
        
        {/* Informasi tambahan untuk avatar Google */}
        {initialAvatar && initialAvatar.includes('googleusercontent.com') && !avatarFile && (
          <div className="google-avatar-info">
            <i className="bi bi-info-circle"></i>
            <small>Anda menggunakan foto profil dari Google. Unggah foto baru jika ingin menggantinya.</small>
          </div>
        )}
      </form>
      {/* --- PERUBAHAN 4: Struktur JSX untuk modal preview --- */}
      {isModalOpen && (avatarFile || avatarPreview) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close-btn" onClick={closeModal}>
              &times;
            </span>
            <img
              src={avatarFile ? URL.createObjectURL(avatarFile) : avatarPreview}
              alt="Preview Foto Profil"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default FotoProfilForm;
