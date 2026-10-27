// src/components/admin/common/StatusBadge.js
import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({
  status,
  type = "status", // "status", "difficulty", "custom"
  className = "",
}) => {
  const getStatusClass = () => {
    if (type === "status") {
      switch (status) {
        case "Buka":
        case "Aktif":
        case "Online":
          return "status-open";
        case "Tutup":
        case "Nonaktif":
        case "Offline":
          return "status-closed";
        case "Tutup Sementara":
        case "Pending":
          return "status-temporary";
        default:
          return "status-neutral";
      }
    } else if (type === "difficulty") {
      switch (status) {
        case "Mudah":
        case "Easy":
          return "difficulty-easy";
        case "Menengah":
        case "Medium":
          return "difficulty-medium";
        case "Sulit":
        case "Hard":
          return "difficulty-hard";
        default:
          return "difficulty-easy";
      }
    }
    return "status-neutral";
  };

  return (
    <span className={`status-badge ${getStatusClass()} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
