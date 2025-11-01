import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../utils/api"; // Import api instance với token support
import { clearAuth, getFullName } from "../../utils/auth";
import { useNotification } from "../../context/NotificationContext";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import "./DriverNotificationPage.css"; // Sẽ tạo ở bước 2
import {
  FaHome,
  FaTasks,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
  FaPaperPlane,
  FaInbox,
  FaTrashAlt,
  FaTimes,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- COMPONENT SIDEBAR (Tương tự các trang driver khác) ---
const DriverSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const activePage = location.pathname;

  return (
    <aside className="driver-sidebar">
      <div className="driver-sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="driver-sidebar-nav">
        <ul>
          <li className={activePage === "/driver/home" ? "active" : ""}>
            <Link to="/driver/home">
              {" "}
              <FaHome /> {t("driverApp.sidebar.home")}{" "}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              {" "}
              <FaTasks /> {t("driverApp.sidebar.schedule")}{" "}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/students") ? "active" : ""
            }
          >
            <Link to="/driver/students">
              {" "}
              <FaUserCheck /> {t("driverApp.sidebar.students")}{" "}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/notifications") ? "active" : ""
            }
          >
            <Link to="/driver/notifications">
              {" "}
              <FaBell /> {t("driverApp.sidebar.notifications")}{" "}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

// --- COMPONENT HEADER (Tương tự các trang driver khác) ---
const DriverHeader = ({
  onReportIncident,
  driverName = "Phan Viết Huy",
  onLogout,
  unreadCount = 0,
}) => {
  const { t } = useTranslation();
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>{t("driverApp.header.page")}</span> /{" "}
        <span>{t("driverApp.notifications.breadcrumb")}</span>
      </div>
      <div className="driver-header-actions">
        <button className="report-incident-btn" onClick={onReportIncident}>
          <FaExclamationTriangle />
          <span>{t("driverApp.header.reportIncident")}</span>
        </button>
        <div className="notification-bell-wrapper">
          <FaBell size={24} className="notification-bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <input
          type="text"
          placeholder={t("driverApp.header.searchPlaceholder")}
          className="driver-search-input"
        />
        <div
          className="driver-user-info"
          title={t("driverApp.header.viewProfile")}
        >
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
        <button className="driver-logout-btn" onClick={onLogout}>
          {t("driverApp.header.logout")}
        </button>
      </div>
    </header>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content confirm-delete"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>{t("driverApp.notifications.confirmDelete")}</h4>
        </div>
        <p className="confirm-text">
          {count === 1
            ? t("driverApp.notifications.confirmDeleteMessage")
            : t("driverApp.notifications.confirmDeleteMultiple").replace(
                "{count}",
                count
              )}
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {t("driverApp.notifications.cancel")}
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm}
          >
            {t("driverApp.notifications.confirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH TRANG THÔNG BÁO ---
const DriverNotificationPage = () => {
  const { t } = useTranslation();
  const { unreadCount, refreshUnreadCount } = useNotification();
  const [activeTab, setActiveTab] = useState("inbox"); // 'sent' hoặc 'inbox' (Bắt đầu bằng Thư đến)
  const [sentNotifications, setSentNotifications] = useState([]);
  const [inboxNotifications, setInboxNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [itemToDelete, setItemToDelete] = useState(null); // {id, count}
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Logic modal báo cáo sự cố (từ trang chủ)
  // (Bạn có thể thêm modal báo cáo sự cố sau này)
  const navigate = useNavigate();
  const fullName = getFullName() || "Phan Viết Huy";

  // Fetch notifications from backend
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchNotifications = async () => {
    console.log("=== Fetching notifications for tab:", activeTab, "===");
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "sent") {
        // Fetch sent notifications
        const response = await api.get(
          "/api/v1/notificaton/sent-notifications"
        );
        console.log("Sent notifications response:", response.data);
        setSentNotifications(response.data || []);
      } else {
        // Fetch received notifications
        const response = await api.get(
          "/api/v1/notificaton/received-notifications"
        );
        console.log("Received notifications response:", response.data);
        setInboxNotifications(response.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
      setError(t("driverApp.notifications.error"));
    } finally {
      setIsLoading(false);
      // Refresh unread count after fetching notifications
      refreshUnreadCount();
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const notificationsToShow =
    activeTab === "sent" ? sentNotifications : inboxNotifications;
  const allIdsInCurrentTab = notificationsToShow.map((n) => n.id);
  const isAllSelected =
    selectedIds.size > 0 &&
    notificationsToShow.length > 0 &&
    selectedIds.size === allIdsInCurrentTab.length;

  // --- Xử lý Checkbox ---
  const handleSelectItem = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedIds(new Set(allIdsInCurrentTab));
    } else {
      setSelectedIds(new Set());
    }
  };

  // --- Xử lý Xóa ---
  const handleDeleteRequest = (id = null) => {
    if (id) {
      // Xóa đơn lẻ
      setItemToDelete({ id, count: 1 });
    } else if (selectedIds.size > 0) {
      // Xóa hàng loạt
      setItemToDelete({ id: null, count: selectedIds.size });
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    let idsToDelete;
    if (itemToDelete.id) {
      idsToDelete = [itemToDelete.id];
    } else {
      idsToDelete = Array.from(selectedIds);
    }

    console.log(`Deleting notifications with IDs:`, idsToDelete);
    // Cập nhật state (tạm thời)
    if (activeTab === "sent") {
      setSentNotifications((prev) =>
        prev.filter((n) => !idsToDelete.includes(n.id))
      );
    } else {
      setInboxNotifications((prev) =>
        prev.filter((n) => !idsToDelete.includes(n.id))
      );
    }

    setSelectedIds(new Set());
    setItemToDelete(null);
    alert(
      t("driverApp.notifications.deleteSuccess").replace(
        "{count}",
        itemToDelete.count
      )
    );
  };

  const changeTab = (tabName) => {
    if (activeTab !== tabName) {
      setActiveTab(tabName);
      setSelectedIds(new Set());
    }
  };

  // Format timestamp
  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return format(date, "dd/MM/yyyy - HH:mm", { locale: vi });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Modal báo cáo sự cố */}
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        count={itemToDelete?.count || 0}
      />

      <div className="driver-page-container">
        <DriverSidebar />
        <div className="driver-main-wrapper">
          <DriverHeader
            onReportIncident={() => setIsIncidentModalOpen(true)}
            driverName={fullName}
            onLogout={handleLogout}
            unreadCount={unreadCount}
          />

          <main className="driver-main-content">
            {/* CSS của trang này sẽ ghi đè padding mặc định của driver-main-content */}
            <div className="notification-page-driver">
              {/* Thanh tìm kiếm (Giống hình) */}
              <div className="notification-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t("driverApp.notifications.searchPlaceholder")}
                />
              </div>

              {/* Tabs */}
              <div className="notification-tabs">
                <button
                  className={`notification-tab-btn ${
                    activeTab === "sent" ? "active" : ""
                  }`}
                  onClick={() => changeTab("sent")}
                >
                  <FaPaperPlane /> {t("driverApp.notifications.sent")}
                </button>
                <button
                  className={`notification-tab-btn ${
                    activeTab === "inbox" ? "active" : ""
                  }`}
                  onClick={() => changeTab("inbox")}
                >
                  <FaInbox /> {t("driverApp.notifications.inbox")}
                </button>

                {/* Nút Xóa hàng loạt */}
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => handleDeleteRequest(null)}
                    className="control-btn bulk-delete-btn"
                    title={t("driverApp.notifications.deleteCount").replace(
                      "{count}",
                      selectedIds.size
                    )}
                  >
                    <FaTrashAlt />{" "}
                    {t("driverApp.notifications.deleteCount").replace(
                      "{count}",
                      selectedIds.size
                    )}
                  </button>
                )}
              </div>

              {/* Notification List Area */}
              <div className="notification-list-container">
                {isLoading ? (
                  <div className="loading-container">
                    <FaSpinner className="spinner" />
                    <p>{t("driverApp.notifications.loading")}</p>
                  </div>
                ) : error ? (
                  <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchNotifications} className="retry-btn">
                      {t("driverApp.notifications.retry")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="list-controls">
                      <div className="select-all-container">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          disabled={notificationsToShow.length === 0}
                        />
                        <label htmlFor="select-all">
                          {t("driverApp.notifications.selectAll")}
                        </label>
                      </div>
                      <select
                        className="filter-dropdown"
                        defaultValue={
                          activeTab === "sent"
                            ? t("driverApp.notifications.to")
                            : t("driverApp.notifications.from")
                        }
                      >
                        <option
                          value={
                            activeTab === "sent"
                              ? t("driverApp.notifications.to")
                              : t("driverApp.notifications.from")
                          }
                        >
                          {activeTab === "sent"
                            ? t("driverApp.notifications.to")
                            : t("driverApp.notifications.from")}
                        </option>
                      </select>
                    </div>

                    <ul className="notification-list">
                      {notificationsToShow.length > 0 ? (
                        notificationsToShow.map((noti) => {
                          // Map dữ liệu từ backend DTO
                          const id =
                            activeTab === "sent"
                              ? noti.sentNotificationId
                              : noti.receivedNotifcationId;
                          const sender =
                            activeTab === "inbox" ? noti.senderUserName : null;
                          const recipients =
                            activeTab === "sent"
                              ? noti.recipientUsers
                                  .map((r) => r.recipientUserName)
                                  .join(", ")
                              : null;

                          return (
                            <li
                              key={id}
                              className={`notification-item ${
                                selectedIds.has(id) ? "selected" : ""
                              } ${
                                activeTab === "inbox" && !noti.isRead
                                  ? "unread"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(id)}
                                onChange={() => handleSelectItem(id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div
                                className="notification-clickable-area"
                                onClick={() => handleSelectItem(id)}
                              >
                                <div className="notification-content">
                                  <span className="sender-recipient">
                                    {activeTab === "sent"
                                      ? `Đến: ${recipients}`
                                      : `Từ: ${sender}`}
                                  </span>
                                  <span className="subject">{noti.title}</span>
                                  <span className="message-preview">
                                    {" "}
                                    - {noti.message.substring(0, 50)}
                                    {noti.message.length > 50 ? "..." : ""}
                                  </span>
                                </div>
                                <span className="timestamp">
                                  {formatTimestamp(noti.sendAt)}
                                </span>
                              </div>
                              <button
                                className="delete-single-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRequest(id);
                                }}
                                title="Xóa thông báo này"
                              >
                                <FaTrashAlt />
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li className="no-notifications">
                          {activeTab === "sent"
                            ? t("driverApp.notifications.noSent")
                            : t("driverApp.notifications.noInbox")}
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DriverNotificationPage;
