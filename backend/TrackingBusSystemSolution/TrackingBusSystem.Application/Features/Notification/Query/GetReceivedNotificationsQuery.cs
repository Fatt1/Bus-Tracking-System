using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Notification.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Query
{
    public record GetReceivedNotificationsQuery(string UserId) : IQuery<List<GetReceivedNotificationsDTO>>
    {
    }
    public class GetAllNotificationByUserIdQueryHandler : IQueryHandler<GetReceivedNotificationsQuery, List<GetReceivedNotificationsDTO>>
    {
        private IApplicationDbContext _dbContext;
        public GetAllNotificationByUserIdQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetReceivedNotificationsDTO>>> Handle(GetReceivedNotificationsQuery request, CancellationToken cancellationToken)
        {
            var receivedNotification = await _dbContext.UserAnnouncements.Where(ua => ua.RecipientUserId == request.UserId).Select(ua => new GetReceivedNotificationsDTO
            {
                IsRead = ua.IsRead,
                Message = ua.Announcement.Message,
                ReceivedNotifcationId = ua.Id,
                SendAt = ua.Announcement.SendAt,
                SenderUserId = ua.Announcement.SenderUserId,
                Title = ua.Announcement.Title,
                SenderUserName = ua.Announcement.SenderUser.LastName + " " + ua.Announcement.SenderUser.FirstName,


            }).ToListAsync();

            return Result<List<GetReceivedNotificationsDTO>>.Success(receivedNotification);
        }
    }
}
