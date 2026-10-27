// src/pages/admin/jalur/components/PageHeaderBack.js
import React from "react";
import { Link } from "react-router-dom";

const PageHeaderBack = ({ title, backText, backLink }) => {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <Link to={backLink} className="btn-back">
        <i className="bi bi-arrow-left"></i> {backText}
      </Link>
    </header>
  );
};
export default PageHeaderBack;
