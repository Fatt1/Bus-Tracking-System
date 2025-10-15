using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class RouteConfiguration : IEntityTypeConfiguration<Route>
    {
        public void Configure(EntityTypeBuilder<Route> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.RouteName).IsRequired().HasMaxLength(150);

            // Mối quan hệ 1-N với Point
            builder.HasMany(r => r.Points)
                   .WithOne(p => p.Route)
                   .HasForeignKey(p => p.RouteId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa tuyến đường thì xóa luôn các điểm trên tuyến
            builder.HasData(new List<Route>()
            {
                new Route()
                {
                    Id = 1,
                    RouteName = "Tuyến Trường Chinh - Âu Cơ"
                },
                  new Route()
                {
                    Id = 2,
                    RouteName = "Tuyến Quốc lộ 52"
                },
                    new Route()
                {
                    Id = 3,
                    RouteName = "Tuyến Nguyễn Hữu Thọ - Khánh Hội"
                },
            });
        }
    }
}
