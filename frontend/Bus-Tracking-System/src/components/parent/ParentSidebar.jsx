import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiMapPin, FiBell } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./ParentSidebar.css";

const ParentSidebar = () => {
  const { t } = useTranslation();
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
              <span>{t('parent.sidebar.home')}</span>
            </Link>
          </li>
          <li className={activePage === "/parent/map" ? "active" : ""}>
            <Link to="/parent/map">
              <FiMapPin />
              <span>{t('parent.sidebar.tracking')}</span>
            </Link>
          </li>
          <li
            className={activePage === "/parent/notifications" ? "active" : ""}
          >
            <Link to="/parent/notifications">
              <FiBell />
              <span>{t('parent.sidebar.notifications')}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ParentSidebar;
