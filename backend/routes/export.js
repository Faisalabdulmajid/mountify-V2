const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

/**
 * Routes untuk Export Data
 * Semua endpoint memerlukan autentikasi admin
 */

/**
 * GET /api/export/stats
 * Mendapatkan statistik data untuk preview ekspor
 */
router.get('/stats', auth.authenticateToken, auth.authorizeAdmin, ExportController.getExportStats);

/**
 * GET /api/export/gunung
 * Ekspor data gunung dalam format CSV
 */
router.get('/gunung', auth.authenticateToken, auth.authorizeAdmin, ExportController.exportGunung);

/**
 * GET /api/export/jalur  
 * Ekspor data jalur pendakian dalam format CSV
 */
router.get('/jalur', auth.authenticateToken, auth.authorizeAdmin, ExportController.exportJalur);

/**
 * GET /api/export/all
 * Ekspor semua data (gunung dan jalur) dalam satu file CSV berurutan
 */
router.get('/all', auth.authenticateToken, auth.authorizeAdmin, ExportController.exportAll);

module.exports = router;