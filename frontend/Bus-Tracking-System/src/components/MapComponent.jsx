import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

// --- Fix lỗi icon marker ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"; // Thêm ảnh retina
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Icon xanh mặc định
let DefaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl, // Thêm retina URL
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34], // Điều chỉnh popup anchor
  shadowSize: [41, 41], // Thêm shadow size
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Icon xe buýt ---
const busIcon = L.icon({
  iconUrl: "/src/assets/bus.png", // Đảm bảo đường dẫn đúng
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20], // Điều chỉnh popup anchor cho icon bus
});

// --- Icon màu đỏ cho điểm cuối ---
// **QUAN TRỌNG:** Bạn cần có file ảnh marker-icon-red.png và marker-icon-red-2x.png
// Nếu chưa có, bạn có thể tìm kiếm "leaflet marker icon red png" hoặc dùng placeholder
const redIcon = L.icon({
  // iconUrl: '/marker-icon-red.png', // Đặt ảnh này trong thư mục /public
  // iconRetinaUrl: '/marker-icon-red-2x.png', // Ảnh retina
  iconUrl: "/src/assets/RedMarker.png", // Dùng tạm ảnh online
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- COMPONENT CON ĐỂ VẼ TUYẾN ĐƯỜNG VÀ MARKERS ---
const SelectedRouteLayer = ({ selectedRoute }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]); // Ref mới để lưu các marker điểm dừng

  useEffect(() => {
    // --- Xóa control, marker bus, và marker điểm dừng cũ ---
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (busMarkerRef.current) {
      map.removeLayer(busMarkerRef.current);
      busMarkerRef.current = null;
    }
    // Xóa các marker điểm dừng cũ
    stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    stopMarkersRef.current = []; // Reset mảng ref

    // --- Vẽ mới nếu có selectedRoute ---
    if (
      selectedRoute &&
      selectedRoute.stopPoints &&
      selectedRoute.stopPoints.length > 0
    ) {
      const sortedPoints = [...selectedRoute.stopPoints].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      ); // Sắp xếp lại cho chắc
      const waypoints = sortedPoints.map((p) =>
        L.latLng(p.latitude, p.longitude)
      );

      if (waypoints.length > 0) {
        // --- Vẽ đường đi (Không tạo marker) ---
        const newRoutingControl = L.Routing.control({
          waypoints: waypoints,
          addWaypoints: false,
          draggableWaypoints: false,
          routeWhileDragging: false,
          show: false, // Ẩn panel chỉ đường
          lineOptions: {
            styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
          },
          createMarker: () => null, // Hoàn toàn không tạo marker bằng control này
        }).addTo(map);
        routingControlRef.current = newRoutingControl;

        // --- Thêm marker xe buýt ở điểm bắt đầu ---
        const startPoint = waypoints[0];
        const newBusMarker = L.marker(startPoint, { icon: busIcon })
          .bindPopup(`<b>${selectedRoute.routeName}</b><br>Điểm xuất phát`)
          .addTo(map);
        busMarkerRef.current = newBusMarker;

        // --- Thêm marker cho các điểm dừng (custom icon) ---
        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          // Chọn icon: điểm cuối dùng redIcon, còn lại dùng DefaultIcon
          const markerIcon =
            index === sortedPoints.length - 1 ? redIcon : DefaultIcon;

          // Bỏ qua điểm đầu nếu không muốn hiển thị marker xanh ở đó
          // if (index === 0) return;

          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(`<b>${point.pointName}</b><br>Trạm dừng số ${index + 1}`)
            .addTo(map);
          stopMarkersRef.current.push(stopMarker); // Lưu marker vào ref
        });

        // --- Zoom vào tuyến đường ---
        if (waypoints.length > 1) {
          // Dùng bounds của Leaflet để zoom vừa khít các điểm
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] }); // Thêm padding
        } else {
          map.setView(startPoint, 14); // Nếu chỉ có 1 điểm
        }
      }
    } else {
      // Reset view nếu không có route nào được chọn
      map.setView([10.7769, 106.6954], 13);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute, map]); // Chạy lại khi selectedRoute thay đổi

  return null;
};

// --- COMPONENT MAP CHÍNH (Giữ nguyên) ---
const MapComponent = ({ selectedRoute }) => {
  const initialPosition = [10.7769, 106.6954]; // Vị trí trung tâm TP.HCM
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
    </MapContainer>
  );
};

export default MapComponent;
