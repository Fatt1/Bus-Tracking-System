import React, { useState, useEffect } from "react";
// import axios from 'axios'; // Bỏ comment khi dùng API
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

// --- DEMO DATA ---
const mockSentNotifications = Array.from({ length: 15 }, (_, i) => ({
  id: `sent_${i + 1}`,
  type: "sent",
  recipient:
    i % 3 === 0 ? "Tất cả tài xế" : `Tài xế Phan Viết Huy ${(i % 5) + 1}`,
  subject: `Thông báo ${i + 1}: Cập nhật lịch trình quan trọng`,
  message: `Nội dung chi tiết của thông báo số ${i + 1} gửi đến ${
    i % 3 === 0 ? "tất cả tài xế" : `Tài xế Phan Viết Huy ${(i % 5) + 1}`
  }. Vui lòng kiểm tra lịch trình mới nhất được cập nhật trên hệ thống.`,
  timestamp: `2025-10-26 - ${String(8 + (i % 10)).padStart(2, "0")}:${String(
    (i * 3) % 60
  ).padStart(2, "0")} AM`,
}));

const mockInboxNotifications = Array.from({ length: 8 }, (_, i) => ({
  id: `inbox_${i + 1}`,
  type: "inbox",
  sender: `Tài xế Nguyễn Văn An ${i + 1}`,
  subject: `Phản hồi ${i + 1}: Về sự cố xe B00${i + 1}`,
  message: `Nội dung phản hồi chi tiết từ tài xế Nguyễn Văn An ${
    i + 1
  } về sự cố trên tuyến đường X vào ngày Y... cần hỗ trợ gấp.`,
  timestamp: `2025-10-25 - ${String(14 + (i % 5)).padStart(2, "0")}:${String(
    (i * 7) % 60
  ).padStart(2, "0")} PM`,
}));

// Dữ liệu mẫu cho dropdowns trong modal
const mockDrivers = [
  { id: 1, name: "Phan Viết Huy" },
  { id: 2, name: "Nguyễn Văn An" },
  { id: 3, name: "Lê Thị Cẩm" },
  { id: 4, name: "Trần Bảo Ngọc" },
  { id: 5, name: "Võ Thị Sáu" },
];
// 2. THÊM MOCK DATA PHỤ HUYNH
const mockParents = [
  { id: 101, name: "Phụ huynh em Nguyễn A" },
  { id: 102, name: "Phụ huynh em Trần B" },
  { id: 103, name: "Phụ huynh em Lê C" },
  { id: 104, name: "Phụ huynh em Phạm D" },
];
// --- END DEMO DATA ---

// --- COMPONENT MODAL TẠO THÔNG BÁO (ĐÃ CẬP NHẬT) ---
const CreateNotificationModal = ({
  isOpen,
  onClose,
  onSend,
  drivers,
  parents,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  // 3. Đổi state thành Set để lưu nhiều ID
  const [selectedDriverIds, setSelectedDriverIds] = useState(new Set());
  const [selectedParentIds, setSelectedParentIds] = useState(new Set()); // Thêm state cho phụ huynh
  const [sendToSelf, setSendToSelf] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false); // Chung cho cả 2

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setMessage("");
      setRecipientType("all");
      setSelectedDriverIds(new Set()); // Reset thành Set rỗng
      setSelectedParentIds(new Set()); // Reset thành Set rỗng
      setSendToSelf(false);
      // Có thể gọi API lấy drivers/parents ở đây
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
                {isLoadingOptions ? (
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
                {isLoadingOptions ? (
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

// --- COMPONENT CHÍNH CỦA TRANG (Giữ nguyên phần lớn logic) ---
const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("sent");
  const [sentNotifications, setSentNotifications] = useState(
    mockSentNotifications
  );
  const [inboxNotifications, setInboxNotifications] = useState(
    mockInboxNotifications
  );
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const handleSendNotification = (notificationData) => {
    console.log("Adding new sent notification (mock):", notificationData);
    const newNotification = {
      id: `sent_${Date.now()}`,
      type: "sent",
      recipient: notificationData.recipientDisplay,
      subject: notificationData.title,
      message: notificationData.message,
      timestamp: format(new Date(), "dd/MM/yyyy - hh:mm a"),
    };
    setSentNotifications((prev) => [newNotification, ...prev]);
    setIsCreateModalOpen(false);
    if (activeTab !== "sent") {
      setActiveTab("sent");
      setSelectedIds(new Set());
    }
    alert("Đã gửi thông báo mới (mock data)!");
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
        drivers={mockDrivers} // Truyền mock drivers
        parents={mockParents} // 6. Truyền mock parents
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
              {notificationsToShow.length > 0 ? (
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
