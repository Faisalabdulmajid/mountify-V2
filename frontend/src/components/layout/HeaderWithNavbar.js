import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import logo from "../../assets/icon/mountify.png";
import Button from "../common/Button/Button";
import "./HeaderWithNavbar.css";

const MenuIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20M4 12H20M4 18H20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function HeaderWithNavbar() {
  const { user, logout } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLoginClick = () => {
    openModal("login");
    closeMenu();
  };
  const handleRegisterClick = () => {
    openModal("register");
    closeMenu();
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate("/", {
      state: { fromLogout: true, message: "Anda telah berhasil logout." },
    });
    logout();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    closeMenu();
    setDropdownOpen(false);
  }, [location]);

  return (
    <header className={`App-header ${isScrolled ? "scrolled" : ""}`}>
      <Link to="/" className="title-link">
        <img src={logo} className="App-logo" alt="logo" />
        <h2 className="title">Mountify</h2>
      </Link>

      <button
        className="menu-toggle-button"
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav className={`nav ${menuOpen ? "nav-open" : ""}`} id="main-nav">
        <ul className="nav-links">
          <li>
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
          </li>

          {user ? (
            <li className="dropdown" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="dropdown-button"
              >
                <i
                  className="bi bi-person-circle"
                  style={{ marginRight: "8px" }}
                ></i>
                {user.nama_lengkap || user.email}
                <i
                  className={`bi bi-chevron-down dropdown-chevron ${
                    dropdownOpen ? "open" : ""
                  }`}
                ></i>
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  {(user.peran === "admin" || user.peran === "superadmin") && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profil-saya" className="dropdown-item">
                    Profil Saya
                  </Link>

                  {/* === LINK BARU DITAMBAHKAN DI SINI === */}
                  <Link to="/lapor-error" className="dropdown-item">
                    Laporkan Error
                  </Link>
                  {/* ======================================= */}

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <>
              <li className="nav-item-button">
                <Button onClick={handleLoginClick} variant="secondary-on-dark">
                  Masuk
                </Button>
              </li>
              <li className="nav-item-button">
                <Button onClick={handleRegisterClick} variant="primary">
                  Daftar
                </Button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}
    </header>
  );
}

export default HeaderWithNavbar;
