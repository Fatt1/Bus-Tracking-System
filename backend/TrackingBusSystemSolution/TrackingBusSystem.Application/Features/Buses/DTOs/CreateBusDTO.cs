namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record CreateBusDTO
    {
        public int Id { get; init; }
        public string BusName { get; init; }
        public string PlateNumber { get; init; }
        public int RouteId { get; init; }
        public bool Status { get; init; }
    }
}
