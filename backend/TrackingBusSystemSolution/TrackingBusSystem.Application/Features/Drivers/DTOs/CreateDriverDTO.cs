using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record CreateDriverDTO
    {
        public string PhoneNumber { get; init; } = string.Empty;

        public DateTime DateOfBirth { get; init; }

        public string IDCard { get; init; } = string.Empty;

        public string FullName { get; init; } = string.Empty;

        public string Address { get; init; } = string.Empty;

        public Gender Sex { get; init; }

        // Foreign Keys
        public int BusId { get; init; }
    }
}
