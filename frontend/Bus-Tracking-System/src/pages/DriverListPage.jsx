import React, { useState, useEffect } from "react";
import "./DriverListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- DEMO DATA ---
const initialDrivers = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `Phan Viết Huy ${i + 1}`,
  busId: `B00${(i % 5) + 1}`,
  phone: `098765432${i % 10}`,
  birthDate: `2004-05-0${(i % 9) + 1}`, // Format YYYY-MM-DD
  citizenId: `1234567890${i % 100}`,
  address: "273 An Dương Vương, P.3, Q.5",
  gender: i % 2 === 0 ? "Nam" : "Nữ",
}));
// --- END DEMO DATA ---

// --- COMPONENT MODAL CHUNG ---
// Modal này sẽ xử lý cả 3 trường hợp: Thêm, Xem, và Sửa
const DriverModal = ({ mode, driver, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  // useEffect để cập nhật form data khi driver prop thay đổi
  useEffect(() => {
    // Nếu là mode 'add', reset form. Nếu là 'view' hoặc 'edit', điền thông tin driver.
    const initialData =
      mode === "add"
        ? {
            name: "",
            busId: "",
            phone: "",
            birthDate: "",
            citizenId: "",
            address: "",
            gender: "Nam",
          }
        : driver;
    setFormData(initialData);
  }, [driver, mode]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const title =
    mode === "add"
      ? "Thêm Tài Xế Mới"
      : mode === "edit"
      ? "Chỉnh Sửa Thông Tin Tài Xế"
      : "Thông Tin Chi Tiết Tài Xế";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h3>36 36 BUS BUS</h3>
          <h4>{title}</h4>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="busId">Xe buýt phụ trách</label>
              <input
                type="text"
                id="busId"
                name="busId"
                value={formData.busId || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              readOnly={isReadOnly}
              required
            />
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
            <label htmlFor="citizenId">Căn cước công dân</label>
            <input
              type="text"
              id="citizenId"
              name="citizenId"
              value={formData.citizenId || ""}
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
          {/* Chỉ hiển thị nút khi không phải mode 'view' */}
          {!isReadOnly && (
            <button type="submit" className="modal-submit-btn">
              Xác Nhận
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, driverName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>Xác nhận xóa</h4>
        </div>
        <p className="confirm-text">
          Bạn có chắc chắn muốn xóa tài xế <strong>{driverName}</strong> không?
          Hành động này không thể hoàn tác.
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

// Component 1 dòng trong bảng
const DriverRow = ({ driver, onView, onEdit, onDelete }) => (
  <tr>
    <td>{driver.id}</td>
    <td>{driver.name}</td>
    <td>{driver.busId}</td>
    <td>
      <button
        className="action-btn-driver file-btn"
        onClick={() => onView(driver)}
      >
        <FaFileAlt />
      </button>
    </td>
    <td>
      <div className="action-buttons">
        <button
          className="action-btn-driver delete-btn"
          onClick={() => onDelete(driver)}
        >
          <FaMinusCircle />
        </button>
        <button
          className="action-btn-driver edit-btn"
          onClick={() => onEdit(driver)}
        >
          <FaPen />
        </button>
      </div>
    </td>
  </tr>
);

// Component Phân trang
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

// Component chính của trang
const DriverListPage = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    driver: null,
  });
  const [driverToDelete, setDriverToDelete] = useState(null);
  const itemsPerPage = 6;

  // Logic phân trang
  const currentDrivers = drivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(drivers.length / itemsPerPage);

  // Mở modal để thêm mới
  const handleOpenAddModal = () => {
    setModalState({ isOpen: true, mode: "add", driver: null });
  };

  // Mở modal để xem
  const handleOpenViewModal = (driver) => {
    setModalState({ isOpen: true, mode: "view", driver: driver });
  };

  // Mở modal để sửa
  const handleOpenEditModal = (driver) => {
    setModalState({ isOpen: true, mode: "edit", driver: driver });
  };

  // Đóng tất cả modal
  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "add", driver: null });
    setDriverToDelete(null);
  };

  // Lưu (Thêm mới hoặc Cập nhật)
  const handleSaveDriver = (driverData) => {
    if (modalState.mode === "add") {
      setDrivers((prev) => [...prev, { ...driverData, id: prev.length + 1 }]);
    } else if (modalState.mode === "edit") {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverData.id ? driverData : d))
      );
    }
  };

  // Mở hộp thoại xác nhận xóa
  const handleOpenDeleteConfirm = (driver) => {
    setDriverToDelete(driver);
  };

  // Xác nhận xóa
  const handleDeleteConfirm = () => {
    setDrivers((prev) => prev.filter((d) => d.id !== driverToDelete.id));
    handleCloseModal();
  };

  return (
    <>
      <DriverModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        driver={modalState.driver}
        onClose={handleCloseModal}
        onSave={handleSaveDriver}
      />
      <ConfirmDeleteModal
        isOpen={!!driverToDelete}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        driverName={driverToDelete?.name}
      />
      <main className="main-content-area">
        <header className="page-header">
          {/* ... code header giữ nguyên ... */}
        </header>

        <div className="page-content">
          <div className="content-header">
            <h2>Danh sách tài xế</h2>
            <div className="header-controls">
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
                  <th>Tên tài xế</th>
                  <th>Xe phụ trách</th>
                  <th>Hồ sơ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.map((driver) => (
                  <DriverRow
                    key={driver.id}
                    driver={driver}
                    onView={handleOpenViewModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteConfirm}
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

export default DriverListPage;
