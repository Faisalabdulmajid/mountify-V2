// src/pages/auth/ForgotPassword.js (KODE FINAL)
import React, { useState } from "react";
import { useModal } from "../../contexts/ModalContext";
import "./AuthForms.css";

function ForgotPassword() {
  const { openModal } = useModal();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Gagal mengirim link reset. Coba lagi.");
      } else {
        setMessage("Jika email terdaftar, link reset telah dikirim.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Lupa Password</h2>
      <p className="auth-subtext">
        Masukkan email Anda, kami akan mengirimkan link untuk mereset password.
      </p>
      <form onSubmit={handleSubmit}>
        {error && <div className="auth-message error">{error}</div>}
        {message && <div className="auth-message success">{message}</div>}
        <div className="auth-form-group">
          <label htmlFor="email_forgot">Alamat Email</label>
          <input
            type="email"
            id="email_forgot"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email terdaftar Anda"
            required
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>
      </form>
      <div className="auth-navigation-prompt">
        <button
          type="button"
          onClick={() => openModal("login")}
          className="auth-link"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}
export default ForgotPassword;
