namespace TrackingBusSystem.Application.Features.Drivers.DTOs
{
    public record DriverSimpleDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
    }
}
