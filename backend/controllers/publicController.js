const pool = require("../config/database");
const logger = require("../logger");

// Get all mountains (public)
const getAllMountains = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_gunung, nama_gunung, ketinggian_puncak_mdpl, lokasi_administratif, url_thumbnail FROM gunung ORDER BY nama_gunung"
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching public mountains:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Get all trails (public)
const getAllTrails = async (req, res) => {
  try {
    // Ambil koordinat user dari query string jika ada
    const userLat = parseFloat(req.query.user_lat);
    const userLng = parseFloat(req.query.user_lng);
    const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

    // Ambil koordinat basecamp manual dari query string jika ada
    const manualBasecampLat = parseFloat(req.query.basecamp_lat);
    const manualBasecampLng = parseFloat(req.query.basecamp_lng);
    const hasManualBasecamp =
      !isNaN(manualBasecampLat) && !isNaN(manualBasecampLng);

    // Ambil semua jalur beserta titik_awal_koordinat
    const query = `
      SELECT 
        j.id_jalur, j.nama_jalur, g.nama_gunung, g.ketinggian_puncak_mdpl,
        j.estimasi_waktu_jam, j.status_jalur, j.estimasi_biaya_total,
        j.biaya_simaksi, j.biaya_pulang_pergi, j.titik_awal_koordinat,
        j.latitude, j.longitude, g.url_thumbnail
      FROM jalur_pendakian j
      JOIN gunung g ON j.id_gunung = g.id_gunung
      ORDER BY g.nama_gunung, j.nama_jalur;
    `;
    const result = await pool.query(query);
    const trails = result.rows;

    // Ambil tarif_per_km dari tabel settings
    let tarifPerKm = 5000; // fallback default
    try {
      const tarifResult = await pool.query(
        "SELECT value FROM settings WHERE key = 'tarif_per_km' LIMIT 1"
      );
      if (tarifResult.rows.length > 0) {
        tarifPerKm = parseInt(tarifResult.rows[0].value, 10);
        if (isNaN(tarifPerKm)) tarifPerKm = 5000;
      }
    } catch (e) {
      logger.error(
        "Gagal mengambil tarif_per_km dari settings, pakai default 5000",
        e
      );
    }

    // Helper untuk parsing titik_awal_koordinat (misal: 'POINT(lon lat)')
    function parsePoint(str) {
      if (!str || typeof str !== "string") return null;
      const match = str.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (match) {
        return {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2]),
        };
      }
      return null;
    }

    // Haversine formula
    function haversine(lat1, lon1, lat2, lon2) {
      function toRad(x) {
        return (x * Math.PI) / 180;
      }
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const trailsWithDistance = await Promise.all(
      trails.map(async (trail) => {
        let basecampCoord = parsePoint(trail.titik_awal_koordinat);
        let jarak = null;
        if (hasUserLocation) {
          if (
            basecampCoord &&
            !isNaN(basecampCoord.latitude) &&
            !isNaN(basecampCoord.longitude)
          ) {
            jarak = haversine(
              userLat,
              userLng,
              basecampCoord.latitude,
              basecampCoord.longitude
            );
          } else if (hasManualBasecamp) {
            jarak = haversine(
              userLat,
              userLng,
              manualBasecampLat,
              manualBasecampLng
            );
          }
        }

        // Biaya pulang pergi - gunakan manual atau hitung otomatis
        let biayaPP = trail.biaya_pulang_pergi;
        let autoPP = false;

        // Jika tidak ada biaya PP manual dan ada koordinat, hitung otomatis
        if (
          (!biayaPP || biayaPP === 0) &&
          basecampCoord &&
          basecampCoord.latitude &&
          basecampCoord.longitude
        ) {
          const distance = haversine(
            -6.2088,
            106.8456,
            basecampCoord.latitude,
            basecampCoord.longitude
          );
          biayaPP = Math.round(distance * tarifPerKm);
          autoPP = true;
        }

        // Simaksi
        let biayaSimaksi = trail.biaya_simaksi;
        // Estimasi biaya total = simaksi + PP (atau hanya PP jika simaksi kosong)
        let estimasiTotal = null;
        if (!isNaN(biayaSimaksi) && biayaSimaksi != null && biayaPP != null) {
          estimasiTotal = biayaSimaksi + biayaPP;
        } else if (biayaPP != null) {
          estimasiTotal = biayaPP;
        } else if (!isNaN(biayaSimaksi) && biayaSimaksi != null) {
          estimasiTotal = biayaSimaksi;
        }

        return {
          id_jalur: trail.id_jalur,
          nama_jalur: trail.nama_jalur,
          nama_gunung: trail.nama_gunung,
          ketinggian_puncak_mdpl: trail.ketinggian_puncak_mdpl,
          estimasi_waktu_jam: trail.estimasi_waktu_jam,
          status_jalur: trail.status_jalur,
          estimasi_biaya_total: estimasiTotal,
          biaya_simaksi: biayaSimaksi,
          biaya_pulang_pergi: biayaPP,
          auto_calculated_pp: autoPP,
          jarak_ke_basecamp: jarak,
          url_thumbnail: trail.url_thumbnail,
        };
      })
    );
    res.json(trailsWithDistance);
  } catch (error) {
    logger.error("Error fetching all public trails:", error);
    res
      .status(500)
      .json({ message: "Kesalahan server saat mengambil data semua jalur." });
  }
};

// Get trails by mountain ID (public)
const getTrailsByMountain = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM jalur_pendakian WHERE id_gunung = $1 ORDER BY nama_jalur",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching trails by mountain:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Get all announcements (public)
const getAllAnnouncements = async (req, res) => {
  try {
    const query = `
      SELECT
          id_pengumuman,
          judul,
          isi_pengumuman AS ringkasan,
          dibuat_pada AS tanggal_publikasi
      FROM 
          pengumuman
      WHERE 
          status = 'Published' 
          AND NOW() BETWEEN berlaku_mulai AND berlaku_sampai
      ORDER BY 
          dibuat_pada DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching all public announcements:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat mengambil pengumuman.",
    });
  }
};

// Get latest announcements (public)
const getLatestAnnouncements = async (req, res) => {
  try {
    const query = `
      SELECT
          id_pengumuman,
          judul,
          isi_pengumuman AS ringkasan,
          dibuat_pada AS tanggal_publikasi
      FROM 
          pengumuman
      WHERE 
          status = 'Published' 
          AND NOW() BETWEEN berlaku_mulai AND berlaku_sampai
      ORDER BY 
          dibuat_pada DESC
      LIMIT 3; 
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching latest public announcements:", error);
    res.status(500).json({
      message:
        "Terjadi kesalahan pada server saat mengambil pengumuman terbaru.",
    });
  }
};

// Get announcement by ID (public)
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
          id_pengumuman,
          judul,
          isi_pengumuman,
          dibuat_pada AS tanggal_publikasi,
          berlaku_mulai,
          berlaku_sampai
      FROM 
          pengumuman
      WHERE 
          id_pengumuman = $1
          AND status = 'Published' 
          AND NOW() BETWEEN berlaku_mulai AND berlaku_sampai
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pengumuman tidak ditemukan atau sudah tidak berlaku.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error fetching announcement by ID:", error);
    res.status(500).json({
      message:
        "Terjadi kesalahan pada server saat mengambil detail pengumuman.",
    });
  }
};

// Get all articles (public)
const getAllArticles = async (req, res) => {
  try {
    const query = `
      SELECT
        id_artikel,
        judul,
        ringkasan,
        isi_artikel,
        penulis,
        dibuat_pada AS tanggal_publikasi,
        slug
      FROM artikel
      WHERE status = 'Published'
      ORDER BY dibuat_pada DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching all public articles:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat mengambil artikel.",
    });
  }
};

// Get article by slug (public)
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = `
      SELECT
        id_artikel,
        judul,
        ringkasan,
        isi_artikel,
        penulis,
        dibuat_pada AS tanggal_publikasi,
        slug
      FROM artikel
      WHERE status = 'Published' AND slug = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Artikel tidak ditemukan." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error fetching article by slug:", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server saat mengambil detail artikel.",
    });
  }
};

// POST laporan error (public, harus login)
const postLaporanError = async (req, res) => {
  try {
    const { judul_laporan, deskripsi_laporan, halaman_error } = req.body;
    const id_pelapor = req.user.id;
    const url_screenshot = req.file
      ? `/uploads/laporan-error/${req.file.filename}`
      : null;
    if (!judul_laporan || !deskripsi_laporan) {
      return res
        .status(400)
        .json({ message: "Judul dan Deskripsi laporan wajib diisi." });
    }
    const result = await pool.query(
      "INSERT INTO laporan_error (id_pelapor, judul_laporan, deskripsi_laporan, halaman_error, url_screenshot) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        id_pelapor,
        judul_laporan,
        deskripsi_laporan,
        halaman_error,
        url_screenshot,
      ]
    );
    res.status(201).json({
      message: "Laporan Anda telah berhasil dikirim. Terima kasih!",
      laporan: result.rows[0],
    });
  } catch (error) {
    logger.error("Error creating bug report (public):", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengirim laporan." });
  }
};

// Get mountain detail by ID (public)
const getMountainDetailPublic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ message: "ID gunung tidak valid." });
    }
    const result = await pool.query(
      "SELECT * FROM gunung WHERE id_gunung = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data gunung tidak ditemukan." });
    }
    let gunung = result.rows[0];
    // Hilangkan field tingkat kesulitan gunung jika ada
    if (gunung.hasOwnProperty("tingkat_kesulitan"))
      delete gunung.tingkat_kesulitan;
    if (gunung.hasOwnProperty("kesulitan")) delete gunung.kesulitan;

    // Proses lokasi_administratif agar provinsi tidak diulang
    if (
      gunung.lokasi_administratif &&
      typeof gunung.lokasi_administratif === "string"
    ) {
      try {
        // Split lokasi menjadi array
        let lokasiArr = gunung.lokasi_administratif
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        // Ekstrak provinsi dari setiap elemen
        let provinsiSet = new Set();
        let kabupatenArr = [];
        lokasiArr.forEach((lok) => {
          let parts = lok.split(",");
          if (parts.length > 1) {
            let prov = parts[1].trim();
            provinsiSet.add(prov);
            kabupatenArr.push(parts[0].trim());
          } else {
            kabupatenArr.push(lok.trim());
          }
        });
        // Jika hanya satu provinsi, gabungkan kabupaten dan provinsi sekali di akhir
        if (provinsiSet.size === 1) {
          gunung.lokasi_administratif =
            kabupatenArr.join("; ") + ", " + Array.from(provinsiSet)[0];
        } else {
          // Jika lebih dari satu provinsi, tampilkan seperti semula
          gunung.lokasi_administratif = lokasiArr.join("; ");
        }
      } catch (e) {
        // Jika parsing gagal, biarkan lokasi_administratif apa adanya
      }
    }
    // Tambahkan penjelasan untuk field utama
    gunung.penjelasan_field = {
      nama_gunung: "Nama resmi gunung.",
      ketinggian_puncak_mdpl:
        "Ketinggian puncak gunung di atas permukaan laut (mdpl).",
      lokasi_administratif:
        "Wilayah administratif (kabupaten/kota, provinsi) tempat gunung berada.",
      url_thumbnail: "Gambar representatif gunung.",
    };

    // Query jalur pendakian untuk gunung ini
    let jalurResult = { rows: [] };
    try {
      jalurResult = await pool.query(
        "SELECT * FROM jalur_pendakian WHERE id_gunung = $1 ORDER BY nama_jalur",
        [id]
      );
    } catch (e) {
      // Jika error, jalurResult.rows tetap []
    }
    gunung.jalur_pendakian = jalurResult.rows;

    // Pastikan field deskripsi_singkat selalu ada (string kosong jika null/undefined)
    if (!gunung.deskripsi_singkat) {
      gunung.deskripsi_singkat = "";
    }
    // Pastikan field url_thumbnail selalu ada (string kosong jika null/undefined)
    if (!gunung.url_thumbnail) {
      gunung.url_thumbnail = "";
    }
    // Pastikan field lokasi_administratif selalu ada (string kosong jika null/undefined)
    if (!gunung.lokasi_administratif) {
      gunung.lokasi_administratif = "";
    }

    res.json(gunung);
  } catch (error) {
    logger.error("Error fetching public mountain detail:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Get trail detail by ID (public)
const getTrailDetailPublic = async (req, res) => {
  try {
    const { id_jalur } = req.params;
    console.log(`🔍 getTrailDetailPublic called with id_jalur: ${id_jalur}`);

    const result = await pool.query(
      `SELECT j.*, g.id_gunung, g.nama_gunung, g.ketinggian_puncak_mdpl, g.url_thumbnail
       FROM jalur_pendakian j
       JOIN gunung g ON j.id_gunung = g.id_gunung
       WHERE j.id_jalur = $1`,
      [id_jalur]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Trail with id_jalur ${id_jalur} not found`);
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }

    const row = result.rows[0];
    console.log(`✅ Found trail: ${row.nama_jalur} on ${row.nama_gunung}`);

    // Return flattened response for easier frontend handling
    const response = {
      // Jalur data
      id_jalur: row.id_jalur,
      nama_jalur: row.nama_jalur,
      kesulitan_skala: row.kesulitan_skala,
      keamanan_skala: row.keamanan_skala,
      kualitas_fasilitas_skala: row.kualitas_fasilitas_skala,
      kualitas_kemah_skala: row.kualitas_kemah_skala,
      keindahan_pemandangan_skala: row.keindahan_pemandangan_skala,
      variasi_lanskap_skala: row.variasi_lanskap_skala,
      perlindungan_angin_kemah_skala: row.perlindungan_angin_kemah_skala,
      ketersediaan_sumber_air_skala: row.ketersediaan_sumber_air_skala,
      jaringan_komunikasi_skala: row.jaringan_komunikasi_skala,
      tingkat_insiden_skala: row.tingkat_insiden_skala,
      estimasi_waktu_jam: row.estimasi_waktu_jam,
      status_jalur: row.status_jalur,
      deskripsi_jalur: row.deskripsi_jalur,
      lokasi_pintu_masuk: row.lokasi_pintu_masuk,

      // Gunung data
      id_gunung: row.id_gunung,
      nama_gunung: row.nama_gunung,
      ketinggian_puncak_mdpl: row.ketinggian_puncak_mdpl,
      url_thumbnail: row.url_thumbnail,
    };

    console.log(`📤 Returning flattened response for trail ${id_jalur}`);
    res.json(response);
  } catch (error) {
    logger.error("Error fetching public trail detail:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

module.exports = {
  getAllMountains,
  getAllTrails,
  getTrailsByMountain,
  getAllAnnouncements,
  getLatestAnnouncements,
  getAnnouncementById,
  getAllArticles,
  getArticleBySlug,
  postLaporanError,
  getMountainDetailPublic,
  getTrailDetailPublic,
};
