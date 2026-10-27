import React from "react";

const PageHeaderToolbar = ({
  searchTerm,
  onSearchChange,
  jalurFilter,
  onFilterChange,
  filterKetinggian,
  onKetinggianFilterChange,
  showJalurFilter = true,
  showKetinggianFilter = true,
  searchPlaceholder = "Cari...",
}) => {
  const handleKetinggianChange = (e) => {
    const { name, value } = e.target;
    onKetinggianFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="toolbar-row">
      <div className="search-bar">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filters">
        {showJalurFilter && (
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
        )}
        {showKetinggianFilter && (
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
        )}
      </div>
    </div>
  );
};

export default PageHeaderToolbar;
