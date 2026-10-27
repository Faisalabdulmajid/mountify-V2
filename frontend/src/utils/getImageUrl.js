// src/utils/getImageUrl.js

/**
 * Helper untuk mendapatkan URL gambar yang benar.
 * Jika url sudah absolut (http/https/data:), return apa adanya.
 * Jika url kosong/null, return fallback.
 * Jika relatif, gabungkan dengan API_BASE_URL.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

export function getImageUrl(url, fallback = "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify") {
  if (!url) return fallback;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  // Jika sudah ada di uploads, pastikan tidak double slash
  if (url.startsWith("/")) {
    return API_BASE_URL + url;
  }
  return API_BASE_URL + "/" + url;
}
