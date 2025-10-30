using TrackingBusSystem.Shared;

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
        public bool IsDeleted { get; set; } = false;
        public virtual ICollection<UserAnnouncement> UserAnnouncements { get; set; } = new List<UserAnnouncement>();

    }
    public static class AnnouncementErrors
    {
        public static Error AnnouncementNotFound(int announcementId) => new Error("Annoucement.NotFound", $"Announcement with id: {announcementId}");
    }

}
