namespace TrackingBusSystem.Shared.Constants
{
    // Trạng thái điểm danh của học sinh
    public enum CheckinStatus
    {
        Pending = 0,        // Chưa điểm danh
        CheckedIn = 1,      // Đã lên xe
        CheckedOut = 2,     // Đã xuống xe
        Absent = 3         // Vắng mặt
    }
}
