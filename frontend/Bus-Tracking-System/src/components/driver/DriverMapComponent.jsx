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

/**
 * Component xử lý SignalR - GỬI location từ driver
 * Props:
 * - busId: ID của xe bus
 * - route: Object chứa stopPoints với sequenceOrder, latitude, longitude
 * - isDriving: Boolean trigger việc bắt đầu gửi location
 * - onDrivingFinished: Callback khi hoàn thành chuyến đi
 * - tripType: 'pickup' hoặc 'dropoff' để xác định điểm xuất phát
 */
const DriverSignalRHandler = ({
  busId,
  route,
  isDriving,
  onDrivingFinished,
  tripType,
}) => {
  const map = useMap();
  const busMarkerRef = useRef(null);
  const hubConnectionRef = useRef(null);
  const animationIntervalRef = useRef(null);

  // Hàm bắt đầu gửi location
  const startSendingLocation = (routeObj) => {
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
      console.error("SignalR chưa kết nối, không thể bắt đầu gửi location.");
      onDrivingFinished();
      return;
    }

    // Sắp xếp điểm dừng theo thứ tự
    const sortedPoints = [...routeObj.stopPoints].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder
    );

    // Nếu là chuyến về (dropoff), đảo ngược thứ tự
    if (tripType === "dropoff") {
      sortedPoints.reverse();
    }

    const waypoints = sortedPoints.map((p) =>
      L.latLng(p.latitude, p.longitude)
    );

    console.log(
      `Driver bắt đầu gửi location cho Bus ${busId} (${tripType})...`
    );

    // Tạo routing control tạm thời để lấy coordinates chi tiết
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
      console.log("Routes found!", e);

      if (e.routes && e.routes.length > 0) {
        const coordinates = e.routes[0].coordinates;
        console.log(`Có ${coordinates.length} tọa độ để gửi`);

        let routeIndex = 0;

        // Bắt đầu interval gửi location
        animationIntervalRef.current = setInterval(() => {
          routeIndex++;

          if (routeIndex >= coordinates.length) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
            console.log(`Driver hoàn thành chuyến ${tripType} cho Bus ${busId}`);
            // Xóa tempRouting
            if (tempRouting._map) {
              map.removeControl(tempRouting);
            }
            onDrivingFinished();
            return;
          }

          // Gửi vị trí hiện tại lên Hub
          const currentPos = coordinates[routeIndex];

          if (
            hubConnectionRef.current &&
            hubConnectionRef.current.state ===
              signalR.HubConnectionState.Connected
          ) {
            hubConnectionRef.current
              .invoke("SendLocation", busId, currentPos.lat, currentPos.lng)
              .then(() => {
                // Cập nhật marker của chính mình
                if (busMarkerRef.current) {
                  busMarkerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
                }
              })
              .catch((err) =>
                console.error(
                  `Lỗi khi gửi location cho Bus ${busId}:`,
                  err
                )
              );
          }
        }, 500); // Gửi mỗi 500ms
      } else {
        console.error("Không tìm thấy route để gửi location.");
        if (tempRouting._map) {
          map.removeControl(tempRouting);
        }
        onDrivingFinished();
      }
    });

    // Xử lý lỗi routing
    tempRouting.on("routingerror", function (e) {
      console.error("Routing error:", e);
      if (tempRouting._map) {
        map.removeControl(tempRouting);
      }
      onDrivingFinished();
    });

    // Thêm control vào map để nó tính toán
    tempRouting.addTo(map);
  };

  // Effect 1: Kết nối SignalR và tham gia group Bus-{busId}
  useEffect(() => {
    const HUB_URL = "https://localhost:7229/geolocationHub";
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = hubConnection;

    // Bắt đầu kết nối
    hubConnection
      .start()
      .then(() => {
        console.log(`Driver kết nối SignalR thành công!`);
        // Tham gia group Bus-{busId}
        hubConnection
          .invoke("JoinBusGroup", busId)
          .then(() =>
            console.log(`Driver đã tham gia group Bus-${busId}`)
          )
          .catch((err) =>
            console.error("Lỗi khi tham gia Bus group: ", err)
          );
      })
      .catch((err) =>
        console.error("Lỗi kết nối SignalR: ", err)
      );

    // Hàm dọn dẹp
    return () => {
      console.log("Driver ngắt kết nối SignalR.");
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
      }
      if (busMarkerRef.current) {
        map.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
    };
  }, [map, busId]);

  // Effect 2: Xử lý khi bắt đầu lái xe (isDriving = true)
  useEffect(() => {
    // Dọn dẹp interval cũ
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // Nếu được trigger và có route
    if (isDriving && route) {
      startSendingLocation(route);
    }

    // Hàm dọn dẹp cho effect này
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriving, route, map, busId, tripType]);

  // Effect 3: Tạo marker xe bus ban đầu
  useEffect(() => {
    if (!route?.stopPoints?.length) return;

    // Xóa marker cũ nếu có
    if (busMarkerRef.current) {
      map.removeLayer(busMarkerRef.current);
      busMarkerRef.current = null;
    }

    // Sắp xếp điểm dừng
    const sortedPoints = [...route.stopPoints].sort(
      (a, b) => a.sequenceOrder - b.sequenceOrder
    );

    // Chọn điểm xuất phát dựa vào tripType
    let startPoint;
    if (tripType === "pickup") {
      // Chuyến đi: bắt đầu từ điểm đầu tiên
      startPoint = sortedPoints[0];
    } else {
      // Chuyến về: bắt đầu từ điểm cuối cùng (trường Sài Gòn)
      startPoint = sortedPoints[sortedPoints.length - 1];
    }

    if (startPoint) {
      // Tạo marker xe bus tại điểm xuất phát
      const initialMarker = L.marker(
        [startPoint.latitude, startPoint.longitude],
        {
          icon: busIcon,
        }
      )
        .addTo(map)
        .bindPopup(
          `<b>Xe buýt ${busId}</b><br>Chuyến ${
            tripType === "pickup" ? "đi" : "về"
          }<br>Đang chờ khởi hành`
        );

      busMarkerRef.current = initialMarker;
      console.log(
        `Đã tạo marker xe bus ${busId} tại điểm ${
          tripType === "pickup" ? "xuất phát" : "cuối (trường)"
        }`
      );
    }

    return () => {
      // Không xóa marker ở đây vì có thể đang chạy
    };
  }, [route, map, busId, tripType]);

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
              `<b>${point.pointName || "Điểm dừng"}</b><br>Trạm số ${
                index + 1
              }`
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
 * - busId: ID xe bus
 * - route: Object chứa stopPoints (với sequenceOrder, latitude, longitude, pointName)
 * - isDriving: Boolean trigger việc bắt đầu lái xe
 * - onDrivingFinished: Callback khi hoàn thành
 * - tripType: 'pickup' hoặc 'dropoff'
 */
const DriverMapComponent = ({
  busId,
  route,
  isDriving,
  onDrivingFinished,
  tripType = "pickup",
}) => {
  const initialPosition = [10.7769, 106.6954]; // Sài Gòn
  console.log("DriverMapComponent rendering với busId:", busId, "tripType:", tripType);

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

      {/* Xử lý SignalR và gửi location */}
      <DriverSignalRHandler
        busId={busId}
        route={route}
        isDriving={isDriving}
        onDrivingFinished={onDrivingFinished}
        tripType={tripType}
      />
    </MapContainer>
  );
};

export default DriverMapComponent;
