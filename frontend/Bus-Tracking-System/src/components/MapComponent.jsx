import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Fix lỗi icon marker không hiển thị trong React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom bus icon
const busIcon = L.icon({
  iconUrl: "/src/assets/bus.png", // Đảm bảo bạn có file bus.png trong src/assets
  iconSize: [38, 38],
});

const RoutingMachine = ({ waypoints }) => {
  const map = L.useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#0A2E5D", opacity: 0.8, weight: 6 }],
      },
      createMarker: () => null, // Không tạo marker mặc định ở điểm đầu/cuối
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
};

const MapComponent = ({ routes }) => {
  const initialPosition = [10.7769, 106.6954]; // Vị trí trung tâm TP.HCM
  const busMarkersRef = useRef({});

  // Logic kết nối SignalR (tạm thời comment lại nếu chưa cần)
  /*
  useEffect(() => {
    const HUB_URL = "https://localhost:7229/geolocationHub";
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    hubConnection.start().then(() => {
      console.log("Kết nối SignalR thành công!");
    });

    hubConnection.on("ReceiveBusLocation", (lat, lng, busId) => {
      const marker = busMarkersRef.current[busId];
      if (marker) {
        marker.setLatLng([lat, lng]);
      }
    });

    return () => {
      hubConnection.stop();
    };
  }, []);
  */

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

      {routes.map((routeData) => {
        if (!routeData.points || routeData.points.length === 0) return null;

        const waypoints = routeData.points.map((p) =>
          L.latLng(p.latitude, p.longitude)
        );

        return (
          <React.Fragment key={routeData.id}>
            {/* Vẽ đường đi */}
            <RoutingMachine waypoints={waypoints} />

            {/* Tạo marker cho xe buýt ở điểm xuất phát */}
            <Marker
              position={waypoints[0]}
              icon={busIcon}
              ref={(el) => {
                // Giả sử mỗi route tương ứng với 1 busId duy nhất
                if (el) busMarkersRef.current[routeData.id] = el;
              }}
            >
              <Popup>
                Tuyến: {routeData.routeName} <br />
                Xe buýt: {routeData.id}
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
