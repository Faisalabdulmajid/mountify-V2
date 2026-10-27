// src/pages/admin/gunung/TambahGunung.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahGunung.css";
import PageHeaderBack from "./components/PageHeaderBack";
import wilayahAPI from "../../../utils/wilayahAPI";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Konstanta konfigurasi
const VALIDATION_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  MIN_NAME_LENGTH: 3,
  MAX_HEIGHT: 9000,
  REDIRECT_DELAY: 1500,
};

function TambahGunung() {
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setHasUnsavedChanges(true);
  };

  // Fetch daftar provinsi dari API saat component mount
  useEffect(() => {
    const fetchProvinsi = async () => {
      setIsLoadingProvinsi(true);
      try {
        const data = await wilayahAPI.getProvinces();
        setProvinsiList(data);
      } catch (error) {
        console.error("Error fetching provinsi:", error);
        toast.error("Gagal memuat data provinsi. Silakan refresh halaman.");
        // Fallback data lokal jika API gagal
        setProvinsiList([
          { id: "32", name: "Jawa Barat" },
          { id: "33", name: "Jawa Tengah" },
          { id: "35", name: "Jawa Timur" },
          { id: "52", name: "Nusa Tenggara Barat" },
          { id: "51", name: "Bali" },
          { id: "34", name: "DI Yogyakarta" },
          { id: "31", name: "DKI Jakarta" },
        ]);
      } finally {
        setIsLoadingProvinsi(false);
      }
    };

    fetchProvinsi();
  }, []);



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

    setHasUnsavedChanges(true);
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

    setHasUnsavedChanges(true);
  };

  // Handler untuk single select kecamatan
  const handleKecamatanChange = (e) => {
    const selectedKecamatanId = e.target.value;
    setSelectedKecamatan(selectedKecamatanId);
    setHasUnsavedChanges(true);
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
      availableKabupaten.find((k) => String(k.id) === String(selectedKabupaten))
        ?.name || "";
    if (!kabupatenName) {
      toast.warn(
        "Nama kabupaten tidak ditemukan. Silakan pilih ulang kabupaten."
      );
      return;
    }
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

    // Cek duplikasi: hanya tidak boleh kabupaten sama di provinsi yang sama
    const isDuplicate = formData.lokasi_administratif.some((lokasi) => {
      // Ambil kabupaten dan provinsi dari string lokasi
      const regex = /([^,]+), ([^,]+)$/; // cocokkan 'kabupaten, provinsi'
      const match = lokasi.match(regex);
      if (!match) return false;
      const [, kab, prov] = match;
      return kab.trim() === kabupatenName && prov.trim() === provinsiName;
    });
    if (isDuplicate) {
      toast.warn("Kabupaten ini sudah ditambahkan untuk provinsi yang sama.");
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

    setHasUnsavedChanges(true);
  };

  // Handler untuk menghapus lokasi administratif yang dipilih
  const handleRemoveLokasiAdministratif = (index) => {
    const newLokasi = [...formData.lokasi_administratif];
    newLokasi.splice(index, 1);
    setFormData((prev) => ({ ...prev, lokasi_administratif: newLokasi }));
    setHasUnsavedChanges(true);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!VALIDATION_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
        e.target.value = "";
        return;
      }

      // Validasi ukuran file
      if (file.size > VALIDATION_CONFIG.MAX_FILE_SIZE) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
        e.target.value = "";
        return;
      }

      setThumbnailFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setHasUnsavedChanges(true);
    } else {
      setThumbnailFile(null);
      setFotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input wajib
    if (!formData.nama_gunung.trim() || !formData.ketinggian_puncak_mdpl) {
      toast.warn("Nama Gunung dan Ketinggian wajib diisi.");
      return;
    }

    // Validasi ketinggian
    const ketinggian = parseInt(formData.ketinggian_puncak_mdpl, 10);
    if (ketinggian < 0 || ketinggian > VALIDATION_CONFIG.MAX_HEIGHT) {
      toast.warn(
        `Ketinggian harus antara 0-${VALIDATION_CONFIG.MAX_HEIGHT} MDPL.`
      );
      return;
    }

    // Validasi nama gunung
    if (
      formData.nama_gunung.trim().length < VALIDATION_CONFIG.MIN_NAME_LENGTH
    ) {
      toast.warn(
        `Nama gunung minimal ${VALIDATION_CONFIG.MIN_NAME_LENGTH} karakter.`
      );
      return;
    }

    setIsLoading(true);
    const dataToSend = new FormData();
    const formattedNamaGunung = toTitleCase(formData.nama_gunung);
    const formattedLokasi = formData.lokasi_administratif.join("; "); // Gabungkan dengan separator

    dataToSend.append("nama_gunung", formattedNamaGunung);
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
      const response = await fetch(`${API_BASE_URL}/api/admin/gunung`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan data gunung.");
      }
      toast.success("Data gunung baru berhasil ditambahkan!");
      setHasUnsavedChanges(false);
      setTimeout(
        () => navigate("/admin/gunung"),
        VALIDATION_CONFIG.REDIRECT_DELAY
      );
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Peringatan untuk unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation away dengan konfirmasi
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?"
        )
      ) {
        navigate("/admin/gunung");
      }
    } else {
      navigate("/admin/gunung");
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

  return (
    <div className="add-gunung-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeaderBack
        title="Tambah Data Gunung Baru"
        backText="Kembali ke Daftar"
        backLink="/admin/gunung"
        backButtonClassName="btn-back-list"
      />

      <form onSubmit={handleSubmit} className="form-widget-gunung">
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Informasi Dasar Gunung</legend>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="url_thumbnail">Foto Utama / Thumbnail</label>
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
                    <p>Pilih Foto</p>
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
                placeholder="Contoh: Gunung Ciremai"
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
                placeholder="Contoh: 3078"
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
                  Daftar lokasi administratif yang akan disimpan untuk gunung
                  ini
                </small>
              </label>
              <div className="selected-locations">
                {formData.lokasi_administratif.length === 0 ? (
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
                    {formData.lokasi_administratif.map((lokasi, index) => {
                      // Ekstrak kabupaten dan kecamatan dari string lokasi
                      // Format: 'Kec. NamaKecamatan, NamaKabupaten, NamaProvinsi' atau 'NamaKabupaten, NamaProvinsi'
                      let kabupaten = "";
                      let kecamatan = "";
                      const regexKec = /^Kec\. ([^,]+), ([^,]+), ([^,]+)$/;
                      const regexKab = /^([^,]+), ([^,]+)$/;
                      const matchKec = lokasi.match(regexKec);
                      if (matchKec) {
                        kecamatan = matchKec[1];
                        kabupaten = matchKec[2];
                      } else {
                        const matchKab = lokasi.match(regexKab);
                        if (matchKab) {
                          kabupaten = matchKab[1];
                          // provinsi = matchKab[2]; // Hapus karena tidak digunakan
                        }
                      }
                      return (
                        <div key={index} className="location-tag enhanced">
                          <div className="location-info">
                            <i
                              className="bi bi-geo-alt-fill"
                              style={{ color: "#0369a1", marginRight: "6px" }}
                            ></i>
                            <span className="location-text">{lokasi}</span>
                            {kecamatan && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: "#0a0",
                                  fontSize: 12,
                                }}
                              >
                                <b>Kec:</b> {kecamatan} | <b>Kab:</b>{" "}
                                {kabupaten}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveLokasiAdministratif(index)
                            }
                            className="remove-location"
                            title="Hapus lokasi ini"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {formData.lokasi_administratif.length > 0 && (
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
                    Total {formData.lokasi_administratif.length} lokasi
                    administratif akan disimpan.
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
                placeholder="Deskripsi umum dan singkat mengenai gunung..."
              ></textarea>
            </div>
          </div>
        </fieldset>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Data Gunung"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahGunung;
