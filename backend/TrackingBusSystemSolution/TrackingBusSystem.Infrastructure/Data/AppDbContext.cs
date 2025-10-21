using Microsoft.AspNetCore.Identity;
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
        public DbSet<Point> Points => Set<Point>();
        public DbSet<Bus> Buses => Set<Bus>();
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<UserAnnouncement> UserAnnouncements { get; set; }
        public DbSet<Student> Students => Set<Student>();
        public DbSet<Driver> Drivers => Set<Driver>();
        public DbSet<BusLastLocation> BusLastLocations { get; set; }
        public DbSet<Schedule> Schedules => Set<Schedule>();
        public DbSet<ScheduleAssignment> ScheduleAssignments => Set<ScheduleAssignment>();
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
            const string DRIVER_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e575";
            const string ADMIN_ID = "b18be9c0-aa65-4af8-bd17-00bd9344e576";
            const string PARENT_ID = "c18be9c0-aa65-4af8-bd17-00bd9344e577";
            modelBuilder.Entity<IdentityRole>().HasData(new IdentityRole
            {
                Id = DRIVER_ID,
                Name = "Driver",
                NormalizedName = "DRIVER"
            });
            modelBuilder.Entity<IdentityRole>().HasData(new IdentityRole
            {
                Id = ADMIN_ID,
                Name = "Admin",
                NormalizedName = "ADMIN"
            });
            modelBuilder.Entity<IdentityRole>().HasData(new IdentityRole
            {
                Id = PARENT_ID,
                Name = "Parent",
                NormalizedName = "PARENT"
            });
        }
    }
}
