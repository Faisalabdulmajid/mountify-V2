// src/pages/admin/jalur/KelolaJalur.js (Kode Sudah Diperbaiki)
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaJalur.css";
import { PageHeader } from "../../../components/common/PageHeader";
import { JalurToolbar, JalurTable } from "./components";
import Pagination from "../../../components/common/Pagination";
import "../../../components/common/PageHeader/PageHeader.css"; // Import CSS PageHeader
import { fetchCSRFToken } from "../../../utils/csrf";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function KelolaJalur() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterGunungId = searchParams.get("gunungId");

  const [jalurList, setJalurList] = useState([]);
  const [allGunungList, setAllGunungList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [gunungFilter, setGunungFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [difficultyFilter, setDifficultyFilter] = useState("Semua");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Sinkronisasi gunungFilter dengan query param saat mount ---
  useEffect(() => {
    if (filterGunungId && filterGunungId !== gunungFilter) {
      setGunungFilter(String(filterGunungId));
    }
    // eslint-disable-next-line
  }, [filterGunungId]);

  // --- FILTERED JALUR: hanya gunakan gunungFilter, jangan filterGunungId ---
  const filteredJalur = useMemo(() => {

    let filtered = [...jalurList];

    if (gunungFilter !== "Semua") {
      console.log('--- FILTER GUNUNG DEBUG ---');
      console.log('gunungFilter:', gunungFilter, typeof gunungFilter);
      jalurList.forEach(jalur => {
        console.log(`jalur: ${jalur.nama_jalur}, id_gunung:`, jalur.id_gunung, typeof jalur.id_gunung);
      });
      filtered = filtered.filter((jalur) => {
        const match = String(jalur.id_gunung) === String(gunungFilter);
        if (match) {
          console.log('MATCH:', jalur.nama_jalur, 'id_gunung:', jalur.id_gunung);
        }
        return match;
      });
      console.log('Filtered result:', filtered);
    }

    if (statusFilter !== "Semua") {
      filtered = filtered.filter(
        (jalur) => jalur.status_jalur === statusFilter
      );
    }

    if (difficultyFilter !== "Semua") {
      filtered = filtered.filter(
        (jalur) => getKesulitanText(jalur.kesulitan_skala) === difficultyFilter
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((jalur) =>
        jalur.nama_jalur.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    jalurList,
    searchTerm,
    gunungFilter,
    statusFilter,
    difficultyFilter,
    sortConfig,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch jalur data
        const jalurResponse = await fetch(`${API_BASE_URL}/api/admin/jalur`, { headers });
        
        // Try multiple endpoints for gunung data
        let gunungResponse;
        let gunungData = [];
        
        try {
          gunungResponse = await fetch(`${API_BASE_URL}/api/gunung`, { headers });
          if (!gunungResponse.ok) {
            console.log("Trying alternative endpoint /api/admin/gunung...");
            gunungResponse = await fetch(`${API_BASE_URL}/api/admin/gunung`, { headers });
          }
        } catch (err) {
          console.log("Trying alternative endpoint /api/admin/gunung...");
          gunungResponse = await fetch(`${API_BASE_URL}/api/admin/gunung`, { headers });
        }

        if (!jalurResponse.ok) {
          const errJson = await jalurResponse.json().catch(() => ({}));
          throw new Error(
            `Gagal mengambil data jalur. ${
              errJson.message ? "Detail: " + errJson.message : ""
            }`
          );
        }
        
        if (!gunungResponse.ok) {
          const errJson = await gunungResponse.json().catch(() => ({}));
          console.warn("Failed to fetch gunung data:", errJson);
          // Don't throw error, just use empty array
          gunungData = [];
        } else {
          gunungData = await gunungResponse.json();
        }

        const jalurData = await jalurResponse.json();

        // --- TAMBAHKAN BARIS INI UNTUK DEBUGGING ---
        console.log("DATA JALUR DARI API:", jalurData);
        console.log("DATA GUNUNG DARI API:", gunungData);
        console.log("LENGTH GUNUNG DATA:", gunungData?.length);
        // -------------------------------------------

        setJalurList(jalurData);
        setAllGunungList(gunungData); // Simpan daftar semua gunung ke state
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Dependensi kosong agar hanya berjalan sekali saat komponen dimuat

  // Reset filter gunung jika value tidak ada di allGunungList
  useEffect(() => {
    if (
      gunungFilter !== "Semua" &&
      allGunungList.length > 0 &&
      !allGunungList.some((g) => String(g.id_gunung) === String(gunungFilter))
    ) {
      setGunungFilter("Semua");
    }
  }, [allGunungList, gunungFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm, gunungFilter, statusFilter, difficultyFilter]);

  const getKesulitanText = (skala) => {
    if (skala === null || skala === undefined) return "N/A";
    if (skala <= 3) return "Mudah";
    if (skala <= 7) return "Menengah";
    if (skala <= 10) return "Sulit";
    return "N/A";
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJalur.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJalur.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleDeleteJalur = async (id_jalur) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data jalur yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const csrfToken = await fetchCSRFToken(API_BASE_URL); // Ambil CSRF token terbaru
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/api/admin/jalur/${id_jalur}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          Swal.fire("Dihapus!", resJson.message, "success");
          setJalurList((prev) => prev.filter((j) => j.id_jalur !== id_jalur));
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  if (isLoading) return <div className="loading-container">Memuat data...</div>;
  if (error)
    return (
      <div className="form-error-message" style={{ margin: "20px" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="jalur-management-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <PageHeader
        title="Manajemen Data Jalur Pendakian"
        addLabel="Tambah Jalur Baru"
        onAddClick={() => navigate("/admin/jalur/new")}
      />

      <JalurToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        gunungFilter={gunungFilter}
        setGunungFilter={setGunungFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        allGunungList={allGunungList}
        filterGunungId={filterGunungId}
        onShowAllJalur={() => navigate("/admin/jalur")}
      />

      <JalurTable
        currentItems={currentItems}
        indexOfFirstItem={indexOfFirstItem}
        getKesulitanText={getKesulitanText}
        handleDeleteJalur={handleDeleteJalur}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      {currentItems.length === 0 && (
        <div style={{ margin: "24px", color: "#888" }}>
          Tidak ada data jalur untuk filter ini.
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredJalur.length}
        onPageChange={paginate}
        onItemsPerPageChange={handleItemsPerPageChange}
        indexOfFirstItem={indexOfFirstItem}
        currentItemsLength={currentItems.length}
      />
    </div>
  );
}

export default KelolaJalur;
