import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import * as signalR from "@microsoft/signalr";
import { getAuthToken } from "../utils/auth"; // THÊM: Import để lấy token
import { GEOLOCATION_HUB_URL } from "../config/apiConfig"; // THÊM: Import config

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
  iconUrl:
    "https://res.cloudinary.com/dvhziiejv/image/upload/v1763824318/bus-removebg-preview_sawcc4.png",
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
  listenOnly = false, // NEW: Chỉ lắng nghe, không gửi (dùng cho BusDetailPage)
  specificBusId = null, // NEW: Lắng nghe xe cụ thể (dùng cho BusDetailPage)
  onTripTypeDetected = null, // NEW: Callback để thông báo tripType detected
}) => {
  const map = useMap();
  const busMarkersRef = useRef(new Map());
  const hubConnectionRef = useRef(null);
  const animationIntervalRef = useRef(null);
  const currentBusIdRef = useRef(null); // Lưu busId hiện tại
  const previousPositionRef = useRef(null); // ✅ NEW: Lưu vị trí trước đó để tính hướng
  const detectedTripTypeRef = useRef(null); // ✅ NEW: Lưu tripType đã detect
  const directionConfidenceRef = useRef({ pickup: 0, dropoff: 0 }); // ✅ NEW: Accumulated confidence để chống noise

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
    const token = getAuthToken(); // LẤY TOKEN

    console.log("🔌 [MapComponent] Setting up SignalR connection...");
    console.log("   - listenOnly:", listenOnly);
    console.log("   - specificBusId:", specificBusId);
    console.log("   - Has token:", !!token);

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(GEOLOCATION_HUB_URL, {
        accessTokenFactory: () => token || "", // GỬI TOKEN ĐỂ AUTHENTICATE
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information) // Thêm logging để debug
      .build();

    hubConnectionRef.current = hubConnection;

    // Store markers locally for cleanup
    const localMarkers = busMarkersRef.current;

    // Lắng nghe sự kiện "ReceiveLocationUpdate"
    hubConnection.on("ReceiveLocationUpdate", (data) => {
      const lat = data.Lat || data.lat;
      const lng = data.Lng || data.lng;
      const busId = data.BusId || data.busId;
      const routeId = data.RouteId || data.routeId;
      const routeName = data.RouteName || data.routeName;

      if (lat === undefined || lng === undefined || busId === undefined) return;

      console.log(`📍 [MapComponent] Received location for Bus ${busId}:`, {
        lat,
        lng,
        routeId,
        routeName,
        selectedRouteId: selectedRoute?.id,
      });

      // Filter 1: Nếu là Parent với specificBusId, chỉ xử lý bus đó
      if (listenOnly && specificBusId && busId !== specificBusId) {
        console.log(
          `   ⏭️ Skipping Bus ${busId} (only listening to Bus ${specificBusId})`
        );
        return;
      }

      // Filter 2: Nếu là Admin và đã chọn route, chỉ hiển thị bus của route đó
      if (
        listenOnly &&
        !specificBusId &&
        selectedRoute &&
        routeId &&
        routeId !== selectedRoute.id
      ) {
        console.log(
          `   ⏭️ Skipping Bus ${busId} (Route ${routeId} != Selected Route ${selectedRoute.id})`
        );
        return;
      }

      const markers = busMarkersRef.current;

      // ✅ NEW: Detect tripType dựa trên hướng di chuyển
      if (listenOnly && selectedRoute?.stopPoints?.length >= 2) {
        const sortedPoints = [...selectedRoute.stopPoints].sort(
          (a, b) => a.sequenceOrder - b.sequenceOrder
        );
        const firstStop = sortedPoints[0];
        const lastStop = sortedPoints[sortedPoints.length - 1];
        
        // Tính khoảng cách đến điểm đầu và điểm cuối
        const distToFirst = Math.sqrt(
          Math.pow(lat - firstStop.latitude, 2) + 
          Math.pow(lng - firstStop.longitude, 2)
        );
        const distToLast = Math.sqrt(
          Math.pow(lat - lastStop.latitude, 2) + 
          Math.pow(lng - lastStop.longitude, 2)
        );
        
        // Nếu có vị trí trước đó, xác định hướng
        if (previousPositionRef.current) {
          const prevLat = previousPositionRef.current.lat;
          const prevLng = previousPositionRef.current.lng;
          
          // Tính khoảng cách từ vị trí trước đến 2 điểm
          const prevDistToFirst = Math.sqrt(
            Math.pow(prevLat - firstStop.latitude, 2) + 
            Math.pow(prevLng - firstStop.longitude, 2)
          );
          const prevDistToLast = Math.sqrt(
            Math.pow(prevLat - lastStop.latitude, 2) + 
            Math.pow(prevLng - lastStop.longitude, 2)
          );
          
          // ✅ LOGIC MỚI: Tính delta (thay đổi khoảng cách)
          const deltaToFirst = distToFirst - prevDistToFirst; // Âm = đang tiến gần first
          const deltaToLast = distToLast - prevDistToLast;   // Âm = đang tiến gần last
          
          // ✅ Accumulated confidence để chống GPS noise
          // Nếu đang tiến gần last nhiều hơn → tăng pickup confidence
          if (deltaToLast < deltaToFirst && deltaToLast < -0.00003) {
            directionConfidenceRef.current.pickup += 1;
            directionConfidenceRef.current.dropoff = Math.max(0, directionConfidenceRef.current.dropoff - 0.5);
          }
          // Nếu đang tiến gần first nhiều hơn → tăng dropoff confidence
          else if (deltaToFirst < deltaToLast && deltaToFirst < -0.00003) {
            directionConfidenceRef.current.dropoff += 1;
            directionConfidenceRef.current.pickup = Math.max(0, directionConfidenceRef.current.pickup - 0.5);
          }
          
          // Chỉ thay đổi tripType khi confidence đủ cao (>= 3 ticks liên tiếp)
          const confidence = directionConfidenceRef.current;
          let newTripType = detectedTripTypeRef.current;
          
          if (confidence.pickup >= 3 && detectedTripTypeRef.current !== 'pickup') {
            newTripType = 'pickup';
            console.log("📊 [MapComponent] Movement analysis (PICKUP confirmed):");
            console.log("   - Delta to first:", deltaToFirst.toFixed(7), "(moving away)");
            console.log("   - Delta to last:", deltaToLast.toFixed(7), "(moving closer)");
            console.log("   - Confidence pickup:", confidence.pickup, "/ dropoff:", confidence.dropoff);
            console.log("   → Direction: PICKUP (first → last)");
          } else if (confidence.dropoff >= 3 && detectedTripTypeRef.current !== 'dropoff') {
            newTripType = 'dropoff';
            console.log("📊 [MapComponent] Movement analysis (DROPOFF confirmed):");
            console.log("   - Delta to first:", deltaToFirst.toFixed(7), "(moving closer)");
            console.log("   - Delta to last:", deltaToLast.toFixed(7), "(moving away)");
            console.log("   - Confidence pickup:", confidence.pickup, "/ dropoff:", confidence.dropoff);
            console.log("   → Direction: DROPOFF (last → first)");
          }
          
          // Nếu tripType thay đổi, reset confidence và thông báo
          if (newTripType && newTripType !== detectedTripTypeRef.current) {
            console.log("🔄 [MapComponent] TRIP TYPE DETECTED CHANGED!");
            console.log("   - Old:", detectedTripTypeRef.current);
            console.log("   - New:", newTripType);
            console.log("   - Current dist to first:", distToFirst.toFixed(6));
            console.log("   - Current dist to last:", distToLast.toFixed(6));
            
            // Reset confidence khi đổi
            directionConfidenceRef.current = { pickup: 0, dropoff: 0 };
            detectedTripTypeRef.current = newTripType;
            
            // Gọi callback nếu có
            if (onTripTypeDetected) {
              onTripTypeDetected(newTripType);
            }
          }
        } else {
          // ✅ Lần đầu tiên: detect dựa trên vị trí gần điểm nào hơn
          // Nếu gần first → đang bắt đầu pickup
          // Nếu gần last → đang bắt đầu dropoff (hoặc kết thúc pickup)
          const initialTripType = distToFirst < distToLast ? 'pickup' : 'dropoff';
          console.log("🎯 [MapComponent] Initial tripType detection:", initialTripType);
          console.log("   - Dist to first:", distToFirst.toFixed(6));
          console.log("   - Dist to last:", distToLast.toFixed(6));
          console.log("   - Logic: xe gần", distToFirst < distToLast ? "first (pickup)" : "last (dropoff)");
          detectedTripTypeRef.current = initialTripType;
          
          if (onTripTypeDetected) {
            onTripTypeDetected(initialTripType);
          }
        }
        
        // ✅ Edge case: Xe đến rất gần điểm cuối (< 50m ~ 0.0005 độ)
        // Reset confidence để sẵn sàng detect chuyến ngược lại
        const ARRIVAL_THRESHOLD = 0.0005;
        if (distToLast < ARRIVAL_THRESHOLD && detectedTripTypeRef.current === 'pickup') {
          console.log("🏁 [MapComponent] Bus arrived at last stop, ready for dropoff trip");
          directionConfidenceRef.current = { pickup: 0, dropoff: 0 };
        } else if (distToFirst < ARRIVAL_THRESHOLD && detectedTripTypeRef.current === 'dropoff') {
          console.log("🏁 [MapComponent] Bus arrived at first stop, ready for pickup trip");
          directionConfidenceRef.current = { pickup: 0, dropoff: 0 };
        }
        
        // Lưu vị trí hiện tại cho lần sau
        previousPositionRef.current = { lat, lng };
      }

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
        console.log("✅ [MapComponent] SignalR connected successfully!");

        // Nếu là listenOnly và có specificBusId → join Bus group (cho Parent)
        // Nếu không → join Admin group (cho Admin dashboard)
        if (listenOnly && specificBusId) {
          console.log(
            `🚌 [MapComponent] Joining Bus-${specificBusId} group for Parent...`
          );
          hubConnection
            .invoke("JoinBusGroup", specificBusId)
            .then(() =>
              console.log(`✅ [MapComponent] Joined Bus-${specificBusId} group`)
            )
            .catch((err) =>
              console.error(
                `❌ [MapComponent] Error joining Bus-${specificBusId}:`,
                err
              )
            );
        } else {
          console.log("👨‍💼 [MapComponent] Joining admin-group...");
          hubConnection
            .invoke("JoinAdminGroup")
            .then(() => console.log("✅ [MapComponent] Joined admin-group"))
            .catch((err) =>
              console.error("❌ [MapComponent] Error joining admin-group:", err)
            );
        }
      })
      .catch((err) =>
        console.error("❌ [MapComponent] SignalR connection error:", err)
      );

    // Hàm dọn dẹp
    return () => {
      console.log("🔌 [MapComponent] Disconnecting SignalR...");
      // Use local variable for cleanup
      const connectionToStop = hubConnectionRef.current;

      if (connectionToStop) {
        connectionToStop.stop();
      }
      localMarkers.forEach((marker) => map.removeLayer(marker));
      localMarkers.clear();
      
      // ✅ Reset detection refs
      previousPositionRef.current = null;
      detectedTripTypeRef.current = null;
      directionConfidenceRef.current = { pickup: 0, dropoff: 0 };
    };
  }, [map, listenOnly, specificBusId, selectedRoute, onTripTypeDetected]); // Thêm selectedRoute vào dependencies

  // Effect 2: Xử lý Gửi (Sender/Simulator) - CHỈ DÙNG TRONG DASHBOARD
  useEffect(() => {
    // Dọn dẹp interval cũ trước
    if (animationIntervalRef.current) {
      console.log("Cleanup (Effect 2): Clearing old interval.");
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // Nếu là chế độ listenOnly (BusDetailPage), không gửi location
    if (listenOnly) {
      return;
    }

    // Nếu được kích hoạt và có route được chọn (Dashboard mode)
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
  }, [isAnimationTriggered, selectedRoute, map, listenOnly]);

  // Effect 3: Tạo marker xe bus ban đầu khi chọn route (đứng yên) - CHỈ TRONG DASHBOARD
  useEffect(() => {
    // Nếu là chế độ listenOnly, không tạo marker ban đầu (sẽ nhận từ SignalR)
    if (listenOnly) {
      return;
    }

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
  }, [selectedRoute, map, listenOnly]);

  return null;
};

// --- COMPONENT VẼ ĐƯỜNG ĐI VÀ ĐIỂM DỪNG (Tĩnh) ---
const SelectedRouteLayer = ({ selectedRoute, tripType }) => {
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

      // ✅ Nếu là chuyến về (dropoff), đảo ngược thứ tự để vẽ đường ngược lại
      if (tripType === 'dropoff') {
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

        sortedPoints.forEach((point, index) => {
          const position = L.latLng(point.latitude, point.longitude);
          // Điểm cuối cùng trong mảng sau khi đảo/không đảo sẽ là điểm đích
          const isDestination = index === sortedPoints.length - 1;
          const markerIcon = isDestination ? redIcon : DefaultIcon;
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
  }, [selectedRoute, map, tripType]);

  return null;
};

// --- COMPONENT MAP CHÍNH ---
const MapComponent = ({
  selectedRoute,
  isAnimationTriggered = false,
  onAnimationFinished = () => {},
  listenOnly = false, // NEW: Chỉ lắng nghe realtime (không giả lập)
  specificBusId = null, // NEW: Lắng nghe xe cụ thể
  tripType = 'pickup', // NEW: 'pickup' hoặc 'dropoff' - mặc định là pickup
  onTripTypeDetected = null, // NEW: Callback khi detect được tripType từ hướng di chuyển
}) => {
  const initialPosition = [10.7769, 106.6954];
  console.log(
    "MapComponent rendering với selectedRoute:",
    selectedRoute,
    "listenOnly:",
    listenOnly,
    "tripType:",
    tripType
  );

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
      <SelectedRouteLayer selectedRoute={selectedRoute} tripType={tripType} />

      {/* Component này xử lý SignalR (Gửi và Nhận) */}
      <SignalRHandler
        selectedRoute={selectedRoute}
        isAnimationTriggered={isAnimationTriggered}
        onAnimationFinished={onAnimationFinished}
        listenOnly={listenOnly}
        specificBusId={specificBusId}
        onTripTypeDetected={onTripTypeDetected}
      />
    </MapContainer>
  );
};

export default MapComponent;
