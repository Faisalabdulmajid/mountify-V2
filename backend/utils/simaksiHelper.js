/**
 * Helper untuk memproses dan memvalidasi struktur biaya SIMAKSI
 * Mendukung kategori: mahasiswa, lokal, mancanegara dengan weekdays/weekend
 */

/**
 * Struktur default biaya SIMAKSI
 */
const DEFAULT_SIMAKSI_STRUCTURE = {
  mahasiswa: {
    weekdays: 0,
    weekend: 0
  },
  lokal: {
    weekdays: 0,
    weekend: 0
  },
  mancanegara: {
    weekdays: 0,
    weekend: 0
  },
  umum: {
    weekdays: 0,
    weekend: 0
  }
};

/**
 * Validasi struktur biaya SIMAKSI
 * @param {Object|Number|String} biayaSimaksi - Data biaya yang akan divalidasi
 * @returns {Object} - Struktur biaya yang valid
 */
const validateSimaksiStructure = (biayaSimaksi) => {
  // Jika input adalah number atau string (format lama), konversi ke struktur kosong untuk input manual
  if (typeof biayaSimaksi === 'number' || typeof biayaSimaksi === 'string') {
    // Tidak gunakan hardcoded calculation, biarkan admin input manual
    return { ...DEFAULT_SIMAKSI_STRUCTURE };
  }

  // Jika input adalah object, validasi struktur
  if (typeof biayaSimaksi === 'object' && biayaSimaksi !== null) {
    const result = { ...DEFAULT_SIMAKSI_STRUCTURE };
    
    // Validasi setiap kategori
    ['mahasiswa', 'lokal', 'mancanegara', 'umum'].forEach(category => {
      if (biayaSimaksi[category]) {
        if (typeof biayaSimaksi[category] === 'object') {
          result[category].weekdays = parseInt(biayaSimaksi[category].weekdays) || 0;
          result[category].weekend = parseInt(biayaSimaksi[category].weekend) || 0;
        } else {
          // Jika kategori berisi number, gunakan untuk weekdays dan tambah 20% untuk weekend
          const baseAmount = parseInt(biayaSimaksi[category]) || 0;
          result[category].weekdays = baseAmount;
          result[category].weekend = Math.round(baseAmount * 1.2);
        }
      }
    });
    
    return result;
  }

  // Default fallback
  return DEFAULT_SIMAKSI_STRUCTURE;
};

/**
 * Format biaya SIMAKSI untuk display
 * @param {Object} biayaSimaksi - Struktur biaya SIMAKSI
 * @returns {Object} - Data yang sudah diformat untuk display
 */
const formatSimaksiForDisplay = (biayaSimaksi) => {
  const validated = validateSimaksiStructure(biayaSimaksi);
  
  return {
    struktur_lengkap: validated,
    ringkasan: {
      mahasiswa_termurah: Math.min(validated.mahasiswa.weekdays, validated.mahasiswa.weekend),
      lokal_termurah: Math.min(validated.lokal.weekdays, validated.lokal.weekend),
      mancanegara_termurah: Math.min(validated.mancanegara.weekdays, validated.mancanegara.weekend),
      rentang_harga: {
        minimum: Math.min(
          validated.mahasiswa.weekdays,
          validated.mahasiswa.weekend,
          validated.lokal.weekdays,
          validated.lokal.weekend,
          validated.mancanegara.weekdays,
          validated.mancanegara.weekend,
          validated.umum.weekdays,
          validated.umum.weekend
        ),
        maksimum: Math.max(
          validated.mahasiswa.weekdays,
          validated.mahasiswa.weekend,
          validated.lokal.weekdays,
          validated.lokal.weekend,
          validated.mancanegara.weekdays,
          validated.mancanegara.weekend,
          validated.umum.weekdays,
          validated.umum.weekend
        )
      }
    }
  };
};

/**
 * Hitung biaya SIMAKSI berdasarkan kategori dan hari
 * @param {Object} biayaSimaksi - Struktur biaya SIMAKSI
 * @param {String} kategori - mahasiswa, lokal, atau mancanegara
 * @param {Boolean} isWeekend - true jika weekend
 * @returns {Number} - Biaya yang sesuai
 */
const calculateSimaksiPrice = (biayaSimaksi, kategori = 'lokal', isWeekend = false) => {
  const validated = validateSimaksiStructure(biayaSimaksi);
  
  if (!validated[kategori]) {
    kategori = 'lokal'; // Default fallback
  }
  
  const dayType = isWeekend ? 'weekend' : 'weekdays';
  return validated[kategori][dayType] || 0;
};

/**
 * Get semua opsi pricing untuk frontend
 * @param {Object} biayaSimaksi - Struktur biaya SIMAKSI
 * @returns {Array} - Array dengan semua opsi pricing
 */
const getSimaksiPricingOptions = (biayaSimaksi) => {
  const validated = validateSimaksiStructure(biayaSimaksi);
  const options = [];
  
  Object.keys(validated).forEach(category => {
    options.push({
      kategori: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      weekdays: validated[category].weekdays,
      weekend: validated[category].weekend,
      selisih: validated[category].weekend - validated[category].weekdays
    });
  });
  
  return options;
};

/**
 * Konversi dari format lama ke format baru
 * @param {Number} oldPrice - Harga lama (single price)
 * @returns {Object} - Struktur biaya baru
 */
const convertLegacyPrice = (oldPrice) => {
  return validateSimaksiStructure(oldPrice);
};

module.exports = {
  DEFAULT_SIMAKSI_STRUCTURE,
  validateSimaksiStructure,
  formatSimaksiForDisplay,
  calculateSimaksiPrice,
  getSimaksiPricingOptions,
  convertLegacyPrice
};