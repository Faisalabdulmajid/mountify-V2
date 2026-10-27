# -*- coding: utf-8 -*-
"""
Fuzzy Engine Rekomendasi Pendakian (Versi Lengkap Sesuai Dokumen)

Deskripsi:
Kode ini mengimplementasikan sistem logika fuzzy untuk memberikan rekomendasi
jalur pendakian gunung, disesuaikan sepenuhnya dengan metrik dari dokumen
"detail standard fuzzy engine".

Versi ini mencakup 13 variabel input untuk penilaian yang komprehensif.

Cara Penggunaan:
1. Jalankan sel di atas untuk menginstal library yang dibutuhkan.
2. Jalankan sisa skrip ini di sel berikutnya.
"""

# 1. Import Library
import sys
import json
import numpy as np
import pandas as pd
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import psycopg2
import os
import traceback

# Import JSON-based pricing configuration
try:
    from pricing_config import (
        get_pricing_config, 
        refresh_pricing_cache, 
        detect_region_from_mountain_name, 
        calculate_transport_cost_by_distance
    )
    PRICING_CONFIG_AVAILABLE = True
    print("✅ JSON-based pricing config loaded", file=sys.stderr)
except ImportError as e:
    PRICING_CONFIG_AVAILABLE = False
    print(f"⚠️ Fallback to hardcoded pricing: {e}", file=sys.stderr)
    
    # Fallback functions if pricing_config not available
    def detect_region_from_mountain_name(mountain_name):
        """Fallback region detection"""
        mountain_name_lower = str(mountain_name).lower()
        if any(x in mountain_name_lower for x in ['gede', 'pangrango', 'salak', 'ciremai', 'tangkuban', 'papandayan', 'galunggung']):
            return 'jawa_barat'
        elif any(x in mountain_name_lower for x in ['merbabu', 'sumbing', 'sindoro', 'slamet', 'prau', 'lawu', 'merapi']):
            return 'jawa_tengah'
        elif any(x in mountain_name_lower for x in ['semeru', 'arjuno', 'raung', 'argopuro', 'bromo', 'kelud', 'ijen']):
            return 'jawa_timur'
        elif any(x in mountain_name_lower for x in ['rinjani', 'lombok']):
            return 'nusa_tenggara'
        elif 'kerinci' in mountain_name_lower:
            return 'sumatra'
        else:
            return 'default'
            
    def calculate_transport_cost_by_distance(distance, region='default'):
        """Fallback transport cost calculation"""
        regional_config = {
            'jawa_tengah': {'base': 25000, 'multiplier': 750},
            'jawa_timur': {'base': 30000, 'multiplier': 850},
            'jawa_barat': {'base': 20000, 'multiplier': 700},
            'yogyakarta': {'base': 20000, 'multiplier': 700},
            'sumatra': {'base': 50000, 'multiplier': 1200},
            'sulawesi': {'base': 60000, 'multiplier': 1300},
            'kalimantan': {'base': 70000, 'multiplier': 1400},
            'nusa_tenggara': {'base': 80000, 'multiplier': 1500},
            'default': {'base': 35000, 'multiplier': 1000}
        }
        config = regional_config.get(region, regional_config['default'])
        if distance <= 30:
            return config['base']
        elif distance <= 60:
            return config['base'] + int(distance * config['multiplier'] * 0.8)
        elif distance <= 120:
            return config['base'] + int(distance * config['multiplier'])
        elif distance <= 200:
            return config['base'] + int(distance * config['multiplier'] * 1.2)
        else:
            return config['base'] + int(distance * config['multiplier'] * 1.5)

sys.stdout.reconfigure(encoding='utf-8')

# Initialize pricing config instance
if PRICING_CONFIG_AVAILABLE:
    pricing_config = get_pricing_config()
    print("✅ Pricing config instance initialized", file=sys.stderr)
else:
    pricing_config = None
    print("⚠️ Using fallback pricing functions", file=sys.stderr)

# Hapus print statement yang mengacaukan JSON output

# 2. Koneksi Database dan Pengambilan Data Real
def check_manual_cost_columns(conn):
    """
    Cek apakah kolom manual transport cost sudah ada di database
    """
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = 'jalur_pendakian' 
                AND column_name IN ('manual_transport_cost', 'transport_cost_note')
            """)
            count = cursor.fetchone()[0]
            return count >= 2  # Kedua kolom harus ada
    except Exception:
        return False

def get_data_jalur_from_database():
    """
    Menghubungkan ke database PostgreSQL dan mengambil data gabungan
    dari tabel jalur_pendakian dan gunung.
    """
    conn = None
    try:
        # Konfigurasi koneksi database - gunakan DATABASE_URL atau parameter terpisah
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Gunakan DATABASE_URL jika tersedia
            conn = psycopg2.connect(database_url)
        else:
            # Gunakan parameter terpisah
            conn_params = {
                "dbname": os.getenv("DB_NAME", "postgres"),
                "user": os.getenv("DB_USER", "postgres.bvbkdtseqorgecifvfzz"),
                "password": os.getenv("DB_PASSWORD", "u92VS2WfaDtvio1i"),
                "host": os.getenv("DB_HOST", "aws-0-ap-southeast-1.pooler.supabase.com"),
                "port": os.getenv("DB_PORT", "5432")
            }
            conn = psycopg2.connect(**conn_params)
        # Cek apakah kolom manual transport cost sudah ada
        has_manual_cost_columns = check_manual_cost_columns(conn)
        
        if has_manual_cost_columns:
            print("✅ Kolom manual transport cost ditemukan, menggunakan data dari database", file=sys.stderr)
            manual_cost_select = "j.manual_transport_cost, j.transport_cost_note,"
        else:
            print("ℹ️ Kolom manual transport cost belum ada, menggunakan NULL sementara", file=sys.stderr)
            manual_cost_select = "NULL as manual_transport_cost, NULL as transport_cost_note,"
        
        # Query untuk mengambil semua data jalur dengan informasi gunung, biaya, dan koordinat
        query = """
            SELECT
                j.id_jalur,
                j.id_gunung,
                j.nama_jalur,
                g.nama_gunung,
                COALESCE(g.ketinggian_puncak_mdpl, 2000) as ketinggian_puncak_mdpl,
                COALESCE(g.variasi_jalur_skala, 5) as variasi_jalur_skala,
                COALESCE(j.kesulitan_skala, 5) as kesulitan_skala,
                COALESCE(j.keamanan_skala, 5) as keamanan_skala,
                COALESCE(j.kualitas_fasilitas_skala, 5) as kualitas_fasilitas_skala,
                COALESCE(j.kualitas_kemah_skala, 5) as kualitas_kemah_skala,
                COALESCE(j.keindahan_pemandangan_skala, 5) as keindahan_pemandangan_skala,
                COALESCE(j.estimasi_waktu_jam, 24) as estimasi_waktu_jam,
                COALESCE(j.variasi_lanskap_skala, 5) as variasi_lanskap_skala,
                COALESCE(j.perlindungan_angin_kemah_skala, 5) as perlindungan_angin_kemah_skala,
                COALESCE(j.ketersediaan_sumber_air_skala, 5) as ketersediaan_sumber_air_skala,
                COALESCE(j.jaringan_komunikasi_skala, 5) as jaringan_komunikasi_skala,
                COALESCE(j.tingkat_insiden_skala, 5) as tingkat_insiden_skala,
                j.status_jalur,
                COALESCE(j.deskripsi_jalur, '') as deskripsi_jalur,
                COALESCE(j.lokasi_pintu_masuk, '') as lokasi_pintu_masuk,
                COALESCE(g.lokasi_administratif, '') as lokasi_administratif,
                COALESCE(g.deskripsi_singkat, '') as deskripsi_singkat,
                COALESCE(g.url_thumbnail, '') as url_thumbnail,
                -- Field biaya (menggunakan kolom database setelah migrasi)
                COALESCE(j.biaya_simaksi, 0) as biaya_simaksi,
                COALESCE(j.biaya_pulang_pergi, 0) as biaya_pulang_pergi,
                COALESCE(j.estimasi_biaya_total, j.biaya_simaksi + j.biaya_pulang_pergi, 0) as estimasi_biaya,
                -- Field manual transport cost admin override
                """ + manual_cost_select + """
                -- Field koordinat basecamp (menggunakan kolom database setelah migrasi)
                j.latitude as basecamp_latitude,
                j.longitude as basecamp_longitude
            FROM jalur_pendakian j
            JOIN gunung g ON j.id_gunung = g.id_gunung
            WHERE j.id_jalur IS NOT NULL
            ORDER BY g.nama_gunung, j.nama_jalur;
        """
        df = pd.read_sql_query(query, conn)
        print(f"✅ Berhasil mengambil {len(df)} data jalur dari database", file=sys.stderr)
        return df
    except Exception as error:
        print(f"❌ Database connection error: {error}", file=sys.stderr)
        # Tidak ada fallback ke data mock, langsung raise agar pengujian gagal
        raise
    finally:
        if conn:
            conn.close()

# 2.1 Fungsi untuk menghitung jarak berdasarkan geolokasi
def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Menghitung jarak antara dua titik koordinat menggunakan rumus Haversine.
    
    Args:
        lat1, lon1: Latitude dan longitude titik pertama (user)
        lat2, lon2: Latitude dan longitude titik kedua (basecamp)
    
    Returns:
        float: Jarak dalam kilometer
    """
    # Radius bumi dalam kilometer
    R = 6371.0
    
    # Konversi dari derajat ke radian
    lat1_rad = np.radians(lat1)
    lon1_rad = np.radians(lon1)
    lat2_rad = np.radians(lat2)
    lon2_rad = np.radians(lon2)
    
    # Hitung selisih
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Hitung jarak menggunakan rumus Haversine
    a = np.sin(dlat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    
    return R * c

# calculate_transport_cost_by_distance moved to pricing_config.py
# Uses JSON configuration instead of hardcoded values

# detect_region_from_mountain_name moved to pricing_config.py
# Uses JSON configuration instead of hardcoded mapping
    
    return 'default'

def add_distance_to_user(df_jalur, user_lat, user_lng):
    """
    Menambahkan kolom jarak_ke_basecamp berdasarkan lokasi user.
    
    Args:
        df_jalur: DataFrame data jalur
        user_lat: Latitude user
        user_lng: Longitude user
    
    Returns:
        DataFrame dengan kolom jarak_ke_basecamp yang sudah dihitung
    """
    if user_lat is None or user_lng is None:
        # Jika tidak ada lokasi user, set jarak sebagai None (tidak ditampilkan)
        print("⚠️ User location not provided, distance will not be calculated", file=sys.stderr)
        df_jalur['jarak_ke_basecamp'] = None  # None berarti tidak ada data jarak
        return df_jalur
    
    # Koordinat default per gunung (koordinat akurat berdasarkan lokasi basecamp)
    default_coordinates = {
        'merapi': (-7.5407, 110.4460),
        'merbabu': (-7.4553, 110.4347),
        'sindoro': (-7.3100, 109.9925),
        'sumbing': (-7.3846, 110.0703),
        'lawu': (-7.6282, 111.1914),
        'bromo': (-7.9425, 112.9530),
        'semeru': (-8.1080, 112.9225),
        'rinjani': (-8.4110, 116.4572),
        'gede': (-6.7870, 106.9814),
        'pangrango': (-6.7470, 106.9814),
        'salak': (-6.7169, 106.7314),
        'kerinci': (-1.6968, 101.2641),
        'prau': (-7.1867, 109.9278),
        'cikuray': (-7.3186, 107.8544),
        'papandayan': (-7.3144, 107.7328),
        'guntur': (-7.1439, 107.8406),
        'tangkuban': (-6.7597, 107.6095),
        'ciremai': (-6.8906, 108.4069),
        'slamet': (-7.2422, 109.2081),
        'arjuno': (-7.7256, 112.5958),
        'argopuro': (-7.9739, 113.5619),
        'raung': (-8.1250, 114.0425),
        'carstensz': (-4.0833, 137.1833),
        'default': (-7.5000, 110.4000)  # Default untuk Indonesia tengah
    }
    
    distances = []
    for _, row in df_jalur.iterrows():
        basecamp_lat = row.get('basecamp_latitude')
        basecamp_lng = row.get('basecamp_longitude')
        
        # Jika tidak ada koordinat basecamp, gunakan koordinat default berdasarkan nama gunung
        if pd.isna(basecamp_lat) or pd.isna(basecamp_lng):
            gunung_name = str(row.get('nama_gunung', '')).lower()
            
            # Cari koordinat default berdasarkan nama gunung
            coord_found = False
            for key, (lat, lng) in default_coordinates.items():
                if key in gunung_name and key != 'default':
                    basecamp_lat, basecamp_lng = lat, lng
                    coord_found = True
                    break
            
            # Jika tidak ditemukan, gunakan koordinat default
            if not coord_found:
                basecamp_lat, basecamp_lng = default_coordinates['default']
            
            print(f"⚠️ Using default coordinates for {row.get('nama_gunung')}: {basecamp_lat}, {basecamp_lng}", file=sys.stderr)
        
        # Hitung jarak menggunakan rumus Haversine
        distance = calculate_haversine_distance(
            user_lat, user_lng,
            basecamp_lat, basecamp_lng
        )
        distances.append(distance)
        
        # Implementasi prioritas biaya transport: manual_transport_cost > auto-calculated > fallback
        manual_cost = row.get('manual_transport_cost')
        
        # Prioritas 1: Manual transport cost yang diset admin
        if manual_cost is not None and manual_cost > 0:
            final_biaya_pp = manual_cost
            cost_source = 'manual_admin'
            cost_note = row.get('transport_cost_note', 'Diset manual oleh admin')
            print(f"✅ Using manual transport cost for {row.get('nama_jalur')}: Rp {final_biaya_pp:,} - {cost_note}", file=sys.stderr)
        else:
            # Prioritas 2: Auto-calculate berdasarkan JSON config
            try:
                region = pricing_config.detect_region_from_mountain_name(row.get('nama_gunung', ''))
                final_biaya_pp = pricing_config.calculate_transport_cost_by_distance(distance, region)
                cost_source = 'auto_json_config'
            except Exception as e:
                # Prioritas 3: Fallback ke hardcoded values
                print(f"⚠️ Using fallback pricing calculation due to: {e}", file=sys.stderr)
                region = detect_region_from_mountain_name(row.get('nama_gunung', ''))
                final_biaya_pp = calculate_transport_cost_by_distance(distance, region)
                cost_source = 'fallback_hardcoded'
            
            print(f"✅ Auto-calculated PP cost for {row.get('nama_jalur')}: Rp {final_biaya_pp:,} (distance: {distance:.1f}km, region: {region}, source: {cost_source})", file=sys.stderr)
        
        # Update biaya PP jika belum ada atau 0, dan user memberikan lokasi
        if pd.isna(row.get('biaya_pulang_pergi')) or row.get('biaya_pulang_pergi', 0) == 0:
            df_jalur.loc[_, 'biaya_pulang_pergi'] = final_biaya_pp
            df_jalur.loc[_, 'transport_cost_source'] = cost_source
            df_jalur.loc[_, 'auto_calculated_pp'] = (cost_source != 'manual_admin')
        else:
            # Jika sudah ada biaya PP di database, gunakan yang ada tapi tandai sebagai existing
            df_jalur.loc[_, 'transport_cost_source'] = 'existing_database'
            df_jalur.loc[_, 'auto_calculated_pp'] = False
    
    df_jalur['jarak_ke_basecamp'] = distances
    
    # Handle biaya fields - saat ini database belum memiliki kolom biaya
    if 'biaya_simaksi' not in df_jalur.columns:
        print("ℹ️ Info: Kolom biaya_simaksi belum ada di database - menggunakan nilai 0", file=sys.stderr)
        df_jalur['biaya_simaksi'] = 0
    else:
        df_jalur['biaya_simaksi'] = df_jalur['biaya_simaksi'].fillna(0)
        
    if (df_jalur['biaya_simaksi'] == 0).all():
        print("⚠️ Info: Semua biaya_simaksi = 0. Silakan tambahkan data biaya simaksi ke database", file=sys.stderr)
    
    # Recalculate estimasi_biaya - saat ini hanya berdasarkan biaya PP karena simaksi belum diinput
    df_jalur['estimasi_biaya'] = df_jalur['biaya_simaksi'] + df_jalur['biaya_pulang_pergi']
    
    print(f"✅ Calculated distance to {len(distances)} basecamps from user location", file=sys.stderr)
    return df_jalur

# 2.2 Fungsi fallback untuk data mock (jika database tidak tersedia)
def get_mock_data_jalur():
    """
    Fungsi fallback dummy dinonaktifkan agar tidak pernah dipakai.
    """
    raise RuntimeError("Fungsi get_mock_data_jalur() tidak boleh dipanggil pada mode produksi/pengujian!")

# 3. Fuzzy Engine
def cek_kolom(df, kolom):
    if kolom not in df.columns:
        print(f"❌ Kolom '{kolom}' tidak ditemukan di DataFrame!", file=sys.stderr)
        return False
    return True

def apply_result_filters(df_jalur, preferensi_pengguna):
    """
    Apply sorting filters to recommendation results based on user preferences.
    
    Available filters:
    - sort_by_distance: 'terdekat' | 'terjauh'
    - sort_by_score: 'tertinggi' | 'terendah'
    - sort_by_cost: 'termurah' | 'termahal'
    """
    if not preferensi_pengguna:
        return df_jalur
    
    # Extract filter preferences
    sort_by_distance = preferensi_pengguna.get('sort_by_distance', None)
    sort_by_score = preferensi_pengguna.get('sort_by_score', None)
    sort_by_cost = preferensi_pengguna.get('sort_by_cost', None)
    
    # Apply distance sorting
    if sort_by_distance and 'jarak_ke_basecamp' in df_jalur.columns:
        if sort_by_distance == 'terdekat':
            df_jalur = df_jalur.sort_values('jarak_ke_basecamp', ascending=True)
            print("🔄 Applied filter: Sorted by distance (terdekat)", file=sys.stderr)
        elif sort_by_distance == 'terjauh':
            df_jalur = df_jalur.sort_values('jarak_ke_basecamp', ascending=False)
            print("🔄 Applied filter: Sorted by distance (terjauh)", file=sys.stderr)
    
    # Apply score sorting
    if sort_by_score and 'skor_total' in df_jalur.columns:
        if sort_by_score == 'tertinggi':
            df_jalur = df_jalur.sort_values('skor_total', ascending=False)
            print("🔄 Applied filter: Sorted by score (tertinggi)", file=sys.stderr)
        elif sort_by_score == 'terendah':
            df_jalur = df_jalur.sort_values('skor_total', ascending=True)
            print("🔄 Applied filter: Sorted by score (terendah)", file=sys.stderr)
    
    # Apply cost sorting
    if sort_by_cost and 'estimasi_biaya' in df_jalur.columns:
        if sort_by_cost == 'termurah':
            df_jalur = df_jalur.sort_values('estimasi_biaya', ascending=True)
            print("🔄 Applied filter: Sorted by cost (termurah)", file=sys.stderr)
        elif sort_by_cost == 'termahal':
            df_jalur = df_jalur.sort_values('estimasi_biaya', ascending=False)
            print("🔄 Applied filter: Sorted by cost (termahal)", file=sys.stderr)
    
    return df_jalur

def proses_rekomendasi(df_jalur=None, preferensi_pengguna=None):
    """Fungsi utama yang melakukan seluruh proses: fetch data, filter dan kalkulasi skor."""
    
    # Jika df_jalur tidak diberikan, ambil dari database
    if df_jalur is None:
        df_jalur = get_data_jalur_from_database()

    # --- Tambahan: Hitung jarak berdasarkan lokasi user ---
    if preferensi_pengguna and 'user_lat' in preferensi_pengguna and 'user_lng' in preferensi_pengguna:
        user_lat = preferensi_pengguna['user_lat']
        user_lng = preferensi_pengguna['user_lng']
        df_jalur = add_distance_to_user(df_jalur, user_lat, user_lng)
    else:
        # Jika tidak ada lokasi user, set jarak sebagai None (tidak ditampilkan)
        if 'jarak_ke_basecamp' not in df_jalur.columns:
            print("⚠️ No user location provided, distance will not be displayed", file=sys.stderr)
            df_jalur['jarak_ke_basecamp'] = None

    # --- Pastikan kolom estimasi_biaya ada (jika belum ada di database) ---
    if 'estimasi_biaya' not in df_jalur.columns:
        print("⚠️ No cost data in database, using default costs", file=sys.stderr)
        np.random.seed(42)
        df_jalur['estimasi_biaya'] = np.random.randint(100000, 500000, size=len(df_jalur))

    if df_jalur.empty:
        print("❌ Tidak ada data jalur yang tersedia", file=sys.stderr)
        return pd.DataFrame(), pd.DataFrame()
    # Definisi Universe Variabel (Rentang Nilai)
    ketinggian_univ = np.arange(0, 5501, 1)
    skala_univ = np.arange(0, 11, 1)
    waktu_univ = np.arange(0, 101, 1)
    skor_univ = np.arange(0, 101, 1)

    # Definisi Variabel Input (Antecedents) sesuai dokumentasi
    antecedents = {
        'ketinggian_puncak_mdpl': ctrl.Antecedent(ketinggian_univ, 'ketinggian_puncak_mdpl'),
        'kesulitan_skala': ctrl.Antecedent(skala_univ, 'kesulitan_skala'),
        'keamanan_skala': ctrl.Antecedent(skala_univ, 'keamanan_skala'),
        'kualitas_fasilitas_skala': ctrl.Antecedent(skala_univ, 'kualitas_fasilitas_skala'),
        'kualitas_kemah_skala': ctrl.Antecedent(skala_univ, 'kualitas_kemah_skala'),
        'keindahan_pemandangan_skala': ctrl.Antecedent(skala_univ, 'keindahan_pemandangan_skala'),
        'estimasi_waktu_jam': ctrl.Antecedent(waktu_univ, 'estimasi_waktu_jam'),
        'variasi_lanskap_skala': ctrl.Antecedent(skala_univ, 'variasi_lanskap_skala'),
        'perlindungan_angin_kemah_skala': ctrl.Antecedent(skala_univ, 'perlindungan_angin_kemah_skala'),
        # Variabel baru dari dokumentasi
        'ketersediaan_sumber_air_skala': ctrl.Antecedent(skala_univ, 'ketersediaan_sumber_air_skala'),
        'jaringan_komunikasi_skala': ctrl.Antecedent(skala_univ, 'jaringan_komunikasi_skala'),
        'tingkat_insiden_skala': ctrl.Antecedent(skala_univ, 'tingkat_insiden_skala'),
        'variasi_jalur_skala': ctrl.Antecedent(skala_univ, 'variasi_jalur_skala')
    }

    # Definisi Variabel Output (Consequent)
    skor_rekomendasi = ctrl.Consequent(skor_univ, 'skor_rekomendasi')

    # PEMBUATAN FUNGSI KEANGGOTAAN (MEMBERSHIP FUNCTIONS)
    # Disesuaikan sepenuhnya dengan dokumen "detail standard fuzzy engine".
    # Format trapmf: [awal_kiri, puncak_kiri, puncak_kanan, akhir_kanan]

    # Ketinggian Puncak
    antecedents['ketinggian_puncak_mdpl']['rendah'] = fuzz.trapmf(ketinggian_univ, [0, 0, 1000, 1500])
    antecedents['ketinggian_puncak_mdpl']['sedang'] = fuzz.trapmf(ketinggian_univ, [1500, 2000, 3000, 3500])
    antecedents['ketinggian_puncak_mdpl']['tinggi'] = fuzz.trapmf(ketinggian_univ, [3500, 4000, 5500, 5500])

    # Estimasi Waktu, ditambahkan 'ekspedisi'
    antecedents['estimasi_waktu_jam']['pendek'] = fuzz.trapmf(waktu_univ, [0, 0, 10, 14])
    antecedents['estimasi_waktu_jam']['sedang'] = fuzz.trapmf(waktu_univ, [12, 18, 30, 36])
    antecedents['estimasi_waktu_jam']['panjang'] = fuzz.trapmf(waktu_univ, [34, 40, 80, 100])
    antecedents['estimasi_waktu_jam']['ekspedisi'] = fuzz.trapmf(waktu_univ, [90, 100, 101, 101])

    # Tingkat Kesulitan
    antecedents['kesulitan_skala']['mudah'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['kesulitan_skala']['sedang'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['kesulitan_skala']['sulit'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Keamanan Jalur
    antecedents['keamanan_skala']['berbahaya'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['keamanan_skala']['cukup_aman'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['keamanan_skala']['aman'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Kualitas Fasilitas
    antecedents['kualitas_fasilitas_skala']['minim'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['kualitas_fasilitas_skala']['cukup'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['kualitas_fasilitas_skala']['lengkap'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Kualitas Area Kemah
    antecedents['kualitas_kemah_skala']['buruk'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['kualitas_kemah_skala']['cukup'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['kualitas_kemah_skala']['baik'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Keindahan Pemandangan
    antecedents['keindahan_pemandangan_skala']['biasa'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['keindahan_pemandangan_skala']['indah'] = fuzz.trapmf(skala_univ, [3, 5, 6, 7])
    antecedents['keindahan_pemandangan_skala']['istimewa'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Variasi Lanskap
    antecedents['variasi_lanskap_skala']['monoton'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['variasi_lanskap_skala']['cukup_bervariasi'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['variasi_lanskap_skala']['sangat_bervariasi'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Perlindungan Angin
    antecedents['perlindungan_angin_kemah_skala']['sangat_terekspos'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4])
    antecedents['perlindungan_angin_kemah_skala']['cukup_terlindungi'] = fuzz.trapmf(skala_univ, [3, 4, 5, 7])
    antecedents['perlindungan_angin_kemah_skala']['terlindungi'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Ketersediaan Sumber Air
    antecedents['ketersediaan_sumber_air_skala']['langka'] = fuzz.trapmf(skala_univ, [0, 0, 1, 3])
    antecedents['ketersediaan_sumber_air_skala']['terbatas'] = fuzz.trapmf(skala_univ, [2, 4, 5, 7])
    antecedents['ketersediaan_sumber_air_skala']['melimpah'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Jaringan Komunikasi
    antecedents['jaringan_komunikasi_skala']['tidak_ada'] = fuzz.trapmf(skala_univ, [0, 0, 1, 2])
    antecedents['jaringan_komunikasi_skala']['terbatas'] = fuzz.trapmf(skala_univ, [2, 4, 5, 7])
    antecedents['jaringan_komunikasi_skala']['baik'] = fuzz.trapmf(skala_univ, [6, 8, 10, 10])

    # Tingkat Insiden (Skor tinggi berarti lebih aman/jarang insiden)
    antecedents['tingkat_insiden_skala']['tinggi'] = fuzz.trapmf(skala_univ, [0, 0, 2, 4]) # Artinya insiden sering terjadi (berisiko)
    antecedents['tingkat_insiden_skala']['sedang'] = fuzz.trapmf(skala_univ, [3, 5, 6, 8])
    antecedents['tingkat_insiden_skala']['rendah'] = fuzz.trapmf(skala_univ, [8, 9, 10, 10]) # Artinya insiden jarang terjadi (aman)

    # Variasi Jalur
    antecedents['variasi_jalur_skala']['tunggal'] = fuzz.trapmf(skala_univ, [0, 0, 2, 3])
    antecedents['variasi_jalur_skala']['beberapa'] = fuzz.trapmf(skala_univ, [4, 5, 6, 7])
    antecedents['variasi_jalur_skala']['banyak'] = fuzz.trapmf(skala_univ, [8, 9, 10, 10])

    # Variabel Output: Skor Rekomendasi
    skor_rekomendasi.automf(names=['sangat_rendah', 'rendah', 'sedang', 'tinggi', 'sangat_tinggi'])

    # DEFINISI ATURAN FUZZY (RULES)
    # Aturan dirancang berdasarkan prioritas dan kriteria dengan fokus pada keamanan, kenyamanan, dan pengalaman.
    rules = [
        # === ATURAN PRIORITAS SANGAT TINGGI (SANGAT POSITIF) ===
        # Kombinasi ideal: Pemandangan istimewa + Keamanan tinggi + Insiden rendah
        ctrl.Rule(antecedents['keindahan_pemandangan_skala']['istimewa'] &
                  antecedents['keamanan_skala']['aman'] &
                  antecedents['tingkat_insiden_skala']['rendah'],
                  skor_rekomendasi['sangat_tinggi']),
        
        # Kombinasi ideal: Lanskap bervariasi + Fasilitas lengkap + Air melimpah
        ctrl.Rule(antecedents['variasi_lanskap_skala']['sangat_bervariasi'] &
                  antecedents['kualitas_fasilitas_skala']['lengkap'] &
                  antecedents['ketersediaan_sumber_air_skala']['melimpah'] &
                  antecedents['tingkat_insiden_skala']['rendah'],
                  skor_rekomendasi['sangat_tinggi']),

        # === ATURAN PRIORITAS TINGGI ===
        # Fokus pada keamanan dan kenyamanan logistik
        ctrl.Rule(antecedents['keamanan_skala']['aman'] &
                  antecedents['tingkat_insiden_skala']['rendah'] &
                  (antecedents['kesulitan_skala']['mudah'] | antecedents['kesulitan_skala']['sedang']),
                  skor_rekomendasi['tinggi']),
        
        # Kualitas kemah dan perlindungan yang baik
        ctrl.Rule(antecedents['kualitas_kemah_skala']['baik'] &
                  antecedents['perlindungan_angin_kemah_skala']['terlindungi'] &
                  antecedents['ketersediaan_sumber_air_skala']['melimpah'],
                  skor_rekomendasi['tinggi']),
        
        # Pengalaman visual yang istimewa dengan keamanan memadai
        ctrl.Rule(antecedents['keindahan_pemandangan_skala']['istimewa'] &
                  antecedents['variasi_lanskap_skala']['sangat_bervariasi'] &
                  antecedents['keamanan_skala']['aman'],
                  skor_rekomendasi['tinggi']),
        
        # Fasilitas lengkap dan komunikasi baik (penting untuk keamanan)
        ctrl.Rule(antecedents['kualitas_fasilitas_skala']['lengkap'] &
                  antecedents['jaringan_komunikasi_skala']['baik'] &
                  antecedents['tingkat_insiden_skala']['rendah'],
                  skor_rekomendasi['tinggi']),

        # === ATURAN PRIORITAS SEDANG ===
        # Kondisi cukup baik dengan beberapa tantangan
        ctrl.Rule(antecedents['kesulitan_skala']['sedang'] &
                  antecedents['keamanan_skala']['cukup_aman'] &
                  antecedents['tingkat_insiden_skala']['sedang'],
                  skor_rekomendasi['sedang']),
        
        # Waktu menantang tapi fasilitas mendukung
        ctrl.Rule((antecedents['estimasi_waktu_jam']['panjang'] | antecedents['ketinggian_puncak_mdpl']['tinggi']) &
                  antecedents['kualitas_fasilitas_skala']['lengkap'] &
                  antecedents['keamanan_skala']['aman'],
                  skor_rekomendasi['sedang']),
        
        # Banyak pilihan jalur dengan kualitas cukup
        ctrl.Rule(antecedents['variasi_jalur_skala']['banyak'] &
                  antecedents['keamanan_skala']['cukup_aman'],
                  skor_rekomendasi['sedang']),
        
        # Pemandangan indah meski fasilitas terbatas
        ctrl.Rule(antecedents['keindahan_pemandangan_skala']['indah'] &
                  antecedents['variasi_lanskap_skala']['cukup_bervariasi'] &
                  antecedents['keamanan_skala']['cukup_aman'],
                  skor_rekomendasi['sedang']),

        # === ATURAN PRIORITAS RENDAH (PENALTI) ===
        # Masalah logistik dan kenyamanan
        ctrl.Rule(antecedents['kualitas_fasilitas_skala']['minim'] &
                  antecedents['kualitas_kemah_skala']['buruk'],
                  skor_rekomendasi['rendah']),
        
        # Masalah perlindungan dan sumber daya
        ctrl.Rule(antecedents['perlindungan_angin_kemah_skala']['sangat_terekspos'] &
                  antecedents['ketersediaan_sumber_air_skala']['terbatas'],
                  skor_rekomendasi['rendah']),
        
        # Komunikasi buruk dan insiden sedang
        ctrl.Rule(antecedents['jaringan_komunikasi_skala']['tidak_ada'] &
                  antecedents['tingkat_insiden_skala']['sedang'],
                  skor_rekomendasi['rendah']),
        
        # Kesulitan tinggi tanpa dukungan fasilitas
        ctrl.Rule(antecedents['kesulitan_skala']['sulit'] &
                  antecedents['kualitas_fasilitas_skala']['minim'] &
                  antecedents['keamanan_skala']['cukup_aman'],
                  skor_rekomendasi['rendah']),

        # === ATURAN PRIORITAS SANGAT RENDAH (SANGAT NEGATIF) ===
        # Masalah keamanan kritis
        ctrl.Rule(antecedents['keamanan_skala']['berbahaya'] |
                  antecedents['tingkat_insiden_skala']['tinggi'],
                  skor_rekomendasi['sangat_rendah']),
        
        # Kombinasi berbahaya: Kesulitan tinggi + Insiden tinggi
        ctrl.Rule(antecedents['kesulitan_skala']['sulit'] &
                  antecedents['tingkat_insiden_skala']['tinggi'],
                  skor_rekomendasi['sangat_rendah']),
        
        # Krisis logistik: Air langka + Fasilitas minim + Komunikasi tidak ada
        ctrl.Rule(antecedents['ketersediaan_sumber_air_skala']['langka'] &
                  antecedents['kualitas_fasilitas_skala']['minim'] &
                  antecedents['jaringan_komunikasi_skala']['tidak_ada'],
                  skor_rekomendasi['sangat_rendah']),
        
        # Kondisi ekstrem: Ekspedisi + Berbahaya + Air langka
        ctrl.Rule(antecedents['estimasi_waktu_jam']['ekspedisi'] &
                  antecedents['keamanan_skala']['berbahaya'] &
                  antecedents['ketersediaan_sumber_air_skala']['langka'],
                  skor_rekomendasi['sangat_rendah'])
    ]

    # === RULE FALLBACK ===
    # Jika tidak ada rule lain yang match, set skor ke 'sedang' (catch-all)
    # Fallback: gunakan OR semua antecedent utama pada kondisi "normal" (misal: sedang)
    fallback_condition = (
        (antecedents['keamanan_skala']['cukup_aman'] |
         antecedents['kesulitan_skala']['sedang'] |
         antecedents['ketersediaan_sumber_air_skala']['terbatas'] |
         antecedents['kualitas_fasilitas_skala']['cukup'] |
         antecedents['kualitas_kemah_skala']['cukup'] |
         antecedents['keindahan_pemandangan_skala']['indah'] |
         antecedents['variasi_lanskap_skala']['cukup_bervariasi'] |
         antecedents['perlindungan_angin_kemah_skala']['cukup_terlindungi'] |
         antecedents['jaringan_komunikasi_skala']['terbatas'] |
         antecedents['tingkat_insiden_skala']['sedang'] |
         antecedents['variasi_jalur_skala']['beberapa'] |
         antecedents['estimasi_waktu_jam']['sedang'] |
         antecedents['ketinggian_puncak_mdpl']['sedang'])
    )
    rules.append(ctrl.Rule(fallback_condition, skor_rekomendasi['sedang']))

    # Sistem Kontrol dan Simulasi
    sistem_kontrol = ctrl.ControlSystem(rules)
    simulasi = ctrl.ControlSystemSimulation(sistem_kontrol)

    # Filter data berdasarkan preferensi pengguna jika ada
    if preferensi_pengguna:
        df_filtered = df_jalur.copy()
        filter_applied = []
        try:
            # Filter kesulitan maksimal
            if preferensi_pengguna.get('max_kesulitan_skala') is not None:
                if cek_kolom(df_filtered, 'kesulitan_skala'):
                    df_filtered = df_filtered[df_filtered['kesulitan_skala'] <= preferensi_pengguna['max_kesulitan_skala']]
                    filter_applied.append(f"Kesulitan ≤ {preferensi_pengguna['max_kesulitan_skala']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'kesulitan_skala' tidak ditemukan saat filter max_kesulitan_skala", file=sys.stderr)
            # Filter keamanan minimal
            if preferensi_pengguna.get('min_keamanan_skala') is not None:
                if cek_kolom(df_filtered, 'keamanan_skala'):
                    df_filtered = df_filtered[df_filtered['keamanan_skala'] >= preferensi_pengguna['min_keamanan_skala']]
                    filter_applied.append(f"Keamanan ≥ {preferensi_pengguna['min_keamanan_skala']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'keamanan_skala' tidak ditemukan saat filter min_keamanan_skala", file=sys.stderr)
            # Filter waktu maksimal (dalam jam)
            if preferensi_pengguna.get('max_estimasi_waktu_jam') is not None:
                if cek_kolom(df_filtered, 'estimasi_waktu_jam'):
                    df_filtered = df_filtered[df_filtered['estimasi_waktu_jam'] <= preferensi_pengguna['max_estimasi_waktu_jam']]
                    filter_applied.append(f"Waktu ≤ {preferensi_pengguna['max_estimasi_waktu_jam']} jam")
                else:
                    print(f"[FILTER ERROR] Kolom 'estimasi_waktu_jam' tidak ditemukan saat filter max_estimasi_waktu_jam", file=sys.stderr)
            # Filter ketinggian maksimal
            if preferensi_pengguna.get('max_ketinggian_mdpl') is not None:
                if cek_kolom(df_filtered, 'ketinggian_puncak_mdpl'):
                    df_filtered = df_filtered[df_filtered['ketinggian_puncak_mdpl'] <= preferensi_pengguna['max_ketinggian_mdpl']]
                    filter_applied.append(f"Ketinggian ≤ {preferensi_pengguna['max_ketinggian_mdpl']} mdpl")
                else:
                    print(f"[FILTER ERROR] Kolom 'ketinggian_puncak_mdpl' tidak ditemukan saat filter max_ketinggian_mdpl", file=sys.stderr)
            # Filter ketersediaan air minimal
            if preferensi_pengguna.get('min_ketersediaan_air') is not None:
                if cek_kolom(df_filtered, 'ketersediaan_sumber_air_skala'):
                    df_filtered = df_filtered[df_filtered['ketersediaan_sumber_air_skala'] >= preferensi_pengguna['min_ketersediaan_air']]
                    filter_applied.append(f"Air ≥ {preferensi_pengguna['min_ketersediaan_air']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'ketersediaan_sumber_air_skala' tidak ditemukan saat filter min_ketersediaan_air", file=sys.stderr)
            # Filter pemandangan minimal (pastikan key konsisten)
            if preferensi_pengguna.get('min_keindahan_pemandangan_skala') is not None:
                if cek_kolom(df_filtered, 'keindahan_pemandangan_skala'):
                    df_filtered = df_filtered[df_filtered['keindahan_pemandangan_skala'] >= preferensi_pengguna['min_keindahan_pemandangan_skala']]
                    filter_applied.append(f"Pemandangan ≥ {preferensi_pengguna['min_keindahan_pemandangan_skala']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'keindahan_pemandangan_skala' tidak ditemukan saat filter min_keindahan_pemandangan_skala", file=sys.stderr)
            # Backward compatibility: jika frontend kirim 'min_keindahan_pemandangan'
            elif preferensi_pengguna.get('min_keindahan_pemandangan') is not None:
                if cek_kolom(df_filtered, 'keindahan_pemandangan_skala'):
                    df_filtered = df_filtered[df_filtered['keindahan_pemandangan_skala'] >= preferensi_pengguna['min_keindahan_pemandangan']]
                    filter_applied.append(f"Pemandangan ≥ {preferensi_pengguna['min_keindahan_pemandangan']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'keindahan_pemandangan_skala' tidak ditemukan saat filter min_keindahan_pemandangan", file=sys.stderr)
            # Filter jaringan komunikasi minimal
            if preferensi_pengguna.get('min_jaringan_komunikasi') is not None:
                if cek_kolom(df_filtered, 'jaringan_komunikasi_skala'):
                    df_filtered = df_filtered[df_filtered['jaringan_komunikasi_skala'] >= preferensi_pengguna['min_jaringan_komunikasi']]
                    filter_applied.append(f"Jaringan Komunikasi ≥ {preferensi_pengguna['min_jaringan_komunikasi']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'jaringan_komunikasi_skala' tidak ditemukan saat filter min_jaringan_komunikasi", file=sys.stderr)
            # Filter kualitas fasilitas minimal
            if preferensi_pengguna.get('min_kualitas_fasilitas_skala') is not None:
                if cek_kolom(df_filtered, 'kualitas_fasilitas_skala'):
                    df_filtered = df_filtered[df_filtered['kualitas_fasilitas_skala'] >= preferensi_pengguna['min_kualitas_fasilitas_skala']]
                    filter_applied.append(f"Fasilitas ≥ {preferensi_pengguna['min_kualitas_fasilitas_skala']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'kualitas_fasilitas_skala' tidak ditemukan saat filter min_kualitas_fasilitas_skala", file=sys.stderr)
            # Filter kualitas kemah minimal
            if preferensi_pengguna.get('min_kualitas_kemah_skala') is not None:
                if cek_kolom(df_filtered, 'kualitas_kemah_skala'):
                    df_filtered = df_filtered[df_filtered['kualitas_kemah_skala'] >= preferensi_pengguna['min_kualitas_kemah_skala']]
                    filter_applied.append(f"Kemah ≥ {preferensi_pengguna['min_kualitas_kemah_skala']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'kualitas_kemah_skala' tidak ditemukan saat filter min_kualitas_kemah_skala", file=sys.stderr)
            # Filter perlindungan angin minimal
            if preferensi_pengguna.get('min_perlindungan_angin') is not None:
                if cek_kolom(df_filtered, 'perlindungan_angin_kemah_skala'):
                    df_filtered = df_filtered[df_filtered['perlindungan_angin_kemah_skala'] >= preferensi_pengguna['min_perlindungan_angin']]
                    filter_applied.append(f"Perlindungan Angin ≥ {preferensi_pengguna['min_perlindungan_angin']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'perlindungan_angin_kemah_skala' tidak ditemukan saat filter min_perlindungan_angin", file=sys.stderr)
            # Filter tingkat keamanan insiden minimal
            if preferensi_pengguna.get('min_tingkat_keamanan_insiden') is not None:
                if cek_kolom(df_filtered, 'tingkat_insiden_skala'):
                    df_filtered = df_filtered[df_filtered['tingkat_insiden_skala'] >= preferensi_pengguna['min_tingkat_keamanan_insiden']]
                    filter_applied.append(f"Tingkat Keamanan Insiden ≥ {preferensi_pengguna['min_tingkat_keamanan_insiden']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'tingkat_insiden_skala' tidak ditemukan saat filter min_tingkat_keamanan_insiden", file=sys.stderr)
            # Filter variasi lanskap minimal
            if preferensi_pengguna.get('min_variasi_lanskap') is not None:
                if cek_kolom(df_filtered, 'variasi_lanskap_skala'):
                    df_filtered = df_filtered[df_filtered['variasi_lanskap_skala'] >= preferensi_pengguna['min_variasi_lanskap']]
                    filter_applied.append(f"Variasi Lanskap ≥ {preferensi_pengguna['min_variasi_lanskap']}")
                else:
                    print(f"[FILTER ERROR] Kolom 'variasi_lanskap_skala' tidak ditemukan saat filter min_variasi_lanskap", file=sys.stderr)
        except Exception as filter_error:
            print(f"[FILTER EXCEPTION] Terjadi error saat proses filter preferensi: {filter_error}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
        print(f"✅ Filter diterapkan: {', '.join(filter_applied) if filter_applied else 'Tidak ada'}", file=sys.stderr)
        print(f"✅ Jalur tersisa setelah filter: {len(df_filtered)} dari {len(df_jalur)}", file=sys.stderr)
        df_jalur = df_filtered
    if df_jalur.empty:
        # Fallback: rekomendasi tidak boleh kosong, ambil 3 jalur terbaik dari seluruh data (tanpa filter)
        print("[FALLBACK] Tidak ada data jalur sesuai filter, mengambil rekomendasi terdekat.", file=sys.stderr)
        # Ambil ulang semua data dari database (tanpa filter)
        df_all = get_data_jalur_from_database()
        
        # Hitung jarak untuk fallback juga
        if preferensi_pengguna and 'user_lat' in preferensi_pengguna and 'user_lng' in preferensi_pengguna:
            user_lat = preferensi_pengguna['user_lat']
            user_lng = preferensi_pengguna['user_lng']
            df_all = add_distance_to_user(df_all, user_lat, user_lng)
        else:
            # Jika tidak ada lokasi user, set jarak sebagai None
            if 'jarak_ke_basecamp' not in df_all.columns:
                df_all['jarak_ke_basecamp'] = None
        
        # Pastikan kolom estimasi_biaya ada
        if 'estimasi_biaya' not in df_all.columns:
            np.random.seed(42)
            df_all['estimasi_biaya'] = np.random.randint(100000, 500000, size=len(df_all))
        # Proses rekomendasi tanpa filter
        _, df_jalur_ranked = proses_rekomendasi(df_all, None)
        # Ambil 3 teratas
        df_jalur_fallback = df_jalur_ranked.head(3).copy()
        # Buat DataFrame gunung fallback
        df_gunung_fallback = df_jalur_fallback.groupby(['id_gunung', 'nama_gunung']).agg(
            skor_tertinggi=('skor_rekomendasi', 'max'),
            skor_rata_rata=('skor_rekomendasi', 'mean'),
            jumlah_jalur=('id_jalur', 'count'),
            jalur_terbaik=('nama_jalur', lambda x: df_jalur_fallback.loc[df_jalur_fallback.loc[x.index, 'skor_rekomendasi'].idxmax(), 'nama_jalur']),
            kesulitan_terendah=('kesulitan_skala', 'min'),
            kesulitan_tertinggi=('kesulitan_skala', 'max'),
            keamanan_rata_rata=('keamanan_skala', 'mean'),
            ketinggian=('ketinggian_puncak_mdpl', 'first'),
            # Tambahan biaya dari jalur terbaik
            estimasi_biaya_total=('estimasi_biaya', lambda x: df_jalur_fallback.loc[df_jalur_fallback.loc[x.index, 'skor_rekomendasi'].idxmax(), 'estimasi_biaya']),
            biaya_simaksi=('biaya_simaksi', lambda x: df_jalur_fallback.loc[df_jalur_fallback.loc[x.index, 'skor_rekomendasi'].idxmax(), 'biaya_simaksi']),
            biaya_pulang_pergi=('biaya_pulang_pergi', lambda x: df_jalur_fallback.loc[df_jalur_fallback.loc[x.index, 'skor_rekomendasi'].idxmax(), 'biaya_pulang_pergi']),
            lokasi_administratif=('lokasi_administratif', 'first'),
            deskripsi_singkat=('deskripsi_singkat', 'first'),
            url_thumbnail=('url_thumbnail', 'first')
        ).reset_index()
        # Tambahkan kategori rekomendasi
        def kategorikan_rekomendasi(skor):
            if skor >= 80:
                return "Sangat Direkomendasikan"
            elif skor >= 65:
                return "Direkomendasikan"
            elif skor >= 50:
                return "Cukup Direkomendasikan"
            elif skor >= 35:
                return "Kurang Direkomendasikan"
            else:
                return "Tidak Direkomendasikan"
        df_gunung_fallback['kategori_rekomendasi'] = df_gunung_fallback['skor_tertinggi'].apply(kategorikan_rekomendasi)
        df_jalur_fallback['kategori_rekomendasi'] = df_jalur_fallback['skor_rekomendasi'].apply(kategorikan_rekomendasi)
        return df_gunung_fallback, df_jalur_fallback

    # Hitung skor untuk setiap jalur yang tersisa dengan sistem bobot
    skor_list = []
    kriteria_weights = {
        # Bobot berdasarkan prioritas dari dokumentasi standar
        'keamanan_skala': 0.14,  # dikurangi sedikit untuk beri ruang biaya/jarak
        'tingkat_insiden_skala': 0.11,
        'kesulitan_skala': 0.09,
        'ketersediaan_sumber_air_skala': 0.09,
        'kualitas_fasilitas_skala': 0.07,
        'keindahan_pemandangan_skala': 0.07,
        'kualitas_kemah_skala': 0.06,
        'variasi_lanskap_skala': 0.06,
        'estimasi_waktu_jam': 0.05,
        'ketinggian_puncak_mdpl': 0.04,
        'perlindungan_angin_kemah_skala': 0.04,
        'jaringan_komunikasi_skala': 0.03,
        'variasi_jalur_skala': 0.02,
        # Tambahan variabel baru:
        'estimasi_biaya': 0.07,  # Biaya simaksi+PP (semakin murah semakin baik)
        'jarak_ke_basecamp': 0.06  # Jarak ke basecamp (semakin dekat semakin baik)
    }
    
    for idx, row in df_jalur.iterrows():
        try:
            # Debug: print input ke fuzzy engine
            print(f"[DEBUG] Input fuzzy baris {idx}: {{}}".format({k: row[k] for k in antecedents}), file=sys.stderr)
            # Debug: print degree of membership untuk setiap input
            for key, ant in antecedents.items():
                memberships = {label: fuzz.interp_membership(ant.universe, ant[label].mf, row[key]) for label in ant.terms}
                print(f"[DEBUG] Membership {key}: {memberships}", file=sys.stderr)
            # Cek NaN pada input
            for key in antecedents:
                if pd.isna(row[key]):
                    print(f"[ERROR] Nilai {key} pada baris {idx} adalah NaN!", file=sys.stderr)
                simulasi.input[key] = row[key]
            # Menjalankan komputasi fuzzy
            simulasi.compute()
            # Tangani KeyError pada output
            if 'skor_rekomendasi' in simulasi.output:
                skor_fuzzy = simulasi.output['skor_rekomendasi']
            else:
                print(f"[ERROR] Fuzzy output tidak menghasilkan skor_rekomendasi pada baris {idx}! Output: {simulasi.output}", file=sys.stderr)
                skor_fuzzy = 0
            # Hitung weighted score berdasarkan kriteria individual
            weighted_score = 0
            total_weight = 0
            for kriteria, weight in kriteria_weights.items():
                if kriteria in row and pd.notna(row[kriteria]):
                    # Normalisasi variabel biaya dan jarak: semakin kecil semakin baik
                    if kriteria == 'estimasi_waktu_jam':
                        normalized_value = max(0, 100 - (row[kriteria] / 100 * 100))
                    elif kriteria == 'ketinggian_puncak_mdpl':
                        normalized_value = min(100, (row[kriteria] / 5500) * 100)
                    elif kriteria == 'estimasi_biaya':
                        # Asumsi biaya 100rb-1jt, normalisasi: 100rb=100, 1jt=0
                        normalized_value = max(0, min(100, 100 - ((row[kriteria] - 100000) / 900000 * 100)))
                    elif kriteria == 'jarak_ke_basecamp':
                        # Asumsi jarak 0-500km, 0km=100, 500km=0
                        normalized_value = max(0, min(100, 100 - (row[kriteria] / 500 * 100)))
                    else:
                        normalized_value = (row[kriteria] / 10) * 100
                    weighted_score += normalized_value * weight
                    total_weight += weight
            if total_weight > 0:
                final_score = (skor_fuzzy * 0.7) + (weighted_score * 0.3)
            else:
                final_score = skor_fuzzy
            skor_list.append(final_score)
        except Exception as e:
            print(f"❌ Error saat menghitung skor pada baris index {idx}: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            skor_list.append(0)
    df_jalur['skor_rekomendasi'] = skor_list

    # Agregasi hasil per gunung dan pengurutan dengan metadata tambahan
    df_gunung = df_jalur.groupby(['id_gunung', 'nama_gunung']).agg(
        skor_tertinggi=('skor_rekomendasi', 'max'),
        skor_rata_rata=('skor_rekomendasi', 'mean'),
        jumlah_jalur=('id_jalur', 'count'),
        jalur_terbaik=('nama_jalur', lambda x: df_jalur.loc[df_jalur.loc[x.index, 'skor_rekomendasi'].idxmax(), 'nama_jalur']),
        kesulitan_terendah=('kesulitan_skala', 'min'),
        kesulitan_tertinggi=('kesulitan_skala', 'max'),
        keamanan_rata_rata=('keamanan_skala', 'mean'),
        ketinggian=('ketinggian_puncak_mdpl', 'first'),
        # Tambahan jarak minimum per gunung
        jarak_ke_basecamp=('jarak_ke_basecamp', 'min'),
        # Tambahan estimasi biaya total dan biaya individual (ambil dari jalur terbaik)
        estimasi_biaya_total=('estimasi_biaya', lambda x: df_jalur.loc[df_jalur.loc[x.index, 'skor_rekomendasi'].idxmax(), 'estimasi_biaya']),
        biaya_simaksi=('biaya_simaksi', lambda x: df_jalur.loc[df_jalur.loc[x.index, 'skor_rekomendasi'].idxmax(), 'biaya_simaksi']),
        biaya_pulang_pergi=('biaya_pulang_pergi', lambda x: df_jalur.loc[df_jalur.loc[x.index, 'skor_rekomendasi'].idxmax(), 'biaya_pulang_pergi']),
        # Tambahan metadata untuk analisis
        lokasi_administratif=('lokasi_administratif', 'first'),
        deskripsi_singkat=('deskripsi_singkat', 'first'),
        url_thumbnail=('url_thumbnail', 'first')
    ).reset_index()
    
    # Tambahkan kategori rekomendasi berdasarkan skor
    def kategorikan_rekomendasi(skor):
        if skor >= 80:
            return "Sangat Direkomendasikan"
        elif skor >= 65:
            return "Direkomendasikan"
        elif skor >= 50:
            return "Cukup Direkomendasikan"
        elif skor >= 35:
            return "Kurang Direkomendasikan"
        else:
            return "Tidak Direkomendasikan"
    
    df_gunung['kategori_rekomendasi'] = df_gunung['skor_tertinggi'].apply(kategorikan_rekomendasi)
    df_gunung = df_gunung.sort_values(by='skor_tertinggi', ascending=False)

    # Tambahkan kategori untuk jalur individual
    df_jalur['kategori_rekomendasi'] = df_jalur['skor_rekomendasi'].apply(kategorikan_rekomendasi)
    df_jalur_ranked = df_jalur.sort_values(by='skor_rekomendasi', ascending=False)

    # Pastikan field biaya tidak memiliki NaN atau None sebelum output JSON
    df_jalur_ranked['biaya_simaksi'] = df_jalur_ranked['biaya_simaksi'].fillna(0)
    df_jalur_ranked['biaya_pulang_pergi'] = df_jalur_ranked['biaya_pulang_pergi'].fillna(0)
    df_jalur_ranked['estimasi_biaya'] = df_jalur_ranked['biaya_simaksi'] + df_jalur_ranked['biaya_pulang_pergi']
    
    # Debug: tampilkan status biaya dari database
    if not df_jalur_ranked.empty:
        sample_simaksi = df_jalur_ranked['biaya_simaksi'].iloc[0] 
        sample_pp = df_jalur_ranked['biaya_pulang_pergi'].iloc[0]
        sample_total = df_jalur_ranked['estimasi_biaya'].iloc[0]
        
        print(f"💰 Status Biaya: simaksi={sample_simaksi}, transport={sample_pp}, total={sample_total}", file=sys.stderr)
        print(f"🔍 Debug biaya_pulang_pergi type: {type(sample_pp)}, value: {sample_pp}", file=sys.stderr)
        
        # Info untuk user
        if sample_simaksi == 0:
            print("📝 Info: Biaya simaksi belum diset. Estimasi biaya saat ini hanya mencakup transport.", file=sys.stderr)
        if sample_pp == 0:
            print("📝 Info: Biaya transport 0 - mungkin lokasi terlalu dekat atau tarif belum diset.", file=sys.stderr)
        if sample_total > 0:
            print(f"✅ Total estimasi biaya tersedia: Rp {sample_total:,}", file=sys.stderr)

    # Apply sorting filters if specified in user preferences
    df_jalur_ranked = apply_result_filters(df_jalur_ranked, preferensi_pengguna)
    
    return df_gunung, df_jalur_ranked

# 4. Eksekusi dan Simulasi
def jalankan_simulasi():
    """Fungsi untuk menjalankan simulasi dan menampilkan hasilnya dengan berbagai skenario."""
    df_data = get_data_jalur_from_database()

    print("\n" + "="*100, file=sys.stderr)
    print("🏔️  SIMULASI SISTEM REKOMENDASI FUZZY ENGINE", file=sys.stderr)
    print("="*100, file=sys.stderr)

    # Skenario 1: Pendaki Pemula
    print("\n📍 SKENARIO 1: PENDAKI PEMULA", file=sys.stderr)
    print("-" * 50, file=sys.stderr)
    preferensi_pemula = {
        "max_kesulitan_skala": 5,  # Hindari jalur sulit
        "min_keamanan_skala": 7,   # Prioritas keamanan tinggi
        "max_estimasi_waktu_jam": 20,  # Maksimal 20 jam (2D1N)
        "min_ketersediaan_air": 6,  # Air harus cukup tersedia
        "max_ketinggian_mdpl": 3000  # Hindari gunung sangat tinggi
    }
    
    print(f"Preferensi: {preferensi_pemula}", file=sys.stderr)
    rekomendasi_gunung, rekomendasi_jalur = proses_rekomendasi(df_data.copy(), preferensi_pemula)
    
    if not rekomendasi_gunung.empty:
        print("\n🏆 TOP 3 REKOMENDASI GUNUNG UNTUK PEMULA:", file=sys.stderr)
        top_pemula = rekomendasi_gunung.head(3)[['nama_gunung', 'jalur_terbaik', 'skor_tertinggi', 'kategori_rekomendasi', 'ketinggian', 'kesulitan_terendah']]
        print(top_pemula.to_string(index=False), file=sys.stderr)

    # Skenario 2: Pendaki Berpengalaman
    print("\n\n📍 SKENARIO 2: PENDAKI BERPENGALAMAN", file=sys.stderr)
    print("-" * 50, file=sys.stderr)
    preferensi_berpengalaman = {
        "min_keindahan_pemandangan": 8,  # Mengutamakan pemandangan istimewa
        "min_keamanan_skala": 5,         # Bisa terima risiko sedang
        "max_kesulitan_skala": 10        # Tidak masalah dengan kesulitan tinggi
    }
    
    print(f"Preferensi: {preferensi_berpengalaman}", file=sys.stderr)
    rekomendasi_gunung2, rekomendasi_jalur2 = proses_rekomendasi(df_data.copy(), preferensi_berpengalaman)
    
    # Semua print simulasi dihapus agar tidak mengganggu output JSON saat mode produksi
    pass


# 5. Fungsi Main untuk Integrasi dengan Node.js
def main():
    print("[PYTHON DEBUG] Mulai main()", file=sys.stderr)
    preferensi_pengguna = None
    
    # Parse command line arguments dari Node.js
    if len(sys.argv) > 1:
        try:
            # Ambil string JSON dari argumen baris perintah
            preferensi_json = sys.argv[1]
            # Ubah string JSON menjadi dictionary Python
            preferensi_pengguna = json.loads(preferensi_json)
            print(f"✅ Menerima preferensi: {preferensi_pengguna}", file=sys.stderr)
        except json.JSONDecodeError as e:
            # Jika JSON tidak valid, kirim pesan error ke stderr dan keluar
            print(f"❌ Error: Invalid JSON format received as argument: {e}", file=sys.stderr)
            sys.exit(1)

    try:
        print("[PYTHON DEBUG] Sebelum proses_rekomendasi", file=sys.stderr)
        # 1. Jalankan proses utama dengan data dari database
        rekomendasi_gunung, rekomendasi_jalur = proses_rekomendasi(None, preferensi_pengguna)
        print("[PYTHON DEBUG] Setelah proses_rekomendasi", file=sys.stderr)
        
        print("[PYTHON DEBUG] Sebelum konversi DataFrame ke JSON", file=sys.stderr)
        # 2. Hitung statistik tambahan untuk metadata
        if not rekomendasi_gunung.empty:
            distribusi_kategori = rekomendasi_gunung['kategori_rekomendasi'].value_counts().to_dict()
            skor_tertinggi = rekomendasi_gunung['skor_tertinggi'].max()
            skor_terendah = rekomendasi_gunung['skor_tertinggi'].min()
            skor_rata_rata = rekomendasi_gunung['skor_tertinggi'].mean()
        else:
            distribusi_kategori = {}
            skor_tertinggi = skor_terendah = skor_rata_rata = 0
        
        # 3. Siapkan hasil dalam format dictionary agar bisa dikonversi ke JSON
        # Handle NaN values properly sebelum convert ke JSON
        rekomendasi_gunung = rekomendasi_gunung.fillna(0)
        rekomendasi_jalur = rekomendasi_jalur.fillna(0)
        
        hasil_akhir = {
            "rekomendasi_gunung": json.loads(rekomendasi_gunung.to_json(orient='records')),
            "rekomendasi_jalur": json.loads(rekomendasi_jalur.to_json(orient='records')),
            "metadata": {
                "total_gunung": len(rekomendasi_gunung),
                "total_jalur": len(rekomendasi_jalur),
                "preferensi_diterapkan": preferensi_pengguna is not None,
                "preferensi_detail": preferensi_pengguna if preferensi_pengguna else {},
                "statistik_skor": {
                    "tertinggi": float(skor_tertinggi),
                    "terendah": float(skor_terendah),
                    "rata_rata": float(skor_rata_rata)
                },
                "distribusi_kategori": distribusi_kategori,
                "filters_applied": {
                    "distance_sort": preferensi_pengguna.get('sort_by_distance', None) if preferensi_pengguna else None,
                    "score_sort": preferensi_pengguna.get('sort_by_score', None) if preferensi_pengguna else None,
                    "cost_sort": preferensi_pengguna.get('sort_by_cost', None) if preferensi_pengguna else None
                },
                "engine_info": {
                    "versi": "5.1",
                    "total_variabel": 13,
                    "sistem_bobot": True,
                    "database_integration": True,
                    "filter_support": ["jarak", "skor", "biaya"]
                }
            }
        }
        print(json.dumps(hasil_akhir, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"❌ Error in fuzzy engine: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        # Return error response yang bisa diparse oleh Node.js
        error_response = {
            "error": True,
            "message": str(e),
            "rekomendasi_gunung": [],
            "rekomendasi_jalur": [],
            "metadata": {
                "total_gunung": 0,
                "total_jalur": 0,
                "preferensi_diterapkan": False,
                "engine_info": {
                    "versi": "5.0 - Error State",
                    "error_detail": str(e)
                }
            }
        }
        print(json.dumps(error_response))
        sys.exit(1)


if __name__ == "__main__":
    # Jika dipanggil dengan argumen (dari Node.js), jalankan main()
    # Jika tidak ada argumen, jalankan simulasi untuk testing
    if len(sys.argv) > 1:
        main()
    else:
        # Jalankan simulasi hanya jika testing manual, print ke stderr agar tidak mengganggu stdout
        print("[SIMULASI] Mode simulasi dijalankan. Tidak ada output JSON ke stdout.", file=sys.stderr)
        jalankan_simulasi()