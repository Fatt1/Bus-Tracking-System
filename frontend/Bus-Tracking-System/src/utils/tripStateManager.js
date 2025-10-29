/**
 * Trip State Manager
 * Quản lý trạng thái chuyến đi của driver
 * Lưu trữ trong localStorage để persist giữa các trang
 */

const STORAGE_KEYS = {
  IS_DRIVING_PICKUP: 'isDrivingPickup',
  IS_DRIVING_DROPOFF: 'isDrivingDropoff',
  PICKUP_STUDENTS: 'pickupStudents',
  DROPOFF_STUDENTS: 'dropoffStudents',
  SCHEDULE_ID: 'currentScheduleId',
  TRIP_COMPLETED_PICKUP: 'tripCompletedPickup',
  TRIP_COMPLETED_DROPOFF: 'tripCompletedDropoff',
};

// Trip Type Constants
export const TRIP_TYPE = {
  NONE: 0,
  PICKUP: 1,    // Outbound - Chuyến đi (sáng)
  DROPOFF: 2,   // Inbound - Chuyến về (chiều)
};

// Status Constants (UI)
export const STUDENT_STATUS_UI = {
  NOT_BOARDED: 'chua-len-xe',  // Chưa lên xe
  PICKED_UP: 'da-don',         // Đã đón
  DROPPED_OFF: 'da-tra',       // Đã trả
  ABSENT: 'vang',              // Vắng
};

// CheckinStatus Constants (Backend)
export const CHECKIN_STATUS = {
  PENDING: 0,      // Chưa điểm danh
  CHECKED_IN: 1,   // Đã lên xe (Đã đón)
  CHECKED_OUT: 2,  // Đã xuống xe (Đã trả)
  ABSENT: 3,       // Vắng mặt
};

/**
 * Map UI status sang Backend CheckinStatus
 */
export const mapUIStatusToBackend = (uiStatus) => {
  switch (uiStatus) {
    case STUDENT_STATUS_UI.NOT_BOARDED:
      return CHECKIN_STATUS.PENDING;
    case STUDENT_STATUS_UI.PICKED_UP:
      return CHECKIN_STATUS.CHECKED_IN;
    case STUDENT_STATUS_UI.DROPPED_OFF:
      return CHECKIN_STATUS.CHECKED_OUT;
    case STUDENT_STATUS_UI.ABSENT:
      return CHECKIN_STATUS.ABSENT;
    default:
      return CHECKIN_STATUS.PENDING;
  }
};

/**
 * Kiểm tra xem driver có đang trong chuyến đi không
 */
export const isDriving = () => {
  const pickup = localStorage.getItem(STORAGE_KEYS.IS_DRIVING_PICKUP) === 'true';
  const dropoff = localStorage.getItem(STORAGE_KEYS.IS_DRIVING_DROPOFF) === 'true';
  return pickup || dropoff;
};

/**
 * Lấy loại chuyến đang chạy
 */
export const getCurrentTripType = () => {
  const pickup = localStorage.getItem(STORAGE_KEYS.IS_DRIVING_PICKUP) === 'true';
  const dropoff = localStorage.getItem(STORAGE_KEYS.IS_DRIVING_DROPOFF) === 'true';
  
  if (pickup) return TRIP_TYPE.PICKUP;
  if (dropoff) return TRIP_TYPE.DROPOFF;
  return TRIP_TYPE.NONE;
};

/**
 * Bắt đầu chuyến đi
 */
export const startPickupTrip = () => {
  console.log('🚀 [tripStateManager] startPickupTrip()');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_PICKUP, 'true');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_DROPOFF, 'false');
  
  // Clear any old pickup trip progress (in case starting fresh)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('busRouteProgress_') && key.includes('_pickup')) {
      keysToRemove.push(key);
    }
    if (key && key.includes('busRouteCoords_') && key.includes('_pickup')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  🧹 Cleared old: ${key}`);
  });
  
  console.log('  ✅ Set IS_DRIVING_PICKUP = true');
  console.log('  ✅ Set IS_DRIVING_DROPOFF = false');
};

/**
 * Bắt đầu chuyến về
 */
export const startDropoffTrip = () => {
  console.log('🚀 [tripStateManager] startDropoffTrip()');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_PICKUP, 'false');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_DROPOFF, 'true');
  
  // Clear any old dropoff trip progress (in case starting fresh)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('busRouteProgress_') && key.includes('_dropoff')) {
      keysToRemove.push(key);
    }
    if (key && key.includes('busRouteCoords_') && key.includes('_dropoff')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  🧹 Cleared old: ${key}`);
  });
  
  console.log('  ✅ Set IS_DRIVING_PICKUP = false');
  console.log('  ✅ Set IS_DRIVING_DROPOFF = true');
};

/**
 * Hoàn thành chuyến đi
 */
export const completePickupTrip = () => {
  console.log('🏁 [tripStateManager] completePickupTrip()');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_PICKUP, 'false');
  localStorage.setItem(STORAGE_KEYS.TRIP_COMPLETED_PICKUP, 'true');
  
  // Clear route progress for pickup trip
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('busRouteProgress_') && key.includes('_pickup')) {
      keysToRemove.push(key);
    }
    if (key && key.includes('busRouteCoords_') && key.includes('_pickup')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('  ✅ Set IS_DRIVING_PICKUP = false');
  console.log('  ✅ Set TRIP_COMPLETED_PICKUP = true');
  console.log('  ✅ Cleared route progress for pickup trip');
  console.log('  📍 Afternoon button should now be enabled');
};

/**
 * Hoàn thành chuyến về
 */
export const completeDropoffTrip = () => {
  console.log('🏁 [tripStateManager] completeDropoffTrip()');
  localStorage.setItem(STORAGE_KEYS.IS_DRIVING_DROPOFF, 'false');
  localStorage.setItem(STORAGE_KEYS.TRIP_COMPLETED_DROPOFF, 'true');
  
  // Clear route progress for dropoff trip
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('busRouteProgress_') && key.includes('_dropoff')) {
      keysToRemove.push(key);
    }
    if (key && key.includes('busRouteCoords_') && key.includes('_dropoff')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('  ✅ Set IS_DRIVING_DROPOFF = false');
  console.log('  ✅ Set TRIP_COMPLETED_DROPOFF = true');
  console.log('  ✅ Cleared route progress for dropoff trip');
  console.log('  📍 All trips completed for today');
};

/**
 * Kiểm tra xem chuyến đi đã hoàn thành chưa
 */
export const isPickupTripCompleted = () => {
  return localStorage.getItem(STORAGE_KEYS.TRIP_COMPLETED_PICKUP) === 'true';
};

/**
 * Kiểm tra xem chuyến về đã hoàn thành chưa
 */
export const isDropoffTripCompleted = () => {
  return localStorage.getItem(STORAGE_KEYS.TRIP_COMPLETED_DROPOFF) === 'true';
};

/**
 * Lưu danh sách học sinh cho chuyến đi
 */
export const savePickupStudents = (students) => {
  console.log('💾 [tripStateManager] savePickupStudents:', students.length, 'students');
  localStorage.setItem(STORAGE_KEYS.PICKUP_STUDENTS, JSON.stringify(students));
};

/**
 * Lưu danh sách học sinh cho chuyến về
 */
export const saveDropoffStudents = (students) => {
  console.log('💾 [tripStateManager] saveDropoffStudents:', students.length, 'students');
  localStorage.setItem(STORAGE_KEYS.DROPOFF_STUDENTS, JSON.stringify(students));
};

/**
 * Lấy danh sách học sinh chuyến đi
 */
export const getPickupStudents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PICKUP_STUDENTS);
  const students = data ? JSON.parse(data) : [];
  console.log('📦 [tripStateManager] getPickupStudents:', students.length, 'students');
  return students;
};

/**
 * Lấy danh sách học sinh chuyến về
 */
export const getDropoffStudents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DROPOFF_STUDENTS);
  const students = data ? JSON.parse(data) : [];
  console.log('📦 [tripStateManager] getDropoffStudents:', students.length, 'students');
  return students;
};

/**
 * Lưu schedule ID hiện tại
 */
export const saveCurrentScheduleId = (scheduleId) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE_ID, scheduleId.toString());
};

/**
 * Lấy schedule ID hiện tại
 */
export const getCurrentScheduleId = () => {
  const id = localStorage.getItem(STORAGE_KEYS.SCHEDULE_ID);
  return id ? parseInt(id) : null;
};

/**
 * Reset tất cả state (dùng khi kết thúc ngày hoặc logout)
 */
export const resetAllTripState = () => {
  console.log('🔄 [tripStateManager] resetAllTripState()');
  console.log('  Clearing keys:', Object.values(STORAGE_KEYS));
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ Removed: ${key}`);
  });
  console.log('  ✅ All trip state cleared');
};

/**
 * Kiểm tra xem tất cả học sinh đã được điểm danh chưa
 * (Không còn học sinh nào có status "chua-len-xe")
 */
export const canCompleteTrip = (students) => {
  return students.every(student => student.status !== STUDENT_STATUS_UI.NOT_BOARDED);
};
