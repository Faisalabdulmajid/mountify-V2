import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./HalamanDetailGunung.css"; // Kita akan buat file CSS ini

const API_BASE_URL = "http://localhost:5000";

function HalamanDetailGunung() {
  const { id_gunung } = useParams(); // Mengambil ID dari URL
  const location = useLocation();
  const [gunung, setGunung] = useState(location.state?.rekomendasi || null);
  const [isLoading, setIsLoading] = useState(
    location.state?.rekomendasi ? false : true
  );
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Jika sudah ada data rekomendasi dari state, tidak perlu fetch lagi
    if (location.state?.rekomendasi) return;
    setIsLoading(true);
    setError(null);
    // Fetch data detail gunung dari backend (sudah termasuk jalur pendakian)
    fetch(`${API_BASE_URL}/api/gunung/${id_gunung}`)
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Gagal memuat data gunung (status ${res.status})`;
          try {
            const data = await res.json();
            msg = data.message || msg;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        // Data gunung sudah termasuk jalur_pendakian dari backend
        // Mapping jalur_pendakian ke trails untuk kompatibilitas
        const processedData = { ...data, trails: data.jalur_pendakian || [] };

        setGunung(processedData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading mountain data:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [id_gunung, location.state]);

  // Tambahkan kembali fungsi utilitas deskripsi jika hilang
  const getDifficultyDescription = (v) => {
    if (v === undefined || v === null) return "-";
    v = Number(v);
    if (v <= 2) return "Sangat Mudah (1-2)";
    if (v <= 4) return "Mudah (3-4)";
    if (v <= 6) return "Sedang (5-6)";
    if (v <= 8) return "Sulit (7-8)";
    if (v <= 10) return "Ekstrem (9-10)";
    return `Level ${v}`;
  };
  const getEstimationDescription = (v) => {
    if (v === undefined || v === null) return "-";
    v = Number(v);
    if (v <= 8) return "Pendakian Singkat (<8 jam)";
    if (v <= 16) return "1 Hari (8-16 jam)";
    if (v <= 30) return "2 Hari 1 Malam (17-30 jam)";
    if (v <= 48) return "2-3 Hari (31-48 jam)";
    if (v <= 72) return "Ekspedisi (>48 jam)";
    return `${v} jam`;
  };

  if (isLoading) {
    return <div className="loading-container">Memuat informasi gunung...</div>;
  }

  if (error) {
    return <div className="loading-container">{error}</div>;
  }

  if (!gunung) {
    return (
      <div className="loading-container">Informasi gunung tidak ditemukan.</div>
    );
  }

  // Fallback untuk field utama agar robust jika data dari API
  const namaGunung =
    gunung.name || gunung.nama_gunung || gunung.nama || gunung.namaGunung;
  const lokasi =
    gunung.location ||
    gunung.lokasi_administratif ||
    gunung.lokasi ||
    gunung.lokasiGunung;
  const ketinggian =
    gunung.elevation ||
    gunung.ketinggian ||
    gunung.ketinggian_puncak_mdpl ||
    gunung.ketinggian_mdpl;
  const headerImage =
    gunung.headerImageUrl ||
    gunung.url_thumbnail ||
    gunung.thumbnail ||
    gunung.gambar;
  const deskripsi = gunung.description || gunung.deskripsi || gunung.ringkasan;
  const trails =
    gunung.trails ||
    gunung.jalur_pendakian ||
    gunung.jalur ||
    gunung.jalur_terbaik ||
    [];

  // Tambahan info dari hasil rekomendasi (jika ada)
  const jumlahJalur =
    gunung.jumlah_jalur || (Array.isArray(trails) ? trails.length : undefined);
  const skorTertinggi =
    gunung.skor_tertinggi || gunung.skor || gunung.skorTertinggi;
  const kategoriRekomendasi = gunung.kategori_rekomendasi;
  // const gallery = gunung.gallery || gunung.galeri || gunung.foto || [];

  // Fungsi untuk menampilkan lokasi administratif tanpa pengulangan provinsi
  function formatLokasiUnik(lokasi) {
    if (!lokasi || lokasi.trim() === "") return "Lokasi belum diperbarui";
    // Pisahkan berdasarkan ;
    const parts = lokasi
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Lokasi belum diperbarui";

    // Ambil nama kabupaten/kota saja jika provinsi sama
    const provinsiSet = new Set();
    const kabupatenList = [];
    parts.forEach((item) => {
      // Contoh: KABUPATEN WONOSOBO, JAWA TENGAH
      const [kab, prov] = item.split(",").map((s) => s.trim());
      if (prov && !provinsiSet.has(prov)) {
        provinsiSet.add(prov);
        kabupatenList.push(item); // tampilkan kabupaten + provinsi pertama
      } else if (prov && provinsiSet.has(prov)) {
        kabupatenList.push(kab); // hanya tampilkan kabupaten/kota saja
      } else {
        kabupatenList.push(item); // fallback
      }
    });
    return kabupatenList.join(", ");
  }

  return (
    <div className="detail-gunung-page">
      <header
        className="gunung-header"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <div className="header-overlay">
          <h1>{namaGunung}</h1>
          <p>{formatLokasiUnik(lokasi)}</p>
        </div>
      </header>
      <main className="gunung-content-container">
        {/* Info Cepat */}
        <section className="info-cepat-panel">
          <div className="info-item">
            <i className="bi bi-geo-alt-fill"></i>
            <span>LOKASI</span>
            <p>{formatLokasiUnik(lokasi)}</p>
          </div>
          <div className="info-item">
            <i className="bi bi-graph-up"></i>
            <span>KETINGGIAN</span>
            <p>{ketinggian ? ketinggian.toLocaleString() : "-"} mdpl</p>
          </div>
          {/* Estimasi biaya dihapus dari panel info cepat */}
          <div className="info-item">
            <i className="bi bi-signpost"></i>
            <span>JUMLAH JALUR</span>
            <p>{jumlahJalur !== undefined ? jumlahJalur : "-"}</p>
          </div>
          <div className="info-item">
            <i className="bi bi-star-fill"></i>
            <span>SKOR TERTINGGI</span>
            <p>
              {skorTertinggi !== undefined
                ? skorTertinggi.toFixed
                  ? skorTertinggi.toFixed(1)
                  : skorTertinggi
                : "-"}
            </p>
          </div>
          <div className="info-item">
            <i className="bi bi-award"></i>
            <span>KATEGORI</span>
            <p>{kategoriRekomendasi || "-"}</p>
          </div>
        </section>

        {/* Deskripsi */}
        <section className="content-section">
          <h2>Tentang {namaGunung}</h2>
          {deskripsi ? (
            <p className="gunung-description">{deskripsi}</p>
          ) : (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <p style={{ margin: "0", color: "#6c757d", fontStyle: "italic" }}>
                Deskripsi untuk {namaGunung} belum tersedia. Informasi detail
                gunung sedang dalam proses pengumpulan.
              </p>
            </div>
          )}
        </section>

        {/* Jalur Pendakian */}
        <section className="content-section">
          <h2>Jalur Pendakian</h2>
          <div className="jalur-list">
            {Array.isArray(trails) && trails.length > 0 ? (
              trails.map((jalur, index) => (
                <div
                  key={index}
                  className="jalur-card clickable"
                  onClick={() => navigate(`/jalur/${jalur.id_jalur}`)}
                  style={{ cursor: "pointer" }}
                  title="Lihat detail jalur"
                >
                  <h3>{jalur.name || jalur.nama || jalur.nama_jalur}</h3>
                  <p>
                    <strong>Estimasi:</strong>{" "}
                    {getEstimationDescription(
                      jalur.estimasi_waktu_jam ||
                        jalur.duration ||
                        jalur.estimasi ||
                        jalur.durasi
                    )}
                  </p>
                  <p>
                    <strong>Kesulitan:</strong>{" "}
                    {getDifficultyDescription(
                      jalur.kesulitan_skala ||
                        jalur.difficulty ||
                        jalur.kesulitan
                    )}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <strong>Estimasi Biaya:</strong>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      <li>
                        PP:{" "}
                        {jalur.biaya_pulang_pergi || jalur.biaya_pp
                          ? `Rp ${Number(
                              jalur.biaya_pulang_pergi || jalur.biaya_pp
                            ).toLocaleString()}`
                          : "-"}
                      </li>
                      <li>
                        Simaksi:{" "}
                        {jalur.biaya_simaksi
                          ? `Rp ${Number(jalur.biaya_simaksi).toLocaleString()}`
                          : "-"}
                      </li>
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "2px dashed #dee2e6",
                }}
              >
                <i
                  className="bi bi-info-circle"
                  style={{
                    fontSize: "24px",
                    color: "#6c757d",
                    marginBottom: "10px",
                  }}
                ></i>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontWeight: "600",
                    color: "#495057",
                  }}
                >
                  Belum ada data jalur pendakian
                </p>
                <p style={{ margin: "0", fontSize: "14px", color: "#6c757d" }}>
                  Data jalur pendakian untuk {namaGunung} sedang dalam proses
                  pengumpulan dan verifikasi.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Galeri Foto dihilangkan sesuai permintaan */}
      </main>
    </div>
  );
}

export default HalamanDetailGunung;
