using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class StudentConfiguration : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.HasKey(s => s.Id);

            // Đảm bảo UserId là duy nhất vì đây là mối quan hệ 1-1
            builder.HasIndex(s => s.UserId).IsUnique();

            // 1-N giữa Student với Driver

            builder.HasOne(s => s.Driver)
              .WithMany(dr => dr.Students)
              .HasForeignKey(s => s.DriverId)
              .OnDelete(DeleteBehavior.Restrict);

            builder.Property(s => s.Class).HasMaxLength(50);
            builder.Property(s => s.Address).HasMaxLength(255);
            builder.Property(s => s.ParentName).HasMaxLength(100);
            builder.Property(s => s.ParentPhoneNumber).HasMaxLength(15);
        }
    }
}
