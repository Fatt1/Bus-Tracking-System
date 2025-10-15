namespace TrackingBusSystem.Domain.Entities
{
    public class Announcement
    {

        public int Id { get; set; }


        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public DateTime SendAt { get; set; }
        public string SenderUserId { get; set; } = string.Empty; // Changed to string


        public virtual AppUser SenderUser { get; set; } = null!;

        public virtual ICollection<UserAnnouncement> UserAnnouncements { get; set; } = new List<UserAnnouncement>();
    }

}
