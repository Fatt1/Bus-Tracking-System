using Microsoft.AspNetCore.Identity;

namespace TrackingBusSystem.Domain.Entities
{
    public class AppUser : IdentityUser // IdentityUser mặc định dùng string cho Id
    {

        public string FullName { get; set; } = string.Empty;

        // Navigation properties
        public virtual Driver? Driver { get; set; }
        public virtual Student? Student { get; set; }
        public virtual ICollection<UserAnnouncement> UserAnnouncements { get; set; } = new List<UserAnnouncement>();
        public virtual ICollection<Announcement> SentAnnouncements { get; set; } = new List<Announcement>();
    }

}
