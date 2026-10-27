import React from "react";

const PageHeaderJalurToolbar = ({
  searchTerm,
  onSearchChange,
  gunungFilter,
  onGunungFilterChange,
  allGunungList,
  filterGunungId,
  statusFilter,
  onStatusFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
  onShowAllJalur,
}) => {
  return (
    <div className="toolbar-row">
      <div className="search-bar">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Cari berdasarkan nama jalur..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filters">
        <div className="filter-group">
          <label>Gunung:</label>
          <select
            value={gunungFilter}
            onChange={(e) => onGunungFilterChange(e.target.value)}
            disabled={!!filterGunungId}
          >
            <option value="Semua">Semua Gunung</option>
            {allGunungList.map((gunung) => (
              <option key={gunung.id_gunung} value={gunung.id_gunung}>
                {gunung.nama_gunung}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Buka">Buka</option>
            <option value="Tutup Sementara">Tutup Sementara</option>
            <option value="Tutup">Tutup</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Kesulitan:</label>
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyFilterChange(e.target.value)}
          >
            <option value="Semua">Semua Tingkat</option>
            <option value="Mudah">Mudah</option>
            <option value="Menengah">Menengah</option>
            <option value="Sulit">Sulit</option>
          </select>
        </div>
      </div>
      {filterGunungId && (
        <button className="btn-secondary" onClick={onShowAllJalur}>
          Tampilkan Semua Jalur
        </button>
      )}
    </div>
  );
};

export default PageHeaderJalurToolbar;
