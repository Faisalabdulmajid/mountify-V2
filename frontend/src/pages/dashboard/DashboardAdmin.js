// src/pages/admin/dashboard/DashboardAdmin.js (ENHANCED WITH NEW WIDGETS)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./DashboardAdmin.css";

// Helper Component untuk Kartu Statistik
const StatCard = ({ icon, label, value, urgent, warning }) => (
  <div
    className={`stat-card ${urgent ? "urgent" : ""} ${
      warning ? "warning" : ""
    }`}
  >
    <div className="stat-icon">
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);



// Helper Component untuk Item Aktivitas
const ActivityItem = ({ icon, title, details, time }) => (
  <div className="activity-item">
    <div className="activity-icon">
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="activity-details">
      <span className="activity-title">{title}</span>
      <span className="activity-subtext">
        {details} -{" "}
        {new Date(time).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    </div>
  </div>
);

function DashboardAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    total_pengguna: 0,
    total_gunung: 0,
    total_jalur: 0,
    total_artikel: 0,
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [pendingItems, setPendingItems] = useState({
    pending_reports: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      try {
        const [statsRes, growthRes, pendingRes, activityRes] =
          await Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats/user-growth`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.REACT_APP_API_URL}/api/admin/pending-items`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.REACT_APP_API_URL}/api/admin/recent-activity`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (
          !statsRes.ok ||
          !growthRes.ok ||
          !pendingRes.ok ||
          !activityRes.ok
        ) {
          throw new Error("Gagal mengambil semua data dashboard.");
        }

        const statsData = await statsRes.json();
        const growthData = await growthRes.json();
        const pendingData = await pendingRes.json();
        const activityData = await activityRes.json();

        setStats(statsData);
        setUserGrowth(growthData);
        setPendingItems(pendingData);
        setRecentActivity(activityData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statsData = [
    {
      id: "rep",
      label: "Laporan Masuk",
      value: pendingItems.pending_reports,
      icon: "bi-shield-exclamation",
      urgent: true,
    },
    {
      id: 1,
      label: "Total Pengguna",
      value: stats.total_pengguna,
      icon: "bi-people-fill",
    },
    {
      id: 2,
      label: "Total Gunung",
      value: stats.total_gunung,
      icon: "bi-image-alt",
    },
    {
      id: 3,
      label: "Total Jalur",
      value: stats.total_jalur,
      icon: "bi-signpost-split-fill",
    },
    {
      id: 4,
      label: "Total Artikel",
      value: stats.total_artikel,
      icon: "bi-file-text-fill",
    },
  ];

  // Hapus menuData, tidak perlu lagi

  if (loading)
    return <div className="loading-container">Memuat data dashboard...</div>;

  return (
    <div className="dashboard-admin-page-content">
      <div className="dashboard-admin-container">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard Admin</h1>
            <p className="welcome-message">
              Selamat datang kembali,{" "}
              <strong>{user?.nama_lengkap || "Admin"}</strong>!
            </p>
          </div>

          <div className="header-actions">
            {/* Tombol untuk melihat situs publik, buka di tab baru */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-site"
            >
              <i className="bi bi-box-arrow-up-right"></i> Lihat Situs
            </a>
            <button onClick={handleLogout} className="btn-logout">
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="stats-container">
          {statsData.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </section>

        <section className="dashboard-main-section">
          <div className="widget-card">
            <h3>Pertumbuhan Pengguna (7 Hari Terakhir)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={userGrowth}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="tanggal" stroke="#666" />
                  <YAxis allowDecimals={false} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    name="Pengguna Baru"
                    stroke="#27ae60"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="widget-card">
            <h3>Aktivitas Terbaru</h3>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((act, index) => {
                  const activityProps =
                    act.type === "user_baru"
                      ? {
                          icon: "bi-person-plus-fill",
                          title: `Pengguna baru: ${act.title}`,
                          details: `Peran: ${act.details}`,
                        }
                      : {
                          icon: "bi-file-earmark-plus-fill",
                          title: `Artikel baru: ${act.title}`,
                          details: `Oleh: ${act.details}`,
                        };
                  return (
                    <ActivityItem
                      key={index}
                      {...activityProps}
                      time={act.timestamp}
                    />
                  );
                })
              ) : (
                <p>Belum ada aktivitas terbaru.</p>
              )}
            </div>
          </div>

          <div className="widget-card full-width-widget">
            <h3>Aksi Cepat</h3>
            <div className="quick-actions-grid">
              <Link
                to="/admin/announcements/new"
                className="quick-action-button"
              >
                <i className="bi bi-megaphone-fill"></i>
                <span>Buat Pengumuman</span>
              </Link>
              <Link to="/admin/articles/new" className="quick-action-button">
                <i className="bi bi-file-earmark-plus-fill"></i>
                <span>Tulis Artikel Baru</span>
              </Link>
              <Link to="/admin/gunung/new" className="quick-action-button">
                <i className="bi bi-image-alt"></i>
                <span>Tambah Gunung</span>
              </Link>
              <Link to="/admin/jalur/new" className="quick-action-button">
                <i className="bi bi-signpost-split-fill"></i>
                <span>Tambah Jalur</span>
              </Link>
              <Link to="/admin/pengaturan/tarif" className="quick-action-button">
                <i className="bi bi-gear-fill"></i>
                <span>Atur Tarif</span>
              </Link>
              <Link to="/admin/laporan-error" className="quick-action-button urgent">
                <i className="bi bi-shield-exclamation"></i>
                <span>Laporan Error</span>
                {pendingItems.pending_reports > 0 && (
                  <span className="notification-badge">{pendingItems.pending_reports}</span>
                )}
              </Link>
            </div>
          </div>
        </section>

        {/* Section Menu Manajemen dihapus sesuai permintaan */}
      </div>
    </div>
  );
}

export default DashboardAdmin;
