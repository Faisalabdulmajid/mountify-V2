// EditPengguna.js (Sesuai dengan Server dan Database Final)
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import "./EditPengguna.css";
// import { useAuth } from "../../../contexts/AuthContext"; // Pastikan path ini benar jika Anda menggunakannya

const API_BASE_URL = process.env.REACT_APP_API_URL;



function EditPengguna() {
  const navigate = useNavigate();
  const { id_user } = useParams();
  // const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    namaLengkap: "",
    username: "",
    email: "",
    domisili: "",
    instansi: "",
    nomorTelepon: "",
    peran: "user",
    status: "Aktif",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Proteksi akses hanya untuk superadmin
  const currentUserRole = localStorage.getItem("peran");
  
  useEffect(() => {
    if (currentUserRole !== "superadmin") {
      navigate("/admin/dashboard", { 
        replace: true,
        state: { 
          error: "Anda tidak memiliki akses ke halaman edit pengguna." 
        }
      });
      return;
    }
  }, [currentUserRole, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Akses ditolak. Token tidak ditemukan.");

        // Memanggil endpoint GET yang baru saja kita tambahkan di server
        const response = await fetch(
          `${API_BASE_URL}/api/admin/users/${id_user}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Pengguna tidak ditemukan.");
        }

        const userToEdit = await response.json();

        setFormData({
          namaLengkap: userToEdit.nama_lengkap || "",
          username: userToEdit.username || "",
          email: userToEdit.email || "",
          domisili: userToEdit.domisili || "",
          instansi: userToEdit.instansi || "",
          nomorTelepon: userToEdit.nomor_telepon || "",
          peran: userToEdit.peran || "user",
          status: userToEdit.status || "Aktif",
        });

        if (userToEdit.url_foto_profil) {
          const url = userToEdit.url_foto_profil;
          if (url.startsWith("http://") || url.startsWith("https://")) {
            setAvatarPreview(url);
          } else {
            setAvatarPreview(`${API_BASE_URL}${url}`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id_user]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const dataToUpdate = {
      nama_lengkap: formData.namaLengkap,
      email: formData.email,
      domisili: formData.domisili,
      instansi: formData.instansi,
      nomor_telepon: formData.nomorTelepon,
      peran: formData.peran,
      status: formData.status,
    };

    const token = localStorage.getItem("token");
    try {
      // Memanggil endpoint PUT yang baru saja kita tambahkan di server
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${id_user}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToUpdate),
          credentials: "include",
        }
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal memperbarui profil.");
      setSuccess("Profil pengguna berhasil diperbarui!");
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Jika bukan superadmin, jangan render komponen
  if (currentUserRole !== "superadmin") {
    return null;
  }

  if (isLoading) {
    return <div className="loading-container">Memuat data pengguna...</div>;
  }

  if (error && !formData.namaLengkap) {
    return (
      <div className="edit-user-page">
        <header className="page-header">
          <h1>Edit Pengguna</h1>
        </header>
        <p className="form-error-message">{error}</p>
        <Link to="/admin/users" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="edit-user-page">
      <header className="page-header">
        <h1>Edit Pengguna: {formData.namaLengkap}</h1>
        <Link to="/admin/users" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali
        </Link>
      </header>

      {error && <p className="form-error-message">{error}</p>}
      {success && <p className="form-success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="form-widget-user">
        <div className="form-row">
          <div className="form-group full-width">
            <label>Foto Profil</label>
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
              <small>
                Ganti avatar dapat dilakukan pengguna dari halaman profilnya.
              </small>
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
            <label htmlFor="username">Username (Tidak Dapat Diubah)</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              readOnly
              disabled
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
            <label htmlFor="peran">Level Peran</label>
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
              <option value="Nonaktif">Nonaktif</option>
              <option value="Diblokir">Diblokir</option>
            </select>
          </div>
        </div>
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
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default EditPengguna;
