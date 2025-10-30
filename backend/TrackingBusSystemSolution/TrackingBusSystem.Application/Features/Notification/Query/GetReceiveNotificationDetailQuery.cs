using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Notification.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Query
{
    public record GetReceiveNotificationDetailQuery(int Id, string UserId) : IQuery<GetReciveNotificationDetailDTO>
    {
    }

    public class GetReceiveNotificationDetailQueryHandler : IQueryHandler<GetReceiveNotificationDetailQuery, GetReciveNotificationDetailDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetReceiveNotificationDetailQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Result<GetReciveNotificationDetailDTO>> Handle(GetReceiveNotificationDetailQuery request, CancellationToken cancellationToken)
        {
            var notification = await _dbContext.UserAnnouncements
                .Where(ua => ua.Id == request.Id && ua.RecipientUserId == request.UserId)
                .Select(ua => new GetReciveNotificationDetailDTO
                {
                    Id = ua.Id,
                    Title = ua.Announcement.Title,
                    Message = ua.Announcement.Message,
                    SendAt = ua.Announcement.SendAt,
                    SenderUserId = ua.Announcement.SenderUserId,
                    SenderUserName = ua.Announcement.SenderUser.LastName + " " + ua.Announcement.SenderUser.FirstName,
                    IsRead = ua.IsRead
                })
                .FirstOrDefaultAsync();
            if (notification == null)
            {
                return Result<GetReciveNotificationDetailDTO>.Failure(
                    new Error("Notification.NotFound", "Không tìm thấy thông báo"));
            }
            return Result<GetReciveNotificationDetailDTO>.Success(notification);

        }
    }
}
