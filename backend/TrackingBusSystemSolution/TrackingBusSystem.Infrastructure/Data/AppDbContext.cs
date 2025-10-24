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
        public virtual DbSet<Announcement> Announcements => Set<Announcement>();

        public virtual DbSet<Bus> Buses => Set<Bus>();

        public virtual DbSet<BusLastLocation> BusLastLocations => Set<BusLastLocation>();

        public virtual DbSet<Driver> Drivers => Set<Driver>();

        public virtual DbSet<Route> Routes => Set<Route>();

        public virtual DbSet<Schedule> Schedules => Set<Schedule>();

        public virtual DbSet<StopPoint> StopPoints => Set<StopPoint>();

        public virtual DbSet<Student> Students => Set<Student>();

        public virtual DbSet<StudentCheckingHistory> StudentCheckingHistories => Set<StudentCheckingHistory>();

        public virtual DbSet<UserAnnouncement> UserAnnouncements => Set<UserAnnouncement>();


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Soft delete, chỉ lấy những Driver chưa bị xóa
            modelBuilder.Entity<Driver>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<Bus>().HasQueryFilter(b => !b.IsDeleted);

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
