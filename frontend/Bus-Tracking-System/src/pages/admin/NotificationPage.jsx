import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import "./NotificationPage.css"; // CSS riêng
import "../LayoutTable.css"; // Tái sử dụng CSS chung nếu cần (cho modal confirm)
import MultiSelectDropdown from "../MultiSelectDropdown"; // <-- 1. IMPORT COMPONENT MỚI
import {
  FaPaperPlane,
  FaInbox,
  FaTrashAlt,
  FaTimes,
  FaPlus,
  FaExclamationTriangle,
  FaSpinner,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { format } from "date-fns"; // Để format thời gian
import { getCurrentUserId } from "../../utils/auth"; // Import để lấy userId hiện tại
import { useNotification } from "../../context/NotificationContext"; // Import notification context

// Using shared axios instance (../utils/api) which automatically adds Authorization header from session token

// --- DEMO DATA (REMOVED, will fetch from backend) ---
// --- END DEMO DATA ---

// --- COMPONENT MODAL TẠO THÔNG BÁO (ĐÃ CẬP NHẬT) ---
const CreateNotificationModal = ({
  isOpen,
  onClose,
  onSend,
  drivers,
  parents,
  isLoadingRecipients,
}) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("driver");
  // 3. Đổi state thành Set để lưu nhiều ID
  const [selectedDriverIds, setSelectedDriverIds] = useState(new Set());
  const [selectedParentIds, setSelectedParentIds] = useState(new Set()); // Thêm state cho phụ huynh
  const [sendToSelf, setSendToSelf] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setMessage("");
      setRecipientType("driver");
      setSelectedDriverIds(new Set()); // Reset thành Set rỗng
      setSelectedParentIds(new Set()); // Reset thành Set rỗng
      setSendToSelf(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    let recipientsInfo = { type: recipientType, ids: [] };
    let recipientDisplay = "";

    if (recipientType === "driver") {
      if (selectedDriverIds.size === 0) {
        alert("Vui lòng chọn ít nhất một tài xế.");
        return;
      }
      recipientsInfo.ids = Array.from(selectedDriverIds); // Chuyển Set thành Array ID
      recipientDisplay = `Đã chọn ${selectedDriverIds.size} tài xế`; // Hiển thị số lượng
    } else if (recipientType === "parent") {
      if (selectedParentIds.size === 0) {
        alert("Vui lòng chọn ít nhất một phụ huynh.");
        return;
      }
      recipientsInfo.ids = Array.from(selectedParentIds);
      recipientDisplay = `Đã chọn ${selectedParentIds.size} phụ huynh`;
    }

    const notificationData = {
      title,
      message,
      recipientsInfo,
      recipientDisplay,
      sendToSelf,
    };
    console.log("Sending notification (raw data):", notificationData);
    onSend(notificationData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content notification-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h4>{t("notification.createNotification")}</h4>
        </div>
        <form onSubmit={handleSend} className="modal-form notification-form">
          <h5>{t("notification.notificationMethod")}</h5>
          <div className="form-group">
            <label htmlFor="title">{t("notification.title")}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("notification.titlePlaceholder")}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">{t("notification.message")}</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("notification.messagePlaceholder")}
              rows="5"
              required
            ></textarea>
          </div>

          <div className="form-group recipient-group">
            <label>{t("notification.recipient")}</label>
            <div className="recipient-options">
              <label className={recipientType === "driver" ? "selected" : ""}>
                <input
                  type="radio"
                  name="recipientType"
                  value="driver"
                  checked={recipientType === "driver"}
                  onChange={() => {
                    setRecipientType("driver");
                    setSelectedParentIds(new Set());
                  }}
                />{" "}
                <FaUserTie /> {t("notification.driver")}
              </label>
              <label
                className={`${recipientType === "parent" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="recipientType"
                  value="parent"
                  checked={recipientType === "parent"}
                  onChange={() => {
                    setRecipientType("parent");
                    setSelectedDriverIds(new Set());
                  }}
                />{" "}
                <FaUserFriends /> {t("notification.parent")}
              </label>
            </div>
            {/* 4. Sử dụng MultiSelectDropdown cho Tài xế */}
            {recipientType === "driver" && (
              <div className="multi-select-container">
                {isLoadingRecipients ? (
                  <div className="loading-drivers">
                    <FaSpinner className="spinner" /> {t("common.loading")}
                  </div>
                ) : (
                  <MultiSelectDropdown
                    options={drivers}
                    selectedIds={selectedDriverIds}
                    onChange={setSelectedDriverIds} // Truyền hàm cập nhật Set ID
                    placeholder={t("notification.selectDriver")}
                    itemTypeLabel={t("notification.driverLabel")}
                  />
                )}
              </div>
            )}
            {/* 5. Sử dụng MultiSelectDropdown cho Phụ huynh */}
            {recipientType === "parent" && (
              <div className="multi-select-container">
                {isLoadingRecipients ? (
                  <div className="loading-drivers">
                    <FaSpinner className="spinner" /> {t("common.loading")}
                  </div>
                ) : (
                  <MultiSelectDropdown
                    options={parents}
                    selectedIds={selectedParentIds}
                    onChange={setSelectedParentIds}
                    placeholder={t("notification.selectParent")}
                    itemTypeLabel={t("notification.parentLabel")}
                  />
                )}
              </div>
            )}
          </div>

          <div className="form-group send-to-self">
            <label>
              <input
                type="checkbox"
                checked={sendToSelf}
                onChange={(e) => setSendToSelf(e.target.checked)}
              />{" "}
              {t("notification.sendToSelf")}
            </label>
          </div>

          <div className="form-actions modal-actions notification-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="action-btn-form confirm-btn">
              {t("common.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA (Giữ nguyên) ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
  const { t } = useTranslation();

  // ... (Giữ nguyên)
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>{t("notification.confirmDelete")}</h4>
        </div>
        <p className="confirm-text">
          {t("notification.deleteMessage", {
            count: count,
            item:
              count === 1
                ? t("notification.thisNotification")
                : t("notification.selectedNotifications", { count }),
          })}{" "}
          {t("notification.cannotUndo")}
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH CỦA TRANG ---
const NotificationPage = () => {
  const { t } = useTranslation();
  const { unreadCount, refreshUnreadCount, markAsRecentlySent } =
    useNotification(); // Get unread count from context
  const [activeTab, setActiveTab] = useState("sent");
  const [sentNotifications, setSentNotifications] = useState([]);
  const [inboxNotifications, setInboxNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Recipients data
  const [drivers, setDrivers] = useState([]);
  const [parents, setParents] = useState([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Fetch sent and received notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch drivers and parents when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      fetchRecipients();
    }
  }, [isCreateModalOpen]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        api.get("/api/v1/notificaton/sent-notifications"),
        api.get("/api/v1/notificaton/received-notifications"),
      ]);

      console.log("Sent notifications response:", sentRes.data);
      console.log("Received notifications response:", receivedRes.data);

      // Transform backend data to match UI structure
      // Backend sent: { sentNotificationId, title, message, sendAt, recipientUsers: [{recipientUserId, recipientUserName}] }
      const sent = (sentRes.data || []).map((n) => ({
        id: `sent_${n.sentNotificationId}`,
        type: "sent",
        recipient:
          n.recipientUsers?.length > 0
            ? n.recipientUsers.length === 1
              ? n.recipientUsers[0].recipientUserName
              : `${n.recipientUsers.length} người nhận`
            : "Không xác định",
        subject: n.title,
        message: n.message,
        timestamp: format(new Date(n.sendAt), "dd/MM/yyyy - hh:mm a"),
      }));

      // Backend received: { receivedNotifcationId (typo in backend), title, message, sendAt, isRead, senderUserId, senderUserName }
      const received = (receivedRes.data || []).map((n) => ({
        id: `inbox_${n.receivedNotifcationId}`, // Note: typo in backend property name
        type: "inbox",
        sender: n.senderUserName || "Unknown",
        subject: n.title,
        message: n.message,
        timestamp: format(new Date(n.sendAt), "dd/MM/yyyy - hh:mm a"),
        isRead: n.isRead,
      }));

      console.log("Transformed sent notifications:", sent);
      console.log("Transformed received notifications:", received);

      setSentNotifications(sent);
      setInboxNotifications(received);

      // Refresh unread count in context
      refreshUnreadCount();
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      alert("Không thể tải danh sách thông báo.");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const fetchRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      const [driversRes, studentsRes] = await Promise.all([
        api.get("/api/v1/driver/no-pagination"),
        api.get("/api/v1/student/no-pagination"),
      ]);

      console.log("Drivers response:", driversRes.data);
      console.log("Students response:", studentsRes.data);

      // Get current user's userId to filter them out from recipient lists
      const currentUserId = getCurrentUserId();
      console.log(
        "Current user ID (will be filtered from lists):",
        currentUserId
      );

      // Transform drivers: backend returns { id (int), fullName, userId (string) }
      // MultiSelectDropdown expects { id, name }, we use userId as id for sending to backend
      let driverList = (driversRes.data || []).map((d) => ({
        id: d.userId, // IMPORTANT: Use userId (string) as the id for selection
        name: d.fullName,
      }));

      // Filter out current user from driver list (if they have driver role)
      if (currentUserId) {
        driverList = driverList.filter((d) => d.id !== currentUserId);
      }

      // Transform students (parents): { studentId (int), fullName, userId (string), class }
      let parentList = (studentsRes.data || []).map((s) => ({
        id: s.userId, // IMPORTANT: Use userId (string) as the id
        name: `${s.fullName} (${s.class})`,
      }));

      // Filter out current user from parent list (if they have parent/student role)
      if (currentUserId) {
        parentList = parentList.filter((p) => p.id !== currentUserId);
      }

      console.log("Transformed drivers (excluding current user):", driverList);
      console.log("Transformed parents (excluding current user):", parentList);

      setDrivers(driverList);
      setParents(parentList);
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
      alert("Không thể tải danh sách người nhận.");
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const notificationsToShow =
    activeTab === "sent" ? sentNotifications : inboxNotifications;
  const allIdsInCurrentTab = notificationsToShow.map((n) => n.id);
  const isAllSelected =
    selectedIds.size > 0 &&
    selectedIds.size === allIdsInCurrentTab.length &&
    allIdsInCurrentTab.every((id) => selectedIds.has(id));

  const handleSelectItem = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      console.log("Selected IDs:", newSet);
      return newSet;
    });
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedIds(new Set(allIdsInCurrentTab));
      console.log("Selected IDs (All):", new Set(allIdsInCurrentTab));
    } else {
      setSelectedIds(new Set());
      console.log("Selected IDs (None):", new Set());
    }
  };

  const handleDeleteRequest = (id = null) => {
    if (id) {
      console.log(`Requesting delete for single ID: ${id}`);
      setItemToDelete({ id, count: 1 });
    } else if (selectedIds.size > 0) {
      console.log(`Requesting delete for ${selectedIds.size} selected items.`);
      setItemToDelete({ id: null, count: selectedIds.size });
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let idsToDelete = itemToDelete.id
        ? [itemToDelete.id]
        : Array.from(selectedIds);

      console.log(`Confirming delete notifications with IDs:`, idsToDelete);

      // Parse IDs to extract real notification IDs (format: "sent_123" or "inbox_456")
      const deletePromises = idsToDelete.map(async (fullId) => {
        const parts = fullId.split("_");
        const type = parts[0]; // "sent" or "inbox"
        const id = parseInt(parts[1]); // real notification ID

        if (type === "sent") {
          return api.delete(`/api/v1/notificaton/sent/${id}`);
        } else if (type === "inbox") {
          return api.delete(`/api/v1/notificaton/receive/${id}`);
        }
      });

      await Promise.all(deletePromises);

      // Refresh notification list after deletion
      await fetchNotifications();

      setSelectedIds(new Set());
      setItemToDelete(null);
      alert(`Đã xóa ${itemToDelete.count} thông báo thành công!`);
    } catch (error) {
      console.error("Failed to delete notifications:", error);
      alert("Không thể xóa thông báo. Vui lòng thử lại.");
      setItemToDelete(null);
    }
  };

  const handleSendNotification = async (notificationData) => {
    try {
      // Build list of user IDs to send to - Backend expects List<string> of userIds
      let toUserIds = [];

      if (notificationData.recipientsInfo.type === "driver") {
        toUserIds = notificationData.recipientsInfo.ids; // Already userId strings
      } else if (notificationData.recipientsInfo.type === "parent") {
        toUserIds = notificationData.recipientsInfo.ids;
      }

      // IMPORTANT: Get current user's userId and filter it out from recipients
      // Backend will reject if sender is in the recipient list
      const currentUserId = getCurrentUserId();

      // Filter out current user from recipient list (prevent self-send)
      if (currentUserId) {
        const senderIdStr = String(currentUserId).trim();
        toUserIds = toUserIds.filter((id) => String(id).trim() !== senderIdStr);
      }

      // Validate we have recipients after filtering
      if (!toUserIds || toUserIds.length === 0) {
        alert(
          "Không có người nhận hợp lệ. Bạn không thể gửi tin nhắn cho chính mình."
        );
        return;
      }

      const payload = {
        toUserIds: toUserIds,
        title: notificationData.title,
        message: notificationData.message,
        notificationType: 0, // 0 = Info, 1 = Warning, 2 = Error
      };

      console.log("🚀 Sending notification to:", toUserIds);
      console.log("📦 Full payload:", payload);

      await api.post("/api/v1/notificaton/send", payload);

      // Mark this notification as recently sent to avoid showing toast to sender
      markAsRecentlySent(notificationData.title, notificationData.message);

      // Refresh notification list
      await fetchNotifications();

      setIsCreateModalOpen(false);
      if (activeTab !== "sent") {
        setActiveTab("sent");
        setSelectedIds(new Set());
      }
      alert("Đã gửi thông báo thành công!");
    } catch (error) {
      console.error("Failed to send notification:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      // Backend returns Error object with { code, message }
      let errorMsg = "Không thể gửi thông báo. Vui lòng thử lại.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.message) {
          // Backend Error object
          errorMsg = `${data.code || "Error"}: ${data.message}`;
        } else if (data.title) {
          errorMsg = data.title;
        }
      }

      console.error("Final error message:", errorMsg);
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  const changeTab = (tabName) => {
    if (activeTab !== tabName) {
      setActiveTab(tabName);
      setSelectedIds(new Set());
    }
  };

  return (
    <>
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSend={handleSendNotification}
        drivers={drivers}
        parents={parents}
        isLoadingRecipients={isLoadingRecipients}
      />
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        count={itemToDelete?.count || 0}
      />
      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">{t("notification.breadcrumb")}</div>
          <div className="header-actions">
            <div className="notification-bell-wrapper">
              <FiBell size={24} className="notification-bell-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <input
              type="text"
              placeholder={t("notification.searchPlaceholder")}
              className="search-input"
            />
            <button className="user-button">{t("common.login")}</button>
          </div>
        </header>
        <div className="page-content notification-page">
          <div className="content-header notification-header">
            <h2>{t("notification.title")}</h2>
            <div className="header-controls notification-controls">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => handleDeleteRequest(null)}
                  className="control-btn bulk-delete-btn"
                  title={t("notification.deleteSelected", {
                    count: selectedIds.size,
                  })}
                >
                  <FaTrashAlt /> {t("common.delete")} ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="control-btn create-notification-btn"
              >
                {t("notification.createNotification")}
              </button>
            </div>
          </div>
          <div className="notification-tabs">
            <button
              className={`notification-tab-btn ${
                activeTab === "sent" ? "active" : ""
              }`}
              onClick={() => changeTab("sent")}
            >
              <FaPaperPlane /> {t("notification.sent")}
            </button>
            <button
              className={`notification-tab-btn ${
                activeTab === "inbox" ? "active" : ""
              }`}
              onClick={() => changeTab("inbox")}
            >
              <FaInbox /> {t("notification.inbox")}
            </button>
          </div>
          <div className="notification-list-container">
            <div className="list-controls">
              <div className="select-all-container">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={notificationsToShow.length > 0 && isAllSelected}
                  onChange={handleSelectAll}
                  disabled={notificationsToShow.length === 0}
                />
                <label htmlFor="select-all">
                  {t("notification.selectAll")}
                </label>
              </div>
              <select
                className="filter-dropdown"
                defaultValue={
                  activeTab === "sent"
                    ? t("notification.to")
                    : t("notification.from")
                }
              >
                <option
                  value={
                    activeTab === "sent"
                      ? t("notification.to")
                      : t("notification.from")
                  }
                >
                  {activeTab === "sent"
                    ? t("notification.to")
                    : t("notification.from")}
                </option>
              </select>
            </div>
            <ul className="notification-list">
              {isLoadingNotifications ? (
                <li className="no-notifications">
                  <FaSpinner className="spinner" />{" "}
                  {t("notification.loadingNotifications")}
                </li>
              ) : notificationsToShow.length > 0 ? (
                notificationsToShow.map((noti) => (
                  <li
                    key={noti.id}
                    className={`notification-item ${
                      selectedIds.has(noti.id) ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(noti.id)}
                      onChange={() => handleSelectItem(noti.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className="notification-clickable-area"
                      onClick={() => handleSelectItem(noti.id)}
                    >
                      <div className="notification-content">
                        <span className="sender-recipient">
                          {activeTab === "sent"
                            ? `${noti.recipient}`
                            : `${noti.sender}`}
                        </span>
                        <span className="subject">{noti.subject}</span>
                        <span className="message-preview">
                          {" "}
                          - {noti.message.substring(0, 80)}...
                        </span>
                      </div>
                      <span className="timestamp">{noti.timestamp}</span>
                    </div>
                    <button
                      className="delete-single-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(noti.id);
                      }}
                      title="Xóa thông báo này"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))
              ) : (
                <li className="no-notifications">
                  {t("notification.noNotifications", {
                    box:
                      activeTab === "sent"
                        ? t("notification.sentBox")
                        : t("notification.inboxBox"),
                  })}
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotificationPage;
