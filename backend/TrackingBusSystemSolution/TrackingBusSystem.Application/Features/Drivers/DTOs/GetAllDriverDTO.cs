namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetAllDriverDTO
    {
        public int Id { get; init; }
        public string FullName { get; init; } = string.Empty;
        public string PhoneNumber { get; init; } = string.Empty;
        public string BusName { get; init; } = string.Empty;
        public int BusId { get; init; }

    }
}
