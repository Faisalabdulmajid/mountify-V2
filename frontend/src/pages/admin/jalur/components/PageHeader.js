// src/pages/admin/gunung/components/PageHeader.js
import React from "react";
import { Link } from "react-router-dom";

const PageHeader = ({ title, buttonText, buttonLink }) => {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <Link to={buttonLink} className="btn-add-new">
        <i className="bi bi-plus-lg"></i> {buttonText}
      </Link>
    </header>
  );
};
export default PageHeader;
