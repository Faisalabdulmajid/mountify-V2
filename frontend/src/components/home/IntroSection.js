import React from "react";
// REVISI: Impor komponen Button yang baru
import Button from "../common/Button/Button";
import "./IntroSection.css";

function IntroSection() {
  return (
    <section className="intro-section">
      <h2>Temukan Gunung Terbaik untuk Petualangan Anda</h2>
      <p>
        Jelajahi berbagai rekomendasi gunung terbaik untuk mendaki, menikmati
        pemandangan, dan merasakan pengalaman petualangan yang tak terlupakan.
      </p>

      <Button to="/explore" variant="accent">
        Mulai Eksplorasi
      </Button>
    </section>
  );
}

export default IntroSection;
