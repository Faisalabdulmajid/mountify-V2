# MAPPING DESKRIPSI KE DATABASE - DISESUAIKAN DENGAN FUZZY ENGINE

File dokumentasi ini berisi pemetaan dari deskripsi yang mudah dipahami ke nilai numerik untuk database dan sistem logika fuzzy.

## 📋 CATATAN PENTING

- Nilai numerik sudah disesuaikan dengan membership functions fuzzy engine
- Setiap kategori memiliki rentang nilai spesifik sesuai dengan trapmf di fuzzy_engine.py
- Formula perhitungan skor gabungan mengikuti calculateFinalScores() di TambahJalur.js
- Mapping ini 100% kompatibel dengan sistem rekomendasi fuzzy

---

## 🏔️ MAPPING DESKRIPSI KE NILAI NUMERIK

### 1. TINGKAT KESULITAN MEDAN
**Field Database:** `kesulitan_skala`  
**Fuzzy Ranges:** mudah [0,0,2,4], sedang [3,4,5,7], sulit [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Sangat Mudah (0-2): Jalur landai, setapak jelas | `1` | Untuk pemula |
| Mudah (3-4): Tanjakan sedang, bebatuan kecil | `3` | Cukup mudah |
| Sedang (5-6): Tanjakan panjang, butuh bantuan tangan | `5` | Perlu stamina |
| Sulit (7-8): Sangat curam >45°, scrambling | `7` | Untuk berpengalaman |
| Sangat Sulit (9-10): Mendekati vertikal, butuh keahlian panjat | `9` | Expert level |

---

### 2. TINGKAT KEAMANAN NAVIGASI
**Field Database:** `keamanan_skala`  
**Fuzzy Ranges:** berbahaya [0,0,2,4], cukup_aman [3,4,5,7], aman [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Aman (7-10): Jalur jelas, terawat, jauh dari risiko | `9` | Sangat aman |
| Cukup Aman (4-6): Beberapa titik waspada, jalur aman | `6` | Perlu hati-hati |
| Berbahaya (0-3): Riwayat longsor, kawah aktif, jurang tanpa pengaman | `2` | Risiko tinggi |

---

### 3. TINGKAT RISIKO KECELAKAAN
**Field Database:** `tingkat_insiden_skala`  
**Fuzzy Ranges:** tinggi [0,0,2,4], sedang [3,5,6,8], rendah [8,9,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Rendah/Jarang (8-10): <5 insiden SAR per tahun | `9` | Sangat jarang kecelakaan |
| Sedang (4-7): 5-10 insiden per tahun | `6` | Kadang ada kecelakaan |
| Tinggi/Sering (0-3): >10 insiden SAR per tahun | `2` | Sering kecelakaan |

---

### 4. KUALITAS FASILITAS BASECAMP
**Field Database:** `kualitas_fasilitas_skala`  
**Fuzzy Ranges:** minim [0,0,2,4], cukup [3,4,5,7], lengkap [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Sangat Lengkap (9-10): Fasilitas modern, penginapan, persewaan alat | `9` | Fasilitas lengkap |
| Lengkap (6-8): Basecamp terorganisir, pusat info, mushola, warung | `7` | Fasilitas memadai |
| Cukup (3-5): Basecamp sederhana, toilet umum, warung kecil | `5` | Fasilitas dasar |
| Sangat Minim (0-2): Tidak ada basecamp resmi, pendaftaran di rumah warga | `1` | Fasilitas minim |

---

### 5. KETERSEDIAAN SUMBER AIR
**Field Database:** `ketersediaan_sumber_air_skala`  
**Fuzzy Ranges:** langka [0,0,1,3], terbatas [2,4,5,7], melimpah [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos | `9` | Air banyak |
| Terbatas (3-6): 1-3 titik sumber air, mungkin musiman | `5` | Air terbatas |
| Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp | `1` | Air langka |

---

### 6. KUALITAS LAHAN KEMAH
**Field Database:** `kualitas_kemah_skala`  
**Fuzzy Ranges:** buruk [0,0,2,4], cukup [3,4,5,7], baik [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Baik (7-10): Lahan luas, datar, bersih, sumber air dekat <5 menit | `9` | Lahan kemah bagus |
| Cukup (4-6): Lahan untuk 5-10 tenda, sumber air <30 menit | `6` | Lahan kemah memadai |
| Buruk (0-3): Lahan miring, berbatu, sempit, sumber air >1 jam | `2` | Lahan kemah kurang |

---

### 7. PERLINDUNGAN AREA KEMAH
**Field Database:** `perlindungan_angin_kemah_skala`  
**Fuzzy Ranges:** sangat_terekspos [0,0,2,4], cukup_terlindungi [3,4,5,7], terlindungi [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Terlindungi (7-10): Dalam hutan lebat atau lembah dalam | `9` | Terlindungi baik |
| Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan | `6` | Cukup terlindungi |
| Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang | `2` | Terbuka angin |

---

### 8. VARIASI LANSKAP
**Field Database:** `variasi_lanskap_skala`  
**Fuzzy Ranges:** monoton [0,0,2,4], cukup_bervariasi [3,4,5,7], sangat_bervariasi [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Sangat Bervariasi (7-10): >3 ekosistem berbeda | `9` | Lanskap beragam |
| Cukup Bervariasi (4-6): 2-3 transisi ekosistem | `6` | Lanskap cukup beragam |
| Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir | `2` | Lanskap monoton |

---

### 9. KUALITAS PEMANDANGAN
**Field Database:** `keindahan_pemandangan_skala`  
**Fuzzy Ranges:** biasa [0,0,2,4], indah [3,5,6,7], istimewa [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Istimewa/Ikonik (9-10): Panoramik 360°, fitur ikonik terkenal | `9` | Pemandangan istimewa |
| Sangat Indah/Panoramik (7-8): Sebagian besar jalur terbuka | `7` | Sangat indah |
| Indah/Terbuka Sebagian (4-6): Beberapa titik dengan pemandangan bagus | `5` | Cukup indah |
| Biasa/Terbatas (0-3): Hutan rapat, pemandangan hanya di puncak | `2` | Pemandangan biasa |

---

### 10. KUALITAS JARINGAN KOMUNIKASI
**Field Database:** `jaringan_komunikasi_skala`  
**Fuzzy Ranges:** tidak_ada [0,0,1,2], terbatas [2,4,5,7], baik [6,8,10,10]

| Deskripsi | Nilai | Keterangan |
|-----------|-------|------------|
| Belum Diketahui | `null` | Data tidak tersedia |
| Baik (7-10): Sinyal tersedia di sebagian besar jalur | `9` | Sinyal bagus |
| Terbatas (3-6): Sinyal hanya di titik tertentu | `5` | Sinyal terbatas |
| Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp | `1` | Tidak ada sinyal |

---

## 🔧 MAPPING FIELD FORM KE DATABASE

### Field Fuzzy Engine (Input Langsung)

| Field Form | Field Database | Keterangan |
|------------|----------------|------------|
| `ketersediaan_sumber_air_skala` | `ketersediaan_sumber_air_skala` | Langsung disimpan |
| `variasi_lanskap_skala` | `variasi_lanskap_skala` | Langsung disimpan |
| `perlindungan_angin_kemah_skala` | `perlindungan_angin_kemah_skala` | Langsung disimpan |
| `jaringan_komunikasi_skala` | `jaringan_komunikasi_skala` | Langsung disimpan |
| `tingkat_insiden_skala` | `tingkat_insiden_skala` | Langsung disimpan |

### Field Parameter Penilaian (Dihitung Otomatis)

| Field Form | Field Database | Kategori | Perhitungan |
|------------|----------------|----------|-------------|
| `medan` | `kesulitan_skala` | Kesulitan | Rata-rata dari [medan] |
| `navigasi` | `keamanan_skala` | Keamanan | Rata-rata dari [navigasi, risiko_tambahan, jaringan_komunikasi] |
| `basecamp` | `kualitas_fasilitas_skala` | Fasilitas | Rata-rata dari [basecamp, sumber_air] |
| `lahan_kemah` | `kualitas_kemah_skala` | Kemah | Rata-rata dari [lahan_kemah, perlindungan_kemah] |
| `viewpoint` | `keindahan_pemandangan_skala` | Pemandangan | Rata-rata dari [lanskap, viewpoint] |

---

## 📊 FORMULA PERHITUNGAN SKOR GABUNGAN

### Rumus Dasar
```
Skor = ROUND(SUM(nilai_valid) / COUNT(nilai_valid))
```

### Contoh Perhitungan
```
Input: [navigasi=9, risiko_tambahan=6, jaringan_komunikasi=5]
Hasil: keamanan_skala = ROUND((9+6+5)/3) = ROUND(6.67) = 7
```

### Aturan Khusus
- Jika semua nilai `null` → hasil = `0`
- Nilai `null` diabaikan dalam perhitungan
- Hasil selalu dibulatkan ke bilangan bulat
- Rentang hasil: 0-10

---

## 🎯 VALIDASI DATA

### Aturan Pengisian
- **Nama Jalur:** 3-100 karakter
- **Estimasi Waktu:** 1-168 jam (maksimal 7 hari)
- **Biaya SIMAKSI:** Rp 0 - Rp 1.000.000
- **Koordinat Lintang:** -90 sampai 90
- **Koordinat Bujur:** -180 sampai 180
- **Deskripsi:** Maksimal 1000 karakter

### Field Wajib
- ✅ Pilih Gunung
- ✅ Nama Jalur
- ✅ Estimasi Waktu
- ✅ Status Jalur
- ✅ Semua Parameter Fuzzy Engine
- ✅ Semua Parameter Penilaian

### Field Opsional
- Lokasi Pintu Masuk
- Biaya SIMAKSI
- Biaya Pulang Pergi
- Koordinat GPS
- Deskripsi Jalur

---

## 🔗 INTEGRASI DENGAN SISTEM

### 1. Frontend (TambahJalur.js)
- Form input menggunakan dropdown deskriptif
- Konversi otomatis ke nilai numerik
- Perhitungan skor gabungan real-time

### 2. Backend (Database)
- Penyimpanan nilai numerik di field skala
- Validasi rentang nilai 0-10
- Dukungan nilai `null` untuk data tidak tersedia

### 3. Fuzzy Engine (fuzzy_engine.py)
- Membership functions sesuai rentang nilai
- Rules berdasarkan kategori fuzzy
- Output skor rekomendasi 0-100

### 4. API Rekomendasi
- Filter berdasarkan preferensi user
- Ranking berdasarkan skor fuzzy
- Metadata lengkap untuk setiap hasil

---

## 📝 CATATAN PENGEMBANGAN

### Version History
- v1.0: Mapping dasar sesuai scoreMappings
- v1.1: Penyesuaian dengan fuzzy engine membership functions
- v1.2: Dokumentasi lengkap dan validasi

### Kompatibilitas
- ✅ TambahJalur.js calculateFinalScores()
- ✅ fuzzy_engine.py membership functions
- ✅ Database schema jalur_pendakian
- ✅ API rekomendasi endpoints

### Maintenance
- Review mapping setiap update fuzzy engine
- Validasi konsistensi data berkala
- Update dokumentasi saat ada perubahan field