using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class ScheduleAssignmentConfiguration : IEntityTypeConfiguration<ScheduleAssignment>
    {
        public void Configure(EntityTypeBuilder<ScheduleAssignment> builder)
        {
            builder.HasKey(sa => sa.Id);

            // Đảm bảo sự kết hợp của Lịch trình, Tuyến đường và Tài xế là duy nhất
            builder.HasIndex(sa => new { sa.ScheduleId, sa.RouteId, sa.DriverId }).IsUnique();

            builder.HasOne(sa => sa.Schedule)
                   .WithMany(s => s.ScheduleAssignments)
                   .HasForeignKey(sa => sa.ScheduleId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sa => sa.Route)
                   .WithMany(r => r.ScheduleAssignments)
                   .HasForeignKey(sa => sa.RouteId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sa => sa.Driver)
                   .WithMany(d => d.ScheduleAssignments)
                   .HasForeignKey(sa => sa.DriverId)
                   .OnDelete(DeleteBehavior.Restrict);


        }
    }
}
