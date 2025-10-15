using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class BusLastLocationConfiguration : IEntityTypeConfiguration<BusLastLocation>
    {
        public void Configure(EntityTypeBuilder<BusLastLocation> builder)
        {
            // Khóa chính cũng là khóa ngoại, thiết lập mối quan hệ 1-1
            builder.HasKey(l => l.BusId);
        }
    }
}
