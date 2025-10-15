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
        }
    }
}
