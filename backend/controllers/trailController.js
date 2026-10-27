const pool = require("../config/database");
const logger = require("../logger");
const { processBiayaPP } = require("../utils/biayaPPHelper");
// SIMAKSI helper functions no longer needed - using simple number format

// Konstanta enum untuk validasi
const ALLOWED_STATUS_JALUR = [
  "Belum Diketahui",
  "Buka",
  "Tutup Sementara",
  "Tutup",
];

// Get all trails with mountain info
const getAllTrails = async (req, res) => {
  try {
    const query = `
      SELECT 
          j.id_jalur, j.nama_jalur, j.id_gunung, g.nama_gunung, g.ketinggian_puncak_mdpl,
          j.kesulitan_skala, j.status_jalur, j.lokasi_pintu_masuk, j.estimasi_waktu_jam,
          j.ketersediaan_sumber_air_skala, j.variasi_lanskap_skala, j.perlindungan_angin_kemah_skala,
          j.jaringan_komunikasi_skala, j.tingkat_insiden_skala,
          j.biaya_simaksi, j.biaya_pulang_pergi, 
          j.latitude, j.longitude, j.coordinate_source,
          COALESCE(j.estimasi_biaya_total, j.biaya_simaksi + j.biaya_pulang_pergi) as estimasi_biaya
      FROM jalur_pendakian j
      JOIN gunung g ON j.id_gunung = g.id_gunung
      ORDER BY j.id_jalur DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching all jalur:", error);
    res
      .status(500)
      .json({ message: "Kesalahan server saat mengambil data jalur." });
  }
};

// Get single trail by ID
const getTrailById = async (req, res) => {
  try {
    const { id_jalur } = req.params;
    const result = await pool.query(
      "SELECT *, COALESCE(estimasi_biaya_total, biaya_simaksi + biaya_pulang_pergi) as estimasi_biaya FROM jalur_pendakian WHERE id_jalur = $1",
      [id_jalur]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error fetching single jalur:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Create new trail
const createTrail = async (req, res) => {
  try {
    const {
      id_gunung,
      nama_jalur,
      lokasi_pintu_masuk,
      kesulitan_skala,
      keamanan_skala,
      kualitas_fasilitas_skala,
      kualitas_kemah_skala,
      keindahan_pemandangan_skala,
      estimasi_waktu_jam,
      deskripsi_jalur,
      status_jalur,
      ketersediaan_sumber_air_skala,
      variasi_lanskap_skala,
      perlindungan_angin_kemah_skala,
      jaringan_komunikasi_skala,
      tingkat_insiden_skala,
      biaya_simaksi,
      biaya_pulang_pergi,
      latitude,
      longitude,
      coordinate_source,
    } = req.body;

    if (!id_gunung || !nama_jalur) {
      return res
        .status(400)
        .json({ message: "ID Gunung dan Nama Jalur wajib diisi." });
    }

    if (!ALLOWED_STATUS_JALUR.includes(status_jalur)) {
      return res.status(400).json({
        message: `Status jalur tidak valid. Pilih salah satu: ${ALLOWED_STATUS_JALUR.join(
          ", "
        )}`,
      });
    }

    // Validasi dan normalisasi parameter integer dengan range 0-10
    const validateScale = (value, fieldName) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        throw new Error(`${fieldName} harus berupa angka antara 0-10`);
      }
      return num;
    };

    // Validasi parameter yang wajib diisi (NOT NULL)
    const validatedKesulitan = validateScale(
      kesulitan_skala,
      "Kesulitan skala"
    );
    const validatedKeamanan = validateScale(keamanan_skala, "Keamanan skala");
    const validatedFasilitas = validateScale(
      kualitas_fasilitas_skala,
      "Kualitas fasilitas skala"
    );
    const validatedKemah = validateScale(
      kualitas_kemah_skala,
      "Kualitas kemah skala"
    );
    const validatedPemandangan = validateScale(
      keindahan_pemandangan_skala,
      "Keindahan pemandangan skala"
    );

    if (
      validatedKesulitan === null ||
      validatedKeamanan === null ||
      validatedFasilitas === null ||
      validatedKemah === null ||
      validatedPemandangan === null
    ) {
      return res.status(400).json({
        message:
          "Kesulitan, keamanan, kualitas fasilitas, kualitas kemah, dan keindahan pemandangan wajib diisi.",
      });
    }

    // Validasi parameter yang boleh NULL
    const validatedSumberAir = validateScale(
      ketersediaan_sumber_air_skala,
      "Ketersediaan sumber air skala"
    );
    const validatedLanskap = validateScale(
      variasi_lanskap_skala,
      "Variasi lanskap skala"
    );
    const validatedAngin = validateScale(
      perlindungan_angin_kemah_skala,
      "Perlindungan angin kemah skala"
    );
    const validatedKomunikasi = validateScale(
      jaringan_komunikasi_skala,
      "Jaringan komunikasi skala"
    );
    const validatedInsiden = validateScale(
      tingkat_insiden_skala,
      "Tingkat insiden skala"
    );

    // Validasi estimasi waktu
    const validatedWaktu = Number(estimasi_waktu_jam);
    if (isNaN(validatedWaktu) || validatedWaktu <= 0) {
      return res
        .status(400)
        .json({ message: "Estimasi waktu harus berupa angka positif." });
    }

    // Process biaya SIMAKSI - convert to simple number
    const validatedSimaksi = Number(biaya_simaksi) || 0;
    logger.info(
      `SIMAKSI processed for ${nama_jalur}: Rp${validatedSimaksi.toLocaleString()}`
    );

    // Smart biaya PP processing - check manual first, fallback to auto
    const processedPP = await processBiayaPP(req.body);
    logger.info(
      `Biaya PP processed for ${nama_jalur}: Rp${processedPP.biaya_pulang_pergi.toLocaleString()} (source: ${
        processedPP.pp_source
      })`
    );

    // Hitung estimasi biaya total
    const estimasiBiayaTotal =
      validatedSimaksi + processedPP.biaya_pulang_pergi;

    // Validasi koordinat jika diisi
    const validatedLatitude =
      latitude && latitude !== "" ? Number(latitude) : null;
    const validatedLongitude =
      longitude && longitude !== "" ? Number(longitude) : null;
    const validatedCoordinateSource = coordinate_source || null;

    const result = await pool.query(
      `INSERT INTO jalur_pendakian (id_gunung, nama_jalur, lokasi_pintu_masuk, kesulitan_skala, keamanan_skala, kualitas_fasilitas_skala, kualitas_kemah_skala, keindahan_pemandangan_skala, estimasi_waktu_jam, deskripsi_jalur, status_jalur, ketersediaan_sumber_air_skala, variasi_lanskap_skala, perlindungan_angin_kemah_skala, jaringan_komunikasi_skala, tingkat_insiden_skala, biaya_simaksi, biaya_pulang_pergi, estimasi_biaya_total, latitude, longitude, coordinate_source) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
      [
        id_gunung,
        nama_jalur,
        lokasi_pintu_masuk,
        validatedKesulitan,
        validatedKeamanan,
        validatedFasilitas,
        validatedKemah,
        validatedPemandangan,
        validatedWaktu,
        deskripsi_jalur,
        status_jalur,
        validatedSumberAir,
        validatedLanskap,
        validatedAngin,
        validatedKomunikasi,
        validatedInsiden,
        validatedSimaksi,
        processedPP.biaya_pulang_pergi,
        estimasiBiayaTotal,
        validatedLatitude,
        validatedLongitude,
        validatedCoordinateSource,
      ]
    );

    res.status(201).json({
      message: "Jalur pendakian berhasil ditambahkan",
      jalur: result.rows[0],
    });
  } catch (error) {
    logger.error("Error add jalur:", error);
    // Handle validation errors
    if (
      error.message &&
      error.message.includes("harus berupa angka antara 0-10")
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Nama jalur ini sudah ada untuk gunung tersebut." });
    }
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Update trail
const updateTrail = async (req, res) => {
  try {
    const { id_jalur } = req.params;
    const {
      id_gunung,
      nama_jalur,
      lokasi_pintu_masuk,
      kesulitan_skala,
      keamanan_skala,
      kualitas_fasilitas_skala,
      kualitas_kemah_skala,
      keindahan_pemandangan_skala,
      estimasi_waktu_jam,
      deskripsi_jalur,
      status_jalur,
      ketersediaan_sumber_air_skala,
      variasi_lanskap_skala,
      perlindungan_angin_kemah_skala,
      jaringan_komunikasi_skala,
      tingkat_insiden_skala,
      biaya_simaksi,
      biaya_pulang_pergi,
      latitude,
      longitude,
      coordinate_source,
    } = req.body;

    if (!id_gunung || !nama_jalur) {
      return res
        .status(400)
        .json({ message: "ID Gunung dan Nama Jalur wajib diisi." });
    }

    if (!ALLOWED_STATUS_JALUR.includes(status_jalur)) {
      return res.status(400).json({
        message: `Status jalur tidak valid. Pilih salah satu: ${ALLOWED_STATUS_JALUR.join(
          ", "
        )}`,
      });
    }

    // Validasi dan normalisasi parameter integer dengan range 0-10
    const validateScale = (value, fieldName) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        throw new Error(`${fieldName} harus berupa angka antara 0-10`);
      }
      return num;
    };

    // Validasi parameter yang wajib diisi (NOT NULL)
    const validatedKesulitan = validateScale(
      kesulitan_skala,
      "Kesulitan skala"
    );
    const validatedKeamanan = validateScale(keamanan_skala, "Keamanan skala");
    const validatedFasilitas = validateScale(
      kualitas_fasilitas_skala,
      "Kualitas fasilitas skala"
    );
    const validatedKemah = validateScale(
      kualitas_kemah_skala,
      "Kualitas kemah skala"
    );
    const validatedPemandangan = validateScale(
      keindahan_pemandangan_skala,
      "Keindahan pemandangan skala"
    );

    if (
      validatedKesulitan === null ||
      validatedKeamanan === null ||
      validatedFasilitas === null ||
      validatedKemah === null ||
      validatedPemandangan === null
    ) {
      return res.status(400).json({
        message:
          "Kesulitan, keamanan, kualitas fasilitas, kualitas kemah, dan keindahan pemandangan wajib diisi.",
      });
    }

    // Validasi parameter yang boleh NULL
    const validatedSumberAir = validateScale(
      ketersediaan_sumber_air_skala,
      "Ketersediaan sumber air skala"
    );
    const validatedLanskap = validateScale(
      variasi_lanskap_skala,
      "Variasi lanskap skala"
    );
    const validatedAngin = validateScale(
      perlindungan_angin_kemah_skala,
      "Perlindungan angin kemah skala"
    );
    const validatedKomunikasi = validateScale(
      jaringan_komunikasi_skala,
      "Jaringan komunikasi skala"
    );
    const validatedInsiden = validateScale(
      tingkat_insiden_skala,
      "Tingkat insiden skala"
    );

    // Validasi estimasi waktu
    const validatedWaktu = Number(estimasi_waktu_jam);
    if (isNaN(validatedWaktu) || validatedWaktu <= 0) {
      return res
        .status(400)
        .json({ message: "Estimasi waktu harus berupa angka positif." });
    }

    // Process biaya SIMAKSI - convert to simple number
    const validatedSimaksi = Number(biaya_simaksi) || 0;
    logger.info(
      `SIMAKSI updated for ${nama_jalur}: Rp${validatedSimaksi.toLocaleString()}`
    );

    // Smart biaya PP processing - check manual first, fallback to auto
    const processedPP = await processBiayaPP(req.body);
    logger.info(
      `Biaya PP updated for ${nama_jalur}: Rp${processedPP.biaya_pulang_pergi.toLocaleString()} (source: ${
        processedPP.pp_source
      })`
    );

    // Hitung estimasi biaya total
    const estimasiBiayaTotal =
      validatedSimaksi + processedPP.biaya_pulang_pergi;

    // Validasi koordinat jika diisi
    const validatedLatitude =
      latitude && latitude !== "" ? Number(latitude) : null;
    const validatedLongitude =
      longitude && longitude !== "" ? Number(longitude) : null;
    const validatedCoordinateSource = coordinate_source || null;

    const result = await pool.query(
      `UPDATE jalur_pendakian 
       SET id_gunung = $1, nama_jalur = $2, lokasi_pintu_masuk = $3, kesulitan_skala = $4, 
           keamanan_skala = $5, kualitas_fasilitas_skala = $6, kualitas_kemah_skala = $7, 
           keindahan_pemandangan_skala = $8, estimasi_waktu_jam = $9, deskripsi_jalur = $10, 
           status_jalur = $11, ketersediaan_sumber_air_skala = $12, variasi_lanskap_skala = $13, 
           perlindungan_angin_kemah_skala = $14, jaringan_komunikasi_skala = $15, 
           tingkat_insiden_skala = $16, biaya_simaksi = $17, biaya_pulang_pergi = $18,
           estimasi_biaya_total = $19, latitude = $20, longitude = $21, coordinate_source = $22
       WHERE id_jalur = $23 RETURNING *`,
      [
        id_gunung,
        nama_jalur,
        lokasi_pintu_masuk,
        validatedKesulitan,
        validatedKeamanan,
        validatedFasilitas,
        validatedKemah,
        validatedPemandangan,
        validatedWaktu,
        deskripsi_jalur,
        status_jalur,
        validatedSumberAir,
        validatedLanskap,
        validatedAngin,
        validatedKomunikasi,
        validatedInsiden,
        validatedSimaksi,
        processedPP.biaya_pulang_pergi,
        estimasiBiayaTotal,
        validatedLatitude,
        validatedLongitude,
        validatedCoordinateSource,
        id_jalur,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }

    res.json({
      message: "Data jalur berhasil diperbarui",
      jalur: result.rows[0],
    });
  } catch (error) {
    logger.error("Error update jalur:", error);
    // Handle validation errors
    if (
      error.message &&
      error.message.includes("harus berupa angka antara 0-10")
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Nama jalur ini sudah ada untuk gunung tersebut." });
    }
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Get SIMAKSI pricing details for a trail
const getSimaksiPricing = async (req, res) => {
  try {
    const { id_jalur } = req.params;
    const result = await pool.query(
      "SELECT id_jalur, nama_jalur, biaya_simaksi FROM jalur_pendakian WHERE id_jalur = $1",
      [id_jalur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }

    const jalur = result.rows[0];

    res.json({
      id_jalur: jalur.id_jalur,
      nama_jalur: jalur.nama_jalur,
      biaya_simaksi: Number(jalur.biaya_simaksi) || 0,
    });
  } catch (error) {
    logger.error("Error getting SIMAKSI pricing:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Calculate SIMAKSI price for specific category and day type
const calculateSimaksiForUser = async (req, res) => {
  try {
    const { id_jalur } = req.params;
    const { kategori = "lokal", is_weekend = false } = req.query;

    const result = await pool.query(
      "SELECT biaya_simaksi FROM jalur_pendakian WHERE id_jalur = $1",
      [id_jalur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }

    const price = Number(result.rows[0].biaya_simaksi) || 0;

    res.json({
      id_jalur,
      kategori,
      is_weekend: is_weekend === "true",
      biaya_simaksi: price,
      formatted_price: `Rp ${price.toLocaleString("id-ID")}`,
    });
  } catch (error) {
    logger.error("Error calculating SIMAKSI price:", error);
    res.status(500).json({ message: "Kesalahan server" });
  }
};

// Delete trail
const deleteTrail = async (req, res) => {
  try {
    const { id_jalur } = req.params;

    const result = await pool.query(
      "DELETE FROM jalur_pendakian WHERE id_jalur = $1 RETURNING nama_jalur",
      [id_jalur]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data jalur tidak ditemukan." });
    }

    res.json({
      message: `Jalur '${result.rows[0].nama_jalur}' berhasil dihapus.`,
    });
  } catch (error) {
    logger.error("Error delete jalur:", error);
    if (error.code === "23503") {
      return res.status(409).json({
        message:
          "Gagal menghapus: Jalur ini memiliki data terkait. Hapus data terkait terlebih dahulu.",
      });
    }
    res.status(500).json({ message: "Kesalahan server" });
  }
};

module.exports = {
  getAllTrails,
  getTrailById,
  createTrail,
  updateTrail,
  deleteTrail,
  getSimaksiPricing,
  calculateSimaksiForUser,
};
