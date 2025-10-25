namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record BusLastLocationDTO
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
    }
}
