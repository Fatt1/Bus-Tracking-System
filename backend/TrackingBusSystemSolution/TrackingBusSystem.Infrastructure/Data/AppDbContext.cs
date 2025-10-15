using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Domain.Entities;
using Route = TrackingBusSystem.Domain.Entities.Route;

namespace TrackingBusSystem.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>, IApplicationDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Route> Routes => Set<Route>();
        public DbSet<Point> Points { get; set; }
        public DbSet<Bus> Buses { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<UserAnnouncement> UserAnnouncements { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<BusLastLocation> BusLastLocations { get; set; }
        public DbSet<DepartureTime> DepartureTimes { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<ScheduleAssignment> ScheduleAssignments { get; set; }
        public DbSet<GeneratedTrip> GeneratedTrips { get; set; }
        public DbSet<ScheduleWeekly> ScheduleWeeklies { get; set; }
        public DbSet<TripStudentChecking> TripStudentCheckings { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
