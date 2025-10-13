using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Domain.Interfaces
{
    public interface IRouteRepository
    {
        Task<List<Route>> GetRoutesAsync();
        Task<Route> GetRouteAsync(int id);

    }
}
