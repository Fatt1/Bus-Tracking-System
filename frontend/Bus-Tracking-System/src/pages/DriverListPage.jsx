import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
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
    if (!birthDate || birthDate.length < 10) return "*********"; // Kiểm tra format YYYY-MM-DD...
    try {
      // Lấy YYYY-MM-DD từ chuỗi ISO hoặc YYYY-MM-DD
      const datePart = birthDate.split("T")[0];
      const [year, month, day] = datePart.split("-");
      if (
        !day ||
        !month ||
        !year ||
        isNaN(parseInt(day)) ||
        isNaN(parseInt(month)) ||
        isNaN(parseInt(year))
      )
        return "*********";
      return `${day}${month}${year}`;
    } catch (e) {
      console.error("Lỗi định dạng ngày sinh:", e);
      return "*********";
    }
  };

  // useEffect để fetch dữ liệu chi tiết khi mở modal Xem/Sửa
  useEffect(() => {
    const fetchDriverDetails = async (id) => {
      setIsLoadingModal(true);
      try {
        const response = await axios.get(
          `https://localhost:7229/api/v1/driver/${id}`
        );
        const driverData = response.data;
        // Map dữ liệu API chi tiết vào state form
        setFormData({
          firstName: driverData.firstName || "",
          lastName: driverData.lastName || "",
          idCard: driverData.idCard || "", // API chi tiết dùng idCard
          phoneNumber: driverData.phoneNumber || "", // API chi tiết dùng phoneNumber
          address: driverData.address || "",
          assignedBus: driverData.assignedBus || null,
          dateOfBirth: driverData.dateOfBirth
            ? driverData.dateOfBirth.split("T")[0]
            : "", // Lấy YYYY-MM-DD
          sex: driverData.sex ?? 0, // Dùng ?? để xử lý null/undefined, mặc định là 0 (Nam)
        });
        // Cập nhật tài khoản/mật khẩu dựa trên dữ liệu chi tiết
        setAccountUsername(driverData.phoneNumber || "");
        // Mật khẩu chỉ hiển thị '*' khi xem
        setAccountPassword(
          mode === "view"
            ? "********"
            : generatePassword(driverData.dateOfBirth)
        );
      } catch (error) {
        console.error(`Lỗi khi tải chi tiết tài xế ID ${id}:`, error);
        alert("Không thể tải chi tiết thông tin tài xế.");
        onClose(); // Đóng modal nếu lỗi
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
          sex: 0, // Mặc định giới tính Nam (0)
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

  // useEffect để cập nhật Tài khoản/Mật khẩu khi SĐT/Ngày sinh trong form thay đổi (CHỈ KHI THÊM/SỬA)
  useEffect(() => {
    // Chỉ cập nhật nếu đang ở mode add hoặc edit VÀ không đang loading modal
    if (!isLoadingModal && (mode === "add" || mode === "edit")) {
      setAccountUsername(formData.phoneNumber || ""); // Tài khoản tự cập nhật theo SĐT
      setAccountPassword(generatePassword(formData.dateOfBirth)); // Mật khẩu tự cập nhật theo ngày sinh
    }
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
    // Chuẩn bị dữ liệu để gửi đi (khớp với API POST /create)
    const driverDataToSave = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idCard: formData.citizenId || formData.idCard, // Ưu tiên citizenId nếu có, fallback về idCard
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      // Format lại ngày sinh nếu cần (API có vẻ chấp nhận YYYY-MM-DD)
      dateOfBirth: formData.dateOfBirth,
      sex: formData.sex, // Gửi 0 hoặc 1
      // Tạo userName và password
      userName: accountUsername,
      password: accountPassword, // Mật khẩu dạng DDMMYYYY
    };

    // Thêm ID nếu là mode edit (cho hàm onSave biết)
    if (mode === "edit") {
      driverDataToSave.id = driverId;
    }

    console.log("Data to save:", driverDataToSave);
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
                  type={mode === "view" ? "password" : "text"}
                  id="accountPassword"
                  name="accountPassword"
                  value={accountPassword} // Hiển thị state mật khẩu
                  readOnly // Luôn chỉ đọc
                  disabled // Không cho sửa
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
  // API GET all trả về status: true/false/null? và assignmentRouteName
  const getStatusText = (status) => {
    if (status === true) return "Đang làm việc";
    if (status === false) return "Tạm ngưng"; // Hoặc "Nghỉ phép" tùy logic backend
    return "Chưa rõ"; // Hoặc trạng thái khác nếu status là null
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
      const apiUrl = `https://localhost:7229/api/v1/driver/all?PageNumber=${page}&PageSize=${itemsPerPage}`;
      console.log(`Calling API URL: ${apiUrl}`);
      const response = await axios.get(apiUrl);
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
    const { id, ...payload } = driverData; // Tách ID ra nếu có (cho mode edit)
    const mode = modalState.mode;
    console.log(`Saving driver in mode: ${mode}. Data:`, payload);

    if (mode === "add") {
      try {
        console.log("Calling POST API:", payload);
        const response = await axios.post(
          "https://localhost:7229/api/v1/driver/create",
          payload
        );
        if (response.status === 200 || response.status === 201) {
          alert("Thêm tài xế thành công!");
          // Fetch lại trang đầu tiên
          if (currentPage !== 1) setCurrentPage(1);
          else fetchDriversFromApi(1);
        } else {
          alert(`Thêm tài xế thất bại. Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Lỗi khi thêm tài xế:", error);
        alert(`Lỗi khi thêm tài xế: ${error.response?.data || error.message}`);
      }
    } else if (mode === "edit") {
      // --- CHỨC NĂNG SỬA (API PUT - Chưa có) ---
      // try {
      //     console.log(`Calling PUT API for ID ${id}:`, payload);
      //     const response = await axios.put(`https://localhost:7229/api/v1/driver/${id}`, payload);
      //     if (response.status === 200 || response.status === 204) {
      //         alert("Cập nhật thông tin tài xế thành công!");
      //         fetchDriversFromApi(currentPage); // Fetch lại trang hiện tại
      //     } else {
      //         alert(`Cập nhật thất bại. Status: ${response.status}`);
      //     }
      // } catch (error) {
      //      console.error(`Lỗi khi cập nhật tài xế ID ${id}:`, error);
      //      alert(`Lỗi khi cập nhật: ${error.response?.data || error.message}`);
      // }
      alert(
        `Chức năng sửa (API PUT) chưa được làm. Dữ liệu gửi đi (giả lập): ${JSON.stringify(
          payload
        )}`
      );
      // Tạm cập nhật client-side để thấy thay đổi
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                ...payload,
                fullName: `${payload.firstName} ${payload.lastName}`,
                phoneNumber: payload.phone,
              }
            : d
        )
      );
    }
    handleCloseModal();
  };

  // Truyền {id, name} vào state
  const handleOpenDeleteConfirm = (driverInfo) => setDriverToDelete(driverInfo);

  // --- HÀM XỬ LÝ XÓA - Gọi API DELETE ---
  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    const { id, name } = driverToDelete;
    console.log(`Confirming delete for driver ID: ${id}, Name: ${name}`);

    try {
      const apiUrl = `https://localhost:7229/api/v1/driver/${id}`;
      console.log(`Calling DELETE API: ${apiUrl}`);
      const response = await axios.delete(apiUrl);
      if (response.status === 200 || response.status === 204) {
        alert(`Đã xóa tài xế "${name}" thành công!`);
        // Fetch lại dữ liệu sau khi xóa
        // Kiểm tra xem trang hiện tại còn item không
        if (drivers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1); // Lùi về trang trước
        } else {
          fetchDriversFromApi(currentPage); // Fetch lại trang hiện tại
        }
      } else {
        alert(`Xóa thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa tài xế ID ${id}:`, error);
      alert(`Lỗi khi xóa: ${error.response?.data || error.message}`);
    } finally {
      handleCloseModal(); // Luôn đóng modal sau khi xử lý
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
