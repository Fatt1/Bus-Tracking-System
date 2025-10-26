namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetAllDriverWithoutPaginationDTO
    {
        public int Id { get; init; }
        public string FullName { get; init; } = string.Empty;
        public string UserId { get; init; } = string.Empty;
    }
}
