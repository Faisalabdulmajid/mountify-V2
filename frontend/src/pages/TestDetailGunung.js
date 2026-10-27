import React, { useState, useEffect } from "react";

const TestDetailGunung = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 Starting API call to fetch Gunung Sumbing...");

    fetch("http://localhost:5000/api/gunung/65")
      .then((response) => {
        console.log("📡 Response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("✅ Data received:", data);
        console.log("🏔️ Jalur pendakian:", data.jalur_pendakian);
        console.log("📊 Jumlah jalur:", data.jalur_pendakian?.length);

        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>{data.nama_gunung}</h1>
      <p>Ketinggian: {data.ketinggian_puncak_mdpl} mdpl</p>

      <h2>Jalur Pendakian ({data.jalur_pendakian?.length || 0})</h2>

      {data.jalur_pendakian && data.jalur_pendakian.length > 0 ? (
        <div>
          {data.jalur_pendakian.map((jalur, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {jalur.nama_jalur}
              </h3>
              <p>
                <strong>Kesulitan:</strong> {jalur.kesulitan_skala}/10
              </p>
              <p>
                <strong>Estimasi waktu:</strong> {jalur.estimasi_waktu_jam} jam
              </p>
              <p>
                <strong>Status:</strong> {jalur.status_jalur}
              </p>
              <p>
                <strong>Biaya Simaksi:</strong> Rp{" "}
                {jalur.biaya_simaksi?.toLocaleString()}
              </p>
              <p>
                <strong>Biaya PP:</strong> Rp{" "}
                {jalur.biaya_pulang_pergi?.toLocaleString()}
              </p>
              <p>
                <strong>Total:</strong> Rp{" "}
                {jalur.estimasi_biaya_total?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff3cd",
            borderRadius: "8px",
          }}
        >
          <p>❌ Tidak ada data jalur pendakian</p>
          <p>Debug info:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestDetailGunung;
