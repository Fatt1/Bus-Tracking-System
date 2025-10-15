using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
    {
        public void Configure(EntityTypeBuilder<Schedule> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.ScheduleName).IsRequired().HasMaxLength(100);

            // Mối quan hệ 1-N với ScheduleWeekly
            builder.HasMany(s => s.ScheduleWeeklies)
                   .WithOne(sw => sw.Schedule)
                   .HasForeignKey(sw => sw.ScheduleId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa lịch trình thì xóa luôn các ngày trong tuần
        }
    }
}
