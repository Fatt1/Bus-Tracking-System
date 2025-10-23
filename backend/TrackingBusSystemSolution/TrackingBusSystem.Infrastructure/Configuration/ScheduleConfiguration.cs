using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
    {
        public void Configure(EntityTypeBuilder<Schedule> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__Schedule__3214EC07444BB67C");

            // Cấu hình quan hệ Khóa ngoại
            builder.HasOne(d => d.Bus)
                .WithMany(p => p.Schedules)
                .HasForeignKey(d => d.BusId)
                .OnDelete(DeleteBehavior.ClientSetNull) // ON DELETE NO ACTION
                .HasConstraintName("Schedules_fk3");

            builder.HasOne(d => d.Driver)
                .WithMany(p => p.Schedules)
                .HasForeignKey(d => d.DriverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Schedules_fk2");

            builder.HasOne(d => d.Route)
                .WithMany(p => p.Schedules)
                .HasForeignKey(d => d.RouteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Schedules_fk4");
        }
    }
}
