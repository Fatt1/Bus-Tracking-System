namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record GetBusDetailDTO
    {
        public int Id { get; init; }
        public string BusName { get; init; }
        public string PlateNumber { get; init; }
        public string? DriverName { get; init; }
        public int? DriverId { get; init; }
        public bool Status { get; init; }
        public BusLastLocationDTO? BusLastLocation { get; init; }
    }

    public record BusLastLocationDTO
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public DateTime LastUpdateTimestamp { get; init; }

    }
}
