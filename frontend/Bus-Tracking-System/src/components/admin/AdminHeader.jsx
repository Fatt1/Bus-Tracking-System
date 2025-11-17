import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAuthRoles, clearAuth } from "../../utils/auth";
import api from "../../utils/api";
import LanguageSwitcher from "../LanguageSwitcher";
import { useNotification } from "../../context/NotificationContext"; // Import notification context
import { FaBars } from "react-icons/fa";
import { FiBell } from "react-icons/fi"; // Import bell icon
import { FiLogOut } from "react-icons/fi"; // Import logout icon
import "./AdminHeader.css";

/**
 * AdminHeader - Header component chung cho tất cả các trang admin
 * Props:
 * - breadcrumbs: Nội dung breadcrumbs (string hoặc JSX)
 */
const AdminHeader = ({ breadcrumbs }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roles = getAuthRoles();
  const { unreadCount } = useNotification(); // Get unread count from context

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // ignore errors on logout request
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const handleToggleSidebar = () => {
    // Call global function exposed by Sidebar
    if (window.toggleAdminSidebar) {
      window.toggleAdminSidebar();
    }
  };

  return (
    <header className="page-header">
      {/* Hamburger button for mobile */}
      <button 
        className="hamburger-button"
        onClick={handleToggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className="breadcrumbs">{breadcrumbs}</div>
      <div className="header-actions">
        <div 
          className="notification-bell-wrapper" 
          onClick={() => navigate("/notification")}
          title={t("notification.title")}
        >
          <FiBell size={24} className="notification-bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <LanguageSwitcher />
        {roles && roles.length > 0 ? (
          <button className="login-button" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            <span className="logout-text">{t("common.logout")}</span>
          </button>
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            {t("common.login")}
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
