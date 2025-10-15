using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class DriverConfiguration : IEntityTypeConfiguration<Driver>
    {
        public void Configure(EntityTypeBuilder<Driver> builder)
        {
            builder.HasKey(d => d.Id); // Xác định khóa chính

            // Cấu hình các thuộc tính
            builder.Property(d => d.FullName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(d => d.IDCard)
                   .IsRequired()
                   .HasMaxLength(20);

            // Cấu hình mối quan hệ N-1 với Bus
            // Một Driver có thể được gán cho một Bus (hoặc không)
            // Một Bus có thể có nhiều Drivers
            builder.HasOne(d => d.Bus)
                   .WithMany(b => b.Drivers)
                   .HasForeignKey(d => d.BusId);

        }
    }
}
