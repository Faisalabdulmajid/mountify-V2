const db = require('../config/database');
const logger = require('../logger');

/**
 * Export Controller - Menangani ekspor data dalam format CSV
 * Mendukung ekspor data gunung, jalur, dan kombinasi keduanya
 */
class ExportController {
    
    /**
     * Ekspor data gunung dalam format CSV
     */
    static async exportGunung(req, res) {
        try {
            logger.info('Memulai ekspor data gunung');
            
            const query = `
                SELECT 
                    g.id_gunung,
                    g.nama_gunung,
                    g.ketinggian_puncak_mdpl,
                    g.lokasi_administratif,
                    g.deskripsi_singkat,
                    g.variasi_jalur_skala,
                    COUNT(jp.id_jalur) as total_jalur
                FROM gunung g
                LEFT JOIN jalur_pendakian jp ON g.id_gunung = jp.id_gunung
                GROUP BY g.id_gunung, g.nama_gunung, g.ketinggian_puncak_mdpl, 
                         g.lokasi_administratif, g.deskripsi_singkat, g.variasi_jalur_skala
                ORDER BY g.nama_gunung ASC
            `;
            
            const result = await db.query(query);
            const gunungData = result.rows;
            
            if (gunungData.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tidak ada data gunung untuk diekspor' 
                });
            }

            // Generate CSV content
            const csvHeader = [
                'ID Gunung',
                'Nama Gunung', 
                'Ketinggian (mdpl)',
                'Lokasi Administratif',
                'Deskripsi Singkat',
                'Variasi Jalur (Skala)',
                'Total Jalur Tersedia'
            ].join(',');

            const csvRows = gunungData.map(gunung => [
                gunung.id_gunung,
                `"${gunung.nama_gunung.replace(/"/g, '""')}"`,
                gunung.ketinggian_puncak_mdpl,
                `"${gunung.lokasi_administratif.replace(/"/g, '""')}"`,
                `"${gunung.deskripsi_singkat ? gunung.deskripsi_singkat.replace(/"/g, '""') : ''}"`,
                gunung.variasi_jalur_skala,
                gunung.total_jalur
            ].join(','));

            const csvContent = [csvHeader, ...csvRows].join('\n');
            
            // Set response headers untuk download
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `data_gunung_${timestamp}.csv`;
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            
            // Add BOM for proper UTF-8 encoding in Excel
            res.write('\uFEFF');
            res.end(csvContent);
            
            logger.info(`Ekspor data gunung berhasil: ${gunungData.length} record, file: ${filename}`);
            
        } catch (error) {
            logger.error('Error saat ekspor data gunung:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal mengekspor data gunung', 
                error: error.message 
            });
        }
    }

    /**
     * Ekspor data jalur pendakian dalam format CSV
     */
    static async exportJalur(req, res) {
        try {
            logger.info('Memulai ekspor data jalur pendakian');
            
            const query = `
                SELECT 
                    jp.id_jalur,
                    g.nama_gunung,
                    jp.nama_jalur,
                    jp.kesulitan_skala,
                    jp.keamanan_skala,
                    jp.kualitas_fasilitas_skala,
                    jp.kualitas_kemah_skala,
                    jp.keindahan_pemandangan_skala,
                    jp.estimasi_waktu_jam,
                    jp.status_jalur,
                    jp.lokasi_pintu_masuk,
                    jp.variasi_lanskap_skala,
                    jp.perlindungan_angin_kemah_skala,
                    jp.ketersediaan_sumber_air_skala,
                    jp.jaringan_komunikasi_skala,
                    jp.tingkat_insiden_skala,
                    jp.biaya_simaksi,
                    CASE 
                        WHEN jp.use_city_based_pp = true THEN 'Berdasarkan Kota'
                        ELSE CAST(jp.biaya_pulang_pergi AS TEXT)
                    END as biaya_transportasi,
                    jp.latitude,
                    jp.longitude
                FROM jalur_pendakian jp
                INNER JOIN gunung g ON jp.id_gunung = g.id_gunung
                ORDER BY g.nama_gunung ASC, jp.nama_jalur ASC
            `;
            
            const result = await db.query(query);
            const jalurData = result.rows;
            
            if (jalurData.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tidak ada data jalur untuk diekspor' 
                });
            }

            // Generate CSV content
            const csvHeader = [
                'ID Jalur',
                'Nama Gunung',
                'Nama Jalur',
                'Kesulitan (1-5)',
                'Keamanan (1-5)',
                'Kualitas Fasilitas (1-5)',
                'Kualitas Area Kemah (1-5)',
                'Keindahan Pemandangan (1-5)',
                'Estimasi Waktu (Jam)',
                'Status Jalur',
                'Lokasi Pintu Masuk',
                'Variasi Lanskap (1-5)',
                'Perlindungan Angin (1-5)',
                'Ketersediaan Air (1-5)',
                'Jaringan Komunikasi (1-5)',
                'Tingkat Insiden (1-5)',
                'Biaya SIMAKSI',
                'Biaya Transportasi',
                'Latitude',
                'Longitude'
            ].join(',');

            const csvRows = jalurData.map(jalur => [
                jalur.id_jalur,
                `"${jalur.nama_gunung.replace(/"/g, '""')}"`,
                `"${jalur.nama_jalur.replace(/"/g, '""')}"`,
                jalur.kesulitan_skala,
                jalur.keamanan_skala,
                jalur.kualitas_fasilitas_skala,
                jalur.kualitas_kemah_skala,
                jalur.keindahan_pemandangan_skala,
                jalur.estimasi_waktu_jam,
                `"${jalur.status_jalur}"`,
                `"${jalur.lokasi_pintu_masuk ? jalur.lokasi_pintu_masuk.replace(/"/g, '""') : ''}"`,
                jalur.variasi_lanskap_skala,
                jalur.perlindungan_angin_kemah_skala,
                jalur.ketersediaan_sumber_air_skala,
                jalur.jaringan_komunikasi_skala,
                jalur.tingkat_insiden_skala,
                jalur.biaya_simaksi || 0,
                `"${jalur.biaya_transportasi}"`,
                jalur.latitude || '',
                jalur.longitude || ''
            ].join(','));

            const csvContent = [csvHeader, ...csvRows].join('\n');
            
            // Set response headers untuk download
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `data_jalur_pendakian_${timestamp}.csv`;
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            
            // Add BOM for proper UTF-8 encoding in Excel
            res.write('\uFEFF');
            res.end(csvContent);
            
            logger.info(`Ekspor data jalur berhasil: ${jalurData.length} record, file: ${filename}`);
            
        } catch (error) {
            logger.error('Error saat ekspor data jalur:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal mengekspor data jalur', 
                error: error.message 
            });
        }
    }

    /**
     * Ekspor semua data (gunung dan jalur) dalam file ZIP berisi 2 CSV
     */
    static async exportAll(req, res) {
        try {
            logger.info('Memulai ekspor semua data (gunung dan jalur)');
            
            // Query untuk data gunung
            const gunungQuery = `
                SELECT 
                    g.id_gunung,
                    g.nama_gunung,
                    g.ketinggian_puncak_mdpl,
                    g.lokasi_administratif,
                    g.deskripsi_singkat,
                    g.variasi_jalur_skala,
                    COUNT(jp.id_jalur) as total_jalur
                FROM gunung g
                LEFT JOIN jalur_pendakian jp ON g.id_gunung = jp.id_gunung
                GROUP BY g.id_gunung, g.nama_gunung, g.ketinggian_puncak_mdpl, 
                         g.lokasi_administratif, g.deskripsi_singkat, g.variasi_jalur_skala
                ORDER BY g.nama_gunung ASC
            `;

            // Query untuk data jalur
            const jalurQuery = `
                SELECT 
                    jp.id_jalur,
                    g.nama_gunung,
                    jp.nama_jalur,
                    jp.kesulitan_skala,
                    jp.keamanan_skala,
                    jp.kualitas_fasilitas_skala,
                    jp.kualitas_kemah_skala,
                    jp.keindahan_pemandangan_skala,
                    jp.estimasi_waktu_jam,
                    jp.status_jalur,
                    jp.lokasi_pintu_masuk,
                    jp.variasi_lanskap_skala,
                    jp.perlindungan_angin_kemah_skala,
                    jp.ketersediaan_sumber_air_skala,
                    jp.jaringan_komunikasi_skala,
                    jp.tingkat_insiden_skala,
                    jp.biaya_simaksi,
                    CASE 
                        WHEN jp.use_city_based_pp = true THEN 'Berdasarkan Kota'
                        ELSE CAST(jp.biaya_pulang_pergi AS TEXT)
                    END as biaya_transportasi,
                    jp.latitude,
                    jp.longitude
                FROM jalur_pendakian jp
                INNER JOIN gunung g ON jp.id_gunung = g.id_gunung
                ORDER BY g.nama_gunung ASC, jp.nama_jalur ASC
            `;

            const [gunungResult, jalurResult] = await Promise.all([
                db.query(gunungQuery),
                db.query(jalurQuery)
            ]);

            const gunungData = gunungResult.rows;
            const jalurData = jalurResult.rows;

            if (gunungData.length === 0 && jalurData.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tidak ada data untuk diekspor' 
                });
            }

            // Create combined CSV dengan data gunung dan jalur secara berurutan
            let combinedCsvContent = '';
            
            // Header informasi ekspor
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            combinedCsvContent += `"EKSPOR DATA MOUNTIFY - ${new Date().toLocaleString('id-ID')}"\n`;
            combinedCsvContent += `"Total Data Gunung: ${gunungData.length}"\n`;
            combinedCsvContent += `"Total Data Jalur: ${jalurData.length}"\n\n`;

            // Bagian Data Gunung
            if (gunungData.length > 0) {
                combinedCsvContent += '"=== DATA GUNUNG ==="\n';
                const gunungHeader = [
                    'ID Gunung',
                    'Nama Gunung', 
                    'Ketinggian (mdpl)',
                    'Lokasi Administratif',
                    'Deskripsi Singkat',
                    'Variasi Jalur (Skala)',
                    'Total Jalur Tersedia'
                ].join(',');
                
                combinedCsvContent += gunungHeader + '\n';
                
                const gunungRows = gunungData.map(gunung => [
                    gunung.id_gunung,
                    `"${gunung.nama_gunung.replace(/"/g, '""')}"`,
                    gunung.ketinggian_puncak_mdpl,
                    `"${gunung.lokasi_administratif.replace(/"/g, '""')}"`,
                    `"${gunung.deskripsi_singkat ? gunung.deskripsi_singkat.replace(/"/g, '""') : ''}"`,
                    gunung.variasi_jalur_skala,
                    gunung.total_jalur
                ].join(','));
                
                combinedCsvContent += gunungRows.join('\n') + '\n\n';
            }

            // Bagian Data Jalur
            if (jalurData.length > 0) {
                combinedCsvContent += '"=== DATA JALUR PENDAKIAN ==="\n';
                const jalurHeader = [
                    'ID Jalur',
                    'Nama Gunung',
                    'Nama Jalur',
                    'Kesulitan (1-5)',
                    'Keamanan (1-5)',
                    'Kualitas Fasilitas (1-5)',
                    'Kualitas Area Kemah (1-5)',
                    'Keindahan Pemandangan (1-5)',
                    'Estimasi Waktu (Jam)',
                    'Status Jalur',
                    'Lokasi Pintu Masuk',
                    'Variasi Lanskap (1-5)',
                    'Perlindungan Angin (1-5)',
                    'Ketersediaan Air (1-5)',
                    'Jaringan Komunikasi (1-5)',
                    'Tingkat Insiden (1-5)',
                    'Biaya SIMAKSI',
                    'Biaya Transportasi',
                    'Latitude',
                    'Longitude'
                ].join(',');
                
                combinedCsvContent += jalurHeader + '\n';
                
                const jalurRows = jalurData.map(jalur => [
                    jalur.id_jalur,
                    `"${jalur.nama_gunung.replace(/"/g, '""')}"`,
                    `"${jalur.nama_jalur.replace(/"/g, '""')}"`,
                    jalur.kesulitan_skala,
                    jalur.keamanan_skala,
                    jalur.kualitas_fasilitas_skala,
                    jalur.kualitas_kemah_skala,
                    jalur.keindahan_pemandangan_skala,
                    jalur.estimasi_waktu_jam,
                    `"${jalur.status_jalur}"`,
                    `"${jalur.lokasi_pintu_masuk ? jalur.lokasi_pintu_masuk.replace(/"/g, '""') : ''}"`,
                    jalur.variasi_lanskap_skala,
                    jalur.perlindungan_angin_kemah_skala,
                    jalur.ketersediaan_sumber_air_skala,
                    jalur.jaringan_komunikasi_skala,
                    jalur.tingkat_insiden_skala,
                    jalur.biaya_simaksi || 0,
                    `"${jalur.biaya_transportasi}"`,
                    jalur.latitude || '',
                    jalur.longitude || ''
                ].join(','));
                
                combinedCsvContent += jalurRows.join('\n');
            }
            
            // Set response headers untuk download
            const filename = `data_mountify_lengkap_${timestamp}.csv`;
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            
            // Add BOM for proper UTF-8 encoding in Excel
            res.write('\uFEFF');
            res.end(combinedCsvContent);
            
            logger.info(`Ekspor semua data berhasil: ${gunungData.length} gunung, ${jalurData.length} jalur, file: ${filename}`);
            
        } catch (error) {
            logger.error('Error saat ekspor semua data:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal mengekspor semua data', 
                error: error.message 
            });
        }
    }

    /**
     * Get statistik untuk preview sebelum ekspor
     */
    static async getExportStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM gunung) as total_gunung,
                    (SELECT COUNT(*) FROM jalur_pendakian) as total_jalur,
                    (SELECT COUNT(DISTINCT id_gunung) FROM jalur_pendakian) as gunung_dengan_jalur
            `;
            
            const result = await db.query(statsQuery);
            const stats = result.rows[0];
            
            res.json({
                success: true,
                data: {
                    total_gunung: parseInt(stats.total_gunung),
                    total_jalur: parseInt(stats.total_jalur),
                    gunung_dengan_jalur: parseInt(stats.gunung_dengan_jalur),
                    last_updated: new Date().toISOString()
                }
            });
            
        } catch (error) {
            logger.error('Error saat mengambil statistik ekspor:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal mengambil statistik data', 
                error: error.message 
            });
        }
    }
}

module.exports = ExportController;