using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Infrastructure.Data;

namespace TrackingBusSystem.Infrastructure.Repositories
{
    public class RouteRepository(AppDbContext context) : IRouteRepository
    {
        public Task<Route> GetRouteAsync(int id)
        {
            return context.Routes.Include(route => route.Points).FirstAsync(route => route.Id == id);
        }

        public Task<List<Route>> GetRoutesAsync()
        {
            return context.Routes.Include(route => route.Points).ToListAsync();
        }
    }
}
