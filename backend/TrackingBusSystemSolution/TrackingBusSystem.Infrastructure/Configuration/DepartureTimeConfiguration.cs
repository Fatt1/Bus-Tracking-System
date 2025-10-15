using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class DepartureTimeConfiguration : IEntityTypeConfiguration<DepartureTime>
    {
        public void Configure(EntityTypeBuilder<DepartureTime> builder)
        {
            builder.HasKey(dt => dt.Id);
        }
    }
}
