import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// REVISI: Impor komponen Button dan file CSS umum
import Button from "../common/Button/Button";
import "./HomePageSections.css";
import "./PengumumanTerbaruSection.css";

function PengumumanTerbaruSection() {
  const [pengumuman, setPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // --- MENGAMBIL DATA ASLI DARI DATABASE ---
    const fetchPengumumanTerbaru = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        console.log("🔗 API URL:", API_BASE_URL);
        console.log("📡 Fetching pengumuman dari:", `${API_BASE_URL}/api/public/pengumuman/terbaru`);
        
        const response = await fetch(
          `${API_BASE_URL}/api/public/pengumuman/terbaru`
        );

        console.log("📊 Response status:", response.status);
        console.log("📊 Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Response error:", errorText);
          throw new Error(
            `Gagal mengambil data pengumuman: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("✅ Data pengumuman berhasil dimuat:", data);
        console.log("📝 Jumlah pengumuman:", data.length);
        setPengumuman(data);
      } catch (err) {
        console.error("Gagal memuat pengumuman terbaru:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPengumumanTerbaru();
  }, []);

  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fungsi untuk mengambil ringkasan dari isi_pengumuman jika ringkasan tidak ada
  const getSummary = (item) => {
    if (item.ringkasan) return item.ringkasan;
    if (item.isi_pengumuman) {
      // Hilangkan tag HTML dan ambil 200 karakter pertama
      const text = item.isi_pengumuman.replace(/<[^>]+>/g, "");
      return text.length > 200 ? text.slice(0, 200) + "..." : text;
    }
    return "";
  };

  if (isLoading) {
    return (
      <section className="home-section pengumuman-terbaru-section">
        <div className="home-section-container">
          <h2 className="section-title">
            <i className="bi bi-megaphone-fill"></i> Pengumuman Terbaru
          </h2>
          <div className="card-grid">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card-base pengumuman-card is-loading">
                <div className="pengumuman-card-content">
                  <div className="placeholder-line title"></div>
                  <div className="placeholder-line date"></div>
                  <div className="placeholder-line text"></div>
                  <div className="placeholder-line text short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || pengumuman.length === 0) {
    return null;
  }

  return (
    <section className="home-section pengumuman-terbaru-section">
      <div className="home-section-container">
        <h2 className="section-title">
          <i className="bi bi-megaphone-fill"></i> Pengumuman Terbaru
        </h2>
        <div className="card-grid">
          {pengumuman.map((item) => (
            <Link
              key={item.id_pengumuman}
              to={`/pengumuman/${item.id_pengumuman}`}
              className="card-base pengumuman-card"
            >
              <div className="pengumuman-card-content">
                <h3 className="pengumuman-card-title">{item.judul}</h3>
                <p className="pengumuman-card-date">
                  {formatDisplayDate(item.tanggal_publikasi)}
                </p>

                {/* === PERUBAHAN UTAMA ADA DI SINI === */}
                <div
                  className="pengumuman-card-summary"
                  dangerouslySetInnerHTML={{
                    __html: getSummary(item), // tanpa sanitizeHtml untuk tes
                  }}
                />
                {/* ===================================== */}
              </div>
              <span className="pengumuman-selengkapnya">
                Selengkapnya &rarr;
              </span>
            </Link>
          ))}
        </div>
        <div className="section-cta-container">
          <Button to="/pengumuman" variant="secondary">
            Lihat Semua Pengumuman
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PengumumanTerbaruSection;
