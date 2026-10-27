const recommendationService = require("../services/recommendationService");
const logger = require("../logger");

const getRecommendations = async (req, res) => {
  logger.info("[REKOMENDASI] Endpoint /gunung HIT, body:", req.body);
  try {
    const preferensiPengguna = req.body;
    logger.info(
      "[REKOMENDASI] Memanggil service.getRecommendations dengan preferensi:",
      preferensiPengguna
    );
    const finalResult = await recommendationService.getRecommendations(
      preferensiPengguna
    );
    logger.info(
      "[REKOMENDASI] Sukses dapat hasil dari Python, metadata:",
      finalResult.metadata
    );
    // Kirim hasil rekomendasi gunung ke frontend (key konsisten)
    res.json({
      rekomendasi_gunung: finalResult.rekomendasi_gunung || [],
      metadata: finalResult.metadata || {},
    });
  } catch (error) {
    logger.error(
      "[REKOMENDASI] Error pada endpoint rekomendasi-gunung:",
      error
    );
    res.status(500).json({
      message: error.message || "Terjadi kesalahan pada server.",
      rekomendasi_gunung: [],
    });
  }
};

const getTrailRecommendations = async (req, res) => {
  logger.info("[REKOMENDASI] Endpoint /jalur HIT, body:", req.body);
  try {
    const preferensiPengguna = req.body;
    logger.info(
      "[REKOMENDASI] Memanggil service.getRecommendations (jalur) dengan preferensi:",
      preferensiPengguna
    );
    const finalResult = await recommendationService.getRecommendations(
      preferensiPengguna
    );
    logger.info(
      "[REKOMENDASI] Sukses dapat hasil dari Python (jalur), metadata:",
      finalResult.metadata
    );
    // Kirim hasil rekomendasi jalur ke frontend (key konsisten)
    res.json({
      rekomendasi_jalur: finalResult.rekomendasi_jalur || [],
      metadata: finalResult.metadata || {},
    });
  } catch (error) {
    logger.error("[REKOMENDASI] Error pada endpoint rekomendasi-jalur:", error);
    res.status(500).json({
      message: error.message || "Terjadi kesalahan pada server.",
      rekomendasi_jalur: [],
    });
  }
};

module.exports = {
  getRecommendations,
  getTrailRecommendations,
};



