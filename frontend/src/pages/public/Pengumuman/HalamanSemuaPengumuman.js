import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import sanitizeHtml from "../../../utils/sanitizeHtml";

// Menambahkan CSS khusus untuk halaman ini
import "./HalamanSemuaPengumuman.css";

// Helper function untuk menentukan style & ikon tag
const getTagInfo = (target) => {
  if (!target || target.toLowerCase() === "umum") {
    return { className: "tag-umum", icon: "bi bi-info-circle-fill" };
  }
  if (target.toLowerCase().includes("gunung")) {
    return { className: "tag-gunung", icon: "bi bi-image-alt" }; // Menggunakan ikon gunung dari Bootstrap Icons
  }
  return { className: "tag-jalur", icon: "bi bi-signpost-split-fill" };
};

function HalamanSemuaPengumuman() {
  const [pengumuman, setPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemuaPengumuman = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;
        const response = await fetch(
          `${API_BASE_URL}/api/public/pengumuman`
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data pengumuman dari server.");
        }
        const data = await response.json();
        setPengumuman(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSemuaPengumuman();
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

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-message">Memuat pengumuman...</div>;
    }
    if (error) {
      return <div className="error-message">Error: {error}</div>;
    }
    if (pengumuman.length === 0) {
      return (
        <div className="no-data-message">Saat ini tidak ada pengumuman.</div>
      );
    }

    return (
      <div className="arsip-container">
        {pengumuman.map((item) => {
          const tag = getTagInfo(item.target);
          return (
            <div key={item.id_pengumuman} className="arsip-card">
              <div className="card-header">
                <span className={`card-tag ${tag.className}`}>
                  <i className={tag.icon}></i> {item.target || "Umum"}
                </span>
              </div>
              <div className="card-body">
                <h2 className="card-title">
                  <Link to={`/pengumuman/${item.id_pengumuman}`}>
                    {item.judul}
                  </Link>
                </h2>
                <div className="card-meta">
                  <i className="bi bi-calendar-event"></i>
                  <span>
                    Dipublikasikan pada{" "}
                    {formatDisplayDate(item.tanggal_publikasi)}
                  </span>
                </div>

                {/* === PERUBAHAN UTAMA ADA DI SINI === */}
                <div
                  className="card-summary"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(item.ringkasan),
                  }}
                />
                {/* ===================================== */}
              </div>
              <div className="card-footer">
                <Link
                  to={`/pengumuman/${item.id_pengumuman}`}
                  className="selengkapnya-button"
                >
                  Baca Selengkapnya
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="halaman-arsip-section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-megaphone-fill"></i> Arsip Pengumuman
          </h1>
          <p className="page-description">
            Temukan semua informasi dan pengumuman penting dari kami yang telah
            dipublikasikan.
          </p>
        </div>
        {renderContent()}
      </div>
    </section>
  );
}

export default HalamanSemuaPengumuman;
