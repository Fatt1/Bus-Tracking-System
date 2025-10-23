namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public class GetAllBusDropdownDTO
    {
        public int Id { get; set; }
        public string BusName { get; set; } = string.Empty;
        public bool CanClickable { get; set; }
    }
}
