// src/pages/auth/Login.js (KODE FINAL DENGAN NAVIGASI)

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom"; // Pastikan useNavigate diimpor
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import { EyeIcon } from "../../components/common/EyeIcon";

// Impor HANYA CSS untuk form
import "./AuthForms.css";

function Login() {
  const navigate = useNavigate(); // Panggil hook useNavigate di sini
  const { login } = useAuth();
  const { closeModal, openModal } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk show/hide password

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      // 1. Simpan data login ke context
      login(data.user, data.token);

      // === SIMPAN PERAN USER KE LOCALSTORAGE ===
      // Simpan peran user ke localStorage, update jika user berbeda
      localStorage.setItem("peran", data.user.peran);
      localStorage.setItem("userId", data.user._id || data.user.id || ""); // opsional, jika ingin tracking user

      // 2. Tutup modal
      closeModal();

      // === PERBAIKAN UTAMA ADA DI SINI ===
      // 3. Cek peran pengguna, jika admin, arahkan ke dashboard
      if (data.user.peran === "admin" || data.user.peran === "superadmin") {
        navigate("/admin/dashboard");
      }
      // Untuk pengguna biasa, tidak perlu navigasi, mereka akan tetap di halaman saat ini.
      // Anda bisa menambahkan 'else { navigate("/") }' jika ingin user biasa diarahkan ke Home.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login Akun</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="auth-message error">{error}</div>}
        <div className="auth-form-group">
          <label htmlFor="email_login">Email</label>
          <input
            type="email"
            id="email_login"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            required
          />
        </div>
        <div className="auth-form-group password-group">
          <label htmlFor="password_login">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password_login"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
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
        <div className="auth-form-options">
          <button
            type="button"
            onClick={() => openModal("forgotPassword")}
            className="auth-link"
          >
            Lupa Password?
          </button>
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
      <div className="auth-divider">ATAU</div>
      <div className="google-login-btn-wrapper">
        <GoogleLogin
            onSuccess={async credentialResponse => {
              setError(null);
              setLoading(true);
              try {
                const API_BASE_URL = process.env.REACT_APP_API_URL;
                const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ credential: credentialResponse.credential }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Login Google gagal.");
                // Simpan data login ke context
                login(data.user, data.token);
                localStorage.setItem("peran", data.user.peran);
                localStorage.setItem("userId", data.user.id || "");
                closeModal();
                if (data.user.peran === "admin" || data.user.peran === "superadmin") {
                  navigate("/admin/dashboard");
                }
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Login Google gagal. Silakan coba lagi.");
            }}
            width={300}
            disabled={loading}
            // Tambahkan custom render agar tombol sama dengan tombol login utama
            render={renderProps => (
              <button
                type="button"
                className="auth-button"
                onClick={renderProps.onClick}
                disabled={loading}
                aria-label="Login dengan Google"
                style={{
                  backgroundColor: loading ? '#15803d' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  style={{
                    width: '20px',
                    height: '20px'
                  }}
                />
                {loading ? "Memuat..." : "Login dengan Google"}
              </button>
            )}
          />
        {/* Loading overlay dihilangkan agar tidak menutupi logo */}
      </div>
      <div className="auth-navigation-prompt">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => openModal("register")}
          className="auth-link"
        >
          Daftar sekarang
        </button>
      </div>
    </div>
  );
}

export default Login;
