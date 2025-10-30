import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiMapPin, FiBell } from "react-icons/fi";
import "./ParentSidebar.css";

const ParentSidebar = () => {
  const location = useLocation();
  const activePage = location.pathname;

  return (
    <aside className="parent-sidebar">
      <div className="parent-sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="parent-sidebar-nav">
        <ul>
          <li className={activePage === "/parent/home" ? "active" : ""}>
            <Link to="/parent/home">
              <FiHome />
              <span>Trang chủ</span>
            </Link>
          </li>
          <li className={activePage === "/parent/map" ? "active" : ""}>
            <Link to="/parent/map">
              <FiMapPin />
              <span>Vị trí xe</span>
            </Link>
          </li>
          <li className={activePage === "/parent/notifications" ? "active" : ""}>
            <Link to="/parent/notifications">
              <FiBell />
              <span>Thông báo</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ParentSidebar;
