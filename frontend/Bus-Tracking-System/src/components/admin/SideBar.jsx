import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./SideBar.css";
import {
  FaHome,
  FaBus,
  FaUserTie,
  FaRoute,
  FaUserGraduate,
  FaCommentDots,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

export function SideBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile only)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
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
    window.toggleAdminSidebar = () => setIsOpen(!isOpen);
    return () => {
      delete window.toggleAdminSidebar;
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h3>Smart Bus</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" end>
                <FaHome /> <span>{t("admin.sidebar.dashboard")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/bus">
                <FaBus /> <span>{t("admin.sidebar.buses")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/drivers">
                <FaUserTie /> <span>{t("admin.sidebar.drivers")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/routes">
                <FaRoute /> <span>{t("admin.sidebar.routes")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/schedule">
                <FaRoute /> <span>{t("admin.sidebar.schedules")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/students">
                <FaUserGraduate /> <span>{t("admin.sidebar.students")}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notification">
                <FaCommentDots /> <span>{t("admin.sidebar.notifications")}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
