namespace TrackingBusSystem.Application.Features.Buses.DTOs
{
    public record GetAllBusesDTO(int Id, string BusName, string PlateNumber, string DriverName, int? DriverId, bool Status)
    {
        public GetAllBusesDTO() : this(0, "", "", "", null, false) { }
    }
}
