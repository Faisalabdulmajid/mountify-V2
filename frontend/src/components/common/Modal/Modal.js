// src/components/common/Modal/Modal.js (KODE FINAL - FLEKSIBEL)

import React from "react";
import { useModal } from "../../../contexts/ModalContext";
import "./Modal.css";

// PERUBAHAN: Komponen sekarang menerima 'children' untuk kontennya.
function Modal({ children }) {
  const { isModalOpen, closeModal } = useModal();

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeModal}>
          &times;
        </button>
        {/* Menampilkan konten apapun yang diberikan dari App.js */}
        {children}
      </div>
    </div>
  );
}

export default Modal;
