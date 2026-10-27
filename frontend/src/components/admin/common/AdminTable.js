// src/components/admin/common/AdminTable.js
import React from "react";
import "./AdminTable.css";

const AdminTable = ({
  columns,
  data,
  sortConfig,
  onSort,
  loading = false,
  emptyMessage = "Tidak ada data yang ditemukan",
  className = "",
}) => {
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return "bi-chevron-expand";
    }
    return sortConfig.direction === "ascending"
      ? "bi-chevron-up"
      : "bi-chevron-down";
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                {column.sortable ? (
                  <div
                    className="header-cell-content"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    <i
                      className={`bi ${getSortIcon(column.key)} ${
                        sortConfig?.key === column.key ? "sort-icon-active" : ""
                      }`}
                    />
                  </div>
                ) : (
                  <span>{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(item, index)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-message">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
