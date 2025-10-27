import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

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

// --- COMPONENT CON ĐỂ VẼ TUYẾN ĐƯỜNG, MARKERS VÀ ANIMATION ---
const SelectedRouteLayer = ({ selectedRoute }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const busMarkerRef = useRef(null);
  const stopMarkersRef = useRef([]);

  // --- State cho Animation ---
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Lưu các điểm tọa độ của tuyến đường
  const [routeIndex, setRouteIndex] = useState(0); // Vị trí hiện tại trên tuyến
  // THAY ĐỔI: Chuyển từ useState sang useRef
  const animationIntervalId = useRef(null); // ID của setInterval
  const animationSpeed = 100; // ms - Tốc độ animation (100ms = 0.1s)

  // --- Hàm bắt đầu Animation ---
  const startAnimation = (coordinates) => {
    // Clear interval cũ nếu đang chạy
    // THAY ĐỔI: Dùng .current
    if (animationIntervalId.current) {
      clearInterval(animationIntervalId.current);
    }
    setRouteIndex(0); // Reset chỉ số về đầu

    // Bắt đầu interval mới
    const intervalId = setInterval(() => {
      setRouteIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Nếu đã đi hết lộ trình
        if (nextIndex >= coordinates.length) {
          clearInterval(intervalId); // Dừng animation
          console.log("Animation finished.");
          animationIntervalId.current = null; // Xóa ref
          return prevIndex; // Giữ nguyên index cuối
        }
        // Cập nhật vị trí của marker xe buýt
        if (busMarkerRef.current) {
          busMarkerRef.current.setLatLng(coordinates[nextIndex]);
        }
        return nextIndex; // Tăng index
      });
    }, animationSpeed); // Khoảng thời gian cập nhật vị trí

    // THAY ĐỔI: Dùng .current
    animationIntervalId.current = intervalId; // Lưu ID interval mới vào ref
    console.log("Animation started with ID:", intervalId);
  };

  // --- useEffect chính để vẽ đường và marker ---
  useEffect(() => {
    // --- Xóa control và markers cũ ---
    if (routingControlRef.current) map.removeControl(routingControlRef.current);
    if (busMarkerRef.current) map.removeLayer(busMarkerRef.current);
    stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    routingControlRef.current = null;
    busMarkerRef.current = null;
    stopMarkersRef.current = [];

    // Clear animation interval cũ
    // THAY ĐỔI: Dùng .current
    if (animationIntervalId.current) {
      console.log(
        "useEffect cleanup: Clearing interval",
        animationIntervalId.current
      );
      clearInterval(animationIntervalId.current);
      animationIntervalId.current = null;
    }
    setRouteCoordinates([]); // Reset coordinates
    setRouteIndex(0); // Reset index

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
          show: false,
          lineOptions: {
            styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
          },
          createMarker: () => null,
        }).addTo(map);
        routingControlRef.current = newRoutingControl;

        // Lắng nghe sự kiện 'routesfound' để lấy tọa độ chi tiết và bắt đầu animation
        newRoutingControl.on("routesfound", function (e) {
          if (e.routes && e.routes.length > 0) {
            const coordinates = e.routes[0].coordinates; // Mảng các L.LatLng
            console.log(`Route found with ${coordinates.length} coordinates.`);
            setRouteCoordinates(coordinates); // Lưu tọa độ vào state
            // Đặt marker bus về vị trí ban đầu và bắt đầu animation
            if (coordinates.length > 0) {
              if (busMarkerRef.current) {
                busMarkerRef.current.setLatLng(coordinates[0]); // Đảm bảo marker ở điểm đầu
              }
              startAnimation(coordinates); // Bắt đầu animation
            }
          }
        });

        // --- Thêm marker xe buýt ở điểm bắt đầu (sẽ được cập nhật bởi animation) ---
        const startPoint = waypoints[0];
        const newBusMarker = L.marker(startPoint, { icon: busIcon })
          .bindPopup(
            `<b>${selectedRoute.routeName}</b><br>Xe buýt: BUS-${String(
              selectedRoute.id
            ).padStart(3, "0")}`
          )
          .addTo(map);
        busMarkerRef.current = newBusMarker;

        // --- Thêm marker cho các điểm dừng (custom icon) ---
        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          const markerIcon =
            index === sortedPoints.length - 1 ? redIcon : DefaultIcon;
          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(`<b>${point.pointName}</b><br>Trạm dừng số ${index + 1}`)
            .addTo(map);
          stopMarkersRef.current.push(stopMarker);
        });

        // --- Zoom ban đầu ---
        if (waypoints.length > 1) {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(startPoint, 14);
        }
      }
    } else {
      // Reset view nếu không có route nào được chọn
      map.setView([10.7769, 106.6954], 13);
    }

    // --- Cleanup function ---
    // Hàm này sẽ chạy khi component unmount hoặc khi selectedRoute thay đổi (trước khi useEffect chạy lại)
    return () => {
      console.log(
        "Cleanup (return): Clearing animation interval if exists.",
        animationIntervalId.current
      );
      // THAY ĐỔI: Dùng .current
      if (animationIntervalId.current) {
        clearInterval(animationIntervalId.current);
        animationIntervalId.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute, map]); // Chỉ chạy lại khi selectedRoute hoặc map thay đổi

  return null;
};

// --- COMPONENT MAP CHÍNH (Giữ nguyên) ---
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
    </MapContainer>
  );
};

export default MapComponent;
