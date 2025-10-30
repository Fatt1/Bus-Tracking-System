import React, { useState, useEffect } from "react";
import axios from "axios";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import MapComponent from "../../components/MapComponent";
import { FaBus, FaSpinner, FaMapMarkedAlt } from "react-icons/fa";
import "./ParentTrackingMapPage.css";

// Axios instance
const api = axios.create({
  baseURL: "https://localhost:7229",
  withCredentials: true,
});

const ParentTrackingMapPage = () => {
  const [busLocation, setBusLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get parent name from localStorage
  const parentName =
    (typeof window !== "undefined" && localStorage.getItem("fullName")) ||
    "Phụ Huynh";

  // Fetch bus location today
  useEffect(() => {
    const fetchBusLocation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/v1/student/bus-location-today");
        console.log("Bus location response:", response.data);

        if (typeof response.data === "string") {
          // No bus location today
          setBusLocation(null);
          setRouteData(null);
        } else {
          setBusLocation(response.data);
          
          // If response contains route information, set it
          if (response.data.route && response.data.route.stopPoints) {
            setRouteData({
              id: response.data.busId,
              stopPoints: response.data.route.stopPoints,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching bus location:", err);
        setError("Không thể tải vị trí xe buýt. Vui lòng thử lại.");
        setBusLocation(null);
        setRouteData(null);
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
            {busLocation && (
              <div className="bus-info-badge">
                <FaBus />
                <span>
                  Xe: <strong>{busLocation.busName || "N/A"}</strong>
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="tracking-loading">
              <FaSpinner className="spinner" /> Đang tải vị trí xe buýt...
            </div>
          ) : error ? (
            <div className="tracking-error">{error}</div>
          ) : !busLocation ? (
            <div className="tracking-no-data">
              <FaMapMarkedAlt size={50} />
              <p>Không có thông tin vị trí xe buýt cho hôm nay.</p>
            </div>
          ) : (
            <div className="tracking-map-container">
              {routeData ? (
                <MapComponent
                  selectedRoute={routeData}
                  listenOnly={true}
                  specificBusId={busLocation.busId}
                />
              ) : (
                <div className="tracking-map-placeholder">
                  <FaMapMarkedAlt size={50} />
                  <p>Đang chờ dữ liệu lộ trình...</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentTrackingMapPage;
