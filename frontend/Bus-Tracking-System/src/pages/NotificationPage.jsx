import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NotificationPage.css"; // CSS riêng
import "../pages/LayoutTable.css"; // Tái sử dụng CSS chung nếu cần (cho modal confirm)
import MultiSelectDropdown from ".//MultiSelectDropdown"; // <-- 1. IMPORT COMPONENT MỚI
import {
  FaPaperPlane,
  FaInbox,
  FaTrashAlt,
  FaTimes,
  FaPlus,
  FaExclamationTriangle,
  FaSpinner,
  FaUsers,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";
import { format } from "date-fns"; // Để format thời gian

// --- API BASE URL ---
const API_BASE = "https://localhost:7229/api/v1";

// Helper function to create axios instance with credentials
const createAPI = () =>
  axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

// --- END API SETUP ---

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
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  // 3. Đổi state thành Set để lưu nhiều ID
  const [selectedDriverIds, setSelectedDriverIds] = useState(new Set());
  const [selectedParentIds, setSelectedParentIds] = useState(new Set()); // Thêm state cho phụ huynh
  const [sendToSelf, setSendToSelf] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setMessage("");
      setRecipientType("all");
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

    if (recipientType === "all") {
      recipientsInfo.ids = ["all"]; // API có thể chỉ cần 'all'
      recipientDisplay = "Tất cả";
    } else if (recipientType === "driver") {
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
          <h4>Tạo Thông Báo</h4>
        </div>
        <form onSubmit={handleSend} className="modal-form notification-form">
          <h5>Phương thức thông báo</h5>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Tin nhắn</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              rows="5"
              required
            ></textarea>
          </div>

          <div className="form-group recipient-group">
            <label>Người nhận</label>
            <div className="recipient-options">
              <label className={recipientType === "all" ? "selected" : ""}>
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === "all"}
                  onChange={() => {
                    setRecipientType("all");
                    setSelectedDriverIds(new Set());
                    setSelectedParentIds(new Set());
                  }}
                />{" "}
                <FaUsers /> Tất cả
              </label>
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
                <FaUserTie /> Tài xế
              </label>
              <label
                className={`${recipientType === "parent" ? "selected" : ""}`}
              >
                {" "}
                {/* Bỏ disabled */}
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
                <FaUserFriends /> Phụ huynh
              </label>
            </div>
            {/* 4. Sử dụng MultiSelectDropdown cho Tài xế */}
            {recipientType === "driver" && (
              <div className="multi-select-container">
                {isLoadingRecipients ? (
                  <div className="loading-drivers">
                    <FaSpinner className="spinner" /> Đang tải...
                  </div>
                ) : (
                  <MultiSelectDropdown
                    options={drivers}
                    selectedIds={selectedDriverIds}
                    onChange={setSelectedDriverIds} // Truyền hàm cập nhật Set ID
                    placeholder="-- Chọn tài xế --"
                    itemTypeLabel="tài xế"
                  />
                )}
              </div>
            )}
            {/* 5. Sử dụng MultiSelectDropdown cho Phụ huynh */}
            {recipientType === "parent" && (
              <div className="multi-select-container">
                {isLoadingRecipients ? (
                  <div className="loading-drivers">
                    <FaSpinner className="spinner" /> Đang tải...
                  </div>
                ) : (
                  <MultiSelectDropdown
                    options={parents}
                    selectedIds={selectedParentIds}
                    onChange={setSelectedParentIds}
                    placeholder="-- Chọn phụ huynh --"
                    itemTypeLabel="phụ huynh"
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
              Gửi tới thông báo của tôi
            </label>
          </div>

          <div className="form-actions modal-actions notification-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="action-btn-form confirm-btn">
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA (Giữ nguyên) ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
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
          <h4>Xác nhận xóa</h4>
        </div>
        <p className="confirm-text">
          Bạn có chắc chắn muốn xóa{" "}
          {count === 1 ? "thông báo này" : `${count} thông báo đã chọn`} không?
          Hành động này không thể hoàn tác.
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH CỦA TRANG ---
const NotificationPage = () => {
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
      const api = createAPI();
      const [sentRes, receivedRes] = await Promise.all([
        api.get("/notificaton/sent-notifications"),
        api.get("/notificaton/received-notifications"),
      ]);

      // Transform backend data to match UI structure
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

      const received = (receivedRes.data || []).map((n) => ({
        id: `inbox_${n.receivedNotifcationId}`,
        type: "inbox",
        sender: n.senderUserName || "Unknown",
        subject: n.title,
        message: n.message,
        timestamp: format(new Date(n.sendAt), "dd/MM/yyyy - hh:mm a"),
        isRead: n.isRead,
      }));

      setSentNotifications(sent);
      setInboxNotifications(received);
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
      const api = createAPI();
      const [driversRes, studentsRes] = await Promise.all([
        api.get("/driver/no-pagination"),
        api.get("/student/no-pagination"),
      ]);

      // Transform drivers: backend returns { id (int), fullName, userId (string) }
      // MultiSelectDropdown expects { id, name }, and we'll store userId separately
      const driverList = (driversRes.data || []).map((d) => ({
        id: d.userId, // Use userId as the id for selection
        name: d.fullName,
      }));

      // Transform students (parents): { studentId (int), fullName, userId (string), class }
      const parentList = (studentsRes.data || []).map((s) => ({
        id: s.userId, // Use userId as the id
        name: `${s.fullName} (${s.class})`,
      }));

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

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    let idsToDelete = itemToDelete.id
      ? [itemToDelete.id]
      : Array.from(selectedIds);
    console.log(`Confirming delete notifications with IDs:`, idsToDelete);
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
    alert(`Đã xóa ${itemToDelete.count} thông báo (mock data)!`);
  };

  const handleSendNotification = async (notificationData) => {
    try {
      const api = createAPI();

      // Build list of user IDs to send to
      let toUserIds = [];
      if (notificationData.recipientsInfo.type === "all") {
        // Backend should handle "all" or we send all driver + parent userIds
        // For simplicity, backend might accept an empty array or special flag
        // Check backend implementation - if it needs explicit IDs, gather all
        toUserIds = []; // Backend may treat empty as "all" or we send merged list
      } else if (notificationData.recipientsInfo.type === "driver") {
        toUserIds = notificationData.recipientsInfo.ids; // Already userId strings
      } else if (notificationData.recipientsInfo.type === "parent") {
        toUserIds = notificationData.recipientsInfo.ids;
      }

      const payload = {
        toUserIds,
        title: notificationData.title,
        message: notificationData.message,
        notificationType: 0, // 0 = Info, adjust as needed
      };

      await api.post("/notificaton/send", payload);

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
      alert("Không thể gửi thông báo. Vui lòng thử lại.");
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
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Thông báo</span>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              className="search-input"
            />
            <button className="user-button">Đăng nhập</button>
          </div>
        </header>
        <div className="page-content notification-page">
          <div className="content-header notification-header">
            <h2>Danh sách thông báo</h2>
            <div className="header-controls notification-controls">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => handleDeleteRequest(null)}
                  className="control-btn bulk-delete-btn"
                  title={`Xóa ${selectedIds.size} mục đã chọn`}
                >
                  <FaTrashAlt /> Xóa ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="control-btn create-notification-btn"
              >
                Tạo thông báo
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
              <FaPaperPlane /> Đã gửi
            </button>
            <button
              className={`notification-tab-btn ${
                activeTab === "inbox" ? "active" : ""
              }`}
              onClick={() => changeTab("inbox")}
            >
              <FaInbox /> Thư đến
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
                <label htmlFor="select-all">Chọn tất cả</label>
              </div>
              <select
                className="filter-dropdown"
                defaultValue={activeTab === "sent" ? "Đến" : "Từ"}
              >
                <option value={activeTab === "sent" ? "Đến" : "Từ"}>
                  {activeTab === "sent" ? "Đến" : "Từ"}
                </option>
              </select>
            </div>
            <ul className="notification-list">
              {isLoadingNotifications ? (
                <li className="no-notifications">
                  <FaSpinner className="spinner" /> Đang tải thông báo...
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
                  Không có thông báo nào trong{" "}
                  {activeTab === "sent" ? "hộp thư đi" : "hộp thư đến"}.
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
