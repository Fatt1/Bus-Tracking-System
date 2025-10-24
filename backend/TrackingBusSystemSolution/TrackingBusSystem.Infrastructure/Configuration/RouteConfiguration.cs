using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class RouteConfiguration : IEntityTypeConfiguration<Route>
    {
        public void Configure(EntityTypeBuilder<Route> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__Routes__3214EC070A209B9A");
            builder.HasIndex(e => e.Id, "UQ__Routes__3214EC067798D6EB").IsUnique();
            builder.Property(r => r.RouteName).IsRequired().HasMaxLength(150);


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
