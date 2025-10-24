namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record GetAllDriverDropdownDTO
    {
        public int Id { get; init; }
        public string DriverName { get; init; } = string.Empty;
        public bool CanClickable { get; init; }
    }
}
