using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Abstractions.Common.DTOs
{
    public class NotificationDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public AnnouncementType NotificationType { get; set; } // "Info", "Warning", "Error"
    }
}
