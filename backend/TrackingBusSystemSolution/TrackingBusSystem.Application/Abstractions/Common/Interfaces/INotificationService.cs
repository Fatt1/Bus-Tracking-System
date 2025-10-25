using TrackingBusSystem.Application.Abstractions.Common.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Abstractions.Common.Interfaces
{
    public interface INotificationService
    {

        // Gửi cho NHIỀU người dùng
        Task<Result> SendNotificationToUsersAsync(List<string> toUserIds, NotificationDto notification, string fromUserId);


    }
}
