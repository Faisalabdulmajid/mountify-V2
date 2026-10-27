import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// Kita akan meminjam beberapa gaya dari artikel
import "./HalamanDetailPengumuman.css";

function HalamanDetailPengumuman() {
  const [pengumuman, setPengumuman] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id_pengumuman } = useParams();

  useEffect(() => {
    const fetchDetailPengumuman = async () => {
      setIsLoading(true);
      setError(null);
      try {
  const API_BASE_URL = "http://localhost:5000";
        const response = await fetch(
          `${API_BASE_URL}/api/public/pengumuman/${id_pengumuman}`
        );
        if (!response.ok) {
          throw new Error(
            "Pengumuman tidak ditemukan atau belum dipublikasikan."
          );
        }
        const data = await response.json();
        console.log(
          "Data detail pengumuman (full):",
          JSON.stringify(data, null, 2)
        ); // Debug: tampilkan seluruh isi object
        setPengumuman(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailPengumuman();
  }, [id_pengumuman]);

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
    if (isLoading) {
      return <div className="detail-status">Memuat konten...</div>;
    }
    if (error) {
      return <div className="detail-status error">{error}</div>;
    }
    if (!pengumuman) {
      return <div className="detail-status">Data tidak ditemukan.</div>;
    }

    // Mendapatkan tag dan ikon berdasarkan target pengumuman
    const getTagInfo = (target) => {
      if (!target || target.toLowerCase() === "umum") {
        return {
          className: "tag-umum",
          icon: "bi bi-info-circle-fill",
          label: "Umum",
        };
      }
      if (target.toLowerCase().includes("gunung")) {
        return {
          className: "tag-gunung",
          icon: "bi bi-image-alt",
          label: target,
        };
      }
      return {
        className: "tag-jalur",
        icon: "bi bi-signpost-split-fill",
        label: target,
      };
    };
    const tag = getTagInfo(pengumuman.target);

    return (
      <article className="content-container">
        <header className="content-header">
          <span className={`content-tag ${tag.className}`}>
            <i className={tag.icon}></i> {tag.label}
          </span>
          <h1 className="content-title">{pengumuman.judul}</h1>
          <div className="content-meta">
            <span className="meta-author">
              <i className="bi bi-person-fill"></i>
              Oleh {pengumuman.nama_penulis || "Admin"}
            </span>
            <span className="meta-date">
              <i className="bi bi-calendar-event"></i>
              {formatDisplayDate(pengumuman.tanggal_publikasi)}
            </span>
          </div>
        </header>

        {/* Jika ada gambar utama untuk pengumuman, bisa ditambahkan di sini */}
        {/* <img src={pengumuman.url_gambar_utama} alt={pengumuman.judul} className="content-featured-image" /> */}

        <div
          className="content-body"
          dangerouslySetInnerHTML={{
            __html: pengumuman.isi_pengumuman, // tanpa sanitizeHtml untuk tes
          }}
        />
      </article>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-top-nav">
          <Link to="/pengumuman" className="kembali-link">
            &larr; Kembali ke Arsip Pengumuman
          </Link>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default HalamanDetailPengumuman;
