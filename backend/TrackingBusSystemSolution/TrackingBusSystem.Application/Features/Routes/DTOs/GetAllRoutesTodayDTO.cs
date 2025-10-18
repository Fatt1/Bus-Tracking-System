namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    public class GetAllRoutesTodayDTO
    {
        public int Id { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public int RouteId { get; set; }
        // Navigation properties
        public virtual ICollection<PointResponse> Points { get; set; }
    }
}
