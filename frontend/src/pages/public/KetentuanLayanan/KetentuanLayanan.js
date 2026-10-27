import React from "react";
// Menggunakan kembali CSS dari Kebijakan Privasi untuk konsistensi
import "../PrivacyPolicy/PrivacyPolicy.css";

function KetentuanLayanan() {
  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <header className="policy-header">
          <h1>Ketentuan Layanan</h1>
          <p className="last-updated">Terakhir diperbarui: 24 Juni 2025</p>
        </header>

        <section className="policy-section">
          <p className="intro-text">
            Selamat datang di Mountify! Ketentuan Layanan ("Ketentuan") ini
            mengatur akses Anda ke dan penggunaan platform kami. Dengan
            mengakses atau menggunakan layanan kami, Anda setuju untuk terikat
            oleh Ketentuan ini.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-check-square-fill"></i>
            Penerimaan Ketentuan
          </h2>
          <p>
            Dengan membuat akun atau menggunakan Layanan Mountify, Anda
            mengonfirmasi bahwa Anda telah membaca, memahami, dan setuju untuk
            terikat oleh semua Ketentuan ini. Jika Anda tidak setuju dengan
            Ketentuan ini, maka Anda dilarang menggunakan layanan kami dan harus
            menghentikan penggunaan dengan segera.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-person-gear"></i>
            Penggunaan Layanan
          </h2>
          <ul>
            <li>
              <strong>Kelayakan:</strong> Anda harus berusia minimal 13 tahun
              untuk menggunakan Layanan kami.
            </li>
            <li>
              <strong>Pendaftaran Akun:</strong> Anda setuju untuk memberikan
              informasi yang akurat, terkini, dan lengkap selama proses
              pendaftaran dan memperbarui informasi tersebut agar tetap akurat.
            </li>
            <li>
              <strong>Penggunaan yang Diizinkan:</strong> Anda setuju untuk
              menggunakan Layanan kami hanya untuk tujuan yang sah dan sesuai
              dengan Ketentuan ini. Anda tidak akan menggunakan layanan untuk
              aktivitas ilegal atau yang melanggar hak orang lain.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-cloud-upload-fill"></i>
            Konten Pengguna
          </h2>
          <p>
            Anda bertanggung jawab penuh atas konten (seperti foto, dan
            komentar) yang Anda unggah ke platform. Dengan mengunggah konten,
            Anda memberikan kami lisensi non-eksklusif, bebas royalti, di
            seluruh dunia untuk menggunakan, menampilkan, dan mendistribusikan
            konten Anda sehubungan dengan pengoperasian Layanan.
          </p>
          <p>
            Anda setuju untuk tidak mengunggah konten yang melanggar hukum,
            memfitnah, cabul, atau melanggar hak kekayaan intelektual pihak
            ketiga.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-exclamation-triangle-fill"></i>
            Batasan Tanggung Jawab (Disclaimer)
          </h2>
          <p>
            Informasi pendakian (termasuk tingkat kesulitan, keamanan, dan
            estimasi waktu) yang disediakan di Mountify adalah untuk tujuan
            informasi umum dan rekomendasi. Informasi ini tidak dimaksudkan
            sebagai pengganti penilaian profesional, pengalaman pribadi, atau
            panduan dari pemandu lokal.
          </p>
          <p>
            Aktivitas mendaki gunung memiliki risiko yang melekat. Anda
            bertanggung jawab penuh atas keselamatan Anda sendiri. Mountify
            tidak bertanggung jawab atas cedera, kerugian, atau kerusakan apa
            pun yang mungkin Anda alami sebagai akibat dari penggunaan informasi
            di platform ini. Selalu lakukan riset tambahan dan persiapkan diri
            dengan baik sebelum melakukan pendakian.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-x-circle-fill"></i>
            Penghentian Akun
          </h2>
          <p>
            Kami berhak untuk menangguhkan atau menghentikan akun Anda kapan
            saja, tanpa pemberitahuan sebelumnya, jika Anda melanggar Ketentuan
            ini atau terlibat dalam perilaku yang kami anggap membahayakan
            platform atau pengguna lain.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-envelope-fill"></i>
            Hubungi Kami
          </h2>
          <p>
            Jika Anda memiliki pertanyaan atau komentar tentang Ketentuan
            Layanan ini, silakan hubungi kami melalui email di:{" "}
            <a href="mailto:fasalabdulmajid.dev@gmail.com">
              fasalabdulmajid.dev@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

export default KetentuanLayanan;
