/*
MAPPING DESKRIPSI KE DATABASE - DISESUAIKAN DENGAN FUZZY ENGINE
File ini berisi pemetaan dari deskripsi yang mudah dipahami ke nilai numerik untuk database
dan sistem logika fuzzy

CATATAN PENTING:
- Nilai numerik sudah disesuaikan dengan membership functions fuzzy engine
- Setiap kategori memiliki rentang nilai spesifik sesuai dengan trapmf di fuzzy_engine.py
- Formula perhitungan skor gabungan mengikuti calculateFinalScores() di TambahJalur.js
- Mapping ini 100% kompatibel dengan sistem rekomendasi fuzzy
*/

// ========================================
// MAPPING DESKRIPSI KE NILAI NUMERIK UNTUK DATABASE
// ========================================
// CATATAN: Mapping ini disesuaikan dengan membership functions fuzzy engine
// yang menggunakan rentang nilai spesifik untuk setiap kategori

const MAPPING_DESKRIPSI_KE_NUMERIK = {

  // 1. TINGKAT KESULITAN MEDAN
  // Fuzzy ranges: mudah [0,0,2,4], sedang [3,4,5,7], sulit [6,8,10,10]
  medan: {
    "Belum Diketahui": null,
    "Sangat Mudah (0-2): Jalur landai, setapak jelas": 1,
    "Mudah (3-4): Tanjakan sedang, bebatuan kecil": 3,
    "Sedang (5-6): Tanjakan panjang, butuh bantuan tangan": 5,  
    "Sulit (7-8): Sangat curam >45°, scrambling": 7,
    "Sangat Sulit (9-10): Mendekati vertikal, butuh keahlian panjat": 9
  },

  // 2. TINGKAT KEAMANAN NAVIGASI  
  // Fuzzy ranges: berbahaya [0,0,2,4], cukup_aman [3,4,5,7], aman [6,8,10,10]
  navigasi: {
    "Belum Diketahui": null,
    "Aman (7-10): Jalur jelas, terawat, jauh dari risiko": 9,
    "Cukup Aman (4-6): Beberapa titik waspada, jalur aman": 6,
    "Berbahaya (0-3): Riwayat longsor, kawah aktif, jurang tanpa pengaman": 2
  },

  // 3. TINGKAT RISIKO KECELAKAAN
  risiko_tambahan: {
    "Belum Diketahui": null,
    "Rendah/Jarang (8-10): <5 insiden SAR per tahun": 9,
    "Sedang (4-7): 5-10 insiden per tahun": 6,
    "Tinggi/Sering (0-3): >10 insiden SAR per tahun": 2
  },

  // 4. KUALITAS FASILITAS BASECAMP
  // Fuzzy ranges: minim [0,0,2,4], cukup [3,4,5,7], lengkap [6,8,10,10]
  basecamp: {
    "Belum Diketahui": null,
    "Sangat Lengkap (9-10): Fasilitas modern, penginapan, persewaan alat": 9,
    "Lengkap (6-8): Basecamp terorganisir, pusat info, mushola, warung": 7,
    "Cukup (3-5): Basecamp sederhana, toilet umum, warung kecil": 5,
    "Sangat Minim (0-2): Tidak ada basecamp resmi, pendaftaran di rumah warga": 1
  },

  // 5. KETERSEDIAAN SUMBER AIR
  // Fuzzy ranges: langka [0,0,1,3], terbatas [2,4,5,7], melimpah [6,8,10,10]
  sumber_air: {
    "Belum Diketahui": null,
    "Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos": 9,
    "Terbatas (3-6): 1-3 titik sumber air, mungkin musiman": 5, 
    "Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp": 1
  },

  // 6. KUALITAS LAHAN KEMAH
  // Fuzzy ranges: buruk [0,0,2,4], cukup [3,4,5,7], baik [6,8,10,10]
  lahan_kemah: {
    "Belum Diketahui": null,
    "Baik (7-10): Lahan luas, datar, bersih, sumber air dekat <5 menit": 9,
    "Cukup (4-6): Lahan untuk 5-10 tenda, sumber air <30 menit": 6,
    "Buruk (0-3): Lahan miring, berbatu, sempit, sumber air >1 jam": 2
  },

  // 7. PERLINDUNGAN AREA KEMAH
  // Fuzzy ranges: sangat_terekspos [0,0,2,4], cukup_terlindungi [3,4,5,7], terlindungi [6,8,10,10]
  perlindungan_kemah: {
    "Belum Diketahui": null,
    "Terlindungi (7-10): Dalam hutan lebat atau lembah dalam": 9,
    "Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan": 6,
    "Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang": 2
  },

  // 8. VARIASI LANSKAP
  // Fuzzy ranges: monoton [0,0,2,4], cukup_bervariasi [3,4,5,7], sangat_bervariasi [6,8,10,10]
  lanskap: {
    "Belum Diketahui": null,
    "Sangat Bervariasi (7-10): >3 ekosistem berbeda": 9,
    "Cukup Bervariasi (4-6): 2-3 transisi ekosistem": 6,
    "Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir": 2
  },

  // 9. KUALITAS PEMANDANGAN
  // Fuzzy ranges: biasa [0,0,2,4], indah [3,5,6,7], istimewa [6,8,10,10]
  viewpoint: {
    "Belum Diketahui": null,
    "Istimewa/Ikonik (9-10): Panoramik 360°, fitur ikonik terkenal": 9,
    "Sangat Indah/Panoramik (7-8): Sebagian besar jalur terbuka": 7,
    "Indah/Terbuka Sebagian (4-6): Beberapa titik dengan pemandangan bagus": 5,
    "Biasa/Terbatas (0-3): Hutan rapat, pemandangan hanya di puncak": 2
  },

  // 10. KUALITAS JARINGAN KOMUNIKASI
  // Fuzzy ranges: tidak_ada [0,0,1,2], terbatas [2,4,5,7], baik [6,8,10,10]
  jaringan_komunikasi: {
    "Belum Diketahui": null,
    "Baik (7-10): Sinyal tersedia di sebagian besar jalur": 9,
    "Terbatas (3-6): Sinyal hanya di titik tertentu": 5,
    "Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp": 1
  }
};

// ========================================
// MAPPING FIELD FORM KE NAMA DATABASE
// ========================================

const MAPPING_FIELD_KE_DATABASE = {
  // Field Fuzzy Engine (diinput langsung)
  "ketersediaan_sumber_air_skala": {
    database_field: "ketersediaan_sumber_air_skala",
    nilai_mapping: {
      "Belum Diketahui": null,
      "Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos": 9,
      "Terbatas (3-6): 1-3 titik sumber air, mungkin musiman": 5,
      "Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp": 1
    }
  },
  
  "variasi_lanskap_skala": {
    database_field: "variasi_lanskap_skala", 
    nilai_mapping: {
      "Belum Diketahui": null,
      "Sangat Bervariasi (7-10): >3 ekosistem berbeda": 9,
      "Cukup Bervariasi (4-6): 2-3 transisi ekosistem": 6,
      "Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir": 2
    }
  },

  "perlindungan_angin_kemah_skala": {
    database_field: "perlindungan_angin_kemah_skala",
    nilai_mapping: {
      "Belum Diketahui": null,
      "Terlindungi (7-10): Dalam hutan lebat atau lembah dalam": 9,
      "Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan": 6,
      "Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang": 2
    }
  },

  "jaringan_komunikasi_skala": {
    database_field: "jaringan_komunikasi_skala",
    nilai_mapping: {
      "Belum Diketahui": null,
      "Baik (7-10): Sinyal tersedia di sebagian besar jalur": 9,
      "Terbatas (3-6): Sinyal hanya di titik tertentu": 5,
      "Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp": 1
    }
  },

  "tingkat_insiden_skala": {
    database_field: "tingkat_insiden_skala", 
    nilai_mapping: {
      "Belum Diketahui": null,
      "Rendah/Jarang (8-10): <5 insiden SAR per tahun": 9,
      "Sedang (4-7): 5-10 insiden per tahun": 6,
      "Tinggi/Sering (0-3): >10 insiden SAR per tahun": 2
    }
  },

  // Field Parameter Penilaian (dihitung otomatis dari beberapa field)
  "medan": {
    database_field: "kesulitan_skala",
    kategori: "kesulitan",
    nilai_mapping: MAPPING_DESKRIPSI_KE_NUMERIK.medan
  },

  "navigasi": {
    database_field: "keamanan_skala", 
    kategori: "keamanan",
    nilai_mapping: MAPPING_DESKRIPSI_KE_NUMERIK.navigasi
  },

  "basecamp": {
    database_field: "kualitas_fasilitas_skala",
    kategori: "fasilitas", 
    nilai_mapping: MAPPING_DESKRIPSI_KE_NUMERIK.basecamp
  },

  "lahan_kemah": {
    database_field: "kualitas_kemah_skala",
    kategori: "kemah",
    nilai_mapping: MAPPING_DESKRIPSI_KE_NUMERIK.lahan_kemah
  },

  "viewpoint": {
    database_field: "keindahan_pemandangan_skala",
    kategori: "pemandangan",
    nilai_mapping: MAPPING_DESKRIPSI_KE_NUMERIK.viewpoint
  }
};

// ========================================
// FUNGSI UNTUK KONVERSI DESKRIPSI KE NUMERIK
// ========================================

const konversiDeskripsiKeNumerik = (namaField, deskripsi) => {
  // Cek apakah field ada di mapping
  if (MAPPING_FIELD_KE_DATABASE[namaField]) {
    const mapping = MAPPING_FIELD_KE_DATABASE[namaField].nilai_mapping;
    return mapping[deskripsi] !== undefined ? mapping[deskripsi] : null;
  }
  
  // Fallback ke mapping deskripsi langsung
  if (MAPPING_DESKRIPSI_KE_NUMERIK[namaField]) {
    return MAPPING_DESKRIPSI_KE_NUMERIK[namaField][deskripsi] || null;
  }
  
  return null;
};

const ambilFieldDatabase = (namaField) => {
  if (MAPPING_FIELD_KE_DATABASE[namaField]) {
    return MAPPING_FIELD_KE_DATABASE[namaField].database_field;
  }
  return namaField; // Default: nama field sama
};

const ambilKategoriField = (namaField) => {
  if (MAPPING_FIELD_KE_DATABASE[namaField]) {
    return MAPPING_FIELD_KE_DATABASE[namaField].kategori || null;
  }
  return null;
};

// ========================================  
// FORMULA PERHITUNGAN SKOR GABUNGAN
// ========================================
// CATATAN: Sesuai dengan perhitungan di TambahJalur.js calculateFinalScores()

const hitungSkorGabungan = (arrayNilai) => {
  // Filter nilai yang tidak null
  const nilaiValid = arrayNilai.filter(nilai => nilai !== null && nilai !== undefined);
  
  if (nilaiValid.length === 0) return 0; // Return 0 jika tidak ada nilai valid (sesuai fuzzy engine)
  
  // Hitung rata-rata dan bulatkan (sesuai calculateFinalScores)
  const total = nilaiValid.reduce((sum, nilai) => sum + nilai, 0);
  return Math.round(total / nilaiValid.length);
};

// Formula perhitungan skor akhir sesuai dengan sistem fuzzy
const hitungSkorAkhir = (dataInput) => {
  return {
    kesulitan_skala: hitungSkorGabungan([
      dataInput.medan
    ]),
    
    keamanan_skala: hitungSkorGabungan([
      dataInput.navigasi,
      dataInput.risiko_tambahan,
      dataInput.jaringan_komunikasi
    ]),
    
    kualitas_fasilitas_skala: hitungSkorGabungan([
      dataInput.basecamp,
      dataInput.sumber_air
    ]),
    
    kualitas_kemah_skala: hitungSkorGabungan([
      dataInput.lahan_kemah,
      dataInput.perlindungan_kemah
    ]),
    
    keindahan_pemandangan_skala: hitungSkorGabungan([
      dataInput.lanskap,
      dataInput.viewpoint
    ])
  };
};

// ========================================
// EXPORT UNTUK SISTEM
// ========================================

module.exports = {
  MAPPING_DESKRIPSI_KE_NUMERIK,
  MAPPING_FIELD_KE_DATABASE,
  konversiDeskripsiKeNumerik,
  ambilFieldDatabase,
  ambilKategoriField,
  hitungSkorGabungan,
  hitungSkorAkhir
};