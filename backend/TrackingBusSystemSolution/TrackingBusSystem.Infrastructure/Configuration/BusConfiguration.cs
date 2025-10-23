using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class BusConfiguration : IEntityTypeConfiguration<Bus>
    {
        public void Configure(EntityTypeBuilder<Bus> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__Buses__3214EC0734B94B78");

            // Tương tự Announcement, giữ lại tên Index cụ thể
            builder.HasIndex(e => e.Id, "UQ__Buses__3214EC06E73C215D").IsUnique();
        }
    }
}
