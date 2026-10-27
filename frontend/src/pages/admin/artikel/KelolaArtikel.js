
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./KelolaArtikel.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import Pagination from "../../../components/common/Pagination";
import { ArtikelToolbar } from "./components";

// Fungsi untuk mengambil CSRF token dari backend
const getCSRFToken = async () => {
  // Pastikan endpoint CSRF sesuai backend: /api/admin/csrf-token
  const res = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: "include"
  });
  const data = await res.json();
  return data.csrfToken;
};

const API_BASE_URL = process.env.REACT_APP_API_URL + "/api/admin";

function KelolaArtikel() {
  const navigate = useNavigate();
  const [artikelList, setArtikelList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const fetchArtikel = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.warn("Anda harus login untuk mengakses data ini.");
          setIsLoading(false);
          navigate("/login"); // Arahkan ke login jika tidak ada token
          return;
        }

        const response = await fetch(`${API_BASE_URL}/articles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data artikel.");
        }
        const data = await response.json();
        setArtikelList(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtikel();
  }, [navigate]);

  const handleDeleteArtikel = async (id, judul) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)
    ) {
      try {
        const token = localStorage.getItem("token");
        const csrfToken = await getCSRFToken();
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-csrf-token": csrfToken
          },
          credentials: "include"
        });

        if (response.status === 403) {
          toast.error("Akses ditolak. Anda tidak memiliki izin atau CSRF token salah.");
          return;
        }

        if (!response.ok) {
          throw new Error("Gagal menghapus artikel.");
        }

        setArtikelList((prevList) =>
          prevList.filter((item) => item.id_artikel !== id)
        );
        toast.success(`Artikel "${judul}" berhasil dihapus.`);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const filteredArtikel = useMemo(() => {
    if (!artikelList || artikelList.length === 0) return [];
    return artikelList.filter(
      (artikel) =>
        artikel.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artikel.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artikel.penulis &&
          artikel.penulis.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [artikelList, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArtikel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArtikel.length / itemsPerPage);

  const handleAddArtikel = () => navigate("/admin/articles/new");
  const handleEditArtikel = (id) => navigate(`/admin/articles/edit/${id}`);

  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return "-";
    const date = new Date(isoDateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusDisplay = (statusDB) => {
    const statusMap = {
      Published: "Dipublikasikan",
      Draft: "Draft",
      Archived: "Diarsipkan",
    };
    return statusMap[statusDB] || statusDB;
  };
  return (
    <div className="artikel-management-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeader
        title="Manajemen Artikel"
        addLabel="Tulis Artikel Baru"
        onAddClick={handleAddArtikel}
      />

      <ArtikelToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setCurrentPage={setCurrentPage}
      />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>
                <div className="header-cell-content">
                  <span>Judul Artikel</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>
                <div className="header-cell-content">
                  <span>Kategori</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>
                <div className="header-cell-content">
                  <span>Penulis</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Status</span>
                </div>
              </th>
              <th style={{ width: "18%" }}>
                <div className="header-cell-content">
                  <span>Terakhir Diperbarui</span>
                </div>
              </th>
              <th style={{ width: "10%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Memuat data...
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((artikel) => (
                <tr key={artikel.id_artikel}>
                  <td className="artikel-judul">{artikel.judul}</td>
                  <td>{artikel.kategori}</td>
                  <td>{artikel.penulis || "N/A"}</td>
                  <td>
                    <span
                      className={`status-badge status-${getStatusDisplay(
                        artikel.status
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {getStatusDisplay(artikel.status)}
                    </span>
                  </td>
                  <td>{formatDisplayDate(artikel.updated_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        title="Edit"
                        className="action-btn btn-edit"
                        onClick={() => handleEditArtikel(artikel.id_artikel)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        title="Hapus"
                        className="action-btn btn-delete"
                        onClick={() =>
                          handleDeleteArtikel(artikel.id_artikel, artikel.judul)
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
                  {searchTerm
                    ? "Artikel tidak ditemukan."
                    : "Belum ada artikel."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredArtikel.length}
        onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        indexOfFirstItem={indexOfFirstItem}
        currentItemsLength={currentItems.length}
      />
    </div>
  );
}

export default KelolaArtikel;
