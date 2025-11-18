import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiMapPin, FiBell } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./ParentSidebar.css";

const ParentSidebar = () => {
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
      const sidebar = document.querySelector('.parent-sidebar');
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
    window.toggleParentSidebar = () => setIsOpen(!isOpen);
    return () => {
      delete window.toggleParentSidebar;
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`parent-sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside className={`parent-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="parent-sidebar-header">
          <h3>Smart Bus</h3>
        </div>
        <nav className="parent-sidebar-nav">
          <ul>
            <li className={activePage === "/parent/home" ? "active" : ""}>
              <Link to="/parent/home">
                <FiHome />
                <span>{t("parent.sidebar.home")}</span>
              </Link>
            </li>
            <li className={activePage === "/parent/map" ? "active" : ""}>
              <Link to="/parent/map">
                <FiMapPin />
                <span>{t("parent.sidebar.tracking")}</span>
              </Link>
            </li>
            <li
              className={activePage === "/parent/notifications" ? "active" : ""}
            >
              <Link to="/parent/notifications">
                <FiBell />
                <span>{t("parent.sidebar.notifications")}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default ParentSidebar;
