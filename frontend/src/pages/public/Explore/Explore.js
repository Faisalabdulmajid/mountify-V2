// src/pages/public/Explore/Explore.js

/*
============================================
MOUNTIFY - HALAMAN EXPLORE
Cara Penggunaan & Info Kriteria Rekomendasi
============================================

Fitur Utama:
- Temukan rekomendasi gunung atau jalur pendakian berdasarkan preferensi Anda.
- Tersedia mode input slider (kontrol) dan dropdown (pilihan deskriptif).
- Fitur pencarian cepat (quick search) dan asisten virtual (chatbot).

Cara Penggunaan:
1. Pilih mode pencarian: "jalur" (jalur pendakian) atau "gunung" (rekomendasi gunung terbaik).
2. Atur preferensi menggunakan slider atau dropdown (klik "Mode Input").
   - Slider: geser untuk memilih nilai numerik.
   - Dropdown: pilih deskripsi kualitas/kriteria.
3. Isi filter sesuai kebutuhan, misal: tingkat kesulitan maksimal, keamanan minimal, estimasi waktu, ketinggian, kualitas fasilitas, air, variasi lanskap, perlindungan angin, jaringan komunikasi, tingkat insiden, dsb.
4. Klik "Cari Rekomendasi" untuk menampilkan hasil.
5. Gunakan pencarian cepat (quick search) untuk mencari nama gunung/jalur secara langsung.
6. Untuk bantuan interaktif, klik ikon chatbot dan ajukan pertanyaan secara natural.

Info Kriteria & Skala Filter:
- max_kesulitan_skala: 1 (sangat mudah) s/d 10 (ekstrem)
- min_keamanan_skala: 1 (sangat berisiko) s/d 10 (maksimal aman)
- max_estimasi_waktu_jam: estimasi waktu tempuh (jam)
- max_ketinggian_mdpl: ketinggian puncak (meter)
- min_kualitas_fasilitas_skala: 1 (sangat minim) s/d 10 (mewah)
- min_kualitas_kemah_skala: 1 (sangat terbatas) s/d 10 (eksklusif)
- min_keindahan_pemandangan_skala: 1 (kurang menarik) s/d 10 (luar biasa)
- min_ketersediaan_air: 1 (sangat langka) s/d 10 (berlimpah ruah)
- min_variasi_lanskap: 1 (sangat monoton) s/d 10 (luar biasa beragam)
- min_perlindungan_angin: 1 (sangat terekspos) s/d 10 (ideal terlindungi)
- min_jaringan_komunikasi: 1 (tidak ada sinyal) s/d 10 (sinyal optimal)
- min_tingkat_keamanan_insiden: 1 (insiden sangat sering) s/d 10 (maksimal aman)

Semakin tinggi nilai minimum pada filter, semakin ketat hasil rekomendasi.
Setiap kriteria dapat diatur sesuai kebutuhan pendaki (pemula, menengah, ahli).

Untuk info detail skala, lihat tooltip atau label pada masing-masing filter di UI.
*/

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../../utils/getImageUrl";
import "./Explore_Simple.css";

// --- Constants ---
const API_BASE_URL = "http://localhost:5000";
const DEFAULT_FALLBACK_IMAGE =
  "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify";

const INITIAL_PREFERENCES = {
  id_gunung: "",
  max_kesulitan_skala: 7,
  min_keamanan_skala: 6,
  max_estimasi_waktu_jam: 48,
  max_ketinggian_mdpl: 5000,
  min_kualitas_fasilitas_skala: 5,
  min_kualitas_kemah_skala: 5,
  min_keindahan_pemandangan_skala: 6,
  min_ketersediaan_air: 5,
  min_variasi_lanskap: 5,
  min_perlindungan_angin: 5,
  min_jaringan_komunikasi: 3,
  min_tingkat_keamanan_insiden: 5,
  ketinggian: "semua",
  lokasi: "semua",
  inputType: "slider",
  quickSearch: "",
  user_lat: null,
  user_lng: null,
  user_location_name: "",
  max_budget: "",
};

// Helper untuk filter hasil berdasarkan budget

// Helper untuk filter hasil berdasarkan budget
const filterByBudget = (results, maxBudget) => {
  if (!maxBudget || isNaN(maxBudget) || Number(maxBudget) <= 0) return results;
  return results.filter((item) => {
    const biaya =
      item.estimasi_biaya_total || item.estimasi_biaya || item.biaya_total;
    return biaya && Number(biaya) <= Number(maxBudget);
  });
};

// --- Utility Functions ---
const createImageSrc = (thumbnail) =>
  getImageUrl(thumbnail, DEFAULT_FALLBACK_IMAGE);

const scrollToElement = (ref, delay = 100) => {
  setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), delay);
};

// Scale description utilities based on National & International Standards

// Difficulty scaling based on Indonesian Grade 1-5 & YDS standards
const getDifficultyDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Mudah (1)";
    case 2:
      return "Sangat Mudah+ (2)";
    case 3:
      return "Mudah (3)";
    case 4:
      return "Mudah+ (4)";
    case 5:
      return "Sedang (5)";
    case 6:
      return "Sedang+ (6)";
    case 7:
      return "Sulit (7)";
    case 8:
      return "Sulit+ (8)";
    case 9:
      return "Sangat Sulit (9)";
    case 10:
      return "Ekstrem (10)";
    default:
      return `Level ${v}`;
  }
};

// Safety scaling based on BASARNAS incident data standards
const getSafetyDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Berisiko (1)";
    case 2:
      return "Berisiko Tinggi (2)";
    case 3:
      return "Berisiko Sedang (3)";
    case 4:
      return "Berisiko Rendah (4)";
    case 5:
      return "Cukup Aman (5)";
    case 6:
      return "Aman (6)";
    case 7:
      return "Aman+ (7)";
    case 8:
      return "Sangat Aman (8)";
    case 9:
      return "Sangat Aman+ (9)";
    case 10:
      return "Maksimal Aman (10)";
    default:
      return `Level ${v}`;
  }
};

// Facility quality based on Indonesian mountain basecamp standards
const getFacilityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Minim (1)";
    case 2:
      return "Minim (2)";
    case 3:
      return "Terbatas (3)";
    case 4:
      return "Cukup (4)";
    case 5:
      return "Standar (5)";
    case 6:
      return "Baik (6)";
    case 7:
      return "Lengkap (7)";
    case 8:
      return "Sangat Lengkap (8)";
    case 9:
      return "Premium (9)";
    case 10:
      return "Mewah (10)";
    default:
      return `Level ${v}`;
  }
};

// Camp quality based on Indonesian camping area standards
const getCampQualityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Terbatas (1)";
    case 2:
      return "Terbatas (2)";
    case 3:
      return "Kurang Nyaman (3)";
    case 4:
      return "Cukup Nyaman (4)";
    case 5:
      return "Nyaman (5)";
    case 6:
      return "Baik (6)";
    case 7:
      return "Sangat Baik (7)";
    case 8:
      return "Istimewa (8)";
    case 9:
      return "Premium (9)";
    case 10:
      return "Ekslusif (10)";
    default:
      return `Level ${v}`;
  }
};

// Scenery quality based on visual assessment standards
const getSceneryDescription = (v) => {
  switch (v) {
    case 1:
      return "Kurang Menarik (1)";
    case 2:
      return "Biasa Saja (2)";
    case 3:
      return "Cukup Menarik (3)";
    case 4:
      return "Menarik (4)";
    case 5:
      return "Indah (5)";
    case 6:
      return "Sangat Indah (6)";
    case 7:
      return "Menakjubkan (7)";
    case 8:
      return "Spektakuler (8)";
    case 9:
      return "Istimewa (9)";
    case 10:
      return "Luar Biasa (10)";
    default:
      return `Level ${v}`;
  }
};

// Water availability based on logistic management standards
const getWaterAvailabilityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Langka (1)";
    case 2:
      return "Langka (2)";
    case 3:
      return "Terbatas (3)";
    case 4:
      return "Kurang (4)";
    case 5:
      return "Cukup (5)";
    case 6:
      return "Tersedia (6)";
    case 7:
      return "Banyak (7)";
    case 8:
      return "Melimpah (8)";
    case 9:
      return "Sangat Melimpah (9)";
    case 10:
      return "Berlimpah Ruah (10)";
    default:
      return `Level ${v}`;
  }
};

// Landscape variation based on ecosystem diversity
const getLandscapeVariationDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Monoton (1)";
    case 2:
      return "Monoton (2)";
    case 3:
      return "Kurang Bervariasi (3)";
    case 4:
      return "Cukup Bervariasi (4)";
    case 5:
      return "Bervariasi (5)";
    case 6:
      return "Sangat Bervariasi (6)";
    case 7:
      return "Beragam (7)";
    case 8:
      return "Sangat Beragam (8)";
    case 9:
      return "Spektakuler (9)";
    case 10:
      return "Luar Biasa Beragam (10)";
    default:
      return `Level ${v}`;
  }
};

// Wind protection based on camping comfort standards
const getWindProtectionDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Terekspos (1)";
    case 2:
      return "Terekspos (2)";
    case 3:
      return "Kurang Terlindungi (3)";
    case 4:
      return "Cukup Terlindungi (4)";
    case 5:
      return "Terlindungi (5)";
    case 6:
      return "Baik Terlindungi (6)";
    case 7:
      return "Sangat Terlindungi (7)";
    case 8:
      return "Maksimal Terlindungi (8)";
    case 9:
      return "Sempurna Terlindungi (9)";
    case 10:
      return "Ideal Terlindungi (10)";
    default:
      return `Level ${v}`;
  }
};

// Communication network based on cellular coverage
const getCommunicationDescription = (v) => {
  switch (v) {
    case 1:
      return "Tidak Ada Sinyal (1)";
    case 2:
      return "Sinyal Sangat Lemah (2)";
    case 3:
      return "Sinyal Lemah (3)";
    case 4:
      return "Sinyal Terbatas (4)";
    case 5:
      return "Sinyal Cukup (5)";
    case 6:
      return "Sinyal Baik (6)";
    case 7:
      return "Sinyal Sangat Baik (7)";
    case 8:
      return "Sinyal Kuat (8)";
    case 9:
      return "Sinyal Sangat Kuat (9)";
    case 10:
      return "Sinyal Optimal (10)";
    default:
      return `Level ${v}`;
  }
};

// Incident safety level (higher score = safer/fewer incidents)
const getIncidentSafetyDescription = (v) => {
  switch (v) {
    case 1:
      return "Insiden Sangat Sering (1)";
    case 2:
      return "Insiden Sering (2)";
    case 3:
      return "Insiden Cukup Sering (3)";
    case 4:
      return "Insiden Kadang (4)";
    case 5:
      return "Insiden Sedang (5)";
    case 6:
      return "Insiden Jarang (6)";
    case 7:
      return "Insiden Sangat Jarang (7)";
    case 8:
      return "Sangat Aman (8)";
    case 9:
      return "Amat Sangat Aman (9)";
    case 10:
      return "Maksimal Aman (10)";
    default:
      return `Level ${v}`;
  }
};

// Altitude description for max_ketinggian_mdpl
const getAltitudeDescription = (v) => {
  if (v <= 1500) return "Bukit/Pegunungan Rendah";
  if (v <= 2500) return "Gunung Sedang";
  if (v <= 3500) return "Gunung Tinggi";
  if (v <= 4500) return "Gunung Sangat Tinggi";
  return "Puncak Ekstrem";
};

const getDifficultyClass = (difficulty) => {
  if (!difficulty) return "difficulty-default";
  if (difficulty <= 4) return "difficulty-pemula";
  if (difficulty <= 7) return "difficulty-menengah";
  return "difficulty-ahli";
};

const getDifficultyText = (difficulty) => {
  if (!difficulty) return "N/A";
  if (difficulty <= 4) return "Pemula";
  if (difficulty <= 7) return "Menengah";
  return "Ahli";
};

// --- Card Components ---
const CardImage = ({ src, alt, onError }) => (
  <img src={src} alt={alt} className="card-image" onError={onError} />
);

const DifficultyBadge = ({ difficulty }) => {
  if (!difficulty) return null;

  return (
    <span className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
      {getDifficultyText(difficulty)}
    </span>
  );
};

const ScoreBadge = ({ score, category, label = "SKOR TERBAIK" }) => {
  if (!score) return null;

  const getScoreClass = (score) => {
    if (score >= 80) return "score-excellent";
    if (score >= 65) return "score-good";
    if (score >= 50) return "score-fair";
    if (score >= 35) return "score-poor";
    return "score-bad";
  };

  return (
    <div className="score-badge-container">
      <span className={`score-badge ${getScoreClass(score)}`}>
        {label}: {score.toFixed(1)}
      </span>
      {category && <span className="category-badge">{category}</span>}
    </div>
  );
};

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = "https://placehold.co/600x400/2c3e50/FFFFFF?text=Error";
};

function TrailCard({ trail, index }) {
  // Identitas jalur dan gunung
  const namaJalur =
    trail.nama_jalur ||
    trail.nama ||
    trail.namaJalur ||
    trail.nama_jalur_pendakian;
  const namaGunung = trail.nama_gunung || trail.gunung || trail.namaGunung;
  const idJalur = trail.id_jalur || trail.id || trail.idJalur;

  // Informasi jalur
  const ketinggian =
    trail.ketinggian_puncak_mdpl || trail.ketinggian || trail.ketinggian_mdpl;
  const estimasiWaktu =
    trail.estimasi_waktu_jam || trail.durasi || trail.estimasiWaktu;
  // Field detail dihapus, hanya field utama yang digunakan

  // Biaya & jarak
  const biayaSimaksi = trail.biaya_simaksi;
  const biayaPP = trail.biaya_pulang_pergi || trail.biaya_pp;
  const estimasiBiayaTotal = trail.estimasi_biaya_total;
  const jarakKeBasecamp = trail.jarak_ke_basecamp;

  return (
    <div
      className="result-card animate-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardImage
        src={createImageSrc(trail.url_thumbnail)}
        alt={namaJalur}
        onError={handleImageError}
      />
      <div className="card-content">
        <div className="badge-container">
          <DifficultyBadge difficulty={trail.kesulitan_skala} />
          <ScoreBadge
            score={trail.skor_rekomendasi}
            category={trail.kategori_rekomendasi}
          />
        </div>

        <h3 className="card-title">{namaJalur}</h3>
        {namaGunung && <p className="card-subtitle">{namaGunung}</p>}

        {ketinggian && (
          <p className="card-info">
            ⛰️ {Number(ketinggian).toLocaleString()} mdpl
          </p>
        )}

        {estimasiWaktu && (
          <p className="card-info">⏱️ Estimasi waktu: {estimasiWaktu} jam</p>
        )}

        {/* Hanya field utama, detail lain disembunyikan agar sesuai hasil rekomendasi */}

        {typeof jarakKeBasecamp === "number" && (
          <p className="card-info">
            📍 Jarak: {jarakKeBasecamp.toFixed(1)} km dari lokasi Anda
          </p>
        )}

        <div
          className="card-info"
          style={{
            fontSize: "13px",
            color: "#218c3a",
            background: "#eafbea",
            borderRadius: 8,
            padding: "6px 10px",
            margin: "8px 0",
            fontWeight: 600,
          }}
        >
          <span role="img" aria-label="biaya">
            💰
          </span>{" "}
          Estimasi biaya:
          <span style={{ marginLeft: 8, display: "block" }}>
            PP:{" "}
            {(() => {
              const pp = trail.biaya_pulang_pergi || trail.biaya_pp;
              const ppIndicator = trail.auto_calculated_pp ? " (otomatis)" : "";
              return pp != null && pp !== undefined
                ? `Rp ${Number(pp).toLocaleString()}${ppIndicator}`
                : "-";
            })()}
            <br />
            Simaksi:{" "}
            {(() => {
              return biayaSimaksi != null && biayaSimaksi !== undefined
                ? `Rp ${Number(biayaSimaksi).toLocaleString()}`
                : "-";
            })()}
            <br />
            <b>
              Total:{" "}
              {(() => {
                // Gunakan estimasi_biaya_total jika ada, atau hitung simaksi + pp
                if (
                  estimasiBiayaTotal != null &&
                  estimasiBiayaTotal !== undefined
                ) {
                  return `Rp ${Number(estimasiBiayaTotal).toLocaleString()}`;
                }
                const simaksi = biayaSimaksi != null ? Number(biayaSimaksi) : 0;
                const pp = biayaPP != null ? Number(biayaPP) : 0;
                const total = simaksi + pp;
                return total >= 0 ? `Rp ${total.toLocaleString()}` : "-";
              })()}
            </b>
          </span>
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontStyle: "italic",
            marginTop: "4px",
            marginBottom: "8px",
          }}
        >
          ⚠️ Belum termasuk logistik (konsumsi & peralatan)
        </div>

        <Link to={`/jalur/${idJalur}`} className="details-button">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

function MountainCard({ mountain, index }) {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/2c3e50/FFFFFF?text=Error";
  };

  // Fallbacks untuk field yang mungkin berbeda nama
  const namaGunung =
    mountain.nama_gunung || mountain.nama || mountain.namaGunung;
  const idGunung = mountain.id_gunung || mountain.id || mountain.idGunung;
  const lokasi =
    mountain.lokasi_administratif || mountain.lokasi || mountain.lokasiGunung;
  const ketinggian =
    mountain.ketinggian ||
    mountain.ketinggian_puncak_mdpl ||
    mountain.ketinggian_mdpl;
  const jalurTerbaik = mountain.jalur_terbaik || mountain.jalurTerbaik;
  const jumlahJalur = mountain.jumlah_jalur || mountain.jumlahJalur;
  const skorTertinggi =
    mountain.skor_tertinggi || mountain.skor || mountain.skorTertinggi;
  const jarakKeBasecamp = mountain.jarak_ke_basecamp;

  // Estimasi biaya (ambil dari field yang tersedia)
  const estimasiBiaya =
    mountain.estimasi_biaya_total ||
    mountain.estimasi_biaya ||
    mountain.biaya_total ||
    mountain.biaya_simaksi;

  return (
    <div
      className="result-card animate-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardImage
        src={createImageSrc(mountain.url_thumbnail)}
        alt={namaGunung}
        onError={handleImageError}
      />
      <div className="card-content">
        <div className="badge-container">
          <ScoreBadge
            score={skorTertinggi}
            category={mountain.kategori_rekomendasi}
          />
        </div>

        <h3 className="card-title">{namaGunung}</h3>
        <p className="card-subtitle">{lokasi}</p>

        {jalurTerbaik && (
          <p className="card-info">🥾 Jalur Terbaik: {jalurTerbaik}</p>
        )}

        {typeof jumlahJalur !== "undefined" && (
          <p className="card-info">📍 {jumlahJalur} jalur tersedia</p>
        )}

        {ketinggian && (
          <p className="card-info">⛰️ {ketinggian.toLocaleString()} mdpl</p>
        )}

        {typeof jarakKeBasecamp === "number" && (
          <p className="card-info">
            📍 Jarak: {jarakKeBasecamp.toFixed(1)} km dari lokasi Anda
          </p>
        )}

        <div
          className="card-info"
          style={{
            background: "#eafbea",
            borderRadius: 8,
            padding: "6px 10px",
            fontWeight: 600,
            color: "#218c3a",
            margin: "8px 0",
          }}
        >
          <span role="img" aria-label="biaya">
            💰
          </span>{" "}
          Estimasi biaya:
          <span
            style={{
              marginLeft: 6,
              color: "#145c25",
              fontWeight: 700,
              display: "block",
            }}
          >
            PP:{" "}
            {(() => {
              const pp = mountain.biaya_pulang_pergi || mountain.biaya_pp;
              return pp != null && pp !== undefined
                ? `Rp ${Number(pp).toLocaleString()}`
                : "-";
            })()}
            <br />
            Simaksi:{" "}
            {(() => {
              const simaksi = mountain.biaya_simaksi;
              return simaksi != null && simaksi !== undefined
                ? `Rp ${Number(simaksi).toLocaleString()}`
                : "-";
            })()}
            <br />
            Total:{" "}
            {(() => {
              // Gunakan estimasi_biaya_total jika ada, atau hitung simaksi + pp
              if (
                mountain.estimasi_biaya_total != null &&
                mountain.estimasi_biaya_total !== undefined
              ) {
                return `Rp ${Number(
                  mountain.estimasi_biaya_total
                ).toLocaleString()}`;
              }
              const simaksi =
                mountain.biaya_simaksi != null
                  ? Number(mountain.biaya_simaksi)
                  : 0;
              const pp =
                mountain.biaya_pulang_pergi != null
                  ? Number(mountain.biaya_pulang_pergi)
                  : mountain.biaya_pp != null
                  ? Number(mountain.biaya_pp)
                  : 0;
              const total = simaksi + pp;
              return total >= 0 ? `Rp ${total.toLocaleString()}` : "-";
            })()}
          </span>
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontStyle: "italic",
            marginTop: "4px",
            marginBottom: "8px",
          }}
        >
          ⚠️ Belum termasuk logistik (konsumsi & peralatan)
        </div>

        <Link
          to={`/gunung/${idGunung}`}
          className="details-button"
          state={{
            rekomendasi: {
              id_gunung: idGunung,
              nama_gunung: namaGunung,
              lokasi,
              ketinggian,
              jalur_terbaik: jalurTerbaik,
              jumlah_jalur: jumlahJalur,
              skor_tertinggi: skorTertinggi,
              kategori_rekomendasi: mountain.kategori_rekomendasi,
              estimasi_biaya_total: estimasiBiaya,
              jarak_ke_basecamp: jarakKeBasecamp,
              url_thumbnail: mountain.url_thumbnail,
            },
          }}
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

// Generate unique dropdown options for scale inputs
const generateUniqueScaleOptions = (min = 1, max = 10, getDescription) => {
  const uniqueOptions = new Map();

  // Collect all unique descriptions with their representative values
  for (let i = min; i <= max; i++) {
    const description = getDescription(i);
    // Always use the exact value as key to ensure uniqueness
    const key = `${description}_${i}`;
    if (!uniqueOptions.has(key)) {
      uniqueOptions.set(key, {
        value: i,
        label: description,
        originalValue: i,
      });
    }
  }

  // Convert to array format, sorted by original value
  return Array.from(uniqueOptions.values())
    .sort((a, b) => a.originalValue - b.originalValue)
    .map((item) => ({
      value: item.value,
      label: item.label,
    }));
};

// Generate time duration options
const generateTimeOptions = () => {
  const options = [
    { value: 6, label: "6 jam" },
    { value: 12, label: "12 jam" },
    { value: 18, label: "18 jam" },
    { value: 24, label: "1 hari" },
    { value: 36, label: "1.5 hari" },
    { value: 48, label: "2 hari" },
    { value: 72, label: "3 hari" },
    { value: 96, label: "4 hari" },
    { value: 120, label: "5 hari" },
    { value: 144, label: "6 hari" },
    { value: 168, label: "1 minggu" },
  ];
  return options;
};

// Scale Input Component - renders either slider or dropdown
const ScaleInput = ({
  id,
  name,
  value,
  onChange,
  min = 1,
  max = 10,
  inputType,
  getDescription,
  rangeLabels = { min: "Rendah", max: "Tinggi" },
}) => {
  if (inputType === "dropdown") {
    const options = generateUniqueScaleOptions(min, max, getDescription);
    return (
      <select
        id={id}
        name={name}
        className="scale-dropdown"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Default to slider
  return (
    <>
      <input
        type="range"
        id={id}
        name={name}
        className="range-input"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step="1"
      />
      <div className="range-labels">
        <span>{rangeLabels.min}</span>
        <span>{rangeLabels.max}</span>
      </div>
    </>
  );
};

// Time Input Component - renders either number input or dropdown
const TimeInput = ({ id, name, value, onChange, inputType }) => {
  if (inputType === "dropdown") {
    const options = generateTimeOptions();
    return (
      <select
        id={id}
        name={name}
        className="time-dropdown"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Default to number input
  return (
    <div className="time-input-container">
      <input
        type="number"
        id={id}
        name={name}
        className="number-input"
        value={value}
        onChange={onChange}
        min="1"
        max="168"
      />
      <span className="unit">Jam</span>
    </div>
  );
};

// Input Type Switcher Component
const InputTypeSwitcher = ({ inputType, onInputTypeChange }) => (
  <div className="input-type-switcher">
    <span className="switcher-label">Mode Input:</span>
    <div className="switcher-buttons">
      <button
        type="button"
        className={`switcher-button ${inputType === "slider" ? "active" : ""}`}
        onClick={() => onInputTypeChange("slider")}
      >
        Kontrol
      </button>
      <button
        type="button"
        className={`switcher-button ${
          inputType === "dropdown" ? "active" : ""
        }`}
        onClick={() => onInputTypeChange("dropdown")}
      >
        Pilihan
      </button>
    </div>
  </div>
);

// --- API Functions ---
const fetchMountainsList = async () => {
  try {
    console.log(
      "🏔️ Fetching mountains list from:",
      `${API_BASE_URL}/api/gunung`
    );
    const response = await fetch(`${API_BASE_URL}/api/gunung`);
    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}: Gagal memuat daftar gunung`
      );
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "Server mengembalikan response bukan JSON untuk daftar gunung"
      );
    }
    const data = await response.json();
    console.log("✅ Mountains list received:", data.length, "items");
    return data;
  } catch (error) {
    console.error("❌ fetchMountainsList error:", error);
    if (error.message.includes("fetch")) {
      throw new Error(
        "Tidak dapat terhubung ke server untuk memuat daftar gunung"
      );
    }
    throw error;
  }
};

const fetchRecommendations = async (preferences, searchMode, filters = {}) => {
  const endpoint =
    searchMode === "jalur"
      ? `${API_BASE_URL}/api/rekomendasi/jalur`
      : `${API_BASE_URL}/api/rekomendasi/gunung`;

  // Map frontend preferences to backend parameters
  const backendPreferences = {
    max_kesulitan_skala: preferences.max_kesulitan_skala,
    min_keamanan_skala: preferences.min_keamanan_skala,
    max_estimasi_waktu_jam: preferences.max_estimasi_waktu_jam,
    max_ketinggian_mdpl: preferences.max_ketinggian_mdpl,
    min_keindahan_pemandangan_skala:
      preferences.min_keindahan_pemandangan_skala,
    min_ketersediaan_air: preferences.min_ketersediaan_air,
    min_kualitas_fasilitas_skala: preferences.min_kualitas_fasilitas_skala,
    min_kualitas_kemah_skala: preferences.min_kualitas_kemah_skala,
    min_variasi_lanskap: preferences.min_variasi_lanskap,
    min_perlindungan_angin: preferences.min_perlindungan_angin,
    min_jaringan_komunikasi: preferences.min_jaringan_komunikasi,
    min_tingkat_keamanan_insiden: preferences.min_tingkat_keamanan_insiden,
    id_gunung: preferences.id_gunung || undefined,
    search_term: preferences.quickSearch || undefined,
    user_lat: preferences.user_lat || undefined,
    user_lng: preferences.user_lng || undefined,
    // Add filter parameters
    sort_by_distance: filters.sortByDistance || undefined,
    sort_by_score: filters.sortByScore || undefined,
    sort_by_cost: filters.sortByCost || undefined,
  };

  // Remove undefined values
  Object.keys(backendPreferences).forEach((key) => {
    if (
      backendPreferences[key] === undefined ||
      backendPreferences[key] === ""
    ) {
      delete backendPreferences[key];
    }
  });

  try {
    console.log("🔍 Fetching recommendations from:", endpoint);
    console.log("📝 Request data:", backendPreferences);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(backendPreferences),
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response URL:", response.url);

    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP Error ${response.status}`;

      try {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("❌ HTML Error Response:", errorText.substring(0, 200));

          // Check if it's a 404 or server error
          if (response.status === 404) {
            errorMessage = `Endpoint tidak ditemukan: ${endpoint}. Pastikan backend sudah berjalan.`;
          } else if (response.status >= 500) {
            errorMessage = `Server error (${response.status}). Cek console backend untuk detail.`;
          } else {
            errorMessage = `Request gagal (${response.status}). Response bukan JSON.`;
          }
        }
      } catch (parseError) {
        console.error("❌ Error parsing response:", parseError);
        errorMessage = `Request gagal (${response.status}). Cannot parse response.`;
      }

      throw new Error(errorMessage);
    }

    // Validate content type before parsing JSON
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error(
        "❌ Unexpected response type:",
        responseText.substring(0, 200)
      );
      throw new Error(
        `Server mengembalikan HTML bukan JSON. Pastikan endpoint backend benar: ${endpoint}`
      );
    }

    const data = await response.json();
    console.log("✅ Recommendations received:", data);
    return data;
  } catch (error) {
    console.error("❌ fetchRecommendations error:", error);
    throw error;
  }
};

const fetchAllData = async (searchMode) => {
  const endpoint =
    searchMode === "jalur"
      ? `${API_BASE_URL}/api/jalur`
      : `${API_BASE_URL}/api/gunung`;

  try {
    console.log("📊 Fetching all data from:", endpoint);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}: Gagal memuat daftar ${searchMode}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Server mengembalikan response bukan JSON untuk daftar ${searchMode}`
      );
    }

    const data = await response.json();
    console.log(
      `✅ All ${searchMode} data received:`,
      Array.isArray(data) ? data.length : "object",
      "items"
    );
    return data;
  } catch (error) {
    console.error("❌ fetchAllData error:", error);
    if (error.message.includes("fetch")) {
      throw new Error(
        `Tidak dapat terhubung ke server untuk memuat daftar ${searchMode}`
      );
    }
    throw error;
  }
};

// --- Loading and Error Components ---
const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    ></circle>
  </svg>
);

const NoResultsIllustration = () => (
  <svg
    className="no-results-illustration"
    width="120"
    height="120"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.5 17.5L22 22"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 11C20 15.9706 15.9706 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11Z"
      stroke="#bdc3c7"
      strokeWidth="2"
    />
    <path
      d="M13.2963 8.70371C12.9361 8.34351 12.4335 8.14844 11.9082 8.14844C11.3829 8.14844 10.8803 8.34351 10.5201 8.70371C10.1599 9.06391 9.96484 9.56651 9.96484 10.0918"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10.5 15.5C10.5 15.5 11.25 14.5 12 14.5C12.75 14.5 13.5 15.5 13.5 15.5"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// --- Error Display Component ---
const ErrorDisplay = ({ error, onRetry, context = "operasi" }) => {
  const getErrorIcon = () => {
    if (error.includes("terhubung") || error.includes("fetch")) {
      return "🔌"; // Connection error
    } else if (error.includes("404") || error.includes("tidak ditemukan")) {
      return "🔍"; // Not found
    } else if (error.includes("500") || error.includes("server error")) {
      return "⚠️"; // Server error
    } else if (error.includes("JSON") || error.includes("HTML")) {
      return "📄"; // Format error
    }
    return "❌"; // Generic error
  };

  const getErrorHelp = () => {
    if (error.includes("terhubung") || error.includes("fetch")) {
      return "Pastikan backend server sudah berjalan di Railway dan .env sudah benar";
    } else if (error.includes("404") || error.includes("tidak ditemukan")) {
      return "Endpoint API mungkin belum tersedia atau URL salah";
    } else if (error.includes("500") || error.includes("server error")) {
      return "Cek console backend untuk error detail";
    } else if (error.includes("JSON") || error.includes("HTML")) {
      return "Server mengembalikan format response yang tidak sesuai";
    }
    return "Coba refresh halaman atau hubungi administrator";
  };

  return (
    <div className="error-display">
      <div className="error-icon">{getErrorIcon()}</div>
      <h3>Gagal memuat {context}</h3>
      <p className="error-message">{error}</p>
      <p className="error-help">{getErrorHelp()}</p>
      {onRetry && (
        <button
          className="retry-button"
          onClick={onRetry}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          🔄 Coba Lagi
        </button>
      )}
    </div>
  );
};

// --- Debug Helper ---
const debugAPIConnection = async () => {
  console.log("🔧 Debug: Testing API Connection...");

  // Test basic server connection
  try {
    const response = await fetch(process.env.REACT_APP_API_URL);
    console.log("✅ Server responds:", response.status);
  } catch (error) {
    console.error("❌ Server not reachable:", error.message);
    return false;
  }

  // Test API endpoints
  const endpoints = [
    "/api/gunung",
    "/api/jalur",
    "/api/rekomendasi-jalur",
    "/api/rekomendasi-gunung",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {
          method: endpoint.includes("rekomendasi") ? "POST" : "GET",
          headers: { "Content-Type": "application/json" },
          body: endpoint.includes("rekomendasi")
            ? JSON.stringify({
                max_kesulitan_skala: 5,
                min_keamanan_skala: 5,
              })
            : undefined,
        }
      );

      console.log(
        `${response.ok ? "✅" : "❌"} ${endpoint}: ${response.status}`
      );

      if (!response.ok) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }

  return true;
};

// Call debug function when in development
if (process.env.NODE_ENV === "development") {
  window.debugExploreAPI = debugAPIConnection;
  console.log("🔧 Debug function available: window.debugExploreAPI()");
}

// --- Custom Hooks ---
const useMountainsList = () => {
  const [mountainsList, setMountainsList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMountainsList = async () => {
      try {
        const data = await fetchMountainsList();
        setMountainsList(data);
      } catch (err) {
        console.error("Error fetching mountains list:", err);
        setError("Gagal memuat daftar gunung. Silakan refresh halaman.");
      }
    };

    loadMountainsList();
  }, []);

  return { mountainsList, error };
};

const useExploreHandlers = (
  preferences,
  setPreferences,
  setResults,
  setHasSearched,
  setIsCalculating,
  setError,
  resultsRef,
  searchMode,
  sortByDistance,
  sortByScore,
  sortByCost
) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isDropdown = [
      "id_gunung",
      "ketinggian",
      "lokasi",
      "inputType",
      "provinsi",
      "musim",
      "tipe_pendakian",
    ].includes(name);
    const processedValue = isDropdown ? value : Number(value);
    setPreferences((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleInputTypeChange = (newInputType) => {
    setPreferences((prev) => ({ ...prev, inputType: newInputType }));
  };

  const handleReset = () => {
    setPreferences(INITIAL_PREFERENCES);
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      const filters = {
        sortByDistance,
        sortByScore,
        sortByCost,
      };
      const data = await fetchRecommendations(preferences, searchMode, filters);

      // Extract recommendations from fuzzy engine response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (data.recommendations) {
        // Fallback for old API format
        recommendations = data.recommendations;
      } else if (Array.isArray(data)) {
        recommendations = data;
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      // Simpan ke localStorage
      localStorage.setItem(
        "mountify_explore_preferences",
        JSON.stringify(preferences)
      );
      localStorage.setItem(
        "mountify_explore_results",
        JSON.stringify(recommendations)
      );
      // Simpan lokasi user jika ada
      if (preferences.user_lat && preferences.user_lng) {
        localStorage.setItem(
          "mountify_explore_location",
          JSON.stringify({
            user_lat: preferences.user_lat,
            user_lng: preferences.user_lng,
            user_location_name: preferences.user_location_name || "",
          })
        );
      }
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleShowAll = async () => {
    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      const data = await fetchAllData(searchMode);

      // Extract data from response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (Array.isArray(data)) {
        recommendations = data;
      } else {
        recommendations = data.data || [];
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      // Simpan ke localStorage agar input dan hasil sama seperti rekomendasi
      localStorage.setItem(
        "mountify_explore_preferences",
        JSON.stringify(preferences)
      );
      localStorage.setItem(
        "mountify_explore_results",
        JSON.stringify(recommendations)
      );
      // Simpan lokasi user jika ada
      if (preferences.user_lat && preferences.user_lng) {
        localStorage.setItem(
          "mountify_explore_location",
          JSON.stringify({
            user_lat: preferences.user_lat,
            user_lng: preferences.user_lng,
            user_location_name: preferences.user_location_name || "",
          })
        );
      }
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    handleChange,
    handleInputTypeChange,
    handleReset,
    handleRecommendationSubmit,
    handleShowAll,
  };
};

// Simple Search Component
const SimpleSearchBar = ({ value, onChange, onSearch, isCalculating }) => (
  <div className="simple-search-container">
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Cari nama gunung atau jalur..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        type="button"
        className="search-btn"
        onClick={onSearch}
        disabled={isCalculating}
      >
        {isCalculating ? "..." : "Cari"}
      </button>
    </div>
  </div>
);

// Modal Panduan Penggunaan & Kriteria
function UsageGuideModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="usage-modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="usage-modal-content"
        style={{
          background: "#fff",
          borderRadius: 8,
          maxWidth: 600,
          width: "90%",
          padding: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            right: 0,
            alignSelf: "flex-end",
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 style={{ marginTop: 0 }}>Panduan Penggunaan & Info Kriteria</h2>
        <h3>Cara Penggunaan</h3>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            Pilih mode pencarian: <b>jalur</b> (jalur pendakian) atau{" "}
            <b>gunung</b> (rekomendasi gunung terbaik).
          </li>
          <li>
            Atur preferensi menggunakan <b>slider</b> (kontrol) atau{" "}
            <b>dropdown</b> (pilihan deskriptif) dengan klik "Mode Input".
          </li>
          <li>
            Isi filter sesuai kebutuhan: tingkat kesulitan, keamanan, estimasi
            waktu, ketinggian, fasilitas, air, variasi lanskap, perlindungan
            angin, jaringan komunikasi, tingkat insiden, dsb.
          </li>
          <li>
            Klik <b>Cari Rekomendasi</b> untuk menampilkan hasil.
          </li>
          <li>
            Gunakan <b>pencarian cepat</b> (quick search) untuk mencari nama
            gunung/jalur secara langsung.
          </li>
          <li>
            Untuk bantuan interaktif, klik ikon <b>chatbot</b> dan ajukan
            pertanyaan secara natural.
          </li>
        </ol>
        <h3 style={{ marginTop: 24 }}>Info Kriteria & Skala Filter</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                Kriteria
              </th>
              <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                Rentang & Arti
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                max_kesulitan_skala
              </td>
              <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                1 (sangat mudah) - 10 (ekstrem)
              </td>
            </tr>
            <tr>
              <td>min_keamanan_skala</td>
              <td>1 (sangat berisiko) - 10 (maksimal aman)</td>
            </tr>
            <tr>
              <td>max_estimasi_waktu_jam</td>
              <td>Estimasi waktu tempuh (jam)</td>
            </tr>
            <tr>
              <td>max_ketinggian_mdpl</td>
              <td>Ketinggian puncak (meter)</td>
            </tr>
            <tr>
              <td>min_kualitas_fasilitas_skala</td>
              <td>1 (sangat minim) - 10 (mewah)</td>
            </tr>
            <tr>
              <td>min_kualitas_kemah_skala</td>
              <td>1 (sangat terbatas) - 10 (eksklusif)</td>
            </tr>
            <tr>
              <td>min_keindahan_pemandangan_skala</td>
              <td>1 (kurang menarik) - 10 (luar biasa)</td>
            </tr>
            <tr>
              <td>min_ketersediaan_air</td>
              <td>1 (sangat langka) - 10 (berlimpah ruah)</td>
            </tr>
            <tr>
              <td>min_variasi_lanskap</td>
              <td>1 (sangat monoton) - 10 (luar biasa beragam)</td>
            </tr>
            <tr>
              <td>min_perlindungan_angin</td>
              <td>1 (sangat terekspos) - 10 (ideal terlindungi)</td>
            </tr>
            <tr>
              <td>min_jaringan_komunikasi</td>
              <td>1 (tidak ada sinyal) - 10 (sinyal optimal)</td>
            </tr>
            <tr>
              <td>min_tingkat_keamanan_insiden</td>
              <td>1 (insiden sangat sering) - 10 (maksimal aman)</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
          Semakin tinggi nilai minimum pada filter, semakin ketat hasil
          rekomendasi.
          <br />
          Setiap kriteria dapat diatur sesuai kebutuhan pendaki (pemula,
          menengah, ahli).
          <br />
          Untuk info detail skala, lihat tooltip atau label pada masing-masing
          filter di UI.
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            background: "#27ae60",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: 4,
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function SectionInfoModal({ open, onClose, title, infos }) {
  if (!open) return null;
  // Helper to convert newlines to <br />
  const formatValue = (text) => {
    if (!text) return "";
    // Escape HTML, then replace newlines with <br />
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(/\n/g, "<br />");
  };
  return (
    <div
      className="usage-modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 2100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="usage-modal-content"
        style={{
          background: "#fff",
          borderRadius: 8,
          maxWidth: 480,
          width: "90%",
          padding: 28,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            right: 0,
            alignSelf: "flex-end",
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h2>
        <ul style={{ paddingLeft: 18, fontSize: 15 }}>
          {infos.map((info, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <b>{info.label}:</b>{" "}
              <span
                style={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{ __html: formatValue(info.value) }}
              />
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            background: "#27ae60",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: 4,
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function Explore() {
  const [searchMode, setSearchMode] = useState("gunung");
  // Virtual Assistant (Chatbot) removed
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  // Filter states for recommendation results
  const [sortByDistance, setSortByDistance] = useState("");
  const [sortByScore, setSortByScore] = useState("");
  const [sortByCost, setSortByCost] = useState("");

  // Update filteredResults setiap results atau preferences.max_budget berubah
  useEffect(() => {
    setFilteredResults(filterByBudget(results, preferences.max_budget));
  }, [results, preferences.max_budget]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp] = useState(false);
  // Geolocation state
  const [geoStatus, setGeoStatus] = useState("");
  const [showManualLocation, setShowManualLocation] = useState(false);
  // Manual location (by region name)
  const [manualLocationName, setManualLocationName] = useState("");
  const [manualLocationOptions, setManualLocationOptions] = useState([]);
  const [manualLocationLoading, setManualLocationLoading] = useState(false);
  const [manualLocationError, setManualLocationError] = useState("");
  // Reverse geocoding state
  const [regionName, setRegionName] = useState("");
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");

  // Reverse geocoding function using Nominatim
  const fetchRegionName = async (lat, lng) => {
    setRegionLoading(true);
    setRegionError("");
    try {
      const url = `http://localhost:5000/api/proxy/nominatim?lat=${lat}&lon=${lng}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal reverse geocoding");
      const data = await response.json();
      // Prefer display_name, or build from address
      let name = "";
      if (data.address) {
        // Try to build a nice region name
        name =
          data.address.village ||
          data.address.town ||
          data.address.city ||
          data.address.county ||
          data.address.state ||
          data.address.region ||
          data.address.country ||
          "";
        // Optionally add kabupaten/kota/province
        if (data.address.city && data.address.state) {
          name = `${data.address.city}, ${data.address.state}`;
        } else if (data.address.county && data.address.state) {
          name = `${data.address.county}, ${data.address.state}`;
        } else if (data.address.state && data.address.country) {
          name = `${data.address.state}, ${data.address.country}`;
        }
      }
      if (!name && data.display_name) {
        name = data.display_name.split(",")[0];
      }
      setRegionName(name || "Wilayah tidak diketahui");
    } catch (err) {
      setRegionError("Gagal mendapatkan nama wilayah");
      setRegionName("");
    } finally {
      setRegionLoading(false);
    }
  };

  // Fetch region name when coordinates change
  useEffect(() => {
    if (preferences.user_lat && preferences.user_lng) {
      fetchRegionName(preferences.user_lat, preferences.user_lng);
    } else {
      setRegionName("");
      setRegionError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.user_lat, preferences.user_lng]);

  // Manual location handler
  // Geocoding: cari koordinat dari nama daerah administratif
  const handleManualLocationSubmit = async () => {
    if (!manualLocationName.trim()) {
      setGeoStatus("Nama daerah harus diisi.");
      return;
    }
    setManualLocationLoading(true);
    setManualLocationError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        manualLocationName
      )}&addressdetails=1&limit=5&accept-language=id`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "mountify-app/1.0 (contact@mountify.app)",
        },
      });
      if (!response.ok) throw new Error("Gagal mencari lokasi");
      const data = await response.json();
      if (!data.length) {
        setManualLocationError("Daerah tidak ditemukan. Coba nama lain.");
        setManualLocationOptions([]);
        setManualLocationLoading(false);
        return;
      }
      setManualLocationOptions(data);
      setManualLocationLoading(false);
    } catch (err) {
      setManualLocationError("Gagal mencari lokasi");
      setManualLocationOptions([]);
      setManualLocationLoading(false);
    }
  };

  // Pilih salah satu hasil geocoding
  const handleSelectManualLocation = (option) => {
    setPreferences((prev) => ({
      ...prev,
      user_lat: parseFloat(option.lat),
      user_lng: parseFloat(option.lon),
      user_location_name: option.display_name,
    }));
    setGeoStatus(`Lokasi ${option.display_name} berhasil dipilih!`);
    setShowManualLocation(false);
    setManualLocationName("");
    setManualLocationOptions([]);
    setManualLocationError("");
  };

  const handleClearLocation = () => {
    setPreferences((prev) => ({
      ...prev,
      user_lat: null,
      user_lng: null,
      user_location_name: "",
    }));
    setGeoStatus("");
    setManualLocationName("");
    setManualLocationOptions([]);
    setManualLocationError("");
    setShowManualLocation(false);
  };

  // Geolocation handler
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation tidak didukung di browser ini.");
      return;
    }
    setGeoStatus("Mengambil lokasi...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPreferences((prev) => ({
          ...prev,
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
          user_location_name: "Lokasi GPS Anda",
        }));
        setGeoStatus("Lokasi berhasil diambil!");
      },
      (err) => {
        setGeoStatus("Gagal mengambil lokasi: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const [showUsage, setShowUsage] = useState(false); // New state for usage guide
  // Modal states for each section
  const [openSectionModal, setOpenSectionModal] = useState("");
  const resultsRef = useRef(null);

  // Use custom hooks
  const { mountainsList, error: mountainsError } = useMountainsList();
  const {
    handleChange,
    handleInputTypeChange,
    handleReset,
    handleRecommendationSubmit,
    handleShowAll,
  } = useExploreHandlers(
    preferences,
    setPreferences,
    setResults,
    setHasSearched,
    setIsCalculating,
    setError,
    resultsRef,
    searchMode,
    sortByDistance,
    sortByScore,
    sortByCost
  );

  // ...existing code...

  // Handle mode changes
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    if (mode !== "virtual") {
      handleReset();
    }
  };

  // Handle quick search
  const handleQuickSearch = async () => {
    if (!preferences.quickSearch.trim()) return;

    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      // Use the regular recommendation API with search term
      const searchPreferences = {
        ...preferences,
        search_term: preferences.quickSearch,
      };

      const filters = {
        sortByDistance,
        sortByScore,
        sortByCost,
      };
      const data = await fetchRecommendations(
        searchPreferences,
        searchMode,
        filters
      );

      // Extract recommendations from fuzzy engine response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (data.recommendations) {
        recommendations = data.recommendations;
      } else if (Array.isArray(data)) {
        recommendations = data;
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  // Update error state if mountains loading fails
  useEffect(() => {
    if (mountainsError) {
      setError(mountainsError);
    }
  }, [mountainsError]);

  /*
  =============================
  FITUR UNGGULAN (Featured Features)
  =============================
  <section className="fitur-unggulan-section">
    <h2>Fitur Unggulan</h2>
    <ul>
      <li>🔍 Rekomendasi jalur & gunung berbasis preferensi detail</li>
      <li>📊 Filter canggih: kesulitan, keamanan, fasilitas, air, pemandangan, dsb</li>
      <li>🤖 Chatbot asisten virtual (AI) untuk tanya-jawab pendakian</li>
      <li>📱 Desain responsif & mudah digunakan di semua perangkat</li>
      <li>🗺️ Data jalur & gunung terlengkap, update berkala</li>
      <li>🔗 Fitur bagikan hasil rekomendasi ke WhatsApp, Email, dsb</li>
    </ul>
  </section>
  =============================
  END FITUR UNGGULAN
  =============================
  */
  return (
    <div className="explore-page-container">
      {/* Tombol Panduan Penggunaan */}
      <button
        className="usage-guide-btn"
        style={{
          position: "fixed",
          top: 90,
          right: 24,
          zIndex: 1100,
          background: "#27ae60",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          padding: "8px 18px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        onClick={() => setShowUsage(true)}
      >
        ?
      </button>
      <UsageGuideModal open={showUsage} onClose={() => setShowUsage(false)} />
      <header className="explore-header">
        <div className="header-content">
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
            }}
          >
            Rekomendasi Pendakian
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              opacity: "0.9",
              marginBottom: "24px",
              fontWeight: "400",
            }}
          >
            Temukan gunung dan jalur yang sesuai dengan preferensi Anda
          </p>

          {/* Budget Input - Improved Design */}
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                minWidth: "320px",
              }}
            >
              <div
                style={{
                  background: "rgba(39, 174, 96, 0.2)",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "18px" }}>💰</span>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="max_budget"
                  style={{
                    display: "block",
                    fontWeight: "600",
                    color: "#fff",
                    fontSize: "14px",
                    marginBottom: "4px",
                    opacity: "0.9",
                  }}
                >
                  Budget Maksimal (Rp)
                </label>
                <input
                  id="max_budget"
                  name="max_budget"
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="Contoh: 500000"
                  value={preferences.max_budget}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      max_budget: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    fontSize: "15px",
                    background: "rgba(255, 255, 255, 0.9)",
                    color: "#2c3e50",
                    fontWeight: "500",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "#fff";
                    e.target.style.borderColor = "#3498db";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(52, 152, 219, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="location-btn"
                style={{
                  background:
                    "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(52, 152, 219, 0.3)",
                }}
                onClick={handleUseLocation}
              >
                <span>📍</span>
                Gunakan Lokasi Saya
              </button>

              <button
                type="button"
                className="manual-location-btn"
                style={{
                  background:
                    "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(155, 89, 182, 0.3)",
                }}
                onClick={() => setShowManualLocation(!showManualLocation)}
              >
                <span>📝</span>
                Input Manual
              </button>

              {preferences.user_lat && preferences.user_lng && (
                <button
                  type="button"
                  className="clear-location-btn"
                  style={{
                    background:
                      "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
                  }}
                  onClick={handleClearLocation}
                >
                  <span>🗑️</span>
                  Hapus Lokasi
                </button>
              )}
            </div>

            {/* Manual Location Input - Improved Design */}
            {showManualLocation && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(44, 62, 80, 0.15)",
                  padding: "24px",
                  marginTop: "16px",
                  width: "100%",
                  maxWidth: "500px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  color: "#2c3e50",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #3498db, #2980b9)",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🌐</span>
                  </div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      color: "#2c3e50",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Input Nama Daerah Administratif
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        gap: "6px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>✏️</span>
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#34495e",
                        }}
                      >
                        Cari Nama Daerah:
                      </span>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleManualLocationSubmit();
                      }}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "stretch",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Contoh: Sleman, Yogyakarta atau Bandung, Jawa Barat"
                        value={manualLocationName}
                        onChange={(e) => setManualLocationName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          border: "2px solid #e0e6ed",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "#ffffff",
                          color: "#2c3e50",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontWeight: "500",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3498db";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(52, 152, 219, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e0e6ed";
                          e.target.style.boxShadow = "none";
                        }}
                        autoFocus
                      />
                      <button
                        type="submit"
                        style={{
                          background:
                            "linear-gradient(135deg, #27ae60, #2ecc71)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 20px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          boxShadow: "0 2px 8px rgba(39, 174, 96, 0.3)",
                          transition: "all 0.2s ease",
                          minWidth: "80px",
                        }}
                        disabled={manualLocationLoading}
                        onMouseEnter={(e) => {
                          if (!manualLocationLoading) {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(39, 174, 96, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!manualLocationLoading) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 2px 8px rgba(39, 174, 96, 0.3)";
                          }
                        }}
                      >
                        {manualLocationLoading ? "Mencari..." : "Cari"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowManualLocation(false)}
                        style={{
                          background:
                            "linear-gradient(135deg, #95a5a6, #7f8c8d)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 8px rgba(149, 165, 166, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(149, 165, 166, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(149, 165, 166, 0.3)";
                        }}
                      >
                        ✗ Batal
                      </button>
                    </form>
                    {manualLocationError && (
                      <div
                        style={{
                          background: "rgba(231, 76, 60, 0.1)",
                          border: "1px solid rgba(231, 76, 60, 0.3)",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          color: "#e74c3c",
                          fontSize: "13px",
                          marginTop: "8px",
                          fontWeight: "500",
                        }}
                      >
                        ⚠️ {manualLocationError}
                      </div>
                    )}
                  </div>
                  {/* Location Options - Improved Design */}
                  {manualLocationOptions.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#34495e",
                          marginBottom: "8px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>📍</span>
                        Pilih salah satu hasil:
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {manualLocationOptions.map((opt, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() => handleSelectManualLocation(opt)}
                              style={{
                                background: "#ffffff",
                                color: "#2c3e50",
                                border: "2px solid #e0e6ed",
                                borderRadius: "8px",
                                padding: "10px 14px",
                                cursor: "pointer",
                                fontSize: "13px",
                                width: "100%",
                                textAlign: "left",
                                fontWeight: "500",
                                transition: "all 0.2s ease",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.borderColor = "#3498db";
                                e.target.style.boxShadow =
                                  "0 2px 8px rgba(52, 152, 219, 0.15)";
                                e.target.style.background = "#f8fafc";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.borderColor = "#e0e6ed";
                                e.target.style.boxShadow =
                                  "0 1px 3px rgba(0, 0, 0, 0.1)";
                                e.target.style.background = "#ffffff";
                              }}
                            >
                              {opt.display_name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#7f8c8d",
                      textAlign: "center",
                      marginTop: "16px",
                      background: "rgba(52, 152, 219, 0.05)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      border: "1px solid rgba(52, 152, 219, 0.1)",
                    }}
                  >
                    <span style={{ fontSize: "14px", marginRight: "6px" }}>
                      💡
                    </span>
                    <strong>Tip:</strong> Ketik nama kabupaten/kota, kecamatan,
                    atau provinsi. Pilih dari hasil yang muncul.
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {geoStatus && (
              <div
                style={{
                  color: geoStatus.includes("berhasil") ? "#27ae60" : "#c0392b",
                  fontSize: 13,
                  textAlign: "center",
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: geoStatus.includes("berhasil")
                    ? "#d4edda"
                    : "#f8d7da",
                }}
              >
                {geoStatus}
              </div>
            )}

            {/* Current Location Display with region name */}
            {preferences.user_lat && preferences.user_lng && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#f4fbf7",
                    border: "1.5px solid #b7e4c7",
                    borderRadius: 12,
                    boxShadow: "0 2px 12px rgba(44, 62, 80, 0.07)",
                    padding: "18px 32px 14px 24px",
                    minWidth: 260,
                    maxWidth: 370,
                    textAlign: "left",
                    position: "relative",
                    fontSize: 13,
                    color: "#145c4c",
                    fontWeight: 400,
                    letterSpacing: 0.1,
                    lineHeight: 1.5,
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        background: "#e9f7ef",
                        borderRadius: "50%",
                        marginRight: 8,
                        fontSize: 15,
                        color: "#27ae60",
                        boxShadow: "0 1px 3px rgba(39,174,96,0.07)",
                      }}
                    >
                      📍
                    </span>
                    <span
                      style={{
                        fontWeight: 500,
                        color: "#168d6a",
                        fontSize: 14,
                      }}
                    >
                      Lokasi Aktif
                    </span>
                  </div>
                  <div style={{ marginLeft: 30, marginBottom: 2 }}>
                    {regionLoading ? (
                      <span style={{ color: "#888" }}>
                        Memuat nama wilayah...
                      </span>
                    ) : regionError ? (
                      <span style={{ color: "#c0392b" }}>{regionError}</span>
                    ) : regionName ? (
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#145c4c",
                          fontSize: 15,
                        }}
                      >
                        {regionName}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600 }}>
                        {preferences.user_location_name || "Lokasi Manual"}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginLeft: 30,
                      fontSize: 11.5,
                      color: "#168d6a",
                      letterSpacing: 0.2,
                    }}
                  >
                    ({preferences.user_lat.toFixed(5)},{" "}
                    {preferences.user_lng.toFixed(5)})
                  </div>
                </div>
              </div>
            )}

            {/* Budget Status Display - Improved Design */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            ></div>
          </div>
        </div>
        <div
          className="mode-switcher"
          style={{
            marginTop: 20,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            padding: "6px",
            display: "inline-flex",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            onClick={() => handleModeChange("gunung")}
            className={`mode-btn ${searchMode === "gunung" ? "active" : ""}`}
            style={{
              padding: "12px 20px",
              border: "none",
              background:
                searchMode === "gunung"
                  ? "rgba(255, 255, 255, 0.9)"
                  : "transparent",
              color:
                searchMode === "gunung"
                  ? "#2c3e50"
                  : "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "120px",
              justifyContent: "center",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow:
                searchMode === "gunung"
                  ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                  : "none",
            }}
          >
            <span className="mode-icon" style={{ fontSize: "16px" }}>
              🏔️
            </span>
            Gunung
          </button>
          <button
            onClick={() => handleModeChange("jalur")}
            className={`mode-btn ${searchMode === "jalur" ? "active" : ""}`}
            style={{
              padding: "12px 20px",
              border: "none",
              background:
                searchMode === "jalur"
                  ? "rgba(255, 255, 255, 0.9)"
                  : "transparent",
              color:
                searchMode === "jalur" ? "#2c3e50" : "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "120px",
              justifyContent: "center",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow:
                searchMode === "jalur"
                  ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                  : "none",
            }}
          >
            <span className="mode-icon" style={{ fontSize: "16px" }}>
              🥾
            </span>
            Jalur
          </button>
        </div>
      </header>

      {searchMode !== "virtual" && (
        <>
          {/* Simple Search Section */}
          <SimpleSearchBar
            value={preferences.quickSearch}
            onChange={(value) =>
              setPreferences((prev) => ({ ...prev, quickSearch: value }))
            }
            onSearch={handleQuickSearch}
            isCalculating={isCalculating}
          />

          <form
            className="recommendation-form"
            onSubmit={handleRecommendationSubmit}
          >
            <div className="form-header">
              <h3>Preferensi Pendakian</h3>
              <div className="header-controls">
                <InputTypeSwitcher
                  inputType={preferences.inputType}
                  onInputTypeChange={handleInputTypeChange}
                />
                {/* <div className="help-buttons-group">
                  <button
                    type="button"
                    className="help-toggle-btn"
                    onClick={() => setShowUsage(!showUsage)}
                    title={
                      showUsage
                        ? "Sembunyikan cara penggunaan"
                        : "Tampilkan cara penggunaan"
                    }
                  >
                    {showUsage ? "Sembunyikan Panduan" : "Cara Penggunaan"}
                  </button>
                  <button
                    type="button"
                    className="help-toggle-btn"
                    onClick={() => setShowHelp(!showHelp)}
                    title={
                      showHelp
                        ? "Sembunyikan info kriteria"
                        : "Tampilkan info kriteria"
                    }
                  >
                    {showHelp ? "Sembunyikan Info" : "Info Kriteria"}
                  </button>
                </div> */}
              </div>
            </div>

            {/* Usage Guide Section */}
            {showUsage && (
              <div className="help-section">
                <h4 className="help-title">
                  📖 Panduan Penggunaan Sistem Rekomendasi
                </h4>
                <div className="usage-content">
                  <div className="usage-step">
                    <h5>🎯 1. Pilih Mode Pencarian</h5>
                    <ul>
                      <li>
                        <strong>Gunung:</strong> Mencari rekomendasi gunung
                        terbaik berdasarkan preferensi
                      </li>
                      <li>
                        <strong>Jalur:</strong> Mencari jalur pendakian spesifik
                        dengan kriteria detail
                      </li>
                      <li>
                        <strong>Asisten Virtual:</strong> Gunakan chatbot untuk
                        pencarian interaktif
                      </li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>⚙️ 2. Atur Mode Input</h5>
                    <ul>
                      <li>
                        <strong>Kontrol:</strong> Gunakan slider untuk mengatur
                        nilai secara kontinu
                      </li>
                      <li>
                        <strong>Pilihan:</strong> Pilih dari dropdown dengan
                        deskripsi yang jelas
                      </li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>🔍 3. Pencarian Cepat</h5>
                    <p>
                      Gunakan kolom pencarian untuk menemukan gunung atau jalur
                      berdasarkan nama secara langsung.
                    </p>
                  </div>

                  <div className="usage-step">
                    <h5>📊 4. Atur Preferensi</h5>
                    <ul>
                      <li>
                        Sesuaikan setiap kriteria berdasarkan kemampuan dan
                        preferensi Anda
                      </li>
                      <li>
                        Nilai lebih tinggi = kriteria lebih ketat/spesifik
                      </li>
                      <li>Gunakan tooltip untuk memahami setiap kriteria</li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>🎯 5. Dapatkan Rekomendasi</h5>
                    <ul>
                      <li>
                        <strong>Dapatkan Rekomendasi:</strong> Sistem akan
                        menganalisis preferensi Anda
                      </li>
                      <li>
                        <strong>Lihat Semua:</strong> Tampilkan semua data tanpa
                        filter
                      </li>
                      <li>
                        <strong>Reset:</strong> Kembalikan ke pengaturan default
                      </li>
                    </ul>
                  </div>

                  <div className="usage-tip">
                    <h5>💡 Tips Penggunaan:</h5>
                    <ul>
                      <li>
                        Mulai dengan kriteria keamanan tinggi untuk pemula
                      </li>
                      <li>Sesuaikan durasi dengan kemampuan fisik Anda</li>
                      <li>Pertimbangkan musim dan cuaca saat memilih</li>
                      <li>
                        Gunakan filter gunung spesifik untuk jalur tertentu
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section - Conditional Rendering */}
            {showHelp && (
              <div className="help-section">
                <h4 className="help-title">📋 Info Kriteria Penilaian</h4>

                <div className="criteria-section">
                  <div className="help-grid">
                    <div className="help-item">
                      <strong>🧗 Kesulitan:</strong> Tingkat tantangan teknis
                      dan fisik jalur berdasarkan standar nasional &
                      internasional (Grade 1-5, YDS)
                    </div>
                    <div className="help-item">
                      <strong>🛡️ Keamanan:</strong> Berdasarkan data insiden
                      BASARNAS & evaluasi SAR
                    </div>
                    <div className="help-item">
                      <strong>🏗️ Fasilitas:</strong> Kelengkapan basecamp,
                      shelter, toilet, dan fasilitas pendukung
                    </div>
                    <div className="help-item">
                      <strong>🏕️ Area Kemah:</strong> Kualitas lokasi bermalam,
                      ground datar, dan perlindungan cuaca
                    </div>
                    <div className="help-item">
                      <strong>🌅 Pemandangan:</strong> Keindahan panorama,
                      sunrise/sunset, dan daya tarik visual
                    </div>
                    <div className="help-item">
                      <strong>⏱️ Durasi:</strong> Estimasi waktu naik-turun
                      berdasarkan pengalaman rata-rata pendaki
                    </div>
                    <div className="help-item">
                      <strong>⛰️ Ketinggian:</strong> Maksimal ketinggian puncak
                      (mdpl)
                    </div>
                    <div className="help-item">
                      <strong>💧 Ketersediaan Air:</strong> Akses sumber air
                      bersih sepanjang jalur & area kemah
                    </div>
                    <div className="help-item">
                      <strong>🌿 Variasi Lanskap:</strong> Keragaman ekosistem,
                      flora-fauna, dan formasi geologis
                    </div>
                    <div className="help-item">
                      <strong>🌪️ Perlindungan Angin:</strong> Tingkat
                      keterlindungan area kemah dari angin kencang
                    </div>
                    <div className="help-item">
                      <strong>📱 Jaringan Komunikasi:</strong> Kualitas sinyal
                      seluler untuk komunikasi darurat
                    </div>
                    <div className="help-item">
                      <strong>🚨 Tingkat Insiden:</strong> Riwayat keamanan
                      berdasarkan data SAR & kejadian kecelakaan
                    </div>
                  </div>
                </div>

                <div className="help-note">
                  <strong>📚 Referensi:</strong> BASARNAS Indonesia, WANADRI,
                  UIAA, Database Gunung Indonesia.
                </div>
              </div>
            )}

            {searchMode === "jalur" && (
              <div className="filter-section">
                <h4 className="section-title">Filter Spesifik</h4>
                <div className="form-group">
                  <label htmlFor="id_gunung">Pilih Gunung Tertentu</label>
                  <select
                    id="id_gunung"
                    name="id_gunung"
                    className="filter-select"
                    value={preferences.id_gunung}
                    onChange={handleChange}
                  >
                    <option value="">Semua Gunung</option>
                    {mountainsList.map((g) => (
                      <option key={g.id_gunung} value={g.id_gunung}>
                        {g.nama_gunung}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Kesulitan & Keamanan
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Kesulitan & Keamanan"
                  onClick={() => setOpenSectionModal("difficulty")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="max_kesulitan_skala"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Tingkat Kesulitan Maksimal</span>
                    <span className="preference-value">
                      {getDifficultyDescription(
                        preferences.max_kesulitan_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="max_kesulitan_skala"
                    name="max_kesulitan_skala"
                    value={preferences.max_kesulitan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getDifficultyDescription}
                    rangeLabels={{ min: "Mudah", max: "Sulit" }}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="min_keamanan_skala"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Tingkat Keamanan Minimal</span>
                    <span className="preference-value">
                      {getSafetyDescription(preferences.min_keamanan_skala)}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_keamanan_skala"
                    name="min_keamanan_skala"
                    value={preferences.min_keamanan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getSafetyDescription}
                    rangeLabels={{ min: "Berisiko", max: "Sangat Aman" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Durasi & Ketinggian
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Durasi & Ketinggian"
                  onClick={() => setOpenSectionModal("duration")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="max_estimasi_waktu_jam"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Maksimal Durasi Pendakian
                  </label>
                  <TimeInput
                    id="max_estimasi_waktu_jam"
                    name="max_estimasi_waktu_jam"
                    value={preferences.max_estimasi_waktu_jam}
                    onChange={handleChange}
                    inputType={preferences.inputType}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="max_ketinggian_mdpl"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Ketinggian Maksimal</span>
                    <span className="preference-value">
                      {getAltitudeDescription(preferences.max_ketinggian_mdpl)}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="max_ketinggian_mdpl"
                    name="max_ketinggian_mdpl"
                    className="number-input"
                    value={preferences.max_ketinggian_mdpl}
                    onChange={handleChange}
                    min="0"
                    max="6000"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Fasilitas & Kenyamanan
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Fasilitas & Kenyamanan"
                  onClick={() => setOpenSectionModal("facility")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="min_kualitas_fasilitas_skala"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Kualitas Fasilitas Minimal</span>
                    <span className="preference-value">
                      {getFacilityDescription(
                        preferences.min_kualitas_fasilitas_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_kualitas_fasilitas_skala"
                    name="min_kualitas_fasilitas_skala"
                    value={preferences.min_kualitas_fasilitas_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getFacilityDescription}
                    rangeLabels={{ min: "Minim", max: "Lengkap" }}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="min_kualitas_kemah_skala"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Kualitas Area Kemah Minimal</span>
                    <span className="preference-value">
                      {getCampQualityDescription(
                        preferences.min_kualitas_kemah_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_kualitas_kemah_skala"
                    name="min_kualitas_kemah_skala"
                    value={preferences.min_kualitas_kemah_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getCampQualityDescription}
                    rangeLabels={{ min: "Terbatas", max: "Sangat Baik" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Pemandangan & Lingkungan
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Pemandangan & Lingkungan"
                  onClick={() => setOpenSectionModal("scenery")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="min_keindahan_pemandangan_skala"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Keindahan Pemandangan Minimal</span>
                    <span className="preference-value">
                      {getSceneryDescription(
                        preferences.min_keindahan_pemandangan_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_keindahan_pemandangan_skala"
                    name="min_keindahan_pemandangan_skala"
                    value={preferences.min_keindahan_pemandangan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getSceneryDescription}
                    rangeLabels={{ min: "Biasa", max: "Istimewa" }}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="min_ketersediaan_air"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Ketersediaan Air Minimal</span>
                    <span className="preference-value">
                      {getWaterAvailabilityDescription(
                        preferences.min_ketersediaan_air
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_ketersediaan_air"
                    name="min_ketersediaan_air"
                    value={preferences.min_ketersediaan_air}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getWaterAvailabilityDescription}
                    rangeLabels={{ min: "Langka", max: "Melimpah" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Lanskap & Perlindungan
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Lanskap & Perlindungan"
                  onClick={() => setOpenSectionModal("landscape")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="min_variasi_lanskap"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Variasi Lanskap Minimal</span>
                    <span className="preference-value">
                      {getLandscapeVariationDescription(
                        preferences.min_variasi_lanskap
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_variasi_lanskap"
                    name="min_variasi_lanskap"
                    value={preferences.min_variasi_lanskap}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getLandscapeVariationDescription}
                    rangeLabels={{ min: "Monoton", max: "Sangat Bervariasi" }}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="min_perlindungan_angin"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Perlindungan Angin Minimal</span>
                    <span className="preference-value">
                      {getWindProtectionDescription(
                        preferences.min_perlindungan_angin
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_perlindungan_angin"
                    name="min_perlindungan_angin"
                    value={preferences.min_perlindungan_angin}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getWindProtectionDescription}
                    rangeLabels={{
                      min: "Terekspos",
                      max: "Sangat Terlindungi",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4
                className="section-title"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Komunikasi & Keamanan Insiden
                <button
                  type="button"
                  style={{
                    color: "#27ae60",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 18,
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginLeft: 2,
                  }}
                  aria-label="Penjelasan Komunikasi & Keamanan Insiden"
                  onClick={() => setOpenSectionModal("communication")}
                >
                  ?
                </button>
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="min_jaringan_komunikasi"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Sinyal Minimal</span>
                    <span className="preference-value">
                      {getCommunicationDescription(
                        preferences.min_jaringan_komunikasi
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_jaringan_komunikasi"
                    name="min_jaringan_komunikasi"
                    value={preferences.min_jaringan_komunikasi}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getCommunicationDescription}
                    rangeLabels={{
                      min: "Tidak Ada Sinyal",
                      max: "Sinyal Sangat Baik",
                    }}
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="min_tingkat_keamanan_insiden"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span>Insiden Minimal</span>
                    <span className="preference-value">
                      {getIncidentSafetyDescription(
                        preferences.min_tingkat_keamanan_insiden
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_tingkat_keamanan_insiden"
                    name="min_tingkat_keamanan_insiden"
                    value={preferences.min_tingkat_keamanan_insiden}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getIncidentSafetyDescription}
                    rangeLabels={{ min: "Sering", max: "Sangat Aman" }}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={handleShowAll}
                disabled={isCalculating}
              >
                Lihat Semua
              </button>
              <button
                type="button"
                className="action-button tertiary"
                onClick={handleReset}
                disabled={isCalculating}
              >
                Reset
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <SpinnerIcon /> Menganalisis...
                  </>
                ) : (
                  "Dapatkan Rekomendasi"
                )}
              </button>
            </div>
          </form>

          <section className="results-section" ref={resultsRef}>
            {hasSearched && (
              <header className="results-header">
                <h2>Hasil Rekomendasi</h2>
                {/* ShareButton removed */}
              </header>
            )}

            {/* Display fuzzy engine metadata if available */}
            {hasSearched && results.length > 0 && results[0].metadata && (
              <div className="engine-info">
                <div className="engine-stats">
                  <span className="stat-item">
                    📊 Engine:{" "}
                    {results[0].metadata.engine_info?.versi || "v5.0"}
                  </span>
                  <span className="stat-item">
                    🎯 {results[0].metadata.engine_info?.total_variabel || 13}{" "}
                    variabel input
                  </span>
                  {results[0].metadata.statistik_skor && (
                    <span className="stat-item">
                      ⭐ Skor tertinggi:{" "}
                      {results[0].metadata.statistik_skor.tertinggi?.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Filter Controls for Results */}
            {hasSearched && results.length > 0 && !isCalculating && !error && (
              <div className="results-filters">
                <h3>🔍 Urutkan Hasil</h3>
                <div className="filter-row">
                  <div className="filter-group">
                    <label htmlFor="sort-distance">📍 Jarak:</label>
                    <select
                      id="sort-distance"
                      value={sortByDistance}
                      onChange={(e) => {
                        setSortByDistance(e.target.value);
                        if (e.target.value) {
                          setSortByScore("");
                          setSortByCost("");
                        }
                      }}
                    >
                      <option value="">-- Pilih --</option>
                      <option value="terdekat">Terdekat</option>
                      <option value="terjauh">Terjauh</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sort-score">⭐ Skor:</label>
                    <select
                      id="sort-score"
                      value={sortByScore}
                      onChange={(e) => {
                        setSortByScore(e.target.value);
                        if (e.target.value) {
                          setSortByDistance("");
                          setSortByCost("");
                        }
                      }}
                    >
                      <option value="">-- Pilih --</option>
                      <option value="tertinggi">Tertinggi</option>
                      <option value="terendah">Terendah</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sort-cost">💰 Biaya:</label>
                    <select
                      id="sort-cost"
                      value={sortByCost}
                      onChange={(e) => {
                        setSortByCost(e.target.value);
                        if (e.target.value) {
                          setSortByDistance("");
                          setSortByScore("");
                        }
                      }}
                    >
                      <option value="">-- Pilih --</option>
                      <option value="termurah">Termurah</option>
                      <option value="termahal">Termahal</option>
                    </select>
                  </div>

                  <button
                    className="apply-filters-btn"
                    onClick={() => {
                      // Re-fetch results with new filters
                      handleRecommendationSubmit({ preventDefault: () => {} });
                    }}
                    disabled={!sortByDistance && !sortByScore && !sortByCost}
                  >
                    🔄 Terapkan Filter
                  </button>

                  <button
                    className="clear-filters-btn"
                    onClick={() => {
                      setSortByDistance("");
                      setSortByScore("");
                      setSortByCost("");
                    }}
                  >
                    ❌ Reset Filter
                  </button>
                </div>
              </div>
            )}

            <div className="results-grid">
              {isCalculating && (
                <div className="explore-page-status">
                  <SpinnerIcon /> Memuat data...
                </div>
              )}
              {error && (
                <ErrorDisplay
                  error={error}
                  context={`rekomendasi ${searchMode}`}
                  onRetry={() => {
                    setError(null);
                    setHasSearched(false);
                  }}
                />
              )}
              {!isCalculating &&
                hasSearched &&
                !error &&
                (filteredResults.length > 0 ? (
                  filteredResults.map((item, index) =>
                    searchMode === "jalur" ? (
                      <TrailCard
                        key={item.id_jalur || index}
                        trail={item}
                        index={index}
                      />
                    ) : (
                      <MountainCard
                        key={item.id_gunung || index}
                        mountain={item}
                        index={index}
                      />
                    )
                  )
                ) : (
                  <div className="no-results-message">
                    <NoResultsIllustration />
                    <h4>Tidak ada hasil yang cocok</h4>
                    <p>
                      Coba ubah preferensi atau budget Anda, atau lihat semua
                      data yang tersedia.
                    </p>
                  </div>
                ))}
              {!hasSearched && !isCalculating && !error && (
                <div className="no-results-message">
                  <h4>Hasil akan muncul di sini</h4>
                  <p>
                    Atur preferensi untuk mendapat rekomendasi, atau klik "Lihat
                    Semua" untuk menjelajah.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Share Results Section - Conditional Rendering */}
          {/* Share Results Section removed */}
        </>
      )}

      {/* Section Info Modals */}
      <SectionInfoModal
        open={openSectionModal === "difficulty"}
        onClose={() => setOpenSectionModal("")}
        title="Kesulitan & Keamanan"
        infos={[
          {
            label: "Tingkat Kesulitan Maksimal",
            value: `Batas atas tingkat kesulitan jalur/gunung yang diinginkan.\n\nSkala 1-10:\n1. Sangat mudah (jalur landai, cocok pemula)\n2. Mudah (sedikit tanjakan, aman)\n3. Cukup mudah (tanjakan ringan, jalur jelas)\n4. Menengah (tanjakan sedang, sedikit teknis)\n5. Menengah+ (tanjakan lebih curam, beberapa rintangan)\n6. Sulit (tanjakan curam, jalur berbatu/tanah licin)\n7. Sulit+ (banyak rintangan, butuh stamina lebih)\n8. Sangat sulit (teknis, butuh pengalaman)\n9. Hampir ekstrem (jalur sangat teknis, risiko tinggi)\n10. Ekstrem (hanya untuk pendaki ahli, risiko sangat tinggi)`,
          },
          {
            label: "Tingkat Keamanan Minimal",
            value: `Batas bawah tingkat keamanan jalur/gunung.\n\nSkala 1-10:\n1. Sangat berisiko (banyak insiden, rawan kecelakaan)\n2. Berisiko tinggi (insiden sering, minim pengawasan)\n3. Cukup berisiko (insiden kadang terjadi)\n4. Agak berisiko (ada beberapa titik rawan)\n5. Standar (risiko sedang, pengawasan cukup)\n6. Cukup aman (insiden jarang, jalur terpantau)\n7. Aman (jalur jelas, pengawasan baik)\n8. Sangat aman (insiden sangat jarang, jalur terawat)\n9. Hampir tanpa risiko (jalur sangat aman, pengawasan ketat)\n10. Maksimal aman (tidak ada insiden, pengawasan penuh)`,
          },
        ]}
      />
      <SectionInfoModal
        open={openSectionModal === "duration"}
        onClose={() => setOpenSectionModal("")}
        title="Durasi & Ketinggian"
        infos={[
          {
            label: "Maksimal Durasi Pendakian",
            value: `Batas maksimal estimasi waktu tempuh pendakian (jam).\n\n1. Pilih sesuai kemampuan fisik dan waktu yang tersedia.\n2. Umumnya, pendakian gunung di Indonesia memakan waktu antara 4–24 jam (naik-turun).\n3. Untuk pemula, disarankan memilih durasi maksimal yang lebih pendek.`,
          },
          {
            label: "Ketinggian Maksimal",
            value: `Batas atas ketinggian puncak gunung (mdpl).\n\nSkala umum gunung di Indonesia:\n1. < 1000 mdpl\n2. 1000–1500 mdpl\n3. 1500–2000 mdpl\n4. 2000–2500 mdpl\n5. 2500–3000 mdpl\n6. 3000–3500 mdpl\n7. 3500–4000 mdpl\n8. > 4000 mdpl\nKeterangan:\n1. < 1000 mdpl: Bukit/tebing rendah (sangat mudah, cocok pemula)\n2. 1000–1500 mdpl: Gunung rendah (mudah diakses, jalur ringan)\n3. 1500–2000 mdpl: Gunung menengah (jalur mulai menanjak)\n4. 2000–2500 mdpl: Menengah+ (lebih menantang, udara lebih tipis)\n5. 2500–3000 mdpl: Gunung tinggi (butuh stamina lebih)\n6. 3000–3500 mdpl: Sangat tinggi (cuaca ekstrem, suhu dingin)\n7. 3500–4000 mdpl: Ekstrem (hanya untuk pendaki berpengalaman)\n8. > 4000 mdpl: Gunung tertinggi (sangat langka di Indonesia, risiko tinggi)`,
          },
        ]}
      />
      <SectionInfoModal
        open={openSectionModal === "facility"}
        onClose={() => setOpenSectionModal("")}
        title="Fasilitas & Kenyamanan"
        infos={[
          {
            label: "Kualitas Fasilitas Minimal",
            value: `Batas bawah kualitas fasilitas basecamp, shelter, toilet, dsb.\n\nSkala 1-10:\n1. Tidak ada fasilitas\n2. Hanya basecamp sederhana\n3. Basecamp + toilet seadanya\n4. Ada shelter di jalur\n5. Shelter cukup banyak\n6. Toilet bersih, air cukup\n7. Fasilitas lengkap (warung, air, listrik)\n8. Fasilitas sangat baik, terawat\n9. Fasilitas mewah (penginapan, transportasi)\n10. Fasilitas sangat lengkap & modern`,
          },
          {
            label: "Kualitas Area Kemah Minimal",
            value: `Batas bawah kualitas area kemah.\n\nSkala 1-10:\n1. Tidak ada area kemah\n2. Area sempit, tidak rata\n3. Area cukup, tapi berbatu\n4. Area datar, kapasitas kecil\n5. Area datar, kapasitas sedang\n6. Area luas, tanah empuk\n7. Area luas, dekat sumber air\n8. Area sangat nyaman, aman dari angin\n9. Area sangat luas, pemandangan bagus\n10. Area kemah eksklusif, sangat nyaman`,
          },
        ]}
      />
      <SectionInfoModal
        open={openSectionModal === "scenery"}
        onClose={() => setOpenSectionModal("")}
        title="Pemandangan & Lingkungan"
        infos={[
          {
            label: "Keindahan Pemandangan Minimal",
            value: `Batas bawah keindahan pemandangan.\n\nSkala 1-10:\n1. Tidak ada pemandangan menarik\n2. Pemandangan biasa saja\n3. Ada beberapa spot bagus\n4. Pemandangan cukup indah\n5. Pemandangan bagus di beberapa titik\n6. Pemandangan indah sepanjang jalur\n7. Banyak spot foto menarik\n8. Pemandangan sangat indah, sunrise/sunset\n9. Panorama luar biasa\n10. Pemandangan istimewa, sangat jarang ditemui`,
          },
          {
            label: "Ketersediaan Air Minimal",
            value: `Batas bawah ketersediaan air di jalur/kemah.\n\nSkala 1-10:\n1. Tidak ada sumber air\n2. Sumber air sangat langka\n3. Sumber air jauh dari jalur\n4. Ada sumber air, tapi debit kecil\n5. Sumber air cukup, kadang kering\n6. Sumber air stabil, mudah diakses\n7. Banyak sumber air di jalur\n8. Sumber air melimpah, dekat kemah\n9. Sumber air sangat melimpah\n10. Air berlimpah ruah, sangat mudah diakses`,
          },
        ]}
      />
      <SectionInfoModal
        open={openSectionModal === "landscape"}
        onClose={() => setOpenSectionModal("")}
        title="Lanskap & Perlindungan"
        infos={[
          {
            label: "Variasi Lanskap Minimal",
            value: `Batas bawah keragaman lanskap/flora/fauna.\n\nSkala 1-10:\n1. Sangat monoton (hutan saja)\n2. Sedikit variasi (hutan + semak)\n3. Ada padang rumput\n4. Ada sungai/air terjun\n5. Ada tebing/batu unik\n6. Ada danau/kolam\n7. Banyak variasi flora/fauna\n8. Lanskap sangat beragam\n9. Lanskap unik & langka\n10. Lanskap luar biasa, sangat bervariasi`,
          },
          {
            label: "Perlindungan Angin Minimal",
            value: `Batas bawah perlindungan angin di area kemah.\n\nSkala 1-10:\n1. Sangat terekspos (angin kencang)\n2. Area kemah terbuka\n3. Sedikit terlindungi\n4. Ada pohon pelindung\n5. Area kemah agak terlindungi\n6. Area kemah cukup aman dari angin\n7. Area kemah sangat terlindungi\n8. Hampir tidak ada angin\n9. Area kemah sangat nyaman\n10. Perlindungan maksimal, tidak terasa angin sama sekali`,
          },
        ]}
      />
      <SectionInfoModal
        open={openSectionModal === "communication"}
        onClose={() => setOpenSectionModal("")}
        title="Komunikasi & Keamanan Insiden"
        infos={[
          {
            label: "Sinyal Minimal",
            value: `Batas bawah kualitas sinyal komunikasi.\n\nSkala 1-10:\n1. Tidak ada sinyal sama sekali\n2. Sinyal sangat lemah\n3. Sinyal hanya di basecamp\n4. Sinyal kadang muncul di jalur\n5. Sinyal cukup di beberapa titik\n6. Sinyal stabil di sebagian besar jalur\n7. Sinyal kuat di area kemah\n8. Sinyal sangat baik di seluruh jalur\n9. Sinyal optimal, bisa internet\n10. Sinyal sangat kuat, seperti di kota`,
          },
          {
            label: "Insiden Minimal",
            value: `Batas bawah tingkat keamanan insiden.\n\nSkala 1-10:\n1. Insiden sangat sering (kecelakaan, hilang)\n2. Insiden sering\n3. Insiden kadang terjadi\n4. Insiden jarang\n5. Insiden sangat jarang\n6. Hampir tidak ada insiden\n7. Tidak ada insiden dalam 2 tahun terakhir\n8. Tidak ada insiden dalam 5 tahun terakhir\n9. Tidak pernah ada insiden\n10. Data keamanan sempurna, tidak ada insiden sama sekali`,
          },
        ]}
      />
    </div>
  );
}

export default Explore;
