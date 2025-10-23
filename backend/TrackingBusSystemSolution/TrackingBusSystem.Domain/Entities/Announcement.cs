namespace TrackingBusSystem.Domain.Entities
{
    public class Announcement
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public string Message { get; set; } = null!;

        public DateTime SendAt { get; set; }
        public string SenderUserId { get; set; } = null!;

        public int AnnouncementType { get; set; }
        public AppUser SenderUser { get; set; } = null!;
        public virtual ICollection<UserAnnouncement> UserAnnouncements { get; set; } = new List<UserAnnouncement>();
    }

}
