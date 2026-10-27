// src/pages/admin/laporan/KelolaLaporanError.js

import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import "./KelolaLaporanError.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import { fetchCsrfToken } from "../../../utils/csrf";

const API_BASE_URL = process.env.REACT_APP_API_URL + "/api/admin";

function KelolaLaporanError() {
  const [laporanList, setLaporanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLaporan = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/laporan-error`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data laporan.");
      const data = await response.json();
      setLaporanList(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const handleUpdateStatus = async (
    id,
    newStatus,
    currentPrioritas,
    currentCatatan
  ) => {
    const token = localStorage.getItem("token");
    try {
      const csrfToken = await fetchCsrfToken(process.env.REACT_APP_API_URL);
      const response = await fetch(`${API_BASE_URL}/laporan-error/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          status_laporan: newStatus,
          prioritas: currentPrioritas,
          catatan_admin: currentCatatan,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      toast.success("Status laporan diperbarui!");
      fetchLaporan();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (id, judul) => {
    Swal.fire({
      title: "Hapus Laporan Ini?",
      text: `Anda akan menghapus laporan \"${judul}\".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Hapus",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const csrfToken = await fetchCsrfToken(process.env.REACT_APP_API_URL);
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_BASE_URL}/laporan-error/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRF-Token": csrfToken,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const resJson = await response.json().catch(() => ({}));
          if (!response.ok)
            throw new Error(resJson.message || "Gagal menghapus laporan.");
          toast.success(resJson.message || "Laporan berhasil dihapus!");
          setLaporanList((prev) => prev.filter((l) => l.id_laporan !== id));
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) =>
    `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  const getPrioritasClass = (prio) => `prio-${prio.toLowerCase()}`;

  return (
    <div className="kelola-laporan-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <PageHeader title="Manajemen Laporan Error" />
      <div className="table-container">
        <table className="data-table">
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Judul Laporan</th>
              <th>Pelapor</th>
              <th>Status</th>
              <th>Prioritas</th>
              <th>Tgl Laporan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center"
                  style={{ textAlign: "center", padding: 20 }}
                >
                  Memuat Laporan...
                </td>
              </tr>
            ) : laporanList.length > 0 ? (
              laporanList.map((laporan) => (
                <tr key={laporan.id_laporan}>
                  <td
                    className="laporan-judul"
                    style={{ maxWidth: 260, wordBreak: "break-word" }}
                  >
                    <span>{laporan.judul_laporan}</span>
                    <span className="laporan-page">
                      {laporan.halaman_error}
                    </span>
                  </td>
                  <td>{laporan.nama_pelapor || "N/A"}</td>
                  <td>
                    <select
                      value={laporan.status_laporan}
                      className={`status-select ${getStatusClass(
                        laporan.status_laporan
                      )}`}
                      onChange={(e) =>
                        handleUpdateStatus(
                          laporan.id_laporan,
                          e.target.value,
                          laporan.prioritas,
                          laporan.catatan_admin
                        )
                      }
                    >
                      <option value="Baru">Baru</option>
                      <option value="Ditinjau">Ditinjau</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`prioritas-badge ${getPrioritasClass(
                        laporan.prioritas
                      )}`}
                    >
                      {laporan.prioritas}
                    </span>
                  </td>
                  <td>{formatDate(laporan.dilaporkan_pada)}</td>
                  <td>
                    <div
                      className="action-buttons"
                      style={{ display: "flex", gap: 6 }}
                    >
                      <button
                        className="action-btn btn-view btn-secondary"
                        style={{ marginRight: 0 }}
                        onClick={() => {
                          /* Logika view detail */
                        }}
                        title="Lihat Detail"
                        type="button"
                      >
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button
                        className="action-btn btn-delete btn-danger"
                        onClick={() =>
                          handleDelete(
                            laporan.id_laporan,
                            laporan.judul_laporan
                          )
                        }
                        title="Hapus"
                        type="button"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center"
                  style={{ textAlign: "center", padding: 20 }}
                >
                  Tidak ada laporan masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KelolaLaporanError;
