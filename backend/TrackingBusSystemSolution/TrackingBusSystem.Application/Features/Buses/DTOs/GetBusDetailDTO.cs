using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record GetBusDetailDTO
    {
        public int Id { get; init; }
        public string BusName { get; init; } = string.Empty;
        public string PlateNumber { get; init; } = string.Empty;
        public string? DriverName { get; init; }
        public string? RouteName { get; init; }
        public BusStatus Status { get; init; }
        public BusLastLocationDTO? BusLastLocation { get; init; }
    }
}
