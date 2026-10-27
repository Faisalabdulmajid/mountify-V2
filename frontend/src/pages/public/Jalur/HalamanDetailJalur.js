import { getImageUrl } from "../../../utils/getImageUrl";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./HalamanDetailJalur.css";

const API_BASE_URL = "http://localhost:5000";
const DEFAULT_FALLBACK_IMAGE =
  "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify";


// Fallback yang benar: 0 dianggap valid, null/undefined/empty string baru fallback
function fallback(trail, keys, defaultValue = "-") {
  for (const key of keys) {
    const val = trail[key];
    if (val !== undefined && val !== null && !(typeof val === "string" && val.trim() === "")) {
      return val;
    }
  }
  return defaultValue;
}


// ...
export default function HalamanDetailJalur() {
  const { idJalur } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/jalur/${idJalur}`);
        if (!res.ok) throw new Error("Gagal memuat detail jalur");
        const json = await res.json();
        
        console.log("Received data:", json);
        
        // Handle both nested and flattened data structures
        let processedData;
        if (json.jalur && json.gunung) {
          // Nested structure - flatten it
          processedData = {
            ...json.jalur,
            ...json.gunung,
            penjelasan_field: json.penjelasan_field
          };
          console.log("Flattened nested data:", processedData);
        } else {
          // Already flattened structure
          processedData = json;
        }
        
        setData(processedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [idJalur]);

  if (loading)
    return <div className="detail-loading">Memuat detail jalur...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="detail-empty">Data tidak ditemukan.</div>;

  // Fallbacks untuk field utama

  // Mapping field sesuai response API (flattened)
  const namaJalur = fallback(data, ["nama_jalur"]);
  const namaGunung = fallback(data, ["nama_gunung"]);
  const ketinggian = fallback(data, ["ketinggian_puncak_mdpl"]);
  const lokasiPintuMasuk = fallback(data, ["lokasi_pintu_masuk"]);
  const statusJalur = fallback(data, ["status_jalur"]);
  const estimasiWaktu = fallback(data, ["estimasi_waktu_jam"]);
  const kesulitanSkala = fallback(data, ["kesulitan_skala"]);
  const keamananSkala = fallback(data, ["keamanan_skala"]);
  const kualitasFasilitas = fallback(data, ["kualitas_fasilitas_skala"]);
  const kualitasKemah = fallback(data, ["kualitas_kemah_skala"]);
  const keindahanPemandangan = fallback(data, ["keindahan_pemandangan_skala"]);
  const urlThumbnail = fallback(data, ["url_thumbnail"]);
  const deskripsi = fallback(data, ["deskripsi_jalur"]);
  const ketersediaanAir = fallback(data, ["ketersediaan_sumber_air_skala"]);
  const variasiLanskap = fallback(data, ["variasi_lanskap_skala"]);
  const perlindunganAngin = fallback(data, ["perlindungan_angin_kemah_skala"]);
  const jaringanKomunikasi = fallback(data, ["jaringan_komunikasi_skala"]);
  const tingkatInsiden = fallback(data, ["tingkat_insiden_skala"]);

  // Pastikan semua nilai sudah dalam format yang benar untuk rendering
  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") {
      console.warn("Found object value:", value);
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Fungsi untuk deskripsi sesuai nilai skala (contoh sederhana, bisa disesuaikan)
  function getDeskripsi(field, value) {
    if (value === null || value === undefined || value === "" || value === "-")
      return "";
    value = Number(value);
    if (isNaN(value)) return "";
    switch (field) {
      case "kesulitanSkala":
        if (value <= 2) return "Sangat mudah, jalur landai dan jelas.";
        if (value <= 4) return "Mudah, tanjakan sedang, jalur cukup jelas.";
        if (value <= 6) return "Sedang, tanjakan panjang, butuh tenaga ekstra.";
        if (value <= 8) return "Sulit, curam, butuh keahlian dan stamina.";
        return "Sangat sulit, mendekati vertikal, untuk pendaki berpengalaman.";
      case "keamananSkala":
        if (value <= 2) return "Berbahaya, banyak risiko longsor/jurang.";
        if (value <= 4) return "Cukup berisiko, beberapa titik rawan.";
        if (value <= 7) return "Cukup aman, ada beberapa titik waspada.";
        return "Aman, jalur terawat dan minim risiko.";
      case "kualitasFasilitas":
        if (value <= 3) return "Fasilitas sangat minim atau rusak.";
        if (value <= 6) return "Fasilitas cukup, ada basecamp dan toilet.";
        if (value <= 8) return "Fasilitas lengkap, basecamp terorganisir.";
        return "Fasilitas sangat lengkap dan modern.";
      case "kualitasKemah":
        if (value <= 3) return "Area kemah sempit, miring, atau berbatu.";
        if (value <= 6) return "Area kemah cukup, kapasitas sedang.";
        if (value <= 8) return "Area kemah luas dan nyaman.";
        return "Area kemah sangat luas dan aman.";
      case "keindahanPemandangan":
        if (value <= 3) return "Pemandangan terbatas, hutan rapat.";
        if (value <= 6) return "Ada beberapa titik pemandangan bagus.";
        if (value <= 8) return "Sebagian besar jalur terbuka, panoramik.";
        return "Pemandangan istimewa, fitur ikonik terkenal.";
      case "ketersediaanAir":
        if (value <= 2) return "Sumber air sangat langka/tidak ada.";
        if (value <= 6) return "Ada beberapa sumber air, musiman.";
        return "Sumber air melimpah di banyak titik.";
      case "variasiLanskap":
        if (value <= 3) return "Lanskap monoton, satu ekosistem saja.";
        if (value <= 6) return "Ada 2-3 transisi ekosistem.";
        return "Sangat bervariasi, banyak ekosistem berbeda.";
      case "perlindunganAngin":
        if (value <= 3) return "Area kemah sangat terekspos angin.";
        if (value <= 6) return "Cukup terlindungi, ada pepohonan/lembah.";
        return "Terlindungi, hutan lebat atau lembah dalam.";
      case "jaringanKomunikasi":
        if (value <= 2) return "Tidak ada sinyal setelah basecamp.";
        if (value <= 6) return "Sinyal hanya di titik tertentu.";
        return "Sinyal tersedia di sebagian besar jalur.";
      case "tingkatInsiden":
        if (value <= 3) return "Sering terjadi insiden, risiko tinggi.";
        if (value <= 7) return "Risiko insiden sedang, perlu waspada.";
        return "Risiko insiden sangat rendah/jarang.";
      default:
        return "";
    }
  }

  return (
    <div className="halaman-detail-jalur">
      {/* Hero Section */}
      <div className="detail-header">
        <img
          src={getImageUrl(urlThumbnail, DEFAULT_FALLBACK_IMAGE)}
          alt={namaJalur}
          className="detail-image"
          onError={(e) => (e.target.src = DEFAULT_FALLBACK_IMAGE)}
        />
        <div className="detail-title-info">
          <h1 className="jalur-title">{renderValue(namaJalur)}</h1>
          <div className="gunung-info-row">
            <span className="gunung-label">Gunung:</span>
            {namaGunung && data.id_gunung ? (
              <Link
                to={`/gunung/${data.id_gunung}`}
                className="gunung-value gunung-link"
              >
                {renderValue(namaGunung)}
              </Link>
            ) : (
              <span className="gunung-value">{renderValue(namaGunung)}</span>
            )}
          </div>
          
          {/* Quick Info Cards */}
          <div className="quick-info-grid">
            <div className="info-card">
              <div className="info-icon">⛰️</div>
              <div className="info-content">
                <span className="info-label">Ketinggian</span>
                <span className="info-value">
                  {ketinggian ? `${renderValue(ketinggian)} mdpl` : "-"}
                </span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">⏱️</div>
              <div className="info-content">
                <span className="info-label">Estimasi Waktu</span>
                <span className="info-value">
                  {estimasiWaktu ? `${renderValue(estimasiWaktu)} jam` : "-"}
                </span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <span className="info-label">Pintu Masuk</span>
                <span className="info-value">{renderValue(lokasiPintuMasuk)}</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🚦</div>
              <div className="info-content">
                <span className="info-label">Status</span>
                <span className={`info-value status-${(statusJalur || '').toLowerCase()}`}>
                  {renderValue(statusJalur)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Difficulty & Safety Scores */}
        <div className="score-section">
          <h3>Tingkat Kesulitan & Keamanan</h3>
          <div className="score-cards">
            <div className="score-card difficulty">
              <div className="score-header">
                <span className="score-icon">🎯</span>
                <span className="score-title">Kesulitan</span>
              </div>
              <div className="score-badge">{renderValue(kesulitanSkala)}/10</div>
              <div className="score-desc">{getDeskripsi("kesulitanSkala", kesulitanSkala)}</div>
            </div>
            
            <div className="score-card safety">
              <div className="score-header">
                <span className="score-icon">🛡️</span>
                <span className="score-title">Keamanan</span>
              </div>
              <div className="score-badge">{renderValue(keamananSkala)}/10</div>
              <div className="score-desc">{getDeskripsi("keamananSkala", keamananSkala)}</div>
            </div>
          </div>
        </div>

        {/* Facilities & Amenities */}
        <div className="facilities-section">
          <h3>Fasilitas & Amenitas</h3>
          <div className="facility-grid">
            {kualitasFasilitas && kualitasFasilitas !== "-" && (
              <div className="facility-item">
                <span className="facility-icon">🏕️</span>
                <div className="facility-info">
                  <span className="facility-name">Kualitas Fasilitas</span>
                  <div className="facility-rating">
                    <span className="rating-score">{renderValue(kualitasFasilitas)}/10</span>
                    <span className="rating-desc">{getDeskripsi("kualitasFasilitas", kualitasFasilitas)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {kualitasKemah && kualitasKemah !== "-" && (
              <div className="facility-item">
                <span className="facility-icon">⛺</span>
                <div className="facility-info">
                  <span className="facility-name">Area Kemah</span>
                  <div className="facility-rating">
                    <span className="rating-score">{renderValue(kualitasKemah)}/10</span>
                    <span className="rating-desc">{getDeskripsi("kualitasKemah", kualitasKemah)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {ketersediaanAir && ketersediaanAir !== "-" && (
              <div className="facility-item">
                <span className="facility-icon">💧</span>
                <div className="facility-info">
                  <span className="facility-name">Ketersediaan Air</span>
                  <div className="facility-rating">
                    <span className="rating-score">{renderValue(ketersediaanAir)}/10</span>
                    <span className="rating-desc">{getDeskripsi("ketersediaanAir", ketersediaanAir)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {perlindunganAngin && perlindunganAngin !== "-" && (
              <div className="facility-item">
                <span className="facility-icon">🌬️</span>
                <div className="facility-info">
                  <span className="facility-name">Perlindungan Angin</span>
                  <div className="facility-rating">
                    <span className="rating-score">{renderValue(perlindunganAngin)}/10</span>
                    <span className="rating-desc">{getDeskripsi("perlindunganAngin", perlindunganAngin)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scenery & Experience */}
        <div className="experience-section">
          <h3>Pemandangan & Pengalaman</h3>
          <div className="experience-grid">
            {keindahanPemandangan && keindahanPemandangan !== "-" && (
              <div className="experience-item">
                <span className="exp-icon">🌄</span>
                <div className="exp-info">
                  <span className="exp-name">Keindahan Pemandangan</span>
                  <div className="exp-rating">
                    <span className="rating-score">{renderValue(keindahanPemandangan)}/10</span>
                    <span className="rating-desc">{getDeskripsi("keindahanPemandangan", keindahanPemandangan)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {variasiLanskap && variasiLanskap !== "-" && (
              <div className="experience-item">
                <span className="exp-icon">🗻</span>
                <div className="exp-info">
                  <span className="exp-name">Variasi Lanskap</span>
                  <div className="exp-rating">
                    <span className="rating-score">{renderValue(variasiLanskap)}/10</span>
                    <span className="rating-desc">{getDeskripsi("variasiLanskap", variasiLanskap)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Communication & Safety */}
        <div className="safety-section">
          <h3>Komunikasi & Keselamatan</h3>
          <div className="safety-grid">
            {jaringanKomunikasi && jaringanKomunikasi !== "-" && (
              <div className="safety-item">
                <span className="safety-icon">📶</span>
                <div className="safety-info">
                  <span className="safety-name">Jaringan Komunikasi</span>
                  <div className="safety-rating">
                    <span className="rating-score">{renderValue(jaringanKomunikasi)}/10</span>
                    <span className="rating-desc">{getDeskripsi("jaringanKomunikasi", jaringanKomunikasi)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {tingkatInsiden && tingkatInsiden !== "-" && (
              <div className="safety-item">
                <span className="safety-icon">⚠️</span>
                <div className="safety-info">
                  <span className="safety-name">Tingkat Insiden</span>
                  <div className="safety-rating">
                    <span className="rating-score">{renderValue(tingkatInsiden)}/10</span>
                    <span className="rating-desc">{getDeskripsi("tingkatInsiden", tingkatInsiden)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      {deskripsi && deskripsi !== "-" && (
        <div className="description-section">
          <h3>Deskripsi Jalur</h3>
          <div className="description-content">
            <p>{renderValue(deskripsi)}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="navigation-section">
        <Link to="/explore" className="back-button">
          <span className="back-icon">←</span>
          Kembali ke Explore
        </Link>
        
        {namaGunung && data.id_gunung && (
          <Link to={`/gunung/${data.id_gunung}`} className="view-mountain-button">
            <span className="mountain-icon">🏔️</span>
            Lihat Detail {renderValue(namaGunung)}
          </Link>
        )}
      </div>
    </div>
  );
}
