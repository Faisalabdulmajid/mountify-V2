import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PengaturanTarif.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function PengaturanTarif() {
  const [tarif, setTarif] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTarif = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/settings/tarif_per_km`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil tarif per km");
        const data = await res.json();
        setTarif(Number(data.value));
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTarif();
  }, []);

  const handleChange = (e) => {
    setTarif(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/settings/tarif_per_km`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: tarif }),
      });
      if (!res.ok) throw new Error("Gagal update tarif");
      toast.success("Tarif per km berhasil diupdate!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pengaturan-tarif-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h2>Pengaturan Tarif Transportasi per Km</h2>
      <p className="subtitle">
        Atur tarif transportasi per kilometer yang akan digunakan untuk menghitung biaya perjalanan otomatis
      </p>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Memuat pengaturan...</span>
        </div>
      ) : (
        <>
          <div className="info-card">
            <h4>Informasi Tarif</h4>
            <p>
              Tarif ini akan digunakan untuk menghitung biaya transportasi pulang-pergi secara otomatis 
              berdasarkan jarak ke basecamp gunung. Formula perhitungan:
            </p>
            <div className="example-calculation">
              Biaya PP = Jarak (km) × Tarif per Km<br/>
              Contoh: 50 km × Rp {tarif.toLocaleString('id-ID')} = Rp {(50 * tarif).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="form-container">
            <div className="form-header">
              <h3>Pengaturan Tarif</h3>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="tarif_per_km">Tarif per Kilometer</label>
                <div className="input-wrapper">
                  <span className="currency-prefix">Rp</span>
                  <input
                    type="number"
                    id="tarif_per_km"
                    name="tarif_per_km"
                    value={tarif}
                    onChange={handleChange}
                    min={0}
                    step={100}
                    disabled={loading || saving}
                    required
                    placeholder="Masukkan tarif per km"
                  />
                </div>
                <div className="input-help">
                  Tarif dalam Rupiah per kilometer. Disarankan antara Rp 1.000 - Rp 5.000
                </div>
              </div>
              
              <button type="submit" className="btn-save" disabled={loading || saving}>
                {saving ? "Menyimpan..." : "Simpan Tarif"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PengaturanTarif;
