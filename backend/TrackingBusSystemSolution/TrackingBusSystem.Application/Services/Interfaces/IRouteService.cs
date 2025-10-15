using TrackingBusSystem.Application.Features.Routes.DTOs;

namespace TrackingBusSystem.Application.Services.Interfaces
{
    public interface IRouteService
    {
        Task<List<GetRoutesResponse>> GetRoutesAsync();
        Task<GetRoutesResponse> GetRouteAsync(int id);
    }
}
