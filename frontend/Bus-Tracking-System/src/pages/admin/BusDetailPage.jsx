import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import "./BusDetailPage.css";
import busImg from "../../assets/bus.png";
import { FaBus, FaAngleLeft } from "react-icons/fa";
import MapComponent from "../../components/MapComponent";
import AdminHeader from "../../components/admin/AdminHeader"; // Import AdminHeader

// Component chính của trang
const BusDetailPage = () => {
  const { t } = useTranslation();
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null); // <-- 2. THÊM STATE ĐỂ LƯU THÔNG TIN TUYẾN ĐƯỜNG
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusAndMaybeRoute = async () => {
      try {
        // Lấy chi tiết xe buýt
        const busRes = await api.get(`/api/v1/bus/${busId}`);
        const busData = busRes.data;
        setBus(busData);

        // Nếu có tên tuyến, cố gắng tìm tuyến để hiển thị bản đồ
        if (busData?.routeName) {
          try {
            const routesRes = await api.get(`/api/v1/route/all`, {
              params: { PageNumber: 1, PageSize: 1000 },
            });
            const allRoutes = routesRes.data?.items || [];
            const foundRoute = allRoutes.find(
              (r) =>
                (r.routeName || "").toLowerCase() ===
                busData.routeName.toLowerCase()
            );
            if (foundRoute) {
              setRoute(foundRoute);
            }
          } catch (routeErr) {
            console.warn("Không thể tải dữ liệu tuyến đường:", routeErr);
          }
        }
      } catch (err) {
        setError("Không tìm thấy thông tin xe buýt hoặc lỗi khi tải dữ liệu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusAndMaybeRoute();
  }, [busId]);

  if (loading) {
    return (
      <main className="main-content-area">
        <div className="detail-loading">{t("bus.loadingDetail")}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content-area">
        <div className="detail-error">{error}</div>
      </main>
    );
  }

  if (!bus) {
    return (
      <main className="main-content-area">
        <div className="detail-error">{t("common.noData")}</div>
      </main>
    );
  }

  return (
    <main className="main-content-area">
      <AdminHeader
        breadcrumbs={
          <>
            <Link to="/bus" className="back-link">
              <FaAngleLeft /> {t("bus.detailBreadcrumb")}
            </Link>
            {" / "}
            <span>
              {t("bus.detailTitle")} {bus.busName}
            </span>
          </>
        }
      />

      <div className="page-content detail-page-content">
        <div className="bus-detail-card">
          <div className="bus-detail-image">
            <img src={busImg} alt={`${t("bus.vehicle")} ${bus.busName}`} />
          </div>
          <div className="bus-detail-info">
            <h3>
              {t("bus.vehicle")} {`00${bus.id}`.slice(-3)}
            </h3>
            <p>
              <strong>{t("bus.plateNumber")}:</strong> {bus.plateNumber}
            </p>
            <p>
              <strong>{t("bus.driver")}:</strong>{" "}
              {bus.driverName || t("bus.notAssigned")}
            </p>
            <div className="bus-status">
              <strong>{t("bus.technicalStatus")}:</strong>{" "}
              {Number(bus.status) === 1
                ? t("bus.active")
                : t("bus.maintenance")}
              <span
                className={`status-dot ${
                  Number(bus.status) === 1 ? "active" : "inactive"
                }`}
              ></span>
            </div>
          </div>
        </div>

        {/* Hiển thị banner tuyến đường nếu có thông tin */}
        {route && (
          <div className="route-info-banner">
            <FaBus className="route-bus-icon" />
            <div className="route-info-text">
              <h4>
                {t("bus.route")}: {route.routeName}
              </h4>
            </div>
          </div>
        )}

        {/* 3. THAY THẾ PLACEHOLDER BẰNG MAP COMPONENT */}
        <div className="map-container-detail">
          {route ? (
            <MapComponent
              selectedRoute={route}
              isAnimationTriggered={false}
              onAnimationFinished={() => {}}
              listenOnly={true} // Chỉ lắng nghe realtime, không giả lập
              specificBusId={bus.id} // Chỉ hiển thị xe bus này
            />
          ) : (
            <div className="map-placeholder-detail">{t("bus.noRouteData")}</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BusDetailPage;
