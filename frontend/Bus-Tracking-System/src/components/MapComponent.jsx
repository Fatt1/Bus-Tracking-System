import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import * as signalR from "@microsoft/signalr";

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
  iconUrl: "/src/assets/bus.png",
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

// --- COMPONENT XỬ LÝ TẤT CẢ LOGIC SIGNALR (Gửi và Nhận) ---
const SignalRHandler = ({
  selectedRoute,
  isAnimationTriggered,
  onAnimationFinished,
}) => {
  const map = useMap();
  const busMarkersRef = useRef(new Map());
  const hubConnectionRef = useRef(null);
  const animationIntervalRef = useRef(null);
  const currentBusIdRef = useRef(null); // Lưu busId hiện tại

  // --- Hàm gửi (bắt đầu giả lập) ---
  const startSimulationSender = (route) => {
    // Clear interval cũ nếu có
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    const hubConnection = hubConnectionRef.current;
    if (
      !hubConnection ||
      hubConnection.state !== signalR.HubConnectionState.Connected
    ) {
      console.error("SignalR chưa kết nối, không thể bắt đầu giả lập.");
      onAnimationFinished();
      return;
    }

    // 1. Lấy tọa độ chi tiết từ L.Routing.control
    const sortedPoints = [...route.stopPoints].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder
    );
    const waypoints = sortedPoints.map((p) =>
      L.latLng(p.latitude, p.longitude)
    );

    console.log(
      `Tạo routing control để lấy coordinates cho Bus ${route.id}...`
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

    // Lắng nghe sự kiện routesfound
    tempRouting.on("routesfound", function (e) {
      console.log("Routes found event triggered!", e);

      if (e.routes && e.routes.length > 0) {
        const coordinates = e.routes[0].coordinates;
        console.log(
          `Đã lấy được ${coordinates.length} tọa độ cho Bus ${route.id}`
        );

        let routeIndex = 0;
        const busId = route.id;

        // 2. Bắt đầu interval
        animationIntervalRef.current = setInterval(() => {
          routeIndex++;

          if (routeIndex >= coordinates.length) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
            console.log(`Kết thúc giả lập cho Bus ${busId}.`);
            // Xóa tempRouting
            if (tempRouting._map) {
              map.removeControl(tempRouting);
            }
            onAnimationFinished();
            return;
          }

          // 3. Gửi vị trí lên Hub
          const currentPos = coordinates[routeIndex];

          if (
            hubConnectionRef.current &&
            hubConnectionRef.current.state ===
              signalR.HubConnectionState.Connected
          ) {
            hubConnectionRef.current
              .invoke("SendLocation", busId, currentPos.lat, currentPos.lng)
              .catch((err) =>
                console.error(
                  `Lỗi khi invoke SendLocation cho Bus ${busId}:`,
                  err
                )
              );
          }
        }, 500);
      } else {
        console.error("Không tìm thấy tuyến đường (coordinates) để giả lập.");
        if (tempRouting._map) {
          map.removeControl(tempRouting);
        }
        onAnimationFinished();
      }
    });

    // Xử lý lỗi routing
    tempRouting.on("routingerror", function (e) {
      console.error("Routing error:", e);
      if (tempRouting._map) {
        map.removeControl(tempRouting);
      }
      onAnimationFinished();
    });

    // Thêm control vào map để nó tính toán
    tempRouting.addTo(map);
  };

  // Effect 1: Quản lý kết nối và Lắng nghe (Receiver)
  useEffect(() => {
    const HUB_URL = "https://localhost:7229/geolocationHub";
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = hubConnection;

    // Lắng nghe sự kiện "ReceiveLocationUpdate"
    hubConnection.on("ReceiveLocationUpdate", (data) => {
      const lat = data.Lat || data.lat;
      const lng = data.Lng || data.lng;
      const busId = data.BusId || data.busId;

      if (lat === undefined || lng === undefined || busId === undefined) return;

      const markers = busMarkersRef.current;

      if (markers.has(busId)) {
        // Cập nhật vị trí marker đã tồn tại
        markers.get(busId).setLatLng([lat, lng]);
      } else {
        // Tạo marker mới nếu chưa có
        const newMarker = L.marker([lat, lng], { icon: busIcon })
          .addTo(map)
          .bindPopup(`<b>Xe buýt ${busId}</b>`);
        markers.set(busId, newMarker);
      }
    });

    // Bắt đầu kết nối và tham gia nhóm
    hubConnection
      .start()
      .then(() => {
        console.log("Kết nối SignalR thành công!");
        hubConnection
          .invoke("JoinAdminGroup")
          .then(() => console.log("SignalR: Đã tham gia nhóm 'admin-group'."))
          .catch((err) =>
            console.error("SignalR: Lỗi khi tham gia nhóm: ", err)
          );
      })
      .catch((err) =>
        console.error("Lỗi kết nối SignalR (Kiểm tra CORS Backend): ", err)
      );

    // Hàm dọn dẹp
    return () => {
      console.log("Ngắt kết nối SignalR.");
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      busMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      busMarkersRef.current.clear();
    };
  }, [map]);

  // Effect 2: Xử lý Gửi (Sender/Simulator)
  useEffect(() => {
    // Dọn dẹp interval cũ trước
    if (animationIntervalRef.current) {
      console.log("Cleanup (Effect 2): Clearing old interval.");
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // Nếu được kích hoạt và có route được chọn
    if (isAnimationTriggered && selectedRoute) {
      startSimulationSender(selectedRoute);
    }

    // Hàm dọn dẹp cho effect này
    return () => {
      if (animationIntervalRef.current) {
        console.log("Cleanup (Effect 2 Return): Clearing interval.");
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimationTriggered, selectedRoute, map]);

  // Effect 3: Tạo marker xe bus ban đầu khi chọn route (đứng yên)
  useEffect(() => {
    if (!selectedRoute?.stopPoints?.length) return;

    const busId = selectedRoute.id;
    currentBusIdRef.current = busId;

    // Xóa marker cũ nếu có
    if (busMarkersRef.current.has(busId)) {
      map.removeLayer(busMarkersRef.current.get(busId));
      busMarkersRef.current.delete(busId);
    }

    // Lấy điểm xuất phát (stopPoint đầu tiên)
    const sortedPoints = [...selectedRoute.stopPoints].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder
    );
    const startPoint = sortedPoints[0];

    if (startPoint) {
      // Tạo marker xe bus tại điểm xuất phát
      const initialMarker = L.marker(
        [startPoint.latitude, startPoint.longitude],
        {
          icon: busIcon,
        }
      )
        .addTo(map)
        .bindPopup(`<b>Xe buýt ${busId}</b><br>Đang chờ khởi hành`);

      busMarkersRef.current.set(busId, initialMarker);
      console.log(`Đã tạo marker xe bus ${busId} tại điểm xuất phát`);
    }

    return () => {
      // Không xóa marker ở đây vì có thể đang chạy animation
    };
  }, [selectedRoute, map]);

  return null;
};

// --- COMPONENT VẼ ĐƯỜNG ĐI VÀ ĐIỂM DỪNG (Tĩnh) ---
const SelectedRouteLayer = ({ selectedRoute }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const stopMarkersRef = useRef([]);

  useEffect(() => {
    // --- Xóa control và stop markers cũ ---
    if (routingControlRef.current && routingControlRef.current._map) {
      routingControlRef.current.remove();
    }
    routingControlRef.current = null;
    stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    stopMarkersRef.current = [];

    // --- Vẽ mới (chỉ vẽ đường và điểm dừng) ---
    if (selectedRoute?.stopPoints?.length > 0) {
      const sortedPoints = [...selectedRoute.stopPoints].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      );
      const waypoints = sortedPoints.map((p) =>
        L.latLng(p.latitude, p.longitude)
      );

      if (waypoints.length > 0) {
        const newRoutingControl = L.Routing.control({
          waypoints: waypoints,
          addWaypoints: false,
          draggableWaypoints: false,
          routeWhileDragging: false,
          show: false,
          lineOptions: {
            styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
          },
          createMarker: () => null,
        }).addTo(map);
        routingControlRef.current = newRoutingControl;

        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          const markerIcon =
            index === sortedPoints.length - 1 ? redIcon : DefaultIcon;
          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(`<b>${point.pointName}</b><br>Trạm dừng số ${index + 1}`)
            .addTo(map);
          stopMarkersRef.current.push(stopMarker);
        });

        if (waypoints.length > 1) {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(waypoints[0], 14);
        }
      }
    } else {
      if (map) {
        map.setView([10.7769, 106.6954], 13);
      }
    }

    // --- Hàm dọn dẹp ---
    return () => {
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
const MapComponent = ({
  selectedRoute,
  isAnimationTriggered,
  onAnimationFinished,
}) => {
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
      {/* Component này vẽ đường đi tĩnh */}
      <SelectedRouteLayer selectedRoute={selectedRoute} />

      {/* Component này xử lý SignalR (Gửi và Nhận) */}
      <SignalRHandler
        selectedRoute={selectedRoute}
        isAnimationTriggered={isAnimationTriggered}
        onAnimationFinished={onAnimationFinished}
      />
    </MapContainer>
  );
};

export default MapComponent;
