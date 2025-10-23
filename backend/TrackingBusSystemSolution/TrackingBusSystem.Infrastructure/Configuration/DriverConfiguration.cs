using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class DriverConfiguration : IEntityTypeConfiguration<Driver>
    {
        public void Configure(EntityTypeBuilder<Driver> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__Drivers__3214EC071E7E78E1");
            builder.HasIndex(e => e.Id, "UQ__Drivers__3214EC06B27217F8").IsUnique();

            // ĐIỀU QUAN TRỌNG NHẤT:
            // Bắt buộc cột UserId phải là duy nhất (Unique)
            // Chính điều này tạo nên mối quan hệ 1-1 thay vì 1-nhiều
            builder
                .HasIndex(driver => driver.UserId)
                .IsUnique();

            // Cấu hình tên cột trong DB
            builder.Property(e => e.Idcard).HasColumnName("IDCard");
        }
    }
}
