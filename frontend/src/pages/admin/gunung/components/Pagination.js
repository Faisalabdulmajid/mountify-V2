import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  indexOfFirstItem,
  currentItemsLength,
}) => {
  const handleItemsPerPageChange = (event) => {
    onItemsPerPageChange(parseInt(event.target.value, 10));
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>Baris per halaman:</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="items-per-page-select"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ marginLeft: "15px" }}>
          Menampilkan {currentItemsLength > 0 ? indexOfFirstItem + 1 : 0}-
          {indexOfFirstItem + currentItemsLength} dari {totalItems} data
        </span>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </button>
        <span>
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};
export default Pagination;
