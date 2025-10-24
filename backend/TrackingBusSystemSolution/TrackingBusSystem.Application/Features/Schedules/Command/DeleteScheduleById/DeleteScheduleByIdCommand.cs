
using TrackingBusSystem.Application.Abstractions.CQRS.Command;
using TrackingBusSystem.Domain.Entities;
using TrackingBusSystem.Domain.Interfaces;
using TrackingBusSystem.Shared;
using TrackingBusSystem.Shared.Constants;

namespace TrackingBusSystem.Application.Features.Schedules.Command.DeleteScheduleById
{
    public record DeleteScheduleByIdCommand(int Id) : ICommand
    {
    }

    public class DeleteScheduleByIdCommandHandler : ICommandHandler<DeleteScheduleByIdCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IScheduleRepository _scheduleRepository;
        public DeleteScheduleByIdCommandHandler(IUnitOfWork unitOfWork, IScheduleRepository scheduleRepository)
        {
            _unitOfWork = unitOfWork;
            _scheduleRepository = scheduleRepository;
        }

        public async Task<Result> Handle(DeleteScheduleByIdCommand request, CancellationToken cancellationToken)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
            if (schedule == null)
            {
                return Result.Failure(ScheduleErrors.ScheduleNotFound);
            }
            if (schedule.Status != ScheduleStatus.InActive)
            {
                return Result.Failure(ScheduleErrors.ScheduleCannotBeDeleted);
            }
            _scheduleRepository.DeleteSchedule(schedule);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
