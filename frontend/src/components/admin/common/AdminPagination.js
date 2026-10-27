// src/components/admin/common/AdminPagination.js
import React from "react";
import "./AdminPagination.css";

const AdminPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  indexOfFirstItem,
  currentItemsLength,
  className = "",
}) => {
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const handleItemsPerPageChange = (value) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(parseInt(value, 10));
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          className="page-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis-start" className="page-ellipsis">
            ...
          </span>
        );
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="page-ellipsis">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  const indexOfLastItem = indexOfFirstItem + currentItemsLength;

  return (
    <div className={`admin-pagination ${className}`}>
      <div className="pagination-info">
        <span>
          Menampilkan {indexOfFirstItem + 1} - {indexOfLastItem} dari{" "}
          {totalItems} data
        </span>
        <div className="items-per-page">
          <label>Tampilkan:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>per halaman</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i>
            Sebelumnya
          </button>

          <div className="page-numbers">{renderPageNumbers()}</div>

          <button
            className="page-btn prev-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPagination;
