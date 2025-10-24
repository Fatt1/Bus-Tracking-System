using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TrackingBusSystem.Domain.Entities;

namespace TrackingBusSystem.Infrastructure.Configuration
{
    public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> builder)
        {

            // Cấu hình quan hệ 1-1 giữa AppUser và Driver
            builder
                 .HasOne(appUser => appUser.Driver) // AppUser có một Driver
                .WithOne(driver => driver.User)   // Driver có một User
                .HasForeignKey<Driver>(driver => driver.UserId); // Khóa ngoại là 'UserId' trên Driver

            builder
                 .HasOne(appUser => appUser.Student) // AppUser có một Student
                .WithOne(student => student.User)   // Student có một User
                .HasForeignKey<Student>(student => student.UserId); // Khóa ngoại là 'UserId' trên Student

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
