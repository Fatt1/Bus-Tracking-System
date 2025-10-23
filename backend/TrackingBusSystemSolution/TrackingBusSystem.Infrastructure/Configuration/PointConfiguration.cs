using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class PointConfiguration : IEntityTypeConfiguration<StopPoint>
    {
        public void Configure(EntityTypeBuilder<StopPoint> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__StopPoin__3214EC07447DF06E");
            builder.HasIndex(e => e.Id, "UQ__StopPoin__3214EC06E20CC330").IsUnique();

            builder.HasOne(d => d.Route)
                .WithMany(p => p.StopPoints)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StopPoints_fk2");

            builder.HasData(new List<StopPoint>()
            {
                new StopPoint()
                {
                    Id = 1,
                    PointName = "Trạm kcn Tân Bình",
                    Latitude = 10.819555,
                    Longitude = 106.630731,
                    RouteId = 1,
                    SequenceOrder = 1
                }
                ,
                 new StopPoint()
                {
                      Id = 2,
                    PointName = "Trạm bệnh viện Tân Phú",
                    Latitude = 10.782951,
                    Longitude = 106.642635,
                    RouteId = 1,
                    SequenceOrder = 2
                },
                  new StopPoint()
                {
                       Id = 3,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 1,
                    SequenceOrder = 3
                },
                   new StopPoint()
                {
                        Id = 4,
                    PointName = "Trạm đại học quốc gia",
                    Latitude = 10.87335,
                    Longitude = 106.808025,
                    RouteId = 2,
                    SequenceOrder = 1
                },
                  new StopPoint()
                { Id = 5,
                    PointName = "Trạm ngã tư Thủ Đức",
                    Latitude = 10.8491849,
                    Longitude = 106.7543493,
                    RouteId = 2,
                    SequenceOrder = 2
                },
                    new StopPoint()
                {
                     Id = 6,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 2,
                    SequenceOrder = 3
                },
                     new StopPoint()
                {
                     Id = 7,
                    PointName = "Trạm lotte mart q7",
                    Latitude = 10.7412141,
                    Longitude = 106.6953428,
                    RouteId = 3,
                    SequenceOrder = 1
                },
                  new StopPoint()
                {
                    Id = 8,
                    PointName = "Trạm công viên khánh hội",
                    Latitude = 10.758583,
                    Longitude = 106.699443,
                    RouteId = 3,
                     SequenceOrder = 2
                },
                  new StopPoint()
                {
                    Id = 9,
                    PointName = "Đại học sài gòn",
                    Latitude = 10.7599171,
                    Longitude = 106.6796834,
                    RouteId = 3,
                    SequenceOrder = 3
                },
            });
        }
    }
}
