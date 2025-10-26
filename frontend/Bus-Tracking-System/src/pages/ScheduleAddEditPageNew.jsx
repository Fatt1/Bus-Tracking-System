import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "./ScheduleAddEditPageNew.css"; // Sẽ tạo ở bước 5
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaSpinner } from "react-icons/fa"; // Icon loading
import { parseISO } from "date-fns";
const ScheduleAddEditPageNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu từ state khi navigate
  const { routeId, routeName, date } = location.state || {};

  // State cho form
  const [pickupTime, setPickupTime] = useState("06:00");
  const [dropOffTime, setDropOffTime] = useState("07:00");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");

  // State cho dropdowns
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // --- Fetch dữ liệu cho dropdowns ---
  useEffect(() => {
    const fetchDropdownData = async () => {
      console.log("Fetching dropdown data...");
      setIsLoadingDropdowns(true);
      try {
        // Gọi API lấy drivers
        const driverResponse = await axios.get(
          "https://localhost:7229/api/v1/driver/dropdown"
        );
        console.log("Drivers dropdown response:", driverResponse.data);
        // Lọc chỉ lấy tài xế có canClickable: true
        const availableDrivers = (
          Array.isArray(driverResponse.data) ? driverResponse.data : []
        ).filter((d) => d.canClickable);
        setDrivers(availableDrivers);
        // Tự động chọn tài xế đầu tiên nếu có
        if (availableDrivers.length > 0) {
          setSelectedDriverId(availableDrivers[0].id);
        }

        // Gọi API lấy buses
        const busResponse = await axios.get(
          "https://localhost:7229/api/v1/bus/dropdown"
        );
        console.log("Buses dropdown response:", busResponse.data);
        // Lọc chỉ lấy xe buýt có canClickable: true
        const availableBuses = (
          Array.isArray(busResponse.data) ? busResponse.data : []
        ).filter((b) => b.canClickable);
        setBuses(availableBuses);
        // Tự động chọn xe buýt đầu tiên nếu có
        if (availableBuses.length > 0) {
          setSelectedBusId(availableBuses[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dropdowns:", error);
        alert("Không thể tải danh sách tài xế hoặc xe buýt.");
        setDrivers([]);
        setBuses([]);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    // Redirect nếu không có dữ liệu cần thiết
    if (!routeId || !routeName || !date) {
      console.warn("Dữ liệu không hợp lệ, quay về trang lịch.");
      navigate("/schedules-new");
    } else {
      fetchDropdownData(); // Gọi fetch data nếu có đủ thông tin
    }
  }, [routeId, routeName, date, navigate]); // Dependencies

  // --- Xử lý Lưu ---
  const handleSave = async (e) => {
    e.preventDefault();

    // Kiểm tra đã chọn tài xế và xe buýt chưa
    if (!selectedDriverId || !selectedBusId) {
      alert("Vui lòng chọn tài xế và xe buýt.");
      return;
    }

    // Chuẩn bị payload cho API POST /schedule/create
    const payload = {
      scheduleDate: date, // Lấy từ state navigate
      driverId: parseInt(selectedDriverId),
      busId: parseInt(selectedBusId),
      routeId: routeId, // Lấy từ state navigate
      pickupTime: pickupTime, // Giờ đi
      dropOffTime: dropOffTime, // Giờ về
    };

    console.log("Submitting schedule data:", payload);

    try {
      const response = await axios.post(
        "https://localhost:7229/api/v1/schedule/create",
        payload
      );
      console.log("API POST schedule response:", response);
      if (response.status === 200 || response.status === 201) {
        alert("Thêm lịch trình thành công!");
        // Không cần lưu vào localStorage nữa vì trang lịch sẽ fetch lại từ API
        navigate(-1); // Quay lại trang lịch
      } else {
        alert(`Thêm lịch trình thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Lỗi khi thêm lịch trình:", error);
      // Hiển thị lỗi cụ thể từ backend nếu có
      const errorMsg =
        error.response?.data?.errors || // Lỗi validation cụ thể
        error.response?.data?.title || // Lỗi chung từ ProblemDetails
        error.response?.data || // Các lỗi khác từ data
        error.message; // Lỗi mạng hoặc lỗi khác
      alert(
        `Lỗi khi thêm lịch trình: ${
          typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg
        }`
      );
    }
  };

  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước (trang lịch)
  };

  // Định dạng lại ngày để hiển thị
  const formattedDate = date
    ? format(parseISO(`${date}T00:00:00`), "EEEE, dd/MM/yyyy", { locale: vi })
    : "N/A";

  return (
    // Sử dụng LayoutTable.css cho phần header và page-content
    <main className="main-content-area add-schedule-form-page">
      <header className="page-header">
        <div className="breadcrumbs">
          <span>Trang</span> /{" "}
          <span
            onClick={() => navigate("/schedules-new")}
            style={{ cursor: "pointer", color: "#0a2e5d" }}
          >
            Quản lý lịch trình
          </span>{" "}
          / <span>Thêm lịch trình mới</span>
        </div>
      </header>

      <div className="page-content">
        <h2>Thêm lịch trình mới</h2>
        <form onSubmit={handleSave} className="add-schedule-form">
          <div className="form-group readonly-group">
            <label>Tuyến đường</label>
            <input type="text" value={routeName || "N/A"} readOnly disabled />
          </div>
          <div className="form-group readonly-group">
            <label>Ngày</label>
            <input type="text" value={formattedDate} readOnly disabled />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupTime">Giờ đi</label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dropOffTime">Giờ về</label>
              <input
                type="time"
                id="dropOffTime"
                name="dropOffTime"
                value={dropOffTime}
                onChange={(e) => setDropOffTime(e.target.value)}
                required
              />
            </div>
          </div>

          {isLoadingDropdowns ? (
            <div className="loading-message">
              <FaSpinner className="spinner" /> Đang tải tài xế/xe buýt...
            </div>
          ) : (
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
                  {drivers.map((driver) => (
                    // API dropdown trả về driverName
                    <option key={driver.id} value={driver.id}>
                      {driver.driverName}
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
                  {buses.map((bus) => (
                    // API dropdown trả về busName
                    <option key={bus.id} value={bus.id}>
                      {bus.busName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-actions add-form-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="action-btn-form confirm-btn"
              disabled={isLoadingDropdowns}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ScheduleAddEditPageNew;
