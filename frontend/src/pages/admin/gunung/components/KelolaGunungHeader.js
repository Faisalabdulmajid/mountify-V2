// src/pages/admin/gunung/components/KelolaGunungHeader.js
import React from "react";
import { useNavigate } from "react-router-dom";

// DEPRECATED: Gunakan PageHeader dan PageHeaderToolbar dari src/components/common/PageHeader/
// File ini tidak lagi digunakan dan bisa dihapus setelah migrasi selesai.
export {};

const KelolaGunungHeader = ({
  searchTerm,
  onSearchChange,
  jalurFilter,
  onFilterChange,
  filterKetinggian,
  onKetinggianFilterChange,
}) => {
  const navigate = useNavigate();

  const handleKetinggianChange = (e) => {
    const { name, value } = e.target;
    onKetinggianFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="controls-container">
      <div className="header-row">
        <h1 className="page-title">Manajemen Data Gunung</h1>
        <button
          className="btn-add-new"
          onClick={() => navigate("/admin/gunung/new")}
        >
          <i className="bi bi-plus-lg"></i> Tambah Gunung
        </button>
      </div>
      <div className="toolbar-row">
        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari gunung atau lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="jalur-filter">Jalur:</label>
            <select
              id="jalur-filter"
              value={jalurFilter}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Punya Jalur">Punya Jalur</option>
              <option value="Belum Ada Jalur">Belum Ada</option>
            </select>
          </div>
          <div className="filter-group ketinggian-group">
            <label>Ketinggian (mdpl):</label>
            <input
              type="number"
              name="min"
              placeholder="Min"
              value={filterKetinggian.min}
              onChange={handleKetinggianChange}
              className="ketinggian-input"
            />
            <span>-</span>
            <input
              type="number"
              name="max"
              placeholder="Maks"
              value={filterKetinggian.max}
              onChange={handleKetinggianChange}
              className="ketinggian-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelolaGunungHeader;
