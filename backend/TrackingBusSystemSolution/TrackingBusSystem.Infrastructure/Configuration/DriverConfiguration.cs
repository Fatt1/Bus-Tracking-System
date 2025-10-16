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


            builder.Property(d => d.IDCard)
                   .IsRequired()
                   .HasMaxLength(20);


            builder.HasIndex(d => d.BusId).IsUnique();


        }
    }
}
