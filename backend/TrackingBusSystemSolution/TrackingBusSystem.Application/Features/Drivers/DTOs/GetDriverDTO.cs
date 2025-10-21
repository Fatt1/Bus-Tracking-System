using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetDriverDTO
    {
        public int Id { get; init; }

        public string PhoneNumber { get; init; } = string.Empty;

        public DateTime DateOfBirth { get; init; }

        public string IDCard { get; init; } = string.Empty;

        public string FullName { get; init; } = string.Empty;

        public string Address { get; init; } = string.Empty;

        public Gender Sex { get; init; }

        // Foreign Keys
        public int BusId { get; init; }
        public string BusName { get; init; } = string.Empty;
        public int RouteId { get; init; }
        public string RouteName { get; init; } = string.Empty;
    }
}
