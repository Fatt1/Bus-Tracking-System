using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;
using Route = TrackingBusSystem.Domain.Entities.Route;

namespace TrackingBusSystem.Application.Abstractions.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        public DbSet<Route> Routes { get; }
        public DbSet<Bus> Buses { get; }

        public DbSet<Schedule> Schedules { get; }
        public DbSet<Driver> Drivers { get; }
        public DbSet<Student> Students { get; }
    }
}
