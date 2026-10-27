// src/utils/imageUrl.js

/**
 * Returns a valid image URL for the app, handling absolute and relative URLs.
 * - If the URL is already absolute (starts with http/https), return as is.
 * - If the URL is relative, prepend API_BASE_URL (without /api if present).
 * - Jika kosong/salah, kembalikan gambar fallback.
 */
export function getImageUrl(url, fallback = "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify") {
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url)) return url;
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  // Hapus /api di akhir jika ada
  const base = API_BASE_URL ? API_BASE_URL.replace(/\/api$/, "") : "";
  return `${base}${url}`;
}
