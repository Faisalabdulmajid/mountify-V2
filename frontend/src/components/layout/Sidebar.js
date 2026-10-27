// src/components/layout/Sidebar.js

import React, { useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../../contexts/AuthContext";
import { AvatarImage } from "../../utils/avatarHelper";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // 1. Arahkan ke halaman utama TERLEBIH DAHULU dengan pesan notifikasi
    navigate("/", {
      state: { fromLogout: true, message: "Anda telah berhasil logout." },
    });

    // 2. Setelah navigasi diinisiasi, baru jalankan fungsi logout
    logout();
  };

  const closeSidebarIfMobile = () => {
    if (isOpen && window.innerWidth < 992) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    closeSidebarIfMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <i className="bi bi-shield-check sidebar-logo-icon"></i>
        <h2 className="sidebar-title">Admin Mountify</h2>
      </div>
      <nav className="sidebar-nav">
        <p className="nav-group-title">UTAMA</p>
        <NavLink
          to="/admin/dashboard"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        <p className="nav-group-title">MANAJEMEN KONTEN</p>
        <NavLink
          to="/admin/gunung"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-image-alt"></i>
          <span>Kelola Gunung</span>
        </NavLink>
        <NavLink
          to="/admin/jalur"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-signpost-split-fill"></i>
          <span>Kelola Jalur</span>
        </NavLink>
        <NavLink
          to="/admin/articles"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-file-text-fill"></i>
          <span>Kelola Artikel</span>
        </NavLink>
        {/*
        <NavLink
          to="/admin/gallery"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-images"></i>
          <span>Kelola Galeri</span>
        </NavLink>
        */}
        {/*
        <NavLink
          to="/admin/tags"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-tags-fill"></i>
          <span>Kelola Tags</span>
        </NavLink>
        */}

        <p className="nav-group-title">MANAJEMEN PENGGUNA</p>
        {/* Hanya tampilkan menu Kelola Pengguna untuk superadmin */}
        {user && user.peran === "superadmin" && (
          <NavLink
            to="/admin/users"
            className="nav-link"
            onClick={closeSidebarIfMobile}
          >
            <i className="bi bi-people-fill"></i>
            <span>Kelola Pengguna</span>
          </NavLink>
        )}

        <p className="nav-group-title">INTERAKSI & KOMUNITAS</p>
        <NavLink
          to="/admin/announcements"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-megaphone-fill"></i>
          <span>Pengumuman</span>
        </NavLink>
        <NavLink
          to="/admin/laporan-error"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-shield-exclamation"></i>
          <span>Laporan Error</span>
        </NavLink>

        <p className="nav-group-title">PENGATURAN</p>
        <NavLink
          to="/admin/pengaturan/tarif"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-gear-fill"></i>
          <span>Tarif Transportasi</span>
        </NavLink>
        
        <p className="nav-group-title">DATA & LAPORAN</p>
        <NavLink
          to="/admin/ekspor-data"
          className="nav-link"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-download"></i>
          <span>Ekspor Data</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="admin-profile">
          {user ? (
            <>
              <div className="admin-avatar">
                <AvatarImage 
                  avatarUrl={user.url_foto_profil}
                  userName={user.nama_lengkap}
                  className="admin-avatar-img"
                  size="40px"
                />
              </div>
              <div className="admin-details">
                <span className="admin-name">
                  {user.nama_lengkap || "Nama Admin"}
                </span>
                <span className="admin-role">{user.peran || "Peran"}</span>
              </div>
            </>
          ) : (
            <p>Memuat data pengguna...</p>
          )}
        </div>
        <Link
          to="/admin/profil"
          className="profile-link-sidebar"
          onClick={closeSidebarIfMobile}
        >
          <i className="bi bi-person-circle"></i>
          <span>Profil Saya</span>
        </Link>
        <button onClick={handleLogout} className="logout-button">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
