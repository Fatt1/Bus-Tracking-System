namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    public class GetAssigmentRouteDTO
    {
        public int Id { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public List<PointResponse> Points { get; set; }
        public List<DriverAssigmentRoute> DriverAssigmentRoutes { get; set; }
    }
    public record DriverAssigmentRoute
    {
        public int DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
        public int BusId { get; set; }
        public string BusName { get; set; } = string.Empty;
    }
}
