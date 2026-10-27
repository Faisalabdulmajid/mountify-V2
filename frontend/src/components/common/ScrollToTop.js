// src/components/common/ScrollToTop.js

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  // Ekstrak `pathname` dari lokasi saat ini.
  // `pathname` adalah bagian dari URL setelah domain (misal: "/tentang", "/faq")
  const { pathname } = useLocation();

  // Gunakan useEffect untuk menjalankan sebuah fungsi setiap kali `pathname` berubah.
  useEffect(() => {
    // Perintahkan browser untuk scroll ke posisi paling atas (koordinat 0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // Dependensi array ini memastikan efek hanya berjalan saat URL berubah.

  // Komponen ini tidak perlu merender apa pun, tugasnya hanya efek samping.
  return null;
}

export default ScrollToTop;
