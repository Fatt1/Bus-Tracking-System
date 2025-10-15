using Microsoft.EntityFrameworkCore;
using Route = TrackingBusSystem.Domain.Entities.Route;

namespace TrackingBusSystem.Application.Abstractions.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        public DbSet<Route> Routes { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
