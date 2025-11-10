import React from "react";
import { useTranslation } from "react-i18next";
import { FaBell, FaExclamationTriangle } from "react-icons/fa";
import LanguageSwitcher from "../LanguageSwitcher";
import "./DriverHeader.css";

const DriverHeader = ({
  onReportIncident,
  onProfileClick,
  onLogout,
  driverName = "Phan Viết Huy",
  unreadCount = 0,
  onNotificationClick,
  isSignalRConnected = false,
  breadcrumb = null, // Allow custom breadcrumb
}) => {
  const { t } = useTranslation();

  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>{t("driverApp.header.page")}</span> /{" "}
        <span>{breadcrumb || t("driverApp.home.breadcrumb")}</span>
        {/* SignalR Connection Status Indicator */}
        {isSignalRConnected !== undefined && (
          <span
            style={{
              marginLeft: "10px",
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: isSignalRConnected ? "#4caf50" : "#f44336",
              animation: isSignalRConnected ? "none" : "blink 1s infinite",
            }}
            title={
              isSignalRConnected
                ? "SignalR Connected ✓"
                : "SignalR Disconnected ✗"
            }
          />
        )}
      </div>
      <div className="driver-header-actions">
        {onReportIncident && (
          <button className="report-incident-btn" onClick={onReportIncident}>
            <FaExclamationTriangle />
            <span>{t("driverApp.header.reportIncident")}</span>
          </button>
        )}
        {onNotificationClick && (
          <div
            className="notification-bell-wrapper"
            onClick={onNotificationClick}
          >
            <FaBell size={24} className="notification-bell-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
        )}
        <input
          type="text"
          placeholder={t("driverApp.header.searchPlaceholder")}
          className="driver-search-input"
        />
        <LanguageSwitcher />
        {onProfileClick && (
          <div
            className="driver-user-info"
            onClick={onProfileClick}
            title={t("driverApp.header.viewProfile")}
          >
            <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
            <span>{driverName}</span>
          </div>
        )}
        {onLogout && (
          <button className="driver-logout-btn" onClick={onLogout}>
            {t("driverApp.header.logout")}
          </button>
        )}
      </div>
    </header>
  );
};

export default DriverHeader;
