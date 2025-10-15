using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class UserAnnouncementConfiguration : IEntityTypeConfiguration<UserAnnouncement>
    {
        public void Configure(EntityTypeBuilder<UserAnnouncement> builder)
        {
            builder.HasKey(ua => ua.Id);

            // Tạo composite key để đảm bảo một user chỉ nhận một thông báo một lần
            builder.HasIndex(ua => new { ua.AnnouncementId, ua.RecipientUserId }).IsUnique();
        }
    }
}
