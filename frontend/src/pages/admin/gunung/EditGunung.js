// src/pages/admin/gunung/EditGunung.js (Dengan Toast Notification)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// PERUBAHAN 1: Impor library toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditGunung.css";
import PageHeaderBack from "./components/PageHeaderBack";
import wilayahAPI from "../../../utils/wilayahAPI";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function EditGunung() {
  const navigate = useNavigate();
  const { id_gunung } = useParams();

  const [formData, setFormData] = useState({
    nama_gunung: "",
    ketinggian_puncak_mdpl: "",
    lokasi_administratif: [], // Ubah ke array untuk multi-select
    deskripsi_singkat: "",
    // variasi_jalur: "", // HAPUS
  });
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [availableKabupaten, setAvailableKabupaten] = useState([]);
  const [availableKecamatan, setAvailableKecamatan] = useState([]);
  const [provinsiList, setProvinsiList] = useState([]);
  const [isLoadingProvinsi, setIsLoadingProvinsi] = useState(false);
  const [isLoadingKabupaten, setIsLoadingKabupaten] = useState(false);
  const [isLoadingKecamatan, setIsLoadingKecamatan] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  // PERUBAHAN 2: Hapus state error dan success yang lama
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  // Fetch daftar provinsi dari API saat component mount
  useEffect(() => {
    const fetchProvinsi = async () => {
      setIsLoadingProvinsi(true);
      try {
        const data = await wilayahAPI.getProvinces();
        setProvinsiList(data);
      } catch (error) {
        console.error("Error fetching provinsi:", error);
        toast.error("Gagal memuat data provinsi.");
      } finally {
        setIsLoadingProvinsi(false);
      }
    };

    fetchProvinsi();
  }, []);

  useEffect(() => {
    const fetchGunungDetail = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/admin/gunung/${id_gunung}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Data gunung tidak ditemukan.");
        }

        const data = await response.json();

        // Parse lokasi administratif yang tersimpan
        const lokasiArray = data.lokasi_administratif
          ? wilayahAPI.parseStoredLocation(data.lokasi_administratif)
          : [];

        setFormData({
          nama_gunung: data.nama_gunung || "",
          ketinggian_puncak_mdpl: data.ketinggian_puncak_mdpl || "",
          lokasi_administratif: lokasiArray.map(
            (item) => `${item.regency}, ${item.province}`
          ),
          deskripsi_singkat: data.deskripsi_singkat || "",
          // variasi_jalur: convertSkalaToVariasiJalur(data.variasi_jalur_skala), // Konversi skala ke pilihan
        });

        if (data.url_thumbnail) {
          setFotoPreview(`${API_BASE_URL}${data.url_thumbnail}`);
        }
      } catch (error) {
        // PERUBAHAN 3: Ganti setError dengan toast.error saat fetch gagal
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGunungDetail();
  }, [id_gunung]);

  // Handler untuk single select provinsi
  const handleProvinsiChange = async (e) => {
    const selectedProvinsiId = e.target.value;
    setSelectedProvinsi(selectedProvinsiId);

    // Reset data kabupaten dan kecamatan
    setSelectedKabupaten("");
    setSelectedKecamatan("");
    setAvailableKabupaten([]);
    setAvailableKecamatan([]);

    if (!selectedProvinsiId) return;

    // Fetch kabupaten untuk provinsi yang dipilih
    setIsLoadingKabupaten(true);
    try {
      const kabupatenData = await wilayahAPI.getRegencies(
        parseInt(selectedProvinsiId)
      );
      setAvailableKabupaten(kabupatenData);
    } catch (error) {
      console.error("Error fetching kabupaten:", error);
      toast.error("Gagal memuat data kabupaten.");
    } finally {
      setIsLoadingKabupaten(false);
    }
  };

  // Handler untuk single select kabupaten
  const handleKabupatenChange = async (e) => {
    const selectedKabupatenId = e.target.value;
    setSelectedKabupaten(selectedKabupatenId);

    // Reset data kecamatan
    setSelectedKecamatan("");
    setAvailableKecamatan([]);

    if (!selectedKabupatenId) return;

    // Fetch kecamatan untuk kabupaten yang dipilih
    setIsLoadingKecamatan(true);
    try {
      const kecamatanData = await wilayahAPI.getDistricts(
        parseInt(selectedKabupatenId)
      );
      setAvailableKecamatan(kecamatanData);
    } catch (error) {
      console.error("Error fetching kecamatan:", error);
      toast.error("Gagal memuat data kecamatan.");
    } finally {
      setIsLoadingKecamatan(false);
    }
  };

  // Handler untuk single select kecamatan
  const handleKecamatanChange = (e) => {
    const selectedKecamatanId = e.target.value;
    setSelectedKecamatan(selectedKecamatanId);
  };

  // Handler untuk menambah lokasi administratif
  const handleAddLokasiAdministratif = () => {
    if (!selectedProvinsi || !selectedKabupaten) {
      toast.warn("Pilih provinsi dan kabupaten terlebih dahulu.");
      return;
    }

    const provinsiName =
      provinsiList.find((p) => p.id === selectedProvinsi)?.name || "";
    const kabupatenName =
      availableKabupaten.find((k) => k.id === parseInt(selectedKabupaten))
        ?.name || "";
    const kecamatanName = selectedKecamatan
      ? availableKecamatan.find((kec) => kec.id === parseInt(selectedKecamatan))
          ?.name || ""
      : "";

    let lokasiString = "";
    if (kecamatanName) {
      lokasiString = `Kec. ${kecamatanName}, ${kabupatenName}, ${provinsiName}`;
    } else {
      lokasiString = `${kabupatenName}, ${provinsiName}`;
    }

    // Cek duplikasi
    if (formData.lokasi_administratif.includes(lokasiString)) {
      toast.warn("Lokasi administratif ini sudah ditambahkan.");
      return;
    }

    // Tambah ke daftar
    const newLokasi = [...formData.lokasi_administratif, lokasiString];
    setFormData((prev) => ({ ...prev, lokasi_administratif: newLokasi }));

    // Reset dropdown
    setSelectedProvinsi("");
    setSelectedKabupaten("");
    setSelectedKecamatan("");
    setAvailableKabupaten([]);
    setAvailableKecamatan([]);
  };

  // Handler untuk menghapus lokasi administratif yang dipilih
  const handleRemoveLokasiAdministratif = (index) => {
    const newLokasi = [...formData.lokasi_administratif];
    newLokasi.splice(index, 1);
    setFormData((prev) => ({ ...prev, lokasi_administratif: newLokasi }));
  };

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSend = new FormData();
    const formattedLokasi = Array.isArray(formData.lokasi_administratif)
      ? formData.lokasi_administratif.join("; ")
      : formData.lokasi_administratif;

    dataToSend.append("nama_gunung", toTitleCase(formData.nama_gunung));
    dataToSend.append("lokasi_administratif", formattedLokasi);
    dataToSend.append(
      "ketinggian_puncak_mdpl",
      formData.ketinggian_puncak_mdpl
    );
    dataToSend.append("deskripsi_singkat", formData.deskripsi_singkat);

    if (thumbnailFile) {
      dataToSend.append("url_thumbnail", thumbnailFile);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/gunung/${id_gunung}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: dataToSend,
          credentials: "include",
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // PERUBAHAN 4: Ganti setSuccess dengan toast.success
      toast.success("Data gunung berhasil diperbarui!");
      setTimeout(() => navigate("/admin/gunung"), 1500);
    } catch (error) {
      // PERUBAHAN 5: Ganti setError dengan toast.error
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi toTitleCase harus tetap ada
  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading && !formData.nama_gunung) {
    return <div className="loading-container">Memuat data...</div>;
  }

  return (
    <div className="edit-gunung-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeaderBack
        title={`Edit Data: ${formData.nama_gunung || "..."}`}
        backText="Kembali"
        backLink="/admin/gunung"
      />

      {/* PERUBAHAN 7: Hapus tampilan pesan error/sukses yang lama */}
      {/* {error && <p className="form-error-message">{error}</p>} */}
      {/* {success && <p className="form-success-message">{success}</p>} */}

      <form onSubmit={handleSubmit} className="form-widget-gunung">
        {/* ... sisa form tidak ada perubahan ... */}
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Informasi Dasar Gunung</legend>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="url_thumbnail">
                Ganti Foto Utama / Thumbnail (Opsional)
              </label>
              <div
                className="foto-upload-container"
                onClick={() => document.getElementById("url_thumbnail").click()}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="foto-preview"
                  />
                ) : (
                  <div className="foto-placeholder">
                    <i className="bi bi-image-alt"></i>
                    <p>Tidak Ada Foto</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="url_thumbnail"
                name="url_thumbnail"
                onChange={handleFotoChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nama_gunung">Nama Gunung</label>
              <input
                type="text"
                id="nama_gunung"
                name="nama_gunung"
                value={formData.nama_gunung}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ketinggian_puncak_mdpl">Ketinggian (MDPL)</label>
              <input
                type="number"
                id="ketinggian_puncak_mdpl"
                name="ketinggian_puncak_mdpl"
                value={formData.ketinggian_puncak_mdpl}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="provinsi">
                Provinsi
                <small
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Pilih provinsi untuk menambah lokasi administratif
                </small>
              </label>
              <select
                id="provinsi"
                name="provinsi"
                value={selectedProvinsi}
                onChange={handleProvinsiChange}
                className="form-select"
                disabled={isLoadingProvinsi}
              >
                <option value="">
                  {isLoadingProvinsi
                    ? "Memuat data provinsi..."
                    : "Pilih Provinsi"}
                </option>
                {provinsiList.map((provinsi) => (
                  <option key={provinsi.id} value={provinsi.id}>
                    {provinsi.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="kabupaten">
                Kabupaten/Kota
                <small
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Pilih kabupaten setelah memilih provinsi
                </small>
              </label>
              <select
                id="kabupaten"
                name="kabupaten"
                value={selectedKabupaten}
                onChange={handleKabupatenChange}
                className="form-select"
                disabled={!selectedProvinsi || isLoadingKabupaten}
              >
                <option value="">
                  {isLoadingKabupaten
                    ? "Memuat data kabupaten..."
                    : !selectedProvinsi
                    ? "Pilih provinsi terlebih dahulu"
                    : "Pilih Kabupaten/Kota"}
                </option>
                {availableKabupaten.map((kabupaten) => (
                  <option key={kabupaten.id} value={kabupaten.id}>
                    {kabupaten.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kecamatan">
                Kecamatan (Opsional)
                <small
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Pilih kecamatan untuk detail lokasi yang lebih spesifik
                </small>
              </label>
              <select
                id="kecamatan"
                name="kecamatan"
                value={selectedKecamatan}
                onChange={handleKecamatanChange}
                className="form-select"
                disabled={!selectedKabupaten || isLoadingKecamatan}
              >
                <option value="">
                  {isLoadingKecamatan
                    ? "Memuat data kecamatan..."
                    : !selectedKabupaten
                    ? "Pilih kabupaten terlebih dahulu"
                    : "Pilih Kecamatan (Opsional)"}
                </option>
                {availableKecamatan.map((kecamatan) => (
                  <option key={kecamatan.id} value={kecamatan.id}>
                    {kecamatan.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="form-group"
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              <button
                type="button"
                onClick={handleAddLokasiAdministratif}
                className="btn-add-location"
                disabled={!selectedProvinsi || !selectedKabupaten}
                style={{
                  backgroundColor: "#0369a1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                  marginTop: "24px",
                  minHeight: "44px",
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = "#0284c7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = "#0369a1";
                  }
                }}
              >
                <i className="bi bi-plus-circle"></i>
                Tambah Lokasi
              </button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>
                Lokasi Administratif Terpilih
                <small
                  style={{
                    display: "block",
                    color: "#666",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Daftar lokasi administratif yang akan disimpan untuk gunung ini
                </small>
              </label>
              <div className="selected-locations">
                {!formData.lokasi_administratif || formData.lokasi_administratif.length === 0 ? (
                  <div
                    style={{
                      color: "#999",
                      fontStyle: "italic",
                      margin: "12px 0",
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px dashed #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    <i
                      className="bi bi-geo-alt"
                      style={{
                        fontSize: "24px",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    ></i>
                    Belum ada lokasi administratif yang ditambahkan.
                    <br />
                    Gunakan dropdown di atas untuk menambah lokasi.
                  </div>
                ) : (
                  <div className="location-tags">
                    {formData.lokasi_administratif.map((lokasi, index) => (
                      <div key={index} className="location-tag enhanced">
                        <div className="location-info">
                          <i
                            className="bi bi-geo-alt-fill"
                            style={{ color: "#0369a1", marginRight: "6px" }}
                          ></i>
                          <span className="location-text">{lokasi}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLokasiAdministratif(index)}
                          className="remove-location"
                          title="Hapus lokasi ini"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.lokasi_administratif && formData.lokasi_administratif.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px 12px",
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#047857",
                    }}
                  >
                    <i
                      className="bi bi-info-circle-fill"
                      style={{ marginRight: "6px" }}
                    ></i>
                    Total {formData.lokasi_administratif.length} lokasi administratif akan disimpan.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="deskripsi_singkat">Deskripsi Singkat</label>
              <textarea
                id="deskripsi_singkat"
                name="deskripsi_singkat"
                rows="4"
                value={formData.deskripsi_singkat}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </fieldset>
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/gunung")}
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

export default EditGunung;
