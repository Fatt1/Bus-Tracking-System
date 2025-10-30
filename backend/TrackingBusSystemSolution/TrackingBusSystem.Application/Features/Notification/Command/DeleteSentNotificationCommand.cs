using Microsoft.EntityFrameworkCore;
using TrackingBusSystem.Application.Abstractions.Common.Interfaces;
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;

namespace TrackingBusSystem.Application.Features.Notification.Command
{
    public record DeleteSentNotificationCommand(int Id) : ICommand
    {
    }

    public class DeleteSentNotificationCommandHandler : ICommandHandler<DeleteSentNotificationCommand>
    {
        private readonly IApplicationDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        public DeleteSentNotificationCommandHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }
        public async Task<Result> Handle(DeleteSentNotificationCommand request, CancellationToken cancellationToken)
        {
            var sentNotification = await _context.Announcements.Where(a => a.Id == request.Id).FirstOrDefaultAsync();
            if (sentNotification == null)
            {
                return Result.Failure(AnnouncementErrors.AnnouncementNotFound(request.Id));
            }

            sentNotification.IsDeleted = true;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();

        }
    }
}
