import React, { useState, useEffect } from "react";
// Bỏ import axios vì chưa dùng
import "./DriverListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaFileAlt, // Icon nút Xem (màu xanh dương)
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { format } from "date-fns"; // Import hàm format

// --- DEMO DATA ---
// Cập nhật cấu trúc dữ liệu mẫu để phù hợp hơn với modal
const initialDriversData = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  firstName: "Phan Viết", // Tách họ tên lót
  lastName: `Huy ${i + 1}`, // Tên
  busId: `BUS-${String((i % 5) + 1).padStart(3, "0")}`, // Format BUS-001
  phone: `098765432${i % 10}`,
  birthDate: `2004-05-${String((i % 9) + 1).padStart(2, "0")}`, // Format YYYY-MM-DD
  citizenId: `1234567890${String(i).padStart(2, "0")}`, // CCCD
  address: `196 Hoàng Diệu Phường ${(i % 10) + 1} Quận 4 TPHCM`, // Địa chỉ
  gender: i % 2 === 0 ? "Nam" : "Nữ", // Giới tính
  // Thêm trạng thái giả lập theo thiết kế mới
  status:
    i % 3 === 0 ? "Nghỉ phép" : i % 3 === 1 ? "Tạm ngưng" : "Đang làm việc",
  assignment: i % 2 === 0 ? `Tuyến ${i + 1}` : "Chưa phân công", // Phân công giả lập
}));
// --- END DEMO DATA ---

// --- COMPONENT MODAL THÊM/XEM/SỬA TÀI XẾ (Layout 2 cột) ---
const DriverModal = ({ mode, driver, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [accountUsername, setAccountUsername] = useState(""); // State cho Tài khoản
  const [accountPassword, setAccountPassword] = useState(""); // State cho Mật khẩu

  // Hàm tạo mật khẩu từ ngày sinh (DDMMYYYY)
  const generatePassword = (birthDate) => {
    if (!birthDate || birthDate.length !== 10) return ""; // Kiểm tra format YYYY-MM-DD
    try {
      const [year, month, day] = birthDate.split("-");
      if (!day || !month || !year) return ""; // Kiểm tra ngày hợp lệ
      return `${day}${month}${year}`;
    } catch (e) {
      console.error("Lỗi định dạng ngày sinh:", e);
      return "";
    }
  };

  // useEffect để cập nhật form data khi props thay đổi hoặc modal mở
  useEffect(() => {
    const initialData =
      mode === "add"
        ? {
            // Dữ liệu mặc định khi thêm mới
            firstName: "",
            lastName: "",
            busId: "",
            phone: "",
            birthDate: "",
            citizenId: "",
            address: "",
            gender: "Nam", // Mặc định giới tính Nam
          }
        : {
            // Map dữ liệu từ driver hiện tại khi sửa/xem
            ...driver,
            // Đảm bảo các trường có giá trị, nếu không thì là chuỗi rỗng
            firstName: driver?.firstName || "",
            lastName: driver?.lastName || "",
            busId: driver?.busId || "",
            phone: driver?.phone || "",
            birthDate: driver?.birthDate || "",
            citizenId: driver?.citizenId || "",
            address: driver?.address || "",
            gender: driver?.gender || "Nam",
          };
    setFormData(initialData);
    // Cập nhật Tài khoản và Mật khẩu khi mở modal
    setAccountUsername(initialData.phone || "");
    setAccountPassword(generatePassword(initialData.birthDate));
  }, [driver, mode, isOpen]); // Chạy khi props thay đổi hoặc modal mở

  // useEffect để cập nhật Tài khoản/Mật khẩu khi SĐT/Ngày sinh trong form thay đổi
  useEffect(() => {
    // Chỉ cập nhật nếu đang ở mode add hoặc edit
    if (mode === "add" || mode === "edit") {
      setAccountUsername(formData.phone || "");
      setAccountPassword(generatePassword(formData.birthDate));
    }
  }, [formData.phone, formData.birthDate, mode]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view"; // Chỉ đọc khi xem
  const title =
    mode === "add"
      ? "Thêm tài xế"
      : mode === "edit"
      ? "Sửa thông tin tài xế"
      : "Xem thông tin tài xế";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tạo object driver hoàn chỉnh để lưu (bao gồm cả ID nếu là edit)
    const driverDataToSave = {
      ...formData, // Lấy tất cả dữ liệu từ form
      id: mode === "edit" ? driver.id : undefined, // Giữ id cũ khi sửa, không cần id khi thêm (sẽ được tạo sau)
      // Không cần gửi accountUsername và accountPassword vì chúng được tạo tự động
    };
    onSave(driverDataToSave); // Gọi hàm onSave từ component cha
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Thêm class driver-modal để có style riêng nếu cần */}
      <div
        className="modal-content driver-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          {/* Bỏ thẻ h3 mặc định */}
          <h4>{title}</h4>
        </div>
        {/* Thêm class driver-form */}
        <form onSubmit={handleSubmit} className="modal-form driver-form">
          {/* Cột 1: Thông tin chi tiết */}
          <div className="form-section">
            <h5>Thông Tin Chi Tiết Tài Xế</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Họ</label>
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
              {/* <div className="form-group">
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
              </div> */}
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
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
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
          </div>

          {/* Cột 2: Tài khoản */}
          <div className="form-section">
            <h5>Tài khoản tài xế</h5>
            <div className="form-group">
              <label htmlFor="accountUsername">Tài khoản</label>
              <input
                type="text"
                id="accountUsername"
                name="accountUsername"
                value={accountUsername} // Hiển thị state tài khoản
                readOnly // Luôn chỉ đọc
                disabled // Không cho sửa
                placeholder="Tự động tạo từ SĐT"
              />
            </div>
            <div className="form-group">
              <label htmlFor="accountPassword">Mật khẩu</label>
              <input
                type="text"
                id="accountPassword"
                name="accountPassword"
                value={accountPassword} // Hiển thị state mật khẩu
                readOnly // Luôn chỉ đọc
                disabled // Không cho sửa
                placeholder="Ngày sinh dạng DDMMYYYY"
              />
            </div>
            {/* Có thể thêm các trường khác liên quan đến tài khoản nếu cần */}
          </div>

          {/* Nút bấm */}
          <div className="form-actions modal-actions">
            <button
              type="button"
              className="action-btn-form cancel-btn"
              onClick={onClose}
            >
              {/* Đổi chữ nút Hủy thành Đóng khi xem */}
              {mode === "view" ? "Đóng" : "Hủy"}
            </button>
            {/* Chỉ hiển thị nút Xác nhận khi Thêm hoặc Sửa */}
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

// --- COMPONENT MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, driverName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Thêm class confirm-delete để có style riêng nếu cần */}
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
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 1 DÒNG TRONG BẢNG ---
const DriverRow = ({ driver, onView, onEdit, onDelete }) => (
  <tr>
    <td style={{ textAlign: "center" }}>{driver.id}</td>
    <td>{`${driver.firstName} ${driver.lastName}`}</td> {/* Ghép họ tên */}
    <td>{driver.phone}</td>
    <td>{driver.status}</td> {/* Hiển thị trạng thái */}
    <td>{driver.assignment}</td> {/* Hiển thị phân công */}
    {/* Căn giữa ô thao tác */}
    <td className="cell-center">
      <div className="action-buttons">
        {/* Nút Xem (Xanh dương) */}
        <button
          className="action-btn-driver view-btn"
          title="Xem thông tin"
          onClick={() => onView(driver)}
        >
          <FaFileAlt />
        </button>
        {/* Nút Xóa (Đỏ) */}
        <button
          className="action-btn-driver delete-btn"
          title="Xóa"
          onClick={() => onDelete(driver)}
        >
          <FaMinusCircle />
        </button>
        {/* Nút Sửa (Vàng) */}
        <button
          className="action-btn-driver edit-btn"
          title="Sửa"
          onClick={() => onEdit(driver)}
        >
          <FaPen />
        </button>
      </div>
    </td>
  </tr>
);

// --- COMPONENT PHÂN TRANG (GIỮ NGUYÊN) ---
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

// --- COMPONENT CHÍNH CỦA TRANG ---
const DriverListPage = () => {
  // State chứa TOÀN BỘ danh sách tài xế (từ dữ liệu mẫu)
  const [allDrivers, setAllDrivers] = useState(initialDriversData);
  // State chứa danh sách tài xế CHỈ cho trang hiện tại
  const [currentDriversPage, setCurrentDriversPage] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Bắt đầu không loading
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    driver: null,
  });
  const [driverToDelete, setDriverToDelete] = useState(null);
  const itemsPerPage = 6;

  // Cờ để kiểm soát việc gọi API (tạm thời đặt là false)
  const useApiData = false; // Đặt là false để dùng mock data

  // --- HÀM LẤY DỮ LIỆU MẪU VÀ PHÂN TRANG ---
  const loadMockDrivers = (page) => {
    console.log(`Loading mock data for page ${page}...`);
    setIsLoading(true);
    // Giả lập độ trễ mạng
    setTimeout(() => {
      const totalItems = allDrivers.length; // Sử dụng độ dài của dữ liệu gốc trong state
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      // Slice từ state allDrivers
      const paginatedData = allDrivers.slice(startIndex, endIndex);

      setCurrentDriversPage(paginatedData); // Cập nhật state chứa dữ liệu trang hiện tại
      setTotalPages(calculatedTotalPages);
      setIsLoading(false);
      console.log("Mock data loaded for current page:", paginatedData);
    }, 300); // Giảm delay
  };

  // useEffect để tải dữ liệu (ưu tiên mock data)
  useEffect(() => {
    // Luôn log ra trang hiện tại khi nó thay đổi
    console.log(`Current page changed to: ${currentPage}`);
    if (useApiData) {
      // fetchDriversFromApi(currentPage); // Tạm thời comment
      alert("Chức năng gọi API đang tắt, sử dụng dữ liệu mẫu.");
      loadMockDrivers(currentPage); // Gọi mock data theo trang
    } else {
      loadMockDrivers(currentPage); // Gọi mock data theo trang
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, useApiData, allDrivers]); // Thêm allDrivers vào dependency để cập nhật khi xóa/thêm

  // --- CÁC HÀM XỬ LÝ MODAL ---
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

  // --- HÀM XỬ LÝ LƯU (Thêm/Sửa) - Chỉ xử lý mock data ---
  const handleSaveDriver = (driverData) => {
    if (useApiData) {
      alert(
        `Đang tắt gọi API. Dữ liệu ${
          modalState.mode === "add" ? "thêm" : "sửa"
        }: ${JSON.stringify(driverData)}`
      );
      handleCloseModal();
      return;
    }

    // --- Xử lý Mock Data ---
    if (modalState.mode === "add") {
      // Thêm mới vào state allDrivers
      const newId = Math.max(...allDrivers.map((d) => d.id), 0) + 1;
      // Tạo object mới hoàn chỉnh hơn
      const newDriver = {
        ...driverData,
        id: newId,
        // Thêm các trường còn thiếu từ form nếu cần, hoặc đặt giá trị mặc định
        status: "Đang làm việc", // Mặc định trạng thái
        assignment: "Chưa phân công", // Mặc định phân công
      };
      setAllDrivers((prev) => [newDriver, ...prev]); // Thêm vào đầu mảng gốc trong state
      alert("Đã thêm tài xế mới (mock data)!");
      // Chuyển về trang 1 sau khi thêm
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } else {
      // Sửa trong state allDrivers
      setAllDrivers((prev) =>
        prev.map((d) => (d.id === driverData.id ? { ...d, ...driverData } : d))
      );
      alert("Đã cập nhật thông tin tài xế (mock data)!");
    }
    // useEffect sẽ tự động chạy lại và cập nhật currentDriversPage
    handleCloseModal();
  };

  const handleOpenDeleteConfirm = (driver) => setDriverToDelete(driver);

  // --- HÀM XỬ LÝ XÓA - Chỉ xử lý mock data ---
  const handleDeleteConfirm = () => {
    if (useApiData) {
      alert(`Đang tắt gọi API. Yêu cầu xóa tài xế ID: ${driverToDelete?.id}`);
      handleCloseModal();
      return;
    }

    // --- Xử lý Mock Data ---
    // Xóa khỏi state allDrivers
    const updatedDrivers = allDrivers.filter((d) => d.id !== driverToDelete.id);
    setAllDrivers(updatedDrivers);
    alert("Đã xóa tài xế (mock data)!");

    // Tính lại totalPages và kiểm tra trang hiện tại
    const newTotalPages = Math.ceil(updatedDrivers.length / itemsPerPage);
    // Nếu trang hiện tại lớn hơn tổng số trang mới (và không phải trang 1) thì lùi về 1 trang
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (updatedDrivers.length === 0) {
      // Nếu xóa hết
      setCurrentPage(1); // Về trang 1
      setTotalPages(0);
    }
    // useEffect sẽ tự động chạy lại và cập nhật currentDriversPage
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
        // Ghép họ tên đầy đủ cho modal xác nhận
        driverName={
          driverToDelete
            ? `${driverToDelete.firstName} ${driverToDelete.lastName}`
            : ""
        }
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
                      <th>Số điện thoại</th>
                      <th>Trạng thái</th>
                      <th>Phân công (Hôm nay)</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Luôn render từ currentDriversPage */}
                    {currentDriversPage.length > 0 ? (
                      currentDriversPage.map((driver) => (
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
                        <td colSpan="6" style={{ textAlign: "center" }}>
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
