import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaEllipsisH,
  FaTimes,
} from "react-icons/fa";
import { format } from "date-fns"; // Import hàm format

// --- DEMO DATA ---
const initialStudents = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  firstName: "Phan Viết", // Tách họ tên
  lastName: `Huy ${i + 1}`,
  class: `12A${(i % 5) + 1}`,
  birthDate: `2005-03-${String(10 + (i % 20)).padStart(2, "0")}`, // Format YYYY-MM-DD
  address: "196 Hoàng Diệu P.8 Q.4 TPHCM",
  route:
    i % 3 === 0
      ? "Tuyến Nguyễn Hữu Thọ - Khánh Hội"
      : "Tuyến Trường Chinh - Âu Cơ",
  pickupPoint: i % 2 === 0 ? "Trạm công viên khánh hội" : "Trạm Lotte Mart Q7",
  parentName: `Phan Viết Huy`,
  parentPhone: `0987654321`,
  parentAccount: `0987654321`, // Thường là SĐT
}));

// Dữ liệu mẫu cho dropdowns
const mockClasses = ["10A1", "11B2", "12A3", "12A4", "12A5"];
const mockRoutes = [
  "Tuyến Nguyễn Hữu Thọ - Khánh Hội",
  "Tuyến Trường Chinh - Âu Cơ",
  "Tuyến ABC - XYZ",
];
const mockPickupPoints = [
  "Trạm công viên khánh hội",
  "Trạm Lotte Mart Q7",
  "Trạm gần nhà",
  "Trạm ABC",
];
// --- END DEMO DATA ---

// --- COMPONENT MODAL THÊM/SỬA HỌC SINH ---
const StudentModal = ({ mode, student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [parentPassword, setParentPassword] = useState("");

  // Hàm tạo mật khẩu từ ngày sinh
  const generatePassword = (birthDate) => {
    if (!birthDate) return "";
    try {
      // Chỉ lấy DDMMYYYY từ YYYY-MM-DD
      const date = new Date(birthDate + "T00:00:00"); // Thêm giờ để tránh lỗi timezone
      return format(date, "ddMMyyyy");
    } catch (e) {
      console.error("Lỗi định dạng ngày:", e);
      return ""; // Trả về rỗng nếu ngày không hợp lệ
    }
  };

  // useEffect để cập nhật form data khi student prop thay đổi hoặc mở modal add
  useEffect(() => {
    const initialData =
      mode === "add"
        ? {
            firstName: "",
            lastName: "",
            class: mockClasses[0] || "",
            gender: "Nam",
            birthDate: "",
            address: "",
            route: mockRoutes[0] || "",
            pickupPoint: mockPickupPoints[0] || "",
            parentName: "",
            parentPhone: "",
            parentAccount: "",
          }
        : {
            // Map dữ liệu từ student hiện tại
            ...student,
            // Đảm bảo các trường select có giá trị mặc định nếu dữ liệu cũ không có
            class: student?.class || mockClasses[0] || "",
            route: student?.route || mockRoutes[0] || "",
            pickupPoint: student?.pickupPoint || mockPickupPoints[0] || "",
          };
    setFormData(initialData);
    // Cập nhật mật khẩu khi mở modal Sửa hoặc reset khi mở modal Thêm
    setParentPassword(generatePassword(initialData.birthDate));
  }, [student, mode, isOpen]); // Thêm isOpen để reset form khi mở lại

  // useEffect để cập nhật mật khẩu khi ngày sinh thay đổi
  useEffect(() => {
    setParentPassword(generatePassword(formData.birthDate));
  }, [formData.birthDate]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view"; // Có thể thêm mode view sau này
  const title = mode === "add" ? "Thêm học sinh" : "Xem thông tin học sinh";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tạo object student hoàn chỉnh để lưu
    const studentDataToSave = {
      ...formData,
      id: mode === "edit" ? student.id : Date.now(), // Giữ id cũ khi sửa, tạo id mới khi thêm
      parentPassword: parentPassword, // Mật khẩu được tạo tự động
    };
    onSave(studentDataToSave);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content student-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h4>{title}</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form student-form">
          <div className="form-section">
            <h5>Thông Tin Chi Tiết học sinh</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Họ & Tên lót</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class">Lớp</label>
                <select
                  id="class"
                  name="class"
                  value={formData.class || ""}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                >
                  {mockClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <div className="gender-options">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={formData.gender === "Nam"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />{" "}
                    Nam
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={formData.gender === "Nữ"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />{" "}
                    Nữ
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">Ngày sinh</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Địa chỉ thường trú</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="route">Tuyến đường</label>
              <select
                id="route"
                name="route"
                value={formData.route || ""}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              >
                {mockRoutes.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pickupPoint">Điểm đón</label>
              <select
                id="pickupPoint"
                name="pickupPoint"
                value={formData.pickupPoint || ""}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              >
                {mockPickupPoints.map((point) => (
                  <option key={point} value={point}>
                    {point}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-section">
            <h5>Tài khoản phụ huynh</h5>
            <div className="form-group">
              <label htmlFor="parentName">Họ tên phụ huynh</label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={formData.parentName || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="parentPhone">Số điện thoại phụ huynh</label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="parentAccount">Tài khoản</label>
              <input
                type="text"
                id="parentAccount"
                name="parentAccount"
                value={formData.parentAccount || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="parentPassword">Mật khẩu</label>
              <input
                type="text"
                id="parentPassword"
                name="parentPassword"
                value={parentPassword}
                readOnly
                disabled
                placeholder="Ngày sinh học sinh. Ví dụ 09122005"
              />
            </div>
          </div>
          <div className="form-actions modal-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
            {!isReadOnly && (
              <button type="submit" className="action-btn-form confirm-btn">
                Xác Nhận
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Component 1 dòng trong bảng (Đã cập nhật nút Sửa)
const StudentRow = ({ student, onEdit }) => (
  <tr>
    <td>{student.id}</td>
    <td>{`${student.firstName} ${student.lastName}`}</td> {/* Ghép họ tên */}
    <td>{student.class}</td>
    <td>{student.address}</td>
    <td>{student.parentName}</td> {/* Sử dụng parentName */}
    <td>{student.parentPhone}</td> {/* Sử dụng parentPhone */}
    <td>
      <div className="action-buttons">
        <button className="action-btn-student more-btn">
          <FaEllipsisH />
        </button>
        <button className="action-btn-student delete-btn">
          <FaMinusCircle />
        </button>
        {/* Gọi onEdit khi nhấn nút màu vàng */}
        <button
          className="action-btn-student edit-btn"
          onClick={() => onEdit(student)}
        >
          <FaPen />
        </button>
      </div>
    </td>
  </tr>
);

// Component Phân trang (Tái sử dụng)
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

// Component chính của trang (Đã cập nhật)
const StudentListPage = () => {
  const [students, setStudents] = useState(initialStudents); // State chứa danh sách học sinh
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' hoặc 'edit'
  const [studentToEdit, setStudentToEdit] = useState(null); // Học sinh đang được sửa
  const itemsPerPage = 6;

  // Logic phân trang (Giữ nguyên)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Hàm mở modal Thêm
  const handleOpenAddModal = () => {
    setStudentToEdit(null); // Reset studentToEdit
    setModalMode("add");
    setIsModalOpen(true);
  };

  // Hàm mở modal Sửa
  const handleOpenEditModal = (student) => {
    setStudentToEdit(student);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStudentToEdit(null); // Reset khi đóng
  };

  // Hàm xử lý lưu (Thêm hoặc Sửa)
  const handleSaveStudent = (studentData) => {
    if (modalMode === "add") {
      // Logic thêm mới (tạm thời chỉ cập nhật state)
      // Sau này sẽ gọi API POST
      const newStudent = { ...studentData, id: Date.now() }; // Tạo id tạm thời
      setStudents((prev) => [newStudent, ...prev]); // Thêm vào đầu danh sách
      alert("Đã thêm học sinh mới!"); // Thông báo tạm
    } else {
      // Logic sửa (tạm thời chỉ cập nhật state)
      // Sau này sẽ gọi API PUT
      setStudents((prev) =>
        prev.map((s) => (s.id === studentData.id ? studentData : s))
      );
      alert("Đã cập nhật thông tin học sinh!"); // Thông báo tạm
    }
    handleCloseModal(); // Đóng modal sau khi lưu
  };

  return (
    <>
      <StudentModal
        isOpen={isModalOpen}
        mode={modalMode}
        student={studentToEdit}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
      />
      <main className="main-content-area">
        <header className="page-header">
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý học sinh</span> /{" "}
            <span>Danh sách học sinh</span>
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
            <h2>Danh sách học sinh</h2>
            <div className="header-controls">
              {/* Nút thêm học sinh */}
              <button
                onClick={handleOpenAddModal}
                className="control-btn add-btn"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên học sinh</th>
                  <th>Lớp</th>
                  <th>Địa chỉ</th>
                  <th>Phụ huynh</th>
                  <th>Số điện thoại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onEdit={handleOpenEditModal}
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

export default StudentListPage;
