
# 🏔️ Mountify Backend API

Backend server untuk aplikasi Mountify - Sistem Rekomendasi Jalur Pendakian Gunung berbasis Fuzzy Logic.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework  
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Python** - Fuzzy logic recommendation engine
- **Swagger** - API documentation

## ✨ Key Features

### 🔐 Authentication & User Management
- User registration/login with JWT
- Google OAuth integration
- Admin user management
- Profile management with avatar upload

### 🏔️ Mountain & Trail Management
- CRUD operations for mountains and trails
- **Smart transportation cost calculation**
- Coordinate-based location services
- Image upload with thumbnail generation

### 🤖 AI Recommendation System
- **Fuzzy logic-based trail recommendations**
- Multi-criteria decision making
- Smart filtering (distance, score, cost)
- Real-time processing with caching

### 📝 Content Management
- Article publishing system
- Announcements management
- Error reporting system
- Upload file (multer)
- Dokumentasi API (Swagger UI)

## Instalasi & Menjalankan Backend

### 1. Masuk ke folder backend:
```
cd backend
```

### 2. Install dependencies utama:
```
npm install
```
Dependencies utama yang akan di-install otomatis:
- express, cors, dotenv, pg, postgres, jsonwebtoken, multer, nodemailer, swagger-ui-express, bcryptjs, csrf, sanitize-html, yamljs

### 3. Konfigurasi environment
Buat file `.env` sesuai kebutuhan. Contoh variabel:
```
DB_IN_USE=supabase
DB_HOST=...
DB_USER=...
DB_PASS=...
DB_NAME=...
JWT_SECRET=...
```

### 4. Jalankan server:
```
node server.js
```
Server berjalan di [http://localhost:5000](http://localhost:5000)

## Dokumentasi API
Swagger UI tersedia di: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Fuzzy Engine (Python)
Engine rekomendasi utama ada di `rekomendasi_api/fuzzy_engine.py`.
- Untuk menjalankan engine secara mandiri, pastikan Python dan requirements sudah terinstall:
  - Lihat `rekomendasi_api/requirements.txt`

## Struktur Folder Penting
- `controllers/` — logic endpoint
- `routes/` — routing API
- `config/` — konfigurasi database, JWT, dsb
- `middleware/` — middleware autentikasi, CSRF
- `public/` dan `build/` — file statis
- `rekomendasi_api/` — engine fuzzy (Python)

## Kontributor
- Faisal Abdul Majid

---
Untuk pertanyaan atau kontribusi, silakan hubungi melalui email atau GitHub.
