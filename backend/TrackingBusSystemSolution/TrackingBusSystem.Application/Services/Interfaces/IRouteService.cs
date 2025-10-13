using TrackingBusSystem.Application.DTOs;

namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface IRouteService
    {
        Task<List<GetRoutesResponse>> GetRoutesAsync();
        Task<GetRoutesResponse> GetRouteAsync(int id);
    }
}
