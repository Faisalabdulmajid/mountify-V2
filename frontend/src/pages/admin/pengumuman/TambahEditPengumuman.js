// src/pages/admin/pengumuman/TambahEditPengumuman.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahEditPengumuman.css";

// --- 1. IMPORT EDITOR ---
// Pastikan path ini benar sesuai dengan struktur folder proyek Anda
import TipTapEditor from "../../../components/common/TipTapEditor";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function TambahEditPengumuman() {
  const navigate = useNavigate();
  const { id_pengumuman } = useParams();
  const isEditMode = Boolean(id_pengumuman);

  const [gunungList, setGunungList] = useState([]);
  const [jalurList, setJalurList] = useState([]);
  const [targetType, setTargetType] = useState("umum");

  const [formData, setFormData] = useState({
    judul: "",
    isi_pengumuman: "", // Ini akan diisi oleh TipTap
    id_gunung: "",
    id_jalur: "",
    berlaku_mulai: "",
    berlaku_sampai: "",
    status: "Draft",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daftar gunung dan jalur untuk dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [gunungRes, jalurRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/gunung`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/jalur`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!gunungRes.ok || !jalurRes.ok)
          throw new Error("Gagal memuat data relasi untuk target.");
        setGunungList(await gunungRes.json());
        setJalurList(await jalurRes.json());
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchDropdownData();
  }, []);

  // Fetch data pengumuman jika dalam mode edit
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPengumumanById = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/admin/announcements/${id_pengumuman}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Pengumuman tidak ditemukan.");
        const data = await response.json();

        const formatDateForInput = (dateStr) =>
          dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

        setFormData({
          judul: data.judul,
          isi_pengumuman: data.isi_pengumuman,
          id_gunung: data.id_gunung || "",
          id_jalur: data.id_jalur || "",
          berlaku_mulai: formatDateForInput(data.berlaku_mulai),
          berlaku_sampai: formatDateForInput(data.berlaku_sampai),
          status: data.status || "Draft",
        });

        if (data.id_jalur) {
          setTargetType("jalur");
        } else if (data.id_gunung) {
          setTargetType("gunung");
        } else {
          setTargetType("umum");
        }
      } catch (err) {
        toast.error(err.message);
        navigate("/admin/announcements");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPengumumanById();
  }, [id_pengumuman, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- 2. TAMBAHKAN HANDLER BARU ---
  // Fungsi ini khusus untuk menerima update konten dari TipTapEditor
  const handleKontenChange = (newContent) => {
    setFormData((prev) => ({ ...prev, isi_pengumuman: newContent }));
  };

  const handleTargetChange = (e) => {
    const newTargetType = e.target.value;
    setTargetType(newTargetType);
    if (newTargetType === "umum") {
      setFormData((prev) => ({ ...prev, id_gunung: "", id_jalur: "" }));
    } else if (newTargetType === "gunung") {
      setFormData((prev) => ({ ...prev, id_jalur: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi_pengumuman) {
      toast.warn("Judul dan Isi Pengumuman wajib diisi.");
      return;
    }
    if (
      formData.status === "Published" &&
      (!formData.berlaku_mulai || !formData.berlaku_sampai)
    ) {
      toast.warn("Untuk status 'Published', rentang tanggal wajib diisi.");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const url = isEditMode
      ? `${API_BASE_URL}/api/admin/announcements/${id_pengumuman}`
      : `${API_BASE_URL}/api/admin/announcements`;
    const method = isEditMode ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message || "Operasi gagal.");
      toast.success(resJson.message);
      setTimeout(() => navigate("/admin/announcements"), 1500);
    } catch (err) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="add-edit-pengumuman-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="page-header">
        <h1>{isEditMode ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</h1>
        <Link to="/admin/announcements" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="form-widget-pengumuman">
        <div className="form-group">
          <label htmlFor="judul">Judul Pengumuman</label>
          <input
            type="text"
            id="judul"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="cth: Penutupan Jalur Cemoro Sewu"
          />
        </div>
        <div className="form-group">
          <label htmlFor="isi_pengumuman">Isi Pengumuman</label>
          {/* --- 3. GANTI TEXTAREA DENGAN TIPTAPEDITOR --- */}
          <TipTapEditor
            content={formData.isi_pengumuman}
            onContentChange={handleKontenChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Draft">Draft (Simpan sebagai draf)</option>
            <option value="Published">Published (Publikasikan)</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Target Pengumuman</label>
            <select
              value={targetType}
              onChange={handleTargetChange}
              disabled={isLoading}
            >
              <option value="umum">Umum (Semua Pengguna)</option>
              <option value="gunung">Spesifik Gunung</option>
              <option value="jalur">Spesifik Jalur</option>
            </select>
          </div>
          {targetType === "gunung" && (
            <div className="form-group">
              <label htmlFor="id_gunung">Pilih Gunung</label>
              <select
                id="id_gunung"
                name="id_gunung"
                value={formData.id_gunung}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">-- Pilih Gunung --</option>
                {gunungList.map((g) => (
                  <option key={g.id_gunung} value={g.id_gunung}>
                    {g.nama_gunung}
                  </option>
                ))}
              </select>
            </div>
          )}
          {targetType === "jalur" && (
            <div className="form-group">
              <label htmlFor="id_jalur">Pilih Jalur</label>
              <select
                id="id_jalur"
                name="id_jalur"
                value={formData.id_jalur}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">-- Pilih Jalur --</option>
                {jalurList.map((j) => (
                  <option key={j.id_jalur} value={j.id_jalur}>
                    {j.nama_jalur} ({j.nama_gunung})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="berlaku_mulai">Berlaku Mulai</label>
            <input
              type="date"
              id="berlaku_mulai"
              name="berlaku_mulai"
              value={formData.berlaku_mulai}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="berlaku_sampai">Berlaku Sampai</label>
            <input
              type="date"
              id="berlaku_sampai"
              name="berlaku_sampai"
              value={formData.berlaku_sampai}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/announcements")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Pengumuman"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahEditPengumuman;
