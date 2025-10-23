import React, { useState } from "react";
import "./RouteListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng (Bạn cần đảm bảo file này tồn tại)
import { FaMapMarkerAlt, FaPlus, FaTimes } from "react-icons/fa";

// --- DEMO DATA ---
// Thêm dữ liệu học sinh mẫu cho mỗi tuyến
const allRoutes = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name:
    i % 3 === 0
      ? "Lê Duẩn - Nguyễn Thị Minh Khai - Điện Biên Phủ"
      : "An Dương Vương - Trần Hưng Đạo",
  stops: "Trạm kcn Tân - Bình Trạm bệnh viện Tân Phú - Đại học sài gòn", // Thêm thông tin trạm dừng
  studentCount: Math.floor(Math.random() * 50) + 5, // Random từ 5 đến 54 học sinh
  students: Array.from(
    { length: Math.floor(Math.random() * 50) + 5 },
    (v, k) => ({
      // Tạo danh sách học sinh mẫu
      id: `HS${i + 1}-${k + 1}`,
      name: k === 0 ? "Phan Viết Huy" : `Học sinh mẫu ${k + 1}`, // Đa dạng hóa tên
      pickupPoint: k % 2 === 0 ? "Trạm kcn Tân" : "Trạm bệnh viện Tân Phú", // Đa dạng hóa điểm đón
    })
  ),
  mapUrl: "#", // Placeholder cho link bản đồ
}));
// --- END DEMO DATA ---

// --- COMPONENT MODAL HIỂN THỊ DANH SÁCH HỌC SINH ---
const StudentListModal = ({ isOpen, onClose, routeName, students }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content student-list-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        {/* Header của Modal giống trong ảnh */}
        <div className="modal-header">
          <h3>36 36 BUS BUS</h3>
          <h4>Danh sách học sinh tuyến: {routeName}</h4>
        </div>
        {/* Bảng danh sách học sinh */}
        <div className="student-list-table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên học sinh</th>
                <th>Điểm đón</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.pickupPoint}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    Không có học sinh nào trên tuyến này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Component 1 dòng trong bảng (Đã cập nhật theo yêu cầu)
const RouteRow = ({ route, onViewStudents }) => (
  <tr>
    <td>{route.id}</td>
    <td>{route.name}</td>
    <td>{route.stops}</td>
    {/* Cột Số học sinh (Đã sửa) */}
    <td className="student-count-cell">
      <div>{route.studentCount}</div>
      {/* Nút/Link Xem danh sách */}
      {route.studentCount > 0 && (
        <button
          className="view-students-btn"
          onClick={() => onViewStudents(route)}
        >
          Xem danh sách
        </button>
      )}
    </td>
    {/* Cột Bản đồ */}
    <td className="cell-center">
      <button className="map-btn">
        <FaMapMarkerAlt />
      </button>
    </td>
  </tr>
);

// Component Phân trang (Giữ nguyên)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination-container">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <button onClick={() => onPageChange(number)}>{number}</button>
          </li>
        ))}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

// Component chính của trang (Đã cập nhật state cho modal)
const RouteListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null); // Lưu thông tin tuyến đang xem
  const itemsPerPage = 6;

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoutes = allRoutes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allRoutes.length / itemsPerPage);

  // Hàm mở modal
  const handleViewStudents = (route) => {
    setSelectedRoute(route);
    setIsStudentModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setSelectedRoute(null); // Reset khi đóng
  };

  return (
    <>
      {/* Render Modal */}
      <StudentListModal
        isOpen={isStudentModalOpen}
        onClose={handleCloseStudentModal}
        routeName={selectedRoute?.name}
        students={selectedRoute?.students || []}
      />

      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý xe buýt</span> /{" "}
            <span>Danh sách tuyến đường</span>
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
          <div className="content-header">
            <h2>Danh sách tuyến đường</h2>
            <div className="header-controls">
              <button className="control-btn add-btn">
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên tuyến đường</th>
                  <th>Các trạm</th>
                  <th>Số học sinh</th>
                  <th>Bản đồ</th>
                </tr>
              </thead>
              <tbody>
                {currentRoutes.map((route) => (
                  <RouteRow
                    key={route.id}
                    route={route}
                    onViewStudents={handleViewStudents}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </>
  );
};

export default RouteListPage;
