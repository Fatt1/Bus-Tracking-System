import React, { useState, useEffect } from "react";
import axios from "axios";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import { FiClock, FiUser } from "react-icons/fi";
import { FaSpinner, FaBell } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./ParentNotificationPage.css";

// Axios instance
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

const ParentNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'unread'

  // Get parent name from localStorage
  const parentName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    "Phụ Huynh";

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API endpoint
        const response = await api.get("/api/v1/notification/my-notifications");
        console.log("Notifications response:", response.data);
        setNotifications(response.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Không thể tải thông báo. Vui lòng thử lại.");
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = new Date(dateTimeString);
      return format(date, "dd/MM/yyyy, HH:mm", { locale: vi });
    } catch {
      return dateTimeString;
    }
  };

  // Filter notifications based on search and tab
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.senderName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || (activeTab === "unread" && !notif.isRead);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="parent-notification-page-container">
      <ParentSidebar />

      <div className="parent-main-wrapper">
        <ParentHeader breadcrumbs="Trang / Thông báo" parentName={parentName} />

        <main className="parent-notification-content">
          <div className="notification-page-header">
            <h2 className="notification-page-title">
              <FaBell /> Thông báo của bạn
            </h2>
          </div>

          {/* Search Bar */}
          <div className="notification-filter-bar">
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              className="notification-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`notification-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả thông báo
            </button>
            <button
              className={`notification-tab ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Chưa đọc
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list-container">
            {isLoading ? (
              <div className="notification-loading">
                <FaSpinner className="spinner" /> Đang tải thông báo...
              </div>
            ) : error ? (
              <div className="notification-error">{error}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell size={50} />
                <p>Không có thông báo nào.</p>
              </div>
            ) : (
              <>
                <div className="notification-list-header">
                  <span className="header-content">Nội dung</span>
                  <span className="header-sender">Người gửi</span>
                  <span className="header-time">Thời gian</span>
                </div>

                <div className="notification-list-body">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-list-item ${
                        !notif.isRead ? "unread" : ""
                      }`}
                    >
                      <div className="notification-item-content">
                        <p className="notification-text">
                          {notif.message || "Không có nội dung"}
                        </p>
                        <span className="notification-time-mobile">
                          <FiClock /> {formatDateTime(notif.createdAt)}
                        </span>
                      </div>
                      <div className="notification-item-sender">
                        <FiUser />
                        <span>{notif.senderName || "Hệ thống"}</span>
                      </div>
                      <div className="notification-item-time">
                        <FiClock />
                        <span>{formatDateTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))}
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
