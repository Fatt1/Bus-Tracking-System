namespace TrackingBusSystem.Domain.Entities
{
    public class UserAnnouncement
    {

        public int Id { get; set; }
        public bool IsRead { get; set; }
        public int AnnouncementId { get; set; }
        public string RecipientUserId { get; set; } = string.Empty; // Changed to string


        public virtual Announcement Announcement { get; set; } = null!;


        public virtual AppUser RecipientUser { get; set; } = null!;
    }

}
