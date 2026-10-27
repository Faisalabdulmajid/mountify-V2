// src/pages/admin/gunung/KelolaGunung.js (FINAL - Tanpa Seleksi & Bulk Actions)
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import PageHeader from "../../../components/common/PageHeader/PageHeader";
import Pagination from "../../../components/common/Pagination";
import { GunungTable, GunungToolbar, QuickViewModal } from "./components";

import "./KelolaGunung.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Custom hook untuk debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function KelolaGunung() {
  const navigate = useNavigate();
  const [gunungList, setGunungList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jalurFilter, setJalurFilter] = useState("Semua");
  const [filterKetinggian, setFilterKetinggian] = useState({ min: "", max: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGunung, setSelectedGunung] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "id_gunung", direction: "descending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deletingIds, setDeletingIds] = useState(new Set());
  // Tambahan untuk data jalur
  const [jalurList, setJalurList] = useState([]);
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch data gunung dan jalur
  const fetchGunungAndJalurData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch gunung
      const gunungRes = await fetch(`${API_BASE_URL}/api/admin/gunung`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!gunungRes.ok) {
        const errData = await gunungRes.json().catch(() => ({ message: "Gagal mengambil data gunung." }));
        throw new Error(errData.message);
      }
      const gunungData = await gunungRes.json();

      // Fetch jalur
      const jalurRes = await fetch(`${API_BASE_URL}/api/admin/jalur`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!jalurRes.ok) {
        const errData = await jalurRes.json().catch(() => ({ message: "Gagal mengambil data jalur." }));
        throw new Error(errData.message);
      }
      const jalurData = await jalurRes.json();
      setJalurList(jalurData);
      console.log('ISI DATA JALUR DARI API:', jalurData);
      // Tambahkan log contoh isi jalurData dan gunungData
      console.log('Contoh isi jalurData:', jalurData.slice(0, 5));
      console.log('Contoh isi gunungData:', gunungData.slice(0, 5));

      // Log tipe dan value id_gunung pada setiap jalur
      jalurData.forEach((jalur, idx) => {
        console.log(`jalur[${idx}].id_gunung:`, jalur.id_gunung, '| tipe:', typeof jalur.id_gunung);
      });
      // Log tipe dan value id_gunung pada setiap gunung
      gunungData.forEach((gunung, idx) => {
        console.log(`gunung[${idx}].id_gunung:`, gunung.id_gunung, '| tipe:', typeof gunung.id_gunung);
      });

      // Hitung jumlah jalur per gunung
      const gunungWithJalur = gunungData.map(gunung => {
        const jumlah_jalur = jalurData.filter(jalur => String(jalur.id_gunung) === String(gunung.id_gunung)).length;
        return { ...gunung, jumlah_jalur };
      });
      console.log('HASIL MAPPING JUMLAH JALUR PER GUNUNG:', gunungWithJalur);
      setGunungList(gunungWithJalur);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGunungAndJalurData();
  }, [fetchGunungAndJalurData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, debouncedSearchTerm, jalurFilter, filterKetinggian]);

  const sortedAndFilteredGunung = useMemo(() => {
    // ... (Logika ini tidak berubah) ...
    let sortableItems = [...gunungList];
    if (jalurFilter === "Punya Jalur")
      sortableItems = sortableItems.filter((g) => g.jumlah_jalur > 0);
    else if (jalurFilter === "Belum Ada Jalur")
      sortableItems = sortableItems.filter((g) => g.jumlah_jalur === 0);
    if (filterKetinggian.min || filterKetinggian.max) {
      sortableItems = sortableItems.filter((g) => {
        const min = filterKetinggian.min
          ? parseInt(filterKetinggian.min, 10)
          : 0;
        const max = filterKetinggian.max
          ? parseInt(filterKetinggian.max, 10)
          : Infinity;
        return (
          g.ketinggian_puncak_mdpl >= min && g.ketinggian_puncak_mdpl <= max
        );
      });
    }
    if (debouncedSearchTerm) {
      sortableItems = sortableItems.filter(
        (g) =>
          g.nama_gunung
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (g.lokasi_administratif &&
            g.lokasi_administratif
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()))
      );
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [
    gunungList,
    debouncedSearchTerm,
    sortConfig,
    jalurFilter,
    filterKetinggian,
  ]);

  const handleDelete = async (id_gunung) => {
    const result = await Swal.fire({
      title: "Anda Yakin?",
      text: "Data tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      // Set loading state untuk button delete
      setDeletingIds((prev) => new Set([...prev, id_gunung]));

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/admin/gunung/${id_gunung}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Gagal menghapus data.");
        }
        toast.success("Data gunung berhasil dihapus.");
        setGunungList((prev) => prev.filter((g) => g.id_gunung !== id_gunung));
      } catch (error) {
        toast.error(error.message);
      } finally {
        // Remove loading state
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id_gunung);
          return newSet;
        });
      }
    }
  };

  const handleOpenModal = (gunung) => {
    setSelectedGunung(gunung);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredGunung.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedAndFilteredGunung.length / itemsPerPage);

  if (isLoading) return <div className="loading-container">Memuat data...</div>;
  if (error && gunungList.length === 0)
    return (
      <div className="form-error-message" style={{ margin: "20px" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="gunung-management-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      {isModalOpen && (
        <QuickViewModal gunung={selectedGunung} onClose={handleCloseModal} />
      )}
      <PageHeader
        title="Manajemen Data Gunung"
        addLabel="Tambah Gunung"
        onAddClick={() => navigate("/admin/gunung/new")}
      />

      <GunungToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        jalurFilter={jalurFilter}
        onFilterChange={setJalurFilter}
        filterKetinggian={filterKetinggian}
        onKetinggianFilterChange={setFilterKetinggian}
      />
      <GunungTable
        gunungList={currentItems}
        onDelete={handleDelete}
        onSort={requestSort}
        sortConfig={sortConfig}
        indexOfFirstItem={indexOfFirstItem}
        onViewDetails={handleOpenModal}
        apiBaseUrl={API_BASE_URL}
        deletingIds={deletingIds}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sortedAndFilteredGunung.length}
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

export default KelolaGunung;
