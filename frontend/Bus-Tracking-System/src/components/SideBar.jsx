import {
  FaHome,
  FaBus,
  FaRoute,
  FaUserTie,
  FaUserGraduate,
  FaCommentDots,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
export function SideBar() {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>36 36 BUS BUS</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="/dashboard">
                <FaHome /> Trang chủ
              </a>
            </li>
            <li className="active">
              <a href="/buses">
                <FaBus /> Xe buýt
              </a>
            </li>
            <li>
              <a href="#">
                <FaRoute /> Tuyến đường
              </a>
            </li>
            <li>
              <a href="#">
                <FaUserTie /> Tài xế
              </a>
            </li>
            <li>
              <a href="#">
                <FaUserGraduate /> Học sinh
              </a>
            </li>
            <li>
              <a href="#">
                <FaCommentDots /> Nhắn tin
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
