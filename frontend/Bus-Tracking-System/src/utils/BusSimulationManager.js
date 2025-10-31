// BusSimulationManager: Quản lý giả lập xe bus chạy nền thực sự
// Singleton, chạy nền qua setInterval, lưu trạng thái vào localStorage
// Đảm bảo xe bus vẫn chạy kể cả khi chuyển trang, reload, tắt/mở tab
// Không đổi code backend

import * as signalR from "@microsoft/signalr";

const STORAGE_KEYS = {
  SIM_STATE: "busSimState", // { busId, route, startedAt, lastIndex, tripType }
};

class BusSimulationManager {
  constructor() {
    this.interval = null;
    this.hubConnection = null;
    this.state = null;
    this.coordinates = [];
    this.routeIndex = 0;
    this.isRunning = false;
    this.onUpdate = null; // callback mỗi lần gửi vị trí
    
    console.log("🚌 BusSimulationManager: Constructor called");
    this.restoreState();
    
    if (this.state && this.state.busId && this.state.route && this.state.startedAt) {
      console.log("✅ BusSimulationManager: Found saved state, will resume");
      console.log("   - BusId:", this.state.busId);
      console.log("   - TripType:", this.state.tripType);
      console.log("   - StartedAt:", new Date(this.state.startedAt).toLocaleString());
      this.resumeSimulation();
    } else {
      console.log("⭕ BusSimulationManager: No saved state found");
    }
  }

  restoreState() {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_STATE);
    if (raw) {
      try {
        this.state = JSON.parse(raw);
      } catch {
        this.state = null;
      }
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEYS.SIM_STATE, JSON.stringify(this.state));
  }

  startSimulation({ busId, route, tripType }) {
    console.log("🚀 BusSimulationManager: Starting simulation");
    console.log("   - BusId:", busId);
    console.log("   - TripType:", tripType);
    console.log("   - Route stopPoints:", route?.stopPoints?.length);
    
    if (!busId || !route || !route.stopPoints?.length) {
      console.error("❌ BusSimulationManager: Invalid params for startSimulation");
      return;
    }
    
    // Dừng simulation cũ nếu có
    this.stopSimulation();
    
    // Tạo state mới
    this.state = {
      busId,
      route,
      tripType,
      startedAt: Date.now(),
      lastIndex: 0,
    };
    
    // Lưu vào localStorage
    this.saveState();
    console.log("💾 BusSimulationManager: State saved to localStorage");
    
    // Chuẩn bị coordinates và bắt đầu
    this.prepareCoordinates();
    this.connectSignalR();
    this.isRunning = true;
    this.runInterval();
    
    console.log("✅ BusSimulationManager: Simulation started successfully");
  }

  resumeSimulation() {
    console.log(`🔄 BusSimManager: Resuming simulation for busId ${this.state?.busId}`);
    if (!this.state || !this.state.busId || !this.state.route) {
      console.warn("⚠️ BusSimManager: No valid state to resume");
      return;
    }
    this.prepareCoordinates();
    this.connectSignalR();
    this.isRunning = true;
    this.runInterval();
  }

  // Tạo danh sách tọa độ di chuyển giữa các stopPoints
  // Tăng số điểm nội suy để xe chạy đúng tốc độ như trước (khoảng 200-300 điểm tổng cộng)
  prepareCoordinates() {
    const sortedPoints = [...this.state.route.stopPoints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    if (this.state.tripType === "dropoff") sortedPoints.reverse();
    
    // Tính tổng khoảng cách giữa các điểm để phân bổ số điểm nội suy hợp lý
    const distances = [];
    let totalDistance = 0;
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];
      const dist = Math.sqrt(
        Math.pow(end.latitude - start.latitude, 2) + 
        Math.pow(end.longitude - start.longitude, 2)
      );
      distances.push(dist);
      totalDistance += dist;
    }
    
    // Tạo khoảng 250-300 điểm tổng cộng (giống Leaflet Routing Machine)
    const targetTotalPoints = 280;
    const coordinates = [];
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];
      // Số điểm cho segment này tỉ lệ với khoảng cách
      const pointsForSegment = Math.max(20, Math.floor((distances[i] / totalDistance) * targetTotalPoints));
      
      for (let j = 0; j < pointsForSegment; j++) {
        const ratio = j / pointsForSegment;
        const lat = start.latitude + (end.latitude - start.latitude) * ratio;
        const lng = start.longitude + (end.longitude - start.longitude) * ratio;
        coordinates.push({ lat, lng });
      }
    }
    
    // Thêm điểm cuối cùng
    const last = sortedPoints[sortedPoints.length - 1];
    coordinates.push({ lat: last.latitude, lng: last.longitude });
    this.coordinates = coordinates;
    
    console.log(`🚌 BusSimManager: Prepared ${coordinates.length} coordinates for busId ${this.state.busId}`);
    
    // Tính lại routeIndex dựa trên thời gian đã chạy (khi resume sau F5)
    const elapsed = Math.floor((Date.now() - this.state.startedAt) / 500);
    this.routeIndex = Math.min(this.state.lastIndex + elapsed, this.coordinates.length - 1);
  }

  connectSignalR() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
    const HUB_URL = "https://localhost:7229/geolocationHub";
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();
    this.hubConnection.start().catch((err) => console.error("BusSimManager SignalR error:", err));
  }

  runInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (!this.coordinates.length || !this.isRunning) return;
    this.interval = setInterval(() => {
      if (!this.isRunning) return;
      this.routeIndex++;
      if (this.routeIndex >= this.coordinates.length) {
        this.stopSimulation();
        return;
      }
      this.state.lastIndex = this.routeIndex;
      this.saveState();
      const pos = this.coordinates[this.routeIndex];
      if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.invoke("SendLocation", this.state.busId, pos.lat, pos.lng).catch((err) => console.error("BusSimManager SendLocation error:", err));
      }
      if (typeof this.onUpdate === "function") this.onUpdate(pos, this.routeIndex);
    }, 500);
  }

  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
    this.isRunning = false;
    this.state = null;
    localStorage.removeItem(STORAGE_KEYS.SIM_STATE);
  }

  isSimulating() {
    return this.isRunning && this.state && this.state.busId;
  }
}

const instance = new BusSimulationManager();
export default instance;
