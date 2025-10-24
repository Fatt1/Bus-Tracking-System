using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record GetAllBusesDTO
    {
        public int Id { get; init; }
        public string BusName { get; init; } = string.Empty;
        public string PlateNumber { get; init; } = string.Empty;
        public BusStatus Status { get; init; }
        public string DriverName { get; init; } = string.Empty;
        public string RouteName { get; init; } = string.Empty;
    }
}
