using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class BusConfiguration : IEntityTypeConfiguration<Bus>
    {
        public void Configure(EntityTypeBuilder<Bus> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.BusName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(b => b.PlateNumber)
                   .IsRequired()
                   .HasMaxLength(20);

            // Đảm bảo PlateNumber là duy nhất
            builder.HasIndex(b => b.PlateNumber).IsUnique();

            //Mối quan hệ nhiều-1 với Route
            builder.HasOne(b => b.Route)
                   .WithMany(r => r.Buses)
                   .HasForeignKey(b => b.RouteId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Mối quan hệ 1-1 với BusLastLocation
            builder.HasOne(b => b.BusLastLocation)
                   .WithOne(l => l.Bus)
                   .HasForeignKey<BusLastLocation>(l => l.BusId);
        }
    }
}
