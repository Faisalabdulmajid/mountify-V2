// src/pages/admin/gunung/components/QuickViewModal.js
import React from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const QuickViewModal = ({ gunung, onClose }) => {
  if (!gunung) return null;

  // Fungsi helper untuk format lokasi administratif
  const formatLokasiAdministratif = (lokasi) => {
    if (!lokasi) return "Lokasi tidak diketahui";
    // Jika lokasi berupa string dengan separator "; ", pecah menjadi array
    const lokasiArray = lokasi.split("; ");
    if (lokasiArray.length === 1) {
      return lokasi;
    }
    // Jika ada multiple lokasi, tampilkan sebagai list
    return lokasiArray;
  };

  // Fungsi helper untuk format variasi jalur
  const formatVariasiJalur = (skala) => {
    if (skala >= 0 && skala <= 3) return "Jalur Tunggal";
    if (skala >= 4 && skala <= 7) return "Beberapa Jalur";
    if (skala >= 8 && skala <= 10) return "Banyak Jalur";
    return "Belum diisi";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{gunung.nama_gunung}</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {gunung.url_thumbnail && (
            <img
              src={`${API_BASE_URL}${gunung.url_thumbnail}`}
              alt={gunung.nama_gunung}
              className="modal-thumbnail"
            />
          )}
          <div className="modal-details">
            <div className="detail-item">
              <span className="detail-label">Ketinggian</span>
              <span className="detail-value">
                {gunung.ketinggian_puncak_mdpl} MDPL
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Variasi Jalur</span>
              <span className="detail-value">
                {formatVariasiJalur(gunung.variasi_jalur_skala)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Lokasi</span>
              <div className="detail-value">
                {(() => {
                  const lokasi = formatLokasiAdministratif(
                    gunung.lokasi_administratif
                  );
                  if (Array.isArray(lokasi)) {
                    return (
                      <div className="location-list">
                        {lokasi.map((item, index) => (
                          <span key={index} className="location-item">
                            <i
                              className="bi bi-geo-alt-fill"
                              style={{ marginRight: "4px", color: "#0369a1" }}
                            ></i>
                            {item}
                          </span>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <span>
                        <i
                          className="bi bi-geo-alt-fill"
                          style={{ marginRight: "4px", color: "#0369a1" }}
                        ></i>
                        {lokasi}
                      </span>
                    );
                  }
                })()}
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Jumlah Jalur</span>
              <span className="detail-value">{gunung.jumlah_jalur} Jalur</span>
            </div>
          </div>
          <div className="modal-deskripsi">
            <strong>Deskripsi Singkat</strong>
            <p>{gunung.deskripsi_singkat || "Tidak ada deskripsi."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default QuickViewModal;
