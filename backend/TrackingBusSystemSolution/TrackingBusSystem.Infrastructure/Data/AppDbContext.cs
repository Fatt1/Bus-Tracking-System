using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Route> Routes { get; set; }
        public DbSet<Point> Points { get; set; }
        public DbSet<Bus> Buses { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
