import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../../utils/auth"; // THÊM: Import để lấy token
import { GEOLOCATION_HUB_URL } from "../../config/apiConfig"; // THÊM: Import config

// --- Icon marker mặc định ---
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Icon xe buýt ---
const busIcon = L.icon({
  iconUrl:
    "https://res.cloudinary.com/dvhziiejv/image/upload/v1763824318/bus-removebg-preview_sawcc4.png",
  iconSize: [50, 50],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

/**
 * Component lắng nghe SignalR để hiển thị marker xe bus (CHỈ HIỂN THỊ, KHÔNG GỬI)
 * BusSimulationManager đã lo việc gửi vị trí
 */
const BusMarkerListener = ({ busId }) => {
  const map = useMap();
  const busMarkerRef = useRef(null);
  const hubConnectionRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken(); // LẤY TOKEN

    console.log("🚌 [DriverMap] Setting up SignalR for busId:", busId);
    console.log("   - Has token:", !!token);

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(GEOLOCATION_HUB_URL, {
        accessTokenFactory: () => token || "", // GỬI TOKEN
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hubConnectionRef.current = hubConnection;

    // Lắng nghe sự kiện "ReceiveLocationUpdate"
    hubConnection.on("ReceiveLocationUpdate", (data) => {
      const lat = data.Lat || data.lat;
      const lng = data.Lng || data.lng;
      const receivedBusId = data.BusId || data.busId;

      if (lat === undefined || lng === undefined || receivedBusId === undefined)
        return;

      // Chỉ hiển thị xe bus của mình
      if (receivedBusId !== busId) return;

      if (busMarkerRef.current) {
        // Cập nhật vị trí marker đã tồn tại
        busMarkerRef.current.setLatLng([lat, lng]);
      } else {
        // Tạo marker mới nếu chưa có
        const newMarker = L.marker([lat, lng], { icon: busIcon })
          .addTo(map)
          .bindPopup(`<b>Xe buýt ${busId}</b>`);
        busMarkerRef.current = newMarker;
      }
    });

    // Bắt đầu kết nối và tham gia nhóm
    hubConnection
      .start()
      .then(() => {
        console.log("🚌 DriverMap: SignalR connected for busId", busId);
        hubConnection
          .invoke("JoinBusGroup", busId)
          .then(() => console.log(`🚌 DriverMap: Joined Bus-${busId} group`))
          .catch((err) =>
            console.error("DriverMap: Error joining group: ", err)
          );
      })
      .catch((err) =>
        console.error("DriverMap: SignalR connection error: ", err)
      );

    // Hàm dọn dẹp
    return () => {
      console.log("🚌 DriverMap: Disconnecting SignalR");
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      if (busMarkerRef.current) {
        map.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
    };
  }, [map, busId]);

  return null;
};

/**
 * Component vẽ đường đi và điểm dừng (tĩnh)
 */
const RouteLayer = ({ route, tripType }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const stopMarkersRef = useRef([]);

  useEffect(() => {
    // Xóa control và markers cũ
    if (routingControlRef.current && routingControlRef.current._map) {
      routingControlRef.current.remove();
    }
    routingControlRef.current = null;
    stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    stopMarkersRef.current = [];

    // Vẽ mới
    if (route?.stopPoints?.length > 0) {
      const sortedPoints = [...route.stopPoints].sort(
        (a, b) => a.sequenceOrder - b.sequenceOrder
      );

      // Nếu là chuyến về, đảo ngược thứ tự để vẽ đường ngược lại
      if (tripType === "dropoff") {
        sortedPoints.reverse();
      }

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

        // Vẽ markers cho điểm dừng
        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          // Điểm cuối cùng trong mảng sau khi đảo/không đảo sẽ là điểm đích
          const isDestination = index === sortedPoints.length - 1;
          const markerIcon = isDestination ? redIcon : DefaultIcon;
          const stopMarker = L.marker(position, { icon: markerIcon })
            .bindPopup(
              `<b>${point.pointName || "Điểm dừng"}</b><br>Trạm số ${index + 1}`
            )
            .addTo(map);
          stopMarkersRef.current.push(stopMarker);
        });

        // Fit bounds
        if (waypoints.length > 1) {
          const bounds = L.latLngBounds(waypoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(waypoints[0], 14);
        }
      }
    } else {
      // Default view (Sài Gòn)
      if (map) {
        map.setView([10.7769, 106.6954], 13);
      }
    }

    // Hàm dọn dẹp
    return () => {
      if (routingControlRef.current && routingControlRef.current._map) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
      stopMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      stopMarkersRef.current = [];
    };
  }, [route, map, tripType]);

  return null;
};

/**
 * Component map chính cho Driver
 * Props:
 * - busId: ID xe bus (để lắng nghe vị trí từ SignalR)
 * - route: Object chứa stopPoints (với sequenceOrder, latitude, longitude, pointName)
 * - tripType: 'pickup' hoặc 'dropoff'
 *
 * Note: Logic gửi vị trí xe bus đã được chuyển sang BusSimulationManager chạy nền.
 * Component này chỉ hiển thị tuyến đường, các điểm dừng, và marker xe bus (nhận từ SignalR).
 */
const DriverMapComponent = ({ busId, route, tripType = "pickup" }) => {
  const initialPosition = [10.7769, 106.6954]; // Sài Gòn

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

      {/* Vẽ đường đi và điểm dừng */}
      <RouteLayer route={route} tripType={tripType} />

      {/* Lắng nghe và hiển thị marker xe bus */}
      {busId && <BusMarkerListener busId={busId} />}
    </MapContainer>
  );
};

export default DriverMapComponent;
