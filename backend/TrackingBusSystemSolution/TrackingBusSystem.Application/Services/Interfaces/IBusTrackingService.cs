using TrackingBusSystem.Application.Abstractions.Common.DTOs;

namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface IBusTrackingService
    {
        Task<BusLastLocationDTO> ProcessLocationUpdateAsync(int busId, double lat, double lng, string tripType);
    }
}
