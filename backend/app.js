// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const logger = require("./logger");
const fetch = require("node-fetch");

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const mountainRoutes = require("./routes/mountains");
const trailRoutes = require("./routes/trails");
const publicRoutes = require("./routes/public");
const recommendationRoutes = require("./routes/recommendations");
const artikelAdminRoutes = require("./routes/routes-artikel-admin");
const gunungAdminRoutes = require("./routes/routes-gunung-admin");
const jalurAdminRoutes = require("./routes/routes-jalur-admin");
const bugAdminRoutes = require("./routes/routes-bug-admin");

const pengumumanAdminRoutes = require("./routes/routes-pengumuman-admin");
const settingsRoutes = require("./routes/settings");
const exportRoutes = require("./routes/export");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi CORS yang mendukung credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mountify.vercel.app", // Jika ada deployment
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Swagger/OpenAPI Documentation dinonaktifkan di production/deploy
if (process.env.NODE_ENV === "development") {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info("✅ Swagger UI tersedia di http://localhost:5000/api-docs");
  } catch (error) {
    logger.error("❌ Error loading OpenAPI file:", error.message);
  }
}

// Routes
console.log("🔧 Mounting routes...");
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes mounted at /api/auth");
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

// =============================
// SECTION ADMIN (DISABLED)
// Untuk menonaktifkan seluruh endpoint /api/admin dan subroutenya,
// cukup komentari baris-baris berikut. Aktifkan kembali jika dibutuhkan.
app.use("/api/admin", adminRoutes);
app.use("/api/admin", mountainRoutes);
app.use("/api/admin", trailRoutes);
app.use("/api/admin", artikelAdminRoutes);
app.use("/api/admin", gunungAdminRoutes);
app.use("/api/admin", jalurAdminRoutes);
app.use("/api/admin", bugAdminRoutes);
app.use("/api/admin", pengumumanAdminRoutes);
app.use("/api/export", exportRoutes);
// =============================

app.use("/api", publicRoutes);

app.use("/api/rekomendasi", recommendationRoutes);
app.use("/api/settings", settingsRoutes);

// Proxy endpoint untuk Nominatim (reverse geocoding)
app.get("/api/proxy/nominatim", async (req, res) => {
  try {
    const { lat, lon, ...rest } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "lat dan lon wajib diisi" });
    }
    // Build query string
    const params = new URLSearchParams({
      lat,
      lon,
      format: "json",
      "accept-language": "id",
      ...rest,
    });
    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "mountify-proxy/1.0",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Kesalahan proxy", detail: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Duplicate for /api/health
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error);
  res.status(500).json({
    message: "Terjadi kesalahan pada server",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
});

module.exports = app;
