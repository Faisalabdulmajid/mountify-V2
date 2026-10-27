// src/components/layout/Footer.js

import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";
import { useModal } from "../../contexts/ModalContext";

function Footer() {
  const { openModal } = useModal();

  const handleLoginModal = (e) => {
    e.preventDefault();
    openModal("login");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Kolom 1: Branding & Info Kontak */}
        <div className="footer-column">
          <h4>Mountify</h4>
          <p className="footer-tagline">Temukan jalur pendakian terbaikmu.</p>
          <ul className="footer-links">
            <li>Email: faisalabdulmajid.dev@gmail.com</li>
            <li>Telepon: +62 812 3456 7890</li>
          </ul>
        </div>

        {/* Kolom 2: Navigasi Cepat */}
        <div className="footer-column">
          <h4>Navigasi</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link">
                Home
              </Link>
            </li>
            <li>
              <a
                href="#login"
                onClick={handleLoginModal}
                className="footer-link"
              >
                Masuk / Daftar
              </a>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Legal & Bantuan */}
        <div className="footer-column">
          <h4>Bantuan & Kebijakan</h4>
          <ul className="footer-links">
            <li>
              <Link to="/faq" className="footer-link">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="footer-link">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link to="/ketentuan-layanan" className="footer-link">
                Ketentuan Layanan
              </Link>
            </li>
            {/* === LINK BARU DITAMBAHKAN DI SINI === */}
            <li>
              <Link to="/lapor-error" className="footer-link">
                Laporkan Error
              </Link>
            </li>
            {/* ======================================= */}
          </ul>
        </div>

        {/* Kolom 4: Ikuti Kami (dengan Ikon) */}
        <div className="footer-column">
          <h4>Ikuti Kami</h4>
          <div className="footer-social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Facebook"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://youtube.com/YOURCHANNEL"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="YouTube"
            >
              <i className="bi bi-youtube"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="GitHub"
            >
              <i className="bi bi-github"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Mountify. Dibuat dengan semangat
          petualangan.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
