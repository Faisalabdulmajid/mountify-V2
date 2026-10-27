// file: /pages/admin/profil/InformasiProfilForm.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function InformasiProfilForm({ initialData, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    nama_lengkap: "",
    email: "",
    domisili: "",
    instansi: "",
    nomor_telepon: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        nama_lengkap: initialData.nama_lengkap || "",
        email: initialData.email || "",
        domisili: initialData.domisili || "",
        instansi: initialData.instansi || "",
        nomor_telepon: initialData.nomor_telepon || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // CSRF token dinonaktifkan sementara
      // const csrfRes = await fetch("http://localhost:5000/api/csrf-token", {
      //   credentials: "include",
      // });
      // const { csrfToken } = await csrfRes.json();
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // "X-CSRF-Token": csrfToken, // Dinonaktifkan
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal memperbarui profil.");
      toast.success(data.message);

      // --- PERUBAHAN 2: Panggil callback jika update berhasil ---
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="profil-form-card">
      <h3 className="card-title">Informasi Akun</h3>
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-person"></i>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="nama_lengkap">Nama Lengkap</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-person-badge"></i>
          <input
            type="text"
            id="nama_lengkap"
            name="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-envelope"></i>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="domisili">Domisili</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-pin-map"></i>
          <input
            type="text"
            id="domisili"
            name="domisili"
            value={formData.domisili}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="instansi">Instansi</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-building"></i>
          <input
            type="text"
            id="instansi"
            name="instansi"
            value={formData.instansi}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="nomor_telepon">Nomor Telepon</label>
        <div className="input-wrapper-icon">
          <i className="bi bi-telephone"></i>
          <input
            type="tel"
            id="nomor_telepon"
            name="nomor_telepon"
            value={formData.nomor_telepon}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <button type="submit" className="btn-submit-profil" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

export default InformasiProfilForm;
