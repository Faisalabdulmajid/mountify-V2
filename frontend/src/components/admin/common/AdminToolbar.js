// src/components/admin/common/AdminToolbar.js
import React from "react";
import "./AdminToolbar.css";

const AdminToolbar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filters = [],
  extraActions = null,
  className = "",
}) => {
  return (
    <div className={`admin-toolbar ${className}`}>
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {filters.length > 0 && (
        <div className="filter-container">
          {filters.map((filter, index) => (
            <div key={index} className="filter-group">
              <label>{filter.label}:</label>
              {filter.type === "select" ? (
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  disabled={filter.disabled}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === "range" ? (
                <div className="range-input-group">
                  <input
                    type="number"
                    placeholder={filter.minPlaceholder || "Min"}
                    value={filter.value.min}
                    onChange={(e) =>
                      filter.onChange({ ...filter.value, min: e.target.value })
                    }
                    className="range-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder={filter.maxPlaceholder || "Max"}
                    value={filter.value.max}
                    onChange={(e) =>
                      filter.onChange({ ...filter.value, max: e.target.value })
                    }
                    className="range-input"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {extraActions && <div className="extra-actions">{extraActions}</div>}
    </div>
  );
};

export default AdminToolbar;
