import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { getFullName } from "../../utils/auth";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import { FiUser, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { FaBus, FaSpinner } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import "./ParentHomePage.css";

const ParentHomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get parent name from sessionStorage
  const parentName = getFullName() || t("parent.home.parent");

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
        <ParentHeader
          breadcrumbs={`${t("common.page")} / ${t("common.home")}`}
          parentName={parentName}
        />

        <main className="parent-main-content">
          <h1 className="parent-welcome-title">{t("parent.home.welcome")}</h1>

          {isLoading ? (
            <div className="parent-loading-message">
              <FaSpinner className="spinner" />{" "}
              {t("parent.home.loadingSchedule")}
            </div>
          ) : error ? (
            <div className="parent-error-message">{error}</div>
          ) : !scheduleData ? (
            <div className="parent-no-schedule-message">
              <FiCalendar size={50} />
              <p>{t("parent.home.noSchedule")}</p>
            </div>
          ) : (
            <div className="parent-content-wrapper">
              {/* Schedule Card */}
              <div className="parent-schedule-card">
                <h2>{t("parent.home.childSchedule")}</h2>
                <p className="parent-date-subtitle">
                  {formatDate(scheduleData.scheduleDate)}
                </p>

                <div className="parent-schedule-details">
                  <div className="parent-trip-info">
                    <h4>
                      <FiMapPin /> {t("parent.home.tripInfo")}
                    </h4>
                    <p>
                      <strong>{t("parent.home.route")}:</strong>{" "}
                      {scheduleData.routeName || "N/A"}
                    </p>
                    <p>
                      <strong>{t("parent.home.pickupDropoff")}:</strong>{" "}
                      {scheduleData.stopPointName || "N/A"}
                    </p>
                  </div>

                  <div className="parent-driver-info">
                    <h4>
                      <FiClock /> {t("parent.home.driverInfo")}
                    </h4>
                    <p>
                      <strong>{t("parent.home.driver")}:</strong>{" "}
                      {scheduleData.driverName || "N/A"}
                    </p>
                    <p>
                      <strong>{t("parent.home.bus")}:</strong>{" "}
                      {scheduleData.busName || "N/A"}
                    </p>
                    <p>
                      <strong>{t("parent.home.pickup")}:</strong>{" "}
                      {formatTime(scheduleData.pickupTime)}
                    </p>
                    <p>
                      <strong>{t("parent.home.dropoff")}:</strong>{" "}
                      {formatTime(scheduleData.dropOffTime)}
                    </p>
                  </div>
                </div>

                <button
                  className="parent-track-button"
                  onClick={handleTrackBus}
                >
                  <FaBus /> {t("parent.home.trackBus")}
                </button>
              </div>

              {/* Profile Info */}
              <div className="parent-profile-info">
                <FiUser className="parent-profile-icon" />
                <p className="parent-profile-name">
                  {t("parent.home.parent")}: {parentName}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentHomePage;
