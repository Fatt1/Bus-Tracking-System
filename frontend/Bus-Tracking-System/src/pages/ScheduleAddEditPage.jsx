import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ScheduleAddEditPage.css"; // Sẽ tạo ở bước sau
import { FaCalendarAlt } from "react-icons/fa";
import { addDays, addWeeks, addMonths, format } from "date-fns";

// Component chính của trang
const ScheduleAddEditPage = () => {
  // State để quản lý tab nào đang active
  const [activeTab, setActiveTab] = useState("create");

  // State cho các trường trong form
  const [scheduleName, setScheduleName] = useState("Ahjhj đồ ngốc");
  const [scheduleType, setScheduleType] = useState("Tuần"); // 'Tuần', 'Tháng', 'Ngày đơn'
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState({
    "Thứ Hai": true,
    "Thứ Ba": true,
    "Thứ Tư": true,
    "Thứ Năm": true,
    "Thứ Sáu": true,
    "Thứ Bảy": false,
    "Chủ Nhật": false,
  });

  // useEffect để tự động tính toán lại ngày kết thúc
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      let end;
      switch (scheduleType) {
        case "Ngày đơn":
          end = addDays(start, 1);
          break;
        case "Tuần":
          end = addWeeks(start, 1);
          break;
        case "Tháng":
          end = addMonths(start, 1);
          break;
        default:
          end = start;
      }
      setEndDate(format(end, "yyyy-MM-dd"));
    }
  }, [startDate, scheduleType]); // Chạy lại mỗi khi startDate hoặc scheduleType thay đổi

  // Hàm xử lý khi check/uncheck các ngày trong tuần
  const handleCheckboxChange = (day) => {
    setDaysOfWeek((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý lịch trình</span> /{" "}
          <span>Tạo lịch trình mới</span>
        </div>
        {/* Header actions có thể giữ lại hoặc bỏ đi tùy ý */}
      </header>

      <div className="page-content">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Tạo lịch trình mới
          </button>
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Chi tiết lịch trình
          </button>
        </div>

        <div className="tab-content">
          {/* Tab 1: Tạo lịch trình mới */}
          {activeTab === "create" && (
            <div className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="schedule-name">Tên lịch trình</label>
                  <input
                    type="text"
                    id="schedule-name"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="schedule-type">Loại lịch trình</label>
                  <select
                    id="schedule-type"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                  >
                    <option value="Tuần">Tuần</option>
                    <option value="Tháng">Tháng</option>
                    <option value="Ngày đơn">Ngày đơn</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start-date">Ngày bắt đầu hiệu lực</label>
                  <div className="date-input-with-icon">
                    <input
                      type="date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <FaCalendarAlt className="icon" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="end-date">Ngày kết thúc hiệu lực</label>
                  <div className="date-input-with-icon">
                    <input
                      type="date"
                      id="end-date"
                      value={endDate}
                      readOnly // Chỉ đọc, không cho người dùng sửa
                    />
                    <FaCalendarAlt className="icon" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Ngày trong tuần</label>
                <div className="checkbox-group">
                  {Object.keys(daysOfWeek).map((day) => (
                    <div className="checkbox-item" key={day}>
                      <input
                        type="checkbox"
                        id={day}
                        checked={daysOfWeek[day]}
                        onChange={() => handleCheckboxChange(day)}
                      />
                      <label htmlFor={day}>{day}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Trạng Thái</label>
                <span className="status-display">Chưa hoạt động</span>
              </div>

              <div className="form-actions">
                <button type="button" className="action-btn-form draft-btn">
                  Nháp
                </button>
                <button type="button" className="action-btn-form save-btn">
                  Lưu
                </button>
              </div>
            </div>
          )}
          {/* Tab 2: Chi tiết lịch trình (để trống) */}
          {activeTab === "details" && (
            <div>
              <p>Phần chi tiết lịch trình sẽ được xây dựng sau.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ScheduleAddEditPage;
