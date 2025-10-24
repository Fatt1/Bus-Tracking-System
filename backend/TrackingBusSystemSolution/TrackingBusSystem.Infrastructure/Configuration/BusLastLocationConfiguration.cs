using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class BusLastLocationConfiguration : IEntityTypeConfiguration<BusLastLocation>
    {
        public void Configure(EntityTypeBuilder<BusLastLocation> builder)
        {
            builder.HasKey(e => e.BusId).HasName("PK__BusLastL__6A0F60B53F6551AF");
            builder.HasIndex(e => e.BusId, "UQ__BusLastL__6A0F60B42694616B").IsUnique();

            // BusId là Khóa chính, nhưng lại được thiết lập là ValueGeneratedOnAdd().
            // Điều này cho thấy BusId được tự động gán giá trị, mặc dù nó cũng là khóa ngoại.
            // Trong quan hệ One-to-One, khóa ngoại thường không tự động sinh (ValueGeneratedNever).
            // Tuy nhiên, để tuân thủ cấu hình đã cho:
            builder.Property(e => e.BusId).ValueGeneratedOnAdd();

            // Cấu hình Concurrency Token (RowVersion)
            builder.Property(e => e.LastUpdateTimestamp)
                .IsRowVersion()
                .IsConcurrencyToken();

            // Cấu hình quan hệ One-to-One
            builder.HasOne(d => d.Bus)
                .WithOne(p => p.BusLastLocation)
                .HasForeignKey<BusLastLocation>(d => d.BusId)
                .OnDelete(DeleteBehavior.ClientSetNull) // ON DELETE NO ACTION
                .HasConstraintName("BusLastLocations_fk0");
        }
    }
}
