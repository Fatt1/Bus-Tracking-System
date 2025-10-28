import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
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

// --- DỮ LIỆU MẪU LỊCH TRÌNH ---
// Dữ liệu này sau này bạn sẽ fetch từ API dựa trên tuần
const mockSchedule = {
  "Tuần 42": {
    // Giả sử tuần hiện tại là tuần 42
    "Thứ Hai": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Ba": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Tư": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Năm": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Sáu": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Bảy": { trip: null, return: null }, // Nghỉ
    "Chủ Nhật": { trip: null, return: null }, // Nghỉ
  },
  "Tuần 43": {
    // Tuần sau
    "Thứ Hai": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Ba": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Tư": { trip: null, return: null },
    "Thứ Năm": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Sáu": { trip: "Đưa đi", return: "Đón về" },
    "Thứ Bảy": { trip: null, return: null },
    "Thứ Nhật": { trip: null, return: null },
  },
};
// --- HẾT DỮ LIỆU MẪU ---

// --- COMPONENT SIDEBAR CỦA TÀI XẾ ---
// (Copy từ DriverHomePage, nhưng đổi 'activePage')
const DriverSidebar = () => {
  const activePage = "schedule"; // Đặt trang này là active

  return (
    <aside className="driver-sidebar">
      <div className="driver-sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="driver-sidebar-nav">
        <ul>
          <li className={activePage === "home" ? "active" : ""}>
            {/* Dùng Link của React Router */}
            <Link to="/driver/home">
              {" "}
              <FaHome /> Trang chủ{" "}
            </Link>
          </li>
          <li className={activePage === "schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              {" "}
              <FaTasks /> Lịch trình làm việc{" "}
            </Link>
          </li>
          <li className={activePage === "students" ? "active" : ""}>
            {/* Cần tạo trang này sau */}
            <Link to="#">
              {" "}
              <FaUserCheck /> Học sinh & điểm đón{" "}
            </Link>
          </li>
          <li className={activePage === "notifications" ? "active" : ""}>
            {/* Cần tạo trang này sau */}
            <Link to="#">
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
// (Copy từ DriverHomePage, bỏ onReportIncident vì trang này không có)
const DriverHeader = ({ driverName = "Phan Viết Huy" }) => {
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Lịch trình làm việc</span>
      </div>
      <div className="driver-header-actions">
        {/* Tạm thời ẩn nút báo cáo ở trang này */}
        {/* <button className="report-incident-btn"> ... </button> */}
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="driver-search-input"
        />
        <div className="driver-user-info" title="Xem thông tin cá nhân">
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT CHÍNH TRANG LỊCH TRÌNH ---
const DriverSchedulePage = () => {
  // State để lưu ngày đầu tiên của tuần đang xem
  // Bắt đầu với ngày hiện tại
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Lấy dữ liệu lịch trình cho tuần hiện tại (từ mock data)
  // Giả lập chọn tuần 42 hoặc 43, còn lại là rỗng
  const currentScheduleData = mockSchedule[`Tuần ${weekNumber}`] || {};

  return (
    <div className="driver-page-container">
      <DriverSidebar />
      <div className="driver-main-wrapper">
        <DriverHeader />

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

          {/* Bảng Lịch trình */}
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
                {/* Hàng Chuyến đi */}
                <tr>
                  <td className="trip-type-header">Đưa đi</td>
                  {daysInWeek.map((day) => {
                    const dayName = format(day, "EEEE", { locale: vi });
                    const schedule = currentScheduleData[dayName];
                    return (
                      <td
                        key={`${day.toISOString()}-trip`}
                        className={`trip-cell ${
                          schedule?.trip ? "active" : "inactive"
                        }`}
                      >
                        {schedule?.trip ? (
                          <div className="trip-info trip-am">
                            <span>{schedule.trip}</span>
                            <time>6:00</time>
                            <time>6:45</time>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
                {/* Hàng Chuyến về */}
                <tr>
                  <td className="trip-type-header">Đón về</td>
                  {daysInWeek.map((day) => {
                    const dayName = format(day, "EEEE", { locale: vi });
                    const schedule = currentScheduleData[dayName];
                    return (
                      <td
                        key={`${day.toISOString()}-return`}
                        className={`trip-cell ${
                          schedule?.return ? "active" : "inactive"
                        }`}
                      >
                        {schedule?.return ? (
                          <div className="trip-info trip-pm">
                            <span>{schedule.return}</span>
                            <time>16:00</time>
                            <time>17:00</time>
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
        </main>
      </div>
    </div>
  );
};

export default DriverSchedulePage;
