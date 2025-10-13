namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface IGpsService
    {
        Task ProcessGpsUpdate(double lat, double lng);
    }
}
