using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Notification.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Query
{
    public record GetSentNotificationQuery(string UserId) : IQuery<List<GetSentNotificationsDTO>>
    {
    }

    public class GetSentNotificationQueryHandler : IQueryHandler<GetSentNotificationQuery, List<GetSentNotificationsDTO>>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetSentNotificationQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<List<GetSentNotificationsDTO>>> Handle(GetSentNotificationQuery request, CancellationToken cancellationToken)
        {
            var sentNotifications = await _dbContext.Announcements.Where(a => a.SenderUserId == request.UserId).Select(a => new GetSentNotificationsDTO
            {
                Message = a.Message,
                SendAt = a.SendAt,
                SentNotificationId = a.Id,
                Title = a.Title,
                RecipientUsers = a.UserAnnouncements.Select(ua => new RecipientUserDTO
                {
                    RecipientUserId = ua.RecipientUserId,
                    RecipientUserName = ua.RecipientUser.LastName + " " + ua.RecipientUser.FirstName
                }).ToList()
            }).ToListAsync();
            return Result<List<GetSentNotificationsDTO>>.Success(sentNotifications);
        }
    }
}
