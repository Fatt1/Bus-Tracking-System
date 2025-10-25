import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import "./StudentListPage.css"; // CSS riêng cho trang này
import "../pages/LayoutTable.css"; // Tái sử dụng CSS layout bảng
import {
  FaPlus,
  FaPen,
  FaMinusCircle,
  FaEllipsisH, // Icon xem chi tiết (tạm dùng cho Sửa)
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { format } from "date-fns"; // Import hàm format

// --- Dữ liệu tĩnh cho dropdown Lớp (Vì API không cung cấp) ---
const availableClasses = [
  "10A1",
  "11B2",
  "12A1",
  "12A2",
  "12A3",
  "12A4",
  "12A5",
  "Khác",
];

// --- COMPONENT MODAL THÊM/SỬA HỌC SINH ---
const StudentModal = ({ mode, studentData, isOpen, onClose, onSave }) => {
  // State cho form data
  const [formData, setFormData] = useState({});
  // State cho dropdown động
  const [allRoutes, setAllRoutes] = useState([]); // Danh sách tất cả tuyến đường từ API
  const [availablePickupPoints, setAvailablePickupPoints] = useState([]); // Điểm đón theo tuyến đã chọn
  // State cho tài khoản/mật khẩu tự tạo
  const [accountUsername, setAccountUsername] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Hàm tạo mật khẩu từ ngày sinh (DDMMYYYY)
  const generatePassword = (birthDate) => {
    if (!birthDate || birthDate.length < 10) return "*********"; // Kiểm tra format YYYY-MM-DD...
    try {
      const datePart = birthDate.split("T")[0]; // Lấy phần YYYY-MM-DD
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

  // useEffect để fetch danh sách tuyến đường khi modal mở lần đầu (chế độ add/edit)
  useEffect(() => {
    const fetchRoutes = async () => {
      // Chỉ fetch khi modal mở, ở mode add/edit và chưa có dữ liệu routes
      if (
        isOpen &&
        (mode === "add" || mode === "edit") &&
        allRoutes.length === 0
      ) {
        console.log("Modal: Fetching routes for dropdown...");
        setIsLoadingRoutes(true);
        try {
          // Gọi API lấy tất cả tuyến đường (luôn trang 1, size lớn)
          const response = await axios.get(
            `https://localhost:7229/api/v1/route/all?PageNumber=1&PageSize=100`
          );
          console.log("Modal: Routes API response:", response.data);
          setAllRoutes(response.data.items || []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách tuyến đường:", error);
          alert("Không thể tải danh sách tuyến đường.");
          setAllRoutes([]); // Đặt mảng rỗng nếu lỗi
        } finally {
          setIsLoadingRoutes(false);
        }
      }
    };
    fetchRoutes();
  }, [isOpen, mode, allRoutes.length]); // Dependencies

  // useEffect để cập nhật form data ban đầu và điểm đón khi sửa
  useEffect(() => {
    if (isOpen) {
      console.log(
        `Modal: Initializing form for mode '${mode}'. Student data:`,
        studentData
      );
      const initialData =
        mode === "add"
          ? {
              // Dữ liệu mặc định khi thêm mới
              firstName: "",
              lastName: "",
              class: availableClasses[0] || "",
              sex: 0,
              address: "",
              pointId: "",
              parentName: "",
              dateOfBirth: "",
              parentPhoneNumber: "",
              routeId: "",
            }
          : {
              // Map dữ liệu từ studentData (lấy từ GET /all)
              // API GET /all có: id, fullName, class, address, parentName, parentPhoneNumber
              // Tách fullName thành firstName, lastName (ước lượng)
              firstName:
                studentData?.fullName?.split(" ").slice(0, -1).join(" ") || "",
              lastName: studentData?.fullName?.split(" ").slice(-1)[0] || "",
              class: studentData?.class || availableClasses[0] || "",
              // API GET /all không có sex, dateOfBirth, pointId, routeId -> Cần gọi API GET by ID nếu muốn sửa chính xác
              // Tạm thời để trống hoặc lấy từ studentData nếu có (dù GET /all không trả về)
              sex: studentData?.sex ?? 0, // Mặc định Nam nếu GET /all không có
              address: studentData?.address || "",
              pointId: studentData?.pointId || "", // Cần API GET by ID
              routeId: studentData?.routeId || "", // Cần API GET by ID
              parentName: studentData?.parentName || "",
              dateOfBirth: studentData?.dateOfBirth
                ? studentData.dateOfBirth.split("T")[0]
                : "", // Cần API GET by ID
              parentPhoneNumber: studentData?.parentPhoneNumber || "",
            };
      setFormData(initialData);

      // Cập nhật tài khoản/mật khẩu
      setAccountUsername(initialData.parentPhoneNumber || "");
      setParentPassword(generatePassword(initialData.dateOfBirth));

      // Cập nhật điểm đón ban đầu khi sửa (nếu có routeId và routes đã load)
      if (mode === "edit" && initialData.routeId && allRoutes.length > 0) {
        const selectedRoute = allRoutes.find(
          (r) => r.id === initialData.routeId
        );
        setAvailablePickupPoints(selectedRoute?.stopPoints || []);
        // Giữ lại pointId đã có
        setFormData((prev) => ({
          ...prev,
          pointId: initialData.pointId || "",
        }));
      } else {
        setAvailablePickupPoints([]); // Reset điểm đón khi thêm mới hoặc chưa có routeId
        setFormData((prev) => ({ ...prev, pointId: "" }));
      }
    }
  }, [studentData, mode, isOpen, allRoutes]); // Thêm allRoutes

  // useEffect để cập nhật Điểm đón khi Tuyến đường thay đổi
  useEffect(() => {
    if (formData.routeId && allRoutes.length > 0) {
      console.log(
        `Modal: Route changed to ${formData.routeId}. Updating pickup points...`
      );
      const selectedRoute = allRoutes.find(
        (r) => r.id === parseInt(formData.routeId)
      );
      const points = selectedRoute?.stopPoints || [];
      setAvailablePickupPoints(points);
      console.log("Modal: Available pickup points:", points);

      // Tự động chọn điểm đón đầu tiên khi thêm mới hoặc khi đổi route mà điểm cũ không còn hợp lệ
      if (
        mode === "add" ||
        !points.some((p) => p.id === parseInt(formData.pointId))
      ) {
        const firstPointId = points[0]?.id || "";
        console.log(
          `Modal: Auto-selecting first pickup point: ${firstPointId}`
        );
        setFormData((prev) => ({ ...prev, pointId: firstPointId }));
      }
      // Nếu là edit và pointId cũ vẫn hợp lệ thì không làm gì cả
    } else if (!formData.routeId) {
      // Nếu bỏ chọn route
      console.log("Modal: Route deselected. Clearing pickup points.");
      setAvailablePickupPoints([]);
      setFormData((prev) => ({ ...prev, pointId: "" })); // Reset pointId
    }
  }, [formData.routeId, allRoutes, mode]); // Thêm mode

  // useEffect để cập nhật Tài khoản/Mật khẩu khi SĐT/Ngày sinh trong form thay đổi
  useEffect(() => {
    if (mode === "add" || mode === "edit") {
      setAccountUsername(formData.parentPhoneNumber || "");
      setParentPassword(generatePassword(formData.dateOfBirth));
    }
  }, [formData.parentPhoneNumber, formData.dateOfBirth, mode]);

  if (!isOpen) return null;

  const isReadOnly = mode === "view"; // Chỉ đọc khi xem (Hiện tại không có mode view)
  const title =
    mode === "add" ? "Thêm học sinh" : "Chỉnh sửa thông tin học sinh";

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "radio" ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Chuẩn bị payload cho API POST/PUT
    const studentPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      class: formData.class,
      sex: formData.sex, // 0 hoặc 1
      address: formData.address,
      pointId: parseInt(formData.pointId), // Đảm bảo là số
      parentName: formData.parentName,
      dateOfBirth: formData.dateOfBirth, // API chấp nhận YYYY-MM-DD
      parentPhoneNumber: formData.parentPhoneNumber,
    };

    // Chỉ thêm userName và password khi tạo mới (mode === 'add')
    if (mode === "add") {
      studentPayload.userName = accountUsername; // Lấy từ SĐT
      studentPayload.password = parentPassword; // Mật khẩu DDMMYYYY
    }

    // Thêm ID nếu là mode edit (cho hàm onSave biết)
    if (mode === "edit") {
      studentPayload.id = studentData.id; // Lấy ID từ studentData gốc
    }

    console.log("Data to save:", studentPayload);
    onSave(studentPayload); // Gọi hàm onSave từ component cha
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
        {/* Hiển thị loading khi đang tải routes */}
        {isLoadingRoutes && mode !== "view" ? (
          <div className="modal-loading">Đang tải dữ liệu tuyến đường...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form student-form">
            {/* Cột 1: Thông tin học sinh */}
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
                    {availableClasses.map((cls) => (
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
                        name="sex"
                        value={0}
                        checked={formData.sex === 0}
                        onChange={handleChange}
                        disabled={isReadOnly}
                      />{" "}
                      Nam
                    </label>
                    <label>
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
                <label htmlFor="routeId">Tuyến đường</label>
                <select
                  id="routeId"
                  name="routeId"
                  value={formData.routeId || ""} // Controlled component
                  onChange={handleChange}
                  disabled={isReadOnly || isLoadingRoutes}
                  required
                >
                  <option value="" disabled>
                    -- {isLoadingRoutes ? "Đang tải..." : "Chọn tuyến đường"} --
                  </option>
                  {allRoutes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.routeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pointId">Điểm đón</label>
                <select
                  id="pointId"
                  name="pointId"
                  value={formData.pointId || ""} // Controlled component
                  onChange={handleChange}
                  disabled={
                    isReadOnly ||
                    !formData.routeId ||
                    availablePickupPoints.length === 0
                  }
                  required
                >
                  <option value="" disabled>
                    --{" "}
                    {formData.routeId
                      ? availablePickupPoints.length > 0
                        ? "Chọn điểm đón"
                        : "Tuyến chưa có điểm đón"
                      : "Vui lòng chọn tuyến"}{" "}
                    --
                  </option>
                  {/* Map qua availablePickupPoints */}
                  {availablePickupPoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.pointName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cột 2: Thông tin phụ huynh */}
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
                <label htmlFor="parentPhoneNumber">
                  Số điện thoại phụ huynh
                </label>
                <input
                  type="tel"
                  id="parentPhoneNumber"
                  name="parentPhoneNumber"
                  value={formData.parentPhoneNumber || ""}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                />
              </div>
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
                <label htmlFor="parentPassword">Mật khẩu</label>
                <input
                  type={mode === "view" ? "password" : "text"}
                  id="parentPassword"
                  name="parentPassword"
                  value={parentPassword} // Hiển thị state mật khẩu
                  readOnly // Luôn chỉ đọc
                  disabled // Không cho sửa
                  placeholder="Ngày sinh học sinh. Ví dụ 09122005"
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
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, studentName }) => {
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
          Bạn có chắc chắn muốn xóa học sinh <strong>{studentName}</strong>{" "}
          không? Hành động này không thể hoàn tác.
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

// --- COMPONENT 1 DÒNG TRONG BẢNG ---
const StudentRow = (
  { student, onEdit, onDelete } // Thêm onDelete
) => (
  <tr>
    <td style={{ textAlign: "center" }}>{student.id}</td>
    {/* API trả về fullName */}
    <td>{student.fullName || "N/A"}</td>
    {/* API trả về class */}
    <td>{student.class || "N/A"}</td>
    {/* API trả về address */}
    <td>{student.address || "N/A"}</td>
    {/* API trả về parentName */}
    <td>{student.parentName || "N/A"}</td>
    {/* API trả về parentPhoneNumber */}
    <td>{student.parentPhoneNumber || "N/A"}</td>
    <td className="cell-center">
      <div className="action-buttons">
        {/* Nút Xem chi tiết (Tạm thời dùng nút Sửa để mở modal edit) */}
        {/* <button className="action-btn-student more-btn" onClick={() => onView(student)}>
          <FaEllipsisH />
        </button> */}
        {/* Nút Xóa */}
        <button
          className="action-btn-student delete-btn"
          onClick={() => onDelete(student)}
        >
          <FaMinusCircle />
        </button>
        {/* Nút Sửa */}
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

// --- COMPONENT PHÂN TRANG (Tái sử dụng) ---
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
const StudentListPage = () => {
  const [students, setStudents] = useState([]); // State chứa danh sách học sinh trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    student: null,
  });
  const [studentToDelete, setStudentToDelete] = useState(null); // State cho modal xóa
  const itemsPerPage = 6;

  // --- HÀM GỌI API GET ALL STUDENTS ---
  const fetchStudentsFromApi = async (page) => {
    console.log(`Fetching students for page ${page}...`);
    setIsLoading(true);
    try {
      const apiUrl = `https://localhost:7229/api/v1/student/all?PageNumber=${page}&PageSize=${itemsPerPage}`;
      console.log(`Calling API URL: ${apiUrl}`);
      const response = await axios.get(apiUrl);
      console.log(`API response for page ${page}:`, response.data);

      // API trả về { items: [], totalPages: ... }
      setStudents(response.data.items || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách học sinh:", error);
      setStudents([]);
      setTotalPages(0);
      alert(
        `Không thể tải danh sách học sinh. Vui lòng kiểm tra backend và thử lại.\nLỗi: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect để tải dữ liệu khi trang thay đổi
  useEffect(() => {
    console.log(`Current page changed to: ${currentPage}. Fetching data...`);
    fetchStudentsFromApi(currentPage);
  }, [currentPage]); // Dependency là currentPage

  // --- CÁC HÀM XỬ LÝ MODAL ---
  const handleOpenAddModal = () =>
    setModalState({ isOpen: true, mode: "add", student: null });
  const handleOpenEditModal = (
    student // Nhận object student từ GET /all
  ) => setModalState({ isOpen: true, mode: "edit", student: student });
  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: "add", student: null });
    setStudentToDelete(null);
  };

  // --- HÀM XỬ LÝ LƯU (Thêm/Sửa) - Gọi API POST/PUT ---
  const handleSaveStudent = async (studentData) => {
    const { id, ...payload } = studentData; // Tách ID ra nếu có (cho mode edit)
    const mode = modalState.mode;
    console.log(`Saving student in mode: ${mode}. Data:`, payload);

    if (mode === "add") {
      try {
        console.log("Calling POST API:", payload);
        const response = await axios.post(
          "https://localhost:7229/api/v1/student/create",
          payload
        );
        if (response.status === 200 || response.status === 201) {
          alert("Thêm học sinh thành công!");
          // Fetch lại trang đầu tiên
          if (currentPage !== 1) setCurrentPage(1);
          else fetchStudentsFromApi(1);
        } else {
          alert(`Thêm học sinh thất bại. Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Lỗi khi thêm học sinh:", error);
        // Hiển thị lỗi cụ thể từ backend nếu có
        const errorMsg =
          error.response?.data?.errors?.Password?.[0] || // Lỗi validation cụ thể
          error.response?.data?.title || // Lỗi chung từ ProblemDetails
          error.response?.data || // Các lỗi khác từ data
          error.message; // Lỗi mạng hoặc lỗi khác
        alert(`Lỗi khi thêm học sinh: ${errorMsg}`);
      }
    } else if (mode === "edit") {
      try {
        console.log(`Calling PUT API for ID ${id}:`, payload);
        // API PUT yêu cầu ID trong payload (theo hình ảnh)
        const putPayload = { ...payload, id: id };
        const response = await axios.put(
          `https://localhost:7229/api/v1/student/${id}`,
          putPayload
        );
        if (response.status === 200 || response.status === 204) {
          alert("Cập nhật thông tin học sinh thành công!");
          fetchStudentsFromApi(currentPage); // Fetch lại trang hiện tại
        } else {
          alert(`Cập nhật thất bại. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Lỗi khi cập nhật học sinh ID ${id}:`, error);
        // Hiển thị lỗi cụ thể từ backend nếu có
        const errorMsg =
          error.response?.data?.errors?.Password?.[0] ||
          error.response?.data?.title ||
          error.response?.data ||
          error.message;
        alert(`Lỗi khi cập nhật: ${errorMsg}`);
      }
    }
    // Chỉ đóng modal nếu API thành công (tùy chọn)
    // Nếu muốn luôn đóng:
    handleCloseModal();
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteConfirm = (student) => setStudentToDelete(student); // Truyền cả object student

  // --- HÀM XỬ LÝ XÓA - Gọi API DELETE ---
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const { id, fullName } = studentToDelete; // Lấy ID và Tên từ API GET all
    console.log(`Confirming delete for student ID: ${id}, Name: ${fullName}`);

    try {
      const apiUrl = `https://localhost:7229/api/v1/student/${id}`;
      console.log(`Calling DELETE API: ${apiUrl}`);
      const response = await axios.delete(apiUrl);
      if (response.status === 200 || response.status === 204) {
        alert(`Đã xóa học sinh "${fullName}" thành công!`);
        // Fetch lại dữ liệu sau khi xóa
        // Kiểm tra xem trang hiện tại còn item không
        if (students.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1); // Lùi về trang trước
        } else {
          // Fetch lại trang hiện tại (hoặc trang 1 nếu chỉ còn 1 trang)
          fetchStudentsFromApi(
            currentPage === 1
              ? 1
              : Math.min(currentPage, totalPages - 1 > 0 ? totalPages - 1 : 1)
          );
        }
      } else {
        alert(`Xóa thất bại. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa học sinh ID ${id}:`, error);
      // Hiển thị lỗi cụ thể từ backend nếu có
      const errorMsg =
        error.response?.data?.title || error.response?.data || error.message;
      alert(`Lỗi khi xóa: ${errorMsg}`);
    } finally {
      handleCloseModal(); // Luôn đóng modal sau khi xử lý
    }
  };

  return (
    <>
      <StudentModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        studentData={modalState.student} // Truyền student data vào modal
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
      />
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        // Truyền tên học sinh để hiển thị
        studentName={studentToDelete?.fullName || ""}
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
                      <th>Tên học sinh</th>
                      <th>Lớp</th>
                      <th>Địa chỉ</th>
                      <th>Phụ huynh</th>
                      <th>Số điện thoại</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <StudentRow
                          key={student.id}
                          student={student}
                          onEdit={handleOpenEditModal}
                          onDelete={handleOpenDeleteConfirm} // Thêm hàm xóa
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          Không có dữ liệu học sinh.
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

export default StudentListPage;
