using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class UserAnnouncementConfiguration : IEntityTypeConfiguration<UserAnnouncement>
    {
        public void Configure(EntityTypeBuilder<UserAnnouncement> builder)
        {
            builder.HasKey(e => e.Id).HasName("PK__UserAnno__3214EC07B0364131");
            builder.HasIndex(e => e.Id, "UQ__UserAnno__3214EC063CE44EAC").IsUnique();

            builder.HasOne(d => d.Announcement)
                .WithMany(p => p.UserAnnouncements)
                .HasForeignKey(d => d.AnnouncementId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("UserAnnouncements_fk1");
        }
    }
}
