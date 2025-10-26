namespace TrackingBusSystem.Application.Features.Users.DTOs
{
    public record GetAllUSersDTO
    {
        public string UserId { get; init; } = null!;
        public List<string> Roles { get; init; } = null!;
        public string FullName { get; init; } = null!;
        public DateOnly DateOfBirth { get; init; }
    }
}
