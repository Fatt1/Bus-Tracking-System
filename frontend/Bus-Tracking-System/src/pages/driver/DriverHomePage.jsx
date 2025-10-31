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
              <h4>Thông tin cá nhân</h4>
              <div className="form-group">
                <label htmlFor="fullName">Họ tên</label>
                <input
                  type="text"
                  id="fullName"
                  value={`${driver.firstName} ${driver.lastName}`}
                  readOnly
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate">Ngày sinh</label>
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
                  <label>Giới tính</label>
                  <div className="gender-options">
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={driver.gender === "Nam"}
                        readOnly
                      />{" "}
                      Nam
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={driver.gender === "Nữ"}
                        readOnly
                      />{" "}
                      Nữ
                    </label>
                    {/* <label>
                                            <input type="radio" name="gender" value="Khác" checked={driver.gender === 'Khác'} readOnly /> Khác
                                        </label> */}
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h4>Thông tin liên hệ & địa chỉ</h4>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input type="text" id="phone" value={driver.phone} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="text" id="email" value={driver.email} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
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

// --- COMPONENT SIDEBAR CỦA TÀI XẾ (Cập nhật: Dùng useLocation) ---
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
            {/* Sửa <a> thành <Link> */}
            <Link to="/driver/home">
              {" "}
              <FaHome /> Trang chủ{" "}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            {/* Sửa <a> thành <Link> và thêm path */}
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
            {/* Sửa <a> thành <Link> */}
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
            {/* Sửa <a> thành <Link> */}
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

// --- COMPONENT HEADER CỦA TÀI XẾ (Cập nhật: Thêm onProfileClick + Bell Icon) ---
const DriverHeader = ({
  onReportIncident,
  onProfileClick,
  onLogout,
  driverName = "Phan Viết Huy",
  unreadCount = 0,
  onNotificationClick,
  isSignalRConnected = false,
}) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Trang chủ</span>
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
          <span>Báo cáo sự cố</span>
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
          placeholder="Tìm kiếm..."
          className="driver-search-input"
        />
        {/* Thêm onClick vào đây */}
        <div
          className="driver-user-info"
          onClick={onProfileClick}
          title="Xem thông tin cá nhân"
        >
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

// --- COMPONENT CHÍNH TRANG CHỦ TÀI XẾ (Cập nhật: Kết nối API) ---
const DriverHomePage = () => {
  const { unreadCount, isSignalRConnected } = useNotification();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null); // State lưu schedule từ API
  const [isLoading, setIsLoading] = useState(true); // State loading
  const [error, setError] = useState(null); // State lỗi

  // States cho việc lái xe
  const [isDrivingPickup, setIsDrivingPickup] = useState(false); // Đang lái chuyến đi
  const [isDrivingDropoff, setIsDrivingDropoff] = useState(false); // Đang lái chuyến về

  // ⚠️ NEW: States để lưu completion status từ database history
  const [pickupHistoryExists, setPickupHistoryExists] = useState(false); // Có history pickup không
  const [dropoffHistoryExists, setDropoffHistoryExists] = useState(false); // Có history dropoff không

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
        pickupText: "Đang chờ",
        dropoffText: "Đang chờ",
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

    // ⚠️ CRITICAL: Ưu tiên check DATABASE HISTORY trước
    // Xác định trạng thái chuyến đi (sáng)
    let pickupStatus, pickupText;
    if (pickupHistoryExists) {
      // Database có history → Đã hoàn thành (không thể chạy lại)
      pickupStatus = "completed";
      pickupText = "Đã hoàn thành";
    } else if (pickupCompletedLocal) {
      // LocalStorage có flag completed (trong session hiện tại)
      pickupStatus = "completed";
      pickupText = "Đã hoàn thành";
    } else if (isDrivingPickup) {
      // Đang lái
      pickupStatus = "in-progress";
      pickupText = "Đang thực hiện";
    } else {
      // Chưa bắt đầu
      pickupStatus = "ready";
      pickupText = "Sẵn sàng khởi hành";
    }

    // Xác định trạng thái chuyến về (chiều)
    let dropoffStatus, dropoffText;
    if (dropoffHistoryExists) {
      // Database có history → Đã hoàn thành (không thể chạy lại)
      dropoffStatus = "completed";
      dropoffText = "Đã hoàn thành";
    } else if (dropoffCompletedLocal) {
      // LocalStorage có flag completed (trong session hiện tại)
      dropoffStatus = "completed";
      dropoffText = "Đã hoàn thành";
    } else if (isDrivingDropoff) {
      // Đang lái
      dropoffStatus = "in-progress";
      dropoffText = "Đang thực hiện";
    } else if (!pickupHistoryExists && !pickupCompletedLocal) {
      // Chưa hoàn thành chuyến đi → chuyến về phải đợi
      dropoffStatus = "waiting";
      dropoffText = "Đang chờ";
    } else {
      // Chuyến đi đã xong → sẵn sàng chạy chuyến về
      dropoffStatus = "ready";
      dropoffText = "Sẵn sàng khởi hành";
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
      <DriverSidebar />

      {/* Khu vực nội dung chính */}
      <div className="driver-main-wrapper">
        <DriverHeader
          onReportIncident={() => setIsIncidentModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)} // <-- Thêm prop
          onLogout={handleLogout}
          driverName={fullName}
          unreadCount={unreadCount}
          onNotificationClick={() => navigate("/driver/notifications")}
          isSignalRConnected={isSignalRConnected}
        />

        <main className="driver-main-content">
          {/* Hiển thị loading */}
          {isLoading ? (
            <div className="loading-message">
              <FaSpinner className="spinner" /> Đang tải lịch trình...
            </div>
          ) : error ? (
            // Hiển thị lỗi
            <div className="error-message">{error}</div>
          ) : !scheduleData ? (
            // Không có lịch trình hôm nay
            <div className="no-schedule-message">
              <FaCalendarAlt size={50} />
              <p>Bạn không có lịch trình cho hôm nay.</p>
            </div>
          ) : (
            // Có lịch trình - Hiển thị UI
            <>
              {/* Phần trên: Thông tin tài xế và Lời chào */}
              <section className="driver-welcome-section">
                <div className="driver-info-card">
                  <img src={mockDriverProfile.avatarUrl} alt="Driver Avatar" />
                  <div className="driver-details">
                    <p>Tài xế:</p>
                    <h3>{fullName}</h3>
                    <span>
                      Xe buýt phụ trách:{" "}
                      <strong>{scheduleData.busName || "N/A"}</strong>
                    </span>
                  </div>
                </div>
                <div className="driver-greeting-card">
                  <p>
                    Buổi sáng tốt lành, <strong>{fullName}</strong>! Hôm nay bạn
                    có <strong>2 chuyến xe</strong> trên tuyến{" "}
                    <strong>{scheduleData.routeDTO?.routeName || "N/A"}</strong>{" "}
                    - bắt đầu lúc{" "}
                    <strong>{formatTime(scheduleData.pickupTime)}</strong>. Chúc
                    bạn một hành trình an toàn!
                  </p>
                </div>
              </section>

              {/* Phần dưới: Lịch trình và Bản đồ */}
              <section className="driver-schedule-section">
                <div className="schedule-list">
                  <h4>Lịch trình hôm nay</h4>
                  <p className="schedule-date">
                    {formatDate(scheduleData.scheduleDate)}
                  </p>

                  {/* CHUYẾN ĐI (Sáng) */}
                  <div className="schedule-card morning-card">
                    <div className="schedule-card-icon">
                      <FaBus size={24} />
                    </div>
                    <div className="schedule-card-info">
                      <h4>{scheduleData.routeDTO?.routeName || "Tuyến N/A"}</h4>
                      <p>Xe buýt: {scheduleData.busName}</p>
                      <span>
                        Khởi hành: {formatTime(scheduleData.pickupTime)}
                      </span>
                    </div>
                    <div className="schedule-card-details">
                      <h3>Chuyến đi</h3>
                      <p>
                        Trạng thái:{" "}
                        <span className={`status-${tripStatus.pickupStatus}`}>
                          {tripStatus.pickupText}
                        </span>
                      </p>
                      <p>
                        Số học sinh cần đón: {scheduleData.totalStudents || 0}
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
                        // Khởi động BusSimulationManager FE chạy nền
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
                      {isDrivingPickup ? "Đang chạy..." : "Bắt đầu chuyến đi"}
                    </button>
                  </div>

                  {/* CHUYẾN VỀ (Chiều) */}
                  <div className="schedule-card afternoon-card">
                    <div className="schedule-card-icon">
                      <FaBus size={24} />
                    </div>
                    <div className="schedule-card-info">
                      <h4>{scheduleData.routeDTO?.routeName || "Tuyến N/A"}</h4>
                      <p>Xe buýt: {scheduleData.busName}</p>
                      <span>
                        Khởi hành: {formatTime(scheduleData.dropOffTime)}
                      </span>
                    </div>
                    <div className="schedule-card-details">
                      <h3>Chuyến về</h3>
                      <p>
                        Trạng thái:{" "}
                        <span className={`status-${tripStatus.dropoffStatus}`}>
                          {tripStatus.dropoffText}
                        </span>
                      </p>
                      <p>
                        Số học sinh cần đưa về:{" "}
                        {scheduleData.totalStudents || 0}
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
                        // Khởi động BusSimulationManager FE chạy nền
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
                      {isDrivingDropoff ? "Đang chạy..." : "Bắt đầu chuyến về"}
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
                      <span>Không có dữ liệu lộ trình để hiển thị</span>
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
