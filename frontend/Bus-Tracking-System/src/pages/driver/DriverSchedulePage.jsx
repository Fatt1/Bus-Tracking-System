import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { clearAuth } from "../../utils/auth";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import "./DriverSchedulePage.css"; // Sẽ tạo ở bước 2
import {
  FaHome,
  FaTasks,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
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
import { vi } from "date-fns/locale"; // Import tiếng Việt

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

// --- COMPONENT SIDEBAR CỦA TÀI XẾ ---
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

// --- COMPONENT HEADER CỦA TÀI XẾ ---
const DriverHeader = ({ onReportIncident, driverName = "Phan Viết Huy", onLogout }) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Lịch trình làm việc</span>
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

// --- COMPONENT CHÍNH TRANG LỊCH TRÌNH ---
const DriverSchedulePage = () => {
  // State để lưu ngày đầu tiên của tuần đang xem
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]); // Lưu schedule từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const navigate = useNavigate();
  const fullName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    "Phan Viết Huy";

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
      setError("Không thể tải lịch trình. Vui lòng thử lại.");
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
        />

        <main className="driver-main-content">
          {/* Header của bảng lịch trình */}
          <div className="driver-schedule-header">
            <div className="date-picker-group">
              <label>Tháng</label>
              <div className="date-input-wrapper">
                <input type="text" value={monthYear} readOnly />
                <FaCalendarAlt className="icon" />
              </div>
            </div>
            <div className="week-nav">
              <button onClick={goToPrevWeek} className="week-nav-btn">
                <FaChevronLeft />
              </button>
              <span>Tuần {weekNumber}</span>
              <button onClick={goToNextWeek} className="week-nav-btn">
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Loading và Error state */}
          {isLoading && (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Đang tải lịch trình...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button
                onClick={() => fetchScheduleByWeek(currentDate)}
                className="retry-btn"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Bảng Lịch trình */}
          {!isLoading && !error && (
            <div className="schedule-table-container">
              <table className="schedule-table-driver">
                <thead>
                  <tr>
                    <th>Chuyến</th>
                    {daysInWeek.map((day) => (
                      <th key={day.toISOString()}>
                        {format(day, "EEEE", { locale: vi })} {/* Thứ */}
                        <div>{format(day, "dd/MM")}</div> {/* Ngày */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Hàng Chuyến đi (Sáng - pickupTime) */}
                  <tr>
                    <td className="trip-type-header">Đưa đi</td>
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
                    <td className="trip-type-header">Đón về</td>
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
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverSchedulePage;
