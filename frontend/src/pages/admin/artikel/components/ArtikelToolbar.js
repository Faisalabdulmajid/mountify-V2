import React from "react";

const ArtikelToolbar = ({ searchTerm, setSearchTerm, setCurrentPage }) => {
  return (
    <div className="toolbar">
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari artikel (judul, kategori, penulis)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtikelToolbar;
