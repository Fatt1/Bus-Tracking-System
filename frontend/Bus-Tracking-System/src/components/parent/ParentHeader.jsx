import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAuth } from "../../utils/auth";
import { FiUser } from "react-icons/fi";
import "./ParentHeader.css";

const ParentHeader = ({ breadcrumbs = "Trang / Trang chủ", parentName = "Phụ Huynh" }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("https://localhost:7229/api/v1/auth/logout", null, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="parent-header">
      <div className="parent-breadcrumbs">{breadcrumbs}</div>
      <div className="parent-header-right">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="parent-search-bar"
        />
        <div className="parent-user-info">
          <FiUser className="user-icon" />
          <span>{parentName}</span>
        </div>
        <button className="parent-logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default ParentHeader;
