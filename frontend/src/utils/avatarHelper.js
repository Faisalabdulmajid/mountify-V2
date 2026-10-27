// src/utils/avatarHelper.js

import React from "react";

/**
 * Helper untuk menangani URL avatar dari berbagai sumber
 * - Google OAuth: URL lengkap dari Google
 * - Upload manual: Path relatif ke server
 * - Cadangan: Inisial nama atau placeholder
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

/**
 * Menghasilkan URL avatar yang benar berdasarkan sumber
 * @param {string} avatarUrl - URL atau path avatar
 * @param {string} userName - Nama user untuk inisial cadangan
 * @returns {object} - { type: 'image'|'initial', src: string, alt: string }
 */
export function getAvatarConfig(avatarUrl, userName = "User") {
  // Jika ada URL avatar
  if (avatarUrl) {
    // Cek apakah URL absolut (Google, external)
    const isAbsoluteUrl =
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://") ||
      avatarUrl.startsWith("data:");

    return {
      type: "image",
      src: isAbsoluteUrl ? avatarUrl : `${API_BASE_URL}${avatarUrl}`,
      alt: `Avatar ${userName}`,
    };
  }

  // Cadangan ke inisial nama
  const initial = userName ? userName.substring(0, 1).toUpperCase() : "U";
  return {
    type: "initial",
    src: initial,
    alt: `Inisial ${userName}`,
  };
}

/**
 * React component untuk menampilkan avatar
 * @param {object} props - { avatarUrl, userName, className, size }
 */
export function AvatarImage({
  avatarUrl,
  userName,
  className = "",
  size = "40px",
}) {
  const config = getAvatarConfig(avatarUrl, userName);

  if (config.type === "image") {
    return (
      <React.Fragment>
        <img
          src={config.src}
          alt={config.alt}
          className={`avatar-image ${className}`}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            backgroundColor: "#f0f0f0",
          }}
          onError={(e) => {
            // Cadangan jika gambar gagal dimuat
            console.warn(`Failed to load avatar: ${e.target.src}`);
            e.target.style.display = "none";
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className={`avatar-initial ${className}`}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "#27ae60",
            color: "white",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `calc(${size} * 0.4)`,
            fontWeight: "bold",
          }}
        >
          {userName ? userName.substring(0, 1).toUpperCase() : "U"}
        </div>
      </React.Fragment>
    );
  }

  return (
    <div
      className={`avatar-initial ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#27ae60",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `calc(${size} * 0.4)`,
        fontWeight: "bold",
      }}
    >
      {config.src}
    </div>
  );
}

/**
 * Hook untuk menangani update avatar dari Google
 */
export function useGoogleAvatarSync() {
  const updateAvatarFromGoogle = async (googleUser) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/profile/sync-google-avatar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            google_avatar_url: googleUser.picture,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Avatar Google berhasil disinkronkan:", result);
        return result;
      }
    } catch (error) {
      console.error("❌ Gagal sinkronisasi avatar Google:", error);
    }
  };

  return { updateAvatarFromGoogle };
}
