import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuth } from "../../utils/auth";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import DriverMapComponent from "../../components/driver/DriverMapComponent";
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

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

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

// --- COMPONENT HEADER CỦA TÀI XẾ (Cập nhật: Thêm onProfileClick) ---
const DriverHeader = ({
  onReportIncident,
  onProfileClick,
  onLogout,
  driverName = "Phan Viết Huy",
}) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Trang chủ</span>
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
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null); // State lưu schedule từ API
  const [isLoading, setIsLoading] = useState(true); // State loading
  const [error, setError] = useState(null); // State lỗi

  // States cho việc lái xe
  const [isDrivingPickup, setIsDrivingPickup] = useState(false); // Đang lái chuyến đi
  const [isDrivingDropoff, setIsDrivingDropoff] = useState(false); // Đang lái chuyến về

  const navigate = useNavigate();

  const fullName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    `${mockDriverProfile.firstName} ${mockDriverProfile.lastName}`;

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
      } else {
        // Có schedule
        setScheduleData(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch trình hôm nay:", err);
      setError("Không thể tải lịch trình. Vui lòng thử lại.");
      setScheduleData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để fetch data khi component mount
  useEffect(() => {
    fetchScheduleToday();
  }, []); // Chỉ chạy 1 lần khi mount

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

  // Hàm kiểm tra thời gian hiện tại để quyết định nút nào active
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  // Logic kiểm tra nút nào được bật
  const checkButtonState = () => {
    if (!scheduleData) return { morning: false, afternoon: false };
    const currentTime = getCurrentTime();
    const morningTime = formatTime(scheduleData.pickupTime);
    const afternoonTime = formatTime(scheduleData.dropOffTime);

    // Chuyến sáng active nếu thời gian hiện tại >= pickupTime và < dropOffTime
    // Chuyến chiều active nếu thời gian hiện tại >= dropOffTime
    const morningActive =
      currentTime >= morningTime &&
      currentTime < afternoonTime &&
      scheduleData.status !== 2;
    const afternoonActive =
      currentTime >= afternoonTime && scheduleData.status !== 2;

    return { morning: morningActive, afternoon: afternoonActive };
  };

  const buttonState = checkButtonState();

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
                        <span
                          className={
                            buttonState.morning
                              ? "status-upcoming"
                              : scheduleData.status === 2
                              ? "status-completed"
                              : "status-waiting"
                          }
                        >
                          {buttonState.morning
                            ? "Sẵn sàng khởi hành"
                            : scheduleData.status === 2
                            ? "Đã hoàn thành"
                            : "Đang chờ"}
                        </span>
                      </p>
                      <p>
                        Số học sinh cần đón: {scheduleData.totalStudents || 0}
                      </p>
                    </div>
                    <button
                      className={`start-trip-btn ${
                        buttonState.morning ? "active-btn" : "disabled-btn"
                      }`}
                      disabled={!buttonState.morning || isDrivingPickup}
                      onClick={() => setIsDrivingPickup(true)}
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
                        <span
                          className={
                            buttonState.afternoon
                              ? "status-upcoming"
                              : scheduleData.status === 2
                              ? "status-completed"
                              : "status-waiting"
                          }
                        >
                          {buttonState.afternoon
                            ? "Sẵn sàng khởi hành"
                            : scheduleData.status === 2
                            ? "Đã hoàn thành"
                            : "Đang chờ"}
                        </span>
                      </p>
                      <p>
                        Số học sinh cần đưa về:{" "}
                        {scheduleData.totalStudents || 0}
                      </p>
                    </div>
                    <button
                      className={`start-trip-btn ${
                        buttonState.afternoon ? "active-btn" : "disabled-btn"
                      }`}
                      disabled={!buttonState.afternoon || isDrivingDropoff}
                      onClick={() => setIsDrivingDropoff(true)}
                    >
                      {isDrivingDropoff ? "Đang chạy..." : "Bắt đầu chuyến đi"}
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
                      isDriving={isDrivingPickup || isDrivingDropoff}
                      onDrivingFinished={() => {
                        setIsDrivingPickup(false);
                        setIsDrivingDropoff(false);
                        alert("Chuyến đi hoàn thành!");
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
