import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaWrench,
  FaCarCrash,
  FaFirstAid,
  FaEllipsisH,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import "./ReportIncidentModal.css";

// Axios instance
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

const ReportIncidentModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Fetch admin users khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchAdminUsers();
    }
  }, [isOpen]);

  const fetchAdminUsers = async () => {
    console.log("=== Fetching admin users ===");
    setLoadingAdmins(true);
    try {
      const response = await api.get("/api/v1/user/all");
      console.log("All users response:", response.data);

      // Filter users có role "Admin"
      const admins = response.data.filter((user) =>
        user.roles.includes("Admin")
      );
      console.log("Admin users:", admins);
      setAdminUsers(admins);
    } catch (err) {
      console.error("Lỗi khi tải danh sách admin:", err);
      // Nếu lỗi, thử gửi cho tất cả users (fallback)
      setAdminUsers([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleOptionClick = async (option) => {
    console.log("=== Sending incident report ===");
    console.log("Option selected:", option);

    if (loadingAdmins) {
      alert("Đang tải danh sách admin, vui lòng đợi...");
      return;
    }

    if (adminUsers.length === 0) {
      alert("Không tìm thấy admin để gửi báo cáo. Vui lòng thử lại.");
      return;
    }

    setIsSubmitting(true);

    // Map option sang message
    const messageMap = {
      technical: "Sự cố kỹ thuật (Hỏng hóc, xịt lốp)",
      traffic: "Sự cố giao thông (Kẹt xe, tai nạn nhỏ)",
      medical: "Khẩn cấp y tế (Học sinh bị ốm)",
      other: "Khác",
    };

    const message = messageMap[option] || option;

    try {
      // Lấy tất cả userId của admin
      const adminUserIds = adminUsers.map((admin) => admin.userId);

      const payload = {
        toUserIds: adminUserIds,
        title: "Báo cáo sự cố",
        message: message,
        notificationType: option === "medical" ? 2 : 1, // 2 = Warning (y tế), 1 = Info (các loại khác)
      };

      console.log("Sending payload:", payload);

      await api.post("/api/v1/notificaton/send", payload);

      console.log("Report sent successfully!");
      alert("Đã gửi báo cáo sự cố thành công!");
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo:", err);
      alert(
        "Không thể gửi báo cáo sự cố. Vui lòng thử lại.\n" +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content report-incident-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="driver-modal-close-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <FaTimes />
        </button>

        <h3 className="modal-title">Báo cáo sự cố</h3>

        {loadingAdmins ? (
          <div className="loading-admins">
            <FaSpinner className="spinner" />
            <p>Đang tải...</p>
          </div>
        ) : isSubmitting ? (
          <div className="submitting-report">
            <FaSpinner className="spinner" />
            <p>Đang gửi báo cáo...</p>
          </div>
        ) : (
          <div className="incident-options-list">
            <button
              className="incident-option"
              onClick={() => handleOptionClick("technical")}
            >
              <FaWrench size={24} />
              <span>Sự cố kỹ thuật (Hỏng hóc, xịt lốp)</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("traffic")}
            >
              <FaCarCrash size={24} />
              <span>Sự cố giao thông (Kẹt xe, tai nạn nhỏ)</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("medical")}
            >
              <FaFirstAid size={24} />
              <span>Khẩn cấp y tế (Học sinh bị ốm)</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("other")}
            >
              <FaEllipsisH size={24} />
              <span>Khác</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIncidentModal;
