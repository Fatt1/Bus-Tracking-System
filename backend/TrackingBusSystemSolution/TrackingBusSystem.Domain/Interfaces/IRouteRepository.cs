using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IRouteRepository
    {
        Task<List<Route>> GetRoutesAsync();
        Task<Route?> GetRouteByIdAsync(int id);
        Task<bool> IsExist(int routeId);
        Task<bool> IsExistPoint(int stopPointId);
    }
}
