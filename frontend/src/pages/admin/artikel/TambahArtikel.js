// src/pages/admin/artikel/TambahArtikel.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TipTapEditor from "../../../components/common/TipTapEditor";
import { fetchCsrfToken } from "../../../utils/csrf";
import "./FormArtikel.css";

const API_BASE_URL = process.env.REACT_APP_API_URL + "/api/admin";

function TambahArtikel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul: "",
    kategori: "Tips & Trik",
    status: "Draft",
    konten: "",
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.konten) {
      toast.warn("Judul dan Konten artikel tidak boleh kosong.");
      return;
    }
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Otentikasi gagal. Silakan login kembali.");
        setIsLoading(false);
        return;
      }

      const csrfToken = await fetchCsrfToken(process.env.REACT_APP_API_URL);
      const dataToSubmit = new FormData();
      dataToSubmit.append("judul", formData.judul);
      dataToSubmit.append("kategori", formData.kategori);
      dataToSubmit.append("status", formData.status);
      dataToSubmit.append("isi_artikel", formData.konten);
      if (fotoFile) {
        dataToSubmit.append("foto_utama", fotoFile);
      }

      const response = await fetch(`${API_BASE_URL}/artikel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: dataToSubmit,
      });

      const result = await response.json();
      if (!response.ok) {
        // Jika backend mengirim HTML, response.json() akan gagal, masuk ke catch
        throw new Error(result.message || "Gagal menyimpan artikel.");
      }

      toast.success(`Artikel berhasil disimpan!`);
      setTimeout(() => navigate("/admin/articles"), 2000);
    } catch (err) {
      // Tangani error JSON parse di sini juga
      toast.error(
        err.message || "Terjadi kesalahan. Periksa koneksi atau hubungi admin."
      );
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleKontenChange = (newContent) => {
    setFormData((prevState) => ({ ...prevState, konten: newContent }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    } else {
      toast.warn("Silakan pilih file gambar.");
    }
  };

  return (
    <div className="add-edit-artikel-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="page-header">
        <h1>Tulis Artikel Baru</h1>
        <Link to="/admin/articles" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="form-widget-artikel">
        <div className="form-main-column">
          <div className="form-group">
            <label htmlFor="judul">Judul Artikel</label>
            <input
              type="text"
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Contoh: 7 Danau Terindah di Atas Gunung"
              required
            />
          </div>
          <div className="form-group">
            <label>Konten Artikel</label>
            <TipTapEditor
              content={formData.konten}
              onContentChange={handleKontenChange}
            />
          </div>
        </div>

        <div className="form-sidebar-column">
          <div className="widget-card-artikel-settings">
            <h3>Pengaturan Publikasi</h3>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Simpan sebagai Draft</option>
                <option value="Published">Publikasikan</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="kategori">Kategori</label>
              <select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
              >
                <option value="Tips & Trik">Tips & Trik</option>
                <option value="Destinasi">Destinasi</option>
                <option value="Review">Review Peralatan</option>
                <option value="Edukasi">Edukasi</option>
                <option value="Berita">Berita Gunung</option>
              </select>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn-save-artikel"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Artikel"}
              </button>
            </div>
          </div>
          <div className="widget-card-artikel-settings">
            <h3>Foto Utama</h3>
            <div className="form-group">
              <div
                className="foto-upload-container-artikel"
                onClick={() => document.getElementById("fotoUtama").click()}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="foto-preview-artikel"
                  />
                ) : (
                  <div className="foto-placeholder-artikel">
                    <i className="bi bi-image-fill"></i>
                    <p>Klik untuk memilih foto</p>
                    <span>Rekomendasi 1200x800px</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="fotoUtama"
                name="fotoUtama"
                onChange={handleFotoChange}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
export default TambahArtikel;
