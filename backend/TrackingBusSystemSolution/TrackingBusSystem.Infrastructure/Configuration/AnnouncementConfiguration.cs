using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Title).IsRequired().HasMaxLength(200);
            builder.Property(a => a.Message).IsRequired();

            // Mối quan hệ N-N (qua bảng UserAnnouncement)
            builder.HasMany(a => a.UserAnnouncements)
                   .WithOne(ua => ua.Announcement)
                   .HasForeignKey(ua => ua.AnnouncementId)
                   .OnDelete(DeleteBehavior.Restrict); // Xóa thông báo thì xóa luôn các bản ghi trung gian
        }
    }
}
