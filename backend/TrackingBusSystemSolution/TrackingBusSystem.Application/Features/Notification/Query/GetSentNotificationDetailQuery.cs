using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Query;
using TrackingBusSystem.Application.Features.Notification.DTOs;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Query
{
    public record GetSentNotificationDetailQuery(int Id, string UserId) : IQuery<GetSentNotificationDetailDTO>
    {
    }

    public class GetSentNotificationDetailQueryHandler : IQueryHandler<GetSentNotificationDetailQuery, GetSentNotificationDetailDTO>
    {
        private readonly IApplicationDbContext _dbContext;
        public GetSentNotificationDetailQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<GetSentNotificationDetailDTO>> Handle(GetSentNotificationDetailQuery request, CancellationToken cancellationToken)
        {
            var notification = await _dbContext.Announcements
                .Where(a => a.Id == request.Id && a.SenderUserId == request.UserId)
                .Select(a => new GetSentNotificationDetailDTO
                {
                    Id = a.Id,
                    Title = a.Title,
                    Message = a.Message,
                    SendAt = a.SendAt,
                    RecipientUsers = a.UserAnnouncements.Select(ua => new RecipientUserDTO
                    {
                        RecipientUserId = ua.RecipientUserId,
                        RecipientUserName = ua.RecipientUser.LastName + " " + ua.RecipientUser.FirstName
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (notification == null)
            {
                return Result<GetSentNotificationDetailDTO>.Failure(
                    new Error("Notification.NotFound", "Không tìm thấy thông báo"));
            }
            else
            {
                return Result<GetSentNotificationDetailDTO>.Success(notification);
            }
        }
    }
}
