namespace TrackingBusSystem.Application.Features.Notification.DTOs
{
    public record GetReceivedNotificationsDTO
    {

        public int ReceivedNotifcationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SendAt { get; set; }
        public bool IsRead { get; set; }
        public string SenderUserId { get; set; } = string.Empty;
        public string SenderUserName { get; set; } = string.Empty;
    }
}
