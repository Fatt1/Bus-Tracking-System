namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record BusLocationUpdateRequest
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}
