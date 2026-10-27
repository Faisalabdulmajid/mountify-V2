import React, { useState } from "react";
import "./HalamanFAQ.css"; // Kita akan buat file CSS ini

// Data untuk pertanyaan dan jawaban
const faqData = [
  {
    question: "Apa itu Mountify?",
    answer:
      "Mountify adalah sebuah platform digital berbasis web yang dirancang sebagai Sistem Pendukung Keputusan (SPK) untuk para pendaki gunung. Tujuan utama kami adalah memberikan rekomendasi jalur pendakian yang paling sesuai dengan preferensi dan kemampuan Anda, menggunakan teknologi Logika Fuzzy.",
  },
  {
    question: "Apakah layanan Mountify gratis?",
    answer:
      "Ya, semua fitur inti di Mountify, termasuk sistem rekomendasi, informasi gunung, dan artikel, sepenuhnya gratis untuk digunakan. Proyek ini dibuat untuk tujuan akademis dan untuk membantu komunitas pendaki.",
  },
  {
    question: "Bagaimana cara kerja sistem rekomendasinya?",
    answer:
      "Sistem kami menggunakan metode Logika Fuzzy. Anda memasukkan preferensi Anda (seperti tingkat kesulitan, durasi, keamanan, dll.), dan sistem akan menghitung 'skor kelayakan' untuk setiap jalur pendakian di database kami. Jalur dengan skor tertinggi akan ditampilkan sebagai rekomendasi teratas untuk Anda.",
  },
  {
    question: "Apakah data jalur pendakian di sini akurat?",
    answer:
      "Kami berusaha semaksimal mungkin untuk menyediakan data yang akurat dan terbaru. Namun, kondisi alam selalu bisa berubah. Kami sangat menyarankan Anda untuk selalu melakukan verifikasi silang dengan sumber resmi (seperti balai taman nasional terkait) sebelum melakukan pendakian.",
  },
  {
    question: "Bagaimana cara saya berkontribusi?",
    answer:
      "Kontribusi terbaik dari Anda adalah dengan melaporkan jika ada data yang tidak akurat melalui fitur 'Lapor Error'. Partisipasi aktif Anda akan sangat membantu meningkatkan kualitas platform ini untuk semua pengguna.",
  },
  {
    question: "Siapa yang berada di balik proyek ini?",
    answer:
      "Mountify dikembangkan oleh Faisal Abdul Majid sebagai bagian dari proyek penelitian skripsi di Program Studi Teknik Informatika, Universitas Perjuangan Tasikmalaya. Anda bisa mengetahui lebih lanjut di halaman 'Tentang'.",
  },
];

// Komponen untuk satu item FAQ
const FaqItem = ({ faq, index, isOpen, onToggle }) => {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => onToggle(index)}>
        <span>{faq.question}</span>
        <i className={`bi bi-chevron-down ${isOpen ? "open" : ""}`}></i>
      </button>
      <div className={`faq-answer ${isOpen ? "open" : ""}`}>
        <p>{faq.answer}</p>
      </div>
    </div>
  );
};

function HalamanFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <header className="policy-header">
          <h1>Frequently Asked Questions (FAQ)</h1>
          <p className="last-updated">
            Punya pertanyaan? Temukan jawabannya di sini.
          </p>
        </header>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HalamanFAQ;
