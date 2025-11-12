import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "./ScheduleListPageNew.css"; // Sẽ tạo ở bước 3
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
  FaPen,
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
  parseISO,
} from "date-fns";
import { vi, enUS } from "date-fns/locale"; // Import Vietnamese and English locale

// --- Import api instance từ utils ---
import api from "../../utils/api";
import AdminHeader from "../../components/admin/AdminHeader"; // Import AdminHeader

// --- COMPONENT MODAL XEM/XÓA/CHỈNH SỬA LỊCH TRÌNH ---
const ScheduleDetailModal = ({
  schedule,
  routeName,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  onViewHistory, // Thêm prop này
}) => {
  const { t } = useTranslation();

  if (!isOpen || !schedule) return null;

  // Hàm chuyển đổi status number sang text
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return t("schedule.statusInactive"); // InActive
      case 1:
        return t("schedule.statusActive"); // Active
      case 2:
        return t("schedule.statusCompleted"); // Completed
      default:
        return t("schedule.statusUnknown");
    }
  };

  // Kiểm tra xem có hiển thị nút "Xem lịch sử" không (ngày <= hôm nay)
  const canViewHistory = () => {
    if (!schedule.scheduleDate) return false;
    const scheduleDate = parseISO(schedule.scheduleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset giờ để so sánh chỉ ngày
    return scheduleDate <= today;
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
        <h4>{t("schedule.scheduleDetail")}</h4>
        <p>
          <strong>{t("schedule.route")}:</strong> {routeName}
        </p>
        <p>
          <strong>{t("schedule.date")}:</strong>{" "}
          {schedule.scheduleDate
            ? format(parseISO(schedule.scheduleDate), "EEEE, dd/MM/yyyy", {
                locale: vi,
              })
            : "N/A"}
        </p>
        <p>
          <strong>{t("schedule.pickupTime")}:</strong>{" "}
          {schedule.pickupTime?.substring(0, 5) || "N/A"}
        </p>
        <p>
          <strong>{t("schedule.dropOffTime")}:</strong>{" "}
          {schedule.dropOffTime?.substring(0, 5) || "N/A"}
        </p>
        <p>
          <strong>{t("schedule.driver")}:</strong>{" "}
          {schedule.driverName || "N/A"}
        </p>
        <p>
          <strong>{t("schedule.bus")}:</strong> {schedule.busName || "N/A"}
        </p>
        <p>
          <strong>{t("common.status")}:</strong>{" "}
          {getStatusText(schedule.status)}
        </p>
        <div className="modal-actions">
          {/* Nút Xem lịch sử - Chỉ hiển thị khi ngày <= hôm nay */}
          {canViewHistory() && (
            <button
              className="delete-schedule-btn view-history-btn"
              onClick={() => onViewHistory(schedule)}
              title={t("schedule.viewHistoryTooltip")}
            >
              {t("schedule.viewHistory")}
            </button>
          )}
          {/* Nút sửa và xóa chỉ hoạt động khi có ID */}
          <button
            className="delete-schedule-btn"
            onClick={() => onEdit(schedule)}
            disabled={!schedule.id}
            title={
              schedule.status !== 0
                ? t("schedule.editOnlyInactive")
                : t("common.edit")
            }
          >
            <FaPen /> {t("common.edit")}
          </button>
          <button
            className="delete-schedule-btn"
            onClick={() => onDelete(schedule.id)}
            disabled={!schedule.id}
          >
            <FaTrashAlt /> {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL CHỈNH SỬA LỊCH TRÌNH ---
const ScheduleEditModal = ({
  schedule,
  routeName,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();

  const [pickupTime, setPickupTime] = useState("");
  const [dropOffTime, setDropOffTime] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [status, setStatus] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [currentBusId, setCurrentBusId] = useState(null);

  useEffect(() => {
    if (!isOpen || !schedule) return;
    // Prefill fields from schedule list DTO
    setPickupTime(
      schedule.pickupTime ? schedule.pickupTime.substring(0, 5) : "06:00"
    );
    setDropOffTime(
      schedule.dropOffTime ? schedule.dropOffTime.substring(0, 5) : "07:00"
    );
    setStatus(schedule.status ?? 0);

    // Fetch schedule details to get current driverId and busId
    const fetchDetailAndDropdowns = async () => {
      setIsLoadingDropdowns(true);
      try {
        // 1) Fetch detail by id to get current driver/bus names
        const detailRes = await api.get(`/api/v1/schedule/${schedule.id}`);
        const detail = detailRes.data || {};
        console.log("Edit Modal - Full detail response:", detail);

        // 2) Fetch dropdowns for the schedule date FIRST
        const params = { dateInWeek: schedule.scheduleDate };
        const [driverRes, busRes] = await Promise.all([
          api.get("/api/v1/driver/dropdown", { params }),
          api.get("/api/v1/bus/dropdown", { params }),
        ]);
        let allDrivers = Array.isArray(driverRes.data) ? driverRes.data : [];
        let allBuses = Array.isArray(busRes.data) ? busRes.data : [];

        console.log("Edit Modal - API Drivers:", allDrivers);
        console.log("Edit Modal - API Buses:", allBuses);

        // Normalize all IDs to numbers
        allDrivers = allDrivers.map((d) => ({ ...d, id: Number(d.id) }));
        allBuses = allBuses.map((b) => ({ ...b, id: Number(b.id) }));

        // 3) Find current driver/bus ID by matching NAME from detail response
        const currentDriverName =
          detail.driverName || schedule.driverName || "";
        const currentBusName = detail.busName || schedule.busName || "";

        console.log("Edit Modal - Looking for driver name:", currentDriverName);
        console.log("Edit Modal - Looking for bus name:", currentBusName);

        const matchedDriver = allDrivers.find(
          (d) =>
            d.driverName && d.driverName.trim() === currentDriverName.trim()
        );
        const matchedBus = allBuses.find(
          (b) => b.busName && b.busName.trim() === currentBusName.trim()
        );

        const finalDriverId = matchedDriver ? Number(matchedDriver.id) : null;
        const finalBusId = matchedBus ? Number(matchedBus.id) : null;

        console.log("Edit Modal - Matched Driver:", matchedDriver);
        console.log("Edit Modal - Matched Bus:", matchedBus);
        console.log("Edit Modal - Final Driver ID:", finalDriverId);
        console.log("Edit Modal - Final Bus ID:", finalBusId);

        setCurrentDriverId(finalDriverId);
        setCurrentBusId(finalBusId);

        // 4) Force current driver/bus to be clickable (override API's canClickable)
        allDrivers = allDrivers.map((d) => ({
          ...d,
          canClickable: d.id === finalDriverId ? true : d.canClickable,
        }));
        allBuses = allBuses.map((b) => ({
          ...b,
          canClickable: b.id === finalBusId ? true : b.canClickable,
        }));

        setDrivers(allDrivers);
        setBuses(allBuses);

        // 5) Preselect CURRENT driver/bus
        console.log("Edit Modal - Setting selectedDriverId to:", finalDriverId);
        console.log("Edit Modal - Setting selectedBusId to:", finalBusId);
        setSelectedDriverId(finalDriverId || "");
        setSelectedBusId(finalBusId || "");
      } catch (err) {
        console.error("Lỗi khi tải chi tiết/dropdowns (edit):", err);
        alert("Không thể tải thông tin để chỉnh sửa lịch trình.");
        onClose();
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    fetchDetailAndDropdowns();
  }, [isOpen, schedule, onClose]);

  if (!isOpen || !schedule) return null;

  const isEditable = schedule.status === 0; // Only editable when InActive

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      alert(
        "Chỉ có thể chỉnh sửa khi lịch trình ở trạng thái 'Chưa hoạt động'."
      );
      return;
    }
    // Validate selections
    if (!selectedDriverId || !selectedBusId) {
      alert("Vui lòng chọn tài xế và xe buýt.");
      return;
    }
    const driverObj = drivers.find((d) => d.id === Number(selectedDriverId));
    const busObj = buses.find((b) => b.id === Number(selectedBusId));
    if (
      driverObj &&
      !driverObj.canClickable &&
      driverObj.id !== Number(currentDriverId)
    ) {
      alert(`⚠️ Tài xế "${driverObj.driverName}" đã có lịch trong ngày này.`);
      return;
    }
    if (busObj && !busObj.canClickable && busObj.id !== Number(currentBusId)) {
      alert(`⚠️ Xe buýt "${busObj.busName}" đã có lịch trong ngày này.`);
      return;
    }

    const payload = {
      id: schedule.id,
      scheduleDate: schedule.scheduleDate,
      driverId: parseInt(selectedDriverId),
      busId: parseInt(selectedBusId),
      routeId: schedule.routeId,
      pickupTime: pickupTime,
      dropOffTime: dropOffTime,
      status: parseInt(status),
    };

    try {
      const res = await api.put(`/api/v1/schedule/${schedule.id}`, payload);
      if (res.status === 200 || res.status === 204) {
        alert("Cập nhật lịch trình thành công!");
        onSaved();
      } else {
        alert(`Cập nhật lịch trình thất bại. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật lịch trình:", err);
      const msg =
        err.response?.data?.errors ||
        err.response?.data?.title ||
        err.response?.data ||
        err.message;
      alert(
        `Lỗi khi cập nhật lịch trình: ${
          typeof msg === "object" ? JSON.stringify(msg) : msg
        }`
      );
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
        <h4>{t("schedule.editSchedule")}</h4>
        <form onSubmit={handleSave} className="modal-form">
          <p>
            <strong>{t("schedule.route")}:</strong> {routeName}
          </p>
          <p>
            <strong>{t("schedule.date")}:</strong>{" "}
            {schedule.scheduleDate
              ? format(parseISO(schedule.scheduleDate), "EEEE, dd/MM/yyyy", {
                  locale: vi,
                })
              : "N/A"}
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>{t("schedule.pickupTime")}</label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                disabled={!isEditable}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("schedule.dropOffTime")}</label>
              <input
                type="time"
                value={dropOffTime}
                onChange={(e) => setDropOffTime(e.target.value)}
                disabled={!isEditable}
                required
              />
            </div>
          </div>

          {isLoadingDropdowns ? (
            <div className="loading-message">
              <FaSpinner className="spinner" />{" "}
              {t("schedule.loadingDriversBuses")}
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>{t("schedule.driver")}</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  disabled={!isEditable}
                  required
                >
                  <option value="" disabled>
                    {t("schedule.selectDriver")}
                  </option>
                  {drivers.map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                      disabled={
                        !d.canClickable && d.id !== Number(currentDriverId)
                      }
                    >
                      {d.driverName}{" "}
                      {!d.canClickable && d.id !== Number(currentDriverId)
                        ? t("schedule.alreadyScheduled")
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t("schedule.bus")}</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  disabled={!isEditable}
                  required
                >
                  <option value="" disabled>
                    {t("schedule.selectBus")}
                  </option>
                  {buses.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={
                        !b.canClickable && b.id !== Number(currentBusId)
                      }
                    >
                      {b.busName}{" "}
                      {!b.canClickable && b.id !== Number(currentBusId)
                        ? t("schedule.alreadyScheduled")
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>{t("common.status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!isEditable}
            >
              <option value={0}>{t("schedule.statusInactive")}</option>
              <option value={1}>{t("schedule.statusActive")}</option>
              <option value={2}>{t("schedule.statusCompleted")}</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="delete-schedule-btn"
              onClick={onClose}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="delete-schedule-btn"
              disabled={!isEditable}
            >
              {t("common.save")}
            </button>
          </div>
          {!isEditable && (
            <small style={{ color: "#e67e22" }}>
              {t("schedule.editOnlyInactive")}
            </small>
          )}
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, scheduleInfo }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete-schedule"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={30} color="#e74c3c" />
          <h4>{t("schedule.confirmDelete")}</h4>
        </div>
        <p className="confirm-text">
          {" "}
          {/* Sửa lại class */}
          {t("schedule.deleteMessage", {
            route: scheduleInfo?.routeName,
            date: scheduleInfo?.date
              ? format(parseISO(scheduleInfo.date), "dd/MM/yyyy")
              : "",
            time: scheduleInfo?.time,
          })}
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm}
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: LỊCH TRÌNH THEO TUẦN ---
const ScheduleListPageNew = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date()); // Bắt đầu từ ngày hiện tại
  const [schedules, setSchedules] = useState([]); // State lưu lịch trình từ API
  const [routes, setRoutes] = useState([]); // State lưu tuyến đường từ API
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingScheduleInfo, setDeletingScheduleInfo] = useState(null); // Lưu { id, routeName, date, time }
  const [error, setError] = useState(null); // State báo lỗi
  const lastLocationKey = useRef(null); // Track location key để tránh process trùng

  const navigate = useNavigate();

  // --- HÀM GỌI API ---
  const fetchRoutes = async () => {
    console.log("Fetching routes...");
    setIsLoadingRoutes(true);
    setError(null); // Reset lỗi khi fetch
    try {
      const response = await api.get("/api/v1/route/all", {
        params: { PageNumber: 1, PageSize: 100 },
      }); // Lấy nhiều routes
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

  const fetchSchedules = useCallback(async (dateForWeek) => {
    // dateForWeek PHẢI được truyền vào, không dùng currentDate từ closure
    const dateString = format(dateForWeek, "yyyy-MM-dd");

    console.log(
      "=== Fetching schedules for week containing date:",
      dateString,
      "==="
    );
    setIsLoadingSchedules(true);
    setError(null); // Reset lỗi khi fetch
    try {
      const response = await api.get("/api/v1/schedule/all", {
        params: {
          DateInWeek: dateString, // QUAN TRỌNG: Truyền date để backend biết tuần nào
        },
      });
      console.log("Schedules API response:", response.data);
      console.log("Number of schedules returned:", response.data?.length || 0);
      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch trình:", err);
      setError("Không thể tải danh sách lịch trình.");
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []); // KHÔNG CÓ dependency - hàm này stable

  // useEffect để fetch dữ liệu khi component mount lần đầu
  useEffect(() => {
    fetchRoutes();
  }, []); // Chỉ chạy 1 lần khi mount

  // useEffect để fetch schedules khi currentDate thay đổi (chuyển tuần)
  useEffect(() => {
    console.log(
      "=== Current date changed, fetching schedules for new week ==="
    );
    console.log("Current date:", currentDate);
    fetchSchedules(currentDate); // Truyền currentDate vào
  }, [currentDate, fetchSchedules]); // Dependencies: currentDate và fetchSchedules (stable)

  // useEffect để fetch lại schedules khi quay về từ trang add (phát hiện qua location.state)
  useEffect(() => {
    // Chỉ xử lý nếu có refreshSchedules flag VÀ chưa process key này
    if (!location.state?.refreshSchedules) return;
    if (lastLocationKey.current === location.key) return; // Đã process rồi

    console.log("=== Location state changed ===");
    console.log("location.state:", location.state);
    console.log("location.key:", location.key);

    lastLocationKey.current = location.key; // Đánh dấu đã process

    console.log("=== Detected refresh flag ===");

    // Nếu có thông tin tuần cần quay về, set lại currentDate
    if (location.state?.returnToWeek) {
      const weekStartDate = parseISO(location.state.returnToWeek);
      console.log(
        "=== Returning to week starting:",
        format(weekStartDate, "yyyy-MM-dd") + " ==="
      );
      // CHỈ set currentDate, KHÔNG gọi fetchSchedules ở đây
      // useEffect khác sẽ tự động fetch khi currentDate thay đổi
      setCurrentDate(weekStartDate);
    } else {
      // Nếu không có returnToWeek, fetch với currentDate hiện tại
      console.log("=== No returnToWeek, fetching with current date ===");
      fetchSchedules(currentDate);
    }

    // Xóa flag để tránh nhầm lẫn
    console.log("=== Clearing navigation state ===");
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, fetchSchedules, currentDate, navigate]);

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
    setEditingSchedule(null);
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
      const response = await api.delete(
        `/api/v1/schedule/${scheduleIdToDelete}`
      );
      console.log("API DELETE response:", response);
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
    const weekStartDate = format(currentWeekStart, "yyyy-MM-dd");
    console.log(
      `Navigating to add schedule for route ${routeId} (${routeName}) on date ${dateString}`
    );
    console.log(`Current week start date: ${weekStartDate}`);
    console.log(`Passing data:`, {
      routeId,
      routeName,
      date: dateString,
      returnWeekInfo: { weekStartDate },
    });

    // Lưu tuần hiện tại vào state để quay về đúng tuần
    navigate("/schedule/add", {
      state: {
        routeId,
        routeName,
        date: dateString,
        returnWeekInfo: { weekStartDate },
      },
    });
  };

  // --- HÀM CHUYỂN TRANG XEM LỊCH SỬ ---
  const handleViewHistory = (schedule) => {
    console.log(`Navigating to history for schedule ID: ${schedule.id}`);
    navigate(`/schedule/history/${schedule.id}`, {
      state: {
        schedule: schedule, // Truyền toàn bộ schedule info
        routeName: getRouteName(schedule.routeId),
      },
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
            fetchSchedules(currentDate);
          }}
        >
          {t("schedule.retry")}
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
        onEdit={(s) => {
          setEditingSchedule(s);
          setViewingSchedule(null);
        }}
        onViewHistory={handleViewHistory} // Truyền hàm chuyển trang lịch sử
      />
      {/* Modal Chỉnh sửa */}
      <ScheduleEditModal
        isOpen={!!editingSchedule}
        schedule={editingSchedule}
        routeName={editingSchedule ? getRouteName(editingSchedule.routeId) : ""}
        onClose={handleCloseModals}
        onSaved={() => {
          setEditingSchedule(null);
          fetchSchedules(currentDate);
        }}
      />
      {/* Modal Xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={!!deletingScheduleInfo}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete} // Truyền hàm xác nhận xóa
        scheduleInfo={deletingScheduleInfo} // Truyền thông tin lịch trình cần xóa
      />

      <main className="main-content-area schedule-calendar-page">
        <AdminHeader breadcrumbs={t("schedule.breadcrumb")} />

        <div className="page-content">
          <div className="calendar-header">
            <button
              onClick={goToPrevWeek}
              className="nav-button"
              title={t("schedule.prevWeek")}
            >
              <FaChevronLeft />
            </button>
            <h2>
              {t("schedule.week")} {format(currentWeekStart, "dd/MM")} -{" "}
              {format(currentWeekEnd, "dd/MM/yyyy")}
            </h2>
            {/* Nút về tuần hiện tại */}
            <button
              onClick={goToCurrentWeek}
              className="nav-button today-button"
              title={t("schedule.currentWeek")}
            >
              <FaCalendarDay /> {/* Icon khác */}
            </button>
            <button
              onClick={goToNextWeek}
              className="nav-button"
              title={t("schedule.nextWeek")}
            >
              <FaChevronRight />
            </button>
          </div>

          {showMainLoading && schedules.length === 0 && routes.length === 0 ? ( // Chỉ hiển thị loading lớn khi chưa có dữ liệu gì
            <div className="loading-message">
              <FaSpinner className="spinner" /> {t("common.loading")}
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
                        t("schedule.route")
                      )}
                    </th>
                    {daysInWeek.map((day) => (
                      <th key={day.toISOString()} className="day-header-cell">
                        <div>
                          {format(day, "EEEE", {
                            locale: i18n.language === "vi" ? vi : enUS,
                          })}
                        </div>
                        <div>{format(day, "dd/MM")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routes.length === 0 && !isLoadingRoutes ? (
                    <tr>
                      <td colSpan={8} className="no-routes-message">
                        {t("route.noData")}
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
