import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { getFullName } from "../../utils/auth";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import NotificationDetailModal from "../../components/NotificationDetailModal";
import { FiClock, FiUser } from "react-icons/fi";
import { FaSpinner, FaBell } from "react-icons/fa";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import "./ParentNotificationPage.css";

const ParentNotificationPage = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'unread'
  const [selectedNotification, setSelectedNotification] = useState(null); // For detail modal

  // Get parent name from sessionStorage
  const parentName = getFullName() || t("parent.home.parent");

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(
          "/api/v1/notificaton/received-notifications"
        );
        console.log("Notifications response:", response.data);

        // Map backend DTO to frontend format
        const mappedNotifications = (response.data || [])
          .map((notif) => ({
            id: notif.receivedNotifcationId,
            title: notif.title,
            message: notif.message,
            isRead: notif.isRead,
            createdAt: notif.sendAt,
            senderName: notif.senderUserName,
            senderUserId: notif.senderUserId,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ✅ Sort: newest first

        setNotifications(mappedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(t("parent.notifications.error"));
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [t]);

  // Format date time with dynamic locale
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = new Date(dateTimeString);
      const locale = i18n.language === "vi" ? vi : enUS;
      return format(date, "dd/MM/yyyy, HH:mm", { locale });
    } catch {
      return dateTimeString;
    }
  };

  // Filter notifications based on search and tab
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.senderName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" || (activeTab === "unread" && !notif.isRead);

    return matchesSearch && matchesTab;
  });

  // Handle notification click to open detail modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  // Handle mark as read for parent (simpler - just update local state)
  const handleMarkAsRead = async (notificationId) => {
    try {
      // Call backend API GET endpoint which auto marks as read
      await api.get(`/api/v1/notificaton/receive/${notificationId}`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="parent-notification-page-container">
      <ParentSidebar />

      {/* Modal chi tiết thông báo */}
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsRead}
      />

      <div className="parent-main-wrapper">
        <ParentHeader
          breadcrumbs={t("parent.notifications.breadcrumb")}
          parentName={parentName}
        />

        <main className="parent-notification-content">
          <div className="notification-page-header">
            <h2 className="notification-page-title">
              <FaBell /> {t("parent.notifications.title")}
            </h2>
          </div>

          {/* Search Bar */}
          <div className="notification-filter-bar">
            <input
              type="text"
              placeholder={t("parent.notifications.searchPlaceholder")}
              className="notification-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`notification-tab ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              {t("parent.notifications.tabAll")}
            </button>
            <button
              className={`notification-tab ${
                activeTab === "unread" ? "active" : ""
              }`}
              onClick={() => setActiveTab("unread")}
            >
              {t("parent.notifications.tabUnread")}
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list-container">
            {isLoading ? (
              <div className="notification-loading">
                <FaSpinner className="spinner" />{" "}
                {t("parent.notifications.loading")}
              </div>
            ) : error ? (
              <div className="notification-error">{error}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell size={50} />
                <p>{t("parent.notifications.empty")}</p>
              </div>
            ) : (
              <>
                <div className="notification-list-header">
                  <span className="header-content">
                    {t("parent.notifications.headerContent")}
                  </span>
                  <span className="header-sender">
                    {t("parent.notifications.headerSender")}
                  </span>
                  <span className="header-time">
                    {t("parent.notifications.headerTime")}
                  </span>
                </div>

                <div className="notification-list-body">
                  {filteredNotifications.map((notif) => {
                    // Create notification object for modal
                    const notificationForModal = {
                      id: notif.id,
                      type: "inbox", // Parent only receives notifications
                      subject: notif.title || t("parent.notifications.noContent"),
                      message: notif.message || t("parent.notifications.noContent"),
                      sender: notif.senderName || t("parent.notifications.systemSender"),
                      recipient: null,
                      timestamp: formatDateTime(notif.createdAt),
                      isRead: notif.isRead,
                    };

                    return (
                      <div
                        key={notif.id}
                        className={`notification-list-item ${
                          !notif.isRead ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notificationForModal)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="notification-item-content">
                          <p className="notification-text">
                            {notif.message || t("parent.notifications.noContent")}
                          </p>
                          <span className="notification-time-mobile">
                            <FiClock /> {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                        <div className="notification-item-sender">
                          <FiUser />
                          <span>
                            {notif.senderName ||
                              t("parent.notifications.systemSender")}
                          </span>
                        </div>
                        <div className="notification-item-time">
                          <FiClock />
                          <span>{formatDateTime(notif.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentNotificationPage;
