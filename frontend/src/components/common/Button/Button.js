import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

/**
 * Komponen Tombol yang dapat digunakan kembali.
 * Bisa berfungsi sebagai link jika prop 'to' diberikan,
 * atau sebagai tombol biasa jika prop 'onClick' diberikan.
 * @param {object} props
 * @param {string} [props.to] - Path untuk React Router Link.
 * @param {function} [props.onClick] - Fungsi yang akan dijalankan saat tombol diklik.
 * @param {node} props.children - Konten di dalam tombol (teks atau ikon).
 * @param {'primary' | 'secondary'} [props.variant='primary'] - Varian gaya tombol.
 * @param {string} [props.className] - Class CSS tambahan.
 * @param {boolean} [props.disabled=false] - Menonaktifkan tombol.
 */
function Button({
  to,
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const allClassNames = `btn ${variant} ${className}`;

  // Jika prop 'to' ada, render sebagai komponen Link dari React Router
  if (to) {
    return (
      <Link to={to} className={allClassNames}>
        {children}
      </Link>
    );
  }

  // Jika tidak, render sebagai elemen button biasa
  return (
    <button onClick={onClick} className={allClassNames} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
