import React, { useState, useEffect, useMemo } from "react";
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
  FaCalendarDay,
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
            ? format(parseISO(schedule.scheduleDate), "EEEE, dd/MM/yyyy", {
                locale: vi,
              })
            : "N/A"}
        </p>
        <p>
          <strong>Giờ đi:</strong>{" "}
          {schedule.pickupTime?.substring(0, 5) || "N/A"}
        </p>
        <p>
          <strong>Giờ về:</strong>{" "}
          {schedule.dropOffTime?.substring(0, 5) || "N/A"}
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
          {/* Nút xóa chỉ hoạt động khi có ID */}
          <button
            className="delete-schedule-btn"
            onClick={() => onDelete(schedule.id)}
            disabled={!schedule.id}
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
        <p className="confirm-text">
          {" "}
          {/* Sửa lại class */}
          Bạn có chắc muốn xóa lịch trình cho tuyến{" "}
          <strong>{scheduleInfo?.routeName}</strong> vào ngày{" "}
          <strong>
            {scheduleInfo?.date
              ? format(parseISO(scheduleInfo.date), "dd/MM/yyyy")
              : ""}
          </strong>{" "}
          ({scheduleInfo?.time})? {/* Thêm giờ */}
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
  const [deletingScheduleInfo, setDeletingScheduleInfo] = useState(null); // Lưu { id, routeName, date, time }
  const [error, setError] = useState(null); // State báo lỗi

  const navigate = useNavigate();

  // --- HÀM GỌI API ---
  const fetchRoutes = async () => {
    console.log("Fetching routes...");
    setIsLoadingRoutes(true);
    setError(null); // Reset lỗi khi fetch
    try {
      const response = await axios.get(
        `https://localhost:7229/api/v1/route/all?PageNumber=1&PageSize=100`
      ); // Lấy nhiều routes
      console.log("Routes API response:", response.data);
      setRoutes(response.data.items || []);
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
    setError(null); // Reset lỗi khi fetch
    try {
      const response = await axios.get(
        `https://localhost:7229/api/v1/schedule/all`
      );
      console.log("Schedules API response:", response.data);
      setSchedules(Array.isArray(response.data) ? response.data : []);
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
  const goToCurrentWeek = () => setCurrentDate(new Date()); // Nút về tuần hiện tại

  // Tìm lịch trình cho ô cụ thể (trả về mảng vì có thể có nhiều lịch trong ngày)
  const findSchedulesForCell = (routeId, date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return schedules.filter(
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
    setDeletingScheduleInfo(null);
  };

  const handleDeleteRequest = (scheduleId) => {
    const scheduleToDelete = schedules.find((s) => s.id === scheduleId);
    if (scheduleToDelete) {
      console.log(`Requesting delete for schedule ID: ${scheduleId}`);
      // Lưu thêm thông tin để hiển thị trong confirm modal
      setDeletingScheduleInfo({
        id: scheduleId,
        routeName: getRouteName(scheduleToDelete.routeId),
        date: scheduleToDelete.scheduleDate,
        time: `${scheduleToDelete.pickupTime?.substring(
          0,
          5
        )} - ${scheduleToDelete.dropOffTime?.substring(0, 5)}`,
      });
      setViewingSchedule(null); // Đóng modal xem nếu đang mở
    }
  };

  // --- HÀM XÁC NHẬN XÓA (GỌI API DELETE) ---
  const handleConfirmDelete = async () => {
    if (!deletingScheduleInfo || !deletingScheduleInfo.id) return;
    const scheduleIdToDelete = deletingScheduleInfo.id;
    console.log(`Confirming delete for schedule ID: ${scheduleIdToDelete}`);

    try {
      const apiUrl = `https://localhost:7229/api/v1/schedule/${scheduleIdToDelete}`;
      console.log("Calling DELETE API:", apiUrl);
      const response = await axios.delete(apiUrl);
      if (response.status === 200 || response.status === 204) {
        alert("Đã xóa lịch trình thành công!");
        // Cập nhật lại state schedules bằng cách loại bỏ phần tử đã xóa
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleIdToDelete));
      } else {
        alert(`Xóa lịch trình thất bại. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Lỗi khi xóa lịch trình:", err);
      const errorMsg =
        err.response?.data?.title || err.response?.data || err.message;
      alert(`Lỗi khi xóa lịch trình: ${errorMsg}`);
    } finally {
      handleCloseModals(); // Đóng modal xác nhận
    }
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

  // --- LẤY TÊN TUYẾN ĐƯỜNG (Tối ưu dùng useMemo) ---
  const routeNameMap = useMemo(() => {
    return routes.reduce((map, route) => {
      map[route.id] = route.routeName;
      return map;
    }, {});
  }, [routes]); // Chỉ tính lại khi routes thay đổi
  const getRouteName = (routeId) => routeNameMap[routeId] || "Không rõ";

  // --- KIỂM TRA TRẠNG THÁI LOADING VÀ LỖI ---
  if (error && routes.length === 0 && schedules.length === 0) {
    // Chỉ báo lỗi nghiêm trọng khi không load đc gì
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
  const showMainLoading = isLoadingRoutes || isLoadingSchedules;

  return (
    <>
      {/* Modal Xem chi tiết */}
      <ScheduleDetailModal
        isOpen={!!viewingSchedule}
        schedule={viewingSchedule}
        routeName={viewingSchedule ? getRouteName(viewingSchedule.routeId) : ""}
        onClose={handleCloseModals}
        onDelete={handleDeleteRequest} // Truyền hàm xử lý yêu cầu xóa
      />
      {/* Modal Xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={!!deletingScheduleInfo}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete} // Truyền hàm xác nhận xóa
        scheduleInfo={deletingScheduleInfo} // Truyền thông tin lịch trình cần xóa
      />

      <main className="main-content-area schedule-calendar-page">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý lịch trình</span> /{" "}
            <span>Lịch trình theo tuần</span>
          </div>
          {/* Có thể thêm nút Tìm kiếm,... ở đây nếu cần */}
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
            {/* Nút về tuần hiện tại */}
            <button
              onClick={goToCurrentWeek}
              className="nav-button today-button"
              title="Về tuần hiện tại"
            >
              <FaCalendarDay /> {/* Icon khác */}
            </button>
            <button
              onClick={goToNextWeek}
              className="nav-button"
              title="Tuần sau"
            >
              <FaChevronRight />
            </button>
          </div>

          {showMainLoading && schedules.length === 0 && routes.length === 0 ? ( // Chỉ hiển thị loading lớn khi chưa có dữ liệu gì
            <div className="loading-message">
              <FaSpinner className="spinner" /> Đang tải dữ liệu...
            </div>
          ) : (
            <div className="calendar-grid-container">
              <table className="calendar-grid">
                <thead>
                  <tr>
                    <th className="route-header-cell">
                      {isLoadingRoutes ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        "Tuyến đường"
                      )}
                    </th>
                    {daysInWeek.map((day) => (
                      <th key={day.toISOString()} className="day-header-cell">
                        <div>{format(day, "EEEE", { locale: vi })}</div>
                        <div>{format(day, "dd/MM")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routes.length === 0 && !isLoadingRoutes ? (
                    <tr>
                      <td colSpan={8} className="no-routes-message">
                        Không có dữ liệu tuyến đường.
                      </td>
                    </tr>
                  ) : (
                    routes.map((route) => (
                      <tr key={route.id}>
                        <td className="route-name-cell">{route.routeName}</td>
                        {daysInWeek.map((day) => {
                          // Tìm tất cả lịch trình cho ô này
                          const cellSchedules = findSchedulesForCell(
                            route.id,
                            day
                          );
                          return (
                            <td
                              key={`${route.id}-${day.toISOString()}`}
                              className={`calendar-cell ${
                                cellSchedules.length > 0
                                  ? "has-schedule"
                                  : "empty-cell"
                              }`}
                              onClick={() =>
                                cellSchedules.length === 0
                                  ? handleAddSchedule(
                                      route.id,
                                      route.routeName,
                                      day
                                    )
                                  : null
                              } // Chỉ add khi ô trống
                              title={
                                cellSchedules.length === 0
                                  ? `Thêm lịch trình`
                                  : `Click vào lịch trình để xem`
                              }
                            >
                              {/* Hiển thị nhiều lịch trình nếu có */}
                              {cellSchedules.map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="schedule-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSchedule(schedule);
                                  }} // Click vào item để xem
                                >
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
                              ))}
                              {/* Icon loading nhỏ khi đang tải schedules */}
                              {isLoadingSchedules && (
                                <FaSpinner className="cell-spinner" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
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
