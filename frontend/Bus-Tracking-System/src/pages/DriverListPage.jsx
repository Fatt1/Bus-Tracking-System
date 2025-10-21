import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import "./DriverListPage.css";
import "../pages/LayoutTable.css";
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

// --- COMPONENT MODAL CHUNG ---
const DriverModal = ({ mode, driver, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Map dữ liệu từ API (nếu có) hoặc reset form cho mode 'add'
    const initialData =
      mode === "add"
        ? {
            // Dựa theo Request body của API POST
            phoneNumber: "",
            dateOfBirth: "", // API yêu cầu format "YYYY-MM-DDTHH:mm:ss.sssZ"
            idCard: "",
            fullName: "",
            address: "",
            gender: 0, // 0 cho Nam, 1 cho Nữ
            busId: 0,
          }
        : {
            // Map dữ liệu từ driver được chọn (GET API)
            phoneNumber: driver?.phone || "",
            dateOfBirth: driver?.birthDate
              ? driver.birthDate.split("T")[0]
              : "", // Chỉ lấy phần YYYY-MM-DD để hiển thị
            idCard: driver?.citizenId || "",
            fullName: driver?.name || "",
            address: driver?.address || "",
            gender: driver?.gender === "Nam" ? 0 : 1,
            busId: parseInt(driver?.busId?.replace("B", ""), 10) || 0,
          };
    setFormData(initialData);
  }, [driver, mode, isOpen]); // Thêm isOpen để reset form khi mở lại

  if (!isOpen) return null;

  const isReadOnly = mode === "view";
  const title =
    mode === "add"
      ? "Thêm Tài Xế Mới"
      : mode === "edit"
      ? "Chỉnh Sửa Thông Tin Tài Xế"
      : "Thông Tin Chi Tiết Tài Xế";

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Chuyển đổi giá trị cho đúng kiểu dữ liệu API cần
    const processedValue = type === "radio" ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Xử lý lại dateOfBirth để có định dạng ISO string mà API yêu cầu
    const dataToSave = {
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      busId: parseInt(formData.busId, 10) || 0, // Đảm bảo busId là số
    };

    onSave(dataToSave);
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
          {/* Các trường input được đổi `name` và `value` để khớp với API */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Họ tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="busId">Xe buýt phụ trách (ID)</label>
              <input
                type="number"
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
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              readOnly={isReadOnly}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={handleChange}
              readOnly={isReadOnly}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="idCard">Căn cước công dân</label>
            <input
              type="text"
              id="idCard"
              name="idCard"
              value={formData.idCard || ""}
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
                  value={0}
                  checked={formData.gender === 0}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />{" "}
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value={1}
                  checked={formData.gender === 1}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />{" "}
                Nữ
              </label>
            </div>
          </div>
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

// --- COMPONENT MODAL XÁC NHẬN XÓA (Giữ nguyên logic client-side) ---
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
    {/* API chưa trả về busId nên tạm hiển thị 'N/A' */}
    <td>{driver.busId || "N/A"}</td>
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

// Component chính của trang
const DriverListPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    driver: null,
  });
  const [driverToDelete, setDriverToDelete] = useState(null);
  const itemsPerPage = 6;

  // Hàm để tải lại danh sách tài xế
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://localhost:7229/api/v1/driver/all"
      );

      // *** SỬA LỖI Ở ĐÂY ***
      // 1. Kiểm tra xem `response.data` có phải là một mảng không.
      const data = Array.isArray(response.data) ? response.data : [];

      // 2. Map dữ liệu từ mảng `data` đã được kiểm tra.
      const formattedDrivers = data.map((d) => ({
        id: d.id,
        name: d.fullName,
        busId: null,
        phone: d.phoneNumber,
        birthDate: d.dateOfBirth,
        citizenId: d.idCard,
        address: d.address,
        gender: d.gender === 0 ? "Nam" : "Nữ",
      }));
      setDrivers(formattedDrivers);
      setTotalPages(Math.ceil(formattedDrivers.length / itemsPerPage));
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
      // Đặt mảng rỗng nếu có lỗi để tránh crash
      setDrivers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component được render lần đầu
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Logic phân trang phía client (Giữ nguyên)
  const currentDrivers = drivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAddModal = () =>
    setModalState({ isOpen: true, mode: "add", driver: null });
  const handleOpenViewModal = (driver) =>
    setModalState({ isOpen: true, mode: "view", driver });
  const handleOpenEditModal = (driver) =>
    setModalState({ isOpen: true, mode: "edit", driver });
  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "add", driver: null });
    setDriverToDelete(null);
  };

  // Xử lý lưu (chỉ POST)
  const handleSaveDriver = async (driverData) => {
    if (modalState.mode === "add") {
      try {
        await axios.post(
          "https://localhost:7229/api/v1/driver/create",
          driverData
        );
        // Sau khi POST thành công, gọi lại API GET để cập nhật danh sách
        fetchDrivers();
      } catch (error) {
        console.error("Lỗi khi thêm tài xế mới:", error);
      }
    } else if (modalState.mode === "edit") {
      // Logic sửa tạm thời (client-side)
      alert("Chức năng sửa đang được phát triển!");
      // Tạm thời, chúng ta sẽ cập nhật state ở client
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) =>
          d.id === modalState.driver.id
            ? {
                ...d,
                ...driverData,
                name: driverData.fullName,
                citizenId: driverData.idCard,
                phone: driverData.phoneNumber,
              }
            : d
        )
      );
    }
    handleCloseModal();
  };

  const handleOpenDeleteConfirm = (driver) => setDriverToDelete(driver);

  // Logic xóa tạm thời (client-side)
  const handleDeleteConfirm = () => {
    alert("Chức năng xóa đang được phát triển!");
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
          <div className="breadcrumbs">
            <span>Trang</span> / <span>Quản lý tài xế</span> /{" "}
            <span>Danh sách tài xế</span>
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

          {isLoading ? (
            <div className="loading-message">Đang tải dữ liệu...</div>
          ) : (
            <>
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
                    {currentDrivers.length > 0 ? (
                      currentDrivers.map((driver) => (
                        <DriverRow
                          key={driver.id}
                          driver={driver}
                          onView={handleOpenViewModal}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteConfirm}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          Không có dữ liệu tài xế.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default DriverListPage;
