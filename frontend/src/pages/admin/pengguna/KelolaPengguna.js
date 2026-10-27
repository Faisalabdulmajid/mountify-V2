// KelolaPengguna.js (Menampilkan Semua Data Pengguna)
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./KelolaPengguna.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import Pagination from "../../../components/common/Pagination";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function KelolaPengguna() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Akses ditolak. Silakan login kembali.");
        }
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Gagal mengambil data pengguna.");
        }

        const data = await response.json();
        const formattedUsers = data.map((user) => ({
          id_user: user.id_user,
          name: user.nama_lengkap,
          username: user.username,
          email: user.email,
          peran: user.peran,
          status: user.status,
          joinedDate: user.created_at,
          // Gunakan url_foto_profil asli, jika tidak ada tampilkan string kosong (bukan dummy)
          avatar: user.url_foto_profil || "",
          nomor_telepon: user.nomor_telepon,
          domisili: user.domisili,
          instansi: user.instansi,
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.nomor_telepon && user.nomor_telepon.includes(searchTerm)) ||
        (user.domisili && user.domisili.toLowerCase().includes(searchLower)) ||
        (user.instansi && user.instansi.toLowerCase().includes(searchLower));

      const matchesFilter = roleFilter === "Semua" || user.peran === roleFilter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, roleFilter]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);



  const handleDeleteUser = async (id) => {
    const userToDelete = users.find((u) => u.id_user === id);
    if (!userToDelete) {
      toast.error("Pengguna tidak ditemukan!");
      return;
    }

    const result = await Swal.fire({
      title: `Hapus Pengguna?`,
      text: `Apakah Anda yakin ingin menghapus pengguna: ${userToDelete.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Akses ditolak. Sesi Anda mungkin telah berakhir.");
          toast.error("Akses ditolak. Sesi Anda mungkin telah berakhir.");
          return;
        }

        // Tidak perlu CSRF token, cukup Authorization
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("[DEBUG] Delete user error detail:", data);
          throw new Error(data.message || "Gagal menghapus pengguna.");
        }

        toast.success(data.message || "Pengguna berhasil dihapus.");
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id_user !== id)
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.message);
        toast.error(
          error.message || "Terjadi kesalahan saat menghapus pengguna."
        );
      }
    }
  };

  // Ambil peran user login dari localStorage
  const currentUserRole = localStorage.getItem("peran");

  // Redirect jika bukan superadmin
  useEffect(() => {
    if (currentUserRole !== "superadmin") {
      navigate("/admin/dashboard", { 
        replace: true,
        state: { 
          error: "Anda tidak memiliki akses ke halaman manajemen pengguna." 
        }
      });
    }
  }, [currentUserRole, navigate]);

  // Jika bukan superadmin, jangan render komponen
  if (currentUserRole !== "superadmin") {
    return null;
  }

  return (
    <div className="user-management-page">
      <PageHeader
        title="Manajemen Pengguna"
        addLabel={
          currentUserRole === "superadmin"
            ? "Tambah Pengguna Baru"
            : undefined
        }
        onAddClick={() => navigate("/admin/users/new")}
      >
        <div className="toolbar">
          <div className="search-container">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Cari (nama, email, username, no.telp, domisili, instansi)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Semua">Semua Peran</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </PageHeader>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ width: "18%" }}>
                <div className="header-cell-content">
                  <span>Pengguna</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>No. Telepon</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Domisili</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Instansi</span>
                </div>
              </th>
              <th style={{ width: "10%" }}>
                <div className="header-cell-content">
                  <span>Peran</span>
                </div>
              </th>
              <th style={{ width: "10%" }}>
                <div className="header-cell-content">
                  <span>Status</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Bergabung</span>
                </div>
              </th>
              <th style={{ width: "14%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Memuat data pengguna...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: "center", padding: "20px", color: "red" }}
                >
                  Error: {error}
                </td>
              </tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id_user}>
                  <td>
                    <div className="user-info-cell">
                      {/* Avatar dihilangkan */}
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.nomor_telepon || "-"}</td>
                  <td>{user.domisili || "-"}</td>
                  <td>{user.instansi || "-"}</td>
                  <td>{user.peran}</td>
                  <td>
                    <span
                      className={`status-badge status-${user.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {new Date(user.joinedDate).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    {currentUserRole === "superadmin" ? (
                      <div className="action-buttons">
                        <button
                          className="action-btn btn-edit"
                          onClick={() =>
                            navigate(`/admin/users/edit/${user.id_user}`)
                          }
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="action-btn btn-delete"
                          onClick={() => handleDeleteUser(user.id_user)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: "12px" }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Tidak ada pengguna yang cocok dengan kriteria Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={usersPerPage}
        totalItems={filteredUsers.length}
        onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        onItemsPerPageChange={(value) => {
          setUsersPerPage(value);
          setCurrentPage(1);
        }}
        indexOfFirstItem={indexOfFirstUser}
        currentItemsLength={currentUsers.length}
      />
    </div>
  );
}

export default KelolaPengguna;
