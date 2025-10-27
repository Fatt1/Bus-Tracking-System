import React, { useState, useEffect, useRef } from "react"; // Thêm useState
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import * as signalR from "@microsoft/signalr"; // Import SignalR

// --- Fix lỗi icon marker ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Icon xe buýt ---
const busIcon = L.icon({
  iconUrl: "/src/assets/bus.png", // Đảm bảo đường dẫn đúng
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

// --- Icon màu đỏ cho điểm cuối ---
const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- COMPONENT SIGNALR HANDLER (ĐÃ CẬP NHẬT) ---
const SignalRHandler = () => {
  const map = useMap();
  const busMarkersRef = useRef(new Map());
  const hubConnectionRef = useRef(null);

  useEffect(() => {
    const HUB_URL = "https://localhost:7229/geolocationHub";
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = hubConnection;

    // *** SỬA LỖI 3: SỬA TÊN TRƯỜNG DỮ LIỆU (PascalCase) ***
    hubConnection.on("ReceiveLocationUpdate", (data) => {
      // DTO của C# là BusLastLocationDTO(double Lat, double Lng, int BusId)
      const lat = data.Lat || data.lat;
      const lng = data.Lng || data.lng;
      const busId = data.BusId || data.busId;

      if (lat === undefined || lng === undefined || busId === undefined) {
        console.warn("SignalR: Nhận được dữ liệu vị trí không hợp lệ:", data);
        return;
      }

      console.log(`SignalR: Nhận vị trí cho Bus ${busId}: [${lat}, ${lng}]`);
      const markers = busMarkersRef.current;

      if (markers.has(busId)) {
        markers.get(busId).setLatLng([lat, lng]);
      } else {
        const newMarker = L.marker([lat, lng], { icon: busIcon })
          .addTo(map)
          .bindPopup(`<b>Xe buýt ${busId}</b>`);
        markers.set(busId, newMarker);
      }
    });

    hubConnection
      .start()
      .then(() => {
        console.log("Kết nối SignalR thành công!");
        // *** SỬA LỖI 2: THAM GIA NHÓM "admin-group" ***
        hubConnection
          .invoke("JoinAdminGroup")
          .then(() => console.log("SignalR: Đã tham gia nhóm 'admin-group'."))
          .catch((err) =>
            console.error("SignalR: Lỗi khi tham gia nhóm: ", err)
          );
      })
      .catch((err) => console.error("Lỗi kết nối SignalR: ", err)); // Lỗi CORS của bạn sẽ hiển thị ở đây

    return () => {
      console.log("Ngắt kết nối SignalR.");
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      busMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      busMarkersRef.current.clear();
    };
  }, [map]);

  return null;
};

// --- COMPONENT VẼ ĐƯỜNG ĐI VÀ ĐIỂM DỪNG (ĐÃ CẬP NHẬT) ---
const SelectedRouteLayer = ({ selectedRoute }) => {
  const map = useMap();
  // Các Ref này giờ là CỤC BỘ cho mỗi lần render của useEffect
  // const routingControlRef = useRef(null);
  // const stopMarkersRef = useRef([]);
  // const busMarkerRef = useRef(null);
  // const animationIntervalId = useRef(null);

  // THAY ĐỔI: Dùng useState cho routeIndex để trigger re-render (dù không cần thiết)
  // Thực ra cũng không cần state
  // const [routeIndex, setRouteIndex] = useState(0);
  const animationSpeed = 100;

  useEffect(() => {
    // --- Định nghĩa các biến cục bộ cho lần render này ---
    let currentRoutingControl = null;
    let currentBusMarker = null;
    let currentStopMarkers = [];
    let currentAnimationIntervalId = null;

    // --- Hàm bắt đầu Animation (nằm trong useEffect) ---
    const startAnimation = (coordinates, markerToAnimate) => {
      console.log(
        "startAnimation: Clearing previous interval ID (if any):",
        currentAnimationIntervalId
      );
      // Clear interval trước đó (nếu có)
      if (currentAnimationIntervalId) {
        clearInterval(currentAnimationIntervalId);
      }
      let index = 0; // Index cục bộ

      // Bắt đầu interval mới
      currentAnimationIntervalId = setInterval(() => {
        index++;
        const nextIndex = index;

        if (nextIndex >= coordinates.length) {
          console.log("Animation finished, clearing interval.");
          clearInterval(currentAnimationIntervalId);
          currentAnimationIntervalId = null;
          return;
        }

        // Cập nhật vị trí của marker CỤC BỘ
        if (markerToAnimate) {
          markerToAnimate.setLatLng(coordinates[nextIndex]);
        }
      }, animationSpeed);
      console.log(
        "Animation started with new interval ID:",
        currentAnimationIntervalId
      );
    };

    // --- Vẽ mới ---
    if (selectedRoute?.stopPoints?.length > 0) {
      const sortedPoints = [...selectedRoute.stopPoints].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      );
      const waypoints = sortedPoints.map((p) =>
        L.latLng(p.latitude, p.longitude)
      );

      if (waypoints.length > 0) {
        // --- Thêm marker xe buýt ở điểm bắt đầu ---
        const startPoint = waypoints[0];
        currentBusMarker = L.marker(startPoint, { icon: busIcon })
          .bindPopup(
            `<b>${selectedRoute.routeName}</b><br>Xe buýt: BUS-${String(
              selectedRoute.id
            ).padStart(3, "0")}`
          )
          .addTo(map);

        // --- Thêm marker cho các điểm dừng ---
        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          const markerIcon =
            index === sortedPoints.length - 1 ? redIcon : DefaultIcon;
          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(`<b>${point.pointName}</b><br>Trạm dừng số ${index + 1}`)
            .addTo(map);
          currentStopMarkers.push(stopMarker);
        });

        // --- Tạo Routing Control (vẽ đường) ---
        currentRoutingControl = L.Routing.control({
          waypoints: waypoints,
          addWaypoints: false,
          draggableWaypoints: false,
          routeWhileDragging: false,
          show: false,
          lineOptions: {
            styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
          },
          createMarker: () => null,
        })
          .on("routesfound", function (e) {
            // Lắng nghe sự kiện
            if (e.routes && e.routes.length > 0) {
              const coordinates = e.routes[0].coordinates;
              console.log(
                `Route found with ${coordinates.length} coordinates.`
              );
              // Bắt đầu animation với marker cục bộ
              startAnimation(coordinates, currentBusMarker);
            }
          })
          .addTo(map);

        // --- Zoom vào tuyến đường ---
        if (waypoints.length > 1) {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(waypoints[0], 14);
        }
      }
    } else {
      // Reset view nếu không có route nào được chọn
      map.setView([10.7769, 106.6954], 13);
    }

    // --- Hàm dọn dẹp ---
    return () => {
      console.log(
        "Cleanup running: Clearing interval",
        currentAnimationIntervalId
      );
      // 1. Dừng animation
      if (currentAnimationIntervalId) {
        clearInterval(currentAnimationIntervalId);
        currentAnimationIntervalId = null;
      }
      // 2. Xóa đường đi
      if (currentRoutingControl && currentRoutingControl._map) {
        console.log("Cleanup: Removing route control");
        currentRoutingControl.remove();
      }
      // 3. Xóa marker xe buýt
      if (currentBusMarker) {
        console.log("Cleanup: Removing bus marker");
        map.removeLayer(currentBusMarker);
      }
      // 4. Xóa marker điểm dừng
      console.log(
        `Cleanup: Removing ${currentStopMarkers.length} stop markers`
      );
      currentStopMarkers.forEach((marker) => map.removeLayer(marker));
    };
  }, [selectedRoute, map]); // Chỉ chạy lại khi selectedRoute hoặc map thay đổi

  return null;
};

// --- COMPONENT MAP CHÍNH ---
const MapComponent = ({ selectedRoute }) => {
  const initialPosition = [10.7769, 106.6954];
  console.log("MapComponent rendering with selectedRoute:", selectedRoute);

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <SelectedRouteLayer selectedRoute={selectedRoute} />
      <SignalRHandler />
    </MapContainer>
  );
};

export default MapComponent;
