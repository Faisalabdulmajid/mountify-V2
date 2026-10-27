/*
PANDUAN LENGKAP DATA JALUR PENDAKIAN GUNUNG
Dokumen ini berisi semua pilihan yang tersedia untuk menambah data jalur pendakian baru
*/

// ========================================
// KONDISI JALUR SAAT INI
// ========================================
const KONDISI_JALUR = [
  "Belum Diketahui",
  "Buka - Boleh didaki semua orang",
  "Buka - Wajib pakai pemandu/tour guide", 
  "Tutup Sementara - Sedang dalam perbaikan",
  "Tutup - Tidak boleh didaki",
];

// ========================================
// PILIHAN PENILAIAN JALUR PENDAKIAN
// ========================================
const PENILAIAN_JALUR = {
  // 1. Seberapa Sulit Jalurnya
  medan: {
    "Belum Diketahui": null,
    "Sangat Mudah - Jalur datar dan landai, setapak jelas terlihat": 1,
    "Mudah - Ada tanjakan ringan, sedikit bebatuan kecil": 3,
    "Sedang - Tanjakan cukup panjang, kadang perlu bantuan tangan": 5,
    "Sulit - Sangat curam dan terjal, perlu teknik memanjat ringan": 7,
    "Sangat Sulit - Hampir tegak lurus, butuh keahlian memanjat": 9,
  },

  // 2. Seberapa Aman Jalurnya
  navigasi: {
    "Belum Diketahui": null,
    "Aman - Jalur jelas, terawat baik, jauh dari bahaya": 9,
    "Cukup Aman - Ada beberapa titik yang perlu hati-hati": 6,
    "Berbahaya - Pernah ada longsor, dekat kawah aktif, atau jurang curam": 2,
  },
  risiko_tambahan: {
    "Belum Diketahui": null,
    "Jarang Ada Kecelakaan - Kurang dari 5 kasus per tahun": 9,
    "Kadang Ada Kecelakaan - Sekitar 5-10 kasus per tahun": 6,
    "Sering Ada Kecelakaan - Lebih dari 10 kasus per tahun": 2,
  },

  // 3. Fasilitas di Tempat Start Pendakian
  basecamp: {
    "Belum Diketahui": null,
    "Sangat Lengkap - Ada penginapan, persewaan alat, dan fasilitas modern": 9,
    "Lengkap - Ada pusat informasi, mushola, warung, dan toilet": 7,
    "Cukup - Basecamp sederhana dengan toilet dan warung kecil": 5,
    "Sangat Minim - Tidak ada basecamp resmi, daftar di rumah warga": 1,
  },
  sumber_air: {
    "Belum Diketahui": null,
    "Banyak Air - Ada lebih dari 3 sumber air bersih di sepanjang jalur": 9,
    "Air Terbatas - Ada 1-3 sumber air, tapi mungkin kering saat musim kemarau": 5,
    "Tidak Ada Air - Harus bawa semua air dari basecamp": 1,
  },

  // 4. Tempat untuk Berkemah
  lahan_kemah: {
    "Belum Diketahui": null,
    "Bagus - Tanah datar dan luas, bersih, ada air dalam 5 menit jalan": 9,
    "Cukup - Muat untuk 5-10 tenda, air bisa dicari dalam 30 menit": 6,
    "Kurang Bagus - Tanah miring dan berbatu, air jauh lebih dari 1 jam": 2,
  },
  perlindungan_kemah: {
    "Belum Diketahui": null,
    "Terlindungi - Di dalam hutan lebat atau lembah yang teduh": 9,
    "Cukup Terlindungi - Di antara pepohonan atau lembah kecil": 6,
    "Terbuka - Di puncak atau sabana tanpa pohon, angin kencang": 2,
  },

  // 5. Pemandangan dan Variasi Alam
  lanskap: {
    "Belum Diketahui": null,
    "Sangat Beragam - Lewat lebih dari 3 jenis alam berbeda (hutan, padang rumput, bebatuan)": 9,
    "Cukup Beragam - Lewat 2-3 jenis alam yang berbeda": 6,
    "Monoton - Hanya satu jenis alam dari awal sampai akhir": 2,
  },
  viewpoint: {
    "Belum Diketahui": null,
    "Luar Biasa Indah - Pemandangan 360 derajat, tempat yang sangat terkenal": 9,
    "Sangat Indah - Sebagian besar jalur terbuka dengan pemandangan bagus": 7,
    "Cukup Indah - Ada beberapa spot pemandangan yang bagus": 5,
    "Biasa Saja - Hutan rapat, pemandangan hanya terlihat di puncak": 2,
  },

  // 6. Sinyal HP dan Komunikasi
  jaringan_komunikasi: {
    "Belum Diketahui": null,
    "Sinyal Bagus - HP bisa dipakai di sebagian besar jalur": 9,
    "Sinyal Terbatas - HP hanya nyala di beberapa tempat tertentu": 5,
    "Tidak Ada Sinyal - HP mati total setelah keluar dari basecamp": 1,
  },
};

// ========================================
// PILIHAN UNTUK SISTEM PENILAIAN OTOMATIS
// ========================================
const SISTEM_PENILAIAN = {
  ketersediaan_sumber_air_skala: [
    "Belum Diketahui",
    "Banyak Air - Ada lebih dari 3 sumber air bersih di sepanjang jalur",
    "Air Terbatas - Ada 1-3 sumber air, tapi mungkin kering saat musim kemarau", 
    "Tidak Ada Air - Harus bawa semua air dari basecamp",
  ],
  variasi_lanskap_skala: [
    "Belum Diketahui",
    "Sangat Beragam - Lewat lebih dari 3 jenis alam berbeda",
    "Cukup Beragam - Lewat 2-3 jenis alam yang berbeda",
    "Monoton - Hanya satu jenis alam dari awal sampai akhir",
  ],
  perlindungan_angin_kemah_skala: [
    "Belum Diketahui",
    "Terlindungi - Di dalam hutan lebat atau lembah yang teduh",
    "Cukup Terlindungi - Di antara pepohonan atau lembah kecil",
    "Terbuka - Di puncak atau sabana tanpa pohon, angin kencang",
  ],
  jaringan_komunikasi_skala: [
    "Belum Diketahui", 
    "Sinyal Bagus - HP bisa dipakai di sebagian besar jalur",
    "Sinyal Terbatas - HP hanya nyala di beberapa tempat tertentu",
    "Tidak Ada Sinyal - HP mati total setelah keluar dari basecamp",
  ],
  tingkat_insiden_skala: [
    "Belum Diketahui",
    "Jarang Ada Kecelakaan - Kurang dari 5 kasus per tahun",
    "Kadang Ada Kecelakaan - Sekitar 5-10 kasus per tahun", 
    "Sering Ada Kecelakaan - Lebih dari 10 kasus per tahun",
  ],
};

// ========================================
// HUBUNGAN ANTARA FIELD DAN PENILAIAN
// ========================================
const HUBUNGAN_FIELD = {
  ketersediaan_sumber_air_skala: "sumber_air",
  variasi_lanskap_skala: "lanskap",
  perlindungan_angin_kemah_skala: "perlindungan_kemah",
  jaringan_komunikasi_skala: "jaringan_komunikasi",
  tingkat_insiden_skala: "risiko_tambahan",
};

// ========================================
// DATA APA SAJA YANG HARUS DIISI
// ========================================
const DATA_YANG_DIPERLUKAN = {
  // Data Dasar Jalur
  identitas: {
    id_gunung: { required: true, label: 'Pilih Gunung Mana' },
    nama_jalur: { required: true, label: 'Nama Jalur Pendakian' },
    lokasi_pintu_masuk: { required: false, label: 'Lokasi Pintu Masuk/Gerbang' },
    status_jalur: { required: true, label: 'Status Jalur Saat Ini' },
  },
  
  // Informasi Penting untuk Sistem
  fuzzy_engine: {
    estimasi_waktu_jam: { required: true, label: 'Berapa Lama Waktu Pendakian (dalam jam)' },
    ketersediaan_sumber_air_skala: { required: true, label: 'Ketersediaan Air Bersih' },
    variasi_lanskap_skala: { required: true, label: 'Variasi Pemandangan Alam' },
    perlindungan_angin_kemah_skala: { required: true, label: 'Perlindungan Area Kemah dari Angin' },
    jaringan_komunikasi_skala: { required: true, label: 'Kualitas Sinyal HP' },
    tingkat_insiden_skala: { required: true, label: 'Seberapa Sering Terjadi Kecelakaan' },
  },
  
  // Penilaian Kualitas Jalur
  parameter_penilaian: {
    medan: { required: true, label: 'Seberapa Sulit Medannya', group: 'Tingkat Kesulitan' },
    navigasi: { required: true, label: 'Seberapa Aman Jalurnya', group: 'Tingkat Keamanan' },
    basecamp: { required: true, label: 'Fasilitas di Basecamp', group: 'Kualitas Fasilitas' },
    lahan_kemah: { required: true, label: 'Kualitas Tempat Kemah', group: 'Kualitas Area Kemah' },
    viewpoint: { required: true, label: 'Keindahan Pemandangan', group: 'Keindahan Pemandangan' },
  },
  
  // Informasi Biaya (Opsional)
  biaya: {
    biaya_simaksi: { required: false, label: 'Biaya Izin Masuk (SIMAKSI)' },
    biaya_pulang_pergi: { required: false, label: 'Biaya Transportasi PP' },
    use_city_based_pp: { required: false, label: 'Hitung Biaya Berdasarkan Kota Asal' },
  },
  
  // Lokasi GPS (Opsional)
  koordinat: {
    latitude: { required: false, label: 'Koordinat Lintang' },
    longitude: { required: false, label: 'Koordinat Bujur' },
    coordinate_source: { required: false, label: 'Sumber Koordinat' },
  },
  
  // Keterangan Tambahan (Opsional)
  deskripsi: {
    deskripsi_jalur: { required: false, label: 'Cerita Singkat Tentang Jalur Ini' },
  }
};

// ========================================
// FUNGSI BANTUAN UNTUK MENGAMBIL DATA
// ========================================
const ambilPilihanDropdown = (namaField) => {
  if (SISTEM_PENILAIAN[namaField]) {
    return SISTEM_PENILAIAN[namaField];
  }
  
  // Cari di PENILAIAN_JALUR
  for (const [key, mapping] of Object.entries(PENILAIAN_JALUR)) {
    if (namaField === key) {
      return Object.keys(mapping);
    }
  }
  
  return [];
};

const ambilSkorField = (namaField, nilaiDipilih) => {
  if (SISTEM_PENILAIAN[namaField]) {
    const mappingKey = HUBUNGAN_FIELD[namaField];
    return PENILAIAN_JALUR[mappingKey]?.[nilaiDipilih] || null;
  }
  
  return PENILAIAN_JALUR[namaField]?.[nilaiDipilih] || null;
};

// ========================================
// ATURAN PENGISIAN DATA
// ========================================
const ATURAN_PENGISIAN = {
  nama_jalur: {
    minLength: 3,
    maxLength: 100,
    message: "Nama jalur minimal 3 huruf, maksimal 100 huruf"
  },
  estimasi_waktu_jam: {
    min: 1,
    max: 168,
    message: "Waktu pendakian minimal 1 jam, maksimal 7 hari (168 jam)"
  },
  biaya_simaksi: {
    min: 0,
    max: 1000000,
    message: "Biaya SIMAKSI antara Rp 0 - Rp 1.000.000"
  },
  latitude: {
    min: -90,
    max: 90,
    message: "Koordinat lintang harus antara -90 sampai 90"
  },
  longitude: {
    min: -180,
    max: 180,
    message: "Koordinat bujur harus antara -180 sampai 180"
  },
  deskripsi_jalur: {
    maxLength: 1000,
    message: "Deskripsi maksimal 1000 huruf"
  }
};

// ========================================
// KONFIGURASI LENGKAP UNTUK SISTEM
// ========================================
const KONFIGURASI_LENGKAP = {
  KONDISI_JALUR,
  PENILAIAN_JALUR,
  SISTEM_PENILAIAN,
  HUBUNGAN_FIELD,
  DATA_YANG_DIPERLUKAN,
  ambilPilihanDropdown,
  ambilSkorField,
  ATURAN_PENGISIAN
};

// Bagian ini diperlukan sistem untuk menggunakan data di atas
module.exports = {
  TRAIL_STATUS_OPTIONS: KONDISI_JALUR,
  scoreMappings: PENILAIAN_JALUR,
  fuzzyDropdownOptions: SISTEM_PENILAIAN,
  fuzzyFieldToMapping: HUBUNGAN_FIELD,
  REQUIRED_FIELDS: DATA_YANG_DIPERLUKAN,
  getDropdownOptions: ambilPilihanDropdown,
  getFieldScore: ambilSkorField,
  VALIDATION_RULES: ATURAN_PENGISIAN
};