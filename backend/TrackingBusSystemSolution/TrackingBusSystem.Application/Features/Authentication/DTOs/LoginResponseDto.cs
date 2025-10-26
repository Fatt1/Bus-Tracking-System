namespace TrackingBusSystem.Application.Features.Authentication.DTOs
{
    public record LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        // Thêm busId (nullable, vì có thể họ không có lịch hôm nay)
        public int? BusIdForToday { get; set; }
        public string UserName { get; set; } = string.Empty;
    }
}
