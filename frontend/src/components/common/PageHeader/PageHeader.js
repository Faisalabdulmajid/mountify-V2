import React from "react";

const PageHeader = ({
  title,
  onAddClick,
  addLabel = "Tambah",
  addIcon = <i className="bi bi-plus-lg"></i>,
  children,
}) => {
  return (
    <div className="controls-container">
      <div className="header-row">
        <h1 className="page-title">{title}</h1>
        {onAddClick && (
          <button className="btn-add-new" onClick={onAddClick}>
            {addIcon} {addLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
