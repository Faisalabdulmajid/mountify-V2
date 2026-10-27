import React from "react";

// Konstanta enum status jalur - harus sama dengan backend
const TRAIL_STATUS_OPTIONS = [
  "Belum Diketahui",
  "Buka",
  "Tutup Sementara",
  "Tutup",
];

const JalurToolbar = ({
  searchTerm,
  setSearchTerm,
  gunungFilter,
  setGunungFilter,
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  allGunungList,
  filterGunungId,
  onShowAllJalur,
}) => {
  return (
    <div className="toolbar">
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari berdasarkan nama jalur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-group">
          <label>Gunung:</label>
          <select
            value={gunungFilter}
            onChange={(e) => {
              setGunungFilter(e.target.value);
            }}
            disabled={!!filterGunungId}
          >
            <option value="Semua">Semua Gunung</option>
            {allGunungList && allGunungList.length > 0 ? (
              allGunungList.map((gunung) => (
                <option key={gunung.id_gunung} value={gunung.id_gunung}>
                  {gunung.nama_gunung}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading gunung...</option>
            )}
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            {TRAIL_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Kesulitan:</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
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

export default JalurToolbar;
