import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "./ScheduleAddEditPageNew.css"; // Sẽ tạo ở bước 5
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { FaSpinner } from "react-icons/fa"; // Icon loading

// --- Axios instance with credentials ---
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

const ScheduleAddEditPageNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy dữ liệu từ state khi navigate
  const { routeId, routeName, date, returnWeekInfo } = location.state || {};

  console.log("=== ScheduleAddEditPageNew Loaded ===");
  console.log("Location state:", location.state);
  console.log("routeId:", routeId);
  console.log("routeName:", routeName);
  console.log("date:", date);
  console.log("returnWeekInfo:", returnWeekInfo);

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
      console.log("=== Fetching dropdown data ===");
      console.log("For date:", date);
      setIsLoadingDropdowns(true);
      try {
        // QUAN TRỌNG: Truyền dateInWeek parameter để backend check availability
        const params = { dateInWeek: date }; // date đã là string "YYYY-MM-DD"
        console.log("Dropdown API params:", params);

        // Gọi API lấy drivers với parameter dateInWeek
        const driverResponse = await api.get("/api/v1/driver/dropdown", { params });
        console.log("Drivers dropdown response:", driverResponse.data);
        
        // LƯU TẤT CẢ drivers (kể cả bận) để hiển thị trong dropdown
        const allDrivers = Array.isArray(driverResponse.data) ? driverResponse.data : [];
        setDrivers(allDrivers);
        
        // Tự động chọn tài xế RẢNH đầu tiên
        const firstAvailableDriver = allDrivers.find((d) => d.canClickable);
        if (firstAvailableDriver) {
          setSelectedDriverId(firstAvailableDriver.id);
        } else if (allDrivers.length > 0) {
          // Nếu không có ai rảnh, chọn người đầu tiên (sẽ báo lỗi khi submit)
          setSelectedDriverId(allDrivers[0].id);
        }

        // Gọi API lấy buses với parameter dateInWeek
        const busResponse = await api.get("/api/v1/bus/dropdown", { params });
        console.log("Buses dropdown response:", busResponse.data);
        
        // LƯU TẤT CẢ buses (kể cả bận) để hiển thị trong dropdown
        const allBuses = Array.isArray(busResponse.data) ? busResponse.data : [];
        setBuses(allBuses);
        
        // Tự động chọn xe buýt RẢNH đầu tiên
        const firstAvailableBus = allBuses.find((b) => b.canClickable);
        if (firstAvailableBus) {
          setSelectedBusId(firstAvailableBus.id);
        } else if (allBuses.length > 0) {
          // Nếu không có xe rảnh, chọn xe đầu tiên (sẽ báo lỗi khi submit)
          setSelectedBusId(allBuses[0].id);
        }
        
        console.log("Available drivers:", allDrivers.filter(d => d.canClickable).length);
        console.log("Available buses:", allBuses.filter(b => b.canClickable).length);
        
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
      navigate("/schedule");
    } else {
      fetchDropdownData(); // Gọi fetch data nếu có đủ thông tin
    }
  }, [routeId, routeName, date, navigate]); // Dependencies

  // --- Xử lý Lưu ---
  const handleSave = async (e) => {
    e.preventDefault();

    console.log("=== handleSave called ===");

    // Kiểm tra đã chọn tài xế và xe buýt chưa
    if (!selectedDriverId || !selectedBusId) {
      alert("Vui lòng chọn tài xế và xe buýt.");
      return;
    }

    // KIỂM TRA xem driver/bus có bận không (canClickable = false)
    const selectedDriver = drivers.find(d => d.id === parseInt(selectedDriverId));
    const selectedBus = buses.find(b => b.id === parseInt(selectedBusId));
    
    if (selectedDriver && !selectedDriver.canClickable) {
      alert(`⚠️ Tài xế "${selectedDriver.driverName}" đã có lịch trình khác trong ngày này. Vui lòng chọn tài xế khác.`);
      return;
    }
    
    if (selectedBus && !selectedBus.canClickable) {
      alert(`⚠️ Xe buýt "${selectedBus.busName}" đã có lịch trình khác trong ngày này. Vui lòng chọn xe buýt khác.`);
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

    console.log("=== Submitting schedule data ===");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("Return week info:", returnWeekInfo);

    try {
      const response = await api.post("/api/v1/schedule/create", payload);
      console.log("=== API POST schedule response ===");
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      
      if (response.status === 200 || response.status === 201) {
        alert("Thêm lịch trình thành công!");
        console.log("=== Navigating back to schedule list ===");
        console.log("Passing state:", { 
          refreshSchedules: true,
          returnToWeek: returnWeekInfo?.weekStartDate
        });
        // Navigate về trang schedule với flag refresh và thông tin tuần
        navigate("/schedule", {
          state: { 
            refreshSchedules: true,
            returnToWeek: returnWeekInfo?.weekStartDate
          },
        });
      } else {
        alert(`Thêm lịch trình thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("=== Lỗi khi thêm lịch trình ===");
      console.error("Error:", error);
      console.error("Response:", error.response);
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
    navigate("/schedule"); // Quay về trang schedule
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
            onClick={() => navigate("/schedule")}
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
                    <option 
                      key={driver.id} 
                      value={driver.id}
                      disabled={!driver.canClickable}
                      style={{ 
                        color: driver.canClickable ? 'inherit' : '#999',
                        fontStyle: driver.canClickable ? 'normal' : 'italic'
                      }}
                    >
                      {driver.driverName} {!driver.canClickable && '(Đã có lịch)'}
                    </option>
                  ))}
                </select>
                {drivers.length > 0 && drivers.every(d => !d.canClickable) && (
                  <small style={{ color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                    ⚠️ Tất cả tài xế đều đã có lịch trong ngày này
                  </small>
                )}
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
                    <option 
                      key={bus.id} 
                      value={bus.id}
                      disabled={!bus.canClickable}
                      style={{ 
                        color: bus.canClickable ? 'inherit' : '#999',
                        fontStyle: bus.canClickable ? 'normal' : 'italic'
                      }}
                    >
                      {bus.busName} {!bus.canClickable && '(Đã có lịch)'}
                    </option>
                  ))}
                </select>
                {buses.length > 0 && buses.every(b => !b.canClickable) && (
                  <small style={{ color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                    ⚠️ Tất cả xe buýt đều đã có lịch trong ngày này
                  </small>
                )}
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
