using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class GeneratedTripConfiguration : IEntityTypeConfiguration<GeneratedTrip>
    {
        public void Configure(EntityTypeBuilder<GeneratedTrip> builder)
        {
            builder.HasKey(t => t.Id);

            // Mối quan hệ với Driver
            builder.HasOne(t => t.Driver)
                   .WithMany(d => d.GeneratedTrips)
                   .HasForeignKey(t => t.DriverId)
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Driver nếu đang có chuyến đi

            // Mối quan hệ với Route
            builder.HasOne(t => t.Route)
                   .WithMany(r => r.GeneratedTrips)
                   .HasForeignKey(t => t.RouteId)
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Route nếu đang có chuyến đi

            // Mối quan hệ với Schedule
            builder.HasOne(t => t.Schedule)
                   .WithMany(s => s.GeneratedTrips)
                   .HasForeignKey(t => t.ScheduleId)
                   .OnDelete(DeleteBehavior.Restrict); // Không cho xóa Schedule nếu đang có chuyến đi

            // Mối quan hệ 1-N với TripStudentChecking
            builder.HasMany(t => t.StudentCheckings)
                   .WithOne(c => c.GeneratedTrip)
                   .HasForeignKey(c => c.GeneratedTripId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa chuyến đi thì xóa luôn lịch sử điểm danh
        }
    }
}
