using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            // Primary Key
            builder.HasKey(e => e.Id).HasName("PK__Announce__3214EC07358607F7");

            // Unique Index (Lưu ý: EF Core thường tự động tạo Index cho Primary Key)
            // Nếu bạn muốn giữ nguyên tên Index được Scaffolding tạo ra, bạn phải dùng Fluent API. 
            // Trong Code First thuần túy, ta thường bỏ qua tên cụ thể này trừ khi cần thiết.
            // Tuy nhiên, để tuân thủ mã Scaffolding:
            builder.HasIndex(e => e.Id, "UQ__Announce__3214EC063F58880F").IsUnique();


            // Column Type
            builder.Property(e => e.SendAt).HasColumnType("datetime");
        }
    }
}
