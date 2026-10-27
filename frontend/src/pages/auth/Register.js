// src/pages/auth/Register.js (KODE FINAL)
import React, { useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import { EyeIcon } from "../../components/common/EyeIcon";
import "./AuthForms.css";
import { useAuth } from "../../contexts/AuthContext"; // Tambahkan ini

function Register() {
  const { openModal } = useModal();
  const { login } = useAuth(); // Tambahkan ini
  const [form, setForm] = useState({
    nama_lengkap: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...userDataToSubmit } = form;
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDataToSubmit),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registrasi gagal.");
      // Otomatis login setelah register berhasil
      if (data.user && data.token) {
        login(data.user, data.token);
        setSuccess("Registrasi berhasil! Anda akan diarahkan...");
        setTimeout(() => openModal("login"), 1500); // Optional: bisa redirect ke halaman utama
      } else {
        setSuccess("Registrasi berhasil! Silakan login.");
        setTimeout(() => openModal("login"), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}
        <div className="auth-form-group">
          <label htmlFor="nama_lengkap">Nama Lengkap</label>
          <input
            type="text"
            name="nama_lengkap"
            id="nama_lengkap"
            className="auth-input"
            value={form.nama_lengkap}
            onChange={handleChange}
            required
          />
        </div>
        <div className="auth-form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            className="auth-input"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="auth-form-group">
          <label htmlFor="email_reg">Email</label>
          <input
            type="email"
            name="email"
            id="email_reg"
            className="auth-input"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="auth-form-group">
          <label htmlFor="password_reg">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password_reg"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-eye-icon"
              title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
            >
              <EyeIcon visible={showPassword} />
            </span>
          </div>
        </div>
        <div className="auth-form-group">
          <label htmlFor="confirmPassword">Konfirmasi Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              className="auth-input"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="password-eye-icon"
              title={
                showConfirmPassword ? "Sembunyikan Password" : "Lihat Password"
              }
            >
              <EyeIcon visible={showConfirmPassword} />
            </span>
          </div>
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Mendaftar..." : "Buat Akun"}
        </button>
      </form>
      <div className="auth-navigation-prompt">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={() => openModal("login")}
          className="auth-link"
        >
          Login di sini
        </button>
      </div>
    </div>
  );
}
export default Register;
