import React, { useState } from "react";
import { EyeIcon } from "../../components/common/EyeIcon";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Password tidak boleh kosong.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (!token) {
      setError("Token tidak ditemukan. Silakan cek link reset Anda.");
      return;
    }
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal reset password.");
      } else {
        setSuccess("Password berhasil direset. Silakan login dengan password baru.");
        setTimeout(() => navigate("/"), 2500);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-outer reset-password-outer">
      <div className="auth-form-container reset-password-card">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-message error">{error}</div>}
          {success && <div className="auth-message success">{success}</div>}
          <div className="auth-form-group password-group">
            <label>Password Baru</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
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
          <div className="auth-form-group password-group">
            <label>Konfirmasi Password Baru</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="auth-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                required
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="password-eye-icon"
                title={showConfirmPassword ? "Sembunyikan Password" : "Lihat Password"}
              >
                <EyeIcon visible={showConfirmPassword} />
              </span>
            </div>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
