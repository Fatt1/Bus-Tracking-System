namespace TrackingBusSystem.Shared.Constants
{
    public enum BusStatus
    {
        // Đang hoạt động, sẵn sàng để được phân công
        Active = 1,

        // Đang trong quá trình bảo trì, không thể phân công
        Maintenance = 2,
    }
}
