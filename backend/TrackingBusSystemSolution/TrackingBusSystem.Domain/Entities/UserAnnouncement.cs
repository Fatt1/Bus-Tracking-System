namespace TrackingBusSystem.Domain.Entities
{
    public class UserAnnouncement
    {

        public int Id { get; set; }

        public int AnnouncementId { get; set; }

        public bool IsRead { get; set; }

        public string RecipientUserId { get; set; } = null!;

        public AppUser RecipientUser { get; set; } = null!;
        public virtual Announcement Announcement { get; set; } = null!;
    }

}
