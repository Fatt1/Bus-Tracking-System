import React, { useState, useEffect } from "react"; // Thêm useEffect
import { useNavigate } from "react-router-dom";
import "./ScheduleListPageNew.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  format,
  isEqual,
  isSameDay,
} from "date-fns";
import { vi } from "date-fns/locale";

// --- DEMO DATA ---
const mockRoutes = [
  { id: 1, name: "An Dương Vương - Trần Hưng Đạo" },
  { id: 2, name: "Bến Thành - Suối Tiên" },
  { id: 3, name: "Ký túc xá khu B - Đại học Bách Khoa" },
  { id: 4, name: "Lê Duẩn - Điện Biên Phủ" },
];

const mockDrivers = [
  { id: 1, name: "Phan Viết Huy", busId: "B001" },
  { id: 2, name: "Nguyễn Văn An", busId: "B002" },
  { id: 3, name: "Lê Thị Cẩm", busId: "B003" },
  { id: 4, name: "Trần Bảo Ngọc", busId: "B004" },
];

// Dữ liệu ban đầu nếu localStorage trống
const initialSchedulesData = [
  {
    id: 1,
    routeId: 1,
    date: "2025-10-20",
    startTime: "06:00",
    endTime: "06:45",
    driverId: 1,
    busId: "B001",
  },
  {
    id: 2,
    routeId: 2,
    date: "2025-10-21",
    startTime: "07:00",
    endTime: "07:50",
    driverId: 2,
    busId: "B002",
  },
  {
    id: 3,
    routeId: 1,
    date: "2025-10-22",
    startTime: "16:00",
    endTime: "16:45",
    driverId: 3,
    busId: "B003",
  },
  {
    id: 4,
    routeId: 3,
    date: "2025-10-23",
    startTime: "06:30",
    endTime: "07:15",
    driverId: 1,
    busId: "B001",
  },
  {
    id: 5,
    routeId: 4,
    date: "2025-10-24",
    startTime: "17:00",
    endTime: "17:45",
    driverId: 4,
    busId: "B004",
  },
  {
    id: 6,
    routeId: 1,
    date: "2025-10-27",
    startTime: "08:00",
    endTime: "08:45",
    driverId: 1,
    busId: "B001",
  }, // Tuần sau
  {
    id: 7,
    routeId: 2,
    date: "2025-10-20",
    startTime: "10:00",
    endTime: "10:45",
    driverId: 2,
    busId: "B002",
  }, // Cùng ngày, tuyến khác
];
// --- END DEMO DATA ---

// --- Component Modal Xem/Xóa Lịch trình ---
const ScheduleDetailModal = ({
  schedule,
  routeName,
  driverName,
  isOpen,
  onClose,
  onDelete,
}) => {
  // ... (Giữ nguyên không đổi) ...
  if (!isOpen || !schedule) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content schedule-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <h4>Chi tiết lịch trình</h4>
        <p>
          <strong>Tuyến đường:</strong> {routeName}
        </p>
        <p>
          <strong>Ngày:</strong>{" "}
          {format(new Date(schedule.date + "T00:00:00"), "dd/MM/yyyy")}
        </p>
        <p>
          <strong>Giờ chạy:</strong> {schedule.startTime} - {schedule.endTime}
        </p>
        <p>
          <strong>Tài xế:</strong> {driverName}
        </p>
        <p>
          <strong>Xe buýt:</strong> {schedule.busId}
        </p>
        <div className="modal-actions">
          <button
            className="delete-schedule-btn"
            onClick={() => onDelete(schedule.id)}
          >
            <FaTrashAlt /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component Modal Xác nhận Xóa ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, scheduleInfo }) => {
  // ... (Giữ nguyên không đổi) ...
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete-schedule"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={30} color="#e74c3c" />
          <h4>Xác nhận xóa</h4>
        </div>
        <p>
          Bạn có chắc muốn xóa lịch trình cho tuyến{" "}
          <strong>{scheduleInfo?.routeName}</strong> vào ngày{" "}
          <strong>
            {scheduleInfo?.date
              ? format(new Date(scheduleInfo.date + "T00:00:00"), "dd/MM/yyyy")
              : ""}
          </strong>
          ?
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component Chính: Lịch trình theo tuần ---
const ScheduleListPageNew = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 23));
  // THAY ĐỔI: Khởi tạo state từ localStorage hoặc dữ liệu ban đầu
  const [schedules, setSchedules] = useState(() => {
    const savedSchedules = localStorage.getItem("schedulesData");
    return savedSchedules ? JSON.parse(savedSchedules) : initialSchedulesData;
  });
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);

  const navigate = useNavigate();

  // THAY ĐỔI: Lưu vào localStorage mỗi khi schedules thay đổi
  useEffect(() => {
    localStorage.setItem("schedulesData", JSON.stringify(schedules));
  }, [schedules]);

  const weekStartsOn = 1;
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn });
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd,
  });

  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const findSchedule = (routeId, date) => {
    return schedules.find(
      (s) =>
        s.routeId === routeId && isSameDay(new Date(s.date + "T00:00:00"), date)
    );
  };

  const handleViewSchedule = (schedule) => {
    setViewingSchedule(schedule);
  };

  const handleCloseModals = () => {
    setViewingSchedule(null);
    setDeletingScheduleId(null);
  };

  const handleDeleteRequest = (scheduleId) => {
    setDeletingScheduleId(scheduleId);
    setViewingSchedule(null);
  };

  // THAY ĐỔI: Chỉ cập nhật state, useEffect sẽ lo việc lưu vào localStorage
  const handleConfirmDelete = () => {
    setSchedules((prev) => prev.filter((s) => s.id !== deletingScheduleId));
    handleCloseModals();
  };

  const handleAddSchedule = (routeId, routeName, date) => {
    navigate("/schedules/add-new", {
      state: {
        routeId,
        routeName,
        date: format(date, "yyyy-MM-dd"),
      },
    });
  };

  const getDriverName = (driverId) => {
    return mockDrivers.find((d) => d.id === driverId)?.name || "N/A";
  };
  const getRouteName = (routeId) => {
    return mockRoutes.find((r) => r.id === routeId)?.name || "N/A";
  };

  return (
    <>
      <ScheduleDetailModal
        isOpen={!!viewingSchedule}
        schedule={viewingSchedule}
        routeName={viewingSchedule ? getRouteName(viewingSchedule.routeId) : ""}
        driverName={
          viewingSchedule ? getDriverName(viewingSchedule.driverId) : ""
        }
        onClose={handleCloseModals}
        onDelete={handleDeleteRequest}
      />
      <ConfirmDeleteModal
        isOpen={!!deletingScheduleId}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        scheduleInfo={
          schedules.find((s) => s.id === deletingScheduleId)
            ? {
                routeName: getRouteName(
                  schedules.find((s) => s.id === deletingScheduleId).routeId
                ),
                date: schedules.find((s) => s.id === deletingScheduleId).date,
              }
            : null
        }
      />

      <main className="main-content-area schedule-calendar-page">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý lịch trình</span> /{" "}
            <span>Lịch trình theo tuần</span>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="search-input"
            />
            <button className="user-button">Đăng nhập</button>
          </div>
        </header>

        <div className="page-content">
          <div className="calendar-header">
            <button onClick={goToPrevWeek} className="nav-button">
              <FaChevronLeft />
            </button>
            <h2>
              Tuần {format(currentWeekStart, "dd/MM")} -{" "}
              {format(currentWeekEnd, "dd/MM/yyyy")}
            </h2>
            <button onClick={goToNextWeek} className="nav-button">
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid-container">
            <table className="calendar-grid">
              <thead>
                <tr>
                  <th className="route-header-cell">Tuyến đường</th>
                  {daysInWeek.map((day) => (
                    <th key={day.toString()} className="day-header-cell">
                      <div>{format(day, "EEEE", { locale: vi })}</div>
                      <div>{format(day, "dd/MM")}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRoutes.map((route) => (
                  <tr key={route.id}>
                    <td className="route-name-cell">{route.name}</td>
                    {daysInWeek.map((day) => {
                      const schedule = findSchedule(route.id, day);
                      return (
                        <td
                          key={day.toString()}
                          className={`calendar-cell ${
                            schedule ? "has-schedule" : "empty-cell"
                          }`}
                          onClick={() =>
                            schedule
                              ? handleViewSchedule(schedule)
                              : handleAddSchedule(route.id, route.name, day)
                          }
                        >
                          {schedule && (
                            <div className="schedule-item">
                              <div className="schedule-time">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className="schedule-driver">
                                {getDriverName(schedule.driverId)}
                              </div>
                              <div className="schedule-bus">
                                {schedule.busId}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default ScheduleListPageNew;
