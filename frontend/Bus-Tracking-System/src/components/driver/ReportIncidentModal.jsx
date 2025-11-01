import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api"; // Import api instance với token support
import { getCurrentUserId } from "../../utils/auth"; // Import để lấy current user ID
import { useNotification } from "../../context/NotificationContext"; // Import để mark as recently sent
import {
  FaWrench,
  FaCarCrash,
  FaFirstAid,
  FaEllipsisH,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import "./ReportIncidentModal.css";

const ReportIncidentModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const { markAsRecentlySent } = useNotification(); // Get function to mark notification

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
      const response = await api.get("/api/v1/user/admin");
      console.log("Admin users response:", response.data);
      setAdminUsers(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách admin:", err);
      setAdminUsers([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleOptionClick = async (option) => {
    console.log("=== Sending incident report ===");
    console.log("Option selected:", option);

    if (loadingAdmins) {
      alert(t("driverApp.incident.loadingAdmins"));
      return;
    }

    if (adminUsers.length === 0) {
      alert(t("driverApp.incident.noAdmins"));
      return;
    }

    setIsSubmitting(true);

    // Map option sang message
    const messageMap = {
      technical: t("driverApp.incident.technical"),
      traffic: t("driverApp.incident.traffic"),
      medical: t("driverApp.incident.medical"),
      other: t("driverApp.incident.other"),
    };

    const message = messageMap[option] || option;

    try {
      // Lấy tất cả userId của admin
      let adminUserIds = adminUsers.map((admin) => admin.userId);

      // Loại trừ chính bản thân (nếu current user là admin)
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        const senderIdStr = String(currentUserId).trim();
        adminUserIds = adminUserIds.filter(
          (id) => String(id).trim() !== senderIdStr
        );
        console.log("Filtered admin IDs (excluding sender):", adminUserIds);
      }

      const payload = {
        toUserIds: adminUserIds,
        title: t("driverApp.incident.title"),
        message: message,
        notificationType: option === "medical" ? 2 : 1, // 2 = Warning (y tế), 1 = Info (các loại khác)
      };

      console.log("Sending payload:", payload);

      await api.post("/api/v1/notificaton/send", payload);

      console.log("✅ Report sent successfully! Marking as recently sent...");

      // Mark this notification as recently sent to avoid showing toast to sender
      markAsRecentlySent(t("driverApp.incident.title"), message);

      console.log("Report sent successfully!");
      alert(t("driverApp.incident.success"));
      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo:", err);
      alert(
        t("driverApp.incident.error") +
          "\n" +
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

        <h3 className="modal-title">{t("driverApp.incident.title")}</h3>

        {loadingAdmins ? (
          <div className="loading-admins">
            <FaSpinner className="spinner" />
            <p>{t("driverApp.incident.loading")}</p>
          </div>
        ) : isSubmitting ? (
          <div className="submitting-report">
            <FaSpinner className="spinner" />
            <p>{t("driverApp.incident.sending")}</p>
          </div>
        ) : (
          <div className="incident-options-list">
            <button
              className="incident-option"
              onClick={() => handleOptionClick("technical")}
            >
              <FaWrench size={24} />
              <span>{t("driverApp.incident.technical")}</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("traffic")}
            >
              <FaCarCrash size={24} />
              <span>{t("driverApp.incident.traffic")}</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("medical")}
            >
              <FaFirstAid size={24} />
              <span>{t("driverApp.incident.medical")}</span>
            </button>
            <button
              className="incident-option"
              onClick={() => handleOptionClick("other")}
            >
              <FaEllipsisH size={24} />
              <span>{t("driverApp.incident.other")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIncidentModal;
