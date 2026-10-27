import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HalamanSemuaArtikel.css";
import sanitizeHtml from "../../../utils/sanitizeHtml";

function HalamanSemuaArtikel() {
  const [artikel, setArtikel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemuaArtikel = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/public/artikel`
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data artikel dari server.");
        }
        const data = await response.json();
        setArtikel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSemuaArtikel();
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
    if (isLoading)
      return (
        <div className="artikel-status-message">Memuat semua artikel...</div>
      );
    if (error)
      return <div className="artikel-status-message error">Error: {error}</div>;
    if (artikel.length === 0)
      return (
        <div className="artikel-status-message">
          Saat ini tidak ada artikel yang tersedia.
        </div>
      );

    return (
      <div className="artikel-list-container">
        {artikel.map((item) => (
          <div key={item.id_artikel} className="artikel-list-item">
            <div className="artikel-list-item-gambar-container">
              <Link to={`/artikel/${item.slug}`}>
                <img
                  src={
                    item.url_gambar_utama
                      ? `${process.env.REACT_APP_API_URL}${item.url_gambar_utama}`
                      : "https://placehold.co/400x300/2c3e50/ecf0f1?text=Mountify"
                  }
                  alt={item.judul}
                  className="artikel-list-item-gambar"
                />
              </Link>
            </div>
            <div className="artikel-list-item-konten">
              <span className="artikel-list-item-kategori">
                {item.kategori}
              </span>
              <h2 className="artikel-list-item-judul">
                <Link to={`/artikel/${item.slug}`}>{item.judul}</Link>
              </h2>
              <div
                className="artikel-list-item-ringkasan"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(item.ringkasan),
                }}
              />
              <div className="artikel-list-item-meta">
                <span>
                  <i className="bi bi-person-fill"></i> {item.penulis}
                </span>
                <span>
                  <i className="bi bi-calendar-event"></i>{" "}
                  {formatDisplayDate(item.tanggal_publikasi)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="artikel-page-container">
      <div className="page-header">
        <h1>
          <i className="bi bi-journal-text"></i> Artikel & Informasi
        </h1>
        <p className="page-subtitle">
          Jelajahi semua wawasan, tips, dan panduan mendaki dari para ahli kami.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}

export default HalamanSemuaArtikel;
