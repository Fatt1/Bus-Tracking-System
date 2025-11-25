import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { getFullName } from "../../utils/auth";
import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentHeader from "../../components/parent/ParentHeader";
import MapComponent from "../../components/MapComponent";
import { FaBus, FaSpinner, FaMapMarkedAlt, FaRoute } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./ParentTrackingMapPage.css";

const ParentTrackingMapPage = () => {
  const { t } = useTranslation();
  const [busLocationData, setBusLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectedTripType, setDetectedTripType] = useState('pickup'); // ✅ NEW: State cho detected tripType

  // Get parent name from sessionStorage
  const parentName = getFullName() || t("parent.home.parent");
  
  // ✅ NEW: Callback khi MapComponent detect được tripType
  const handleTripTypeDetected = useCallback((newTripType) => {
    console.log("🎯 [ParentMap] Received tripType from MapComponent:", newTripType);
    setDetectedTripType(newTripType);
  }, []);

  // ✅ Hàm fetch bus location (tách ra để dùng cho cả initial load và polling)
  const fetchBusLocation = useCallback(async () => {
    console.log("🚌 [ParentMap] Fetching bus location...");
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
          setError(t("parent.tracking.invalidData"));
          setBusLocationData(null);
        } else {
          console.log("✅ [ParentMap] Valid bus location data received");
          console.log("   - Bus ID:", data.busId);
          console.log("   - Bus Name:", data.busName);
          console.log("   - Route:", data.routeDTO.routeName);
          console.log("   - Stop Points:", data.routeDTO.stopPoints.length);
          console.log("   - Current Position:", data.latitude, data.longitude);
          console.log("   ⚠️ Note: TripType will be auto-detected by MapComponent based on movement direction");

          setBusLocationData(data);
        }
      }
    } catch (err) {
      console.error("❌ [ParentMap] Error fetching bus location:", err);
      if (err.response) {
        console.error("   - Status:", err.response.status);
        console.error("   - Data:", err.response.data);
      }
      setError(t("parent.tracking.error"));
      setBusLocationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // ✅ Effect 1: Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchBusLocation();
  }, [fetchBusLocation]);

  // ✅ Effect 2: Polling every 10 seconds to check if bus data changes (e.g., new schedule)
  // NOTE: Chỉ dựa vào busId, không dựa vào busLocationData để tránh infinite loop
  useEffect(() => {
    // Chỉ polling khi đã có busId
    if (!busLocationData?.busId) return;

    console.log("🔄 [ParentMap] Starting polling interval for bus data updates...");
    
    const intervalId = setInterval(() => {
      console.log("⏰ [ParentMap] Polling API to check for data changes...");
      fetchBusLocation();
    }, 10000); // 10 seconds

    // Cleanup
    return () => {
      console.log("🛑 [ParentMap] Stopping polling interval");
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busLocationData?.busId]); // Chỉ re-setup khi busId thay đổi (tránh loop)
  return (
    <div className="parent-tracking-page-container">
      <ParentSidebar />

      <div className="parent-main-wrapper">
        <ParentHeader
          breadcrumbs={t("parent.tracking.breadcrumb")}
          parentName={parentName}
        />

        <main className="parent-tracking-content">
          <div className="tracking-page-header">
            <h2 className="tracking-page-title">
              <FaBus /> {t("parent.tracking.title")}
            </h2>
            {busLocationData && (
              <div className="bus-info-badge">
                <FaBus />
                <span>
                  {t("parent.tracking.bus")}:{" "}
                  <strong>{busLocationData.busName || "N/A"}</strong>
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
              <FaSpinner className="spinner" /> {t("parent.tracking.loading")}
            </div>
          ) : error ? (
            <div className="tracking-error">{error}</div>
          ) : !busLocationData ? (
            <div className="tracking-no-data">
              <FaMapMarkedAlt size={50} />
              <p>{t("parent.tracking.noData")}</p>
              <p className="tracking-no-data-hint">
                {t("parent.tracking.noScheduleHint")}
              </p>
            </div>
          ) : (
            <div className="tracking-map-container">
              {/* ✅ Display current trip type */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                backgroundColor: detectedTripType === 'dropoff' ? '#FF6B6B' : '#51CF66',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {detectedTripType === 'dropoff' ? '🏠 Chuyến về' : '🚌 Chuyến đi'}
              </div>
              <MapComponent
                selectedRoute={busLocationData.routeDTO}
                listenOnly={true}
                specificBusId={busLocationData.busId}
                tripType={detectedTripType}
                onTripTypeDetected={handleTripTypeDetected}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentTrackingMapPage;
