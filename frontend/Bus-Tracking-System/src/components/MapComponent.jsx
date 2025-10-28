import React, { useEffect, useRef } from "react";
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
  // Ref để lưu trữ TẤT CẢ marker xe buýt, key là busId
  const busMarkersRef = useRef(new Map());
  const hubConnectionRef = useRef(null);

  useEffect(() => {
    const HUB_URL = "https://localhost:7229/geolocationHub";
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = hubConnection;

    // *** SỬA LỖI 2: SỬA TÊN TRƯỜNG DỮ LIỆU (PascalCase) ***
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
        // Nếu đã có marker, cập nhật vị trí
        markers.get(busId).setLatLng([lat, lng]);
      } else {
        // Nếu chưa có, tạo marker mới
        const newMarker = L.marker([lat, lng], { icon: busIcon })
          .addTo(map)
          .bindPopup(`<b>Xe buýt ${busId}</b>`);
        markers.set(busId, newMarker); // Lưu marker mới vào Map
      }
    });

    // Bắt đầu kết nối
    hubConnection
      .start()
      .then(() => {
        console.log("Kết nối SignalR thành công!");
        // *** SỬA LỖI 1: THAM GIA NHÓM "admin-group" ***
        hubConnection
          .invoke("JoinAdminGroup")
          .then(() => console.log("SignalR: Đã tham gia nhóm 'admin-group'."))
          .catch((err) =>
            console.error("SignalR: Lỗi khi tham gia nhóm 'admin-group': ", err)
          );
      })
      .catch((err) => console.error("Lỗi kết nối SignalR: ", err)); // Lỗi CORS của bạn sẽ hiển thị ở đây

    // Hàm dọn dẹp khi component bị hủy
    return () => {
      console.log("Ngắt kết nối SignalR.");
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      // Xóa tất cả marker xe buýt khi component unmount
      busMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      busMarkersRef.current.clear();
    };
  }, [map]); // Chỉ chạy 1 lần khi map sẵn sàng

  return null; // Component này không render gì
};

// --- COMPONENT VẼ ĐƯỜNG ĐI VÀ ĐIỂM DỪNG (ĐÃ CẬP NHẬT) ---
const SelectedRouteLayer = ({ selectedRoute }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const stopMarkersRef = useRef([]);

  useEffect(() => {
    // --- Xóa control và stop markers cũ ---
    // *** SỬA LỖI 3: KIỂM TRA _map TRƯỚC KHI XÓA ***
    // Lỗi 'removeLayer' xảy ra do React Strict Mode
    if (routingControlRef.current && routingControlRef.current._map) {
      console.log("Map: Removing previous route control");
      routingControlRef.current.remove(); // Dùng .remove()
    }
    routingControlRef.current = null;

    stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    stopMarkersRef.current = [];

    // --- Vẽ mới ---
    if (selectedRoute?.stopPoints?.length > 0) {
      const sortedPoints = [...selectedRoute.stopPoints].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      );
      const waypoints = sortedPoints.map((p) =>
        L.latLng(p.latitude, p.longitude)
      );

      if (waypoints.length > 0) {
        // Tạo Routing Control (chỉ vẽ đường)
        const newRoutingControl = L.Routing.control({
          waypoints: waypoints,
          addWaypoints: false,
          draggableWaypoints: false,
          routeWhileDragging: false,
          show: false, // Ẩn chỉ đường
          lineOptions: {
            styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
          },
          createMarker: () => null, // Không tạo marker điểm dừng bằng control
        }).addTo(map);
        routingControlRef.current = newRoutingControl; // Lưu ref

        // --- Thêm marker cho các điểm dừng (custom icon) ---
        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          // Điểm cuối dùng icon đỏ
          const markerIcon =
            index === sortedPoints.length - 1 ? redIcon : DefaultIcon;
          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(`<b>${point.pointName}</b><br>Trạm dừng số ${index + 1}`)
            .addTo(map);
          stopMarkersRef.current.push(stopMarker);
        });

        // --- Zoom vào tuyến đường ---
        if (waypoints.length > 1) {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(waypoints[0], 14);
        }
      }
    } else {
      // Chỉ reset view nếu không có route nào được chọn *và* map đã sẵn sàng
      if (map) {
        map.setView([10.7769, 106.6954], 13);
      }
    }

    // --- Hàm dọn dẹp ---
    return () => {
      // *** SỬA LỖI 3: KIỂM TRA _map TRƯỚC KHI XÓA ***
      if (routingControlRef.current && routingControlRef.current._map) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
      stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      stopMarkersRef.current = [];
    };
  }, [selectedRoute, map]);

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

      {/* Component này sẽ nhận vị trí xe buýt real-time */}
      <SignalRHandler />
    </MapContainer>
  );
};

export default MapComponent;
