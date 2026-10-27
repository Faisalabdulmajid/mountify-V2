import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// REVISI: Impor komponen Button kita
import Button from "../common/Button/Button";
import "./HomePageSections.css";
import "./ArtikelTerbaruSection.css";

function ArtikelTerbaruSection() {
  const [artikel, setArtikel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // --- SIMULASI FETCH DATA ARTIKEL TERBARU ---
    const fetchDummyArtikel = () => {
      setIsLoading(true);
      setTimeout(() => {
        const dummyData = [
          {
            id_artikel: 1,
            judul: "Tips Mendaki Aman untuk Pemula di Musim Hujan",
            tanggal_publikasi: "2025-06-02",
            kategori: "Tips & Trik",
            url_gambar_mini:
              "https://placehold.co/350x200/142640/FFFFFF?text=Tips+Mendaki",
          },
          {
            id_artikel: 2,
            judul: "Keindahan Tersembunyi Gunung Papandayan",
            tanggal_publikasi: "2025-05-28",
            kategori: "Destinasi",
            url_gambar_mini:
              "https://placehold.co/350x200/587391/FFFFFF?text=Papandayan",
          },
          {
            id_artikel: 3,
            judul: "Review Tenda XYZ: Ringan dan Tangguh",
            tanggal_publikasi: "2025-05-25",
            kategori: "Review",
            url_gambar_mini:
              "https://placehold.co/350x200/F58554/FFFFFF?text=Review",
          },
        ];
        setArtikel(dummyData);
        setIsLoading(false);
      }, 1200);
    };
    fetchDummyArtikel();
    // --- AKHIR SIMULASI ---
  }, []);

  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="artikel-section loading">Memuat artikel...</div>;
  }
  if (error) {
    return <div className="artikel-section error">Error: {error}</div>;
  }
  if (artikel.length === 0) {
    return null;
  }

  return (
    <section className="home-section artikel-terbaru-section">
      <div className="home-section-container">
        <h2 className="section-title">
          <i className="bi bi-journal-richtext"></i> Artikel & Tips Terbaru
        </h2>
        <div className="card-grid">
          {artikel.map((item) => (
            <Link
              to={`/artikel/${item.id_artikel}`}
              key={item.id_artikel}
              className="card-base artikel-card"
            >
              <div className="artikel-card-gambar-container">
                <img
                  src={item.url_gambar_mini}
                  alt={item.judul}
                  className="artikel-card-gambar"
                />
              </div>
              <div className="artikel-card-konten">
                <span className="artikel-card-kategori">{item.kategori}</span>
                <h3 className="artikel-card-judul">{item.judul}</h3>
                <div className="artikel-card-footer">
                  <span>{formatDisplayDate(item.tanggal_publikasi)}</span>
                  <span className="artikel-card-selengkapnya">Baca &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="section-cta-container">
          {/* REVISI: Menggunakan komponen Button untuk konsistensi */}
          <Button to="/artikel" variant="secondary">
            Lihat Semua Artikel
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ArtikelTerbaruSection;
