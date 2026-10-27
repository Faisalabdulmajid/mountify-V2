// src/layouts/AdminLayout.js (KODE LENGKAP FINAL)

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import "./AdminLayout.css";

function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 992);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ========================================================== */}
      {/* === PERUBAHAN DI SINI: Tombol dipisah dari header === */}
      {/* ========================================================== */}

      {/* Tombol ini sekarang mandiri agar bisa punya z-index tertinggi */}
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <i className={`bi ${isSidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      {/* Header Bar KHUSUS MOBILE */}
      <header className="mobile-header">
        {/* Judul tetap di sini */}
        <span className="mobile-header-title">Admin Mountify</span>
      </header>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
