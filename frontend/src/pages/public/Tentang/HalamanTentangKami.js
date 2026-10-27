import React from "react";
import { getImageUrl } from "../../../utils/getImageUrl";
import "./HalamanTentangKami.css"; // Kita akan perbarui CSS ini juga

function HalamanTentangKami() {
  // Ganti dengan path ke foto Anda atau gunakan placeholder
  const developerImage = getImageUrl("https://placehold.co/400x400/27ae60/FFFFFF?text=Faisal+A.M");

  return (
    <div className="tentang-page-container">
      <header className="tentang-header">
        <h1>Tentang Mountify</h1>
        <p className="subtitle">
          Menemukan Petualangan Terbaik Anda dengan Teknologi Cerdas
        </p>
      </header>

      <section className="tentang-section">
        <div className="section-icon">
          <i className="bi bi-flag-fill"></i>
        </div>
        <h2>Misi Kami</h2>
        <p>
          Misi utama Mountify adalah untuk merevolusi cara para pendaki
          merencanakan petualangan mereka. Kami percaya bahwa setiap pendaki,
          dari pemula hingga ahli, berhak mendapatkan rekomendasi jalur yang
          paling sesuai dengan preferensi, kemampuan, dan gaya mereka. Dengan
          memanfaatkan kekuatan kecerdasan buatan, kami bertujuan untuk
          menghilangkan keraguan dalam memilih destinasi dan memastikan setiap
          pendakian menjadi pengalaman yang aman dan tak terlupakan.
        </p>
      </section>

      <section className="tentang-section">
        <div className="section-icon">
          <i className="bi bi-stars"></i>
        </div>
        <h2>Kisah di Balik Proyek</h2>
        <p>
          Mountify lahir dari sebuah proyek penelitian akademis untuk skripsi di
          bidang Teknik Informatika. Proyek ini didasari oleh kecintaan pada
          alam dan teknologi, serta keinginan untuk menerapkan teori akademis ke
          dalam solusi dunia nyata. Fokus penelitian ini adalah pengembangan{" "}
          <strong>Sistem Pendukung Keputusan (SPK)</strong> yang menggunakan
          metode <strong>Logika Fuzzy</strong> untuk mengolah berbagai variabel
          pendakian yang seringkali bersifat subjektif—seperti "kesulitan" atau
          "keindahan"—menjadi data kuantitatif yang bisa menghasilkan
          rekomendasi akurat.
        </p>
      </section>

      <section className="tentang-section">
        <div className="section-icon">
          <i className="bi bi-code-slash"></i>
        </div>
        <h2>Teknologi yang Digunakan</h2>
        <p>
          Aplikasi ini dibangun dengan tumpukan teknologi modern untuk
          memastikan performa yang cepat, antarmuka yang responsif, dan
          skalabilitas di masa depan.
        </p>
        <div className="tech-stack">
          <span className="tech-tag">React.js</span>
          <span className="tech-tag">Node.js</span>
          <span className="tech-tag">Express.js</span>
          <span className="tech-tag">PostgreSQL</span>
          <span className="tech-tag">Logika Fuzzy</span>
          <span className="tech-tag">Dialogflow</span>
        </div>
      </section>

      <section className="tentang-section creator-section">
        <div className="section-icon">
          <i className="bi bi-person-circle"></i>
        </div>
        <h2>Sang Kreator</h2>
        <div className="creator-card">
          <div className="creator-avatar">
            <img src={developerImage} alt="Faisal Abdul Majid" />
          </div>
          <div className="creator-info">
            <h3>Faisal Abdul Majid</h3>
            <h4>
              Mahasiswa Teknik Informatika, Universitas Perjuangan Tasikmalaya
            </h4>
            <p>
              Seorang pengembang perangkat lunak yang antusias dengan fokus pada
              pengembangan web dan kecerdasan buatan. Proyek Mountify adalah
              perwujudan dari semangatnya untuk menggabungkan tantangan teknis
              dengan hasrat untuk petualangan di alam bebas.
            </p>
            <div className="creator-socials">
              <a
                href="https://github.com/FaisalAbdulMajid"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <i className="bi bi-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/faisal-abdul-majid/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HalamanTentangKami;
