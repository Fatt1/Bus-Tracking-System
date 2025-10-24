using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class RouteRepository(AppDbContext context) : IRouteRepository
    {

        public async Task<Route?> GetRouteByIdAsync(int id)
        {
            var route = await context.Routes.Include(route => route.StopPoints).FirstOrDefaultAsync(route => route.Id == id);
            return route;
        }

        public async Task<List<Route>> GetRoutesAsync()
        {
            var routeModel = await context.Routes.Include(route => route.StopPoints).ToListAsync();
            return routeModel;
        }

        public Task<bool> IsExist(int routeId)
        {
            return context.Routes.AnyAsync(r => r.Id == routeId);
        }
        public Task<bool> IsExistPoint(int stopPointId)
        {
            return context.StopPoints.AnyAsync(sp => sp.Id == stopPointId);
        }
    }
}
