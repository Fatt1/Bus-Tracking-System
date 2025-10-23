import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ScheduleAddEditPageNew.css";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- DEMO DATA (Copy từ ScheduleListPageNew) ---
const mockDrivers = [
  { id: 1, name: "Phan Viết Huy", busId: "B001" },
  { id: 2, name: "Nguyễn Văn An", busId: "B002" },
  { id: 3, name: "Lê Thị Cẩm", busId: "B003" },
  { id: 4, name: "Trần Bảo Ngọc", busId: "B004" },
];

const mockBuses = [
  { id: "B001", name: "Xe 01 - 51F-123.45" },
  { id: "B002", name: "Xe 02 - 51F-678.90" },
  { id: "B003", name: "Xe 03 - 51F-112.23" },
  { id: "B004", name: "Xe 04 - 51F-445.56" },
];
// --- END DEMO DATA ---

const ScheduleAddEditPageNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { routeId, routeName, date } = location.state || {};

  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("07:00");
  const [selectedDriverId, setSelectedDriverId] = useState(
    mockDrivers[0]?.id || ""
  );
  const [selectedBusId, setSelectedBusId] = useState(mockBuses[0]?.id || "");

  useEffect(() => {
    if (!routeId || !routeName || !date) {
      console.warn("Dữ liệu không hợp lệ, quay về trang lịch.");
      navigate("/schedules-new"); // Đảm bảo quay về đúng trang lịch
    }
  }, [routeId, routeName, date, navigate]);

  // THAY ĐỔI: Logic khi nhấn Lưu
  const handleSave = (e) => {
    e.preventDefault();
    const newSchedule = {
      id: Date.now(),
      routeId: routeId,
      date: date,
      startTime,
      endTime,
      driverId: parseInt(selectedDriverId),
      busId: selectedBusId,
    };

    try {
      // Đọc dữ liệu cũ từ localStorage
      const existingSchedules = JSON.parse(
        localStorage.getItem("schedulesData") || "[]"
      );
      // Thêm lịch trình mới vào
      const updatedSchedules = [...existingSchedules, newSchedule];
      // Lưu lại vào localStorage
      localStorage.setItem("schedulesData", JSON.stringify(updatedSchedules));
      console.log("Đã lưu lịch trình mới vào localStorage:", newSchedule);
      navigate(-1); // Quay lại trang lịch
    } catch (error) {
      console.error("Lỗi khi lưu vào localStorage:", error);
      alert("Đã có lỗi xảy ra khi lưu lịch trình.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="main-content-area">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> / <span>Quản lý lịch trình</span> /{" "}
          <span>Thêm lịch trình mới</span>
        </div>
      </header>

      <div className="page-content add-schedule-form-page">
        <h2>Thêm lịch trình mới</h2>
        <form onSubmit={handleSave} className="add-schedule-form">
          <div className="form-group readonly-group">
            <label>Tuyến đường</label>
            <input type="text" value={routeName || "N/A"} readOnly disabled />
          </div>
          <div className="form-group readonly-group">
            <label>Ngày</label>
            <input
              type="text"
              value={
                date
                  ? format(new Date(date + "T00:00:00"), "EEEE, dd/MM/yyyy", {
                      locale: vi,
                    })
                  : "N/A"
              }
              readOnly
              disabled
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Giờ đi</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">Giờ về</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverId">Tài xế</label>
              <select
                id="driverId"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Chọn tài xế --
                </option>
                {mockDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="busId">Xe buýt</label>
              <select
                id="busId"
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Chọn xe buýt --
                </option>
                {mockBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions add-form-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button type="submit" className="action-btn-form confirm-btn">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ScheduleAddEditPageNew;
