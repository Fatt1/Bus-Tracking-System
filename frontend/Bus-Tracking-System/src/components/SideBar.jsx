import React from "react";
// 1. Import NavLink thay vì Link/a
import { NavLink } from "react-router-dom";
import "./SideBar.css"; // Sẽ tạo file CSS riêng ở bước 3
import {
  FaHome,
  FaBus,
  FaUserTie,
  FaRoute,
  FaUserGraduate,
  FaCommentDots,
} from "react-icons/fa";

export function SideBar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            {/* 2. Dùng NavLink, href đổi thành to */}
            {/* 'end' đảm bảo link này chỉ active khi URL là "/" */}
            <NavLink to="/" end>
              <FaHome /> Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/bus">
              <FaBus /> Xe buýt
            </NavLink>
          </li>
          <li>
            {/* Giả lập các route cho tương lai */}
            <NavLink to="/drivers">
              <FaUserTie /> Tài xế
            </NavLink>
          </li>
          <li>
            <NavLink to="/routes">
              <FaRoute /> Tuyến đường
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule">
              <FaRoute /> Lịch trình xe schedule
            </NavLink>
          </li>
          <li>
            <NavLink to="/students">
              <FaUserGraduate /> Học sinh
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages">
              <FaCommentDots /> Nhắn tin
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
