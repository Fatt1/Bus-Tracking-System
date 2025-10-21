namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record GetAllBusSimpleDTO
    {
        public int Id { get; set; }
        public string BusName { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
