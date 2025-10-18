namespace TrackingBusSystem.Application.Features.Routes.DTOs
{
    public class PointResponse
    {
        public int Id { get; init; }
        public string PointName { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
    }
}
