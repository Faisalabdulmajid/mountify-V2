// src/components/admin/common/PageHeader.js (VERSI BARU - REUSABLE)
import React from "react";
import { Link } from "react-router-dom";
import "./PageHeader.css"; // <-- MENAMBAHKAN IMPORT CSS-NYA SENDIRI

const PageHeader = ({ title, buttonText, buttonLink }) => {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {/* Tambahkan kondisi agar tombol tidak render jika tidak ada link/teks */}
      {buttonLink && buttonText && (
        <Link to={buttonLink} className="btn-add-new">
          <i className="bi bi-plus-lg"></i> {buttonText}
        </Link>
      )}
    </header>
  );
};

export default PageHeader;
