// src/pages/public/LaporError/LaporError.js (Versi Final dengan Penanganan Error)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LaporError.css";
// Impor useAuth untuk logout jika diperlukan
import { useAuth } from "../../../contexts/AuthContext";

// Ganti base URL agar endpoint publik
const API_BASE_URL = "http://localhost:5000";

function LaporError() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Ambil fungsi logout dari context
  const [formData, setFormData] = useState({
    judul_laporan: "",
    deskripsi_laporan: "",
    halaman_error: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Otomatis mengisi URL halaman saat ini
    setFormData((prev) => ({ ...prev, halaman_error: window.location.href }));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul_laporan || !formData.deskripsi_laporan) {
      toast.warn("Judul dan Deskripsi laporan wajib diisi.");
      return;
    }
    setIsLoading(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append("judul_laporan", formData.judul_laporan);
    dataToSubmit.append("deskripsi_laporan", formData.deskripsi_laporan);
    dataToSubmit.append("halaman_error", formData.halaman_error);
    if (screenshot) {
      dataToSubmit.append("screenshot", screenshot);
    }

    const token = localStorage.getItem("token");

    // Menangani jika pengguna tidak login sama sekali
    if (!token) {
      toast.error("Anda harus login untuk mengirim laporan.");
      setIsLoading(false);
      return;
    }

    try {
      let response = await fetch(`${API_BASE_URL}/api/laporan-error`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSubmit,
      });

      // Jika endpoint tidak ditemukan (404), coba ulang ke /laporan-error tanpa /api
      if (response.status === 404 && API_BASE_URL.endsWith("/api")) {
        const fallbackUrl =
          API_BASE_URL.replace(/\/api$/, "") + "/laporan-error";
        response = await fetch(fallbackUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: dataToSubmit,
        });
      }

      // == PERBAIKAN UTAMA ADA DI SINI ==
      // Cek jika response adalah 401 atau 403 (sesi tidak valid/habis)
      if (response.status === 401) {
        toast.error(
          "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."
        );
        logout(); // Hapus sisa token dan data pengguna dari context
        setTimeout(() => navigate("/"), 3000); // Arahkan ke homepage setelah 3 detik
        setIsLoading(false);
        return;
      }
      if (response.status === 403) {
        toast.error(
          "Anda tidak punya akses untuk mengirim laporan error. Silakan login sebagai admin atau hubungi administrator."
        );
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        // Menangani error lain dari server
        throw new Error(result.message || "Gagal mengirim laporan.");
      }

      toast.success(
        "Laporan berhasil dikirim. Terima kasih atas masukan Anda!"
      );
      setTimeout(() => navigate("/"), 2000); // Kembali ke homepage setelah berhasil
    } catch (err) {
      // Catch ini akan menangani error JSON.parse jika respons bukan JSON, atau error jaringan
      toast.error(err.message || "Terjadi kesalahan yang tidak terduga.");
      setIsLoading(false);
    }
  };

  return (
    <div className="lapor-error-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="lapor-error-card">
        <h2>Laporkan Masalah atau Error</h2>
        <p>
          Menemukan sesuatu yang tidak beres? Beri tahu kami agar dapat segera
          kami perbaiki.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="judul_laporan">Judul Laporan</label>
            <input
              type="text"
              id="judul_laporan"
              name="judul_laporan"
              value={formData.judul_laporan}
              onChange={handleChange}
              placeholder="cth: Tombol Simpan Tidak Berfungsi"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deskripsi_laporan">Deskripsi Masalah</label>
            <textarea
              id="deskripsi_laporan"
              name="deskripsi_laporan"
              value={formData.deskripsi_laporan}
              onChange={handleChange}
              rows="6"
              placeholder="Jelaskan masalah yang Anda temui, termasuk langkah-langkah untuk mereproduksinya."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="halaman_error">URL Halaman Error</label>
            <input
              type="text"
              id="halaman_error"
              name="halaman_error"
              value={formData.halaman_error}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="screenshot">Screenshot (Opsional)</label>
            <input
              type="file"
              id="screenshot"
              name="screenshot"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
            />
          </div>
          <button
            type="submit"
            className="btn-submit-laporan"
            disabled={isLoading}
          >
            {isLoading ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LaporError;
