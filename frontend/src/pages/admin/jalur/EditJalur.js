// src/pages/admin/jalur/EditJalur.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./TambahJalur.css";
import PageHeaderBack from "./components/PageHeaderBack";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Konstanta enum status jalur - harus sama dengan backend
const TRAIL_STATUS_OPTIONS = [
  "Belum Diketahui",
  "Buka",
  "Tutup Sementara",
  "Tutup",
];

// scoreMappings sesuai standar fuzzy engine dari laporan detail
const scoreMappings = {
  // 1. Tingkat Kesulitan & Durasi
  medan: {
    "Belum Diketahui": null,
    "Sangat Mudah (0-2): Jalur landai, setapak jelas": 1,
    "Mudah (3-4): Tanjakan sedang, bebatuan kecil": 3,
    "Sedang (5-6): Tanjakan panjang, butuh bantuan tangan": 5,
    "Sulit (7-8): Sangat curam >45°, scrambling": 7,
    "Sangat Sulit (9-10): Mendekati vertikal, butuh keahlian panjat": 9,
  },

  // 2. Keamanan & Risiko
  navigasi: {
    "Belum Diketahui": null,
    "Aman (7-10): Jalur jelas, terawat, jauh dari risiko": 9,
    "Cukup Aman (4-6): Beberapa titik waspada, jalur aman": 6,
    "Berbahaya (0-3): Riwayat longsor, kawah aktif, jurang tanpa pengaman": 2,
  },
  risiko_tambahan: {
    "Belum Diketahui": null,
    "Rendah/Jarang (8-10): <5 insiden SAR per tahun": 9,
    "Sedang (4-7): 5-10 insiden per tahun": 6,
    "Tinggi/Sering (0-3): >10 insiden SAR per tahun": 2,
  },

  // 3. Kenyamanan & Logistik - Fasilitas
  basecamp: {
    "Belum Diketahui": null,
    "Sangat Lengkap (9-10): Fasilitas modern, penginapan, persewaan alat": 9,
    "Lengkap (6-8): Basecamp terorganisir, pusat info, mushola, warung": 7,
    "Cukup (3-5): Basecamp sederhana, toilet umum, warung kecil": 5,
    "Sangat Minim (0-2): Tidak ada basecamp resmi, pendaftaran di rumah warga": 1,
  },
  sumber_air: {
    "Belum Diketahui": null,
    "Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos": 9,
    "Terbatas (3-6): 1-3 titik sumber air, mungkin musiman": 5,
    "Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp": 1,
  },

  // 4. Kenyamanan & Logistik - Area Kemah
  lahan_kemah: {
    "Belum Diketahui": null,
    "Baik (7-10): Lahan luas, datar, bersih, sumber air dekat <5 menit": 9,
    "Cukup (4-6): Lahan untuk 5-10 tenda, sumber air <30 menit": 6,
    "Buruk (0-3): Lahan miring, berbatu, sempit, sumber air >1 jam": 2,
  },
  perlindungan_kemah: {
    "Belum Diketahui": null,
    "Terlindungi (7-10): Dalam hutan lebat atau lembah dalam": 9,
    "Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan": 6,
    "Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang": 2,
  },

  // 5. Kualitas Pengalaman & Lingkungan
  lanskap: {
    "Belum Diketahui": null,
    "Sangat Bervariasi (7-10): >3 ekosistem berbeda": 9,
    "Cukup Bervariasi (4-6): 2-3 transisi ekosistem": 6,
    "Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir": 2,
  },
  viewpoint: {
    "Belum Diketahui": null,
    "Istimewa/Ikonik (9-10): Panoramik 360°, fitur ikonik terkenal": 9,
    "Sangat Indah/Panoramik (7-8): Sebagian besar jalur terbuka": 7,
    "Indah/Terbuka Sebagian (4-6): Beberapa titik dengan pemandangan bagus": 5,
    "Biasa/Terbatas (0-3): Hutan rapat, pemandangan hanya di puncak": 2,
  },

  // 6. Logistik & Risiko Tambahan
  jaringan_komunikasi: {
    "Belum Diketahui": null,
    "Baik (7-10): Sinyal tersedia di sebagian besar jalur": 9,
    "Terbatas (3-6): Sinyal hanya di titik tertentu": 5,
    "Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp": 1,
  },
};

const findClosestKey = (mapping, score) => {
  if (score === 0 || score === null || score === undefined)
    return "Belum Diketahui";
  return Object.keys(mapping).reduce((prev, curr) => {
    if (mapping[curr] === null) return prev;
    if (mapping[prev] === null) return curr;
    return Math.abs(mapping[curr] - score) < Math.abs(mapping[prev] - score)
      ? curr
      : prev;
  });
};

function EditJalur() {
  // eslint-disable-next-line no-unused-vars
  const [tarifPerKm, setTarifPerKm] = useState(2000);
  const navigate = useNavigate();
  const { id_jalur } = useParams();
  const [gunungList, setGunungList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tambahan: mode input koordinat dan state koordinat
  const [coordinateMode, setCoordinateMode] = useState("geocoding"); // "geocoding" atau "manual"
  const [coordinateState, setCoordinateState] = useState({
    latitude: "",
    longitude: "",
    coordinate_source: "geocoding",
    alamat: "",
    geocodeLoading: false,
    geocodeError: "",
  });

  // State untuk multiple biaya PP berdasarkan kota asal
  const [biayaPPByCity, setBiayaPPByCity] = useState([{ kota: "", biaya: "" }]);
  const [useCityBasedPP, setUseCityBasedPP] = useState(false);

  // Tambahkan field fuzzy engine pada state generalData
  const [generalData, setGeneralData] = useState({
    id_gunung: "",
    nama_jalur: "",
    lokasi_pintu_masuk: "",
    estimasi_waktu_jam: "",
    deskripsi_jalur: "",
    status_jalur: "Belum Diketahui",
    ketersediaan_sumber_air_skala: "",
    variasi_lanskap_skala: "",
    perlindungan_angin_kemah_skala: "",
    jaringan_komunikasi_skala: "",
    tingkat_insiden_skala: "",
    biaya_simaksi: "",
    biaya_pulang_pergi: "",
  });
  // Handler untuk mode input koordinat
  const handleCoordinateModeChange = (e) => {
    const mode = e.target.value;
    setCoordinateMode(mode);
    setCoordinateState((prev) => ({
      ...prev,
      coordinate_source: mode,
      geocodeError: "",
    }));
  };

  // Handler input manual koordinat
  const handleCoordinateInput = (e) => {
    setCoordinateState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handler input alamat geocoding
  const handleAlamatChange = (e) => {
    setCoordinateState((prev) => ({ ...prev, alamat: e.target.value }));
  };

  // Fetch koordinat dari Nominatim
  const handleGeocode = async () => {
    if (!coordinateState.alamat) {
      setCoordinateState((prev) => ({
        ...prev,
        geocodeError: "Alamat harus diisi.",
      }));
      return;
    }
    setCoordinateState((prev) => ({
      ...prev,
      geocodeLoading: true,
      geocodeError: "",
    }));
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        coordinateState.alamat
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoordinateState((prev) => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon,
          geocodeError: "",
        }));
      } else {
        setCoordinateState((prev) => ({
          ...prev,
          geocodeError: "Alamat tidak ditemukan.",
        }));
      }
    } catch (err) {
      setCoordinateState((prev) => ({
        ...prev,
        geocodeError: "Gagal fetch koordinat.",
      }));
    } finally {
      setCoordinateState((prev) => ({ ...prev, geocodeLoading: false }));
    }
  };

  const [descriptiveScores, setDescriptiveScores] = useState({
    medan: "Belum Diketahui",
    navigasi: "Belum Diketahui",
    risiko_tambahan: "Belum Diketahui",
    basecamp: "Belum Diketahui",
    sumber_air: "Belum Diketahui",
    lahan_kemah: "Belum Diketahui",
    perlindungan_kemah: "Belum Diketahui",
    lanskap: "Belum Diketahui",
    viewpoint: "Belum Diketahui",
    jaringan_komunikasi: "Belum Diketahui",
  });

  useEffect(() => {
    // Fetch daftar gunung, data jalur, dan tarif per km
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [gunungResponse, jalurResponse, tarifResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/gunung`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/admin/jalur/${id_jalur}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/settings/tarif_per_km`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!gunungResponse.ok) throw new Error("Gagal memuat daftar gunung.");
        if (!jalurResponse.ok) throw new Error("Gagal memuat data jalur.");

        const gunungData = await gunungResponse.json();
        const jalurData = await jalurResponse.json();
        let tarif = 2000;
        if (tarifResponse.ok) {
          const tarifData = await tarifResponse.json();
          tarif = Number(tarifData.value);
        }
        setTarifPerKm(tarif);

        setGunungList(gunungData);
        setGeneralData({
          id_gunung: jalurData.id_gunung,
          nama_jalur: jalurData.nama_jalur,
          lokasi_pintu_masuk: jalurData.lokasi_pintu_masuk || "",
          estimasi_waktu_jam: jalurData.estimasi_waktu_jam,
          deskripsi_jalur: jalurData.deskripsi_jalur || "",
          status_jalur: jalurData.status_jalur || "Belum Diketahui",
          ketersediaan_sumber_air_skala:
            jalurData.ketersediaan_sumber_air_skala || "",
          variasi_lanskap_skala: jalurData.variasi_lanskap_skala || "",
          perlindungan_angin_kemah_skala:
            jalurData.perlindungan_angin_kemah_skala || "",
          jaringan_komunikasi_skala: jalurData.jaringan_komunikasi_skala || "",
          tingkat_insiden_skala: jalurData.tingkat_insiden_skala || "",
          biaya_simaksi: Number(jalurData.biaya_simaksi) || 0,
          biaya_pp: jalurData.biaya_pulang_pergi || "",
        });

        // Parse biaya PP berdasarkan kota jika ada
        if (jalurData.biaya_pp_by_city) {
          try {
            const cityData = JSON.parse(jalurData.biaya_pp_by_city);
            const cityArray = Object.entries(cityData).map(([kota, biaya]) => ({
              kota,
              biaya: biaya.toString(),
            }));
            setBiayaPPByCity(
              cityArray.length > 0 ? cityArray : [{ kota: "", biaya: "" }]
            );
            setUseCityBasedPP(jalurData.use_city_based_pp || false);
          } catch (e) {
            console.error("Error parsing biaya_pp_by_city:", e);
            setBiayaPPByCity([{ kota: "", biaya: "" }]);
            setUseCityBasedPP(false);
          }
        }

        setDescriptiveScores({
          medan: findClosestKey(scoreMappings.medan, jalurData.kesulitan_skala),
          navigasi: findClosestKey(
            scoreMappings.navigasi,
            jalurData.keamanan_skala
          ),
          risiko_tambahan: findClosestKey(
            scoreMappings.risiko_tambahan,
            jalurData.keamanan_skala
          ),
          basecamp: findClosestKey(
            scoreMappings.basecamp,
            jalurData.kualitas_fasilitas_skala
          ),
          sumber_air: findClosestKey(
            scoreMappings.sumber_air,
            jalurData.kualitas_fasilitas_skala
          ),
          lahan_kemah: findClosestKey(
            scoreMappings.lahan_kemah,
            jalurData.kualitas_kemah_skala
          ),
          perlindungan_kemah: findClosestKey(
            scoreMappings.perlindungan_kemah,
            jalurData.kualitas_kemah_skala
          ),
          lanskap: findClosestKey(
            scoreMappings.lanskap,
            jalurData.keindahan_pemandangan_skala
          ),
          viewpoint: findClosestKey(
            scoreMappings.viewpoint,
            jalurData.keindahan_pemandangan_skala
          ),
          jaringan_komunikasi: findClosestKey(
            scoreMappings.jaringan_komunikasi,
            jalurData.keamanan_skala
          ),
        });
      } catch (error) {
        await Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545",
        });
        setTimeout(() => navigate("/admin/jalur"), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_jalur, navigate]);

  const handleGeneralChange = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDescriptiveChange = (e) => {
    setDescriptiveScores((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handler untuk biaya PP berdasarkan kota
  const handleCityPPChange = (index, field, value) => {
    const newBiayaPPByCity = [...biayaPPByCity];
    newBiayaPPByCity[index][field] = value;
    setBiayaPPByCity(newBiayaPPByCity);
  };

  const addCityPP = () => {
    setBiayaPPByCity([...biayaPPByCity, { kota: "", biaya: "" }]);
  };

  const removeCityPP = (index) => {
    if (biayaPPByCity.length > 1) {
      const newBiayaPPByCity = biayaPPByCity.filter((_, i) => i !== index);
      setBiayaPPByCity(newBiayaPPByCity);
    }
  };
  const calculateFinalScores = () => {
    const calculateAverage = (scoreKeys) => {
      const validScores = scoreKeys
        .map((key) => scoreMappings[key][descriptiveScores[key]])
        .filter((score) => score !== null);
      if (validScores.length === 0) return 0;
      const sum = validScores.reduce((acc, score) => acc + score, 0);
      return Math.round(sum / validScores.length);
    };
    return {
      kesulitan_skala: calculateAverage(["medan"]),
      keamanan_skala: calculateAverage([
        "navigasi",
        "risiko_tambahan",
        "jaringan_komunikasi",
      ]),
      kualitas_fasilitas_skala: calculateAverage(["basecamp", "sumber_air"]),
      kualitas_kemah_skala: calculateAverage([
        "lahan_kemah",
        "perlindungan_kemah",
      ]),
      keindahan_pemandangan_skala: calculateAverage(["lanskap", "viewpoint"]),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EditJalur: handleSubmit called");
    setIsLoading(true);

    const finalScores = calculateFinalScores();
    // Biaya PP akan dihitung otomatis di backend berdasarkan koordinat
    let biayaPP = Number(generalData.biaya_pp || 0);

    // Siapkan data biaya PP berdasarkan mode yang dipilih
    let biayaPPData = {};
    if (useCityBasedPP) {
      // Format: { "Jakarta": 150000, "Tasikmalaya": 50000 }
      biayaPPData = biayaPPByCity.reduce((acc, item) => {
        if (item.kota && item.biaya) {
          acc[item.kota] = Number(item.biaya);
        }
        return acc;
      }, {});
    }

    const dataToSend = {
      ...generalData,
      ...finalScores,
      biaya_simaksi: generalData.biaya_simaksi,
      biaya_pulang_pergi: biayaPP,
      biaya_pp_by_city: useCityBasedPP ? JSON.stringify(biayaPPData) : null,
      use_city_based_pp: useCityBasedPP,
      estimasi_biaya: biayaPP, // Remove SIMAKSI from total estimation since it's now complex object
      latitude: coordinateState.latitude || null,
      longitude: coordinateState.longitude || null,
      coordinate_source: coordinateState.coordinate_source,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jalur/${id_jalur}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      console.log("EditJalur: Update successful, showing SweetAlert");
      await Swal.fire({
        title: "Berhasil!",
        text: "Data jalur berhasil diperbarui!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#28a745",
      });
      console.log("EditJalur: SweetAlert closed");

      navigate("/admin/jalur", { replace: true });
      window.location.reload();
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.message || "Terjadi kesalahan saat memperbarui data.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelect = (label, name, options) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={descriptiveScores[name] || "Belum Diketahui"}
        onChange={handleDescriptiveChange}
        disabled={isLoading}
      >
        {Object.keys(options).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  if (isLoading)
    return <div className="loading-container">Memuat data jalur...</div>;

  return (
    <div className="add-jalur-page">
      <PageHeaderBack
        title={`Edit Data Jalur: ${generalData.nama_jalur}`}
        backText="Kembali"
        backLink="/admin/jalur"
      />
      <form onSubmit={handleSubmit} className="form-widget-jalur">
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Informasi Dasar</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="id_gunung">Pilih Gunung</label>
              <select
                id="id_gunung"
                name="id_gunung"
                value={generalData.id_gunung}
                onChange={handleGeneralChange}
                required
              >
                {gunungList.map((g) => (
                  <option key={g.id_gunung} value={g.id_gunung}>
                    {g.nama_gunung}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="nama_jalur">Nama Jalur</label>
              <input
                type="text"
                id="nama_jalur"
                name="nama_jalur"
                value={generalData.nama_jalur}
                onChange={handleGeneralChange}
                required
              />
            </div>
          </div>

          {/* Field Pintu Masuk */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="lokasi_pintu_masuk">
                Lokasi Pintu Masuk/Gerbang
              </label>
              <input
                type="text"
                id="lokasi_pintu_masuk"
                name="lokasi_pintu_masuk"
                value={generalData.lokasi_pintu_masuk}
                onChange={handleGeneralChange}
                placeholder="Contoh: Desa Kertawangi, Pos Jaga Cibodas"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimasi_waktu_jam">Estimasi Waktu (Jam)</label>
              <input
                type="number"
                id="estimasi_waktu_jam"
                name="estimasi_waktu_jam"
                value={generalData.estimasi_waktu_jam}
                onChange={handleGeneralChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status_jalur">Status Jalur</label>
              <select
                id="status_jalur"
                name="status_jalur"
                value={generalData.status_jalur}
                onChange={handleGeneralChange}
              >
                {TRAIL_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field Biaya Simaksi dan Biaya PP */}
          <div className="form-row">
            <div className="form-group">
              <label>Biaya SIMAKSI (Rp)</label>
              <input
                type="number"
                name="biaya_simaksi"
                value={generalData.biaya_simaksi || ""}
                onChange={handleGeneralChange}
                placeholder="Masukkan biaya SIMAKSI"
                min="0"
                step="1000"
              />
            </div>
            <div className="form-group">
              <label>Biaya PP (Transportasi, Rp)</label>

              {/* Info box about smart checking */}
              <div
                style={{
                  background: "#e8f4fd",
                  border: "1px solid #bee5eb",
                  padding: 10,
                  borderRadius: 4,
                  marginBottom: 12,
                  fontSize: 13,
                  color: "#0c5460",
                }}
              >
                💡 <strong>Sistem Pintar:</strong> Jika tidak ada data manual
                yang diisi, sistem akan otomatis menghitung biaya PP berdasarkan
                koordinat jalur.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <input
                    type="radio"
                    name="pp_mode"
                    checked={!useCityBasedPP}
                    onChange={() => setUseCityBasedPP(false)}
                  />
                  <span>Otomatis (berdasarkan koordinat)</span>
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <input
                    type="radio"
                    name="pp_mode"
                    checked={useCityBasedPP}
                    onChange={() => setUseCityBasedPP(true)}
                  />
                  <span>Manual (berdasarkan kota asal)</span>
                </label>
              </div>

              {/* Mode Otomatis */}
              {!useCityBasedPP && (
                <input
                  type="number"
                  id="biaya_pp"
                  name="biaya_pp"
                  value={generalData.biaya_pp}
                  onChange={handleGeneralChange}
                  placeholder="Kosongkan untuk perhitungan otomatis berdasarkan koordinat"
                  min="0"
                  step="1000"
                />
              )}

              {/* Mode Manual Berdasarkan Kota */}
              {useCityBasedPP && (
                <div
                  style={{
                    border: "1px solid #ddd",
                    padding: 12,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: 14 }}>
                      Biaya PP dari berbagai kota:
                    </span>
                    <button
                      type="button"
                      onClick={addCityPP}
                      style={{
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      + Tambah Kota
                    </button>
                  </div>

                  {biayaPPByCity.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Nama kota (misal: Jakarta)"
                        value={item.kota}
                        onChange={(e) =>
                          handleCityPPChange(index, "kota", e.target.value)
                        }
                        style={{
                          flex: 1,
                          padding: 6,
                          border: "1px solid #ccc",
                          borderRadius: 3,
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Biaya PP (Rp)"
                        value={item.biaya}
                        onChange={(e) =>
                          handleCityPPChange(index, "biaya", e.target.value)
                        }
                        min="0"
                        step="1000"
                        style={{
                          flex: 1,
                          padding: 6,
                          border: "1px solid #ccc",
                          borderRadius: 3,
                        }}
                      />
                      {biayaPPByCity.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCityPP(index)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}

                  <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                    <strong>Contoh:</strong> Jakarta - Rp 150.000, Tasikmalaya -
                    Rp 50.000, Bandung - Rp 75.000
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Koordinat Basecamp */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Koordinat Basecamp</label>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <label>
                  <input
                    type="radio"
                    name="coordinate_mode"
                    value="geocoding"
                    checked={coordinateMode === "geocoding"}
                    onChange={handleCoordinateModeChange}
                    disabled={isLoading}
                  />
                  <span style={{ marginLeft: 4 }}>Otomatis (Geocoding 🌐)</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="coordinate_mode"
                    value="manual"
                    checked={coordinateMode === "manual"}
                    onChange={handleCoordinateModeChange}
                    disabled={isLoading}
                  />
                  <span style={{ marginLeft: 4 }}>Manual (✍️)</span>
                </label>
              </div>
              {coordinateMode === "geocoding" ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    name="alamat"
                    value={coordinateState.alamat}
                    onChange={handleAlamatChange}
                    placeholder="Masukkan alamat basecamp, misal: Basecamp Cibodas, Cianjur"
                    style={{ flex: 2 }}
                    disabled={isLoading || coordinateState.geocodeLoading}
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={isLoading || coordinateState.geocodeLoading}
                    style={{ flex: 1 }}
                  >
                    {coordinateState.geocodeLoading
                      ? "Mencari..."
                      : "Cari Koordinat"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    name="latitude"
                    value={coordinateState.latitude}
                    onChange={handleCoordinateInput}
                    placeholder="Latitude"
                    style={{ flex: 1 }}
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    name="longitude"
                    value={coordinateState.longitude}
                    onChange={handleCoordinateInput}
                    placeholder="Longitude"
                    style={{ flex: 1 }}
                    disabled={isLoading}
                  />
                </div>
              )}
              {/* Tampilkan hasil koordinat dan error */}
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: coordinateState.geocodeError ? "red" : "#333",
                }}
              >
                {coordinateState.latitude &&
                  coordinateState.longitude &&
                  !coordinateState.geocodeError && (
                    <span>
                      Koordinat:{" "}
                      <b>
                        {coordinateState.latitude}, {coordinateState.longitude}
                      </b>{" "}
                      {coordinateMode === "geocoding" ? "🌐" : "✍️"}
                    </span>
                  )}
                {coordinateState.geocodeError && (
                  <span>{coordinateState.geocodeError}</span>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Field tambahan dengan dropdown deskriptif */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ketersediaan_sumber_air_skala">
              Ketersediaan Sumber Air (0-10)
            </label>
            <select
              id="ketersediaan_sumber_air_skala"
              name="ketersediaan_sumber_air_skala"
              value={findClosestKey(
                scoreMappings.sumber_air,
                generalData.ketersediaan_sumber_air_skala
              )}
              onChange={(e) => {
                const descriptiveValue = e.target.value;
                const numericValue = scoreMappings.sumber_air[descriptiveValue];
                setGeneralData((prev) => ({
                  ...prev,
                  ketersediaan_sumber_air_skala: numericValue,
                }));
              }}
              required
            >
              {Object.keys(scoreMappings.sumber_air).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="variasi_lanskap_skala">
              Variasi Lanskap (0-10)
            </label>
            <select
              id="variasi_lanskap_skala"
              name="variasi_lanskap_skala"
              value={findClosestKey(
                scoreMappings.lanskap,
                generalData.variasi_lanskap_skala
              )}
              onChange={(e) => {
                const descriptiveValue = e.target.value;
                const numericValue = scoreMappings.lanskap[descriptiveValue];
                setGeneralData((prev) => ({
                  ...prev,
                  variasi_lanskap_skala: numericValue,
                }));
              }}
              required
            >
              {Object.keys(scoreMappings.lanskap).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="perlindungan_angin_kemah_skala">
              Perlindungan Angin Kemah (0-10)
            </label>
            <select
              id="perlindungan_angin_kemah_skala"
              name="perlindungan_angin_kemah_skala"
              value={findClosestKey(
                scoreMappings.perlindungan_kemah,
                generalData.perlindungan_angin_kemah_skala
              )}
              onChange={(e) => {
                const descriptiveValue = e.target.value;
                const numericValue =
                  scoreMappings.perlindungan_kemah[descriptiveValue];
                setGeneralData((prev) => ({
                  ...prev,
                  perlindungan_angin_kemah_skala: numericValue,
                }));
              }}
              required
            >
              {Object.keys(scoreMappings.perlindungan_kemah).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="jaringan_komunikasi_skala">
              Jaringan Komunikasi (0-10)
            </label>
            <select
              id="jaringan_komunikasi_skala"
              name="jaringan_komunikasi_skala"
              value={findClosestKey(
                scoreMappings.jaringan_komunikasi,
                generalData.jaringan_komunikasi_skala
              )}
              onChange={(e) => {
                const descriptiveValue = e.target.value;
                const numericValue =
                  scoreMappings.jaringan_komunikasi[descriptiveValue];
                setGeneralData((prev) => ({
                  ...prev,
                  jaringan_komunikasi_skala: numericValue,
                }));
              }}
              required
            >
              {Object.keys(scoreMappings.jaringan_komunikasi).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tingkat_insiden_skala">
              Tingkat Insiden (0-10)
            </label>
            <select
              id="tingkat_insiden_skala"
              name="tingkat_insiden_skala"
              value={findClosestKey(
                scoreMappings.risiko_tambahan,
                generalData.tingkat_insiden_skala
              )}
              onChange={(e) => {
                const descriptiveValue = e.target.value;
                const numericValue =
                  scoreMappings.risiko_tambahan[descriptiveValue];
                setGeneralData((prev) => ({
                  ...prev,
                  tingkat_insiden_skala: numericValue,
                }));
              }}
              required
            >
              {Object.keys(scoreMappings.risiko_tambahan).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ... sisa form tidak berubah ... */}
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Parameter Penilaian</legend>
          <div className="descriptive-grid">
            <div className="parameter-group">
              <h4>Tingkat Kesulitan</h4>
              {renderSelect("Medan & Tanjakan", "medan", scoreMappings.medan)}
            </div>
            <div className="parameter-group">
              <h4>Tingkat Keamanan</h4>
              {renderSelect(
                "Navigasi & Petunjuk Arah",
                "navigasi",
                scoreMappings.navigasi
              )}
              {renderSelect(
                "Tingkat Insiden & Risiko",
                "risiko_tambahan",
                scoreMappings.risiko_tambahan
              )}
              {renderSelect(
                "Jaringan Komunikasi",
                "jaringan_komunikasi",
                scoreMappings.jaringan_komunikasi
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Fasilitas</h4>
              {renderSelect(
                "Fasilitas Basecamp",
                "basecamp",
                scoreMappings.basecamp
              )}
              {renderSelect(
                "Sumber Air di Jalur",
                "sumber_air",
                scoreMappings.sumber_air
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Area Kemah</h4>
              {renderSelect(
                "Lahan & Kapasitas Kemah",
                "lahan_kemah",
                scoreMappings.lahan_kemah
              )}
              {renderSelect(
                "Perlindungan dari Angin",
                "perlindungan_kemah",
                scoreMappings.perlindungan_kemah
              )}
            </div>
            <div className="parameter-group">
              <h4>Keindahan Pemandangan</h4>
              {renderSelect(
                "Variasi Lanskap",
                "lanskap",
                scoreMappings.lanskap
              )}
              {renderSelect(
                "Spot Pemandangan (Viewpoint)",
                "viewpoint",
                scoreMappings.viewpoint
              )}
            </div>
          </div>
        </fieldset>
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Deskripsi Tambahan</legend>
          <div className="form-group full-width">
            <label htmlFor="deskripsi_jalur">Deskripsi Singkat Jalur</label>
            <textarea
              id="deskripsi_jalur"
              name="deskripsi_jalur"
              rows="5"
              value={generalData.deskripsi_jalur}
              onChange={handleGeneralChange}
            ></textarea>
          </div>
        </fieldset>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/jalur")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditJalur;
