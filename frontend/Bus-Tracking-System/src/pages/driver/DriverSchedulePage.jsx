import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../utils/api"; // Import api instance với token support
import { clearAuth, getFullName } from "../../utils/auth";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import DriverSidebar from "../../components/driver/DriverSidebar";
import DriverHeader from "../../components/driver/DriverHeader";
import "./DriverSchedulePage.css"; // Sẽ tạo ở bước 2
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner, // Thêm spinner
} from "react-icons/fa";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  eachDayOfInterval,
  getISOWeek,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";

// --- COMPONENT CHÍNH TRANG LỊCH TRÌNH ---
const DriverSchedulePage = () => {
  const { t, i18n } = useTranslation();
  // State để lưu ngày đầu tiên của tuần đang xem
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]); // Lưu schedule từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const navigate = useNavigate();
  const fullName = getFullName() || "Phan Viết Huy";

  // Hàm gọi API lấy schedule theo tuần
  const fetchScheduleByWeek = async (date) => {
    console.log("=== Fetching schedule for week containing date:", date, "===");
    console.log("Current driver fullName from localStorage:", fullName);
    setIsLoading(true);
    setError(null);
    try {
      // Format date thành YYYY-MM-DD
      const dateString = format(date, "yyyy-MM-dd");
      console.log("Calling API with DateInWeek:", dateString);

      const response = await api.get("/api/v1/schedule/all", {
        params: { DateInWeek: dateString },
      });
      console.log("=== Schedule API full response ===");
      console.log("Total schedules returned:", response.data?.length || 0);
      console.log("All schedules:", response.data);

      // Filter schedules theo tên driver hiện tại
      const driverSchedules = Array.isArray(response.data)
        ? response.data.filter((schedule) => {
            console.log(
              `Comparing: schedule.driverName="${schedule.driverName}" vs fullName="${fullName}"`
            );
            return schedule.driverName === fullName;
          })
        : [];

      console.log("=== Filtered driver schedules ===");
      console.log("Count:", driverSchedules.length);
      console.log("Data:", driverSchedules);
      setScheduleData(driverSchedules);
    } catch (err) {
      console.error("Lỗi khi tải lịch trình tuần:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError(t("driverApp.schedule.error"));
      setScheduleData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để fetch data khi currentDate thay đổi
  useEffect(() => {
    fetchScheduleByWeek(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]); // Chỉ chạy khi currentDate thay đổi

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

  // Tính toán tuần
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Tuần bắt đầu từ Thứ 2
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });

  // Lấy số tuần và tháng/năm
  const weekNumber = getISOWeek(currentDate);
  const monthYear = format(currentDate, "MM/yyyy");

  // Hàm chuyển tuần
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  // Hàm lấy schedule cho 1 ngày cụ thể
  const getScheduleForDay = (date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return scheduleData.filter((s) => s.scheduleDate === dateString);
  };

  // Mobile Day Card Component
  const DayScheduleCard = ({ day }) => {
    const schedulesForDay = getScheduleForDay(day);
    const morningSchedule = schedulesForDay.find((s) => s.pickupTime);
    const afternoonSchedule = schedulesForDay.find((s) => s.dropOffTime);

    return (
      <div className="day-schedule-card">
        <div className="day-schedule-header">
          <h4>
            {format(day, "EEEE", {
              locale: i18n.language === "vi" ? vi : enUS,
            })}
          </h4>
          <span className="day-date">{format(day, "dd/MM/yyyy")}</span>
        </div>
        <div className="day-schedule-body">
          {/* Morning trip */}
          <div className={`trip-row ${morningSchedule ? "active" : "inactive"}`}>
            <div className="trip-label trip-am-label">
              {t("driverApp.schedule.dropOff")}
            </div>
            {morningSchedule ? (
              <div className="trip-details">
                <span className="trip-route">{morningSchedule.routeName}</span>
                <time className="trip-time">
                  {morningSchedule.pickupTime.substring(0, 5)}
                </time>
              </div>
            ) : (
              <span className="trip-empty">—</span>
            )}
          </div>
          {/* Afternoon trip */}
          <div className={`trip-row ${afternoonSchedule ? "active" : "inactive"}`}>
            <div className="trip-label trip-pm-label">
              {t("driverApp.schedule.pickUp")}
            </div>
            {afternoonSchedule ? (
              <div className="trip-details">
                <span className="trip-route">{afternoonSchedule.routeName}</span>
                <time className="trip-time">
                  {afternoonSchedule.dropOffTime.substring(0, 5)}
                </time>
              </div>
            ) : (
              <span className="trip-empty">—</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="driver-page-container">
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />
      <DriverSidebar />
      <div className="driver-main-wrapper">
        <DriverHeader
          onReportIncident={() => setIsIncidentModalOpen(true)}
          driverName={fullName}
          onLogout={handleLogout}
          breadcrumb={t("driverApp.schedule.breadcrumb")}
        />

        <main className="driver-main-content">
          {/* Header của bảng lịch trình */}
          <div className="driver-schedule-header">
            <div className="date-picker-group">
              <label>{t("driverApp.schedule.month")}</label>
              <div className="date-input-wrapper">
                <input type="text" value={monthYear} readOnly />
                <FaCalendarAlt className="icon" />
              </div>
            </div>
            <div className="week-nav">
              <button onClick={goToPrevWeek} className="week-nav-btn">
                <FaChevronLeft />
              </button>
              <span>
                {t("driverApp.schedule.week")} {weekNumber}
              </span>
              <button onClick={goToNextWeek} className="week-nav-btn">
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Loading và Error state */}
          {isLoading && (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>{t("driverApp.schedule.loading")}</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button
                onClick={() => fetchScheduleByWeek(currentDate)}
                className="retry-btn"
              >
                {t("driverApp.schedule.retry")}
              </button>
            </div>
          )}

          {/* Bảng Lịch trình - Desktop */}
          {!isLoading && !error && (
            <>
              <div className="schedule-table-container">
                <table className="schedule-table-driver">
                  <thead>
                    <tr>
                      <th>{t("driverApp.schedule.trip")}</th>
                      {daysInWeek.map((day) => (
                        <th key={day.toISOString()}>
                          {format(day, "EEEE", {
                            locale: i18n.language === "vi" ? vi : enUS,
                          })}{" "}
                          {/* Thứ */}
                          <div>{format(day, "dd/MM")}</div> {/* Ngày */}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Hàng Chuyến đi (Sáng - pickupTime) */}
                    <tr>
                      <td className="trip-type-header">
                        {t("driverApp.schedule.dropOff")}
                      </td>
                      {daysInWeek.map((day) => {
                        const schedulesForDay = getScheduleForDay(day);
                        // Lấy schedule có pickupTime (chuyến sáng)
                        const morningSchedule = schedulesForDay.find(
                          (s) => s.pickupTime
                        );
                        return (
                          <td
                            key={`${day.toISOString()}-morning`}
                            className={`trip-cell ${
                              morningSchedule ? "active" : "inactive"
                            }`}
                          >
                            {morningSchedule ? (
                              <div className="trip-info trip-am">
                                <span>{morningSchedule.routeName}</span>
                                <time>
                                  {morningSchedule.pickupTime.substring(0, 5)}
                                </time>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Hàng Chuyến về (Chiều - dropOffTime) */}
                    <tr>
                      <td className="trip-type-header">
                        {t("driverApp.schedule.pickUp")}
                      </td>
                      {daysInWeek.map((day) => {
                        const schedulesForDay = getScheduleForDay(day);
                        // Lấy schedule có dropOffTime (chuyến chiều)
                        const afternoonSchedule = schedulesForDay.find(
                          (s) => s.dropOffTime
                        );
                        return (
                          <td
                            key={`${day.toISOString()}-afternoon`}
                            className={`trip-cell ${
                              afternoonSchedule ? "active" : "inactive"
                            }`}
                          >
                            {afternoonSchedule ? (
                              <div className="trip-info trip-pm">
                                <span>{afternoonSchedule.routeName}</span>
                                <time>
                                  {afternoonSchedule.dropOffTime.substring(0, 5)}
                                </time>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="schedule-mobile-list">
                {daysInWeek.map((day) => (
                  <DayScheduleCard key={day.toISOString()} day={day} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverSchedulePage;
