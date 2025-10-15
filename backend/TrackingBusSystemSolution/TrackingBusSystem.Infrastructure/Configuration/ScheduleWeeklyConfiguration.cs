using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class ScheduleWeeklyConfiguration : IEntityTypeConfiguration<ScheduleWeekly>
    {
        public void Configure(EntityTypeBuilder<ScheduleWeekly> builder)
        {
            builder.HasKey(sw => sw.Id);

            // Đảm bảo một ngày trong tuần không bị lặp lại cho cùng một lịch trình
            builder.HasIndex(sw => new { sw.ScheduleId, sw.DayOfWeek }).IsUnique();
        }
    }
}
