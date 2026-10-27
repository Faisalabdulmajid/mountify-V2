import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useModal } from "./contexts/ModalContext";
import HeaderWithNavbar from "./components/layout/HeaderWithNavbar";
import Footer from "./components/layout/Footer";
import Modal from "./components/common/Modal/Modal";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import "./App.css";

// 3. PAGE COMPONENTS (LAZY LOAD)
const IntroSection = lazy(() => import("./components/home/IntroSection"));
const PengumumanTerbaruSection = lazy(() =>
  import("./components/home/PengumumanTerbaruSection")
);
const Explore = lazy(() => import("./pages/public/Explore/Explore"));
const PrivacyPolicy = lazy(() =>
  import("./pages/public/PrivacyPolicy/PrivacyPolicy")
);
const HalamanSemuaPengumuman = lazy(() =>
  import("./pages/public/Pengumuman/HalamanSemuaPengumuman")
);
const HalamanDetailPengumuman = lazy(() =>
  import("./pages/public/Pengumuman/HalamanDetailPengumuman")
);
const HalamanSemuaArtikel = lazy(() =>
  import("./pages/public/Artikel/HalamanSemuaArtikel")
);
const HalamanDetailArtikel = lazy(() =>
  import("./pages/public/Artikel/HalamanDetailArtikel")
);
const HalamanDataCuaca = lazy(() =>
  import("./pages/public/Cuaca/HalamanDataCuaca")
);
const HalamanDetailGunung = lazy(() =>
  import("./pages/public/Gunung/HalamanDetailGunung")
);
const TestDetailGunung = lazy(() => import("./pages/TestDetailGunung"));
const LaporError = lazy(() => import("./pages/public/LaporError/LaporError"));
const HalamanTentangKami = lazy(() =>
  import("./pages/public/Tentang/HalamanTentangKami")
);
const KetentuanLayanan = lazy(() =>
  import("./pages/public/KetentuanLayanan/KetentuanLayanan")
);
const HalamanFAQ = lazy(() => import("./pages/public/FAQ/HalamanFAQ"));
const HalamanProfilSaya = lazy(() =>
  import("./pages/public/Profil/HalamanProfilSaya")
);
const HalamanDetailJalur = lazy(() =>
  import("./pages/public/Jalur/HalamanDetailJalur")
);

// Halaman Admin (LAZY LOAD)
const DashboardAdmin = lazy(() => import("./pages/dashboard/DashboardAdmin"));
const KelolaPengguna = lazy(() =>
  import("./pages/admin/pengguna/KelolaPengguna")
);
const TambahPengguna = lazy(() =>
  import("./pages/admin/pengguna/TambahPengguna")
);
const EditPengguna = lazy(() => import("./pages/admin/pengguna/EditPengguna"));
const KelolaGunung = lazy(() => import("./pages/admin/gunung/KelolaGunung"));
const TambahGunung = lazy(() => import("./pages/admin/gunung/TambahGunung"));
const EditGunung = lazy(() => import("./pages/admin/gunung/EditGunung"));
const KelolaJalur = lazy(() => import("./pages/admin/jalur/KelolaJalur"));
const TambahJalur = lazy(() => import("./pages/admin/jalur/TambahJalur"));
const EditJalur = lazy(() => import("./pages/admin/jalur/EditJalur"));
const TambahArtikel = lazy(() => import("./pages/admin/artikel/TambahArtikel"));
const EditArtikel = lazy(() => import("./pages/admin/artikel/EditArtikel"));
const KelolaPengumuman = lazy(() =>
  import("./pages/admin/pengumuman/KelolaPengumuman")
);
const TambahEditPengumuman = lazy(() =>
  import("./pages/admin/pengumuman/TambahEditPengumuman")
);
const KelolaLaporanError = lazy(() =>
  import("./pages/admin/laporan/KelolaLaporanError")
);
const KelolaArtikel = lazy(() => import("./pages/admin/artikel/KelolaArtikel"));
const KelolaProfil = lazy(() => import("./pages/admin/profil/KelolaProfil"));
const PengaturanTarif = lazy(() =>
  import("./pages/admin/pengaturan/PengaturanTarif")
);
const EksporData = lazy(() => import("./pages/admin/EksporData"));

const PublicPageWrapper = ({ children }) => {
  return <main className="public-page-wrapper">{children}</main>;
};
function App() {
  const location = useLocation();
  const { modalType } = useModal();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const renderModalContent = () => {
    switch (modalType) {
      case "login":
        return <Login />;
      case "register":
        return <Register />;
      case "forgotPassword":
        return <ForgotPassword />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <ScrollToTop />
        <Modal>{renderModalContent()}</Modal>
        {!isAdminRoute && <HeaderWithNavbar />}
        <main className="main-container">
          <Suspense
            fallback={
              <div style={{ textAlign: "center", marginTop: 40 }}>
                Memuat halaman...
              </div>
            }
          >
            <Routes>
              {/* --- RUTE PUBLIK --- */}
              <Route
                path="/"
                element={
                  <>
                    <IntroSection />
                    <PengumumanTerbaruSection />
                    {/* Wave divider di bawah hero section dihilangkan sesuai permintaan */}
                  </>
                }
              />
              <Route
                path="/explore"
                element={
                  <PublicPageWrapper>
                    <Explore />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <PublicPageWrapper>
                    <PrivacyPolicy />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/pengumuman"
                element={
                  <PublicPageWrapper>
                    <HalamanSemuaPengumuman />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/pengumuman/:id_pengumuman"
                element={<HalamanDetailPengumuman />}
              />
              <Route
                path="/artikel"
                element={
                  <PublicPageWrapper>
                    <HalamanSemuaArtikel />
                  </PublicPageWrapper>
                }
              />
              <Route path="/artikel/:slug" element={<HalamanDetailArtikel />} />
              <Route
                path="/cuaca"
                element={
                  <PublicPageWrapper>
                    <HalamanDataCuaca />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/gunung/:id_gunung"
                element={
                  <PublicPageWrapper>
                    <HalamanDetailGunung />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/test-detail-gunung"
                element={
                  <PublicPageWrapper>
                    <TestDetailGunung />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/lapor-error"
                element={
                  <PublicPageWrapper>
                    <LaporError />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/tentang"
                element={
                  <PublicPageWrapper>
                    <HalamanTentangKami />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/ketentuan-layanan"
                element={
                  <PublicPageWrapper>
                    <KetentuanLayanan />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/faq"
                element={
                  <PublicPageWrapper>
                    <HalamanFAQ />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/profil-saya"
                element={
                  <PublicPageWrapper>
                    <HalamanProfilSaya />
                  </PublicPageWrapper>
                }
              />
              <Route
                path="/jalur/:idJalur"
                element={
                  <PublicPageWrapper>
                    <HalamanDetailJalur />
                  </PublicPageWrapper>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* --- RUTE ADMIN YANG DILINDUNGI --- */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<DashboardAdmin />} />
                  <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                  <Route path="/admin/users" element={<KelolaPengguna />} />
                  <Route path="/admin/users/new" element={<TambahPengguna />} />
                  <Route
                    path="/admin/users/edit/:id_user"
                    element={<EditPengguna />}
                  />
                  <Route path="/admin/gunung" element={<KelolaGunung />} />
                  <Route path="/admin/gunung/new" element={<TambahGunung />} />
                  <Route
                    path="/admin/gunung/edit/:id_gunung"
                    element={<EditGunung />}
                  />
                  <Route path="/admin/jalur" element={<KelolaJalur />} />
                  <Route path="/admin/jalur/new" element={<TambahJalur />} />
                  <Route
                    path="/admin/jalur/edit/:id_jalur"
                    element={<EditJalur />}
                  />
                  <Route path="/admin/articles" element={<KelolaArtikel />} />
                  <Route
                    path="/admin/articles/new"
                    element={<TambahArtikel />}
                  />
                  <Route
                    path="/admin/articles/edit/:id_artikel"
                    element={<EditArtikel />}
                  />
                  <Route
                    path="/admin/announcements"
                    element={<KelolaPengumuman />}
                  />
                  <Route
                    path="/admin/announcements/new"
                    element={<TambahEditPengumuman />}
                  />
                  <Route
                    path="/admin/announcements/edit/:id_pengumuman"
                    element={<TambahEditPengumuman />}
                  />
                  <Route
                    path="/admin/laporan-error"
                    element={<KelolaLaporanError />}
                  />
                  <Route path="/admin/profil" element={<KelolaProfil />} />
                  <Route
                    path="/admin/pengaturan/tarif"
                    element={<PengaturanTarif />}
                  />
                  <Route path="/admin/ekspor-data" element={<EksporData />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
