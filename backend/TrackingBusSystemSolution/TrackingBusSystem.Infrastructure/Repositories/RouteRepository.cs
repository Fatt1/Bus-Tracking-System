using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class RouteRepository(AppDbContext context) : IRouteRepository
    {
        public Task<List<int>> GetExistingIdsAsync(List<int> ids)
        {
            return context.Routes.Where(route => ids.Contains(route.Id)).Select(route => route.Id).ToListAsync();
        }

        public async Task<Route> GetRouteAsync(int id)
        {
            var route = await context.Routes.Include(route => route.Points).FirstAsync(route => route.Id == id);
            return route;
        }

        public async Task<List<Route>> GetRoutesAsync()
        {
            var routeModel = await context.Routes.Include(route => route.Points).ToListAsync();
            return routeModel;
        }
    }
}
