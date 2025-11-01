import React from "react";
import { NavLink } from "react-router-dom";
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
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>36 36 BUS BUS</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end>
              <FaHome /> {t('admin.sidebar.dashboard')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/bus">
              <FaBus /> {t('admin.sidebar.buses')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/drivers">
              <FaUserTie /> {t('admin.sidebar.drivers')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/routes">
              <FaRoute /> {t('admin.sidebar.routes')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule">
              <FaRoute /> {t('admin.sidebar.schedules')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/students">
              <FaUserGraduate /> {t('admin.sidebar.students')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/notification">
              <FaCommentDots /> {t('admin.sidebar.notifications')}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
