using Microsoft.AspNetCore.Identity;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Domain.Entities
{
    public class AppUser : IdentityUser // IdentityUser mặc định dùng string cho Id
    {

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public Gender Sex { get; set; }
        public DateOnly DateOfBirth { get; set; }

        public virtual Driver? Driver { get; set; }
        public virtual Student? Student { get; set; }

        public virtual ICollection<UserAnnouncement> UserAnnouncements { get; set; } = new List<UserAnnouncement>();
        public virtual ICollection<Announcement> SentAnnouncements { get; set; } = new List<Announcement>();
    }

}
