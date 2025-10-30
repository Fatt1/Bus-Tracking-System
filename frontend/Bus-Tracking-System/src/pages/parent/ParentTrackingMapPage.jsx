import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { getFullName } from "../../utils/auth";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import MapComponent from "../../components/MapComponent";
import { FaBus, FaSpinner, FaMapMarkedAlt, FaRoute } from "react-icons/fa";
import "./ParentTrackingMapPage.css";

const ParentTrackingMapPage = () => {
  const [busLocationData, setBusLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get parent name from sessionStorage
  const parentName = getFullName() || "Phụ Huynh";

  // Fetch bus location today
  useEffect(() => {
    const fetchBusLocation = async () => {
      console.log("🚌 [ParentMap] Fetching bus location...");
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/v1/student/bus-location-today");
        console.log("🚌 [ParentMap] API Response:", response.data);

        if (typeof response.data === "string") {
          // No bus location today (backend trả về string message)
          console.log("⚠️ [ParentMap] No schedule today");
          setBusLocationData(null);
        } else {
          // Có data - validate structure
          const data = response.data;

          // Check if we have required data
          if (!data.busId || !data.routeDTO || !data.routeDTO.stopPoints) {
            console.error("❌ [ParentMap] Invalid data structure:", data);
            setError("Dữ liệu vị trí xe không hợp lệ.");
            setBusLocationData(null);
          } else {
            console.log("✅ [ParentMap] Valid bus location data received");
            console.log("   - Bus ID:", data.busId);
            console.log("   - Bus Name:", data.busName);
            console.log("   - Route:", data.routeDTO.routeName);
            console.log("   - Stop Points:", data.routeDTO.stopPoints.length);

            setBusLocationData(data);
          }
        }
      } catch (err) {
        console.error("❌ [ParentMap] Error fetching bus location:", err);
        if (err.response) {
          console.error("   - Status:", err.response.status);
          console.error("   - Data:", err.response.data);
        }
        setError("Không thể tải vị trí xe buýt. Vui lòng thử lại.");
        setBusLocationData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusLocation();
  }, []);

  return (
    <div className="parent-tracking-page-container">
      <ParentSidebar />

      <div className="parent-main-wrapper">
        <ParentHeader breadcrumbs="Trang / Vị trí xe" parentName={parentName} />

        <main className="parent-tracking-content">
          <div className="tracking-page-header">
            <h2 className="tracking-page-title">
              <FaBus /> Theo dõi vị trí xe buýt
            </h2>
            {busLocationData && (
              <div className="bus-info-badge">
                <FaBus />
                <span>
                  Xe: <strong>{busLocationData.busName || "N/A"}</strong>
                </span>
                {busLocationData.routeDTO && (
                  <span className="route-badge">
                    <FaRoute />
                    {busLocationData.routeDTO.routeName}
                  </span>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="tracking-loading">
              <FaSpinner className="spinner" /> Đang tải vị trí xe buýt...
            </div>
          ) : error ? (
            <div className="tracking-error">{error}</div>
          ) : !busLocationData ? (
            <div className="tracking-no-data">
              <FaMapMarkedAlt size={50} />
              <p>Không có thông tin vị trí xe buýt cho hôm nay.</p>
              <p className="tracking-no-data-hint">
                Con bạn chưa có lịch trình đi học hôm nay.
              </p>
            </div>
          ) : (
            <div className="tracking-map-container">
              <MapComponent
                selectedRoute={busLocationData.routeDTO}
                listenOnly={true}
                specificBusId={busLocationData.busId}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentTrackingMapPage;
