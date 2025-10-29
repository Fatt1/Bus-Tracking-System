import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAuth } from "../../utils/auth";
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
// removed unused format import

// --- DEMO DATA ---
const mockDriverSent = Array.from({ length: 3 }, (_, i) => ({
  id: `sent_${i + 1}`,
  type: "sent",
  recipient: "Admin - Trần Chính Thành",
  subject: `Báo cáo sự cố ${i + 1}: Sự cố kỹ thuật`,
  message: `Nội dung chi tiết báo cáo sự cố kỹ thuật xe B001...`,
  timestamp: `09/10/2025 - ${String(9 + i).padStart(2, "0")}:15 AM`,
}));

const mockDriverInbox = Array.from({ length: 8 }, (_, i) => ({
  id: `inbox_${i + 1}`,
  type: "inbox",
  sender: `Admin - Trần Chính Thành`,
  subject: `Thông báo ${i + 1}: Cập nhật lịch trình tuần sau`,
  message: `Nội dung thông báo chi tiết từ admin về việc cập nhật lịch...`,
  timestamp: `08/10/2025 - ${String(14 + i).padStart(2, "0")}:30 PM`,
}));

// --- END DEMO DATA ---

// --- COMPONENT SIDEBAR (Tương tự các trang driver khác) ---
const DriverSidebar = () => {
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
              <FaHome /> Trang chủ{" "}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              {" "}
              <FaTasks /> Lịch trình làm việc{" "}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/students") ? "active" : ""
            }
          >
            <Link to="/driver/students">
              {" "}
              <FaUserCheck /> Học sinh & điểm đón{" "}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/notifications") ? "active" : ""
            }
          >
            <Link to="/driver/notifications">
              {" "}
              <FaBell /> Thông báo{" "}
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
}) => {
  // Component này cũng cần state và logic để mở Profile Modal
  // Tạm thời chỉ là giao diện
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Thông báo</span>
      </div>
      <div className="driver-header-actions">
        <button className="report-incident-btn" onClick={onReportIncident}>
          <FaExclamationTriangle />
          <span>Báo cáo sự cố</span>
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="driver-search-input"
        />
        <div className="driver-user-info" title="Xem thông tin cá nhân">
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
        <button className="driver-logout-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
  if (!isOpen) return null;
  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content confirm-delete"
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
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH TRANG THÔNG BÁO ---
const DriverNotificationPage = () => {
  const [activeTab, setActiveTab] = useState("inbox"); // 'sent' hoặc 'inbox' (Bắt đầu bằng Thư đến)
  const [sentNotifications, setSentNotifications] = useState(mockDriverSent);
  const [inboxNotifications, setInboxNotifications] = useState(mockDriverInbox);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [itemToDelete, setItemToDelete] = useState(null); // {id, count}

  // Logic modal báo cáo sự cố (từ trang chủ)
  // (Bạn có thể thêm modal báo cáo sự cố sau này)
  const navigate = useNavigate();
  const fullName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    "Phan Viết Huy";

  const handleLogout = async () => {
    try {
      await axios.post("https://localhost:7229/api/v1/auth/logout", null, {
        withCredentials: true,
      });
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
    alert(`Đã xóa ${itemToDelete.count} thông báo (mock data)!`);
  };

  const changeTab = (tabName) => {
    if (activeTab !== tabName) {
      setActiveTab(tabName);
      setSelectedIds(new Set());
    }
  };

  return (
    <>
      {/* (Modal báo cáo sự cố và modal profile nếu bạn muốn import vào đây) */}
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
            onReportIncident={() =>
              alert("Mở modal báo cáo sự cố (chưa triển khai)")
            }
            driverName={fullName}
            onLogout={handleLogout}
          />

          <main className="driver-main-content">
            {/* CSS của trang này sẽ ghi đè padding mặc định của driver-main-content */}
            <div className="notification-page-driver">
              {/* Thanh tìm kiếm (Giống hình) */}
              <div className="notification-search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Tìm kiếm..." />
              </div>

              {/* Tabs */}
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

                {/* Nút Xóa hàng loạt */}
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => handleDeleteRequest(null)}
                    className="control-btn bulk-delete-btn"
                    title={`Xóa ${selectedIds.size} mục đã chọn`}
                  >
                    <FaTrashAlt /> Xóa ({selectedIds.size})
                  </button>
                )}
              </div>

              {/* Notification List Area */}
              <div className="notification-list-container">
                <div className="list-controls">
                  <div className="select-all-container">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={isAllSelected}
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
                                ? `Đến: ${noti.recipient}`
                                : `Từ: ${noti.sender}`}
                            </span>
                            <span className="subject">{noti.subject}</span>
                            <span className="message-preview">
                              {" "}
                              - {noti.message.substring(0, 50)}...
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
        </div>
      </div>
    </>
  );
};

export default DriverNotificationPage;
