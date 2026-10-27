import React from "react";
// REVISI: Impor komponen Button kita
import Button from "../common/Button/Button";
import "./FeaturesSection.css";
import "./HomePageSections.css";

function FeaturesSection() {
  return (
    <section className="home-section features-section">
      <div className="home-section-container">
        <h2 className="section-title">Fitur Unggulan Kami</h2>
        <p className="section-subtitle">
          Sistem Pendukung Keputusan (SPK) untuk membantu Anda menemukan gunung
          terbaik sesuai dengan kebutuhan dan preferensi Anda.
        </p>
        <div className="card-grid">
          {/* Kartu 1: Rekomendasi Cerdas */}
          <div className="card-base feature-card">
            {/* REVISI: Ikon menggunakan tag <i> dari Bootstrap Icons */}
            <div className="feature-icon-wrapper">
              <i className="bi bi-lightbulb-fill"></i>
            </div>
            <h3>Rekomendasi Cerdas</h3>
            <p>
              Rekomendasi berbasis AI yang mempertimbangkan lokasi, tingkat
              kesulitan, dan pengalaman Anda.
            </p>
            {/* REVISI: Tombol menggunakan komponen <Button /> */}
            <Button to="/explore" variant="secondary">
              Lihat Rekomendasi
            </Button>
          </div>

          {/* Kartu 2: Data Cuaca */}
          <div className="card-base feature-card">
            <div className="feature-icon-wrapper">
              <i className="bi bi-cloud-sun-fill"></i>
            </div>
            <h3>Data Cuaca Real-time</h3>
            <p>
              Dapatkan informasi cuaca terkini untuk membantu Anda merencanakan
              pendakian dengan lebih aman.
            </p>
            <Button to="/cuaca" variant="secondary">
              Lihat Data Cuaca
            </Button>
          </div>

          {/* Kartu 3: Informasi Lengkap */}
          <div className="card-base feature-card">
            <div className="feature-icon-wrapper">
              <i className="bi bi-journal-text"></i>
            </div>
            <h3>Informasi Lengkap</h3>
            <p>
              Akses informasi lengkap tentang jalur pendakian, fasilitas, dan
              tips penting untuk petualangan Anda.
            </p>
            <Button to="/artikel" variant="secondary">
              Lihat Informasi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
