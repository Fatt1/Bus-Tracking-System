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
            var route = await context.Routes.Include(route => route.Points).FirstOrDefaultAsync(route => route.Id == id);
            return route;
        }

        public async Task<List<Route>> GetRoutesAsync()
        {
            var routeModel = await context.Routes.Include(route => route.Points).ToListAsync();
            return routeModel;
        }
    }
}
