namespace TrackingBusSystem.Application.Features.Notification.DTOs
{
    public record GetSentNotificationDetailDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SendAt { get; set; }
        public List<RecipientUserDTO> RecipientUsers { get; set; } = new();
    }
}
