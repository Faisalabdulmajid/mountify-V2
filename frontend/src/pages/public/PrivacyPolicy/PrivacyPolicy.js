import React from "react";
import "./PrivacyPolicy.css"; // Kita akan perbarui CSS ini juga

function PrivacyPolicy() {
  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <header className="policy-header">
          <h1>Kebijakan Privasi</h1>
          <p className="last-updated">Terakhir diperbarui: 24 Juni 2025</p>
        </header>

        <section className="policy-section">
          <p className="intro-text">
            Selamat datang di Mountify. Kami menghargai privasi Anda dan
            berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi
            ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
            mengungkapkan, dan menjaga informasi Anda saat Anda menggunakan
            platform kami.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-collection-fill"></i>
            Informasi yang Kami Kumpulkan
          </h2>
          <p>
            Kami dapat mengumpulkan informasi tentang Anda dalam berbagai cara.
            Informasi yang kami kumpulkan meliputi:
          </p>

          <h3>Data Pribadi yang Anda Berikan</h3>
          <ul>
            <li>
              <strong>Informasi Akun:</strong> Saat Anda mendaftar, kami
              mengumpulkan nama lengkap, username, alamat email, dan password
              yang sudah di-hash.
            </li>
            <li>
              <strong>Informasi Profil:</strong> Anda dapat memilih untuk
              memberikan informasi tambahan seperti domisili, instansi, dan foto
              profil.
            </li>
            <li>
              <strong>Konten Buatan Pengguna:</strong> Kami mengumpulkan data
              yang Anda buat di platform, seperti foto di galeri,
              laporan error, dan artikel.
            </li>
          </ul>

          <h3>Data yang Dikumpulkan Secara Otomatis</h3>
          <ul>
            <li>
              <strong>Data untuk Rekomendasi:</strong> Preferensi yang Anda
              masukkan ke dalam Sistem Pendukung Keputusan (SPK), seperti
              tingkat kesulitan, budget, dan alokasi waktu, akan kami proses
              untuk memberikan rekomendasi.
            </li>
            <li>
              <strong>Informasi Penggunaan:</strong> Kami dapat mencatat
              bagaimana Anda berinteraksi dengan layanan kami, halaman mana yang
              Anda kunjungi, dan fitur apa yang Anda gunakan.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-sliders"></i>
            Bagaimana Kami Menggunakan Informasi Anda
          </h2>
          <p>
            Memiliki informasi yang akurat tentang Anda memungkinkan kami untuk
            memberikan pengalaman yang lancar, efisien, dan disesuaikan. Secara
            spesifik, kami dapat menggunakan informasi yang dikumpulkan tentang
            Anda untuk:
          </p>
          <ul>
            <li>Membuat dan mengelola akun Anda.</li>
            <li>
              Menyediakan rekomendasi gunung dan jalur pendakian yang
              dipersonalisasi melalui SPK kami.
            </li>
            <li>
              Mengirimkan email notifikasi terkait akun atau pembaruan layanan.
            </li>
            <li>Meningkatkan efisiensi dan pengoperasian platform.</li>
            <li>
              Menganalisis penggunaan dan tren untuk meningkatkan pengalaman
              Anda.
            </li>
            <li>Menanggapi laporan error dan memberikan dukungan pelanggan.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-shield-lock-fill"></i>
            Keamanan Informasi Anda
          </h2>
          <p>
            Kami menggunakan langkah-langkah keamanan administratif, teknis, dan
            fisik untuk membantu melindungi informasi pribadi Anda. Kata sandi
            Anda disimpan menggunakan teknik hashing yang kuat, dan kami
            membatasi akses ke data pribadi hanya kepada personel yang
            berwenang. Meskipun kami telah mengambil langkah-langkah yang wajar
            untuk mengamankan informasi pribadi yang Anda berikan kepada kami,
            perlu diketahui bahwa tidak ada tindakan keamanan yang sempurna atau
            tidak dapat ditembus.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-pencil-square"></i>
            Perubahan pada Kebijakan Ini
          </h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
            Versi yang diperbarui akan ditandai dengan tanggal "Terakhir
            diperbarui" dan akan berlaku segera setelah dapat diakses. Kami
            mendorong Anda untuk meninjau kebijakan privasi ini secara berkala
            agar tetap mendapat informasi tentang bagaimana kami melindungi data
            Anda.
          </p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">
            <i className="bi bi-envelope-fill"></i>
            Hubungi Kami
          </h2>
          <p>
            Jika Anda memiliki pertanyaan atau komentar tentang Kebijakan
            Privasi ini, silakan hubungi kami melalui email di:{" "}
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

export default PrivacyPolicy;
