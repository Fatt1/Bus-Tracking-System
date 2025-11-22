import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaTasks, FaUserCheck, FaBell } from "react-icons/fa";
import "./DriverSidebar.css";

const DriverSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const activePage = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes (mobile only)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.driver-sidebar');
      const hamburger = document.querySelector('.hamburger-button');
      
      if (window.innerWidth <= 768 && 
          isOpen && 
          sidebar && 
          !sidebar.contains(event.target) &&
          hamburger &&
          !hamburger.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Expose toggle function globally for hamburger button
  useEffect(() => {
    window.toggleDriverSidebar = () => setIsOpen(!isOpen);
    return () => {
      delete window.toggleDriverSidebar;
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside className={`driver-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="driver-sidebar-header">
          <h3>Smart Bus</h3>
        </div>
        <nav className="driver-sidebar-nav">
          <ul>
            <li className={activePage === "/driver/home" ? "active" : ""}>
              <Link to="/driver/home">
                <FaHome /> <span>{t("driverApp.sidebar.home")}</span>
              </Link>
            </li>
            <li className={activePage === "/driver/schedule" ? "active" : ""}>
              <Link to="/driver/schedule">
                <FaTasks /> <span>{t("driverApp.sidebar.schedule")}</span>
              </Link>
            </li>
            <li
              className={
                activePage.startsWith("/driver/students") ? "active" : ""
              }
            >
              <Link to="/driver/students">
                <FaUserCheck /> <span>{t("driverApp.sidebar.students")}</span>
              </Link>
            </li>
            <li
              className={
                activePage.startsWith("/driver/notifications") ? "active" : ""
              }
            >
              <Link to="/driver/notifications">
                <FaBell /> <span>{t("driverApp.sidebar.notifications")}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default DriverSidebar;
