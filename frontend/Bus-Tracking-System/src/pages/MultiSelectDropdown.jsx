import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import "./MultiSelectDropdown.css"; // Sẽ tạo CSS ở bước 2

const MultiSelectDropdown = ({
  options,
  selectedIds,
  onChange,
  placeholder = "-- Chọn --",
  itemTypeLabel = "mục",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý khi tick vào checkbox item
  const handleCheckboxChange = (optionId) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(optionId)) {
      newSelectedIds.delete(optionId);
    } else {
      newSelectedIds.add(optionId);
    }
    onChange(new Set(newSelectedIds)); // Truyền Set mới lên component cha
  };

  // Xử lý khi tick vào "Chọn tất cả"
  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      onChange(new Set(options.map((option) => option.id))); // Chọn tất cả ID
    } else {
      onChange(new Set()); // Bỏ chọn tất cả
    }
  };

  // Kiểm tra xem tất cả có đang được chọn không
  const isAllSelected =
    options.length > 0 && selectedIds.size === options.length;

  // Hiển thị tóm tắt lựa chọn
  const getSelectionSummary = () => {
    if (selectedIds.size === 0) {
      return placeholder;
    }
    if (isAllSelected) {
      return `Đã chọn tất cả (${options.length})`;
    }
    if (selectedIds.size === 1) {
      const selectedOption = options.find((option) =>
        selectedIds.has(option.id)
      );
      return selectedOption?.name || placeholder;
    }
    return `Đã chọn ${selectedIds.size} ${itemTypeLabel}`;
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      {/* Phần hiển thị lựa chọn hiện tại và nút mở/đóng */}
      <div
        className={`dropdown-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getSelectionSummary()}</span>
        <FaChevronDown className="dropdown-arrow" />
      </div>

      {/* Danh sách các checkbox */}
      {isOpen && (
        <div className="dropdown-list-container">
          <ul className="dropdown-list">
            {/* Option "Chọn tất cả" */}
            <li className="dropdown-list-item select-all">
              <input
                type="checkbox"
                id={`select-all-${itemTypeLabel}`}
                checked={isAllSelected}
                onChange={handleSelectAllChange}
              />
              <label htmlFor={`select-all-${itemTypeLabel}`}>Chọn tất cả</label>
            </li>
            {/* Các option khác */}
            {options.map((option) => (
              <li key={option.id} className="dropdown-list-item">
                <input
                  type="checkbox"
                  id={`option-${option.id}`}
                  checked={selectedIds.has(option.id)}
                  onChange={() => handleCheckboxChange(option.id)}
                />
                <label htmlFor={`option-${option.id}`}>{option.name}</label>
              </li>
            ))}
            {options.length === 0 && (
              <li className="no-options">Không có lựa chọn nào.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
