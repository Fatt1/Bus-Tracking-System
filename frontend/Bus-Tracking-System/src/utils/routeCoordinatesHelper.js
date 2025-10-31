// Helper để lấy coordinates từ Leaflet Routing Machine
// Đảm bảo xe bus chạy đúng theo đường vẽ ra

import L from "leaflet";
import "leaflet-routing-machine";

/**
 * Lấy danh sách tọa độ chi tiết từ Leaflet Routing Machine
 * @param {Array} stopPoints - Danh sách điểm dừng với latitude, longitude, sequenceOrder
 * @param {string} tripType - 'pickup' hoặc 'dropoff'
 * @returns {Promise<Array>} - Promise resolve với mảng coordinates [{lat, lng}]
 */
export function getRouteCoordinates(stopPoints, tripType) {
  return new Promise((resolve, reject) => {
    // Sắp xếp và đảo ngược nếu cần
    const sortedPoints = [...stopPoints].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder
    );
    if (tripType === "dropoff") sortedPoints.reverse();

    const waypoints = sortedPoints.map((p) =>
      L.latLng(p.latitude, p.longitude)
    );

    console.log(
      `🗺️ RouteHelper: Fetching coordinates for ${waypoints.length} waypoints`
    );

    // Tạo routing control tạm thời
    const tempRouting = L.Routing.control({
      waypoints: waypoints,
      addWaypoints: false,
      createMarker: () => null,
      show: false,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ opacity: 0 }], // Ẩn đường đi
      },
    });

    let timeoutId = null;
    let tempMap = null;

    // Lắng nghe sự kiện routesfound
    tempRouting.on("routesfound", function (e) {
      console.log("🗺️ RouteHelper: Routes found!", e);

      if (e.routes && e.routes.length > 0) {
        const coordinates = e.routes[0].coordinates.map((c) => ({
          lat: c.lat,
          lng: c.lng,
        }));
        console.log(
          `✅ RouteHelper: Got ${coordinates.length} coordinates from OSRM`
        );
        
        // Dọn dẹp
        if (timeoutId) clearTimeout(timeoutId);
        if (tempMap) tempMap.remove();
        if (tempDiv && tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
        
        resolve(coordinates);
      } else {
        console.error("❌ RouteHelper: No routes found");
        
        // Dọn dẹp
        if (timeoutId) clearTimeout(timeoutId);
        if (tempMap) tempMap.remove();
        if (tempDiv && tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
        
        reject(new Error("No routes found"));
      }
    });

    // Xử lý lỗi routing
    tempRouting.on("routingerror", function (e) {
      console.error("❌ RouteHelper: Routing error:", e);
      
      // Dọn dẹp
      if (timeoutId) clearTimeout(timeoutId);
      if (tempMap) tempMap.remove();
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      
      reject(new Error("Routing error"));
    });

    // Thêm control vào một div tạm để nó tính toán
    // Không cần map thật, chỉ cần div để Leaflet Routing Machine hoạt động
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    try {
      // Tạo map tạm
      tempMap = L.map(tempDiv, {
        center: [waypoints[0].lat, waypoints[0].lng],
        zoom: 13,
      });

      // Thêm routing control vào map tạm
      tempRouting.addTo(tempMap);

      // Dọn dẹp sau 30 giây (timeout)
      timeoutId = setTimeout(() => {
        console.warn("⚠️ RouteHelper: Timeout getting route coordinates");
        if (tempMap) {
          tempMap.remove();
        }
        if (tempDiv && tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
        reject(new Error("Timeout getting route coordinates"));
      }, 30000);
    } catch (err) {
      console.error("❌ RouteHelper: Error creating temp map:", err);
      if (timeoutId) clearTimeout(timeoutId);
      if (tempMap) tempMap.remove();
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      reject(err);
    }
  });
}
