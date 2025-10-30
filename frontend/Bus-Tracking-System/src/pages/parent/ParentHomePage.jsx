import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import { FiUser, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { FaBus, FaSpinner } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./ParentHomePage.css";

const ParentHomePage = () => {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get parent name from localStorage
  const parentName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    "Phụ Huynh";

  // Fetch schedule today
  useEffect(() => {
    const fetchScheduleToday = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/v1/student/schedule-today");
        console.log("Parent schedule response:", response.data);

        if (typeof response.data === "string") {
          // No schedule today
          setScheduleData(null);
        } else {
          setScheduleData(response.data);
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Không thể tải lịch trình. Vui lòng thử lại.");
        setScheduleData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleToday();
  }, []);

  // Format time from "HH:mm:ss" to "HH:mm"
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString.substring(0, 5);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const [year, month, day] = dateString.split("-");
      const date = new Date(year, month - 1, day);
      return format(date, "EEEE, 'Ngày' dd 'tháng' MM 'năm' yyyy", {
        locale: vi,
      });
    } catch {
      return dateString;
    }
  };

  // Handle track bus button
  const handleTrackBus = () => {
    navigate("/parent/map");
  };

  return (
    <div className="parent-page-container">
      <ParentSidebar />

      <div className="parent-main-wrapper">
        <ParentHeader breadcrumbs="Trang / Trang chủ" parentName={parentName} />

        <main className="parent-main-content">
          <h1 className="parent-welcome-title">CHÀO MỪNG!</h1>

          {isLoading ? (
            <div className="parent-loading-message">
              <FaSpinner className="spinner" /> Đang tải lịch trình...
            </div>
          ) : error ? (
            <div className="parent-error-message">{error}</div>
          ) : !scheduleData ? (
            <div className="parent-no-schedule-message">
              <FiCalendar size={50} />
              <p>Con bạn không có lịch trình cho hôm nay.</p>
            </div>
          ) : (
            <div className="parent-content-wrapper">
              {/* Schedule Card */}
              <div className="parent-schedule-card">
                <h2>Lịch trình của con hôm nay</h2>
                <p className="parent-date-subtitle">
                  {formatDate(scheduleData.scheduleDate)}
                </p>

                <div className="parent-schedule-details">
                  <div className="parent-trip-info">
                    <h4>
                      <FiMapPin /> Thông tin chuyến đi
                    </h4>
                    <p>
                      <strong>Tuyến:</strong> {scheduleData.routeName || "N/A"}
                    </p>
                    <p>
                      <strong>Đón và trả học sinh tại:</strong>{" "}
                      {scheduleData.stopPointName || "N/A"}
                    </p>
                  </div>

                  <div className="parent-driver-info">
                    <h4>
                      <FiClock /> Thông tin tài xế và thời gian
                    </h4>
                    <p>
                      <strong>Tài xế:</strong>{" "}
                      {scheduleData.driverName || "N/A"}
                    </p>
                    <p>
                      <strong>Xe:</strong> {scheduleData.busName || "N/A"}
                    </p>
                    <p>
                      <strong>Đi:</strong> {formatTime(scheduleData.pickupTime)}
                    </p>
                    <p>
                      <strong>Về:</strong>{" "}
                      {formatTime(scheduleData.dropOffTime)}
                    </p>
                  </div>
                </div>

                <button
                  className="parent-track-button"
                  onClick={handleTrackBus}
                >
                  <FaBus /> Theo dõi vị trí xe buýt
                </button>
              </div>

              {/* Profile Info */}
              <div className="parent-profile-info">
                <FiUser className="parent-profile-icon" />
                <p className="parent-profile-name">Phụ huynh: {parentName}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentHomePage;
