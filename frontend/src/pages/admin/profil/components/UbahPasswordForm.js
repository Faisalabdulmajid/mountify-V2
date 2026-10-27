// file: /pages/admin/profil/UbahPasswordForm.js
import React, { useState } from "react";
import { toast } from "react-toastify";

function UbahPasswordForm() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/profile/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal memperbarui password.");
      toast.success(data.message);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="profil-form-card">
      <h3 className="card-title">Ubah Password</h3>
      <div className="input-group">
        <label htmlFor="currentPassword">Password Saat Ini</label>
        <div className="input-wrapper-icon">
          <button
            type="button"
            className="password-toggle-btn-left"
            onClick={() => toggleVisibility("current")}
          >
            <i
              className={`bi ${
                passwordVisibility.current ? "bi-unlock-fill" : "bi-lock-fill"
              }`}
            ></i>
          </button>
          <input
            type={passwordVisibility.current ? "text" : "password"}
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="newPassword">Password Baru</label>
        <div className="input-wrapper-icon">
          <button
            type="button"
            className="password-toggle-btn-left"
            onClick={() => toggleVisibility("new")}
          >
            <i
              className={`bi ${
                passwordVisibility.new ? "bi-unlock-fill" : "bi-lock-fill"
              }`}
            ></i>
          </button>
          <input
            type={passwordVisibility.new ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            placeholder="Minimal 8 karakter"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="confirmNewPassword">Konfirmasi Password Baru</label>
        <div className="input-wrapper-icon">
          <button
            type="button"
            className="password-toggle-btn-left"
            onClick={() => toggleVisibility("confirm")}
          >
            <i
              className={`bi ${
                passwordVisibility.confirm ? "bi-unlock-fill" : "bi-lock-fill"
              }`}
            ></i>
          </button>
          <input
            type={passwordVisibility.confirm ? "text" : "password"}
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={passwordData.confirmNewPassword}
            onChange={handleChange}
            placeholder="Ulangi password baru"
            required
            disabled={loading}
          />
        </div>
      </div>
      <button type="submit" className="btn-submit-profil" disabled={loading}>
        {loading ? "Menyimpan..." : "Ubah Password"}
      </button>
    </form>
  );
}

export default UbahPasswordForm;
