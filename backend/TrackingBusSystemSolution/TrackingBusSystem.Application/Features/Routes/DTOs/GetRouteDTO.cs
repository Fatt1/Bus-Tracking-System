namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    public record class GetRouteDTO
    {
        public int Id { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public List<PointResponse> StopPoints { get; set; } = new();
    }
}
