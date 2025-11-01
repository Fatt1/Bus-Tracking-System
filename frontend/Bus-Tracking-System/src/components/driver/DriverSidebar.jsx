import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaTasks, FaUserCheck, FaBell } from "react-icons/fa";
import "./DriverSidebar.css";

const DriverSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const activePage = location.pathname;

  return (
    <aside className="driver-sidebar">
      <div className="driver-sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="driver-sidebar-nav">
        <ul>
          <li className={activePage === "/driver/home" ? "active" : ""}>
            <Link to="/driver/home">
              <FaHome /> {t("driverApp.sidebar.home")}
            </Link>
          </li>
          <li className={activePage === "/driver/schedule" ? "active" : ""}>
            <Link to="/driver/schedule">
              <FaTasks /> {t("driverApp.sidebar.schedule")}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/students") ? "active" : ""
            }
          >
            <Link to="/driver/students">
              <FaUserCheck /> {t("driverApp.sidebar.students")}
            </Link>
          </li>
          <li
            className={
              activePage.startsWith("/driver/notifications") ? "active" : ""
            }
          >
            <Link to="/driver/notifications">
              <FaBell /> {t("driverApp.sidebar.notifications")}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DriverSidebar;
