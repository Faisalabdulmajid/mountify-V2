// src/pages/admin/gunung/components/GunungToolbar.js (UPDATED - Konsisten dengan JalurToolbar)
import React from "react";

const GunungToolbar = ({
  searchTerm,
  onSearchChange,
  jalurFilter,
  onFilterChange,
  filterKetinggian,
  onKetinggianFilterChange,
}) => {
  const handleKetinggianChange = (e) => {
    const { name, value } = e.target;
    onKetinggianFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="toolbar">
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari berdasarkan nama gunung atau lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-group">
          <label>Jalur:</label>
          <select
            value={jalurFilter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="Semua">Semua</option>
            <option value="Punya Jalur">Punya Jalur</option>
            <option value="Belum Ada Jalur">Belum Ada Jalur</option>
          </select>
        </div>

        <div className="filter-group ketinggian-group">
          <label>Ketinggian (mdpl):</label>
          <div className="ketinggian-inputs">
            <input
              type="number"
              name="min"
              placeholder="Min"
              value={filterKetinggian.min}
              onChange={handleKetinggianChange}
              className="ketinggian-input"
            />
            <span className="separator">-</span>
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

export default GunungToolbar;
