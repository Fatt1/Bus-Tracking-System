using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class PointConfiguration : IEntityTypeConfiguration<Point>
    {
        public void Configure(EntityTypeBuilder<Point> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.PointName).IsRequired().HasMaxLength(150);

            // Mối quan hệ 1-N: Một điểm có thể có nhiều học sinh
            builder.HasMany(p => p.Students)
                   .WithOne(s => s.Point)
                   .HasForeignKey(s => s.PointId);

            builder.HasData(new List<Point>()
            {
                new Point()
                {
                    Id = 1,
                    PointName = "Trạm kcn Tân Bình",
                    Latitude = 10.819555,
                    Longitude = 106.630731,
                    RouteId = 1
                }
                ,
                 new Point()
                {
                      Id = 2,
                    PointName = "Trạm bệnh viện Tân Phú",
                    Latitude = 10.782951,
                    Longitude = 106.642635,
                    RouteId = 1
                },
                  new Point()
                {
                       Id = 3,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 1
                },
                   new Point()
                {
                        Id = 4,
                    PointName = "Trạm đại học quốc gia",
                    Latitude = 10.87335,
                    Longitude = 106.808025,
                    RouteId = 2
                },
                  new Point()
                { Id = 5,
                    PointName = "Trạm ngã tư Thủ Đức",
                    Latitude = 10.8491849,
                    Longitude = 106.7543493,
                    RouteId = 2
                },
                    new Point()
                {
                     Id = 6,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 2
                },
                     new Point()
                {
                     Id = 7,
                    PointName = "Trạm lotte mart q7",
                    Latitude = 10.7412141,
                    Longitude = 106.6953428,
                    RouteId = 3
                },
                  new Point()
                {
                    Id = 8,
                    PointName = "Trạm công viên khánh hội",
                    Latitude = 10.758583,
                    Longitude = 106.699443,
                    RouteId = 3
                },
                  new Point()
                {
                    Id = 9,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 3
                },
            });
        }
    }
}
