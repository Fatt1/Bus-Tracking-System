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

// Thêm request interceptor để log mọi request
api.interceptors.request.use(
  (config) => {
    console.log("=== AXIOS REQUEST ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    console.log("Headers:", config.headers);
    console.log("Data:", config.data);
    console.log("Params:", config.params);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Thêm response interceptor để log mọi response
api.interceptors.response.use(
  (response) => {
    console.log("=== AXIOS RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("Headers:", response.headers);
    return response;
  },
  (error) => {
    console.error("=== AXIOS ERROR ===");
    console.error("Error:", error);
    console.error("Response:", error.response);
    return Promise.reject(error);
  }
);

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
    console.log("Selected date:", date);
    console.log("Selected routeId:", routeId);
    console.log("Selected driverId:", selectedDriverId);
    console.log("Selected busId:", selectedBusId);

    // Kiểm tra đã chọn tài xế và xe buýt chưa
    if (!selectedDriverId || !selectedBusId) {
      alert("Vui lòng chọn tài xế và xe buýt.");
      return;
    }

    // KIỂM TRA xem driver/bus có bận không (canClickable = false)
    const selectedDriver = drivers.find(d => d.id === parseInt(selectedDriverId));
    const selectedBus = buses.find(b => b.id === parseInt(selectedBusId));
    
    console.log("Selected driver object:", selectedDriver);
    console.log("Selected bus object:", selectedBus);
    
    if (selectedDriver && !selectedDriver.canClickable) {
      console.warn("Driver is NOT available (canClickable = false)");
      alert(`⚠️ Tài xế "${selectedDriver.driverName}" đã có lịch trình khác trong ngày này. Vui lòng chọn tài xế khác.`);
      return;
    }
    
    if (selectedBus && !selectedBus.canClickable) {
      console.warn("Bus is NOT available (canClickable = false)");
      alert(`⚠️ Xe buýt "${selectedBus.busName}" đã có lịch trình khác trong ngày này. Vui lòng chọn xe buýt khác.`);
      return;
    }

    console.log("✅ Driver and bus are available, proceeding to POST...");

    // VALIDATE date format
    if (!date || typeof date !== 'string') {
      console.error("❌ Invalid date:", date);
      alert(`Lỗi: Ngày không hợp lệ (${date})`);
      return;
    }
    
    // Kiểm tra date có đúng format YYYY-MM-DD không
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.error("❌ Date format is wrong:", date);
      alert(`Lỗi: Định dạng ngày sai. Cần: YYYY-MM-DD, nhận được: ${date}`);
      return;
    }
    
    console.log("✅ Date format is valid:", date);

    // Chuẩn bị payload cho API POST /schedule/create
    const payload = {
      scheduleDate: date, // Lấy từ state navigate - PHẢI LÀ "YYYY-MM-DD"
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
      console.log("Calling POST /api/v1/schedule/create...");
      const response = await api.post("/api/v1/schedule/create", payload);
      console.log("=== API POST schedule response ===");
      console.log("Full response object:", response);
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Data:", response.data);
      console.log("Data type:", typeof response.data);
      console.log("Data stringified:", JSON.stringify(response.data));
      console.log("Headers:", response.headers);
      
      // CHECK chi tiết response.data có Id không
      if (response.data && response.data.id) {
        console.log("✅ Response contains schedule ID:", response.data.id);
      } else {
        console.warn("⚠️ Response does NOT contain schedule ID!");
        console.warn("This might indicate the schedule was not saved to database.");
      }
      
      if (response.status === 200 || response.status === 201) {
        console.log("✅ POST SUCCESS - Schedule created!");
        
        // KIỂM TRA xem backend có trả về error trong success response không
        if (response.data && response.data.isSuccess === false) {
          console.error("❌ Backend returned success status but isSuccess=false!");
          console.error("Error from backend:", response.data.error);
          alert(`Lỗi từ backend: ${JSON.stringify(response.data.error)}`);
          return;
        }
        
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
        console.error("❌ POST FAILED - Unexpected status:", response.status);
        alert(`Thêm lịch trình thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("=== ❌ Lỗi khi thêm lịch trình ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
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
