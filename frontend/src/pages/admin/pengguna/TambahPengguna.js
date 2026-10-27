// TambahPengguna.js (Disesuaikan dengan Skema Database db_gunung2)
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./TambahPengguna.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function TambahPengguna() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaLengkap: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    domisili: "",
    instansi: "",
    nomorTelepon: "",
    peran: "user", // PERBAIKAN: Menggunakan 'peran'
    status: "Aktif",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Proteksi akses hanya untuk superadmin
  const currentUserRole = localStorage.getItem("peran");
  
  useEffect(() => {
    if (currentUserRole !== "superadmin") {
      navigate("/admin/dashboard", { 
        replace: true,
        state: { 
          error: "Anda tidak memiliki akses ke halaman tambah pengguna." 
        }
      });
    }
  }, [currentUserRole, navigate]);

  // Jika bukan superadmin, jangan render komponen
  if (currentUserRole !== "superadmin") {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({ ...prevState, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok!");
      return;
    }
    setIsLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("nama_lengkap", formData.namaLengkap);
    dataToSend.append("username", formData.username);
    dataToSend.append("email", formData.email);
    dataToSend.append("password", formData.password);
    dataToSend.append("domisili", formData.domisili);
    dataToSend.append("instansi", formData.instansi);
    dataToSend.append("nomor_telepon", formData.nomorTelepon);
    dataToSend.append("peran", formData.peran);
    dataToSend.append("status", formData.status);
    if (formData.avatar) {
      dataToSend.append("avatar", formData.avatar);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal menambahkan pengguna.");
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengguna baru berhasil ditambahkan!",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <header className="page-header">
        <h1>Tambah Pengguna Baru</h1>
        <Link to="/admin/users" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali ke Daftar
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="form-widget">
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="avatar">Foto Profil</label>
            <div className="avatar-upload-container">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="avatar-preview"
                />
              ) : (
                <div className="avatar-placeholder">
                  <i className="bi bi-person-fill"></i>
                </div>
              )}
              <input
                type="file"
                id="avatar"
                name="avatar"
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="namaLengkap">Nama Lengkap</label>
            <input
              type="text"
              id="namaLengkap"
              name="namaLengkap"
              value={formData.namaLengkap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nomorTelepon">Nomor Telepon</label>
            <input
              type="tel"
              id="nomorTelepon"
              name="nomorTelepon"
              value={formData.nomorTelepon}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="domisili">Domisili</label>
            <input
              type="text"
              id="domisili"
              name="domisili"
              value={formData.domisili}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="instansi">Instansi</label>
            <input
              type="text"
              id="instansi"
              name="instansi"
              value={formData.instansi}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="peran">Level Peran</label>
            {/* PERBAIKAN: Menggunakan name='peran' dan value dari state.peran */}
            <select
              id="peran"
              name="peran"
              value={formData.peran}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Diblokir">Diblokir</option>
            </select>
          </div>
        </div>
        {error && <p className="form-error-message">{error}</p>}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/users")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
          </button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default TambahPengguna;
