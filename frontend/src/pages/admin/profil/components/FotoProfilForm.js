// file: /pages/admin/profil/FotoProfilForm.js (Final dengan Preview Modal)
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function FotoProfilForm({ initialAvatar, onUpdateSuccess }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- PERUBAHAN 1: State untuk mengontrol modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAvatarPreview(
      initialAvatar ? `http://localhost:5000${initialAvatar}` : null
    );
  }, [initialAvatar]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
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
      const response = await fetch("http://localhost:5000/api/profile/avatar", {
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
    if (avatarPreview) {
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
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <i className="bi bi-person-circle"></i>
              </div>
            )}
          </div>
          <p className="avatar-instruction">Klik foto untuk perbesar</p>

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
      </form>
      {/* --- PERUBAHAN 4: Struktur JSX untuk modal preview --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close-btn" onClick={closeModal}>
              &times;
            </span>
            <img
              src={avatarPreview}
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
