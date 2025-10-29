import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./DriverHomePage.css"; // Tái sử dụng layout chung
import "./DriverStudentListPage.css"; // Sẽ tạo ở bước 2
// import "./CustomStatusDropdown.css"; // Sẽ tạo ở bước 3
import "../../components/CustomStatusDropdown.css";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
import {
  getCurrentTripType,
  TRIP_TYPE,
  STUDENT_STATUS_UI,
  canCompleteTrip,
  savePickupStudents,
  saveDropoffStudents,
  getPickupStudents,
  getDropoffStudents,
  completePickupTrip,
  completeDropoffTrip,
  mapUIStatusToBackend,
  getCurrentScheduleId,
  isPickupTripCompleted,
  isDropoffTripCompleted,
} from "../../utils/tripStateManager";
import {
  FaHome,
  FaTasks,
  FaUserCheck,
  FaBell,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaAngleDown,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaUserClock,
  FaSpinner,
} from "react-icons/fa";
import { format } from "date-fns";
// import { vi } from "date-fns/locale";

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

// --- STATUS OPTIONS ---
// Các lựa chọn trạng thái
const statusOptions = [
  {
    value: STUDENT_STATUS_UI.NOT_BOARDED,
    label: "Chưa lên xe",
    icon: <FaQuestionCircle />,
    color: "#888",
  },
  {
    value: STUDENT_STATUS_UI.PICKED_UP,
    label: "Đã đón",
    icon: <FaCheckCircle />,
    color: "#27ae60",
  },
  {
    value: STUDENT_STATUS_UI.DROPPED_OFF,
    label: "Đã trả",
    icon: <FaCheckCircle />,
    color: "#3498db",
  },
  {
    value: STUDENT_STATUS_UI.ABSENT,
    label: "Vắng",
    icon: <FaTimesCircle />,
    color: "#e74c3c",
  },
];
// --- END STATUS OPTIONS ---

// --- COMPONENT DROPDOWN TRẠNG THÁI (TÙY CHỈNH) ---
const CustomStatusDropdown = ({
  options,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption =
    options.find((opt) => opt.value === selectedValue) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    if (disabled) return;
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div
      className={`status-dropdown ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="dropdown-toggle"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          color: selectedOption.color,
          borderColor: selectedOption.color + "80",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {selectedOption.icon}
        <span>{selectedOption.label}</span>
        <FaAngleDown className={`arrow ${isOpen ? "open" : ""}`} />
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li
              key={option.value}
              className="dropdown-item"
              onClick={() => handleSelect(option.value)}
              style={{ color: option.color }}
            >
              {option.icon}
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- COMPONENT SIDEBAR (CẬP NHẬT ACTIVE) ---
const DriverSidebar = () => {
  const location = useLocation();
  const activePage = location.pathname;

  return (
    <aside className="driver-sidebar">
      <div className="driver-sidebar-header">
        {" "}
        <h3>36 36 BUS BUS</h3>{" "}
      </div>
      <nav className="driver-sidebar-nav">
        <ul>
          <li className={activePage === "/driver/home" ? "active" : ""}>
            <Link to="/driver/home">
              {" "}
              <FaHome /> Trang chủ{" "}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              {" "}
              <FaTasks /> Lịch trình làm việc{" "}
            </Link>
          </li>
          <li className={activePage === "/driver/students" ? "active" : ""}>
            <Link to="/driver/students">
              {" "}
              <FaUserCheck /> Học sinh & điểm đón{" "}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/notifications") ? "active" : ""
            }
          >
            <Link to="/driver/notifications">
              {" "}
              <FaBell /> Thông báo{" "}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

// --- COMPONENT HEADER (GIỮ NGUYÊN) ---
const DriverHeader = ({ onReportIncident, driverName = "Phan Viết Huy" }) => {
  // Component này cũng cần state và logic để mở Profile Modal
  // Tạm thời chỉ là giao diện
  return (
    <header className="driver-header">
      <div className="breadcrumbs">
        <span>Trang</span> / <span>Học sinh & điểm đón</span>
      </div>
      <div className="driver-header-actions">
        <button className="report-incident-btn" onClick={onReportIncident}>
          <FaExclamationTriangle />
          <span>Báo cáo sự cố</span>
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="driver-search-input"
        />
        <div className="driver-user-info" title="Xem thông tin cá nhân">
          <img src="https://i.pravatar.cc/40?u=driver1" alt="Avatar" />
          <span>{driverName}</span>
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT CHÍNH TRANG ĐIỂM DANH ---
const DriverStudentListPage = () => {
  const [activeTab, setActiveTab] = useState("pickup"); // 'pickup' hoặc 'return'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompletingTrip, setIsCompletingTrip] = useState(false);

  // State riêng biệt cho 2 chuyến
  const [pickupStudents, setPickupStudents] = useState([]);
  const [returnStudents, setReturnStudents] = useState([]);

  const [currentDate] = useState(new Date()); // Lấy ngày hiện tại
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false); // Modal báo cáo

  // ======== FETCH DATA FROM API ========
  useEffect(() => {
    console.log("=== DriverStudentListPage mounted ===");
    console.log("📍 Current trip type:", getCurrentTripType());

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current schedule ID from localStorage
        const currentScheduleId = getCurrentScheduleId();
        console.log(
          "📋 Current Schedule ID from localStorage:",
          currentScheduleId
        );

        // Check if we have saved data in localStorage first
        const savedPickup = getPickupStudents();
        const savedDropoff = getDropoffStudents();

        console.log("📦 Saved pickup students:", savedPickup?.length || 0);
        console.log("📦 Saved dropoff students:", savedDropoff?.length || 0);

        // Validate scheduleId in saved data matches current schedule
        let needRefetch = false;
        if (savedPickup && savedPickup.length > 0) {
          const savedScheduleId = savedPickup[0]?.scheduleId;
          console.log(
            "🔍 Saved pickup scheduleId:",
            savedScheduleId,
            "vs Current:",
            currentScheduleId
          );
          if (savedScheduleId && savedScheduleId !== currentScheduleId) {
            console.log("⚠️ ScheduleId mismatch! Need to refetch from API");
            needRefetch = true;
          }
        }

        if (!needRefetch && savedPickup && savedPickup.length > 0) {
          console.log("✅ Loading pickup students from localStorage");
          setPickupStudents(savedPickup);
        }
        if (!needRefetch && savedDropoff && savedDropoff.length > 0) {
          console.log("✅ Loading dropoff students from localStorage");
          setReturnStudents(savedDropoff);
        }

        // If both lists are empty OR scheduleId mismatch, fetch from API
        if (
          needRefetch ||
          ((!savedPickup || savedPickup.length === 0) &&
            (!savedDropoff || savedDropoff.length === 0))
        ) {
          console.log(
            "🌐 Fetching students from API: GET /pickup-student-today"
          );
          const response = await api.get("/pickup-student-today");
          console.log("📥 API Response:", response.data);

          // Map PickupScheduleDriverDTO to UI format
          const mappedStudents = response.data.map((student) => ({
            id: student.studentId,
            name: student.studentName,
            class: student.class,
            pickupPoint: student.stopPointName,
            parentName: student.parentName,
            parentPhone: student.parentPhoneNumber,
            status: STUDENT_STATUS_UI.NOT_BOARDED, // Initial status
            stopPointId: student.stopPointId,
            scheduleId: student.scheduleId,
            userId: student.userId,
          }));

          console.log("✅ Mapped students:", mappedStudents.length);

          // Initialize both lists with the same data
          setPickupStudents(mappedStudents);
          setReturnStudents(mappedStudents);

          // Save to localStorage
          savePickupStudents(mappedStudents);
          saveDropoffStudents(mappedStudents);
          console.log("💾 Saved to localStorage");
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
        setError("Không thể tải danh sách học sinh. Vui lòng thử lại!");
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Chọn danh sách học sinh dựa trên tab
  const currentStudentList =
    activeTab === "pickup" ? pickupStudents : returnStudents;

  // Các tùy chọn dropdown cho 2 tab
  const statusOptionsForPickup = statusOptions.filter(
    (opt) => opt.value !== "da-tra"
  );
  const statusOptionsForReturn = statusOptions.filter(
    (opt) => opt.value !== "da-don"
  );

  // Check if current tab is editable based on trip type
  const isTabEditable = (tabType) => {
    const tripType = getCurrentTripType();

    // Check if currently driving this trip type
    const isCurrentlyDriving =
      tabType === "pickup"
        ? tripType === TRIP_TYPE.PICKUP
        : tripType === TRIP_TYPE.DROPOFF;

    // Check if this trip has already been completed
    const isAlreadyCompleted =
      tabType === "pickup" ? isPickupTripCompleted() : isDropoffTripCompleted();

    const editable = isCurrentlyDriving && !isAlreadyCompleted;

    console.log(`🔒 isTabEditable(${tabType}):`, {
      isCurrentlyDriving,
      isAlreadyCompleted,
      editable,
      tripType,
    });
    return editable;
  };

  // Hàm cập nhật trạng thái
  const handleStatusChange = (studentId, newStatus) => {
    console.log(
      `📝 Status change: Student ${studentId} -> ${newStatus} (Tab: ${activeTab})`
    );

    if (activeTab === "pickup") {
      const updatedList = pickupStudents.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      );
      setPickupStudents(updatedList);
      savePickupStudents(updatedList); // Save to localStorage
      console.log("💾 Saved pickup students to localStorage");
    } else {
      const updatedList = returnStudents.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      );
      setReturnStudents(updatedList);
      saveDropoffStudents(updatedList); // Save to localStorage
      console.log("💾 Saved dropoff students to localStorage");
    }
  };

  // Kiểm tra xem có thể hoàn thành chuyến đi không (using tripStateManager utility)
  const canComplete = canCompleteTrip(currentStudentList);

  // Hàm xử lý khi nhấn nút hoàn thành
  const handleCompleteTrip = async () => {
    console.log("🏁 COMPLETE TRIP CLICKED");
    console.log("  - Active tab:", activeTab);
    console.log("  - Can complete:", canComplete);
    console.log(
      "  - Current student list:",
      currentStudentList.length,
      "students"
    );

    // Check if trip is already completed
    const isAlreadyCompleted =
      activeTab === "pickup"
        ? isPickupTripCompleted()
        : isDropoffTripCompleted();

    if (isAlreadyCompleted) {
      console.log("❌ Cannot complete: Trip already completed");
      alert("Chuyến đi này đã được hoàn thành rồi!");
      return;
    }

    if (!canComplete) {
      console.log("❌ Cannot complete: Some students not updated");
      alert(
        "Vui lòng cập nhật trạng thái cho tất cả học sinh trước khi hoàn thành!"
      );
      return;
    }

    const confirmMessage =
      activeTab === "pickup"
        ? "Bạn có chắc chắn muốn hoàn thành chuyến đưa đi không?"
        : "Bạn có chắc chắn muốn hoàn thành chuyến đón về không?";

    const userConfirmed = window.confirm(confirmMessage);
    if (!userConfirmed) {
      console.log("❌ User cancelled");
      return;
    }

    try {
      setIsCompletingTrip(true);
      const scheduleId = getCurrentScheduleId();
      console.log("📋 Schedule ID:", scheduleId);

      if (!scheduleId) {
        console.log("❌ No schedule ID found");
        alert("Không tìm thấy thông tin lịch trình!");
        return;
      }

      // Map students to backend format
      const studentsDTOs = currentStudentList.map((student) => ({
        scheduleId: scheduleId, // Use the scheduleId from localStorage, not from student object
        studentId: student.id,
        checkingStatus: mapUIStatusToBackend(student.status),
        type: activeTab === "pickup" ? 1 : 2, // 1: Outbound (pickup), 2: Inbound (dropoff)
        stopPointId: student.stopPointId,
      }));

      console.log("📤 Sending to API:", {
        endpoint: "/api/v1/driver/complete-drip",
        scheduleId: scheduleId,
        studentCount: studentsDTOs.length,
        payload: { studentsDTOs },
      });

      // Call API to complete trip
      await api.post("/api/v1/driver/complete-drip", { studentsDTOs });
      console.log("✅ API call successful");

      // Update localStorage trip state
      if (activeTab === "pickup") {
        console.log("💾 Calling completePickupTrip()");
        completePickupTrip();
      } else {
        console.log("💾 Calling completeDropoffTrip()");
        completeDropoffTrip();
      }

      console.log("✅ Trip completed successfully!");
      alert("Đã hoàn thành chuyến đi thành công!");

      // Navigate back to home page
      console.log("🔄 Navigating to /driver/home");
      window.location.href = "/driver/home";
    } catch (err) {
      console.error("❌ Error completing trip:", err);
      console.error("Error details:", err.response?.data);
      alert("Có lỗi xảy ra khi hoàn thành chuyến đi. Vui lòng thử lại!");
    } finally {
      setIsCompletingTrip(false);
    }
  };

  return (
    <>
      {/* Modal Báo cáo sự cố */}
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      <div className="driver-page-container">
        <DriverSidebar />
        <div className="driver-main-wrapper">
          <DriverHeader onReportIncident={() => setIsIncidentModalOpen(true)} />

          <main className="driver-main-content student-attendance-page">
            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <FaSpinner
                  style={{
                    animation: "spin 1s linear infinite",
                    fontSize: "2rem",
                  }}
                />
                <p>Đang tải danh sách học sinh...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#e74c3c",
                }}
              >
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Main Content */}
            {!loading && !error && (
              <>
                {/* Header của trang điểm danh */}
                <div className="student-list-header">
                  <div className="date-picker-group">
                    <label>Ngày</label>
                    <div className="date-input-wrapper">
                      <input
                        type="text"
                        value={format(currentDate, "dd/MM/yyyy")}
                        readOnly
                      />
                      <FaCalendarAlt className="icon" />
                    </div>
                  </div>

                  <div className="student-list-tabs">
                    <button
                      className={`tab-btn ${
                        activeTab === "pickup" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("pickup")}
                    >
                      Đưa đi
                    </button>
                    <button
                      className={`tab-btn ${
                        activeTab === "return" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("return")}
                    >
                      Đón về
                    </button>
                  </div>

                  <button
                    className="complete-trip-btn"
                    onClick={handleCompleteTrip}
                    disabled={
                      !canComplete ||
                      !isTabEditable(activeTab) ||
                      isCompletingTrip
                    }
                  >
                    {isCompletingTrip ? (
                      <>
                        <FaSpinner
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Hoàn thành chuyến đi
                      </>
                    )}
                  </button>
                </div>

                {/* Bảng danh sách học sinh */}
                <div className="student-table-container">
                  <table className="student-attendance-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên học sinh</th>
                        <th>Lớp</th>
                        <th>Địa điểm đón/trả</th>
                        <th>Phụ huynh</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudentList.map((student, index) => (
                        <tr key={student.id}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.class}</td>
                          <td>{student.pickupPoint}</td>
                          <td>{student.parentName}</td>
                          <td>{student.parentPhone}</td>
                          <td>
                            <CustomStatusDropdown
                              options={
                                activeTab === "pickup"
                                  ? statusOptionsForPickup
                                  : statusOptionsForReturn
                              }
                              selectedValue={student.status}
                              onChange={(newStatus) =>
                                handleStatusChange(student.id, newStatus)
                              }
                              disabled={!isTabEditable(activeTab)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default DriverStudentListPage;
