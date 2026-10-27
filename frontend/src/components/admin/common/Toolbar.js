// src/components/admin/common/Toolbar.js (Komponen Wadah Generik)
import React from "react";
import "./Toolbar.css";

const Toolbar = ({ searchSlot, filterSlot }) => {
  return (
    <div className="toolbar">
      {/* Slot untuk Baris Pertama (Pencarian) */}
      <div className="toolbar-row">{searchSlot}</div>

      {/* Slot untuk Baris Kedua (Filter) */}
      <div className="toolbar-row filter-row">{filterSlot}</div>
    </div>
  );
};

export default Toolbar;
