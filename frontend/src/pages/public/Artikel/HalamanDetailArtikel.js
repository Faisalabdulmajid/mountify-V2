import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import sanitizeHtml from "../../../utils/sanitizeHtml";
// Gunakan CSS dari detail pengumuman untuk konsistensi, karena gayanya mirip
import "../Pengumuman/HalamanDetailPengumuman.css";

function HalamanDetailArtikel() {
  const [artikel, setArtikel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchDetailArtikel = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/public/artikel/${slug}`
        );
        if (!response.ok) {
          throw new Error("Artikel tidak ditemukan.");
        }
        const data = await response.json();
        setArtikel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailArtikel();
  }, [slug]);

  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderContent = () => {
    if (isLoading)
      return <div className="detail-status">Memuat artikel...</div>;
    if (error) return <div className="detail-status error">{error}</div>;
    if (!artikel)
      return <div className="detail-status">Data tidak ditemukan.</div>;

    return (
      <div className="pengumuman-detail-content">
        {" "}
        {/* Menggunakan className yang ada */}
        {artikel.url_gambar_utama && (
          <img
            src={`${process.env.REACT_APP_API_URL}${artikel.url_gambar_utama}`}
            alt={artikel.judul}
            className="detail-hero-image"
          />
        )}
        {/* Menggunakan div agar tidak ada error P di dalam P */}
        <div className="meta-info">
          <span className="meta-tag">{artikel.kategori}</span>
          <span className="separator">|</span>
          <span>
            <i className="bi bi-person-fill"></i> Oleh {artikel.penulis}
          </span>
          <span className="separator">|</span>
          <span>
            <i className="bi bi-calendar-event"></i>{" "}
            {formatDisplayDate(artikel.tanggal_publikasi)}
          </span>
        </div>
        <div
          className="isi-pengumuman"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(artikel.isi_artikel),
          }}
        />
        {artikel.tags && artikel.tags.length > 0 && (
          <div className="detail-tags-container">
            <strong>Tags:</strong>
            {artikel.tags.map((tag, index) => (
              <span key={index} className="detail-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="halaman-detail-section">
      <div className="container">
        <div className="detail-header">
          <Link to="/artikel" className="kembali-link">
            &larr; Kembali ke Semua Artikel
          </Link>
          <h1 className="detail-title">
            {artikel ? artikel.judul : "Memuat judul..."}
          </h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default HalamanDetailArtikel;
