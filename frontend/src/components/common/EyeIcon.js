/* Komponen Icon Mata (lihat/sembunyikan password) sesuai style admin, menggunakan Bootstrap Icons */
import React from "react";

export function EyeIcon({ visible = false, ...props }) {
  return visible ? (
    <i className="bi bi-eye-slash" {...props} />
  ) : (
    <i className="bi bi-eye" {...props} />
  );
}
