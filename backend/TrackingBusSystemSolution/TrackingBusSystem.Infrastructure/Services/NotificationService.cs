using Microsoft.AspNetCore.SignalR;
using TrackingBusSystem.Application.Abstractions.Common.DTOs;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Infrastructure.Data;
using TrackingBusSystem.Infrastructure.Hubs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        private readonly IHubContext<NotificationHub> _hubContext;
        public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        public async Task<Result> SendNotificationToUsersAsync(List<string> toUserIds, NotificationDto notification, string fromUserId)
        {
            if (toUserIds == null || !toUserIds.Any())
            {
                return Result.Failure(new Error("Notification.EmptyToUserIds", "The list  userIds is empty"));
            }
            if (toUserIds.Contains(fromUserId))
            {
                return Result.Failure(new Error("Notification.InvalidUserIds", "The sender cannot be a recipient"));
            }
            _context.Announcements.Add(new Announcement
            {
                SendAt = DateTime.UtcNow,
                Title = notification.Title,
                AnnouncementType = (int)notification.NotificationType,
                Message = notification.Message,
                SenderUserId = fromUserId,
                UserAnnouncements = toUserIds.Select(userId => new UserAnnouncement
                {
                    RecipientUserId = userId,
                    IsRead = false,
                }).ToList()


            });
            _context.SaveChanges();
            await _hubContext.Clients.Users(toUserIds).SendAsync("ReceiveNotification", notification);
            return Result.Success();
        }
    }
}
