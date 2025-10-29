import React, { useState, useEffect } from "react";
import axios from "axios";
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

// --- Axios instance with credentials ---
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

// Bỏ dữ liệu mẫu initialDriversData

// --- COMPONENT MODAL THÊM/XEM/SỬA TÀI XẾ (Layout 2 cột) ---
const DriverModal = ({ mode, driverId, isOpen, onClose, onSave }) => {
  // Nhận driverId thay vì driver object
  const [formData, setFormData] = useState({});
  const [accountUsername, setAccountUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [isLoadingModal, setIsLoadingModal] = useState(false); // State loading cho modal

  // Hàm tạo mật khẩu từ ngày sinh (DDMMYYYY)
  const generatePassword = (birthDate) => {
    console.log("=== generatePassword called ===");
    console.log("Input birthDate:", birthDate);

    if (!birthDate) {
      console.log("No birthDate provided");
      return "";
    }

    try {
      // Xử lý nhiều format: "YYYY-MM-DD" hoặc "YYYY-MM-DDTHH:mm:ss"
      const datePart = birthDate.split("T")[0]; // Lấy phần ngày
      console.log("Date part:", datePart);

      const [year, month, day] = datePart.split("-");
      console.log("Parsed:", { day, month, year });

      if (!day || !month || !year) {
        console.log("Invalid date format - missing parts");
        return "";
      }

      const password = `${day}${month}${year}`;
      console.log("Generated password:", password);
      return password;
    } catch (e) {
      console.error("Error generating password:", e);
      return "";
    }
  };

  // useEffect để fetch dữ liệu chi tiết khi mở modal Xem/Sửa
  useEffect(() => {
    const fetchDriverDetails = async (id) => {
      console.log("=== Fetching driver details for ID:", id, "===");
      setIsLoadingModal(true);
      try {
        const response = await api.get(`/api/v1/driver/${id}`);
        console.log("Driver detail response:", response.data);
        const driverData = response.data;

        // Map dữ liệu API chi tiết vào state form
        setFormData({
          firstName: driverData.firstName || "",
          lastName: driverData.lastName || "",
          idCard: driverData.idCard || "",
          phoneNumber: driverData.phoneNumber || "",
          address: driverData.address || "",
          assignedBus: driverData.assignedBus || null,
          dateOfBirth: driverData.dateOfBirth
            ? driverData.dateOfBirth.split("T")[0]
            : "",
          sex: driverData.sex ?? 0,
          status: driverData.status ?? 1, // DriverStatus enum: 1=Available, 2=Absence, 3=Suspended
        });

        // Cập nhật tài khoản
        setAccountUsername(driverData.phoneNumber || "");

        // Hiển thị ******** khi xem/sửa (không hiển thị mật khẩu thực)
        setAccountPassword("********");
      } catch (error) {
        console.error(`Lỗi khi tải chi tiết tài xế ID ${id}:`, error);
        alert("Không thể tải chi tiết thông tin tài xế.");
        onClose();
      } finally {
        setIsLoadingModal(false);
      }
    };

    if (isOpen) {
      if (mode === "add") {
        // Reset form khi thêm mới
        setFormData({
          firstName: "",
          lastName: "",
          idCard: "",
          phoneNumber: "",
          address: "",
          assignedBus: null,
          dateOfBirth: "",
          sex: 0,
          status: 1, // Mặc định là Available
        });
        setAccountUsername("");
        setAccountPassword("");
        setIsLoadingModal(false);
      } else if (driverId && (mode === "view" || mode === "edit")) {
        // Gọi API lấy chi tiết khi xem hoặc sửa
        fetchDriverDetails(driverId);
      }
    }
  }, [driverId, mode, isOpen, onClose]); // Thêm onClose vào dependencies

  // useEffect để cập nhật Tài khoản/Mật khẩu CHỈ KHI THÊM MỚI
  useEffect(() => {
    // Chỉ cập nhật nếu đang ở mode add VÀ không đang loading modal
    if (!isLoadingModal && mode === "add") {
      setAccountUsername(formData.phoneNumber || ""); // Tài khoản tự cập nhật theo SĐT
      setAccountPassword(generatePassword(formData.dateOfBirth)); // Mật khẩu tự cập nhật theo ngày sinh
    }
    // Khi edit hoặc view: KHÔNG tự động cập nhật
  }, [formData.phoneNumber, formData.dateOfBirth, mode, isLoadingModal]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view"; // Chỉ đọc khi xem
  const title =
    mode === "add"
      ? "Thêm tài xế"
      : mode === "edit"
      ? "Sửa thông tin tài xế"
      : "Xem thông tin tài xế";

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Xử lý giá trị cho radio button
    const processedValue = type === "radio" ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("=== handleSubmit called ===");
    console.log("Mode:", mode);
    console.log("Form data:", formData);

    // Chuẩn bị dữ liệu cơ bản
    const driverDataToSave = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idCard: formData.idCard,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      sex: formData.sex,
    };

    // Nếu là mode ADD: cần userName và password
    if (mode === "add") {
      driverDataToSave.userName = accountUsername;
      driverDataToSave.password = accountPassword;
    }

    // Nếu là mode EDIT: cần id và status
    if (mode === "edit") {
      driverDataToSave.id = driverId;
      driverDataToSave.status = formData.status ?? 1; // DriverStatus enum
    }

    console.log("Data to save:", JSON.stringify(driverDataToSave, null, 2));
    onSave(driverDataToSave);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Thêm class driver-modal */}
      <div
        className="modal-content driver-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="modal-header">
          <h4>{title}</h4>
        </div>
        {isLoadingModal ? (
          <div className="modal-loading">Đang tải thông tin...</div>
        ) : (
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
                {/* Chỉ hiển thị Xe buýt phụ trách khi Xem hoặc Sửa */}
                {(mode === "view" || mode === "edit") && (
                  <div className="form-group">
                    <label htmlFor="assignedBus">Xe buýt phụ trách</label>
                    <input
                      type="text"
                      id="assignedBus"
                      name="assignedBus"
                      value={formData.assignedBus || "Chưa được phân công"}
                      readOnly // Luôn chỉ đọc
                      disabled
                    />
                  </div>
                )}
                {/* Ẩn xe buýt khi thêm mới */}
                {mode === "add" && (
                  <div className="form-group"> {/* Placeholder */} </div>
                )}

                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="gender-options">
                    <label>
                      {/* Value là 0 cho Nam */}
                      <input
                        type="radio"
                        name="sex"
                        value={0}
                        checked={formData.sex === 0}
                        onChange={handleChange}
                        disabled={isReadOnly}
                      />{" "}
                      Nam
                    </label>
                    <label>
                      {/* Value là 1 cho Nữ */}
                      <input
                        type="radio"
                        name="sex"
                        value={1}
                        checked={formData.sex === 1}
                        onChange={handleChange}
                        disabled={isReadOnly}
                      />{" "}
                      Nữ
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Số điện thoại</label>
                <input
                  type="tel"
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
                  value={accountPassword}
                  readOnly
                  disabled
                  placeholder="Ngày sinh dạng DDMMYYYY"
                />
              </div>
            </div>

            {/* Nút bấm */}
            <div className="form-actions modal-actions">
              <button
                type="button"
                className="action-btn-form cancel-btn"
                onClick={onClose}
              >
                {mode === "view" ? "Đóng" : "Hủy"}
              </button>
              {!isReadOnly && (
                <button type="submit" className="action-btn-form confirm-btn">
                  Xác Nhận
                </button>
              )}
            </div>
          </form>
        )}
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
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 1 DÒNG TRONG BẢNG (Map dữ liệu từ API GET /all) ---
const DriverRow = ({ driver, onView, onEdit, onDelete }) => {
  // API GET all trả về status là DriverStatus enum:
  // 1 = Available (Đang làm việc)
  // 2 = Absence (Vắng mặt)
  // 3 = Suspended (Bị đình chỉ)
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Đang làm việc";
      case 2:
        return "Vắng mặt";
      case 3:
        return "Bị đình chỉ";
      default:
        return "Chưa rõ";
    }
  };

  return (
    <tr>
      {/* API GET all có id */}
      <td style={{ textAlign: "center" }}>{driver.id}</td>
      {/* API GET all có fullName */}
      <td>{driver.fullName || "N/A"}</td>
      {/* API GET all có phoneNumber */}
      <td>{driver.phoneNumber || "N/A"}</td>
      {/* API GET all có status */}
      <td>{getStatusText(driver.status)}</td>
      {/* API GET all có assignmentRouteName */}
      <td>{driver.assignmentRouteName || "Chưa phân công"}</td>
      {/* Căn giữa ô thao tác */}
      <td className="cell-center">
        <div className="action-buttons">
          {/* Nút Xem (Xanh dương) - Truyền ID */}
          <button
            className="action-btn-driver view-btn"
            title="Xem thông tin"
            onClick={() => onView(driver.id)}
          >
            <FaFileAlt />
          </button>
          {/* Nút Xóa (Đỏ) - Truyền ID và tên để hiển thị confirm */}
          <button
            className="action-btn-driver delete-btn"
            title="Xóa"
            onClick={() => onDelete({ id: driver.id, name: driver.fullName })}
          >
            <FaMinusCircle />
          </button>
          {/* Nút Sửa (Vàng) - Truyền ID */}
          <button
            className="action-btn-driver edit-btn"
            title="Sửa"
            onClick={() => onEdit(driver.id)}
          >
            <FaPen />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- COMPONENT PHÂN TRANG (GIỮ NGUYÊN) ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // ... Giữ nguyên ...
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
            {" "}
            &lt;{" "}
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
            {" "}
            &gt;{" "}
          </button>
        </li>
      </ul>
    </nav>
  );
};

// --- COMPONENT CHÍNH CỦA TRANG ---
const DriverListPage = () => {
  // State chứa danh sách tài xế CHO TRANG HIỆN TẠI (từ API)
  const [drivers, setDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    driverId: null, // Lưu ID thay vì object
  });
  const [driverToDelete, setDriverToDelete] = useState(null); // Lưu {id, name}
  const itemsPerPage = 6;

  // --- HÀM GỌI API GET ALL (Phân trang) ---
  const fetchDriversFromApi = async (page) => {
    console.log(`Fetching drivers for page ${page}...`);
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/driver/all", {
        params: {
          PageNumber: page,
          PageSize: itemsPerPage,
        },
      });
      console.log(`API response for page ${page}:`, response.data);

      setDrivers(response.data.items || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
      setDrivers([]);
      setTotalPages(0);
      alert(
        `Không thể tải danh sách tài xế. Vui lòng kiểm tra backend và thử lại.\nLỗi: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để tải dữ liệu khi trang thay đổi
  useEffect(() => {
    console.log(`Current page changed to: ${currentPage}. Fetching data...`);
    fetchDriversFromApi(currentPage);
  }, [currentPage]); // Dependency là currentPage

  // --- CÁC HÀM XỬ LÝ MODAL ---
  const handleOpenAddModal = () =>
    setModalState({ isOpen: true, mode: "add", driverId: null });
  // Truyền ID vào state
  const handleOpenViewModal = (id) =>
    setModalState({ isOpen: true, mode: "view", driverId: id });
  const handleOpenEditModal = (id) =>
    setModalState({ isOpen: true, mode: "edit", driverId: id });
  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "add", driverId: null });
    setDriverToDelete(null);
  };

  // --- HÀM XỬ LÝ LƯU (Thêm/Sửa) - Gọi API POST/PUT ---
  const handleSaveDriver = async (driverData) => {
    const mode = modalState.mode;
    console.log(`=== Saving driver in mode: ${mode} ===`);
    console.log("Full data received:", driverData);

    if (mode === "add") {
      try {
        // Loại bỏ id khỏi payload khi thêm mới (không cần id)
        const { id: _id, ...payload } = driverData;
        console.log("Calling POST /api/v1/driver/create");
        console.log("POST payload:", payload);
        const response = await api.post("/api/v1/driver/create", payload);
        console.log("POST response:", response);

        if (response.status === 200 || response.status === 201) {
          alert("Thêm tài xế thành công!");
          if (currentPage !== 1) setCurrentPage(1);
          else fetchDriversFromApi(1);
        } else {
          alert(`Thêm tài xế thất bại. Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Lỗi khi thêm tài xế:", error);
        const errorMsg =
          error.response?.data?.errors ||
          error.response?.data?.title ||
          error.response?.data ||
          error.message;
        alert(
          `Lỗi khi thêm tài xế: ${
            typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg
          }`
        );
      }
    } else if (mode === "edit") {
      try {
        const driverId = driverData.id;
        console.log(`Calling PUT /api/v1/driver/${driverId}`);
        console.log("PUT payload (full data with id):", driverData);
        // GỬI TOÀN BỘ driverData bao gồm cả id trong body
        const response = await api.put(
          `/api/v1/driver/${driverId}`,
          driverData
        );
        console.log("PUT response:", response);

        if (response.status === 200 || response.status === 204) {
          alert("Cập nhật thông tin tài xế thành công!");
          fetchDriversFromApi(currentPage);
        } else {
          alert(`Cập nhật thất bại. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Lỗi khi cập nhật tài xế:`, error);
        const errorMsg =
          error.response?.data?.errors ||
          error.response?.data?.title ||
          error.response?.data ||
          error.message;
        alert(
          `Lỗi khi cập nhật: ${
            typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg
          }`
        );
      }
    }
    handleCloseModal();
  };

  // Truyền {id, name} vào state
  const handleOpenDeleteConfirm = (driverInfo) => setDriverToDelete(driverInfo);

  // --- HÀM XỬ LÝ XÓA - Gọi API DELETE ---
  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    const { id, name } = driverToDelete;
    console.log(
      `=== Confirming delete for driver ID: ${id}, Name: ${name} ===`
    );

    try {
      console.log(`Calling DELETE /api/v1/driver/${id}`);
      const response = await api.delete(`/api/v1/driver/${id}`);
      console.log("DELETE response:", response);

      if (response.status === 200 || response.status === 204) {
        alert(`Đã xóa tài xế "${name}" thành công!`);
        // Kiểm tra xem trang hiện tại còn item không
        if (drivers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchDriversFromApi(currentPage);
        }
      } else {
        alert(`Xóa thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa tài xế ID ${id}:`, error);
      const errorMsg =
        error.response?.data?.errors ||
        error.response?.data?.title ||
        error.response?.data ||
        error.message;
      alert(
        `Lỗi khi xóa: ${
          typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg
        }`
      );
    } finally {
      handleCloseModal();
    }
  };

  return (
    <>
      <DriverModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        driverId={modalState.driverId} // Truyền ID
        onClose={handleCloseModal}
        onSave={handleSaveDriver}
      />
      <ConfirmDeleteModal
        isOpen={!!driverToDelete}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        // Truyền tên tài xế để hiển thị
        driverName={driverToDelete?.name || ""}
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
                    {/* Render từ state drivers (đã được fetch theo trang) */}
                    {drivers.length > 0 ? (
                      drivers.map((driver) => (
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
