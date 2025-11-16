using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Users.DTOs
{
    public record GetProfileDTO
    {
        public string UserId { get; init; } = string.Empty;
        public string UserName { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public Gender Sex { get; init; }
        public DateOnly DateOfBith { get; init; }
    }
}
