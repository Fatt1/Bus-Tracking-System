namespace TrackingBusSystem.Application.Features.Notification.DTOs
{
    public record GetSentNotificationsDTO
    {
        public int SentNotificationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SendAt { get; set; }
        public List<RecipientUserDTO> RecipientUsers { get; set; } = new();
    }
    public record RecipientUserDTO
    {
        public string RecipientUserId { get; set; } = string.Empty;
        public string RecipientUserName { get; set; } = string.Empty;
    }
}
