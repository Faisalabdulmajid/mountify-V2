import React, { useState, useEffect } from "react";
import "./HalamanDataCuaca.css";

// Mock data untuk simulasi ketika API tidak tersedia
const mockWeatherData = {
  lokasi: {
    desa: "Cipanas",
    kecamatan: "Cianjur",
    kabupaten: "Cianjur",
    provinsi: "Jawa Barat",
  },
  prakiraanHarian: [
    {
      local_datetime: "202412290600",
      weather_desc: "Cerah Berawan",
      t: 18,
      hu: 85,
      ws: 5,
      wd: "Timur Laut",
      image: "https://cdn-icons-png.flaticon.com/64/1163/1163661.png",
    },
    {
      local_datetime: "202412290900",
      weather_desc: "Berawan",
      t: 22,
      hu: 80,
      ws: 7,
      wd: "Timur",
      image: "https://cdn-icons-png.flaticon.com/64/414/414927.png",
    },
    {
      local_datetime: "202412291200",
      weather_desc: "Berawan Tebal",
      t: 25,
      hu: 75,
      ws: 8,
      wd: "Tenggara",
      image: "https://cdn-icons-png.flaticon.com/64/414/414825.png",
    },
    {
      local_datetime: "202412291500",
      weather_desc: "Hujan Ringan",
      t: 23,
      hu: 90,
      ws: 6,
      wd: "Selatan",
      image: "https://cdn-icons-png.flaticon.com/64/3351/3351979.png",
    },
    {
      local_datetime: "202412291800",
      weather_desc: "Cerah Berawan",
      t: 20,
      hu: 88,
      ws: 4,
      wd: "Barat Daya",
      image: "https://cdn-icons-png.flaticon.com/64/1163/1163661.png",
    },
  ],
};

// Daftar gunung dengan data cuaca mock yang disesuaikan
const gunungList = [
  {
    id: 1,
    name: "Gunung Gede",
    location: "Jawa Barat",
    kodeWilayah: "501211",
    mockData: {
      ...mockWeatherData,
      lokasi: { ...mockWeatherData.lokasi, desa: "Cipanas" },
    },
  },
  {
    id: 2,
    name: "Gunung Bromo",
    location: "Jawa Timur",
    kodeWilayah: "501330",
    mockData: {
      ...mockWeatherData,
      lokasi: {
        ...mockWeatherData.lokasi,
        desa: "Sukapura",
        kecamatan: "Probolinggo",
        provinsi: "Jawa Timur",
      },
      prakiraanHarian: mockWeatherData.prakiraanHarian.map((item) => ({
        ...item,
        t: item.t - 3, // Suhu lebih dingin di Bromo
        hu: item.hu - 5,
      })),
    },
  },
  {
    id: 3,
    name: "Gunung Rinjani",
    location: "NTB",
    kodeWilayah: "501062",
    mockData: {
      ...mockWeatherData,
      lokasi: {
        ...mockWeatherData.lokasi,
        desa: "Sembalun",
        kecamatan: "Lombok Timur",
        provinsi: "NTB",
      },
      prakiraanHarian: mockWeatherData.prakiraanHarian.map((item) => ({
        ...item,
        t: item.t - 2,
        hu: item.hu - 10,
        ws: item.ws + 3,
      })),
    },
  },
  {
    id: 4,
    name: "Gunung Semeru",
    location: "Jawa Timur",
    kodeWilayah: "501326",
    mockData: {
      ...mockWeatherData,
      lokasi: {
        ...mockWeatherData.lokasi,
        desa: "Pasrujambe",
        kecamatan: "Lumajang",
        provinsi: "Jawa Timur",
      },
      prakiraanHarian: mockWeatherData.prakiraanHarian.map((item) => ({
        ...item,
        t: item.t - 4,
        ws: item.ws + 2,
        hu: item.hu - 15,
      })),
    },
  },
];

function HalamanDataCuaca() {
  const [selectedGunungId, setSelectedGunungId] = useState("");
  const [cuacaData, setCuacaData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useRealAPI, setUseRealAPI] = useState(false);

  useEffect(() => {
    // Otomatis pilih gunung pertama saat komponen dimuat
    if (gunungList.length > 0) {
      setSelectedGunungId(gunungList[0].id.toString());
    }
  }, []);

  useEffect(() => {
    if (!selectedGunungId) return;

    const fetchWeatherData = async () => {
      const selectedGunung = gunungList.find(
        (g) => g.id.toString() === selectedGunungId
      );
      if (!selectedGunung) return;

      setIsLoading(true);
      setError(null);
      setCuacaData(null);

      try {
        if (useRealAPI) {
          // Coba gunakan API BMKG yang sebenarnya
          const apiUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${selectedGunung.kodeWilayah}`;

          // Gunakan proxy atau CORS handler jika tersedia
          const response = await fetch(apiUrl, {
            mode: "cors",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();
          console.log("Data dari BMKG:", data);

          // Proses data yang diterima dari API
          const processedData = {
            lokasi: data.lokasi || selectedGunung.mockData.lokasi,
            prakiraanHarian:
              data.data?.[0]?.cuaca?.[0] ||
              selectedGunung.mockData.prakiraanHarian,
          };
          setCuacaData(processedData);
        } else {
          // Simulasi loading delay untuk membuat lebih realistis
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Gunakan mock data
          setCuacaData(selectedGunung.mockData);
        }
      } catch (err) {
        console.error("Weather API Error:", err);

        // Fallback ke mock data jika API gagal
        console.log("Menggunakan data simulasi karena API tidak tersedia");
        setError(
          "Menggunakan data simulasi karena API BMKG tidak dapat diakses langsung dari browser. Ini normal untuk development."
        );

        // Tetap tampilkan data mock
        setCuacaData(selectedGunung.mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedGunungId, useRealAPI]);

  const handleGunungChange = (event) => {
    setSelectedGunungId(event.target.value);
  };

  const formatTime = (datetime) => {
    if (!datetime || datetime.length < 4) return datetime;
    const timeStr = datetime.slice(-4);
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderCuacaSaatIni = (prakiraan) => {
    if (!prakiraan || prakiraan.length === 0) return null;
    const cuacaSekarang = prakiraan[0];

    return (
      <div className="current-weather-card">
        <div className="weather-icon-big">
          <img
            src={cuacaSekarang.image}
            alt={cuacaSekarang.weather_desc}
            onError={(e) => {
              e.target.src =
                "https://cdn-icons-png.flaticon.com/64/1163/1163661.png";
            }}
          />
        </div>
        <div className="weather-details">
          <p className="weather-summary">{cuacaSekarang.weather_desc}</p>
          <p className="weather-temperature">{cuacaSekarang.t}°C</p>
          <div className="weather-extra-info">
            <span>
              <i className="bi bi-droplet-fill"></i> Kelembapan:{" "}
              {cuacaSekarang.hu}%
            </span>
            <span>
              <i className="bi bi-wind"></i> Angin: {cuacaSekarang.ws} km/j dari{" "}
              {cuacaSekarang.wd}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const selectedGunung = gunungList.find(
    (g) => g.id.toString() === selectedGunungId
  );

  return (
    <div className="weather-page-container">
      <div className="weather-page-header">
        <h1>
          <i className="bi bi-thermometer-sun"></i> Data Cuaca Gunung
        </h1>
        <p>Informasi cuaca terkini untuk pendakian gunung di Indonesia</p>
        <div className="date-info">
          <i className="bi bi-calendar-event"></i> {formatDate()}
        </div>
      </div>

      <div className="mountain-selector-container">
        <label htmlFor="gunung-select">Pilih Gunung:</label>
        <select
          id="gunung-select"
          value={selectedGunungId}
          onChange={handleGunungChange}
          className="mountain-select"
        >
          <option value="">-- Pilih Gunung --</option>
          {gunungList.map((gunung) => (
            <option key={gunung.id} value={gunung.id}>
              {gunung.name} ({gunung.location})
            </option>
          ))}
        </select>
      </div>

      {/* Toggle untuk development */}
      <div className="api-toggle-container">
        <label className="api-toggle">
          <input
            type="checkbox"
            checked={useRealAPI}
            onChange={(e) => setUseRealAPI(e.target.checked)}
          />
          <span>Coba gunakan API BMKG asli (mungkin gagal karena CORS)</span>
        </label>
      </div>

      {!selectedGunungId && (
        <div className="select-prompt">
          <i className="bi bi-arrow-up"></i>
          <p>Silakan pilih gunung untuk melihat data cuaca</p>
        </div>
      )}

      {isLoading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Mengambil data cuaca...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-info-circle"></i>
          <p>{error}</p>
        </div>
      )}

      {cuacaData && !isLoading && selectedGunung && (
        <div className="weather-info-container">
          <div className="location-header">
            <h2>
              <i className="bi bi-geo-alt-fill"></i>
              {selectedGunung.name}
            </h2>
            <p className="location-details">
              {cuacaData.lokasi.desa}, {cuacaData.lokasi.kecamatan},{" "}
              {cuacaData.lokasi.provinsi}
            </p>
          </div>

          {renderCuacaSaatIni(cuacaData.prakiraanHarian)}

          <h3>
            <i className="bi bi-clock-history"></i>
            Prakiraan Cuaca Hari Ini
          </h3>

          <div className="table-container">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>
                    <i className="bi bi-clock"></i> Waktu
                  </th>
                  <th>
                    <i className="bi bi-cloud-sun"></i> Cuaca
                  </th>
                  <th>
                    <i className="bi bi-thermometer"></i> Suhu
                  </th>
                  <th>
                    <i className="bi bi-droplet"></i> Kelembapan
                  </th>
                  <th>
                    <i className="bi bi-wind"></i> Angin
                  </th>
                </tr>
              </thead>
              <tbody>
                {cuacaData.prakiraanHarian.map((prakiraan, index) => (
                  <tr key={index} className={index === 0 ? "current-time" : ""}>
                    <td className="time-cell">
                      {formatTime(prakiraan.local_datetime)}
                    </td>
                    <td className="weather-cell">
                      <img
                        src={prakiraan.image}
                        alt={prakiraan.weather_desc}
                        className="weather-icon-small"
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/64/1163/1163661.png";
                        }}
                      />
                      <span>{prakiraan.weather_desc}</span>
                    </td>
                    <td className="temp-cell">{prakiraan.t}°C</td>
                    <td className="humidity-cell">{prakiraan.hu}%</td>
                    <td className="wind-cell">
                      {prakiraan.ws} km/j
                      <br />
                      <small>({prakiraan.wd})</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="weather-tips">
            <h4>
              <i className="bi bi-lightbulb"></i>
              Tips Cuaca untuk Pendakian
            </h4>
            <div className="tips-grid">
              <div className="tip-card">
                <i className="bi bi-thermometer-low"></i>
                <p>Suhu di gunung bisa turun drastis, bawa pakaian hangat</p>
              </div>
              <div className="tip-card">
                <i className="bi bi-cloud-drizzle"></i>
                <p>
                  Perhatikan prakiraan hujan, bawa jas hujan dan perlengkapan
                  waterproof
                </p>
              </div>
              <div className="tip-card">
                <i className="bi bi-wind"></i>
                <p>
                  Angin kencang dapat mempengaruhi visibilitas dan kenyamanan
                </p>
              </div>
              <div className="tip-card">
                <i className="bi bi-droplet-half"></i>
                <p>
                  Kelembapan tinggi dapat mempercepat dehidrasi, bawa air yang
                  cukup
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HalamanDataCuaca;
