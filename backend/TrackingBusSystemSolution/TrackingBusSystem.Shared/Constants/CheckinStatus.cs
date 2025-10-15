namespace TrackingBusSystem.Shared.Constants
{
    // Trạng thái điểm danh của học sinh
    public enum CheckinStatus
    {
        Pending,        // Chưa điểm danh
        CheckedIn,      // Đã lên xe
        CheckedOut,     // Đã xuống xe
        Absent          // Vắng mặt
    }
}
