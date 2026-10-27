// src/pages/admin/jalur/components/JalurTable.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const JalurTable = ({
  currentItems,
  indexOfFirstItem,
  getKesulitanText,
  handleDeleteJalur,
  sortConfig,
  onSort,
}) => {
  const navigate = useNavigate();

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null; // Tidak menampilkan ikon jika tidak aktif
    if (sortConfig.direction === "ascending") {
      return <i className="bi bi-sort-up-alt sort-icon-active"></i>;
    }
    return <i className="bi bi-sort-down sort-icon-active"></i>;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "5%" }}>No</th>
            <th style={{ width: "22%" }} onClick={() => onSort("nama_jalur")}>
              <div className="header-cell-content">
                <span>Nama Jalur</span>
                {getSortIcon("nama_jalur")}
              </div>
            </th>
            <th style={{ width: "16%" }} onClick={() => onSort("nama_gunung")}>
              <div className="header-cell-content">
                <span>Gunung</span>
                {getSortIcon("nama_gunung")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              onClick={() => onSort("estimasi_waktu_jam")}
            >
              <div className="header-cell-content">
                <span>Estimasi Waktu</span>
                {getSortIcon("estimasi_waktu_jam")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              onClick={() => onSort("kesulitan_skala")}
            >
              <div className="header-cell-content">
                <span>Kesulitan</span>
                {getSortIcon("kesulitan_skala")}
              </div>
            </th>
            <th style={{ width: "9%" }} onClick={() => onSort("status_jalur")}>
              <div className="header-cell-content">
                <span>Status</span>
                {getSortIcon("status_jalur")}
              </div>
            </th>
            <th style={{ width: "9%" }} onClick={() => onSort("biaya_simaksi")}>
              <div className="header-cell-content">
                <span>Simaksi</span>
                {getSortIcon("biaya_simaksi")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              onClick={() => onSort("biaya_pulang_pergi")}
            >
              <div className="header-cell-content">
                <span>Pulang Pergi</span>
                {getSortIcon("biaya_pulang_pergi")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              onClick={() => onSort("estimasi_biaya")}
            >
              <div className="header-cell-content">
                <span>Total Biaya</span>
                {getSortIcon("estimasi_biaya")}
              </div>
            </th>
            <th
              className="col-aksi"
              style={{
                width: "15%",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((jalur, index) => (
              <tr key={jalur.id_jalur}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span title={jalur.nama_jalur}>{jalur.nama_jalur}</span>
                </td>
                <td>
                  <Link
                    to={`/admin/gunung/edit/${jalur.id_gunung}`}
                    title={`Edit data ${jalur.nama_gunung}`}
                  >
                    {jalur.nama_gunung}
                  </Link>
                </td>
                <td>
                  <span title={`Estimasi waktu pendakian`}>
                    {jalur.estimasi_waktu_jam || 0} Jam
                  </span>
                </td>
                <td>
                  <span
                    title={`Tingkat kesulitan: ${getKesulitanText(
                      jalur.kesulitan_skala
                    )} (${jalur.kesulitan_skala || 0}/10)`}
                  >
                    {getKesulitanText(jalur.kesulitan_skala)} (
                    {jalur.kesulitan_skala || 0}/10)
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge status-${
                      jalur.status_jalur?.toLowerCase().replace(/\s+/g, "-") ||
                      "belum-diketahui"
                    }`}
                  >
                    {jalur.status_jalur || "N/A"}
                  </span>
                </td>
                <td>
                  {jalur.biaya_simaksi != null
                    ? `Rp${jalur.biaya_simaksi.toLocaleString()}`
                    : "-"}
                </td>
                <td>
                  {jalur.biaya_pulang_pergi != null ? (
                    <span>Rp{jalur.biaya_pulang_pergi.toLocaleString()}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {jalur.estimasi_biaya != null
                    ? `Rp${jalur.estimasi_biaya.toLocaleString()}`
                    : "-"}
                </td>
                <td className="col-aksi">
                  <div className="action-buttons">
                    <button
                      className="action-btn btn-view-poi"
                      title="Lihat Titik Penting (POI)"
                      onClick={() =>
                        navigate(`/admin/poi?jalurId=${jalur.id_jalur}`)
                      }
                    >
                      <i className="bi bi-geo-alt-fill"></i>
                    </button>
                    <button
                      className="action-btn btn-edit"
                      title="Edit Jalur"
                      onClick={() =>
                        navigate(`/admin/jalur/edit/${jalur.id_jalur}`)
                      }
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="action-btn btn-delete"
                      title="Hapus Jalur"
                      onClick={() => handleDeleteJalur(jalur.id_jalur)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                Tidak ada data jalur yang cocok dengan filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JalurTable;
