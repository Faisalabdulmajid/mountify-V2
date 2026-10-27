const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../logger');

// GET: Ambil semua settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    res.json(result.rows);
  } catch (error) {
    logger.error('Error get settings:', error);
    res.status(500).json({ message: 'Gagal mengambil data settings' });
  }
});

// GET: Ambil setting by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error get setting by key:', error);
    res.status(500).json({ message: 'Gagal mengambil data setting' });
  }
});

// PUT: Update setting by key
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const result = await pool.query(
      'UPDATE settings SET value = $1 WHERE key = $2 RETURNING *',
      [value, key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting tidak ditemukan' });
    }
    res.json({ message: 'Setting berhasil diupdate', setting: result.rows[0] });
  } catch (error) {
    logger.error('Error update setting:', error);
    res.status(500).json({ message: 'Gagal update setting' });
  }
});

module.exports = router;



