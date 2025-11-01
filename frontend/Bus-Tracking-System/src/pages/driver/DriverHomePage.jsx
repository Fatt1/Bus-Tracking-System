import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // Import api instance với token support
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuth, getFullName } from "../../utils/auth";
import { useNotification } from "../../context/NotificationContext";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import DriverMapComponent from "../../components/driver/DriverMapComponent";
import {
  startPickupTrip,
  startDropoffTrip,
  isPickupTripCompleted,
  isDropoffTripCompleted,
  getCurrentTripType,
  TRIP_TYPE,
  saveCurrentScheduleId,
  getCurrentScheduleId,
  resetAllTripState,
} from "../../utils/tripStateManager";
import BusSimulationManager from "../../utils/BusSimulationManager";
import "./DriverHomePage.css";
import {
  FaHome,
  FaTasks,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
  FaTimes,
  FaBus,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaSpinner, // Thêm icon loading
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { format } from "date-fns"; // Thêm date-fns
import { vi } from "date-fns/locale"; // Thêm locale tiếng Việt
import { useTranslation } from "react-i18next"; // Import i18n
import LanguageSwitcher from "../../components/LanguageSwitcher"; // Import Language Switcher

// --- DỮ LIỆU MẪU CHO TÀI XẾ (SAU NÀY SẼ LẤY TỪ API) ---
const mockDriverProfile = {
  firstName: "Phan Viết",
  lastName: "Huy",
  avatarUrl: "https://i.pravatar.cc/150?u=driver1",
  birthDate: "2005-03-10", // Format YYYY-MM-DD
  gender: "Nam", // "Nam" hoặc "Nữ"
  phone: "0987654321",
  email: "huy@gmail.com",
  address: "196 Hoàng Diệu Phường 8 Quận 4 TPHCM",
};

// --- COMPONENT MODAL THÔNG TIN CÁ NHÂN (MỚI) ---
const DriverProfileModal = ({ isOpen, onClose, driver }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  // Giả lập, sau này sẽ là form cho phép chỉnh sửa
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đã xác nhận (chưa có chức năng sửa)");
    onClose();
  };

  return (
    <div className="driver-modal-overlay" onClick={onClose}>
      <div
        className="driver-modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="driver-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Cột trái: Avatar và Tên */}
          <div className="profile-left-column">
            <img
              src={driver.avatarUrl}
              alt="Avatar"
              className="profile-avatar-large"
            />
            <h3>{`${driver.firstName} ${driver.lastName}`}</h3>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="profile-right-column">
            <section className="profile-section">
              <h4>{t("driverApp.profile.title")}</h4>
              <div className="form-group">
                <label htmlFor="fullName">{t("driverApp.profile.fullName")}</label>
                <input
                  type="text"
                  id="fullName"
                  value={`${driver.firstName} ${driver.lastName}`}
                  readOnly
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate">{t("driverApp.profile.dateOfBirth")}</label>
                  {/* Hiển thị ngày sinh đã format, input date hơi xấu */}
                  <div className="date-input-with-icon">
                    <input
                      type="text"
                      id="birthDate"
                      value={driver.birthDate.split("-").reverse().join("/")}
                      readOnly
                    />
                    <FaCalendarAlt className="icon" />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("driverApp.profile.gender")}</label>
                  <div className="gender-options">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={driver.gender === "Nam"}
                        readOnly
                      />{" "}
                      {t("common.male")}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={driver.gender === "Nữ"}
                        readOnly
                      />{" "}
                      {t("common.female")}
                    </label>
                    {/* <label>
                                            <input type="radio" name="gender" value="Khác" checked={driver.gender === 'Khác'} readOnly /> Khác
                                        </label> */}
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h4>{t("driverApp.profile.phoneNumber")} & {t("driverApp.profile.address")}</h4>
              <div className="form-group">
                <label htmlFor="phone">{t("driverApp.profile.phoneNumber")}</label>
                <input type="text" id="phone" value={driver.phone} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t("driverApp.profile.email")}</label>
                <input type="text" id="email" value={driver.email} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="address">{t("driverApp.profile.address")}</label>
                <input
                  type="text"
                  id="address"
                  value={driver.address}
                  readOnly
                />
              </div>
            </section>
          </div>

          {/* Nút bấm (nằm ngoài 2 cột) */}
          <div className="profile-form-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              {t("driverApp.profile.cancel")}
            </button>
            <button type="submit" className="action-btn-form confirm-btn">
              {t("driverApp.profile.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT SIDEBAR CỦA TÀI XẾ ---
const DriverSidebar = ({ t }) => {
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
              <FaHome /> {t("driverApp.sidebar.home")}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              <FaTasks /> {t("driverApp.sidebar.schedule")}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/students") ? "active" : ""
            }
          >
            <Link to="/driver/students">
              <FaUserCheck /> {t("driverApp.sidebar.students")}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/notifications") ? "active" : ""
            }
          >
            <Link to="/driver/notifications">
              <FaBell /> {t("driverApp.sidebar.notifications")}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

// --- COMPONENT HEADER CỦA TÀI XẾ ---
const DriverHeader = ({
  onReportIncident,
  onProfileClick,
  onLogout,
  driverName = "Phan Viết Huy",
  unreadCount = 0,
  onNotificationClick,
  isSignalRConnected = false,
  t,
}) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>{t("driverApp.header.page")}</span> / <span>{t("driverApp.home.breadcrumb")}</span>
        {/* SignalR Connection Status Indicator */}
        <span
          style={{
            marginLeft: "10px",
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: isSignalRConnected ? "#4caf50" : "#f44336",
            animation: isSignalRConnected ? "none" : "blink 1s infinite",
          }}
          title={
            isSignalRConnected
              ? "SignalR Connected ✓"
              : "SignalR Disconnected ✗"
          }
        />
      </div>
      <div className="driver-header-actions">
        <button className="report-incident-btn" onClick={onReportIncident}>
          <FaExclamationTriangle />
          <span>{t("driverApp.header.reportIncident")}</span>
        </button>
        <div
          className="notification-bell-wrapper"
          onClick={onNotificationClick}
        >
          <FaBell size={24} className="notification-bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <input
          type="text"
          placeholder={t("driverApp.header.searchPlaceholder")}
          className="driver-search-input"
        />
        <LanguageSwitcher />
        <div
          className="driver-user-info"
          onClick={onProfileClick}
          title={t("driverApp.header.viewProfile")}
        >
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
        <button className="driver-logout-btn" onClick={onLogout}>
          {t("driverApp.header.logout")}
        </button>
      </div>
    </header>
  );
};

// --- COMPONENT CHÍNH TRANG CHỦ TÀI XẾ ---
const DriverHomePage = () => {
  const { t } = useTranslation();
  const { unreadCount, isSignalRConnected } = useNotification();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States cho việc lái xe
  const [isDrivingPickup, setIsDrivingPickup] = useState(false);
  const [isDrivingDropoff, setIsDrivingDropoff] = useState(false);

  // States để lưu completion status từ database history
  const [pickupHistoryExists, setPickupHistoryExists] = useState(false);
  const [dropoffHistoryExists, setDropoffHistoryExists] = useState(false);

  const navigate = useNavigate();

  const fullName =
    getFullName() ||
    `${mockDriverProfile.firstName} ${mockDriverProfile.lastName}`;

  // ⚠️ NEW: Hàm check xem chuyến đi có history không
  const checkTripHistory = async (scheduleId, direction) => {
    try {
      console.log(
        `🔍 Checking history for schedule ${scheduleId}, direction: ${direction}`
      );
      const response = await api.get(
        `/api/v1/schedule/${scheduleId}/cheking-history?direction=${direction}`
      );

      // Nếu có StudentCheckingHistories → chuyến đi đã hoàn thành
      const hasHistory =
        response.data &&
        response.data.studentCheckingHistories &&
        response.data.studentCheckingHistories.length > 0;

      console.log(
        `  ${direction === 1 ? "Pickup" : "Dropoff"} history exists:`,
        hasHistory,
        `(${response.data?.studentCheckingHistories?.length || 0} records)`
      );

      return hasHistory;
    } catch (err) {
      console.error(`Error checking history for direction ${direction}:`, err);
      // Nếu lỗi 404 hoặc không có data → không có history
      return false;
    }
  };

  // Hàm gọi API lấy schedule hôm nay
  const fetchScheduleToday = async () => {
    console.log("=== Fetching schedule for today ===");
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/driver/schedule-today");
      console.log("Schedule API response:", response.data);

      // Nếu trả về string "You have no schedule for today."
      if (typeof response.data === "string") {
        console.log("No schedule today");
        setScheduleData(null);
        setPickupHistoryExists(false);
        setDropoffHistoryExists(false);
      } else {
        // Có schedule
        console.log("✅ Schedule loaded:", response.data.scheduleId);
        setScheduleData(response.data);

        // ⚠️ CRITICAL: Check history cho cả 2 chuyến
        const scheduleId = response.data.scheduleId;

        // Check pickup history (Outbound = 1)
        const hasPickupHistory = await checkTripHistory(scheduleId, 1);
        setPickupHistoryExists(hasPickupHistory);

        // Check dropoff history (Inbound = 2)
        const hasDropoffHistory = await checkTripHistory(scheduleId, 2);
        setDropoffHistoryExists(hasDropoffHistory);

        console.log("📊 History check results:");
        console.log("  - Pickup completed (from DB):", hasPickupHistory);
        console.log("  - Dropoff completed (from DB):", hasDropoffHistory);

        // ❌ KHÔNG save scheduleId ở đây - chỉ save khi driver bấm "Bắt đầu chuyến đi"
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch trình hôm nay:", err);
      setError("Không thể tải lịch trình. Vui lòng thử lại.");
      setScheduleData(null);
      setPickupHistoryExists(false);
      setDropoffHistoryExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để fetch data khi component mount
  useEffect(() => {
    console.log("=== DriverHomePage mounted ===");
    fetchScheduleToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // useEffect riêng để sync state SAU KHI có scheduleData
  useEffect(() => {
    if (!scheduleData) {
      console.log("⏳ Waiting for scheduleData...");
      return;
    }

    console.log("=== Syncing trip state with localStorage ===");
    console.log("📊 Database history status:");
    console.log("  - Pickup history exists:", pickupHistoryExists);
    console.log("  - Dropoff history exists:", dropoffHistoryExists);

    // ⚠️ CRITICAL: Nếu CẢ 2 chuyến đều có history → Schedule hoàn toàn completed
    // → CLEAR tất cả state, KHÔNG CHO phép resume
    if (pickupHistoryExists && dropoffHistoryExists) {
      console.log(
        "✅ Both trips completed (history exists) - clearing all trip state và map localStorage"
      );
      resetAllTripState();
      setIsDrivingPickup(false);
      setIsDrivingDropoff(false);

      // CRITICAL: Clear localStorage của map component để không resume trip
      const pickupProgressKey = `busRouteProgress_${scheduleData.busId}_pickup`;
      const pickupCoordsKey = `busRouteCoords_${scheduleData.busId}_pickup`;
      const dropoffProgressKey = `busRouteProgress_${scheduleData.busId}_dropoff`;
      const dropoffCoordsKey = `busRouteCoords_${scheduleData.busId}_dropoff`;

      localStorage.removeItem(pickupProgressKey);
      localStorage.removeItem(pickupCoordsKey);
      localStorage.removeItem(dropoffProgressKey);
      localStorage.removeItem(dropoffCoordsKey);

      console.log("🧹 Cleared all localStorage for completed schedule");
      return;
    }

    // Lấy scheduleId từ localStorage
    const savedScheduleId = getCurrentScheduleId();
    console.log(
      "📋 Saved scheduleId:",
      savedScheduleId,
      typeof savedScheduleId
    );
    console.log(
      "📋 Current scheduleId:",
      scheduleData.scheduleId,
      typeof scheduleData.scheduleId
    );

    // Nếu scheduleId khác nhau (ngày mới / session mới) → CLEAR state
    if (savedScheduleId && savedScheduleId !== scheduleData.scheduleId) {
      console.log("⚠️ Different schedule detected! Clearing old trip state...");
      resetAllTripState();
      setIsDrivingPickup(false);
      setIsDrivingDropoff(false);
      return;
    }

    // Nếu chưa có scheduleId trong localStorage → đây là session mới
    if (!savedScheduleId) {
      console.log("🆕 New session - clearing any old state");
      resetAllTripState();
      setIsDrivingPickup(false);
      setIsDrivingDropoff(false);
      return;
    }

    // Schedule ID match → sync state từ localStorage (nếu chưa có history)
    const tripType = getCurrentTripType();
    console.log("📍 Current trip type from localStorage:", tripType);

    if (tripType === TRIP_TYPE.PICKUP && !pickupHistoryExists) {
      console.log("✅ Syncing state: isDrivingPickup = true (no history yet)");
      setIsDrivingPickup(true);
      setIsDrivingDropoff(false);
    } else if (tripType === TRIP_TYPE.DROPOFF && !dropoffHistoryExists) {
      console.log("✅ Syncing state: isDrivingDropoff = true (no history yet)");
      setIsDrivingPickup(false);
      setIsDrivingDropoff(true);
    } else {
      console.log("⭕ No active trip or trip already has history");
      setIsDrivingPickup(false);
      setIsDrivingDropoff(false);
    }
  }, [scheduleData, pickupHistoryExists, dropoffHistoryExists]); // Chạy khi có thay đổi

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

  // Hàm format thời gian từ "HH:mm:ss" sang "HH:mm"
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString.substring(0, 5); // Lấy HH:mm
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // dateString format: "YYYY-MM-DD"
      const [year, month, day] = dateString.split("-");
      const date = new Date(year, month - 1, day);
      return format(date, "EEEE, 'Ngày' dd 'tháng' MM 'năm' yyyy", {
        locale: vi,
      });
    } catch {
      return dateString;
    }
  };

  // Logic kiểm tra trạng thái và nút
  const getTripStatus = () => {
    if (!scheduleData) {
      return {
        pickupStatus: "waiting",
        dropoffStatus: "waiting",
        pickupText: t("driverApp.home.statusPending"),
        dropoffText: t("driverApp.home.statusPending"),
        morningActive: false,
        afternoonActive: false,
      };
    }

    console.log("🔍 getTripStatus:");
    console.log("  - Pickup history exists (DB):", pickupHistoryExists);
    console.log("  - Dropoff history exists (DB):", dropoffHistoryExists);
    console.log("  - isDrivingPickup:", isDrivingPickup);
    console.log("  - isDrivingDropoff:", isDrivingDropoff);

    // Kiểm tra localStorage (chỉ dùng khi database không có history)
    const pickupCompletedLocal = isPickupTripCompleted();
    const dropoffCompletedLocal = isDropoffTripCompleted();
    console.log("  - Pickup completed (localStorage):", pickupCompletedLocal);
    console.log("  - Dropoff completed (localStorage):", dropoffCompletedLocal);

    // Xác định trạng thái chuyến đi (sáng)
    let pickupStatus, pickupText;
    if (pickupHistoryExists) {
      pickupStatus = "completed";
      pickupText = t("driverApp.home.statusCompleted");
    } else if (pickupCompletedLocal) {
      pickupStatus = "completed";
      pickupText = t("driverApp.home.statusCompleted");
    } else if (isDrivingPickup) {
      pickupStatus = "in-progress";
      pickupText = t("driverApp.home.statusInProgress");
    } else {
      pickupStatus = "ready";
      pickupText = t("driverApp.home.statusReady");
    }

    // Xác định trạng thái chuyến về (chiều)
    let dropoffStatus, dropoffText;
    if (dropoffHistoryExists) {
      dropoffStatus = "completed";
      dropoffText = t("driverApp.home.statusCompleted");
    } else if (dropoffCompletedLocal) {
      dropoffStatus = "completed";
      dropoffText = t("driverApp.home.statusCompleted");
    } else if (isDrivingDropoff) {
      dropoffStatus = "in-progress";
      dropoffText = t("driverApp.home.statusInProgress");
    } else if (!pickupHistoryExists && !pickupCompletedLocal) {
      dropoffStatus = "waiting";
      dropoffText = t("driverApp.home.statusPending");
    } else {
      dropoffStatus = "ready";
      dropoffText = t("driverApp.home.statusReady");
    }

    // ⚠️ Chuyến sáng active nếu:
    // - Database KHÔNG có pickup history
    // - LocalStorage KHÔNG có pickup completed
    // - Chưa đang lái
    const morningActive =
      !pickupHistoryExists && !pickupCompletedLocal && !isDrivingPickup;

    // ⚠️ Chuyến chiều active nếu:
    // - Database KHÔNG có dropoff history
    // - LocalStorage KHÔNG có dropoff completed
    // - Chưa đang lái
    // - ĐÃ hoàn thành chuyến đi (database có pickup history HOẶC localStorage có pickup completed)
    const afternoonActive =
      !dropoffHistoryExists &&
      !dropoffCompletedLocal &&
      !isDrivingDropoff &&
      (pickupHistoryExists || pickupCompletedLocal);

    console.log("  - Pickup status:", pickupStatus, "-", pickupText);
    console.log("  - Dropoff status:", dropoffStatus, "-", dropoffText);
    console.log("  - Morning button active:", morningActive);
    console.log("  - Afternoon button active:", afternoonActive);

    return {
      pickupStatus,
      dropoffStatus,
      pickupText,
      dropoffText,
      morningActive,
      afternoonActive,
    };
  };

  const tripStatus = getTripStatus();

  return (
    <div className="driver-page-container">
      {/* Modal báo cáo sự cố */}
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      {/* Modal thông tin cá nhân (MỚI) */}
      <DriverProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        driver={mockDriverProfile} // Truyền dữ liệu mẫu
      />

      {/* Sidebar */}
      <DriverSidebar t={t} />

      {/* Khu vực nội dung chính */}
      <div className="driver-main-wrapper">
        <DriverHeader
          onReportIncident={() => setIsIncidentModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
          driverName={fullName}
          unreadCount={unreadCount}
          onNotificationClick={() => navigate("/driver/notifications")}
          isSignalRConnected={isSignalRConnected}
          t={t}
        />

        <main className="driver-main-content">
          {isLoading ? (
            <div className="loading-message">
              <FaSpinner className="spinner" />{" "}
              {t("driver.home.loadingSchedule")}
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : !scheduleData ? (
            <div className="no-schedule-message">
              <FaCalendarAlt size={50} />
              <p>{t("driverApp.home.noSchedule")}</p>
            </div>
          ) : (
            <>
              <section className="driver-welcome-section">
                <div className="driver-info-card">
                  <img src={mockDriverProfile.avatarUrl} alt="Driver Avatar" />
                  <div className="driver-details">
                    <p>{t("driverApp.home.driver")}:</p>
                    <h3>{fullName}</h3>
                    <span>
                      {t("driverApp.home.bus")}:{" "}
                      <strong>{scheduleData.busName || "N/A"}</strong>
                    </span>
                  </div>
                </div>
                <div className="driver-greeting-card">
                  <p>
                    {t("driverApp.home.greeting")}, <strong>{fullName}</strong>!{" "}
                    {t("driverApp.home.todaySchedule")}{" "}
                    <strong>{scheduleData.routeDTO?.routeName || "N/A"}</strong>.{" "}
                    {t("driverApp.home.haveASafeTrip")}
                  </p>
                </div>
              </section>

              <section className="driver-schedule-section">
                <div className="schedule-list">
                  <h4>{t("driverApp.home.todaySchedule")}</h4>
                  <p className="schedule-date">
                    {formatDate(scheduleData.scheduleDate)}
                  </p>

                  {/* CHUYẾN ĐI (Sáng) */}
                  <div className="schedule-card morning-card">
                    <div className="schedule-card-icon">
                      <FaBus size={24} />
                    </div>
                    <div className="schedule-card-info">
                      <h4>
                        {scheduleData.routeDTO?.routeName || "N/A"}
                      </h4>
                      <p>
                        {t("driverApp.home.bus")}: {scheduleData.busName}
                      </p>
                      <span>
                        {t("driverApp.home.departure")}:{" "}
                        {formatTime(scheduleData.pickupTime)}
                      </span>
                    </div>
                    <div className="schedule-card-details">
                      <h3>{t("driverApp.home.morningTrip")}</h3>
                      <p>
                        {t("common.status")}:{" "}
                        <span className={`status-${tripStatus.pickupStatus}`}>
                          {tripStatus.pickupText}
                        </span>
                      </p>
                      <p>
                        {t("driverApp.home.studentsToPickup")}:{" "}
                        {scheduleData.totalStudents || 0} {t("driverApp.home.students")}
                      </p>
                    </div>
                    <button
                      className={`start-trip-btn ${
                        tripStatus.morningActive ? "active-btn" : "disabled-btn"
                      }`}
                      disabled={!tripStatus.morningActive || isDrivingPickup}
                      onClick={() => {
                        console.log("🚀 PICKUP TRIP STARTED");
                        console.log(
                          "  - Schedule ID:",
                          scheduleData.scheduleId
                        );
                        console.log("  - Saving schedule ID to localStorage");
                        saveCurrentScheduleId(scheduleData.scheduleId);
                        setIsDrivingPickup(true);
                        startPickupTrip();
                        BusSimulationManager.startSimulation({
                          busId: scheduleData.busId,
                          route: scheduleData.routeDTO,
                          tripType: "pickup",
                        });
                        console.log(
                          "  - BusSimulationManager started (pickup)"
                        );
                        console.log(
                          "  - localStorage after start:",
                          localStorage
                        );
                      }}
                    >
                      {isDrivingPickup
                        ? t("driverApp.home.running")
                        : t("driverApp.home.startTrip")}
                    </button>
                  </div>

                  {/* CHUYẾN VỀ (Chiều) */}
                  <div className="schedule-card afternoon-card">
                    <div className="schedule-card-icon">
                      <FaBus size={24} />
                    </div>
                    <div className="schedule-card-info">
                      <h4>
                        {scheduleData.routeDTO?.routeName || "N/A"}
                      </h4>
                      <p>
                        {t("driverApp.home.bus")}: {scheduleData.busName}
                      </p>
                      <span>
                        {t("driverApp.home.departure")}:{" "}
                        {formatTime(scheduleData.dropOffTime)}
                      </span>
                    </div>
                    <div className="schedule-card-details">
                      <h3>{t("driverApp.home.afternoonReturn")}</h3>
                      <p>
                        {t("common.status")}:{" "}
                        <span className={`status-${tripStatus.dropoffStatus}`}>
                          {tripStatus.dropoffText}
                        </span>
                      </p>
                      <p>
                        {t("driverApp.home.studentsToPickup")}:{" "}
                        {scheduleData.totalStudents || 0} {t("driverApp.home.students")}
                      </p>
                    </div>
                    <button
                      className={`start-trip-btn ${
                        tripStatus.afternoonActive
                          ? "active-btn"
                          : "disabled-btn"
                      }`}
                      disabled={!tripStatus.afternoonActive || isDrivingDropoff}
                      onClick={() => {
                        console.log("🚀 DROPOFF TRIP STARTED");
                        console.log(
                          "  - Schedule ID:",
                          scheduleData.scheduleId
                        );
                        console.log("  - Saving schedule ID to localStorage");
                        saveCurrentScheduleId(scheduleData.scheduleId);
                        setIsDrivingDropoff(true);
                        startDropoffTrip();
                        BusSimulationManager.startSimulation({
                          busId: scheduleData.busId,
                          route: scheduleData.routeDTO,
                          tripType: "dropoff",
                        });
                        console.log(
                          "  - BusSimulationManager started (dropoff)"
                        );
                        console.log(
                          "  - localStorage after start:",
                          localStorage
                        );
                      }}
                    >
                      {isDrivingDropoff
                        ? t("driverApp.home.running")
                        : t("driverApp.home.startTrip")}
                    </button>
                  </div>
                </div>

                <div className="driver-map-container">
                  {scheduleData && scheduleData.routeDTO ? (
                    <DriverMapComponent
                      busId={scheduleData.busId}
                      route={{
                        stopPoints: scheduleData.routeDTO.stopPoints.map(
                          (sp) => ({
                            sequenceOrder: sp.sequenceOrder,
                            latitude: sp.latitude,
                            longitude: sp.longitude,
                            pointName:
                              sp.pointName || `Điểm ${sp.sequenceOrder}`,
                          })
                        ),
                      }}
                      tripType={
                        isDrivingPickup
                          ? "pickup"
                          : isDrivingDropoff
                          ? "dropoff"
                          : "pickup"
                      }
                    />
                  ) : (
                    <div className="driver-map-placeholder">
                      <FaMapMarkedAlt size={50} />
                      <span>{t("driver.home.noRouteData")}</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverHomePage;
