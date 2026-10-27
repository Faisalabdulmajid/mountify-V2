import React from "react";
import { Link } from "react-router-dom";
import "./ComingSoon.css";

function ComingSoon() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <i className="bi bi-tools coming-soon-icon"></i>
        <h1 className="coming-soon-title">Fitur Dalam Pengembangan</h1>
        <p className="coming-soon-text">
          Halaman yang Anda tuju sedang kami persiapkan dan akan segera
          tersedia.
          <br />
          Terima kasih atas kesabaran Anda.
        </p>
        <Link to="/admin/dashboard" className="btn-back-dashboard">
          <i className="bi bi-arrow-left"></i> Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

export default ComingSoon;
