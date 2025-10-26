import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "./ScheduleListPageNew.css"; // Sẽ tạo ở bước 3
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
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
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale"; // Import Vietnamese locale

// --- COMPONENT MODAL XEM/XÓA LỊCH TRÌNH ---
const ScheduleDetailModal = ({
  schedule,
  routeName,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !schedule) return null;

  // Hàm chuyển đổi status number sang text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Không hoạt động";
      case 1:
        return "Đang hoạt động";
      case 2:
        return "Chưa hoạt động";
      default:
        return "Không rõ";
    }
  };

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
          {schedule.scheduleDate
            ? format(parseISO(schedule.scheduleDate), "dd/MM/yyyy")
            : "N/A"}
        </p>
        <p>
          <strong>Giờ đi:</strong> {schedule.pickupTime || "N/A"}
        </p>
        <p>
          <strong>Giờ về:</strong> {schedule.dropOffTime || "N/A"}
        </p>
        <p>
          <strong>Tài xế:</strong> {schedule.driverName || "N/A"}
        </p>
        <p>
          <strong>Xe buýt:</strong> {schedule.busName || "N/A"}
        </p>
        <p>
          <strong>Trạng thái:</strong> {getStatusText(schedule.status)}
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

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, scheduleInfo }) => {
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
              ? format(parseISO(scheduleInfo.date), "dd/MM/yyyy")
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

// --- COMPONENT CHÍNH: LỊCH TRÌNH THEO TUẦN ---
const ScheduleListPageNew = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Bắt đầu từ ngày hiện tại
  const [schedules, setSchedules] = useState([]); // State lưu lịch trình từ API
  const [routes, setRoutes] = useState([]); // State lưu tuyến đường từ API
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [error, setError] = useState(null); // State báo lỗi

  const navigate = useNavigate();

  // --- HÀM GỌI API ---
  const fetchRoutes = async () => {
    console.log("Fetching routes...");
    setIsLoadingRoutes(true);
    try {
      const response = await axios.get(
        `https://localhost:7229/api/v1/route/all?PageNumber=1&PageSize=100`
      ); // Lấy nhiều routes
      console.log("Routes API response:", response.data);
      setRoutes(response.data.items || []);
      setError(null); // Xóa lỗi cũ nếu thành công
    } catch (err) {
      console.error("Lỗi khi tải danh sách tuyến đường:", err);
      setError("Không thể tải danh sách tuyến đường.");
      setRoutes([]);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const fetchSchedules = async () => {
    console.log("Fetching schedules...");
    setIsLoadingSchedules(true);
    try {
      const response = await axios.get(
        `https://localhost:7229/api/v1/schedule/all`
      );
      console.log("Schedules API response:", response.data);
      // API trả về trực tiếp mảng schedules
      setSchedules(Array.isArray(response.data) ? response.data : []);
      setError(null); // Xóa lỗi cũ nếu thành công
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch trình:", err);
      setError("Không thể tải danh sách lịch trình.");
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // useEffect để fetch dữ liệu khi component mount lần đầu
  useEffect(() => {
    fetchRoutes();
    fetchSchedules();
  }, []); // Chỉ chạy 1 lần

  // --- LOGIC XỬ LÝ LỊCH ---
  const weekStartsOn = 1; // Bắt đầu tuần từ Thứ Hai (Monday)
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn });
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd,
  });

  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToCurrentWeek = () => setCurrentDate(new Date()); // Nút về tuần hiện tại (tùy chọn)

  // Tìm lịch trình cho ô cụ thể
  const findSchedule = (routeId, date) => {
    // API trả về scheduleDate dạng "YYYY-MM-DD"
    const dateString = format(date, "yyyy-MM-dd");
    return schedules.find(
      (s) => s.routeId === routeId && s.scheduleDate === dateString
    );
  };

  // --- HÀM XỬ LÝ MODAL ---
  const handleViewSchedule = (schedule) => {
    console.log("Viewing schedule:", schedule);
    setViewingSchedule(schedule);
  };

  const handleCloseModals = () => {
    setViewingSchedule(null);
    setDeletingScheduleId(null);
  };

  const handleDeleteRequest = (scheduleId) => {
    console.log(`Requesting delete for schedule ID: ${scheduleId}`);
    setDeletingScheduleId(scheduleId);
    setViewingSchedule(null); // Đóng modal xem nếu đang mở
  };

  // --- HÀM XÁC NHẬN XÓA (Tạm thời client-side) ---
  const handleConfirmDelete = async () => {
    if (!deletingScheduleId) return;
    console.log(`Confirming delete for schedule ID: ${deletingScheduleId}`);

    // ---- TẠM THỜI XÓA CLIENT-SIDE ----
    // Sau này thay bằng gọi API DELETE
    try {
      // await axios.delete(`https://localhost:7229/api/v1/schedule/${deletingScheduleId}`);
      setSchedules((prev) => prev.filter((s) => s.id !== deletingScheduleId));
      alert("Đã xóa lịch trình (mock data)!");
    } catch (err) {
      console.error("Lỗi khi xóa lịch trình:", err);
      alert("Xóa lịch trình thất bại!");
    } finally {
      handleCloseModals();
    }
    // ---- KẾT THÚC XÓA CLIENT-SIDE ----
  };

  // --- HÀM CHUYỂN TRANG THÊM MỚI ---
  const handleAddSchedule = (routeId, routeName, date) => {
    const dateString = format(date, "yyyy-MM-dd");
    console.log(
      `Navigating to add schedule for route ${routeId} (${routeName}) on date ${dateString}`
    );
    navigate("/schedules/add-new", {
      state: { routeId, routeName, date: dateString }, // Truyền dữ liệu qua state
    });
  };

  // --- LẤY TÊN TUYẾN ĐƯỜNG (Tối ưu: tạo map để tra cứu) ---
  const routeNameMap = routes.reduce((map, route) => {
    map[route.id] = route.routeName;
    return map;
  }, {});
  const getRouteName = (routeId) => routeNameMap[routeId] || "Không rõ";

  // --- KIỂM TRA TRẠNG THÁI LOADING VÀ LỖI ---
  if (error) {
    return (
      <div className="loading-error">
        {error}{" "}
        <button
          onClick={() => {
            fetchRoutes();
            fetchSchedules();
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }
  // Chỉ hiển thị loading chính khi đang tải routes hoặc schedules lần đầu
  const showMainLoading =
    isLoadingRoutes || (isLoadingSchedules && schedules.length === 0);

  return (
    <>
      {/* Modal Xem chi tiết */}
      <ScheduleDetailModal
        isOpen={!!viewingSchedule}
        schedule={viewingSchedule}
        routeName={viewingSchedule ? getRouteName(viewingSchedule.routeId) : ""}
        onClose={handleCloseModals}
        onDelete={handleDeleteRequest}
      />
      {/* Modal Xác nhận xóa */}
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
                date: schedules.find((s) => s.id === deletingScheduleId)
                  .scheduleDate,
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
          {/* Bỏ actions header nếu không cần */}
        </header>

        <div className="page-content">
          <div className="calendar-header">
            <button
              onClick={goToPrevWeek}
              className="nav-button"
              title="Tuần trước"
            >
              <FaChevronLeft />
            </button>
            <h2>
              Tuần {format(currentWeekStart, "dd/MM")} -{" "}
              {format(currentWeekEnd, "dd/MM/yyyy")}
            </h2>
            <button
              onClick={goToCurrentWeek}
              className="nav-button today-button"
              title="Về tuần hiện tại"
            >
              Hiện tại
            </button>
            <button
              onClick={goToNextWeek}
              className="nav-button"
              title="Tuần sau"
            >
              <FaChevronRight />
            </button>
          </div>

          {showMainLoading ? (
            <div className="loading-message">
              <FaSpinner className="spinner" /> Đang tải dữ liệu...
            </div>
          ) : (
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
                  {routes.map((route) => (
                    <tr key={route.id}>
                      <td className="route-name-cell">{route.routeName}</td>
                      {daysInWeek.map((day) => {
                        const schedule = findSchedule(route.id, day);
                        return (
                          <td
                            key={`${route.id}-${day.toString()}`}
                            className={`calendar-cell ${
                              schedule ? "has-schedule" : "empty-cell"
                            }`}
                            onClick={() =>
                              schedule
                                ? handleViewSchedule(schedule)
                                : handleAddSchedule(
                                    route.id,
                                    route.routeName,
                                    day
                                  )
                            }
                            title={
                              schedule
                                ? `Xem/Xóa lịch trình`
                                : `Thêm lịch trình cho ${
                                    route.routeName
                                  } ngày ${format(day, "dd/MM")}`
                            }
                          >
                            {schedule && (
                              <div className="schedule-item">
                                <div className="schedule-time">
                                  {schedule.pickupTime?.substring(0, 5)} -{" "}
                                  {schedule.dropOffTime?.substring(0, 5)}
                                </div>
                                <div className="schedule-driver">
                                  {schedule.driverName || "N/A"}
                                </div>
                                <div className="schedule-bus">
                                  {schedule.busName || "N/A"}
                                </div>
                              </div>
                            )}
                            {/* Icon loading nhỏ khi đang tải schedules */}
                            {isLoadingSchedules && (
                              <FaSpinner className="cell-spinner" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Hiển thị nếu không có routes */}
                  {routes.length === 0 && !isLoadingRoutes && (
                    <tr>
                      <td colSpan={8} className="no-routes-message">
                        Không có dữ liệu tuyến đường.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ScheduleListPageNew;
