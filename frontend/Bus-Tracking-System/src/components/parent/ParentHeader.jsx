import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { clearAuth } from "../../utils/auth";
import { FiUser, FiBell } from "react-icons/fi";
import { useNotification } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import "./ParentHeader.css";

const ParentHeader = ({
  breadcrumbs = "Trang / Trang chủ",
  parentName = "Phụ Huynh",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const handleNotificationClick = () => {
    navigate("/parent/notifications");
  };

  return (
    <header className="parent-header">
      <div className="parent-breadcrumbs">{breadcrumbs}</div>
      <div className="parent-header-right">
        <div
          className="notification-bell-wrapper"
          onClick={handleNotificationClick}
        >
          <FiBell size={24} className="notification-bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <input
          type="text"
          placeholder={t('common.search')}
          className="parent-search-bar"
        />
        <LanguageSwitcher />
        <div className="parent-user-info">
          <FiUser className="user-icon" />
          <span>{parentName}</span>
        </div>
        <button className="parent-logout-btn" onClick={handleLogout}>
          {t('common.logout')}
        </button>
      </div>
    </header>
  );
};

export default ParentHeader;
