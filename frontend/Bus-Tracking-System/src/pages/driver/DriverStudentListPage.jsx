import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DriverHomePage.css"; // Tái sử dụng layout chung
import "./DriverStudentListPage.css"; // Sẽ tạo ở bước 2
// import "./CustomStatusDropdown.css"; // Sẽ tạo ở bước 3
import "../../components/CustomStatusDropdown.css";
import ReportIncidentModal from "../../components/driver/ReportIncidentModal";
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
} from "react-icons/fa";
import { format } from "date-fns";
// import { vi } from "date-fns/locale";

// --- DEMO DATA ---
// Danh sách học sinh gốc (sẽ không thay đổi)
const mockStudentRoster = Array.from({ length: 12 }, (_, i) => ({
  id: `HS${101 + i}`,
  name:
    i % 3 === 0
      ? `Phan Viết Huy ${i}`
      : i % 3 === 1
      ? `Nguyễn Văn An ${i}`
      : `Lê Thị Cẩm ${i}`,
  class: `12A${(i % 5) + 1}`,
  pickupPoint:
    i % 2 === 0 ? "273 An Dương Vương, P.3, Q.5" : "Trạm công viên Khánh Hội",
  parentName: `Phụ huynh ${i + 1}`,
  parentPhone: `090xxxx${String(i).padStart(3, "0")}`,
}));

// Các lựa chọn trạng thái
const statusOptions = [
  {
    value: "chua-len-xe",
    label: "Chưa lên xe",
    icon: <FaQuestionCircle />,
    color: "#888",
  },
  {
    value: "da-don",
    label: "Đã đón",
    icon: <FaCheckCircle />,
    color: "#27ae60",
  },
  {
    value: "da-tra",
    label: "Đã trả",
    icon: <FaCheckCircle />,
    color: "#3498db",
  },
  { value: "vang", label: "Vắng", icon: <FaTimesCircle />, color: "#e74c3c" },
];

// Hàm khởi tạo trạng thái ban đầu cho học sinh
const initializeStudentList = () => {
  return mockStudentRoster.map((student) => ({
    ...student,
    status: "chua-len-xe", // Trạng thái ban đầu
  }));
};
// --- END DEMO DATA ---

// --- COMPONENT DROPDOWN TRẠNG THÁI (TÙY CHỈNH) ---
const CustomStatusDropdown = ({ options, selectedValue, onChange }) => {
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
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: selectedOption.color,
          borderColor: selectedOption.color + "80",
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
  // State riêng biệt cho 2 chuyến
  const [pickupStudents, setPickupStudents] = useState(initializeStudentList());
  const [returnStudents, setReturnStudents] = useState(initializeStudentList());

  const [currentDate] = useState(new Date()); // Lấy ngày hiện tại
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false); // Modal báo cáo

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

  // Hàm cập nhật trạng thái
  const handleStatusChange = (studentId, newStatus) => {
    if (activeTab === "pickup") {
      setPickupStudents((prevList) =>
        prevList.map((student) =>
          student.id === studentId ? { ...student, status: newStatus } : student
        )
      );
    } else {
      setReturnStudents((prevList) =>
        prevList.map((student) =>
          student.id === studentId ? { ...student, status: newStatus } : student
        )
      );
    }
  };

  // Kiểm tra xem có thể hoàn thành chuyến đi không
  const canCompleteTrip = currentStudentList.every(
    (student) => student.status !== "chua-len-xe"
  );

  // Hàm xử lý khi nhấn nút hoàn thành
  const handleCompleteTrip = () => {
    if (!canCompleteTrip) {
      alert(
        "Vui lòng cập nhật trạng thái cho tất cả học sinh trước khi hoàn thành!"
      );
      return;
    }
    alert(
      `Đã hoàn thành chuyến ${activeTab === "pickup" ? "Đưa đi" : "Đón về"}!`
    );
    // Sau này sẽ gọi API POST ở đây
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
                disabled={!canCompleteTrip}
              >
                <FaCheckCircle /> Hoàn thành chuyến đi
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
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DriverStudentListPage;
