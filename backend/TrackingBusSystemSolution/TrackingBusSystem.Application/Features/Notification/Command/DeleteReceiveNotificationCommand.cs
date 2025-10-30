using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Command
{
    public record DeleteReceiveNotificationCommand(int Id) : ICommand
    {
    }

    public class DeleteReceiveNotificationCommandHandler : ICommandHandler<DeleteReceiveNotificationCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        public DeleteReceiveNotificationCommandHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(DeleteReceiveNotificationCommand request, CancellationToken cancellationToken)
        {
            var receiveNotification = await _context.UserAnnouncements.Where(un => un.Id == request.Id).FirstOrDefaultAsync();
            if (receiveNotification == null)
            {
                return Result.Failure(AnnouncementErrors.AnnouncementNotFound(request.Id));
            }
            _context.UserAnnouncements.Remove(receiveNotification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
