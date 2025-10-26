using TrackingBusSystem.Application.Features.Routes.DTOs;

namespace TrackingBusSystem.Application.Features.Students.DTOs
{
    public class GetBusLocationDTO
    {
        public GetRouteDTO RouteDTO { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int BusId { get; set; }
        public string BusName { get; set; } = string.Empty;
    }
}
