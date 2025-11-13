import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api"; // Import api instance với token support
import "./DriverListPage.css";
import "../LayoutTable.css";
import AdminHeader from "../../components/admin/AdminHeader"; // Import AdminHeader
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaFileAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

// Bỏ dữ liệu mẫu initialDriversData

// --- COMPONENT MODAL THÊM/XEM/SỬA TÀI XẾ (Layout 2 cột) ---
const DriverModal = ({ mode, driverId, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
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
      ? t("driver.addDriver")
      : mode === "edit"
      ? t("driver.editInfo")
      : t("driver.viewInfo");

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
              <h5>{t("driver.detailInfo")}</h5>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">{t("driver.firstName")}</label>
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
                  <label htmlFor="lastName">{t("driver.lastName")}</label>
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
                    <label htmlFor="assignedBus">
                      {t("driver.assignedBus")}
                    </label>
                    <input
                      type="text"
                      id="assignedBus"
                      name="assignedBus"
                      value={formData.assignedBus || t("bus.notAssigned")}
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
                  <label>{t("driver.gender")}</label>
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
                      {t("common.male")}
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
                      {t("common.female")}
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">{t("driver.phoneNumber")}</label>
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
                <label htmlFor="dateOfBirth">{t("driver.dateOfBirth")}</label>
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
                <label htmlFor="idCard">{t("driver.idCard")}</label>
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
                <label htmlFor="address">{t("driver.address")}</label>
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
              <h5>{t("driver.accountInfo")}</h5>
              <div className="form-group">
                <label htmlFor="accountUsername">{t("driver.username")}</label>
                <input
                  type="text"
                  id="accountUsername"
                  name="accountUsername"
                  value={accountUsername} // Hiển thị state tài khoản
                  readOnly // Luôn chỉ đọc
                  disabled // Không cho sửa
                  placeholder={t("driver.autoFromPhone")}
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountPassword">{t("driver.password")}</label>
                <input
                  type="text"
                  id="accountPassword"
                  name="accountPassword"
                  value={accountPassword}
                  readOnly
                  disabled
                  placeholder={t("driver.autoFromDOB")}
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
                {mode === "view" ? t("common.close") : t("common.cancel")}
              </button>
              {!isReadOnly && (
                <button type="submit" className="action-btn-form confirm-btn">
                  {t("common.confirm")}
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
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content confirm-delete"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <FaExclamationTriangle size={40} color="#e74c3c" />
          <h4>{t("driver.confirmDelete")}</h4>
        </div>
        <p className="confirm-text">
          {t("driver.deleteMessage")} <strong>{driverName}</strong>{" "}
          {t("driver.cannotUndo")}
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="confirm-btn delete-confirm-btn"
            onClick={onConfirm} // Gọi hàm xác nhận xóa từ props
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 1 DÒNG TRONG BẢNG (Map dữ liệu từ API GET /all) ---
const DriverRow = ({ driver, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // API GET all trả về status là DriverStatus enum:
  // 1 = Available (Đang làm việc)
  // 2 = Absence (Vắng mặt)
  // 3 = Suspended (Bị đình chỉ)
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return t("driver.statusWorking");
      case 2:
        return t("driver.statusAbsent");
      case 3:
        return t("driver.statusSuspended");
      default:
        return t("driver.statusUnknown");
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
      <td>{driver.assignmentRouteName || t("driver.notAssigned")}</td>
      {/* Căn giữa ô thao tác */}
      <td className="cell-center">
        <div className="action-buttons">
          {/* Nút Xem (Xanh dương) - Truyền ID */}
          <button
            className="action-btn-driver view-btn"
            title={t("driver.viewInfo")}
            onClick={() => onView(driver.id)}
          >
            <FaFileAlt />
          </button>
          {/* Nút Xóa (Đỏ) - Truyền ID và tên để hiển thị confirm */}
          <button
            className="action-btn-driver delete-btn"
            title={t("common.delete")}
            onClick={() => onDelete({ id: driver.id, name: driver.fullName })}
          >
            <FaMinusCircle />
          </button>
          {/* Nút Sửa (Vàng) - Truyền ID */}
          <button
            className="action-btn-driver edit-btn"
            title={t("common.edit")}
            onClick={() => onEdit(driver.id)}
          >
            <FaPen />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- MOBILE CARD COMPONENT ---
const DriverCard = ({ driver, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return t("driver.statusWorking");
      case 2:
        return t("driver.statusAbsent");
      case 3:
        return t("driver.statusSuspended");
      default:
        return t("driver.statusUnknown");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 1:
        return "status-working";
      case 2:
        return "status-absent";
      case 3:
        return "status-suspended";
      default:
        return "";
    }
  };

  return (
    <div className="mobile-card">
      <div className="mobile-card-header">
        <h3>{driver.fullName || "N/A"}</h3>
        <span className="mobile-card-id">#{driver.id}</span>
      </div>
      <div className="mobile-card-body">
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("common.phone")}:</span>
          <span className="mobile-card-value">{driver.phoneNumber || "N/A"}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("common.status")}:</span>
          <span className={`mobile-card-value ${getStatusClass(driver.status)}`}>
            {getStatusText(driver.status)}
          </span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">{t("driver.route")}:</span>
          <span className="mobile-card-value">
            {driver.assignmentRouteName || t("driver.notAssigned")}
          </span>
        </div>
      </div>
      <div className="mobile-card-actions">
        <button
          className="mobile-action-btn view-btn"
          onClick={() => onView(driver.id)}
          title={t("driver.viewInfo")}
        >
          <FaFileAlt /> {t("common.view")}
        </button>
        <button
          className="mobile-action-btn edit-btn"
          onClick={() => onEdit(driver.id)}
          title={t("common.edit")}
        >
          <FaPen /> {t("common.edit")}
        </button>
        <button
          className="mobile-action-btn delete-btn"
          onClick={() => onDelete({ id: driver.id, name: driver.fullName })}
          title={t("common.delete")}
        >
          <FaMinusCircle /> {t("common.delete")}
        </button>
      </div>
    </div>
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
  const { t } = useTranslation();
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
        <AdminHeader breadcrumbs={t("driver.breadcrumb")} />

        <div className="page-content">
          <div className="content-header">
            <h2>{t("driver.title")}</h2>
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
            <div className="loading-message">{t("driver.loadingInfo")}</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t("common.stt")}</th>
                      <th>{t("driver.fullName")}</th>
                      <th>{t("driver.phoneNumber")}</th>
                      <th>{t("common.status")}</th>
                      <th>{t("driver.assignmentToday")}</th>
                      <th>{t("common.action")}</th>
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
                          {t("driver.noData")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-card-list">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      onView={handleOpenViewModal}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteConfirm}
                    />
                  ))
                ) : (
                  <div className="no-data-message">{t("driver.noData")}</div>
                )}
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
