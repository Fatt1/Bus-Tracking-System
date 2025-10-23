import React, { useState, useEffect } from "react";
import "./ScheduleAddEditPage.css";
import { FaCalendarAlt, FaBus, FaUser, FaMinusCircle } from "react-icons/fa";
import { addDays, addWeeks, addMonths, format } from "date-fns";

// --- DEMO DATA (ĐÃ CẬP NHẬT) ---
const mockDrivers = [
  {
    id: 1,
    name: "Phan Viết Huy",
    busId: "B001",
    routeId: 1,
    routeName: "An Dương Vương - Trần Hưng Đạo",
  },
  {
    id: 2,
    name: "Nguyễn Văn An",
    busId: "B002",
    routeId: 2,
    routeName: "Bến Thành - Suối Tiên",
  },
  {
    id: 3,
    name: "Lê Thị Cẩm",
    busId: "B003",
    routeId: 1,
    routeName: "An Dương Vương - Trần Hưng Đạo",
  },
];
// --- END DEMO DATA ---

// Component chính của trang
const ScheduleAddEditPage = () => {
  // State chung
  const [activeTab, setActiveTab] = useState("create");

  // === State cho Tab 1: Tạo lịch trình mới ===
  const [scheduleName, setScheduleName] = useState("Lịch trình học kỳ 1");
  const [scheduleType, setScheduleType] = useState("Tuần");
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

  // === State cho Tab 2: Chi tiết lịch trình ===
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(mockDrivers[0].id);
  const [busId, setBusId] = useState(mockDrivers[0].busId);
  const [routeName, setRouteName] = useState(mockDrivers[0].routeName); // <-- STATE MỚI
  const [departureTime, setDepartureTime] = useState("06:00");
  const [departureTimeReturn, setDepartureTimeReturn] = useState("16:00");
  const [arrivalTime, setArrivalTime] = useState("06:45");
  const [arrivalTimeReturn, setArrivalTimeReturn] = useState("17:45");

  // useEffect để tính ngày kết thúc (Tab 1)
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
  }, [startDate, scheduleType]);

  // useEffect để cập nhật xe buýt VÀ TUYẾN ĐƯỜNG khi đổi tài xế (Tab 2) - ĐÃ CẬP NHẬT
  useEffect(() => {
    const selectedDriver = mockDrivers.find(
      (d) => d.id === parseInt(selectedDriverId)
    );
    if (selectedDriver) {
      setBusId(selectedDriver.busId);
      setRouteName(selectedDriver.routeName); // <-- CẬP NHẬT TUYẾN ĐƯỜNG
    }
  }, [selectedDriverId]);

  // Hàm xử lý checkbox (Tab 1)
  const handleCheckboxChange = (day) => {
    setDaysOfWeek((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Hàm thêm một chi tiết chuyến đi mới (Tab 2) - ĐÃ CẬP NHẬT
  const handleAddDetail = () => {
    const driver = mockDrivers.find((d) => d.id === parseInt(selectedDriverId));
    if (!driver) return;

    const newDetail = {
      id: Date.now(),
      routeName: driver.routeName, // Lấy trực tiếp từ tài xế
      departureTime,
      arrivalTime,
      departureTimeReturn,
      arrivalTimeReturn,
      busId: driver.busId,
      driverName: driver.name,
    };
    setScheduleDetails((prev) => [...prev, newDetail]);
  };

  // Hàm xóa một chi tiết chuyến đi (Tab 2)
  const handleRemoveDetail = (idToRemove) => {
    setScheduleDetails((prev) =>
      prev.filter((detail) => detail.id !== idToRemove)
    );
  };

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý lịch trình</span> /{" "}
          <span>Danh sách lịch trình</span>
        </div>
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
          {/* === Tab 1: Tạo lịch trình mới === */}
          {activeTab === "create" && (
            <div className="form-container animated-tab">
              {/* ... code của tab 1 giữ nguyên ... */}
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
                    <input type="date" id="end-date" value={endDate} readOnly />
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

          {/* === Tab 2: Chi tiết lịch trình (ĐÃ CẬP NHẬT) === */}
          {activeTab === "details" && (
            <div className="animated-tab">
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="driver-select">Chọn tài xế</label>
                    <select
                      id="driver-select"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                    >
                      {mockDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bus-id">Xe buýt</label>
                    <input
                      type="text"
                      id="bus-id"
                      value={busId}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="form-row">
                  {/* THAY ĐỔI: Input hiển thị tuyến đường, không cho chọn */}
                  <div className="form-group">
                    <label htmlFor="route-name">Tuyến đường</label>
                    <input
                      type="text"
                      id="route-name"
                      value={routeName}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="form-group time-group-wrapper">
                    <label>Thời gian</label>
                    <div className="time-group">
                      <span>Đưa đi</span>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                      />
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                      />
                    </div>
                    <div className="time-group">
                      <span>Đón về</span>
                      <input
                        type="time"
                        value={departureTimeReturn}
                        onChange={(e) => setDepartureTimeReturn(e.target.value)}
                      />
                      <input
                        type="time"
                        value={arrivalTimeReturn}
                        onChange={(e) => setArrivalTimeReturn(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="action-btn-form save-btn-detail"
                    onClick={handleAddDetail}
                  >
                    Lưu
                  </button>
                </div>
              </div>

              <div className="details-list-container">
                <h3>Quản lý chuyến đi</h3>
                <div className="details-list">
                  {scheduleDetails.length === 0 ? (
                    <p className="empty-message">
                      Chưa có chuyến đi nào được thêm.
                    </p>
                  ) : (
                    scheduleDetails.map((detail) => (
                      <div className="detail-item" key={detail.id}>
                        <div className="detail-item-main">
                          <p className="route-name">{detail.routeName}</p>
                          <div className="time-info">
                            <span>
                              {detail.departureTime} — {detail.arrivalTime}
                            </span>
                            <span>
                              {detail.departureTimeReturn} —{" "}
                              {detail.arrivalTimeReturn}
                            </span>
                          </div>
                        </div>
                        <div className="detail-item-meta">
                          <div className="meta-tag">
                            <FaBus /> {detail.busId}
                          </div>
                          <div className="meta-tag">
                            <FaUser /> {detail.driverName}
                          </div>
                        </div>
                        <button
                          className="delete-detail-btn"
                          onClick={() => handleRemoveDetail(detail.id)}
                        >
                          <FaMinusCircle />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ScheduleAddEditPage;
