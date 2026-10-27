// src/pages/admin/pengumuman/KelolaPengumuman.js (Dengan Filter)

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaPengumuman.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function KelolaPengumuman() {
  const navigate = useNavigate();
  const [pengumumanList, setPengumumanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // [1. DITAMBAHKAN] State untuk menampung nilai filter status
  const [statusFilter, setStatusFilter] = useState("Semua");

  const fetchPengumuman = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
        //
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data pengumuman."); //
      const data = await response.json();
      setPengumumanList(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengumuman();
  }, [fetchPengumuman]);

  // [2. DIPERBARUI] Logika filter sekarang mencakup searchTerm DAN statusFilter
  const filteredPengumuman = useMemo(() => {
    let filtered = pengumumanList;

    // Terapkan filter status terlebih dahulu
    if (statusFilter !== "Semua") {
      filtered = filtered.filter((p) => p.displayStatus === statusFilter);
    }

    // Kemudian terapkan filter pencarian pada hasil filter status
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.judul.toLowerCase().includes(searchTerm.toLowerCase()) || //
          (p.penulis &&
            p.penulis.toLowerCase().includes(searchTerm.toLowerCase())) //
      );
    }

    return filtered;
  }, [pengumumanList, searchTerm, statusFilter]); // Tambahkan statusFilter ke dependency array

  const handleAddPengumuman = () => navigate("/admin/announcements/new");
  const handleEditPengumuman = (id) =>
    navigate(`/admin/announcements/edit/${id}`);

  const handleDeletePengumuman = (id, judul) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Menghapus pengumuman "${judul}" tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/announcements/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          toast.success(resJson.message);
          fetchPengumuman();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Helper ini akan digunakan untuk memberi warna pada badge status
  const getStatusClass = (status) => {
    if (!status) return "";
    return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <div className="pengumuman-management-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeader
        title="Manajemen Pengumuman"
        addLabel="Buat Pengumuman Baru"
        onAddClick={handleAddPengumuman}
      >
        <div className="toolbar">
          <div className="search-container">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Cari judul atau penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* [3. DITAMBAHKAN] Elemen dropdown untuk filter status */}
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Dijadwalkan">Dijadwalkan</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Kadaluarsa">Kadaluarsa</option>
            </select>
          </div>
        </div>
      </PageHeader>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>
                <div className="header-cell-content">
                  <span>Judul Pengumuman</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Status</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>
                <div className="header-cell-content">
                  <span>Target</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>
                <div className="header-cell-content">
                  <span>Penulis</span>
                </div>
              </th>
              <th style={{ width: "18%" }}>
                <div className="header-cell-content">
                  <span>Periode Aktif</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Memuat data...
                </td>
              </tr>
            ) : filteredPengumuman.length > 0 ? (
              filteredPengumuman.map((item) => (
                <tr key={item.id_pengumuman}>
                  <td className="pengumuman-judul">{item.judul}</td>
                  <td>
                    {/* Menggunakan displayStatus dari backend */}
                    <span
                      className={`status-badge ${getStatusClass(
                        item.displayStatus
                      )}`}
                    >
                      {item.displayStatus}
                    </span>
                  </td>
                  <td>{item.target}</td>
                  <td>{item.penulis || "N/A"}</td>
                  <td>
                    {`${formatDate(item.berlaku_mulai)} - ${formatDate(
                      item.berlaku_sampai
                    )}`}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => handleEditPengumuman(item.id_pengumuman)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() =>
                          handleDeletePengumuman(item.id_pengumuman, item.judul)
                        }
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Belum ada pengumuman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KelolaPengumuman;
