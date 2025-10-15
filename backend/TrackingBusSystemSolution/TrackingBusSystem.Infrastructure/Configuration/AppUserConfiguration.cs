using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> builder)
        {
            // Cấu hình mối quan hệ 1-1 với Driver
            builder.HasOne(u => u.Driver)
                   .WithOne(d => d.User)
                   .HasForeignKey<Driver>(d => d.UserId)
                   .IsRequired(); // Quan trọng: Mỗi Driver phải gắn với một User

            // Cấu hình mối quan hệ 1-1 với Student
            builder.HasOne(u => u.Student)
                   .WithOne(s => s.User)
                   .HasForeignKey<Student>(s => s.UserId)
                   .IsRequired(); // Mỗi Student phải gắn với một User

            // Cấu hình mối quan hệ 1-N với Announcement (User là người gửi)
            builder.HasMany(u => u.SentAnnouncements)
                   .WithOne(a => a.SenderUser)
                   .HasForeignKey(a => a.SenderUserId);

            // Cấu hình mối quan hệ N-N gián tiếp với Announcement thông qua UserAnnouncement
            builder.HasMany(u => u.UserAnnouncements)
                   .WithOne(ua => ua.RecipientUser)
                   .HasForeignKey(ua => ua.RecipientUserId);
        }
    }
}
