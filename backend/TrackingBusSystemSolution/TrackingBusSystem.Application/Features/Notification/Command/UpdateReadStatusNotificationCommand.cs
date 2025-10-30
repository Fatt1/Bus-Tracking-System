using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Command
{
    public record UpdateReadStatusNotificationCommand(int Id, string UserId) : ICommand<bool>;

    public class UpdateReadStatusNotificationCommandHandler : ICommandHandler<UpdateReadStatusNotificationCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateReadStatusNotificationCommandHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateReadStatusNotificationCommand request, CancellationToken cancellationToken)
        {
            var receiveNotification = await _context.UserAnnouncements
                .Where(un => un.Id == request.Id && un.RecipientUserId == request.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (receiveNotification == null)
            {
                return Result<bool>.Failure(
                    new Error("Notification.NotFound", "Không tìm thấy thông báo"));
            }

            // Kiểm tra nếu đã đọc rồi thì không cần update
            if (receiveNotification.IsRead)
            {
                return Result<bool>.Success(false); // false = không có update
            }

            // Chưa đọc thì mới update
            receiveNotification.IsRead = true;
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true); // true = đã update
        }
    }
}
